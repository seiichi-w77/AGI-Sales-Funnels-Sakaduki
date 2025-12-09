import { prisma } from '@/lib/db/prisma'
import type { Workspace, WorkspaceMember, WorkspaceRole, MemberStatus } from '@prisma/client'

export interface CreateWorkspaceInput {
  name: string
  slug: string
  description?: string
  logoUrl?: string
  ownerId: string
  settings?: Record<string, unknown>
}

export interface UpdateWorkspaceInput {
  name?: string
  description?: string
  logoUrl?: string | null
  settings?: Record<string, unknown>
}

export interface InviteMemberInput {
  workspaceId: string
  userId: string
  role?: WorkspaceRole
  permissions?: Record<string, boolean>
}

/**
 * Create a new workspace
 */
export async function createWorkspace(input: CreateWorkspaceInput): Promise<Workspace> {
  const { name, slug, description, logoUrl, ownerId, settings } = input

  // Check if slug is already taken
  const existingWorkspace = await prisma.workspace.findUnique({
    where: { slug },
  })

  if (existingWorkspace) {
    throw new Error('Workspace slug already exists')
  }

  // Create workspace and add owner as a member
  const workspace = await prisma.workspace.create({
    data: {
      name,
      slug,
      description,
      logoUrl,
      ownerId,
      settings: settings as object,
      members: {
        create: {
          userId: ownerId,
          role: 'OWNER',
          status: 'ACTIVE',
          joinedAt: new Date(),
        },
      },
    },
    include: {
      owner: true,
      members: true,
    },
  })

  return workspace
}

/**
 * Get workspace by ID
 */
export async function getWorkspaceById(workspaceId: string): Promise<Workspace | null> {
  return prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      owner: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          profileImageUrl: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
            },
          },
        },
      },
      _count: {
        select: {
          funnels: true,
          products: true,
          contacts: true,
          courses: true,
        },
      },
    },
  })
}

/**
 * Get workspace by slug
 */
export async function getWorkspaceBySlug(slug: string): Promise<Workspace | null> {
  return prisma.workspace.findUnique({
    where: { slug },
    include: {
      owner: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          profileImageUrl: true,
        },
      },
    },
  })
}

/**
 * Get all workspaces for a user
 */
export async function getWorkspacesForUser(userId: string): Promise<Workspace[]> {
  const memberships = await prisma.workspaceMember.findMany({
    where: {
      userId,
      status: 'ACTIVE',
    },
    include: {
      workspace: {
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
            },
          },
          _count: {
            select: {
              members: true,
              funnels: true,
              products: true,
              contacts: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return memberships.map((m) => m.workspace)
}

/**
 * Update workspace
 */
export async function updateWorkspace(
  workspaceId: string,
  input: UpdateWorkspaceInput
): Promise<Workspace> {
  return prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      name: input.name,
      description: input.description,
      logoUrl: input.logoUrl,
      settings: input.settings as object,
    },
  })
}

/**
 * Delete workspace
 */
export async function deleteWorkspace(workspaceId: string): Promise<void> {
  await prisma.workspace.delete({
    where: { id: workspaceId },
  })
}

/**
 * Invite member to workspace
 */
export async function inviteMember(input: InviteMemberInput): Promise<WorkspaceMember> {
  const { workspaceId, userId, role = 'MEMBER', permissions } = input

  // Check if already a member
  const existingMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  })

  if (existingMember) {
    throw new Error('User is already a member of this workspace')
  }

  return prisma.workspaceMember.create({
    data: {
      workspaceId,
      userId,
      role,
      permissions: permissions as object,
      status: 'PENDING',
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          profileImageUrl: true,
        },
      },
    },
  })
}

/**
 * Accept workspace invitation
 */
export async function acceptInvitation(
  workspaceId: string,
  userId: string
): Promise<WorkspaceMember> {
  return prisma.workspaceMember.update({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
    data: {
      status: 'ACTIVE',
      joinedAt: new Date(),
    },
  })
}

/**
 * Update member role
 */
export async function updateMemberRole(
  workspaceId: string,
  userId: string,
  role: WorkspaceRole
): Promise<WorkspaceMember> {
  // Prevent changing owner role
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  })

  if (member?.role === 'OWNER') {
    throw new Error('Cannot change owner role')
  }

  return prisma.workspaceMember.update({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
    data: {
      role,
    },
  })
}

/**
 * Remove member from workspace
 */
export async function removeMember(workspaceId: string, userId: string): Promise<void> {
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  })

  if (member?.role === 'OWNER') {
    throw new Error('Cannot remove workspace owner')
  }

  await prisma.workspaceMember.delete({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  })
}

/**
 * Get workspace members
 */
export async function getWorkspaceMembers(
  workspaceId: string,
  status?: MemberStatus
): Promise<WorkspaceMember[]> {
  return prisma.workspaceMember.findMany({
    where: {
      workspaceId,
      ...(status && { status }),
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          profileImageUrl: true,
        },
      },
    },
    orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
  })
}

/**
 * Check if user has access to workspace
 */
export async function hasWorkspaceAccess(
  workspaceId: string,
  userId: string
): Promise<boolean> {
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  })

  return member?.status === 'ACTIVE'
}

/**
 * Check if user has specific role in workspace
 */
export async function hasWorkspaceRole(
  workspaceId: string,
  userId: string,
  roles: WorkspaceRole[]
): Promise<boolean> {
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  })

  if (!member || member.status !== 'ACTIVE') {
    return false
  }

  return roles.includes(member.role)
}

/**
 * Generate unique slug from name
 */
export async function generateUniqueSlug(name: string): Promise<string> {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  let slug = baseSlug
  let counter = 1

  while (await prisma.workspace.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

/**
 * Get workspace subscription
 */
export async function getWorkspaceSubscription(workspaceId: string) {
  return prisma.subscription.findFirst({
    where: {
      workspaceId,
      status: { in: ['ACTIVE', 'TRIALING', 'PAST_DUE'] },
    },
    include: {
      plan: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

/**
 * Get workspace usage stats
 */
export async function getWorkspaceStats(workspaceId: string) {
  const [funnelsCount, productsCount, contactsCount, coursesCount, ordersCount] =
    await Promise.all([
      prisma.funnel.count({ where: { workspaceId } }),
      prisma.product.count({ where: { workspaceId } }),
      prisma.contact.count({ where: { workspaceId } }),
      prisma.course.count({ where: { workspaceId } }),
      prisma.order.count({ where: { workspaceId } }),
    ])

  return {
    funnels: funnelsCount,
    products: productsCount,
    contacts: contactsCount,
    courses: coursesCount,
    orders: ordersCount,
  }
}
