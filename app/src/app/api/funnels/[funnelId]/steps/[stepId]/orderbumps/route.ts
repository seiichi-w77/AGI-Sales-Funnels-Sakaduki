import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  getOrderBumpsForStep,
  createOrderBump,
  updateOrderBump,
  deleteOrderBump,
  reorderOrderBumps,
  getOrderBumpStats,
} from '@/lib/orderbump/service'
import { getFunnelById, getFunnelStepById } from '@/lib/funnel/service'
import { hasWorkspaceRole } from '@/lib/workspace/service'
import { z } from 'zod'

const createOrderBumpSchema = z.object({
  productId: z.string(),
  priceId: z.string(),
  headline: z.string().min(1).max(200),
  description: z.string().min(1).max(500),
  discountPercent: z.number().min(0).max(100).optional(),
  imageUrl: z.string().url().optional(),
  position: z.enum(['before_checkout', 'after_checkout', 'in_form']).optional(),
})

const updateOrderBumpSchema = z.object({
  bumpId: z.string(),
  headline: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(500).optional(),
  discountPrice: z.number().int().min(0).optional(),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
  position: z.enum(['before_checkout', 'after_checkout', 'in_form']).optional(),
})

const reorderBumpsSchema = z.object({
  bumpIds: z.array(z.string()),
})

interface RouteParams {
  params: Promise<{ funnelId: string; stepId: string }>
}

/**
 * GET /api/funnels/[funnelId]/steps/[stepId]/orderbumps - List order bumps
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { funnelId, stepId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify step belongs to funnel
    const step = await getFunnelStepById(stepId)
    if (!step || step.funnelId !== funnelId) {
      return NextResponse.json({ error: 'Step not found' }, { status: 404 })
    }

    const funnel = await getFunnelById(funnelId)
    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 })
    }

    // Check access
    const hasAccess = await hasWorkspaceRole(funnel.workspaceId, session.user.id, [
      'OWNER',
      'ADMIN',
      'MEMBER',
      'VIEWER',
    ])
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const includeStats = searchParams.get('stats') === 'true'

    const orderBumps = await getOrderBumpsForStep(stepId)

    if (includeStats) {
      const stats = await getOrderBumpStats(stepId)
      return NextResponse.json({ orderBumps, stats })
    }

    return NextResponse.json({ orderBumps })
  } catch (error) {
    console.error('Error listing order bumps:', error)
    return NextResponse.json(
      { error: 'Failed to list order bumps' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/funnels/[funnelId]/steps/[stepId]/orderbumps - Create or manage order bumps
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { funnelId, stepId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify step belongs to funnel
    const step = await getFunnelStepById(stepId)
    if (!step || step.funnelId !== funnelId) {
      return NextResponse.json({ error: 'Step not found' }, { status: 404 })
    }

    const funnel = await getFunnelById(funnelId)
    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 })
    }

    // Check admin access
    const hasAdminAccess = await hasWorkspaceRole(funnel.workspaceId, session.user.id, [
      'OWNER',
      'ADMIN',
    ])
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    // Handle reorder action
    if (body.action === 'reorder') {
      const parsed = reorderBumpsSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid input', details: parsed.error.flatten() },
          { status: 400 }
        )
      }
      await reorderOrderBumps(stepId, parsed.data.bumpIds)
      return NextResponse.json({ success: true })
    }

    // Create new order bump
    const parsed = createOrderBumpSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const orderBump = await createOrderBump({
      funnelStepId: stepId,
      ...parsed.data,
    })

    return NextResponse.json({ orderBump }, { status: 201 })
  } catch (error) {
    console.error('Error creating order bump:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to create order bump' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/funnels/[funnelId]/steps/[stepId]/orderbumps - Update order bump
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { funnelId, stepId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify step belongs to funnel
    const step = await getFunnelStepById(stepId)
    if (!step || step.funnelId !== funnelId) {
      return NextResponse.json({ error: 'Step not found' }, { status: 404 })
    }

    const funnel = await getFunnelById(funnelId)
    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 })
    }

    // Check admin access
    const hasAdminAccess = await hasWorkspaceRole(funnel.workspaceId, session.user.id, [
      'OWNER',
      'ADMIN',
    ])
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = updateOrderBumpSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { bumpId, ...updates } = parsed.data
    const orderBump = await updateOrderBump(stepId, bumpId, updates)

    return NextResponse.json({ orderBump })
  } catch (error) {
    console.error('Error updating order bump:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to update order bump' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/funnels/[funnelId]/steps/[stepId]/orderbumps - Delete order bump
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { funnelId, stepId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify step belongs to funnel
    const step = await getFunnelStepById(stepId)
    if (!step || step.funnelId !== funnelId) {
      return NextResponse.json({ error: 'Step not found' }, { status: 404 })
    }

    const funnel = await getFunnelById(funnelId)
    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 })
    }

    // Check admin access
    const hasAdminAccess = await hasWorkspaceRole(funnel.workspaceId, session.user.id, [
      'OWNER',
      'ADMIN',
    ])
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const bumpId = searchParams.get('bumpId')

    if (!bumpId) {
      return NextResponse.json({ error: 'bumpId is required' }, { status: 400 })
    }

    await deleteOrderBump(stepId, bumpId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting order bump:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to delete order bump' },
      { status: 500 }
    )
  }
}
