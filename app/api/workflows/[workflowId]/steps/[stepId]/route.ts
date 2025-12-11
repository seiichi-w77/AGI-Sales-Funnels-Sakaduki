import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { WorkflowStepType } from '@prisma/client';

const stepConfigSchema = z.object({
  emailCampaignId: z.string().optional(),
  emailSubject: z.string().optional(),
  emailContent: z.any().optional(),
  delayValue: z.number().optional(),
  delayUnit: z.enum(['minutes', 'hours', 'days']).optional(),
  tag: z.string().optional(),
  tags: z.array(z.string()).optional(),
  fields: z.record(z.unknown()).optional(),
  webhookUrl: z.string().optional(),
  webhookMethod: z.enum(['GET', 'POST', 'PUT', 'PATCH']).optional(),
  webhookHeaders: z.record(z.string()).optional(),
  webhookBody: z.any().optional(),
  targetWorkflowId: z.string().optional(),
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.enum(['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'is_empty', 'is_not_empty']),
    value: z.unknown(),
  })).optional(),
  conditionLogic: z.enum(['and', 'or']).optional(),
}).passthrough();

const updateStepSchema = z.object({
  type: z.enum(['SEND_EMAIL', 'DELAY', 'CONDITION', 'ADD_TAG', 'REMOVE_TAG', 'UPDATE_CONTACT', 'WEBHOOK', 'START_WORKFLOW', 'END']).optional(),
  config: stepConfigSchema.optional(),
  sortOrder: z.number().optional(),
  nextStepId: z.string().optional().nullable(),
  conditions: z.any().optional().nullable(),
});

// GET /api/workflows/[workflowId]/steps/[stepId] - ステップ詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string; stepId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { stepId } = await params;

  try {
    const step = await prisma.workflowStep.findUnique({
      where: { id: stepId },
      include: {
        workflow: true,
      },
    });

    if (!step) {
      return NextResponse.json({ error: 'Step not found' }, { status: 404 });
    }

    return NextResponse.json({ step });
  } catch (error) {
    console.error('Get workflow step error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/workflows/[workflowId]/steps/[stepId] - ステップ更新
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string; stepId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { workflowId, stepId } = await params;

  try {
    const body = await request.json();
    const parsed = updateStepSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existingStep = await prisma.workflowStep.findUnique({
      where: { id: stepId },
    });

    if (!existingStep) {
      return NextResponse.json({ error: 'Step not found' }, { status: 404 });
    }

    if (existingStep.workflowId !== workflowId) {
      return NextResponse.json({ error: 'Step does not belong to this workflow' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};

    if (parsed.data.type !== undefined) updateData.type = parsed.data.type as WorkflowStepType;
    if (parsed.data.config !== undefined) updateData.config = parsed.data.config;
    if (parsed.data.sortOrder !== undefined) updateData.sortOrder = parsed.data.sortOrder;
    if (parsed.data.nextStepId !== undefined) updateData.nextStepId = parsed.data.nextStepId;
    if (parsed.data.conditions !== undefined) updateData.conditions = parsed.data.conditions;

    const step = await prisma.workflowStep.update({
      where: { id: stepId },
      data: updateData,
    });

    // ワークフローのバージョンをインクリメント
    await prisma.workflow.update({
      where: { id: workflowId },
      data: { version: { increment: 1 } },
    });

    return NextResponse.json({ step });
  } catch (error) {
    console.error('Update workflow step error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/workflows/[workflowId]/steps/[stepId] - ステップ削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string; stepId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { workflowId, stepId } = await params;

  try {
    const step = await prisma.workflowStep.findUnique({
      where: { id: stepId },
    });

    if (!step) {
      return NextResponse.json({ error: 'Step not found' }, { status: 404 });
    }

    if (step.workflowId !== workflowId) {
      return NextResponse.json({ error: 'Step does not belong to this workflow' }, { status: 400 });
    }

    // このステップを参照している他のステップのnextStepIdを更新
    await prisma.workflowStep.updateMany({
      where: {
        workflowId,
        nextStepId: stepId,
      },
      data: {
        nextStepId: step.nextStepId,
      },
    });

    await prisma.workflowStep.delete({
      where: { id: stepId },
    });

    // ワークフローのバージョンをインクリメント
    await prisma.workflow.update({
      where: { id: workflowId },
      data: { version: { increment: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete workflow step error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
