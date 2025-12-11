import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { Prisma } from '@prisma/client';

// POST /api/broadcasts/[broadcastId]/send - ブロードキャスト送信
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ broadcastId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { broadcastId } = await params;

  try {
    const broadcast = await prisma.emailCampaign.findUnique({
      where: { id: broadcastId },
    });

    if (!broadcast) {
      return NextResponse.json({ error: 'Broadcast not found' }, { status: 404 });
    }

    // 送信可能チェック
    if (broadcast.status !== 'DRAFT' && broadcast.status !== 'SCHEDULED') {
      return NextResponse.json(
        { error: 'Broadcast cannot be sent in its current status' },
        { status: 400 }
      );
    }

    if (!broadcast.subject) {
      return NextResponse.json(
        { error: 'Subject is required before sending' },
        { status: 400 }
      );
    }

    // 対象コンタクト取得
    const _audienceRules = broadcast.audienceRules as { filterType?: string; excludeUnsubscribed?: boolean } | null;
    const where: Prisma.ContactWhereInput = {
      workspaceId: broadcast.workspaceId,
      status: 'ACTIVE',
    };

    const contacts = await prisma.contact.findMany({
      where,
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    if (contacts.length === 0) {
      return NextResponse.json(
        { error: 'No recipients found for this broadcast' },
        { status: 400 }
      );
    }

    // ステータスを送信中に更新
    await prisma.emailCampaign.update({
      where: { id: broadcastId },
      data: {
        status: 'SENDING',
        sentAt: new Date(),
        totalSent: contacts.length,
      },
    });

    // 送信イベントを記録（実際の送信はバックグラウンドジョブで行う）
    for (const contact of contacts) {
      await prisma.emailEvent.create({
        data: {
          campaignId: broadcastId,
          contactId: contact.id,
          type: 'SENT',
          email: contact.email,
        },
      });
    }

    // コンタクトの最終メール日時を更新
    await prisma.contact.updateMany({
      where: {
        id: { in: contacts.map((c) => c.id) },
      },
      data: {
        lastActivityAt: new Date(),
      },
    });

    // 送信完了（実際はバックグラウンドで処理後に完了にする）
    await prisma.emailCampaign.update({
      where: { id: broadcastId },
      data: { status: 'SENT' },
    });

    // 監査ログ
    await prisma.auditLog.create({
      data: {
        workspaceId: broadcast.workspaceId,
        actorId: session.user?.id,
        actorType: 'USER',
        action: 'broadcast.send',
        entityType: 'EmailCampaign',
        entityId: broadcastId,
        metadata: {
          recipientCount: contacts.length,
        },
      },
    });

    return NextResponse.json({
      success: true,
      recipientCount: contacts.length,
      status: 'SENT',
    });
  } catch (error) {
    console.error('Send broadcast error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
