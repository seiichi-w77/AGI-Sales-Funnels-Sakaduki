import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  hasWorkspaceRole,
} from '@/lib/workspace/service'
import { z } from 'zod'

const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  logoUrl: z.string().url().optional().nullable(),
  settings: z.record(z.string(), z.unknown()).optional(),
})

interface RouteParams {
  params: Promise<{ workspaceId: string }>
}

/**
 * GET /api/workspaces/[workspaceId] - Get workspace details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { workspaceId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workspace = await getWorkspaceById(workspaceId)

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    // Check if user has access
    const hasAccess = await hasWorkspaceRole(workspaceId, session.user.id, [
      'OWNER',
      'ADMIN',
      'MEMBER',
      'VIEWER',
    ])

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ workspace })
  } catch (error) {
    console.error('Error fetching workspace:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workspace' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/workspaces/[workspaceId] - Update workspace
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { workspaceId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin access
    const hasAdminAccess = await hasWorkspaceRole(workspaceId, session.user.id, [
      'OWNER',
      'ADMIN',
    ])

    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = updateWorkspaceSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const workspace = await updateWorkspace(workspaceId, parsed.data)

    return NextResponse.json({ workspace })
  } catch (error) {
    console.error('Error updating workspace:', error)
    return NextResponse.json(
      { error: 'Failed to update workspace' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/workspaces/[workspaceId] - Delete workspace
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { workspaceId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only owner can delete workspace
    const isOwner = await hasWorkspaceRole(workspaceId, session.user.id, ['OWNER'])

    if (!isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await deleteWorkspace(workspaceId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting workspace:', error)
    return NextResponse.json(
      { error: 'Failed to delete workspace' },
      { status: 500 }
    )
  }
}
