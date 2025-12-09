import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  getWorkspaceMembers,
  inviteMember,
  hasWorkspaceRole,
} from '@/lib/workspace/service'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'
import { WorkspaceRole } from '@prisma/client'

const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']).default('MEMBER'),
})

interface RouteParams {
  params: Promise<{ workspaceId: string }>
}

/**
 * GET /api/workspaces/[workspaceId]/members - List workspace members
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { workspaceId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    const members = await getWorkspaceMembers(workspaceId)

    return NextResponse.json({ members })
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/workspaces/[workspaceId]/members - Invite new member
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
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
    const parsed = inviteMemberSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { email, role } = parsed.data

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. They must register first.' },
        { status: 404 }
      )
    }

    const member = await inviteMember({
      workspaceId,
      userId: user.id,
      role: role as WorkspaceRole,
    })

    // TODO: Send invitation email

    return NextResponse.json({ member }, { status: 201 })
  } catch (error) {
    console.error('Error inviting member:', error)

    if (
      error instanceof Error &&
      error.message === 'User is already a member of this workspace'
    ) {
      return NextResponse.json(
        { error: 'User is already a member of this workspace' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to invite member' },
      { status: 500 }
    )
  }
}
