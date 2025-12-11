import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import Stripe from 'stripe';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

function getStripe() {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(apiKey, {
    apiVersion: '2025-02-24.acacia',
  });
}

const checkoutSchema = z.object({
  cartId: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    priceId: z.string(),
    variantId: z.string().optional(),
    quantity: z.number().int().min(1).default(1),
  })).optional(),
  workspaceId: z.string(),
  email: z.string().email().optional(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
  metadata: z.record(z.string()).optional(),
});

// POST /api/checkout - Create Stripe checkout session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { cartId, items: directItems, workspaceId, email, successUrl, cancelUrl, metadata } = parsed.data;

    // Get items from cart or direct items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    const orderItems: {
      productId: string;
      priceId: string;
      variantId?: string;
      name: string;
      description?: string | null;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }[] = [];

    if (cartId) {
      // Get items from cart
      const cart = await prisma.cart.findUnique({
        where: { id: cartId },
        include: {
          items: {
            include: {
              product: true,
              price: true,
              variant: true,
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        return NextResponse.json({ error: 'Cart is empty or not found' }, { status: 400 });
      }

      for (const item of cart.items) {
        // Check product is still available
        if (item.product.status !== 'ACTIVE') {
          return NextResponse.json(
            { error: `Product "${item.product.name}" is no longer available` },
            { status: 400 }
          );
        }

        // Check inventory
        if (item.product.trackInventory && item.product.inventoryCount < item.quantity) {
          return NextResponse.json(
            { error: `Insufficient inventory for "${item.product.name}"` },
            { status: 400 }
          );
        }

        const productName = item.variant
          ? `${item.product.name} - ${item.variant.name}`
          : item.product.name;

        lineItems.push({
          price_data: {
            currency: item.currency.toLowerCase(),
            product_data: {
              name: productName,
              description: item.product.shortDescription || undefined,
              images: item.product.imageUrl ? [item.product.imageUrl] : undefined,
            },
            unit_amount: item.unitPrice,
            recurring: item.price.type === 'RECURRING' && item.price.interval ? {
              interval: item.price.interval as 'day' | 'week' | 'month' | 'year',
              interval_count: item.price.intervalCount || 1,
            } : undefined,
          },
          quantity: item.quantity,
        });

        orderItems.push({
          productId: item.productId,
          priceId: item.priceId,
          variantId: item.variantId || undefined,
          name: productName,
          description: item.product.shortDescription,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.unitPrice * item.quantity,
        });
      }
    } else if (directItems && directItems.length > 0) {
      // Process direct items
      for (const item of directItems) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: { prices: true, variants: true },
        });

        if (!product || product.status !== 'ACTIVE') {
          return NextResponse.json(
            { error: `Product not available: ${item.productId}` },
            { status: 400 }
          );
        }

        const price = product.prices.find((p) => p.id === item.priceId);
        if (!price) {
          return NextResponse.json(
            { error: `Price not found: ${item.priceId}` },
            { status: 400 }
          );
        }

        // Check inventory
        if (product.trackInventory && product.inventoryCount < item.quantity) {
          return NextResponse.json(
            { error: `Insufficient inventory for "${product.name}"` },
            { status: 400 }
          );
        }

        const variant = item.variantId
          ? product.variants.find((v) => v.id === item.variantId)
          : undefined;

        const productName = variant
          ? `${product.name} - ${variant.name}`
          : product.name;

        lineItems.push({
          price_data: {
            currency: price.currency.toLowerCase(),
            product_data: {
              name: productName,
              description: product.shortDescription || undefined,
              images: product.imageUrl ? [product.imageUrl] : undefined,
            },
            unit_amount: price.amount,
            recurring: price.type === 'RECURRING' && price.interval ? {
              interval: price.interval as 'day' | 'week' | 'month' | 'year',
              interval_count: price.intervalCount || 1,
            } : undefined,
          },
          quantity: item.quantity,
        });

        orderItems.push({
          productId: product.id,
          priceId: price.id,
          variantId: item.variantId,
          name: productName,
          description: product.shortDescription,
          quantity: item.quantity,
          unitPrice: price.amount,
          totalPrice: price.amount * item.quantity,
        });
      }
    } else {
      return NextResponse.json({ error: 'No items to checkout' }, { status: 400 });
    }

    // Check if any items are subscriptions
    const hasSubscription = lineItems.some((item) => item.price_data?.recurring);

    // Get session for customer email
    const session = await auth();
    const customerEmail = email || session?.user?.email || undefined;

    // Create Stripe checkout session
    const stripe = getStripe();
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: hasSubscription ? 'subscription' : 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      customer_email: customerEmail,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        workspaceId,
        cartId: cartId || '',
        userId: session?.user?.id || '',
        orderItems: JSON.stringify(orderItems.map((item) => ({
          productId: item.productId,
          priceId: item.priceId,
          variantId: item.variantId,
          quantity: item.quantity,
        }))),
        ...metadata,
      },
      billing_address_collection: 'required',
      shipping_address_collection: hasSubscription ? undefined : {
        allowed_countries: ['JP', 'US', 'CA', 'GB', 'AU'],
      },
    });

    // Cart will be marked as CONVERTED by the webhook after successful payment

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    if (error instanceof Error && error.message === 'STRIPE_SECRET_KEY is not set') {
      return NextResponse.json(
        { error: 'Payment system is not configured' },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
