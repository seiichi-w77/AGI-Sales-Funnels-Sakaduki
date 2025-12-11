import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

// 開発環境用
const SKIP_AUTH_FOR_DEV = process.env.NODE_ENV === 'development';
const DEV_TEST_USER_ID = 'dev-test-user';

// バリデーションスキーマ
const createAccountSchema = z.object({
  workspaceId: z.string().min(1),
  name: z.string().min(1).max(100),
  providerName: z.string().min(1).max(100),
  messagingChannelId: z.string().min(1),
  messagingChannelSecret: z.string().min(1),
  messagingAccessToken: z.string().optional(),
  loginChannelId: z.string().optional(),
  loginChannelSecret: z.string().optional(),
  monthlyMessageLimit: z.number().int().positive().optional(),
});

// 認証情報の一意性チェック
function validateCredentialUniqueness(data: z.infer<typeof createAccountSchema>): string[] {
  const credentials = [
    data.messagingChannelId,
    data.messagingChannelSecret,
    data.loginChannelId,
    data.loginChannelSecret,
  ].filter(Boolean);

  const uniqueCredentials = new Set(credentials);
  const duplicates: string[] = [];

  if (credentials.length !== uniqueCredentials.size) {
    // 重複があれば特定
    const seen = new Set<string>();
    for (const cred of credentials) {
      if (cred && seen.has(cred)) {
        duplicates.push(cred.substring(0, 10) + '...');
      }
      if (cred) seen.add(cred);
    }
  }

  return duplicates;
}

// Webhook URL生成
function generateWebhookUrl(accountId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3001';
  return `${baseUrl}/api/line/webhook/${accountId}`;
}

// GET /api/line/official-accounts - 一覧取得
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session && !SKIP_AUTH_FOR_DEV) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const workspaceId = searchParams.get('workspaceId');

  if (!workspaceId) {
    return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 });
  }

  try {
    const accounts = await prisma.lineOfficialAccount.findMany({
      where: { workspaceId },
      select: {
        id: true,
        name: true,
        providerName: true,
        basicId: true,
        pictureUrl: true,
        friendCount: true,
        monthlyMessageLimit: true,
        monthlyMessageUsed: true,
        status: true,
        webhookEnabled: true,
        webhookVerified: true,
        connectedAt: true,
        lastSyncedAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error('Get LINE official accounts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/line/official-accounts - 新規作成
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session && !SKIP_AUTH_FOR_DEV) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session?.user?.id || DEV_TEST_USER_ID;

  try {
    const body = await req.json();
    const parsed = createAccountSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation error', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // 認証情報の一意性チェック
    const duplicates = validateCredentialUniqueness(parsed.data);
    if (duplicates.length > 0) {
      return NextResponse.json(
        { error: '認証情報が重複しています。4つの認証情報はすべて異なる値である必要があります。', duplicates },
        { status: 400 }
      );
    }

    // Channel IDの重複チェック（既存アカウント）
    const existingAccount = await prisma.lineOfficialAccount.findFirst({
      where: {
        OR: [
          { messagingChannelId: parsed.data.messagingChannelId },
          ...(parsed.data.loginChannelId ? [{ loginChannelId: parsed.data.loginChannelId }] : []),
        ],
      },
    });

    if (existingAccount) {
      return NextResponse.json(
        { error: 'このChannel IDは既に登録されています' },
        { status: 400 }
      );
    }

    // アカウント作成
    const account = await prisma.lineOfficialAccount.create({
      data: {
        workspaceId: parsed.data.workspaceId,
        name: parsed.data.name,
        providerName: parsed.data.providerName,
        messagingChannelId: parsed.data.messagingChannelId,
        messagingChannelSecret: parsed.data.messagingChannelSecret,
        messagingAccessToken: parsed.data.messagingAccessToken,
        loginChannelId: parsed.data.loginChannelId,
        loginChannelSecret: parsed.data.loginChannelSecret,
        monthlyMessageLimit: parsed.data.monthlyMessageLimit || 200,
        status: 'PENDING',
      },
    });

    // Webhook URL生成
    const webhookUrl = generateWebhookUrl(account.id);
    await prisma.lineOfficialAccount.update({
      where: { id: account.id },
      data: { webhookUrl },
    });

    // 監査ログ
    await prisma.auditLog.create({
      data: {
        workspaceId: parsed.data.workspaceId,
        actorId: userId,
        actorType: 'USER',
        action: 'line_account.create',
        entityType: 'LineOfficialAccount',
        entityId: account.id,
        metadata: { name: account.name },
      },
    });

    return NextResponse.json(
      {
        account: {
          id: account.id,
          name: account.name,
          providerName: account.providerName,
          webhookUrl,
          status: account.status,
          createdAt: account.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create LINE official account error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
