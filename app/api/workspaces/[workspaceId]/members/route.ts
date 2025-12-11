import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']).default('MEMBER'),
});

// updateMemberSchema is defined in [memberId]/route.ts

// List workspace members
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

    // Check if user has access to workspace
    const userMembership = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: session.user.id,
        status: 'ACTIVE',
      },
    });

    if (!userMembership) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            lastLoginAt: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' },
        { joinedAt: 'asc' },
      ],
    });

    return NextResponse.json({
      members: members.map(m => ({
        id: m.id,
        role: m.role,
        status: m.status,
        invitedAt: m.invitedAt,
        joinedAt: m.joinedAt,
        user: m.user,
      })),
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Invite member
export async function POST(
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

    // Check if user has permission to invite
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
        { error: 'Only owners and admins can invite members' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, role } = inviteMemberSchema.parse(body);

    // Find or create user by email
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create a placeholder user for invitation
      user = await prisma.user.create({
        data: {
          email,
          isEmailVerified: false,
        },
      });
    }

    // Check if already a member
    const existingMember = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: user.id,
      },
    });

    if (existingMember) {
      if (existingMember.status === 'ACTIVE') {
        return NextResponse.json(
          { error: 'User is already a member of this workspace' },
          { status: 400 }
        );
      }

      // Reactivate membership
      const updatedMember = await prisma.workspaceMember.update({
        where: { id: existingMember.id },
        data: {
          status: 'PENDING',
          role,
          invitedAt: new Date(),
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
      });

      return NextResponse.json({
        member: {
          id: updatedMember.id,
          role: updatedMember.role,
          status: updatedMember.status,
          invitedAt: updatedMember.invitedAt,
          user: updatedMember.user,
        },
      });
    }

    // Create new membership
    const member = await prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId: user.id,
        role,
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
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        workspaceId,
        actorId: session.user.id,
        actorType: 'USER',
        action: 'member.invite',
        entityType: 'WorkspaceMember',
        entityId: member.id,
        newValue: { email, role },
      },
    });

    // TODO: Send invitation email

    return NextResponse.json({
      member: {
        id: member.id,
        role: member.role,
        status: member.status,
        invitedAt: member.invitedAt,
        user: member.user,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error inviting member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
