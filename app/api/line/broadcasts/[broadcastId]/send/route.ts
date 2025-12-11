import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

// 開発環境用
const SKIP_AUTH_FOR_DEV = process.env.NODE_ENV === 'development';
const DEV_TEST_USER_ID = 'dev-test-user';

// POST /api/line/broadcasts/:broadcastId/send - 送信実行
export async function POST(
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
    // ブロードキャスト取得
    const broadcast = await prisma.lineBroadcast.findUnique({
      where: { id: broadcastId },
      include: {
        lineOfficialAccount: {
          select: {
            id: true,
            workspaceId: true,
            status: true,
            messagingAccessToken: true,
            monthlyMessageLimit: true,
            monthlyMessageUsed: true,
          },
        },
      },
    });

    if (!broadcast) {
      return NextResponse.json({ error: 'Broadcast not found' }, { status: 404 });
    }

    // ステータスチェック
    if (broadcast.status === 'SENT' || broadcast.status === 'SENDING') {
      return NextResponse.json(
        { error: 'このブロードキャストは既に送信済みまたは送信中です' },
        { status: 400 }
      );
    }

    // アカウント接続チェック
    if (broadcast.lineOfficialAccount.status !== 'CONNECTED') {
      return NextResponse.json(
        { error: 'LINEアカウントが接続されていません' },
        { status: 400 }
      );
    }

    // アクセストークンチェック
    if (!broadcast.lineOfficialAccount.messagingAccessToken) {
      return NextResponse.json(
        { error: 'Channel Access Tokenが設定されていません' },
        { status: 400 }
      );
    }

    // メッセージ上限チェック
    const account = broadcast.lineOfficialAccount;
    if (account.monthlyMessageUsed >= account.monthlyMessageLimit) {
      return NextResponse.json(
        { error: '今月のメッセージ上限に達しています' },
        { status: 400 }
      );
    }

    // ステータスを送信中に更新
    await prisma.lineBroadcast.update({
      where: { id: broadcastId },
      data: {
        status: 'SENDING',
        sentAt: new Date(),
      },
    });

    // TODO: 実際のLINE Messaging API送信処理
    // ここでは基本的なフレームワークのみ実装
    // 本番実装では以下を行う:
    // 1. 配信対象者リストを取得（conditionsに基づくフィルタリング）
    // 2. 重複排除（同一LINE友達IDへの重複配信防止）
    // 3. バッチ処理でLINE API呼び出し
    // 4. 配信結果を記録
    // 5. エラーがあれば LineBroadcastError に記録

    // デモ用: 即座に送信完了として更新
    const updatedBroadcast = await prisma.lineBroadcast.update({
      where: { id: broadcastId },
      data: {
        status: 'SENT',
        completedAt: new Date(),
        // デモ用の統計値（実際はAPI応答から取得）
        totalRecipients: 0,
        sentCount: 0,
        deliveredCount: 0,
      },
      select: {
        id: true,
        name: true,
        status: true,
        sentAt: true,
        completedAt: true,
        totalRecipients: true,
        sentCount: true,
      },
    });

    // 監査ログ
    await prisma.auditLog.create({
      data: {
        workspaceId: account.workspaceId,
        actorId: userId,
        actorType: 'USER',
        action: 'line_broadcast.send',
        entityType: 'LineBroadcast',
        entityId: broadcastId,
        metadata: {
          name: broadcast.name,
          totalRecipients: updatedBroadcast.totalRecipients,
        },
      },
    });

    return NextResponse.json({
      success: true,
      broadcast: updatedBroadcast,
      message: '送信処理を開始しました',
    });
  } catch (error) {
    console.error('Send broadcast error:', error);

    // エラー時はステータスをFAILEDに戻す
    await prisma.lineBroadcast.update({
      where: { id: broadcastId },
      data: { status: 'FAILED' },
    }).catch(() => {});

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
