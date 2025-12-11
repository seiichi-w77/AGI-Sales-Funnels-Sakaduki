import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { Prisma, WorkflowStatus } from '@prisma/client';

// 開発環境用
const SKIP_AUTH_FOR_DEV = process.env.NODE_ENV === 'development';

const triggerSchema = z.object({
  type: z.enum(['OPTIN', 'PURCHASE', 'PAGE_VIEW', 'TAG_ADDED', 'TAG_REMOVED', 'FORM_SUBMIT']),
  config: z.record(z.unknown()).optional(),
});

const createWorkflowSchema = z.object({
  workspaceId: z.string(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  trigger: triggerSchema,
});

// GET /api/workflows - ワークフロー一覧取得
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session && !SKIP_AUTH_FOR_DEV) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const workspaceId = searchParams.get('workspaceId');
  const status = searchParams.get('status');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  if (!workspaceId) {
    return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 });
  }

  try {
    const where: Prisma.WorkflowWhereInput = { workspaceId };

    if (status) {
      where.status = status as WorkflowStatus;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [workflows, total] = await Promise.all([
      prisma.workflow.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: {
              steps: true,
              executions: true,
            },
          },
        },
      }),
      prisma.workflow.count({ where }),
    ]);

    // 各ワークフローの実行統計を取得
    const workflowsWithStats = await Promise.all(
      workflows.map(async (workflow) => {
        const [runningCount, completedCount, failedCount] = await Promise.all([
          prisma.workflowExecution.count({
            where: { workflowId: workflow.id, status: 'RUNNING' },
          }),
          prisma.workflowExecution.count({
            where: { workflowId: workflow.id, status: 'COMPLETED' },
          }),
          prisma.workflowExecution.count({
            where: { workflowId: workflow.id, status: 'FAILED' },
          }),
        ]);

        return {
          ...workflow,
          stepCount: workflow._count.steps,
          executionCount: workflow._count.executions,
          stats: {
            running: runningCount,
            completed: completedCount,
            failed: failedCount,
          },
        };
      })
    );

    return NextResponse.json({
      workflows: workflowsWithStats.map(({ _count, ...w }) => w),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get workflows error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/workflows - ワークフロー作成
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session && !SKIP_AUTH_FOR_DEV) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session?.user?.id || 'dev-test-user';

  try {
    const body = await request.json();
    const parsed = createWorkflowSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const workflow = await prisma.workflow.create({
      data: {
        workspaceId: parsed.data.workspaceId,
        name: parsed.data.name,
        description: parsed.data.description,
        trigger: parsed.data.trigger as Prisma.InputJsonValue,
        status: 'DRAFT',
        isActive: false,
      },
    });

    // 監査ログ作成
    await prisma.auditLog.create({
      data: {
        workspaceId: parsed.data.workspaceId,
        actorId: userId,
        actorType: 'USER',
        action: 'workflow.create',
        entityType: 'Workflow',
        entityId: workflow.id,
        metadata: { name: workflow.name },
      },
    });

    return NextResponse.json({ workflow }, { status: 201 });
  } catch (error) {
    console.error('Create workflow error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
