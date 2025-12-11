import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { Prisma, WorkflowExecutionStatus } from '@prisma/client';

// GET /api/workflows/[workflowId]/executions - 実行履歴一覧取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { workflowId } = await params;
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status');
  const contactId = searchParams.get('contactId');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  try {
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    const where: Prisma.WorkflowExecutionWhereInput = { workflowId };

    if (status) {
      where.status = status as WorkflowExecutionStatus;
    }

    if (contactId) {
      where.contactId = contactId;
    }

    const [executions, total] = await Promise.all([
      prisma.workflowExecution.findMany({
        where,
        orderBy: { startedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.workflowExecution.count({ where }),
    ]);

    // 統計情報を取得
    const [runningCount, completedCount, failedCount, waitingCount] = await Promise.all([
      prisma.workflowExecution.count({ where: { workflowId, status: 'RUNNING' } }),
      prisma.workflowExecution.count({ where: { workflowId, status: 'COMPLETED' } }),
      prisma.workflowExecution.count({ where: { workflowId, status: 'FAILED' } }),
      prisma.workflowExecution.count({ where: { workflowId, status: 'WAITING' } }),
    ]);

    return NextResponse.json({
      executions,
      stats: {
        running: runningCount,
        completed: completedCount,
        failed: failedCount,
        waiting: waitingCount,
        total: runningCount + completedCount + failedCount + waitingCount,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get workflow executions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
