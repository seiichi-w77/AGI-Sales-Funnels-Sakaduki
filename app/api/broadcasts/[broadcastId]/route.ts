import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { Prisma} from '@prisma/client';

const updateBroadcastSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  subject: z.string().optional(),
  preheader: z.string().optional(),
  fromName: z.string().optional(),
  fromEmail: z.string().email().optional(),
  replyTo: z.string().email().optional(),
  content: z.any().optional(),
  contentText: z.string().optional(),
  audienceRules: z.any().optional(),
  scheduledAt: z.string().datetime().optional().nullable(),
});

// GET /api/broadcasts/[broadcastId] - ブロードキャスト詳細取得
export async function GET(
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

    // イベント統計
    const eventStats = await prisma.emailEvent.groupBy({
      by: ['type'],
      where: { campaignId: broadcastId },
      _count: true,
    });

    // 推定受信者数
    let estimatedRecipients = 0;
    if (broadcast.audienceRules) {
      const rules = broadcast.audienceRules as { filterType?: string; excludeUnsubscribed?: boolean };
      const where: Prisma.ContactWhereInput = {
        workspaceId: broadcast.workspaceId,
      };

      if (rules.excludeUnsubscribed !== false) {
        where.status = 'ACTIVE';
      }

      estimatedRecipients = await prisma.contact.count({ where });
    } else {
      estimatedRecipients = await prisma.contact.count({
        where: {
          workspaceId: broadcast.workspaceId,
          status: 'ACTIVE',
        },
      });
    }

    const stats = eventStats.reduce((acc, e) => {
      acc[e.type.toLowerCase()] = e._count;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      broadcast: {
        ...broadcast,
        stats: {
          sent: broadcast.totalSent,
          opened: broadcast.totalOpened,
          clicked: broadcast.totalClicked,
          bounced: broadcast.totalBounced,
          ...stats,
        },
        estimatedRecipients,
        openRate: broadcast.totalSent > 0
          ? ((broadcast.totalOpened / broadcast.totalSent) * 100).toFixed(1)
          : 0,
        clickRate: broadcast.totalSent > 0
          ? ((broadcast.totalClicked / broadcast.totalSent) * 100).toFixed(1)
          : 0,
      },
    });
  } catch (error) {
    console.error('Get broadcast error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/broadcasts/[broadcastId] - ブロードキャスト更新
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ broadcastId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { broadcastId } = await params;

  try {
    const body = await request.json();
    const parsed = updateBroadcastSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.emailCampaign.findUnique({
      where: { id: broadcastId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Broadcast not found' }, { status: 404 });
    }

    // 送信済みは編集不可
    if (existing.status === 'SENT' || existing.status === 'SENDING') {
      return NextResponse.json(
        { error: 'Cannot edit a broadcast that has been sent or is sending' },
        { status: 400 }
      );
    }

    const updateData: Prisma.EmailCampaignUpdateInput = {};

    if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
    if (parsed.data.subject !== undefined) updateData.subject = parsed.data.subject;
    if (parsed.data.preheader !== undefined) updateData.preheader = parsed.data.preheader;
    if (parsed.data.fromName !== undefined) updateData.fromName = parsed.data.fromName;
    if (parsed.data.fromEmail !== undefined) updateData.fromEmail = parsed.data.fromEmail;
    if (parsed.data.replyTo !== undefined) updateData.replyTo = parsed.data.replyTo;
    if (parsed.data.content !== undefined) updateData.content = parsed.data.content as Prisma.InputJsonValue;
    if (parsed.data.contentText !== undefined) updateData.contentText = parsed.data.contentText;
    if (parsed.data.audienceRules !== undefined) updateData.audienceRules = parsed.data.audienceRules as Prisma.InputJsonValue;
    if (parsed.data.scheduledAt !== undefined) {
      updateData.scheduledAt = parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : null;
      if (parsed.data.scheduledAt) {
        updateData.status = 'SCHEDULED';
      } else {
        updateData.status = 'DRAFT';
      }
    }

    const broadcast = await prisma.emailCampaign.update({
      where: { id: broadcastId },
      data: updateData,
    });

    // 監査ログ
    await prisma.auditLog.create({
      data: {
        workspaceId: existing.workspaceId,
        actorId: session.user?.id,
        actorType: 'USER',
        action: 'broadcast.update',
        entityType: 'EmailCampaign',
        entityId: broadcastId,
        metadata: { updates: Object.keys(parsed.data) },
      },
    });

    return NextResponse.json({ broadcast });
  } catch (error) {
    console.error('Update broadcast error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/broadcasts/[broadcastId] - ブロードキャスト削除
export async function DELETE(
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

    // ドラフトまたはキャンセルのみ削除可能
    if (!['DRAFT', 'CANCELED'].includes(broadcast.status)) {
      return NextResponse.json(
        { error: 'Only draft or cancelled broadcasts can be deleted' },
        { status: 400 }
      );
    }

    await prisma.emailCampaign.delete({
      where: { id: broadcastId },
    });

    // 監査ログ
    await prisma.auditLog.create({
      data: {
        workspaceId: broadcast.workspaceId,
        actorId: session.user?.id,
        actorType: 'USER',
        action: 'broadcast.delete',
        entityType: 'EmailCampaign',
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
