import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { Prisma } from '@prisma/client';

const executeWorkflowSchema = z.object({
  contactId: z.string().optional(),
  data: z.record(z.unknown()).optional(),
});

// POST /api/workflows/[workflowId]/execute - ワークフロー実行開始
export async function POST(
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
    const parsed = executeWorkflowSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        steps: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    if (!workflow.isActive) {
      return NextResponse.json({ error: 'Workflow is not active' }, { status: 400 });
    }

    if (workflow.steps.length === 0) {
      return NextResponse.json({ error: 'Workflow has no steps' }, { status: 400 });
    }

    // 最初のステップを取得
    const firstStep = workflow.steps[0];

    // 実行レコードを作成
    const execution = await prisma.workflowExecution.create({
      data: {
        workflowId,
        contactId: parsed.data.contactId,
        status: 'RUNNING',
        currentStep: firstStep.id,
        data: (parsed.data.data || {}) as Prisma.InputJsonValue,
      },
    });

    // 監査ログ作成
    await prisma.auditLog.create({
      data: {
        workspaceId: workflow.workspaceId,
        actorId: session.user?.id,
        actorType: 'USER',
        action: 'workflow.execute',
        entityType: 'WorkflowExecution',
        entityId: execution.id,
        metadata: {
          workflowId,
          contactId: parsed.data.contactId,
        },
      },
    });

    return NextResponse.json({ execution }, { status: 201 });
  } catch (error) {
    console.error('Execute workflow error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
