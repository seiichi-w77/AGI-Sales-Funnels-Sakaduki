import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { WorkflowExecutionStatus } from '@prisma/client';

const updateExecutionSchema = z.object({
  status: z.enum(['RUNNING', 'COMPLETED', 'FAILED', 'CANCELED', 'WAITING']).optional(),
  currentStep: z.string().optional().nullable(),
  data: z.record(z.unknown()).optional(),
  error: z.string().optional().nullable(),
});

// GET /api/workflows/[workflowId]/executions/[executionId] - 実行詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string; executionId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { workflowId, executionId } = await params;

  try {
    const execution = await prisma.workflowExecution.findUnique({
      where: { id: executionId },
      include: {
        workflow: {
          include: {
            steps: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    });

    if (!execution) {
      return NextResponse.json({ error: 'Execution not found' }, { status: 404 });
    }

    if (execution.workflowId !== workflowId) {
      return NextResponse.json({ error: 'Execution does not belong to this workflow' }, { status: 400 });
    }

    return NextResponse.json({ execution });
  } catch (error) {
    console.error('Get workflow execution error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/workflows/[workflowId]/executions/[executionId] - 実行更新（内部用）
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string; executionId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { workflowId, executionId } = await params;

  try {
    const body = await request.json();
    const parsed = updateExecutionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existingExecution = await prisma.workflowExecution.findUnique({
      where: { id: executionId },
    });

    if (!existingExecution) {
      return NextResponse.json({ error: 'Execution not found' }, { status: 404 });
    }

    if (existingExecution.workflowId !== workflowId) {
      return NextResponse.json({ error: 'Execution does not belong to this workflow' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};

    if (parsed.data.status !== undefined) {
      updateData.status = parsed.data.status as WorkflowExecutionStatus;
      if (parsed.data.status === 'COMPLETED' || parsed.data.status === 'FAILED' || parsed.data.status === 'CANCELED') {
        updateData.completedAt = new Date();
      }
    }
    if (parsed.data.currentStep !== undefined) updateData.currentStep = parsed.data.currentStep;
    if (parsed.data.data !== undefined) updateData.data = parsed.data.data;
    if (parsed.data.error !== undefined) updateData.error = parsed.data.error;

    const execution = await prisma.workflowExecution.update({
      where: { id: executionId },
      data: updateData,
    });

    return NextResponse.json({ execution });
  } catch (error) {
    console.error('Update workflow execution error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/workflows/[workflowId]/executions/[executionId] - 実行キャンセル
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string; executionId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { workflowId, executionId } = await params;

  try {
    const execution = await prisma.workflowExecution.findUnique({
      where: { id: executionId },
    });

    if (!execution) {
      return NextResponse.json({ error: 'Execution not found' }, { status: 404 });
    }

    if (execution.workflowId !== workflowId) {
      return NextResponse.json({ error: 'Execution does not belong to this workflow' }, { status: 400 });
    }

    if (execution.status !== 'RUNNING' && execution.status !== 'WAITING') {
      return NextResponse.json({ error: 'Only running or waiting executions can be canceled' }, { status: 400 });
    }

    const updatedExecution = await prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        status: 'CANCELED',
        completedAt: new Date(),
      },
    });

    return NextResponse.json({ execution: updatedExecution });
  } catch (error) {
    console.error('Cancel workflow execution error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
