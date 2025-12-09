import { prisma } from '@/lib/db/prisma'
import { stripe } from '@/lib/stripe/config'
import type { Subscription, SubscriptionStatus, Plan } from '@prisma/client'

export interface CreateSubscriptionInput {
  workspaceId: string
  planId: string
  paymentMethodId?: string
  email: string
}

export interface SubscriptionWithPlan extends Subscription {
  plan: Plan
}

/**
 * Create a new subscription
 */
export async function createSubscription(input: CreateSubscriptionInput): Promise<Subscription> {
  const { workspaceId, planId, paymentMethodId, email } = input

  // Get plan
  const plan = await prisma.plan.findUnique({
    where: { id: planId },
  })

  if (!plan) {
    throw new Error('Plan not found')
  }

  // Check for existing subscription
  const existingSubscription = await prisma.subscription.findFirst({
    where: {
      workspaceId,
      status: { in: ['ACTIVE', 'TRIALING', 'PAST_DUE'] },
    },
  })

  if (existingSubscription) {
    throw new Error('Workspace already has an active subscription')
  }

  // Create or get Stripe customer
  let stripeCustomerId: string

  const existingCustomer = await prisma.subscription.findFirst({
    where: { workspaceId },
    select: { stripeCustomerId: true },
  })

  if (existingCustomer?.stripeCustomerId) {
    stripeCustomerId = existingCustomer.stripeCustomerId
  } else {
    const customer = await stripe.customers.create({
      email,
      metadata: { workspaceId },
    })
    stripeCustomerId = customer.id
  }

  // Attach payment method
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

  // Create Stripe product and price
  const stripeProduct = await stripe.products.create({
    name: plan.name,
    metadata: { planId: plan.id },
  })

  const stripePrice = await stripe.prices.create({
    product: stripeProduct.id,
    currency: 'usd',
    recurring: { interval: 'month' },
    unit_amount: plan.priceMonthly,
  })

  // Create Stripe subscription
  const stripeSubscription = await stripe.subscriptions.create({
    customer: stripeCustomerId,
    items: [{ price: stripePrice.id }],
    payment_behavior: 'default_incomplete',
    payment_settings: {
      save_default_payment_method: 'on_subscription',
    },
    expand: ['latest_invoice.payment_intent'],
    metadata: {
      workspaceId,
      planId,
    },
  })

  // Create subscription in database
  const subscriptionData = stripeSubscription as unknown as {
    id: string
    current_period_start: number
    current_period_end: number
  }

  const subscription = await prisma.subscription.create({
    data: {
      workspaceId,
      planId,
      status: 'ACTIVE',
      stripeSubscriptionId: subscriptionData.id,
      stripeCustomerId,
      currentPeriodStart: new Date(subscriptionData.current_period_start * 1000),
      currentPeriodEnd: new Date(subscriptionData.current_period_end * 1000),
    },
  })

  return subscription
}

/**
 * Get subscription by workspace ID
 */
export async function getSubscriptionByWorkspaceId(workspaceId: string): Promise<SubscriptionWithPlan | null> {
  return prisma.subscription.findFirst({
    where: {
      workspaceId,
      status: { in: ['ACTIVE', 'TRIALING', 'PAST_DUE'] },
    },
    include: { plan: true },
  })
}

/**
 * Get subscription by Stripe subscription ID
 */
export async function getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | null> {
  return prisma.subscription.findUnique({
    where: { stripeSubscriptionId },
  })
}

/**
 * Update subscription status
 */
export async function updateSubscriptionStatus(
  subscriptionId: string,
  status: SubscriptionStatus
): Promise<Subscription> {
  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: { status },
  })
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  reason?: string,
  cancelImmediately = false
): Promise<Subscription> {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  })

  if (!subscription) {
    throw new Error('Subscription not found')
  }

  if (!subscription.stripeSubscriptionId) {
    throw new Error('No Stripe subscription ID')
  }

  // Cancel in Stripe
  if (cancelImmediately) {
    await stripe.subscriptions.cancel(subscription.stripeSubscriptionId)
  } else {
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    })
  }

  // Update in database
  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: cancelImmediately ? 'CANCELED' : subscription.status,
      canceledAt: new Date(),
      cancelReason: reason,
    },
  })
}

