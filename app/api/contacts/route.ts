import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { Prisma, ContactStatus } from '@prisma/client';

const createContactSchema = z.object({
  workspaceId: z.string(),
  email: z.string().email(),
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
});

// GET /api/contacts - コンタクト一覧取得
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const workspaceId = searchParams.get('workspaceId');
  const search = searchParams.get('search');
  const status = searchParams.get('status');
  const tags = searchParams.get('tags');
  const source = searchParams.get('source');
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  if (!workspaceId) {
    return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 });
  }

  try {
    const where: Prisma.ContactWhereInput = { workspaceId };

    // ステータスフィルター
    if (status) {
      where.status = status as ContactStatus;
    }

    // タグフィルター
    if (tags) {
      const tagList = tags.split(',').map((t) => t.trim());
      where.tags = { hasSome: tagList };
    }

    // ソースフィルター
    if (source) {
      where.source = source;
    }

    // 検索
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    // ソートフィールドのバリデーション
    const validSortFields = ['createdAt', 'updatedAt', 'email', 'firstName', 'lastName', 'score', 'lastActivityAt'];
    const orderByField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderDirection = sortOrder === 'asc' ? 'asc' : 'desc';

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        orderBy: { [orderByField]: orderDirection },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: {
              orders: true,
              activities: true,
              courseEnrollments: true,
            },
          },
        },
      }),
      prisma.contact.count({ where }),
    ]);

    // タグ統計
    const tagStats = await prisma.$queryRaw<{ tag: string; count: bigint }[]>`
      SELECT unnest(tags) as tag, COUNT(*) as count
      FROM contacts
      WHERE "workspaceId" = ${workspaceId}
      GROUP BY unnest(tags)
      ORDER BY count DESC
      LIMIT 50
    `;

    return NextResponse.json({
      contacts: contacts.map((c) => ({
        ...c,
        orderCount: c._count.orders,
        activityCount: c._count.activities,
        enrollmentCount: c._count.courseEnrollments,
        _count: undefined,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      tagStats: tagStats.map((t) => ({ tag: t.tag, count: Number(t.count) })),
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/contacts - コンタクト作成
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createContactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // 既存コンタクトチェック
    const existing = await prisma.contact.findUnique({
      where: {
        workspaceId_email: {
          workspaceId: parsed.data.workspaceId,
          email: parsed.data.email,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Contact with this email already exists', existingId: existing.id },
        { status: 409 }
      );
    }

    const contact = await prisma.contact.create({
      data: {
        workspaceId: parsed.data.workspaceId,
        email: parsed.data.email,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        phone: parsed.data.phone,
        company: parsed.data.company,
        jobTitle: parsed.data.jobTitle,
        address: parsed.data.address as Prisma.InputJsonValue,
        timezone: parsed.data.timezone,
        language: parsed.data.language,
        source: parsed.data.source,
        status: (parsed.data.status as ContactStatus) || 'ACTIVE',
        tags: parsed.data.tags || [],
        customFields: parsed.data.customFields as Prisma.InputJsonValue,
        ownerId: session.user?.id,
        subscribedAt: new Date(),
      },
    });

    // アクティビティログ
    await prisma.contactActivity.create({
      data: {
        contactId: contact.id,
        type: 'contact_created',
        description: 'Contact was created',
        metadata: { source: parsed.data.source || 'manual' },
      },
    });

    // 監査ログ
    await prisma.auditLog.create({
      data: {
        workspaceId: parsed.data.workspaceId,
        actorId: session.user?.id,
        actorType: 'USER',
        action: 'contact.create',
        entityType: 'Contact',
        entityId: contact.id,
        metadata: { email: contact.email },
      },
    });

    return NextResponse.json({ contact }, { status: 201 });
  } catch (error) {
    console.error('Create contact error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
