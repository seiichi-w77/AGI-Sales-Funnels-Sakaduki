import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { Prisma } from '@prisma/client';

const duplicateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
});

// POST /api/broadcasts/[broadcastId]/duplicate - ブロードキャスト複製
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
    const body = await request.json().catch(() => ({}));
    const parsed = duplicateSchema.safeParse(body);

    const broadcast = await prisma.emailCampaign.findUnique({
      where: { id: broadcastId },
    });

    if (!broadcast) {
      return NextResponse.json({ error: 'Broadcast not found' }, { status: 404 });
    }

    const newName = parsed.success && parsed.data.name
      ? parsed.data.name
      : broadcast.name + ' (Copy)';

    const duplicated = await prisma.emailCampaign.create({
      data: {
        workspaceId: broadcast.workspaceId,
        name: newName,
        subject: broadcast.subject,
        preheader: broadcast.preheader,
        fromName: broadcast.fromName,
        fromEmail: broadcast.fromEmail,
        replyTo: broadcast.replyTo,
        content: broadcast.content as Prisma.InputJsonValue,
        contentText: broadcast.contentText,
        type: broadcast.type,
        status: 'DRAFT',
        audienceRules: broadcast.audienceRules as Prisma.InputJsonValue,
      },
    });

    // 監査ログ
    await prisma.auditLog.create({
      data: {
        workspaceId: broadcast.workspaceId,
        actorId: session.user?.id,
        actorType: 'USER',
        action: 'broadcast.duplicate',
        entityType: 'EmailCampaign',
        entityId: duplicated.id,
        metadata: {
          originalId: broadcastId,
          originalName: broadcast.name,
          newName: newName,
        },
      },
    });

    return NextResponse.json({ broadcast: duplicated }, { status: 201 });
  } catch (error) {
    console.error('Duplicate broadcast error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
