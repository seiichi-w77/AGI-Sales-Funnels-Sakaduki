import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  getFunnelById,
  getFunnelStepById,
  updateFunnelStep,
  deleteFunnelStep,
} from '@/lib/funnel/service'
import { hasWorkspaceAccess, hasWorkspaceRole } from '@/lib/workspace/service'
import { z } from 'zod'

const updateStepSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z
    .enum([
      'OPTIN',
      'SALES',
      'UPSELL',
      'DOWNSELL',
      'ORDER_FORM',
      'CHECKOUT',
      'THANK_YOU',
      'WEBINAR',
      'MEMBER',
      'CUSTOM',
    ])
    .optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
  pageContent: z.record(z.string(), z.unknown()).optional(),
  isPublished: z.boolean().optional(),
})

interface RouteParams {
  params: Promise<{ funnelId: string; stepId: string }>
}

/**
 * GET /api/funnels/[funnelId]/steps/[stepId] - Get step details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { funnelId, stepId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const step = await getFunnelStepById(stepId)

    if (!step || step.funnelId !== funnelId) {
      return NextResponse.json({ error: 'Step not found' }, { status: 404 })
    }

    const funnel = await getFunnelById(funnelId)
    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 })
    }

    const hasAccess = await hasWorkspaceAccess(funnel.workspaceId, session.user.id)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ step })
  } catch (error) {
    console.error('Error fetching funnel step:', error)
    return NextResponse.json(
      { error: 'Failed to fetch funnel step' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/funnels/[funnelId]/steps/[stepId] - Update step
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { funnelId, stepId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const step = await getFunnelStepById(stepId)

    if (!step || step.funnelId !== funnelId) {
      return NextResponse.json({ error: 'Step not found' }, { status: 404 })
    }

    const funnel = await getFunnelById(funnelId)
    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 })
    }

    const hasAdminAccess = await hasWorkspaceRole(funnel.workspaceId, session.user.id, [
      'OWNER',
      'ADMIN',
    ])
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = updateStepSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const updatedStep = await updateFunnelStep(stepId, parsed.data)

    return NextResponse.json({ step: updatedStep })
  } catch (error) {
    console.error('Error updating funnel step:', error)
    return NextResponse.json(
      { error: 'Failed to update funnel step' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/funnels/[funnelId]/steps/[stepId] - Delete step
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { funnelId, stepId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const step = await getFunnelStepById(stepId)

    if (!step || step.funnelId !== funnelId) {
      return NextResponse.json({ error: 'Step not found' }, { status: 404 })
    }

    const funnel = await getFunnelById(funnelId)
    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 })
    }

    const hasAdminAccess = await hasWorkspaceRole(funnel.workspaceId, session.user.id, [
      'OWNER',
      'ADMIN',
    ])
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await deleteFunnelStep(stepId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting funnel step:', error)
    return NextResponse.json(
      { error: 'Failed to delete funnel step' },
      { status: 500 }
    )
  }
}
