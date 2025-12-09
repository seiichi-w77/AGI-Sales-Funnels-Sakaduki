import { prisma } from '@/lib/db/prisma'
import { stripe } from '@/lib/stripe/config'
import { getCartById, type CartWithItems } from '@/lib/cart/service'
import type { Order, OrderStatus } from '@prisma/client'

export interface CheckoutInput {
  cartId: string
  email: string
  name: string
  billingAddress?: {
    line1: string
    line2?: string
    city: string
    state?: string
    postalCode: string
    country: string
  }
  shippingAddress?: {
    line1: string
    line2?: string
    city: string
    state?: string
    postalCode: string
    country: string
  }
  paymentMethodId?: string
}

export interface CheckoutResult {
  order: Order
  clientSecret?: string
  requiresAction?: boolean
}

/**
 * Create checkout session
 */
export async function createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  const { cartId, email, name, billingAddress, shippingAddress, paymentMethodId } = input

  // Get cart with items
  const cart = await getCartById(cartId)
  if (!cart || cart.items.length === 0) {
    throw new Error('Cart is empty')
  }

  // Validate all products are available
  for (const item of cart.items) {
    if (item.product.status !== 'ACTIVE') {
      throw new Error(`Product "${item.product.name}" is no longer available`)
    }
  }

  // Create or get contact for this workspace
  let contact = await prisma.contact.findFirst({
    where: {
      workspaceId: cart.workspaceId,
      email,
    },
  })

  if (!contact) {
    const [firstName, ...lastNameParts] = name.split(' ')
    contact = await prisma.contact.create({
      data: {
        workspaceId: cart.workspaceId,
        email,
        firstName: firstName || '',
        lastName: lastNameParts.join(' ') || undefined,
        status: 'ACTIVE',
      },
    })
  }

  // Generate order number
  const orderCount = await prisma.order.count({
    where: { workspaceId: cart.workspaceId },
  })
  const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${(orderCount + 1).toString().padStart(4, '0')}`

  // Create order
  const order = await prisma.order.create({
    data: {
      workspaceId: cart.workspaceId,
      contactId: contact.id,
      orderNumber,
      email,
      status: 'PENDING',
      subtotal: cart.subtotal,
      discountTotal: cart.discount,
      taxTotal: cart.tax,
      total: cart.total,
      currency: cart.items[0]?.currency || 'USD',
      billingAddress: billingAddress as object,
      shippingAddress: shippingAddress as object,
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          priceId: item.priceId,
          variantId: item.variantId,
          name: item.product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.unitPrice * item.quantity,
        })),
      },
    },
  })

  // Create Stripe payment intent
  const hasSubscription = cart.items.some((item) => item.price.type === 'RECURRING')

  if (hasSubscription) {
    // Handle subscription checkout
    return createSubscriptionCheckout(order, cart, contact, paymentMethodId)
  }

  // Create one-time payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: cart.total,
    currency: cart.items[0]?.currency.toLowerCase() || 'usd',
    metadata: {
      orderId: order.id,
      workspaceId: cart.workspaceId,
      contactId: contact.id,
    },
    ...(paymentMethodId && {
      payment_method: paymentMethodId,
      confirm: true,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?orderId=${order.id}`,
    }),
  })

  // Update order with payment intent
  await prisma.order.update({
    where: { id: order.id },
    data: {
      stripePaymentIntentId: paymentIntent.id,
    },
  })

  // Mark cart as converted
  await prisma.cart.update({
    where: { id: cartId },
    data: { status: 'CONVERTED' },
  })

  return {
    order,
    clientSecret: paymentIntent.client_secret || undefined,
    requiresAction: paymentIntent.status === 'requires_action',
  }
}

/**
 * Create subscription checkout
 */
