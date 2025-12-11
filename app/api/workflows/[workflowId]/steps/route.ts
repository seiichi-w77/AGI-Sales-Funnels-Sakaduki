import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { WorkflowStepType, Prisma } from '@prisma/client';

const stepConfigSchema = z.object({
  // SEND_EMAIL config
  emailCampaignId: z.string().optional(),
  emailSubject: z.string().optional(),
  emailContent: z.any().optional(),
  // DELAY config
  delayValue: z.number().optional(),
  delayUnit: z.enum(['minutes', 'hours', 'days']).optional(),
  // ADD_TAG / REMOVE_TAG config
  tag: z.string().optional(),
  tags: z.array(z.string()).optional(),
  // UPDATE_CONTACT config
  fields: z.record(z.unknown()).optional(),
  // WEBHOOK config
  webhookUrl: z.string().optional(),
  webhookMethod: z.enum(['GET', 'POST', 'PUT', 'PATCH']).optional(),
  webhookHeaders: z.record(z.string()).optional(),
  webhookBody: z.any().optional(),
  // START_WORKFLOW config
  targetWorkflowId: z.string().optional(),
  // CONDITION config
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.enum(['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'is_empty', 'is_not_empty']),
    value: z.unknown(),
  })).optional(),
  conditionLogic: z.enum(['and', 'or']).optional(),
}).passthrough();

const createStepSchema = z.object({
  type: z.enum(['SEND_EMAIL', 'DELAY', 'CONDITION', 'ADD_TAG', 'REMOVE_TAG', 'UPDATE_CONTACT', 'WEBHOOK', 'START_WORKFLOW', 'END']),
  config: stepConfigSchema,
  nextStepId: z.string().optional().nullable(),
  conditions: z.any().optional(),
});

const reorderStepsSchema = z.object({
  stepIds: z.array(z.string()),
});

// GET /api/workflows/[workflowId]/steps - ステップ一覧取得
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
    });

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    const steps = await prisma.workflowStep.findMany({
      where: { workflowId },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ steps });
  } catch (error) {
    console.error('Get workflow steps error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/workflows/[workflowId]/steps - ステップ作成
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
    const parsed = createStepSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    // 最大のsortOrderを取得
    const lastStep = await prisma.workflowStep.findFirst({
      where: { workflowId },
      orderBy: { sortOrder: 'desc' },
    });

    const sortOrder = (lastStep?.sortOrder ?? -1) + 1;

    const step = await prisma.workflowStep.create({
      data: {
        workflowId,
        type: parsed.data.type as WorkflowStepType,
        config: parsed.data.config as Prisma.InputJsonValue,
        sortOrder,
        nextStepId: parsed.data.nextStepId,
        conditions: parsed.data.conditions as Prisma.InputJsonValue | undefined,
      },
    });

    // ワークフローのバージョンをインクリメント
    await prisma.workflow.update({
      where: { id: workflowId },
      data: { version: { increment: 1 } },
    });

    return NextResponse.json({ step }, { status: 201 });
  } catch (error) {
    console.error('Create workflow step error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/workflows/[workflowId]/steps - ステップ順序変更
export async function PUT(
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
    const parsed = reorderStepsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    // トランザクションでステップの順序を更新
    await prisma.$transaction(
      parsed.data.stepIds.map((stepId, index) =>
        prisma.workflowStep.update({
          where: { id: stepId },
          data: { sortOrder: index },
        })
      )
    );

    // ワークフローのバージョンをインクリメント
    await prisma.workflow.update({
      where: { id: workflowId },
      data: { version: { increment: 1 } },
    });

    const steps = await prisma.workflowStep.findMany({
      where: { workflowId },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ steps });
  } catch (error) {
    console.error('Reorder workflow steps error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
