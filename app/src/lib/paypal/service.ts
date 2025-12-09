import { prisma } from '@/lib/db/prisma'

const PAYPAL_API_BASE = process.env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET

export interface PayPalCredentials {
  clientId: string
  clientSecret: string
  mode: 'sandbox' | 'live'
  webhookId?: string
}

export interface PayPalOrder {
  id: string
  status: 'CREATED' | 'SAVED' | 'APPROVED' | 'VOIDED' | 'COMPLETED' | 'PAYER_ACTION_REQUIRED'
  links: {
    href: string
    rel: string
    method: string
  }[]
}

export interface PayPalSubscription {
  id: string
  status: 'APPROVAL_PENDING' | 'APPROVED' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'EXPIRED'
  links: {
    href: string
    rel: string
    method: string
  }[]
}

export interface CreatePayPalOrderInput {
  amount: number
  currency: string
  description?: string
  returnUrl: string
  cancelUrl: string
  orderId?: string
  metadata?: Record<string, string>
}

export interface CreatePayPalSubscriptionInput {
  planId: string
  returnUrl: string
  cancelUrl: string
  customerId?: string
  metadata?: Record<string, string>
}

/**
 * Get PayPal access token
 */
async function getAccessToken(credentials?: PayPalCredentials): Promise<string> {
  const clientId = credentials?.clientId || PAYPAL_CLIENT_ID
  const clientSecret = credentials?.clientSecret || PAYPAL_CLIENT_SECRET
  const apiBase = credentials?.mode === 'live'
    ? 'https://api-m.paypal.com'
    : PAYPAL_API_BASE

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured')
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch(`${apiBase}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${auth}`,
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`PayPal authentication failed: ${error}`)
  }

  const data = await response.json()
  return data.access_token
}

/**
 * Get PayPal credentials for a workspace
 */
export async function getPayPalCredentials(workspaceId: string): Promise<PayPalCredentials | null> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  })

  if (!workspace?.settings) {
    return null
  }

  const settings = workspace.settings as Record<string, unknown>
  return (settings.paypalCredentials as PayPalCredentials) || null
}

/**
 * Save PayPal credentials for a workspace
 */
export async function savePayPalCredentials(
  workspaceId: string,
  credentials: PayPalCredentials
): Promise<void> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  })

  const settings = (workspace?.settings || {}) as Record<string, unknown>

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      settings: {
        ...settings,
        paypalCredentials: credentials,
      } as object,
    },
  })
}

/**
 * Verify PayPal credentials
 */
export async function verifyPayPalCredentials(credentials: PayPalCredentials): Promise<boolean> {
  try {
    await getAccessToken(credentials)
    return true
  } catch {
    return false
  }
}

/**
 * Create PayPal order
 */
export async function createPayPalOrder(
  input: CreatePayPalOrderInput,
  credentials?: PayPalCredentials
): Promise<PayPalOrder> {
  const accessToken = await getAccessToken(credentials)
  const apiBase = credentials?.mode === 'live'
    ? 'https://api-m.paypal.com'
    : PAYPAL_API_BASE

  const response = await fetch(`${apiBase}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: input.currency.toUpperCase(),
            value: (input.amount / 100).toFixed(2), // Convert from cents
          },
          description: input.description,
          custom_id: input.orderId,
        },
      ],
      application_context: {
        return_url: input.returnUrl,
        cancel_url: input.cancelUrl,
        brand_name: 'Sakaduki',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
      },
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`PayPal order creation failed: ${JSON.stringify(error)}`)
  }

  return response.json()
}

/**
 * Capture PayPal order (complete payment)
 */
export async function capturePayPalOrder(
  paypalOrderId: string,
  credentials?: PayPalCredentials
): Promise<PayPalOrder> {
  const accessToken = await getAccessToken(credentials)
  const apiBase = credentials?.mode === 'live'
    ? 'https://api-m.paypal.com'
    : PAYPAL_API_BASE

  const response = await fetch(`${apiBase}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`PayPal capture failed: ${JSON.stringify(error)}`)
  }

  return response.json()
}

/**
 * Get PayPal order details
 */
export async function getPayPalOrder(
  paypalOrderId: string,
  credentials?: PayPalCredentials
): Promise<PayPalOrder> {
  const accessToken = await getAccessToken(credentials)
  const apiBase = credentials?.mode === 'live'
    ? 'https://api-m.paypal.com'
    : PAYPAL_API_BASE

  const response = await fetch(`${apiBase}/v2/checkout/orders/${paypalOrderId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Failed to get PayPal order: ${JSON.stringify(error)}`)
  }

  return response.json()
}

/**
 * Create PayPal subscription plan (for recurring payments)
 */
