import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { WorkflowStatus } from '@prisma/client';

const triggerSchema = z.object({
  type: z.enum(['OPTIN', 'PURCHASE', 'PAGE_VIEW', 'TAG_ADDED', 'TAG_REMOVED', 'FORM_SUBMIT']),
  config: z.record(z.unknown()).optional(),
});

const updateWorkflowSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  trigger: triggerSchema.optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED']).optional(),
  isActive: z.boolean().optional(),
});

// GET /api/workflows/[workflowId] - ワークフロー詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { workflowId } = await params;

  try {
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        steps: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            executions: true,
          },
        },
      },
    });

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    // 実行統計を取得
    const [runningCount, completedCount, failedCount, recentExecutions] = await Promise.all([
      prisma.workflowExecution.count({
        where: { workflowId, status: 'RUNNING' },
      }),
      prisma.workflowExecution.count({
        where: { workflowId, status: 'COMPLETED' },
      }),
      prisma.workflowExecution.count({
        where: { workflowId, status: 'FAILED' },
      }),
      prisma.workflowExecution.findMany({
        where: { workflowId },
        orderBy: { startedAt: 'desc' },
        take: 10,
      }),
    ]);

    return NextResponse.json({
      workflow: {
        ...workflow,
        executionCount: workflow._count.executions,
        stats: {
          running: runningCount,
          completed: completedCount,
          failed: failedCount,
        },
        recentExecutions,
      },
    });
  } catch (error) {
    console.error('Get workflow error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/workflows/[workflowId] - ワークフロー更新
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { workflowId } = await params;

  try {
    const body = await request.json();
    const parsed = updateWorkflowSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existingWorkflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!existingWorkflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
    if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
    if (parsed.data.trigger !== undefined) updateData.trigger = parsed.data.trigger;
    if (parsed.data.status !== undefined) updateData.status = parsed.data.status as WorkflowStatus;
    if (parsed.data.isActive !== undefined) {
      updateData.isActive = parsed.data.isActive;
      // isActiveがtrueになる場合、ステータスをACTIVEに
      if (parsed.data.isActive && existingWorkflow.status === 'DRAFT') {
        updateData.status = 'ACTIVE';
      }
      // isActiveがfalseになる場合、ステータスをPAUSEDに
      if (!parsed.data.isActive && existingWorkflow.status === 'ACTIVE') {
        updateData.status = 'PAUSED';
      }
    }

    const workflow = await prisma.workflow.update({
      where: { id: workflowId },
      data: updateData,
      include: {
        steps: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    // 監査ログ作成
    await prisma.auditLog.create({
      data: {
        workspaceId: workflow.workspaceId,
        actorId: session.user?.id,
        actorType: 'USER',
        action: 'workflow.update',
        entityType: 'Workflow',
        entityId: workflow.id,
        oldValue: existingWorkflow,
        newValue: workflow,
      },
    });

    return NextResponse.json({ workflow });
  } catch (error) {
    console.error('Update workflow error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/workflows/[workflowId] - ワークフロー削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { workflowId } = await params;

  try {
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        _count: {
          select: { executions: true },
        },
      },
    });

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    // 実行中のワークフローがある場合は削除不可
    const runningExecutions = await prisma.workflowExecution.count({
      where: { workflowId, status: 'RUNNING' },
    });

    if (runningExecutions > 0) {
      return NextResponse.json(
        { error: 'Cannot delete workflow with running executions' },
        { status: 400 }
      );
    }

    await prisma.workflow.delete({
      where: { id: workflowId },
    });

    // 監査ログ作成
    await prisma.auditLog.create({
      data: {
        workspaceId: workflow.workspaceId,
        actorId: session.user?.id,
        actorType: 'USER',
        action: 'workflow.delete',
        entityType: 'Workflow',
        entityId: workflowId,
        metadata: { name: workflow.name },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete workflow error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
