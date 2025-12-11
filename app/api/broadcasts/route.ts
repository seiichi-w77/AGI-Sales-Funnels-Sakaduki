import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { Prisma, EmailCampaignStatus} from '@prisma/client';

const createBroadcastSchema = z.object({
  workspaceId: z.string(),
  name: z.string().min(1).max(255),
  subject: z.string().optional(),
  preheader: z.string().optional(),
  fromName: z.string().optional(),
  fromEmail: z.string().email().optional(),
  replyTo: z.string().email().optional(),
});

// GET /api/broadcasts - ブロードキャスト一覧取得
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const workspaceId = searchParams.get('workspaceId');
  const status = searchParams.get('status');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  if (!workspaceId) {
    return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 });
  }

  try {
    const where: Prisma.EmailCampaignWhereInput = {
      workspaceId,
      type: 'BROADCAST',
    };

    if (status) {
      where.status = status as EmailCampaignStatus;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [broadcasts, total] = await Promise.all([
      prisma.emailCampaign.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: {
              events: true,
            },
          },
        },
      }),
      prisma.emailCampaign.count({ where }),
    ]);

    // 各ブロードキャストの統計を計算
    const broadcastsWithStats = broadcasts.map((broadcast) => {
      const openRate = broadcast.totalSent > 0
        ? ((broadcast.totalOpened / broadcast.totalSent) * 100).toFixed(1)
        : '0.0';
      const clickRate = broadcast.totalSent > 0
        ? ((broadcast.totalClicked / broadcast.totalSent) * 100).toFixed(1)
        : '0.0';

      return {
        ...broadcast,
        openRate: parseFloat(openRate),
        clickRate: parseFloat(clickRate),
        eventCount: broadcast._count.events,
        _count: undefined,
      };
    });

    return NextResponse.json({
      broadcasts: broadcastsWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get broadcasts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/broadcasts - ブロードキャスト作成
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createBroadcastSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // ワークスペースのデフォルト設定を取得
    const workspace = await prisma.workspace.findUnique({
      where: { id: parsed.data.workspaceId },
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    const broadcast = await prisma.emailCampaign.create({
      data: {
        workspaceId: parsed.data.workspaceId,
        name: parsed.data.name,
        subject: parsed.data.subject || '',
        preheader: parsed.data.preheader,
        fromName: parsed.data.fromName || workspace.name,
        fromEmail: parsed.data.fromEmail || 'noreply@example.com',
        replyTo: parsed.data.replyTo,
        content: {},
        type: 'BROADCAST',
        status: 'DRAFT',
      },
    });

    // 監査ログ
    await prisma.auditLog.create({
      data: {
        workspaceId: parsed.data.workspaceId,
        actorId: session.user?.id,
        actorType: 'USER',
        action: 'broadcast.create',
        entityType: 'EmailCampaign',
        entityId: broadcast.id,
        metadata: { name: broadcast.name },
      },
    });

    return NextResponse.json({ broadcast }, { status: 201 });
  } catch (error) {
    console.error('Create broadcast error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