async function createSubscriptionCheckout(
  order: Order,
  cart: CartWithItems,
  contact: { id: string; email: string },
  paymentMethodId?: string
): Promise<CheckoutResult> {
  // Create Stripe customer
  const stripeCustomer = await stripe.customers.create({
    email: contact.email,
    metadata: {
      contactId: contact.id,
    },
  })
  const stripeCustomerId = stripeCustomer.id

  // Attach payment method if provided
  if (paymentMethodId) {
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomerId,
    })
    await stripe.customers.update(stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    })
  }

  // Create Stripe subscription for recurring items
  const recurringItems = cart.items.filter((item) => item.price.type === 'RECURRING')

  // For simplicity, handle single subscription item
  const firstRecurring = recurringItems[0]

  if (firstRecurring) {
    // Get or create Stripe price
    const price = await prisma.productPrice.findUnique({
      where: { id: firstRecurring.priceId },
    })

    if (!price?.stripePriceId) {
      throw new Error('Stripe price not configured for subscription product')
    }

    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: price.stripePriceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        orderId: order.id,
      },
    })

    // Update order with subscription info in metadata
    await prisma.order.update({
      where: { id: order.id },
      data: {
        metadata: {
          stripeSubscriptionId: subscription.id,
        },
      },
    })

    const invoice = subscription.latest_invoice as { payment_intent?: { client_secret: string } }

    return {
      order,
      clientSecret: invoice?.payment_intent?.client_secret,
      requiresAction: true,
    }
  }

  return { order }
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      contact: true,
    },
  })
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<Order> {
  return prisma.order.update({
    where: { id: orderId },
    data: { status },
  })
}

/**
 * List orders for workspace
 */
export async function listOrders(
  workspaceId: string,
  options?: {
    status?: OrderStatus
    contactId?: string
    limit?: number
    offset?: number
  }
) {
  const { status, contactId, limit = 20, offset = 0 } = options || {}

  const where = {
    workspaceId,
    ...(status && { status }),
    ...(contactId && { contactId }),
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: true,
        contact: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.order.count({ where }),
  ])

  return { orders, total }
}

/**
 * Process successful payment
 */
export async function processSuccessfulPayment(
  paymentIntentId: string
): Promise<Order | null> {
  const order = await prisma.order.findFirst({
    where: { stripePaymentIntentId: paymentIntentId },
  })

  if (!order) {
    return null
  }

  // Update order status
  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: 'COMPLETED',
      paidAt: new Date(),
    },
  })

  // Update coupon usage if applicable
  const cart = await prisma.cart.findFirst({
    where: {
      workspaceId: order.workspaceId,
      status: 'CONVERTED',
    },
    orderBy: { updatedAt: 'desc' },
  })

  if (cart?.couponId) {
    await prisma.coupon.update({
      where: { id: cart.couponId },
      data: { usageCount: { increment: 1 } },
    })
  }

  // Update inventory for physical products
  const orderItems = await prisma.orderItem.findMany({
    where: { orderId: order.id },
    include: { product: true },
  })

  for (const item of orderItems) {
    if (item.product?.trackInventory) {
      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: { inventoryCount: { decrement: item.quantity } },
        })
      } else if (item.productId) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { inventoryCount: { decrement: item.quantity } },
        })
      }
    }
  }

  return prisma.order.findUnique({
    where: { id: order.id },
    include: { items: true, contact: true },
  })
}

/**
 * Process failed payment
 */
export async function processFailedPayment(paymentIntentId: string): Promise<void> {
  await prisma.order.updateMany({
    where: { stripePaymentIntentId: paymentIntentId },
    data: { status: 'FAILED' },
  })
}

/**
 * Get order analytics
 */
export async function getOrderAnalytics(workspaceId: string) {
  const [totalOrders, completedOrders, totalRevenue, recentOrders] = await Promise.all([
    prisma.order.count({ where: { workspaceId } }),
    prisma.order.count({ where: { workspaceId, status: 'COMPLETED' } }),
    prisma.order.aggregate({
      where: { workspaceId, status: 'COMPLETED' },
      _sum: { total: true },
    }),
    prisma.order.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { contact: true },
    }),
  ])

  return {
    totalOrders,
    completedOrders,
    conversionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
    totalRevenue: totalRevenue._sum.total || 0,
    recentOrders,
  }
}
