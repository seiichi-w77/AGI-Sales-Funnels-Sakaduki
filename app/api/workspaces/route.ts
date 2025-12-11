import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  slug: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .optional(),
});

// Generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}

// 開発環境用テストユーザーID
const DEV_TEST_USER_ID = 'dev-test-user';
const SKIP_AUTH_FOR_DEV = process.env.NODE_ENV === 'development';

// List user's workspaces
export async function GET() {
  try {
    const session = await auth();

    // 開発環境で認証がない場合はテストユーザーを使用
    const userId = session?.user?.id || (SKIP_AUTH_FOR_DEV ? DEV_TEST_USER_ID : null);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // テストユーザーの場合、ユーザーとワークスペースを自動作成
    if (userId === DEV_TEST_USER_ID) {
      let testUser = await prisma.user.findUnique({ where: { id: DEV_TEST_USER_ID } });
      if (!testUser) {
        testUser = await prisma.user.create({
          data: {
            id: DEV_TEST_USER_ID,
            email: 'dev-test@example.com',
            firstName: 'Dev',
            lastName: 'Test',
            passwordHash: 'not-a-real-hash',
          },
        });
        // テストワークスペースも作成
        await prisma.workspace.create({
          data: {
            name: 'Dev Workspace',
            slug: `dev-workspace-${Date.now()}`,
            ownerId: DEV_TEST_USER_ID,
            members: {
              create: {
                userId: DEV_TEST_USER_ID,
                role: 'OWNER',
                status: 'ACTIVE',
                joinedAt: new Date(),
              },
            },
          },
        });
      }
    }

    const workspaces = await prisma.workspace.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId: userId,
                status: 'ACTIVE',
              },
            },
          },
        ],
      },
      include: {
        _count: {
          select: {
            members: true,
            funnels: true,
            contacts: true,
          },
        },
        members: {
          where: { userId: userId },
          select: { role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedWorkspaces = workspaces.map((workspace) => ({
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      description: workspace.description,
      logoUrl: workspace.logoUrl,
      role: workspace.ownerId === userId ? 'OWNER' : workspace.members[0]?.role || 'MEMBER',
      members: workspace._count.members,
      funnels: workspace._count.funnels,
      contacts: workspace._count.contacts,
      createdAt: workspace.createdAt,
    }));

    return NextResponse.json({ workspaces: formattedWorkspaces });
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create workspace
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // 開発環境で認証がない場合はテストユーザーを使用
    const userId = session?.user?.id || (SKIP_AUTH_FOR_DEV ? DEV_TEST_USER_ID : null);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // テストユーザーが存在しない場合は作成
    if (userId === DEV_TEST_USER_ID) {
      const testUser = await prisma.user.findUnique({ where: { id: DEV_TEST_USER_ID } });
      if (!testUser) {
        await prisma.user.create({
          data: {
            id: DEV_TEST_USER_ID,
            email: 'dev-test@example.com',
            firstName: 'Dev',
            lastName: 'Test',
            passwordHash: 'not-a-real-hash',
          },
        });
      }
    }

    const body = await request.json();
    const validatedData = createWorkspaceSchema.parse(body);

    // Generate slug if not provided
    let slug = validatedData.slug || generateSlug(validatedData.name);

    // Check if slug is unique
    const existingWorkspace = await prisma.workspace.findUnique({
      where: { slug },
    });

    if (existingWorkspace) {
      // Append random suffix
      slug = `${slug}-${Math.random().toString(36).substring(2, 8)}`;
    }

    // Create workspace with owner as first member
    const workspace = await prisma.workspace.create({
      data: {
        name: validatedData.name,
        slug,
        description: validatedData.description,
        ownerId: userId,
        members: {
          create: {
            userId: userId,
            role: 'OWNER',
            status: 'ACTIVE',
            joinedAt: new Date(),
          },
        },
      },
      include: {
        _count: {
          select: {
            members: true,
            funnels: true,
            contacts: true,
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        workspaceId: workspace.id,
        actorId: userId,
        actorType: 'USER',
        action: 'workspace.create',
        entityType: 'Workspace',
        entityId: workspace.id,
        newValue: { name: workspace.name, slug: workspace.slug },
      },
    });

    return NextResponse.json({
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        description: workspace.description,
        role: 'OWNER',
        members: workspace._count.members,
        funnels: workspace._count.funnels,
        contacts: workspace._count.contacts,
        createdAt: workspace.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating workspace:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
