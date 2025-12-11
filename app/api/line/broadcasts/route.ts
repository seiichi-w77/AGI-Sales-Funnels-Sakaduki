import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { Prisma } from '@prisma/client';

// 開発環境用
const SKIP_AUTH_FOR_DEV = process.env.NODE_ENV === 'development';
const DEV_TEST_USER_ID = 'dev-test-user';

// メッセージスキーマ
const messageSchema = z.object({
  type: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'STICKER', 'TEMPLATE', 'FLEX']),
  content: z.record(z.unknown()), // メッセージタイプに応じた内容
});

// 配信条件スキーマ
const conditionSchema = z.object({
  field: z.string(),
  operator: z.enum(['equals', 'contains', 'greater_than', 'less_than', 'in', 'not_in']),
  value: z.union([z.string(), z.number(), z.array(z.string()), z.array(z.number())]),
  logicOperator: z.enum(['AND', 'OR']).optional(),
});

// 作成スキーマ
const createBroadcastSchema = z.object({
  lineOfficialAccountId: z.string().min(1),
  name: z.string().min(1).max(100),
  messages: z.array(messageSchema).min(1).max(5), // 最大5メッセージ
  conditions: z.array(conditionSchema).optional(),
  scheduledAt: z.string().datetime().optional(),
});

// GET /api/line/broadcasts - 一覧取得
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session && !SKIP_AUTH_FOR_DEV) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const workspaceId = searchParams.get('workspaceId');
  const accountId = searchParams.get('accountId');
  const status = searchParams.get('status');

  if (!workspaceId) {
    return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 });
  }

  try {
    // ワークスペースに紐づくアカウントのブロードキャストを取得
    const broadcasts = await prisma.lineBroadcast.findMany({
      where: {
        lineOfficialAccount: {
          workspaceId,
          ...(accountId ? { id: accountId } : {}),
        },
        ...(status ? { status: status as 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'FAILED' | 'CANCELLED' } : {}),
      },
      select: {
        id: true,
        name: true,
        status: true,
        totalRecipients: true,
        sentCount: true,
        deliveredCount: true,
        failedCount: true,
        openedCount: true,
        clickedCount: true,
        scheduledAt: true,
        sentAt: true,
        completedAt: true,
        createdAt: true,
        updatedAt: true,
        lineOfficialAccount: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ broadcasts });
  } catch (error) {
    console.error('Get broadcasts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/line/broadcasts - 新規作成
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session && !SKIP_AUTH_FOR_DEV) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session?.user?.id || DEV_TEST_USER_ID;

  try {
    const body = await req.json();
    const parsed = createBroadcastSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation error', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // アカウント存在確認
    const account = await prisma.lineOfficialAccount.findUnique({
      where: { id: parsed.data.lineOfficialAccountId },
      select: { id: true, workspaceId: true, status: true },
    });

    if (!account) {
      return NextResponse.json({ error: 'LINE account not found' }, { status: 404 });
    }

    if (account.status !== 'CONNECTED') {
      return NextResponse.json({ error: 'LINE account is not connected' }, { status: 400 });
    }

    // 配信タイミングの決定
    const scheduledAt = parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : null;
    const status = scheduledAt && scheduledAt > new Date() ? 'SCHEDULED' : 'DRAFT';

    // ブロードキャスト作成
    const broadcast = await prisma.lineBroadcast.create({
      data: {
        lineOfficialAccountId: parsed.data.lineOfficialAccountId,
        name: parsed.data.name,
        messages: parsed.data.messages as Prisma.InputJsonValue,
        conditions: (parsed.data.conditions as Prisma.InputJsonValue) || Prisma.JsonNull,
        status,
        scheduledAt,
      },
      select: {
        id: true,
        name: true,
        status: true,
        scheduledAt: true,
        createdAt: true,
      },
    });

    // 監査ログ
    await prisma.auditLog.create({
      data: {
        workspaceId: account.workspaceId,
        actorId: userId,
        actorType: 'USER',
        action: 'line_broadcast.create',
        entityType: 'LineBroadcast',
        entityId: broadcast.id,
        metadata: { name: broadcast.name, status: broadcast.status },
      },
    });

    return NextResponse.json({ broadcast }, { status: 201 });
  } catch (error) {
    console.error('Create broadcast error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
