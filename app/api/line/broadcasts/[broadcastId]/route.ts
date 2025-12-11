import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { Prisma } from '@prisma/client';

// 開発環境用
const SKIP_AUTH_FOR_DEV = process.env.NODE_ENV === 'development';
const DEV_TEST_USER_ID = 'dev-test-user';

// 更新スキーマ
const updateBroadcastSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  messages: z.array(z.object({
    type: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'STICKER', 'TEMPLATE', 'FLEX']),
    content: z.record(z.unknown()),
  })).min(1).max(5).optional(),
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.enum(['equals', 'contains', 'greater_than', 'less_than', 'in', 'not_in']),
    value: z.union([z.string(), z.number(), z.array(z.string()), z.array(z.number())]),
    logicOperator: z.enum(['AND', 'OR']).optional(),
  })).optional(),
  scheduledAt: z.string().datetime().nullable().optional(),
});

// GET /api/line/broadcasts/:broadcastId - 詳細取得
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ broadcastId: string }> }
) {
  const session = await auth();
  if (!session && !SKIP_AUTH_FOR_DEV) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { broadcastId } = await params;

  try {
    const broadcast = await prisma.lineBroadcast.findUnique({
      where: { id: broadcastId },
      include: {
        lineOfficialAccount: {
          select: {
            id: true,
            name: true,
            workspaceId: true,
          },
        },
        errors: {
          select: {
            id: true,
            lineUserId: true,
            errorCode: true,
            errorMessage: true,
            errorCategory: true,
            status: true,
            retryCount: true,
            createdAt: true,
          },
          take: 100,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!broadcast) {
      return NextResponse.json({ error: 'Broadcast not found' }, { status: 404 });
    }

    return NextResponse.json({ broadcast });
  } catch (error) {
    console.error('Get broadcast error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/line/broadcasts/:broadcastId - 更新
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ broadcastId: string }> }
) {
  const session = await auth();
  if (!session && !SKIP_AUTH_FOR_DEV) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session?.user?.id || DEV_TEST_USER_ID;
  const { broadcastId } = await params;

  try {
    const body = await req.json();
    const parsed = updateBroadcastSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation error', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // 既存ブロードキャスト確認
    const existing = await prisma.lineBroadcast.findUnique({
      where: { id: broadcastId },
      include: {
        lineOfficialAccount: {
          select: { workspaceId: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Broadcast not found' }, { status: 404 });
    }

    // 送信済み/送信中は編集不可
    if (existing.status === 'SENT' || existing.status === 'SENDING') {
      return NextResponse.json(
        { error: '送信済みまたは送信中のブロードキャストは編集できません' },
        { status: 400 }
      );
    }

    // 更新データを構築
    const updateData: Prisma.LineBroadcastUpdateInput = {
      updatedAt: new Date(),
    };

    if (parsed.data.name) {
      updateData.name = parsed.data.name;
    }
    if (parsed.data.messages) {
      updateData.messages = parsed.data.messages as Prisma.InputJsonValue;
    }
    if (parsed.data.conditions !== undefined) {
      updateData.conditions = (parsed.data.conditions as Prisma.InputJsonValue) || Prisma.JsonNull;
    }
    if (parsed.data.scheduledAt !== undefined) {
      updateData.scheduledAt = parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : null;
    }

    // 更新
    const broadcast = await prisma.lineBroadcast.update({
      where: { id: broadcastId },
      data: updateData,
      select: {
        id: true,
        name: true,
        status: true,
        scheduledAt: true,
        updatedAt: true,
      },
    });

    // 監査ログ
    await prisma.auditLog.create({
      data: {
        workspaceId: existing.lineOfficialAccount.workspaceId,
        actorId: userId,
        actorType: 'USER',
        action: 'line_broadcast.update',
        entityType: 'LineBroadcast',
        entityId: broadcastId,
        metadata: { fields: Object.keys(parsed.data) },
      },
    });

    return NextResponse.json({ broadcast });
  } catch (error) {
    console.error('Update broadcast error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/line/broadcasts/:broadcastId - 削除
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ broadcastId: string }> }
) {
  const session = await auth();
  if (!session && !SKIP_AUTH_FOR_DEV) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session?.user?.id || DEV_TEST_USER_ID;
  const { broadcastId } = await params;

  try {
    const broadcast = await prisma.lineBroadcast.findUnique({
      where: { id: broadcastId },
      include: {
        lineOfficialAccount: {
          select: { workspaceId: true },
        },
      },
    });

    if (!broadcast) {
      return NextResponse.json({ error: 'Broadcast not found' }, { status: 404 });
    }

    // 送信中は削除不可
    if (broadcast.status === 'SENDING') {
      return NextResponse.json(
        { error: '送信中のブロードキャストは削除できません' },
        { status: 400 }
      );
    }

    // 削除
    await prisma.lineBroadcast.delete({
      where: { id: broadcastId },
    });

    // 監査ログ
    await prisma.auditLog.create({
      data: {
        workspaceId: broadcast.lineOfficialAccount.workspaceId,
        actorId: userId,
        actorType: 'USER',
        action: 'line_broadcast.delete',
        entityType: 'LineBroadcast',
        entityId: broadcastId,
        metadata: { name: broadcast.name },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete broadcast error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
