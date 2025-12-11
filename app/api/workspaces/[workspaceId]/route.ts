import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
});

// Get single workspace
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const session = await auth();
    const { workspaceId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        OR: [
          { ownerId: session.user.id },
          {
            members: {
              some: {
                userId: session.user.id,
                status: 'ACTIVE',
              },
            },
          },
        ],
      },
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
          where: { status: 'ACTIVE' },
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
            contacts: true,
            products: true,
          },
        },
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      );
    }

    const userMembership = workspace.members.find(m => m.userId === session.user.id);

    return NextResponse.json({
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        description: workspace.description,
        logoUrl: workspace.logoUrl,
        settings: workspace.settings,
        owner: workspace.owner,
        role: workspace.ownerId === session.user.id ? 'OWNER' : userMembership?.role || 'MEMBER',
        members: workspace.members.map(m => ({
          id: m.id,
          role: m.role,
          joinedAt: m.joinedAt,
          user: m.user,
        })),
        stats: {
          funnels: workspace._count.funnels,
          contacts: workspace._count.contacts,
          products: workspace._count.products,
        },
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching workspace:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update workspace
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const session = await auth();
    const { workspaceId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has permission to update
    const membership = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: session.user.id,
        status: 'ACTIVE',
        role: { in: ['OWNER', 'ADMIN'] },
      },
      include: {
        workspace: true,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateWorkspaceSchema.parse(body);

    const oldValue = {
      name: membership.workspace.name,
      description: membership.workspace.description,
      logoUrl: membership.workspace.logoUrl,
    };

    const updatedWorkspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: validatedData,
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        workspaceId,
        actorId: session.user.id,
        actorType: 'USER',
        action: 'workspace.update',
        entityType: 'Workspace',
        entityId: workspaceId,
        oldValue,
        newValue: validatedData,
      },
    });

    return NextResponse.json({
      workspace: {
        id: updatedWorkspace.id,
        name: updatedWorkspace.name,
        slug: updatedWorkspace.slug,
        description: updatedWorkspace.description,
        logoUrl: updatedWorkspace.logoUrl,
        settings: updatedWorkspace.settings,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating workspace:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete workspace
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const session = await auth();
    const { workspaceId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only owner can delete workspace
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        ownerId: session.user.id,
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: 'Only the workspace owner can delete the workspace' },
        { status: 403 }
      );
    }

    // Create audit log before deletion
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        actorType: 'USER',
        action: 'workspace.delete',
        entityType: 'Workspace',
        entityId: workspaceId,
        oldValue: { name: workspace.name, slug: workspace.slug },
      },
    });

    // Delete workspace (cascade will handle related records)
    await prisma.workspace.delete({
      where: { id: workspaceId },
    });

    return NextResponse.json({
      success: true,
      message: 'Workspace deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting workspace:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
