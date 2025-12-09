import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import {
  getPayPalCredentials,
  savePayPalCredentials,
  verifyPayPalCredentials,
  createPayPalOrder,
  capturePayPalOrder,
  getPayPalOrder,
  createPayPalSubscription,
  cancelPayPalSubscription,
  refundPayPalPayment,
  createPayPalWebhook,
  getPayPalCheckoutUrl,
  type PayPalCredentials,
} from '@/lib/paypal/service'
import { hasWorkspaceRole } from '@/lib/workspace/service'
import { z } from 'zod'

const saveCredentialsSchema = z.object({
  workspaceId: z.string(),
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
  mode: z.enum(['sandbox', 'live']),
})

const createOrderSchema = z.object({
  workspaceId: z.string(),
  orderId: z.string(),
  amount: z.number().positive(),
  currency: z.string().length(3),
  description: z.string().optional(),
  returnUrl: z.string().url(),
  cancelUrl: z.string().url(),
})

const captureOrderSchema = z.object({
  workspaceId: z.string(),
  paypalOrderId: z.string(),
  orderId: z.string(),
})

const createSubscriptionSchema = z.object({
  workspaceId: z.string(),
  planId: z.string(),
  customerId: z.string().optional(),
  returnUrl: z.string().url(),
  cancelUrl: z.string().url(),
})

const refundSchema = z.object({
  workspaceId: z.string(),
  captureId: z.string(),
  amount: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
})

