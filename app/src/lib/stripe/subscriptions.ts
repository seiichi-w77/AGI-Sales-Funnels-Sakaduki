import { stripe, STRIPE_CONFIG } from './config'
import type Stripe from 'stripe'

export interface CreateCheckoutSessionParams {
  priceId: string
  customerId?: string
  customerEmail?: string
  workspaceId: string
  successUrl?: string
  cancelUrl?: string
  trialDays?: number
  metadata?: Record<string, string>
}

export interface CreatePortalSessionParams {
  customerId: string
  returnUrl?: string
}

/**
 * Create a Stripe Checkout Session for subscription
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<Stripe.Checkout.Session> {
  const {
    priceId,
    customerId,
    customerEmail,
    workspaceId,
    successUrl = STRIPE_CONFIG.successUrl,
    cancelUrl = STRIPE_CONFIG.cancelUrl,
    trialDays,
    metadata = {},
  } = params

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      workspaceId,
      ...metadata,
    },
    subscription_data: {
      metadata: {
        workspaceId,
      },
    },
  }

  if (customerId) {
    sessionParams.customer = customerId
  } else if (customerEmail) {
    sessionParams.customer_email = customerEmail
  }

  if (trialDays && trialDays > 0) {
    sessionParams.subscription_data = {
      ...sessionParams.subscription_data,
      trial_period_days: trialDays,
    }
  }

  return stripe.checkout.sessions.create(sessionParams)
}

/**
 * Create a Stripe Customer Portal session
 */
export async function createPortalSession(
  params: CreatePortalSessionParams
): Promise<Stripe.BillingPortal.Session> {
  const { customerId, returnUrl = STRIPE_CONFIG.billingPortalReturnUrl } = params

  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

/**
 * Create or retrieve a Stripe Customer
 */
export async function createOrRetrieveCustomer(params: {
  email: string
  name?: string
  workspaceId: string
  userId: string
}): Promise<Stripe.Customer> {
  const { email, name, workspaceId, userId } = params

  // Search for existing customer
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  })

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0]
  }

  // Create new customer
  return stripe.customers.create({
    email,
    name,
    metadata: {
      workspaceId,
      userId,
    },
  })
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['default_payment_method', 'items.data.price.product'],
  })
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd = true
): Promise<Stripe.Subscription> {
  if (cancelAtPeriodEnd) {
    return stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })
  }

  return stripe.subscriptions.cancel(subscriptionId)
}

/**
 * Resume a canceled subscription
 */
export async function resumeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  })
}

/**
 * Update subscription to a new price/plan
 */
export async function updateSubscription(
  subscriptionId: string,
  newPriceId: string
): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const itemId = subscription.items.data[0]?.id

  if (!itemId) {
    throw new Error('No subscription item found')
  }

  return stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: itemId,
        price: newPriceId,
      },
    ],
    proration_behavior: 'create_prorations',
  })
}

/**
 * List all invoices for a customer
 */
export async function listInvoices(
  customerId: string,
  limit = 10
): Promise<Stripe.ApiList<Stripe.Invoice>> {
  return stripe.invoices.list({
    customer: customerId,
    limit,
  })
}

/**
 * Get invoice PDF URL
 */
export async function getInvoicePdfUrl(invoiceId: string): Promise<string | null> {
  const invoice = await stripe.invoices.retrieve(invoiceId)
  return invoice.invoice_pdf
}

/**
 * Create a product in Stripe
 */
export async function createProduct(params: {
  name: string
  description?: string
  metadata?: Record<string, string>
}): Promise<Stripe.Product> {
  return stripe.products.create({
    name: params.name,
    description: params.description,
    metadata: params.metadata,
  })
}

/**
 * Create a price for a product
 */
export async function createPrice(params: {
  productId: string
  unitAmount: number
  currency?: string
  recurring?: {
    interval: 'day' | 'week' | 'month' | 'year'
    intervalCount?: number
  }
  metadata?: Record<string, string>
}): Promise<Stripe.Price> {
  const { productId, unitAmount, currency = 'usd', recurring, metadata } = params

  const priceParams: Stripe.PriceCreateParams = {
    product: productId,
    unit_amount: unitAmount,
    currency,
    metadata,
  }

  if (recurring) {
    priceParams.recurring = {
      interval: recurring.interval,
      interval_count: recurring.intervalCount || 1,
    }
  }

  return stripe.prices.create(priceParams)
}

/**
 * List all prices for a product
 */
export async function listPrices(productId: string): Promise<Stripe.ApiList<Stripe.Price>> {
  return stripe.prices.list({
    product: productId,
    active: true,
  })
}

/**
 * Get upcoming invoice preview
 */
export async function getUpcomingInvoice(customerId: string): Promise<Stripe.Invoice | null> {
  try {
    return await stripe.invoices.retrieveUpcoming({
      customer: customerId,
    })
  } catch {
    return null
  }
}
