import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  createFunnel,
  listFunnels,
  generateUniqueFunnelSlug,
} from '@/lib/funnel/service'
import { hasWorkspaceAccess } from '@/lib/workspace/service'
import { z } from 'zod'
import { FunnelType, FunnelStatus } from '@prisma/client'

const createFunnelSchema = z.object({
  workspaceId: z.string(),
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).optional(),
  type: z.enum(['LEAD_MAGNET', 'BOOK', 'CART', 'WEBINAR', 'VSL', 'STOREFRONT', 'CUSTOM']).default('LEAD_MAGNET'),
  description: z.string().max(500).optional(),
  thumbnail: z.string().url().optional(),
})

const listFunnelsSchema = z.object({
  workspaceId: z.string(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  type: z.enum(['LEAD_MAGNET', 'BOOK', 'CART', 'WEBINAR', 'VSL', 'STOREFRONT', 'CUSTOM']).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
})

/**
 * GET /api/funnels - List funnels
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const params = {
      workspaceId: searchParams.get('workspaceId') || '',
      status: searchParams.get('status') || undefined,
      type: searchParams.get('type') || undefined,
      limit: searchParams.get('limit') || '20',
      offset: searchParams.get('offset') || '0',
    }

    const parsed = listFunnelsSchema.safeParse(params)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { workspaceId, status, type, limit, offset } = parsed.data

    // Check access
    const hasAccess = await hasWorkspaceAccess(workspaceId, session.user.id)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const result = await listFunnels(workspaceId, {
      status: status as FunnelStatus | undefined,
      type: type as FunnelType | undefined,
      limit,
      offset,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error listing funnels:', error)
    return NextResponse.json(
      { error: 'Failed to list funnels' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/funnels - Create new funnel
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = createFunnelSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { workspaceId, name, type, description, thumbnail } = parsed.data

    // Check access
    const hasAccess = await hasWorkspaceAccess(workspaceId, session.user.id)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const slug = parsed.data.slug || (await generateUniqueFunnelSlug(workspaceId, name))

    const funnel = await createFunnel({
      workspaceId,
      name,
      slug,
      type: type as FunnelType,
      description,
      thumbnail,
    })

    return NextResponse.json({ funnel }, { status: 201 })
  } catch (error) {
    console.error('Error creating funnel:', error)

    if (error instanceof Error && error.message === 'Funnel slug already exists in this workspace') {
      return NextResponse.json(
        { error: 'Funnel slug already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create funnel' },
      { status: 500 }
    )
  }
}