/**
 * GET /api/payments/paypal
 * Get PayPal configuration
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 })
    }

    const hasAccess = await hasWorkspaceRole(workspaceId, session.user.id, ['OWNER', 'ADMIN'])
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const credentials = await getPayPalCredentials(workspaceId)

    // Don't return the full secret
    if (credentials) {
      return NextResponse.json({
        configured: true,
        mode: credentials.mode,
        clientId: credentials.clientId,
        hasWebhook: !!credentials.webhookId,
      })
    }

    return NextResponse.json({ configured: false })
  } catch (error) {
    console.error('Error getting PayPal config:', error)
    return NextResponse.json({ error: 'Failed to get PayPal configuration' }, { status: 500 })
  }
}

/**
 * POST /api/payments/paypal
 * Various PayPal operations
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    // Save credentials
    if (action === 'saveCredentials') {
      const parsed = saveCredentialsSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid input', details: parsed.error.flatten() },
          { status: 400 }
        )
      }

      const hasAccess = await hasWorkspaceRole(parsed.data.workspaceId, session.user.id, ['OWNER'])
      if (!hasAccess) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const credentials: PayPalCredentials = {
        clientId: parsed.data.clientId,
        clientSecret: parsed.data.clientSecret,
        mode: parsed.data.mode,
      }

      // Verify credentials
      const isValid = await verifyPayPalCredentials(credentials)
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid PayPal credentials' }, { status: 400 })
      }

      await savePayPalCredentials(parsed.data.workspaceId, credentials)
      return NextResponse.json({ success: true })
    }

    // Create order
    if (action === 'createOrder') {
      const parsed = createOrderSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid input', details: parsed.error.flatten() },
          { status: 400 }
        )
      }

      const credentials = await getPayPalCredentials(parsed.data.workspaceId)
      if (!credentials) {
        return NextResponse.json({ error: 'PayPal not configured' }, { status: 400 })
      }

      const order = await createPayPalOrder({
        amount: parsed.data.amount,
        currency: parsed.data.currency,
        description: parsed.data.description,
        returnUrl: parsed.data.returnUrl,
        cancelUrl: parsed.data.cancelUrl,
        orderId: parsed.data.orderId,
      }, credentials)

      const checkoutUrl = getPayPalCheckoutUrl(order)

      return NextResponse.json({
        paypalOrderId: order.id,
        checkoutUrl,
        status: order.status,
      })
    }

    // Capture order
    if (action === 'captureOrder') {
      const parsed = captureOrderSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid input', details: parsed.error.flatten() },
          { status: 400 }
        )
      }

      const credentials = await getPayPalCredentials(parsed.data.workspaceId)
      if (!credentials) {
        return NextResponse.json({ error: 'PayPal not configured' }, { status: 400 })
      }

      const capturedOrder = await capturePayPalOrder(parsed.data.paypalOrderId, credentials)

      if (capturedOrder.status === 'COMPLETED') {
        // Update order in database
        const existingOrder = await prisma.order.findUnique({
          where: { id: parsed.data.orderId },
          select: { metadata: true },
        })

        await prisma.order.update({
          where: { id: parsed.data.orderId },
          data: {
            status: 'COMPLETED',
            paidAt: new Date(),
            metadata: {
              ...(existingOrder?.metadata as object || {}),
              paypalOrderId: capturedOrder.id,
              paypalStatus: capturedOrder.status,
              capturedAt: new Date().toISOString(),
            } as object,
          },
        })
      }

      return NextResponse.json({
        status: capturedOrder.status,
        paypalOrderId: capturedOrder.id,
      })
    }

    // Get order status
    if (action === 'getOrder') {
      const { workspaceId, paypalOrderId } = body

      if (!workspaceId || !paypalOrderId) {
        return NextResponse.json(
          { error: 'workspaceId and paypalOrderId are required' },
          { status: 400 }
        )
      }

      const credentials = await getPayPalCredentials(workspaceId)
      if (!credentials) {
        return NextResponse.json({ error: 'PayPal not configured' }, { status: 400 })
      }

      const order = await getPayPalOrder(paypalOrderId, credentials)
      return NextResponse.json({ order })
    }

    // Create subscription
    if (action === 'createSubscription') {
      const parsed = createSubscriptionSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid input', details: parsed.error.flatten() },
          { status: 400 }
        )
      }

      const credentials = await getPayPalCredentials(parsed.data.workspaceId)
      if (!credentials) {
        return NextResponse.json({ error: 'PayPal not configured' }, { status: 400 })
      }

      const subscription = await createPayPalSubscription({
        planId: parsed.data.planId,
        returnUrl: parsed.data.returnUrl,
        cancelUrl: parsed.data.cancelUrl,
        customerId: parsed.data.customerId,
      }, credentials)

      const approvalUrl = subscription.links.find((l) => l.rel === 'approve')?.href

      return NextResponse.json({
        subscriptionId: subscription.id,
        approvalUrl,
        status: subscription.status,
      })
    }

    // Cancel subscription
    if (action === 'cancelSubscription') {
      const { workspaceId, subscriptionId, reason } = body

      if (!workspaceId || !subscriptionId) {
        return NextResponse.json(
          { error: 'workspaceId and subscriptionId are required' },
          { status: 400 }
        )
      }

      const credentials = await getPayPalCredentials(workspaceId)
      if (!credentials) {
        return NextResponse.json({ error: 'PayPal not configured' }, { status: 400 })
      }

      await cancelPayPalSubscription(subscriptionId, reason, credentials)
      return NextResponse.json({ success: true })
    }

    // Refund payment
    if (action === 'refund') {
      const parsed = refundSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid input', details: parsed.error.flatten() },
          { status: 400 }
        )
      }

      const hasAccess = await hasWorkspaceRole(parsed.data.workspaceId, session.user.id, ['OWNER', 'ADMIN'])
      if (!hasAccess) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const credentials = await getPayPalCredentials(parsed.data.workspaceId)
      if (!credentials) {
        return NextResponse.json({ error: 'PayPal not configured' }, { status: 400 })
      }

      const refund = await refundPayPalPayment(
        parsed.data.captureId,
        parsed.data.amount,
        parsed.data.currency,
        credentials
      )

      return NextResponse.json({ refund })
    }

    // Setup webhook
    if (action === 'setupWebhook') {
      const { workspaceId, webhookUrl } = body

      if (!workspaceId || !webhookUrl) {
        return NextResponse.json(
          { error: 'workspaceId and webhookUrl are required' },
          { status: 400 }
        )
      }

      const hasAccess = await hasWorkspaceRole(workspaceId, session.user.id, ['OWNER'])
      if (!hasAccess) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const credentials = await getPayPalCredentials(workspaceId)
      if (!credentials) {
        return NextResponse.json({ error: 'PayPal not configured' }, { status: 400 })
      }

      const webhookId = await createPayPalWebhook(webhookUrl, credentials)

      // Save webhook ID
      await savePayPalCredentials(workspaceId, {
        ...credentials,
        webhookId,
      })

      return NextResponse.json({ webhookId })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error with PayPal:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to process PayPal request' }, { status: 500 })
  }
}
