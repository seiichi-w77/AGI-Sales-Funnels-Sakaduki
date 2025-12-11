import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { Prisma, ContactStatus } from '@prisma/client';

const updateContactSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  source: z.string().optional(),
  status: z.enum(['ACTIVE', 'UNSUBSCRIBED', 'BOUNCED', 'COMPLAINED', 'ARCHIVED']).optional(),
  tags: z.array(z.string()).optional(),
  customFields: z.record(z.unknown()).optional(),
  score: z.number().optional(),
});

// GET /api/contacts/[contactId] - コンタクト詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ contactId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { contactId } = await params;

  try {
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        orders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            total: true,
            createdAt: true,
          },
        },
        courseEnrollments: {
          include: {
            course: {
              select: {
                id: true,
                name: true,
                thumbnail: true,
              },
            },
          },
        },
        _count: {
          select: {
            orders: true,
            activities: true,
            emailEvents: true,
            courseEnrollments: true,
          },
        },
      },
    });

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // 最近のアクティビティ
    const recentActivities = await prisma.contactActivity.findMany({
      where: { contactId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // メールイベント統計
    const emailStats = await prisma.emailEvent.groupBy({
      by: ['type'],
      where: { contactId },
      _count: true,
    });

    return NextResponse.json({
      contact: {
        ...contact,
        stats: contact._count,
        _count: undefined,
      },
      recentActivities,
      emailStats: emailStats.reduce((acc, e) => {
        acc[e.type.toLowerCase()] = e._count;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error) {
    console.error('Get contact error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/contacts/[contactId] - コンタクト更新
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ contactId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { contactId } = await params;

  try {
    const body = await request.json();
    const parsed = updateContactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // メール変更時の重複チェック
    if (parsed.data.email && parsed.data.email !== existing.email) {
      const emailExists = await prisma.contact.findUnique({
        where: {
          workspaceId_email: {
            workspaceId: existing.workspaceId,
            email: parsed.data.email,
          },
        },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'Email already exists in this workspace' },
          { status: 409 }
        );
      }
    }

    // ステータス変更のハンドリング
    const updateData: Prisma.ContactUpdateInput = {
      ...parsed.data,
      address: parsed.data.address as Prisma.InputJsonValue,
      status: parsed.data.status as ContactStatus,
      customFields: parsed.data.customFields as Prisma.InputJsonValue,
    };

    if (parsed.data.status === 'UNSUBSCRIBED' && existing.status !== 'UNSUBSCRIBED') {
      updateData.unsubscribedAt = new Date();
    } else if (parsed.data.status === 'ACTIVE' && existing.status === 'UNSUBSCRIBED') {
      updateData.subscribedAt = new Date();
      updateData.unsubscribedAt = null;
    }

    const contact = await prisma.contact.update({
      where: { id: contactId },
      data: updateData,
    });

    // 変更内容をアクティビティに記録
    const changes = Object.keys(parsed.data).filter(
      (key) => (parsed.data as Record<string, unknown>)[key] !== (existing as Record<string, unknown>)[key]
    );

    if (changes.length > 0) {
      await prisma.contactActivity.create({
        data: {
          contactId,
          type: 'contact_updated',
          description: 'Updated fields: ' + changes.join(', '),
          metadata: { changes },
        },
      });

      // 監査ログ
      const oldValue = changes.reduce((acc, key) => {
        acc[key] = (existing as Record<string, unknown>)[key];
        return acc;
      }, {} as Record<string, unknown>);
      const newValue = changes.reduce((acc, key) => {
        acc[key] = (parsed.data as Record<string, unknown>)[key];
        return acc;
      }, {} as Record<string, unknown>);
      await prisma.auditLog.create({
        data: {
          workspaceId: existing.workspaceId,
          actorId: session.user?.id,
          actorType: 'USER',
          action: 'contact.update',
          entityType: 'Contact',
          entityId: contactId,
          oldValue: oldValue as Prisma.InputJsonValue,
          newValue: newValue as Prisma.InputJsonValue,
        },
      });
    }

    return NextResponse.json({ contact });
  } catch (error) {
    console.error('Update contact error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/contacts/[contactId] - コンタクト削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ contactId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { contactId } = await params;

  try {
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // ソフトデリート（ARCHIVEDに変更）または完全削除
    const searchParams = request.nextUrl.searchParams;
    const permanent = searchParams.get('permanent') === 'true';

    if (permanent) {
      await prisma.contact.delete({
        where: { id: contactId },
      });
    } else {
      await prisma.contact.update({
        where: { id: contactId },
        data: { status: 'ARCHIVED' },
      });
    }

    // 監査ログ
    await prisma.auditLog.create({
      data: {
        workspaceId: contact.workspaceId,
        actorId: session.user?.id,
        actorType: 'USER',
        action: permanent ? 'contact.delete' : 'contact.archive',
        entityType: 'Contact',
        entityId: contactId,
        metadata: { email: contact.email },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete contact error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
