import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  getPopupsForStep,
  createPopup,
  updatePopup,
  deletePopup,
  getPopupTemplates,
  getPopupStats,
} from '@/lib/popup/service'
import { getFunnelById, getFunnelStepById } from '@/lib/funnel/service'
import { hasWorkspaceRole } from '@/lib/workspace/service'
import { z } from 'zod'

const createPopupSchema = z.object({
  name: z.string().min(1).max(100),
  trigger: z.enum(['exit_intent', 'time_delay', 'scroll_depth', 'click', 'page_load']),
  triggerValue: z.number().optional(),
  position: z.enum(['center', 'top', 'bottom', 'left', 'right', 'bottom-right', 'bottom-left']).optional(),
  animation: z.enum(['fade', 'slide', 'bounce', 'zoom', 'none']).optional(),
  content: z.record(z.string(), z.unknown()),
  settings: z
    .object({
      overlay: z.boolean().optional(),
      overlayColor: z.string().optional(),
      overlayOpacity: z.number().min(0).max(1).optional(),
      closeOnOverlayClick: z.boolean().optional(),
      closeButton: z.boolean().optional(),
      width: z.string().optional(),
      maxWidth: z.string().optional(),
      borderRadius: z.string().optional(),
      backgroundColor: z.string().optional(),
      padding: z.string().optional(),
      showOnMobile: z.boolean().optional(),
      frequency: z.enum(['always', 'once_per_session', 'once_per_day', 'once_per_week', 'once']).optional(),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
      isActive: z.boolean().optional(),
    })
    .optional(),
})

const updatePopupSchema = z.object({
  popupId: z.string(),
  name: z.string().min(1).max(100).optional(),
  trigger: z.enum(['exit_intent', 'time_delay', 'scroll_depth', 'click', 'page_load']).optional(),
  triggerValue: z.number().optional(),
  position: z.enum(['center', 'top', 'bottom', 'left', 'right', 'bottom-right', 'bottom-left']).optional(),
  animation: z.enum(['fade', 'slide', 'bounce', 'zoom', 'none']).optional(),
  content: z.record(z.string(), z.unknown()).optional(),
  overlay: z.boolean().optional(),
  overlayColor: z.string().optional(),
  overlayOpacity: z.number().min(0).max(1).optional(),
  closeOnOverlayClick: z.boolean().optional(),
  closeButton: z.boolean().optional(),
  width: z.string().optional(),
  maxWidth: z.string().optional(),
  borderRadius: z.string().optional(),
  backgroundColor: z.string().optional(),
  padding: z.string().optional(),
  showOnMobile: z.boolean().optional(),
  frequency: z.enum(['always', 'once_per_session', 'once_per_day', 'once_per_week', 'once']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
})

interface RouteParams {
  params: Promise<{ funnelId: string; stepId: string }>
}

/**
 * GET /api/funnels/[funnelId]/steps/[stepId]/popups
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

    const hasAccess = await hasWorkspaceRole(funnel.workspaceId, session.user.id, [
      'OWNER', 'ADMIN', 'MEMBER', 'VIEWER',
    ])
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const includeStats = searchParams.get('stats') === 'true'
    const templates = searchParams.get('templates') === 'true'

    if (templates) {
      return NextResponse.json({ templates: getPopupTemplates() })
    }

    const popups = await getPopupsForStep(stepId)

    if (includeStats) {
      const stats = await getPopupStats(stepId)
      return NextResponse.json({ popups, stats })
    }

    return NextResponse.json({ popups })
  } catch (error) {
    console.error('Error listing popups:', error)
    return NextResponse.json({ error: 'Failed to list popups' }, { status: 500 })
  }
}

/**
 * POST /api/funnels/[funnelId]/steps/[stepId]/popups
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
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
      'OWNER', 'ADMIN',
    ])
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = createPopupSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const popup = await createPopup({
      funnelStepId: stepId,
      ...parsed.data,
    })

    return NextResponse.json({ popup }, { status: 201 })
  } catch (error) {
    console.error('Error creating popup:', error)
    return NextResponse.json({ error: 'Failed to create popup' }, { status: 500 })
  }
}

/**
 * PATCH /api/funnels/[funnelId]/steps/[stepId]/popups
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
      'OWNER', 'ADMIN',
    ])
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = updatePopupSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { popupId, ...updates } = parsed.data
    const popup = await updatePopup(stepId, popupId, updates)

    return NextResponse.json({ popup })
  } catch (error) {
    console.error('Error updating popup:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update popup' }, { status: 500 })
  }
}

/**
 * DELETE /api/funnels/[funnelId]/steps/[stepId]/popups
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
      'OWNER', 'ADMIN',
    ])
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const popupId = searchParams.get('popupId')

    if (!popupId) {
      return NextResponse.json({ error: 'popupId is required' }, { status: 400 })
    }

    await deletePopup(stepId, popupId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting popup:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to delete popup' }, { status: 500 })
  }
}
