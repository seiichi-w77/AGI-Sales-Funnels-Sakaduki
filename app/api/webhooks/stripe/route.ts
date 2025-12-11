import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/db/prisma';

function getStripe() {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(apiKey, {
    apiVersion: '2025-02-24.acacia',
  });
}

function getWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set');
  }
  return secret;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    const webhookSecret = getWebhookSecret();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const workspaceId = session.metadata?.workspaceId;
  const planId = session.metadata?.planId;
  const orderItemsJson = session.metadata?.orderItems;
  const cartId = session.metadata?.cartId;

  // Handle subscription plan checkout
  if (workspaceId && planId) {
    await prisma.subscription.create({
      data: {
        workspaceId,
        planId,
        stripeSubscriptionId: session.subscription as string,
        stripeCustomerId: session.customer as string,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    return;
  }

  // Handle product order checkout
  if (workspaceId && orderItemsJson) {
    try {
      const orderItems = JSON.parse(orderItemsJson) as {
        productId: string;
        priceId: string;
        variantId?: string;
        quantity: number;
      }[];

      // Get product and price details for order items
      const itemDetails = await Promise.all(
        orderItems.map(async (item) => {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
            include: { prices: true },
          });

          if (!product) {
            throw new Error(`Product not found: ${item.productId}`);
          }

          const price = product.prices.find((p) => p.id === item.priceId);
          if (!price) {
            throw new Error(`Price not found: ${item.priceId}`);
          }

          return {
            productId: product.id,
            priceId: price.id,
            variantId: item.variantId,
            name: product.name,
            description: product.shortDescription,
            quantity: item.quantity,
            unitPrice: price.amount,
            totalPrice: price.amount * item.quantity,
          };
        })
      );

      // Calculate totals
      const subtotal = itemDetails.reduce((sum, item) => sum + item.totalPrice, 0);
      const total = session.amount_total || subtotal;

      // Generate order number
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      const orderNumber = `ORD-${timestamp}-${random}`;

      // Create order
      const order = await prisma.order.create({
        data: {
          workspaceId,
          orderNumber,
          status: 'PROCESSING',
          email: session.customer_details?.email || '',
          phone: session.customer_details?.phone || undefined,
          billingAddress: session.customer_details?.address as object || undefined,
          shippingAddress: session.shipping_details?.address as object || undefined,
          subtotal,
          discountTotal: 0,
          taxTotal: session.total_details?.amount_tax || 0,
          shippingTotal: session.total_details?.amount_shipping || 0,
          total,
          currency: session.currency?.toUpperCase() || 'JPY',
          paidAt: new Date(),
          stripePaymentIntentId: session.payment_intent as string | undefined,
          items: {
            create: itemDetails,
          },
        },
      });

      // Create transaction record
      await prisma.transaction.create({
        data: {
          orderId: order.id,
          type: 'CHARGE',
          status: 'SUCCEEDED',
          amount: total,
          currency: session.currency?.toUpperCase() || 'JPY',
          gateway: 'stripe',
          gatewayTransactionId: session.payment_intent as string | undefined,
        },
      });

      // Update inventory for products that track it
      for (const item of itemDetails) {
        await prisma.product.updateMany({
          where: {
            id: item.productId,
            trackInventory: true,
          },
          data: {
            inventoryCount: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Mark cart as converted if applicable
      if (cartId) {
        await prisma.cart.update({
          where: { id: cartId },
          data: { status: 'CONVERTED' },
        });
      }

      // Create contact if doesn't exist
      if (session.customer_details?.email) {
        await prisma.contact.upsert({
          where: {
            workspaceId_email: {
              workspaceId,
              email: session.customer_details.email,
            },
          },
          update: {
            lastActivityAt: new Date(),
          },
          create: {
            workspaceId,
            email: session.customer_details.email,
            firstName: session.customer_details.name?.split(' ')[0] || undefined,
            lastName: session.customer_details.name?.split(' ').slice(1).join(' ') || undefined,
            phone: session.customer_details.phone || undefined,
            status: 'ACTIVE',
            source: 'CHECKOUT',
          },
        });
      }

      console.log(`Order created: ${order.orderNumber}`);
    } catch (error) {
      console.error('Error creating order from checkout:', error);
      throw error;
    }
    return;
  }

  console.error('Missing metadata in checkout session');
}

type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'UNPAID' | 'TRIALING' | 'PAUSED';

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const existing = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!existing) return;

  const statusMap: Record<string, SubscriptionStatus> = {
    active: 'ACTIVE',
    past_due: 'PAST_DUE',
    canceled: 'CANCELED',
    unpaid: 'UNPAID',
    trialing: 'TRIALING',
    paused: 'PAUSED',
  };

  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: statusMap[subscription.status] ?? 'ACTIVE',
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: 'CANCELED',
      canceledAt: new Date(),
    },
  });
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // Create invoice record
  const subscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: invoice.subscription as string },
  });

  if (!subscription) return;

  await prisma.invoice.create({
    data: {
      workspaceId: subscription.workspaceId,
      subscriptionId: subscription.id,
      stripeInvoiceId: invoice.id,
      number: invoice.number || `INV-${Date.now()}`,
      status: 'PAID',
      subtotal: invoice.subtotal,
      tax: invoice.tax || 0,
      total: invoice.total,
      currency: invoice.currency.toUpperCase(),
      paidAt: new Date(),
    },
  });
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: invoice.subscription as string },
  });

  if (!subscription) return;

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: 'PAST_DUE' },
  });
}
