import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const updateMemberSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']),
});

// Update member role
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; memberId: string }> }
) {
  try {
    const session = await auth();
    const { workspaceId, memberId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has permission (owner or admin)
    const userMembership = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: session.user.id,
        status: 'ACTIVE',
        role: { in: ['OWNER', 'ADMIN'] },
      },
    });

    if (!userMembership) {
      return NextResponse.json(
        { error: 'Only owners and admins can update member roles' },
        { status: 403 }
      );
    }

    // Get the target member
    const targetMember = await prisma.workspaceMember.findFirst({
      where: {
        id: memberId,
        workspaceId,
      },
    });

    if (!targetMember) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Cannot change owner's role
    if (targetMember.role === 'OWNER') {
      return NextResponse.json(
        { error: 'Cannot change the role of the workspace owner' },
        { status: 400 }
      );
    }

    // Admins cannot change other admins' roles
    if (userMembership.role === 'ADMIN' && targetMember.role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Admins cannot modify other admins' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { role } = updateMemberSchema.parse(body);

    const oldRole = targetMember.role;

    const updatedMember = await prisma.workspaceMember.update({
      where: { id: memberId },
      data: { role },
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
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        workspaceId,
        actorId: session.user.id,
        actorType: 'USER',
        action: 'member.role_change',
        entityType: 'WorkspaceMember',
        entityId: memberId,
        oldValue: { role: oldRole },
        newValue: { role },
      },
    });

    return NextResponse.json({
      member: {
        id: updatedMember.id,
        role: updatedMember.role,
        status: updatedMember.status,
        user: updatedMember.user,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Remove member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; memberId: string }> }
) {
  try {
    const session = await auth();
    const { workspaceId, memberId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the target member
    const targetMember = await prisma.workspaceMember.findFirst({
      where: {
        id: memberId,
        workspaceId,
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!targetMember) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Cannot remove owner
    if (targetMember.role === 'OWNER') {
      return NextResponse.json(
        { error: 'Cannot remove the workspace owner' },
        { status: 400 }
      );
    }

    // Check if user can remove this member
    const isRemovingSelf = targetMember.userId === session.user.id;

    if (!isRemovingSelf) {
      // Check if user has permission
      const userMembership = await prisma.workspaceMember.findFirst({
        where: {
          workspaceId,
          userId: session.user.id,
          status: 'ACTIVE',
          role: { in: ['OWNER', 'ADMIN'] },
        },
      });

      if (!userMembership) {
        return NextResponse.json(
          { error: 'Only owners and admins can remove members' },
          { status: 403 }
        );
      }

      // Admins cannot remove other admins
      if (userMembership.role === 'ADMIN' && targetMember.role === 'ADMIN') {
        return NextResponse.json(
          { error: 'Admins cannot remove other admins' },
          { status: 403 }
        );
      }
    }

    // Remove member
    await prisma.workspaceMember.update({
      where: { id: memberId },
      data: {
        status: 'REMOVED',
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        workspaceId,
        actorId: session.user.id,
        actorType: 'USER',
        action: isRemovingSelf ? 'member.leave' : 'member.remove',
        entityType: 'WorkspaceMember',
        entityId: memberId,
        metadata: { email: targetMember.user.email },
      },
    });

    return NextResponse.json({
      success: true,
      message: isRemovingSelf
        ? 'You have left the workspace'
        : 'Member removed successfully',
    });
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