export async function createPayPalPlan(
  name: string,
  description: string,
  amount: number,
  currency: string,
  interval: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR',
  intervalCount: number = 1,
  credentials?: PayPalCredentials
): Promise<string> {
  const accessToken = await getAccessToken(credentials)
  const apiBase = credentials?.mode === 'live'
    ? 'https://api-m.paypal.com'
    : PAYPAL_API_BASE

  // First create a product
  const productResponse = await fetch(`${apiBase}/v1/catalogs/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      name,
      description,
      type: 'SERVICE',
      category: 'SOFTWARE',
    }),
  })

  if (!productResponse.ok) {
    const error = await productResponse.json()
    throw new Error(`PayPal product creation failed: ${JSON.stringify(error)}`)
  }

  const product = await productResponse.json()

  // Then create a billing plan
  const planResponse = await fetch(`${apiBase}/v1/billing/plans`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      product_id: product.id,
      name,
      description,
      status: 'ACTIVE',
      billing_cycles: [
        {
          frequency: {
            interval_unit: interval,
            interval_count: intervalCount,
          },
          tenure_type: 'REGULAR',
          sequence: 1,
          total_cycles: 0, // Infinite
          pricing_scheme: {
            fixed_price: {
              value: (amount / 100).toFixed(2),
              currency_code: currency.toUpperCase(),
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: 'CONTINUE',
        payment_failure_threshold: 3,
      },
    }),
  })

  if (!planResponse.ok) {
    const error = await planResponse.json()
    throw new Error(`PayPal plan creation failed: ${JSON.stringify(error)}`)
  }

  const plan = await planResponse.json()
  return plan.id
}

/**
 * Create PayPal subscription
 */
export async function createPayPalSubscription(
  input: CreatePayPalSubscriptionInput,
  credentials?: PayPalCredentials
): Promise<PayPalSubscription> {
  const accessToken = await getAccessToken(credentials)
  const apiBase = credentials?.mode === 'live'
    ? 'https://api-m.paypal.com'
    : PAYPAL_API_BASE

  const response = await fetch(`${apiBase}/v1/billing/subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      plan_id: input.planId,
      custom_id: input.customerId,
      application_context: {
        brand_name: 'Sakaduki',
        locale: 'en-US',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        return_url: input.returnUrl,
        cancel_url: input.cancelUrl,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`PayPal subscription creation failed: ${JSON.stringify(error)}`)
  }

  return response.json()
}

/**
 * Cancel PayPal subscription
 */
export async function cancelPayPalSubscription(
  subscriptionId: string,
  reason: string = 'Customer requested cancellation',
  credentials?: PayPalCredentials
): Promise<void> {
  const accessToken = await getAccessToken(credentials)
  const apiBase = credentials?.mode === 'live'
    ? 'https://api-m.paypal.com'
    : PAYPAL_API_BASE

  const response = await fetch(`${apiBase}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ reason }),
  })

  if (!response.ok && response.status !== 204) {
    const error = await response.text()
    throw new Error(`PayPal subscription cancellation failed: ${error}`)
  }
}

/**
 * Get PayPal subscription details
 */
export async function getPayPalSubscription(
  subscriptionId: string,
  credentials?: PayPalCredentials
): Promise<PayPalSubscription & { billing_info?: unknown }> {
  const accessToken = await getAccessToken(credentials)
  const apiBase = credentials?.mode === 'live'
    ? 'https://api-m.paypal.com'
    : PAYPAL_API_BASE

  const response = await fetch(`${apiBase}/v1/billing/subscriptions/${subscriptionId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Failed to get PayPal subscription: ${JSON.stringify(error)}`)
  }

  return response.json()
}

/**
 * Refund PayPal payment
 */
export async function refundPayPalPayment(
  captureId: string,
  amount?: number,
  currency?: string,
  credentials?: PayPalCredentials
): Promise<{ id: string; status: string }> {
  const accessToken = await getAccessToken(credentials)
  const apiBase = credentials?.mode === 'live'
    ? 'https://api-m.paypal.com'
    : PAYPAL_API_BASE

  const body: Record<string, unknown> = {}
  if (amount && currency) {
    body.amount = {
      value: (amount / 100).toFixed(2),
      currency_code: currency.toUpperCase(),
    }
  }

  const response = await fetch(`${apiBase}/v2/payments/captures/${captureId}/refund`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`PayPal refund failed: ${JSON.stringify(error)}`)
  }

  return response.json()
}

/**
 * Create PayPal webhook
 */
export async function createPayPalWebhook(
  webhookUrl: string,
  credentials?: PayPalCredentials
): Promise<string> {
  const accessToken = await getAccessToken(credentials)
  const apiBase = credentials?.mode === 'live'
    ? 'https://api-m.paypal.com'
    : PAYPAL_API_BASE

  const response = await fetch(`${apiBase}/v1/notifications/webhooks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      url: webhookUrl,
      event_types: [
        { name: 'CHECKOUT.ORDER.APPROVED' },
        { name: 'CHECKOUT.ORDER.COMPLETED' },
        { name: 'PAYMENT.CAPTURE.COMPLETED' },
        { name: 'PAYMENT.CAPTURE.DENIED' },
        { name: 'PAYMENT.CAPTURE.REFUNDED' },
        { name: 'BILLING.SUBSCRIPTION.ACTIVATED' },
        { name: 'BILLING.SUBSCRIPTION.CANCELLED' },
        { name: 'BILLING.SUBSCRIPTION.SUSPENDED' },
        { name: 'PAYMENT.SALE.COMPLETED' },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`PayPal webhook creation failed: ${JSON.stringify(error)}`)
  }

  const webhook = await response.json()
  return webhook.id
}

/**
 * Verify PayPal webhook signature
 */
export async function verifyPayPalWebhook(
  headers: Record<string, string>,
  body: string,
  webhookId: string,
  credentials?: PayPalCredentials
): Promise<boolean> {
  const accessToken = await getAccessToken(credentials)
  const apiBase = credentials?.mode === 'live'
    ? 'https://api-m.paypal.com'
    : PAYPAL_API_BASE

  const response = await fetch(`${apiBase}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      auth_algo: headers['paypal-auth-algo'],
      cert_url: headers['paypal-cert-url'],
      transmission_id: headers['paypal-transmission-id'],
      transmission_sig: headers['paypal-transmission-sig'],
      transmission_time: headers['paypal-transmission-time'],
      webhook_id: webhookId,
      webhook_event: JSON.parse(body),
    }),
  })

  if (!response.ok) {
    return false
  }

  const result = await response.json()
  return result.verification_status === 'SUCCESS'
}

/**
 * Get PayPal checkout URL from order
 */
export function getPayPalCheckoutUrl(order: PayPalOrder): string | null {
  const approveLink = order.links.find((link) => link.rel === 'approve')
  return approveLink?.href || null
}
