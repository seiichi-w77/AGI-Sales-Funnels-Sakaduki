import { stripe, STRIPE_CONFIG } from './config'
import type Stripe from 'stripe'

export type StripeWebhookEvent =
  | 'checkout.session.completed'
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'invoice.payment_succeeded'
  | 'invoice.payment_failed'
  | 'customer.created'
  | 'customer.updated'
  | 'customer.deleted'

export interface WebhookHandlerResult {
  success: boolean
  message: string
  data?: Record<string, unknown>
}

/**
 * Verify and construct Stripe webhook event
 */
export async function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Promise<Stripe.Event> {
  return stripe.webhooks.constructEvent(payload, signature, STRIPE_CONFIG.webhookSecret)
}

/**
 * Handle checkout.session.completed event
 */
export async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
): Promise<WebhookHandlerResult> {
  const { customer, subscription, metadata } = session

  if (!customer || !subscription) {
    return {
      success: false,
      message: 'Missing customer or subscription in session',
    }
  }

  const workspaceId = metadata?.workspaceId

  if (!workspaceId) {
    return {
      success: false,
      message: 'Missing workspaceId in metadata',
    }
  }

  // TODO: Update database with subscription details
  // This would typically:
  // 1. Create/update subscription record in database
  // 2. Update workspace subscription status
  // 3. Send confirmation email

  return {
    success: true,
    message: 'Checkout completed successfully',
    data: {
      customerId: customer,
      subscriptionId: subscription,
      workspaceId,
    },
  }
}

/**
 * Handle customer.subscription.created event
 */
export async function handleSubscriptionCreated(
  subscription: Stripe.Subscription
): Promise<WebhookHandlerResult> {
  const { id, customer, status, current_period_start, current_period_end, metadata } = subscription

  const workspaceId = metadata?.workspaceId

  // TODO: Create subscription record in database

  return {
    success: true,
    message: 'Subscription created',
    data: {
      subscriptionId: id,
      customerId: customer,
      status,
      currentPeriodStart: new Date(current_period_start * 1000),
      currentPeriodEnd: new Date(current_period_end * 1000),
      workspaceId,
    },
  }
}

/**
 * Handle customer.subscription.updated event
 */
export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
): Promise<WebhookHandlerResult> {
  const {
    id,
    status,
    cancel_at_period_end,
    canceled_at,
    current_period_start,
    current_period_end,
    metadata,
  } = subscription

  const workspaceId = metadata?.workspaceId

  // TODO: Update subscription record in database

  return {
    success: true,
    message: 'Subscription updated',
    data: {
      subscriptionId: id,
      status,
      cancelAtPeriodEnd: cancel_at_period_end,
      canceledAt: canceled_at ? new Date(canceled_at * 1000) : null,
      currentPeriodStart: new Date(current_period_start * 1000),
      currentPeriodEnd: new Date(current_period_end * 1000),
      workspaceId,
    },
  }
}

/**
 * Handle customer.subscription.deleted event
 */
export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<WebhookHandlerResult> {
  const { id, metadata } = subscription
  const workspaceId = metadata?.workspaceId

  // TODO: Update subscription record in database to mark as canceled

  return {
    success: true,
    message: 'Subscription deleted',
    data: {
      subscriptionId: id,
      workspaceId,
    },
  }
}

/**
 * Handle invoice.payment_succeeded event
 */
export async function handleInvoicePaymentSucceeded(
  invoice: Stripe.Invoice
): Promise<WebhookHandlerResult> {
  const { id, customer, subscription, amount_paid, currency, status, hosted_invoice_url, invoice_pdf } = invoice

  // TODO: Create invoice record in database
  // TODO: Send receipt email

  return {
    success: true,
    message: 'Invoice payment succeeded',
    data: {
      invoiceId: id,
      customerId: customer,
      subscriptionId: subscription,
      amountPaid: amount_paid,
      currency,
      status,
      hostedInvoiceUrl: hosted_invoice_url,
      invoicePdf: invoice_pdf,
    },
  }
}

/**
 * Handle invoice.payment_failed event
 */
export async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice
): Promise<WebhookHandlerResult> {
  const { id, customer, subscription, amount_due, currency, next_payment_attempt } = invoice

  // TODO: Update subscription status in database
  // TODO: Send payment failed notification email

  return {
    success: true,
    message: 'Invoice payment failed',
    data: {
      invoiceId: id,
      customerId: customer,
      subscriptionId: subscription,
      amountDue: amount_due,
      currency,
      nextPaymentAttempt: next_payment_attempt
        ? new Date(next_payment_attempt * 1000)
        : null,
    },
  }
}

/**
 * Main webhook handler dispatcher
 */
export async function handleWebhookEvent(event: Stripe.Event): Promise<WebhookHandlerResult> {
  switch (event.type) {
    case 'checkout.session.completed':
      return handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)

    case 'customer.subscription.created':
      return handleSubscriptionCreated(event.data.object as Stripe.Subscription)

    case 'customer.subscription.updated':
      return handleSubscriptionUpdated(event.data.object as Stripe.Subscription)

    case 'customer.subscription.deleted':
      return handleSubscriptionDeleted(event.data.object as Stripe.Subscription)

    case 'invoice.payment_succeeded':
      return handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)

    case 'invoice.payment_failed':
      return handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)

    default:
      return {
        success: true,
        message: `Unhandled event type: ${event.type}`,
      }
  }
}
