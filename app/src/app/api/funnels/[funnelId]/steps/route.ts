import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  getFunnelById,
  createFunnelStep,
  reorderFunnelSteps,
  getDefaultPageContent,
} from '@/lib/funnel/service'
import { hasWorkspaceAccess, hasWorkspaceRole } from '@/lib/workspace/service'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const createStepSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).optional(),
  type: z.enum([
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
  ]),
  sortOrder: z.number().int().min(0).optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
  pageContent: z.record(z.string(), z.unknown()).optional(),
})

const reorderStepsSchema = z.object({
  stepIds: z.array(z.string()),
})

interface RouteParams {
  params: Promise<{ funnelId: string }>
}

/**
 * GET /api/funnels/[funnelId]/steps - List funnel steps
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { funnelId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const funnel = await getFunnelById(funnelId)

    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 })
    }

    const hasAccess = await hasWorkspaceAccess(funnel.workspaceId, session.user.id)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const steps = await prisma.funnelStep.findMany({
      where: { funnelId },
      orderBy: { sortOrder: 'asc' },
      include: {
        variants: true,
      },
    })

    return NextResponse.json({ steps })
  } catch (error) {
    console.error('Error listing funnel steps:', error)
    return NextResponse.json(
      { error: 'Failed to list funnel steps' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/funnels/[funnelId]/steps - Create new step or reorder steps
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { funnelId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    // Check if this is a reorder request
    if (body.action === 'reorder') {
      const parsed = reorderStepsSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid input', details: parsed.error.flatten() },
          { status: 400 }
        )
      }
      await reorderFunnelSteps(funnelId, parsed.data.stepIds)
      return NextResponse.json({ success: true })
    }

    // Create new step
    const parsed = createStepSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { name, type, sortOrder, settings } = parsed.data

    // Generate slug if not provided
    const slug =
      parsed.data.slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

    // Get default page content if not provided
    const pageContent = parsed.data.pageContent || getDefaultPageContent(type)

    const step = await createFunnelStep({
      funnelId,
      name,
      slug,
      type,
      sortOrder,
      settings,
      pageContent,
    })

    return NextResponse.json({ step }, { status: 201 })
  } catch (error) {
    console.error('Error creating funnel step:', error)

    if (error instanceof Error && error.message === 'Step slug already exists in this funnel') {
      return NextResponse.json(
        { error: 'Step slug already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create funnel step' },
      { status: 500 }
    )
  }
}