/**
 * Resume canceled subscription
 */
export async function resumeSubscription(subscriptionId: string): Promise<Subscription> {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  })

  if (!subscription) {
    throw new Error('Subscription not found')
  }

  if (!subscription.stripeSubscriptionId) {
    throw new Error('No Stripe subscription ID')
  }

  // Resume in Stripe
  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: false,
  })

  // Update in database
  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      canceledAt: null,
      cancelReason: null,
    },
  })
}

/**
 * Change subscription plan
 */
export async function changeSubscriptionPlan(
  subscriptionId: string,
  newPlanId: string
): Promise<Subscription> {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { plan: true },
  })

  if (!subscription) {
    throw new Error('Subscription not found')
  }

  if (!subscription.stripeSubscriptionId) {
    throw new Error('No Stripe subscription ID')
  }

  const newPlan = await prisma.plan.findUnique({
    where: { id: newPlanId },
  })

  if (!newPlan) {
    throw new Error('New plan not found')
  }

  // Get Stripe subscription items
  const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId)

  // Create new price for the plan
  const stripeProduct = await stripe.products.create({
    name: newPlan.name,
    metadata: { planId: newPlan.id },
  })

  const stripePrice = await stripe.prices.create({
    product: stripeProduct.id,
    currency: 'usd',
    recurring: { interval: 'month' },
    unit_amount: newPlan.priceMonthly,
  })

  // Update Stripe subscription
  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    items: [
      {
        id: stripeSubscription.items.data[0].id,
        price: stripePrice.id,
      },
    ],
    proration_behavior: 'create_prorations',
  })

  // Update in database
  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: { planId: newPlanId },
  })
}

/**
 * Process Stripe webhook for subscription events
 */
export async function processSubscriptionWebhook(
  event: string,
  stripeSubscriptionId: string,
  data: Record<string, unknown>
): Promise<void> {
  const subscription = await getSubscriptionByStripeId(stripeSubscriptionId)

  if (!subscription) {
    console.warn(`Subscription not found for Stripe ID: ${stripeSubscriptionId}`)
    return
  }

  switch (event) {
    case 'customer.subscription.updated':
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          currentPeriodStart: data.current_period_start
            ? new Date((data.current_period_start as number) * 1000)
            : undefined,
          currentPeriodEnd: data.current_period_end
            ? new Date((data.current_period_end as number) * 1000)
            : undefined,
        },
      })
      break

    case 'customer.subscription.deleted':
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'CANCELED',
          canceledAt: new Date(),
        },
      })
      break

    case 'invoice.payment_failed':
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'PAST_DUE' },
      })
      break

    case 'invoice.paid':
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'ACTIVE' },
      })
      break
  }
}

/**
 * Get all plans
 */
export async function getPlans(): Promise<Plan[]> {
  return prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })
}

/**
 * Get plan by ID
 */
export async function getPlanById(planId: string): Promise<Plan | null> {
  return prisma.plan.findUnique({
    where: { id: planId },
  })
}

/**
 * Get plan by slug
 */
export async function getPlanBySlug(slug: string): Promise<Plan | null> {
  return prisma.plan.findUnique({
    where: { slug },
  })
}

/**
 * Create a new plan
 */
export async function createPlan(input: {
  name: string
  slug: string
  description?: string
  priceMonthly: number
  priceYearly: number
  features: Record<string, unknown>
  limits: Record<string, unknown>
}): Promise<Plan> {
  return prisma.plan.create({
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description,
      priceMonthly: input.priceMonthly,
      priceYearly: input.priceYearly,
      features: input.features as object,
      limits: input.limits as object,
    },
  })
}

/**
 * Get subscription usage/metrics
 */
export async function getSubscriptionUsage(workspaceId: string) {
  const [funnelCount, contactCount, orderCount] = await Promise.all([
    prisma.funnel.count({ where: { workspaceId } }),
    prisma.contact.count({ where: { workspaceId } }),
    prisma.order.count({ where: { workspaceId } }),
  ])

  return {
    funnels: funnelCount,
    contacts: contactCount,
    orders: orderCount,
  }
}
