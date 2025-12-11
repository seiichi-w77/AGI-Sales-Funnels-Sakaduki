import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

// 開発環境用
const SKIP_AUTH_FOR_DEV = process.env.NODE_ENV === 'development';
const DEV_TEST_USER_ID = 'dev-test-user';

// 更新スキーマ
const updateAccountSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  providerName: z.string().min(1).max(100).optional(),
  messagingChannelSecret: z.string().min(1).optional(),
  messagingAccessToken: z.string().optional(),
  loginChannelId: z.string().optional(),
  loginChannelSecret: z.string().optional(),
  monthlyMessageLimit: z.number().int().positive().optional(),
  webhookEnabled: z.boolean().optional(),
});

// GET /api/line/official-accounts/:accountId - 詳細取得
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  const session = await auth();
  if (!session && !SKIP_AUTH_FOR_DEV) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { accountId } = await params;

  try {
    const account = await prisma.lineOfficialAccount.findUnique({
      where: { id: accountId },
      select: {
        id: true,
        workspaceId: true,
        name: true,
        providerName: true,
        messagingChannelId: true,
        // Channel Secretは一部マスク
        messagingChannelSecret: true,
        loginChannelId: true,
        loginChannelSecret: true,
        webhookUrl: true,
        webhookEnabled: true,
        webhookVerified: true,
        basicId: true,
        pictureUrl: true,
        friendCount: true,
        monthlyMessageLimit: true,
        monthlyMessageUsed: true,
        messageUsageResetAt: true,
        status: true,
        connectedAt: true,
        lastSyncedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // シークレットをマスク
    const maskedAccount = {
      ...account,
      messagingChannelSecret: account.messagingChannelSecret
        ? '••••••••' + account.messagingChannelSecret.slice(-4)
        : null,
      loginChannelSecret: account.loginChannelSecret
        ? '••••••••' + account.loginChannelSecret.slice(-4)
        : null,
    };

    return NextResponse.json({ account: maskedAccount });
  } catch (error) {
    console.error('Get LINE official account error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/line/official-accounts/:accountId - 更新
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  const session = await auth();
  if (!session && !SKIP_AUTH_FOR_DEV) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session?.user?.id || DEV_TEST_USER_ID;
  const { accountId } = await params;

  try {
    const body = await req.json();
    const parsed = updateAccountSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation error', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // アカウント存在確認
    const existingAccount = await prisma.lineOfficialAccount.findUnique({
      where: { id: accountId },
    });

    if (!existingAccount) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // loginChannelIdの重複チェック
    if (parsed.data.loginChannelId) {
      const duplicateLogin = await prisma.lineOfficialAccount.findFirst({
        where: {
          loginChannelId: parsed.data.loginChannelId,
          id: { not: accountId },
        },
      });

      if (duplicateLogin) {
        return NextResponse.json(
          { error: 'このLogin Channel IDは既に登録されています' },
          { status: 400 }
        );
      }
    }

    // 更新
    const updatedAccount = await prisma.lineOfficialAccount.update({
      where: { id: accountId },
      data: {
        ...parsed.data,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        providerName: true,
        webhookEnabled: true,
        status: true,
        updatedAt: true,
      },
    });

    // 監査ログ
    await prisma.auditLog.create({
      data: {
        workspaceId: existingAccount.workspaceId,
        actorId: userId,
        actorType: 'USER',
        action: 'line_account.update',
        entityType: 'LineOfficialAccount',
        entityId: accountId,
        metadata: { fields: Object.keys(parsed.data) },
      },
    });

    return NextResponse.json({ account: updatedAccount });
  } catch (error) {
    console.error('Update LINE official account error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/line/official-accounts/:accountId - 削除
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  const session = await auth();
  if (!session && !SKIP_AUTH_FOR_DEV) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session?.user?.id || DEV_TEST_USER_ID;
  const { accountId } = await params;

  try {
    const account = await prisma.lineOfficialAccount.findUnique({
      where: { id: accountId },
      select: { id: true, workspaceId: true, name: true },
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // 削除
    await prisma.lineOfficialAccount.delete({
      where: { id: accountId },
    });

    // 監査ログ
    await prisma.auditLog.create({
      data: {
        workspaceId: account.workspaceId,
        actorId: userId,
        actorType: 'USER',
        action: 'line_account.delete',
        entityType: 'LineOfficialAccount',
        entityId: accountId,
        metadata: { name: account.name },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete LINE official account error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
