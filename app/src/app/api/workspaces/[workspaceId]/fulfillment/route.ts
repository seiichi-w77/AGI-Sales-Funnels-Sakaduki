import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  getFulfillmentRules,
  createFulfillmentRule,
  updateFulfillmentRule,
  deleteFulfillmentRule,
  getFulfillmentRecords,
  processOrderFulfillment,
  retryFulfillment,
  markFulfillmentComplete,
  cancelFulfillment,
  getFulfillmentStats,
} from '@/lib/fulfillment/service'
import { hasWorkspaceAccess, hasWorkspaceRole } from '@/lib/workspace/service'
import { z } from 'zod'

const createRuleSchema = z.object({
  name: z.string().min(1).max(100),
  productId: z.string(),
  type: z.enum(['digital', 'physical', 'service', 'membership', 'webhook']),
  deliveryMethod: z.enum(['email', 'download', 'webhook', 'manual', 'api']),
  settings: z.object({
    downloadUrl: z.string().url().optional(),
    downloadExpiry: z.number().optional(),
    maxDownloads: z.number().optional(),
    emailTemplate: z.string().optional(),
    emailSubject: z.string().optional(),
    webhookUrl: z.string().url().optional(),
    webhookHeaders: z.record(z.string(), z.string()).optional(),
    membershipLevel: z.string().optional(),
    membershipDuration: z.number().optional(),
    shippingRequired: z.boolean().optional(),
    shippingProvider: z.string().optional(),
    serviceDetails: z.string().optional(),
    bookingRequired: z.boolean().optional(),
  }).optional(),
  isActive: z.boolean().optional(),
})

const updateRuleSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  type: z.enum(['digital', 'physical', 'service', 'membership', 'webhook']).optional(),
  deliveryMethod: z.enum(['email', 'download', 'webhook', 'manual', 'api']).optional(),
  settings: z.object({
    downloadUrl: z.string().url().optional(),
    downloadExpiry: z.number().optional(),
    maxDownloads: z.number().optional(),
    emailTemplate: z.string().optional(),
    emailSubject: z.string().optional(),
    webhookUrl: z.string().url().optional(),
    webhookHeaders: z.record(z.string(), z.string()).optional(),
    membershipLevel: z.string().optional(),
    membershipDuration: z.number().optional(),
    shippingRequired: z.boolean().optional(),
    shippingProvider: z.string().optional(),
    serviceDetails: z.string().optional(),
    bookingRequired: z.boolean().optional(),
  }).optional(),
  isActive: z.boolean().optional(),
})

interface RouteParams {
  params: Promise<{ workspaceId: string }>
}

/**
 * GET /api/workspaces/[workspaceId]/fulfillment
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { workspaceId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasAccess = await hasWorkspaceAccess(workspaceId, session.user.id)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    const stats = searchParams.get('stats') === 'true'

    // Get fulfillment stats
    if (stats) {
      const fulfillmentStats = await getFulfillmentStats(workspaceId)
      return NextResponse.json({ stats: fulfillmentStats })
    }

    // Get fulfillment records for an order
    if (orderId) {
      const records = await getFulfillmentRecords(orderId)
      return NextResponse.json({ records })
    }

    // Get fulfillment rules
    const rules = await getFulfillmentRules(workspaceId)

    return NextResponse.json({ rules })
  } catch (error) {
    console.error('Error with fulfillment:', error)
    return NextResponse.json({ error: 'Failed to get fulfillment data' }, { status: 500 })
  }
}

/**
 * POST /api/workspaces/[workspaceId]/fulfillment
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { workspaceId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasAdminAccess = await hasWorkspaceRole(workspaceId, session.user.id, ['OWNER', 'ADMIN'])
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    // Process order fulfillment
    if (action === 'process') {
      const { orderId } = body
      if (!orderId) {
        return NextResponse.json({ error: 'orderId is required' }, { status: 400 })
      }

      const records = await processOrderFulfillment(orderId, workspaceId)
      return NextResponse.json({ records })
    }

    // Retry failed fulfillment
    if (action === 'retry') {
      const { orderId, recordId } = body
      if (!orderId || !recordId) {
        return NextResponse.json({ error: 'orderId and recordId are required' }, { status: 400 })
      }

      const record = await retryFulfillment(orderId, recordId, workspaceId)
      return NextResponse.json({ record })
    }

    // Mark as complete
    if (action === 'complete') {
      const { orderId, recordId, details } = body
      if (!orderId || !recordId) {
        return NextResponse.json({ error: 'orderId and recordId are required' }, { status: 400 })
      }

      const record = await markFulfillmentComplete(orderId, recordId, details)
      return NextResponse.json({ record })
    }

    // Cancel fulfillment
    if (action === 'cancel') {
      const { orderId, recordId } = body
      if (!orderId || !recordId) {
        return NextResponse.json({ error: 'orderId and recordId are required' }, { status: 400 })
      }

      const record = await cancelFulfillment(orderId, recordId)
      return NextResponse.json({ record })
    }

    // Create fulfillment rule
    const parsed = createRuleSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const rule = await createFulfillmentRule({
      workspaceId,
      ...parsed.data,
    })

    return NextResponse.json({ rule }, { status: 201 })
  } catch (error) {
    console.error('Error with fulfillment:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to process fulfillment request' }, { status: 500 })
  }
}

/**
 * PATCH /api/workspaces/[workspaceId]/fulfillment
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { workspaceId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasAdminAccess = await hasWorkspaceRole(workspaceId, session.user.id, ['OWNER', 'ADMIN'])
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = updateRuleSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { id, ...updates } = parsed.data
    const rule = await updateFulfillmentRule(workspaceId, id, updates)

    return NextResponse.json({ rule })
  } catch (error) {
    console.error('Error updating fulfillment rule:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update fulfillment rule' }, { status: 500 })
  }
}

/**
 * DELETE /api/workspaces/[workspaceId]/fulfillment
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { workspaceId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasAdminAccess = await hasWorkspaceRole(workspaceId, session.user.id, ['OWNER', 'ADMIN'])
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    await deleteFulfillmentRule(workspaceId, id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting fulfillment rule:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to delete fulfillment rule' }, { status: 500 })
  }
}
