import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { Prisma } from '@prisma/client';

const createActivitySchema = z.object({
  type: z.string(),
  description: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

// GET /api/contacts/[contactId]/activities - アクティビティ一覧
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ contactId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { contactId } = await params;
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    const where: { contactId: string; type?: string } = { contactId };
    if (type) {
      where.type = type;
    }

    const [activities, total] = await Promise.all([
      prisma.contactActivity.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.contactActivity.count({ where }),
    ]);

    // アクティビティタイプの統計
    const typeStats = await prisma.contactActivity.groupBy({
      by: ['type'],
      where: { contactId },
      _count: true,
    });

    return NextResponse.json({
      activities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      typeStats: typeStats.map((t) => ({ type: t.type, count: t._count })),
    });
  } catch (error) {
    console.error('Get contact activities error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/contacts/[contactId]/activities - アクティビティ追加
export async function POST(
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
    const parsed = createActivitySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    const activity = await prisma.contactActivity.create({
      data: {
        contactId,
        type: parsed.data.type,
        description: parsed.data.description,
        metadata: parsed.data.metadata as Prisma.InputJsonValue,
      },
    });

    // コンタクトの最終アクティビティを更新
    await prisma.contact.update({
      where: { id: contactId },
      data: { lastActivityAt: new Date() },
    });

    return NextResponse.json({ activity }, { status: 201 });
  } catch (error) {
    console.error('Create contact activity error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
