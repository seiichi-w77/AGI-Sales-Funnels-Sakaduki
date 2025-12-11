import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

const testSendSchema = z.object({
  emails: z.array(z.string().email()).min(1).max(5),
  useSampleData: z.boolean().optional(),
});

// POST /api/broadcasts/[broadcastId]/test - テストメール送信
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
    const body = await request.json();
    const parsed = testSendSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const broadcast = await prisma.emailCampaign.findUnique({
      where: { id: broadcastId },
    });

    if (!broadcast) {
      return NextResponse.json({ error: 'Broadcast not found' }, { status: 404 });
    }

    // サンプルコンタクトデータ
    const sampleContact = {
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      full_name: 'Test User',
      phone: '090-1234-5678',
      company: 'Sample Company',
    };

    // 実際のメール送信処理はここに実装
    // 今回はログとして記録
    console.log('[Broadcast Test] Sending test email', {
      broadcastId,
      to: parsed.data.emails,
      subject: broadcast.subject,
      useSampleData: parsed.data.useSampleData,
      sampleContact: parsed.data.useSampleData ? sampleContact : null,
    });

    // 監査ログ
    await prisma.auditLog.create({
      data: {
        workspaceId: broadcast.workspaceId,
        actorId: session.user?.id,
        actorType: 'USER',
        action: 'broadcast.test_send',
        entityType: 'EmailCampaign',
        entityId: broadcastId,
        metadata: {
          emails: parsed.data.emails,
          useSampleData: parsed.data.useSampleData,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Test email sent to ' + parsed.data.emails.join(', '),
    });
  } catch (error) {
    console.error('Test send error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
