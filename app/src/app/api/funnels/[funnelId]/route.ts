import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  getFunnelById,
  updateFunnel,
  deleteFunnel,
  publishFunnel,
  unpublishFunnel,
  duplicateFunnel,
  generateUniqueFunnelSlug,
} from '@/lib/funnel/service'
import { hasWorkspaceAccess, hasWorkspaceRole } from '@/lib/workspace/service'
import { z } from 'zod'

const updateFunnelSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  thumbnail: z.string().url().optional().nullable(),
  settings: z.record(z.string(), z.unknown()).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
})

interface RouteParams {
  params: Promise<{ funnelId: string }>
}

/**
 * GET /api/funnels/[funnelId] - Get funnel details
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

    // Check access
    const hasAccess = await hasWorkspaceAccess(funnel.workspaceId, session.user.id)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ funnel })
  } catch (error) {
    console.error('Error fetching funnel:', error)
    return NextResponse.json(
      { error: 'Failed to fetch funnel' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/funnels/[funnelId] - Update funnel
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    // Check admin access
    const hasAdminAccess = await hasWorkspaceRole(funnel.workspaceId, session.user.id, [
      'OWNER',
      'ADMIN',
    ])
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = updateFunnelSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const updatedFunnel = await updateFunnel(funnelId, parsed.data)

    return NextResponse.json({ funnel: updatedFunnel })
  } catch (error) {
    console.error('Error updating funnel:', error)
    return NextResponse.json(
      { error: 'Failed to update funnel' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/funnels/[funnelId] - Delete funnel
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // Only owner can delete
    const isOwner = await hasWorkspaceRole(funnel.workspaceId, session.user.id, ['OWNER'])
    if (!isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await deleteFunnel(funnelId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting funnel:', error)
    return NextResponse.json(
      { error: 'Failed to delete funnel' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/funnels/[funnelId] - Actions (publish, duplicate, etc.)
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
    const { action, ...data } = body

    switch (action) {
      case 'publish': {
        const published = await publishFunnel(funnelId)
        return NextResponse.json({ funnel: published })
      }

      case 'unpublish': {
        const unpublished = await unpublishFunnel(funnelId)
        return NextResponse.json({ funnel: unpublished })
      }

      case 'duplicate': {
        const newName = data.name || `${funnel.name} (Copy)`
        const newSlug = await generateUniqueFunnelSlug(funnel.workspaceId, newName)
        const duplicated = await duplicateFunnel(funnelId, newName, newSlug)
        return NextResponse.json({ funnel: duplicated }, { status: 201 })
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error performing funnel action:', error)
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    )
  }
}
