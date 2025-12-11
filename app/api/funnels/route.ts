import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

const funnelSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['LEAD_MAGNET', 'BOOK', 'CART', 'WEBINAR', 'VSL', 'STOREFRONT', 'CUSTOM']),
  description: z.string().optional(),
});

// GET /api/funnels - List funnels
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const workspaceId = searchParams.get('workspaceId');

  if (!workspaceId) {
    return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });
  }

  const funnels = await prisma.funnel.findMany({
    where: { workspaceId },
    include: {
      steps: {
        orderBy: { sortOrder: 'asc' },
      },
      _count: {
        select: { analytics: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json({ funnels });
}

// POST /api/funnels - Create funnel
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { workspaceId, ...data } = body;

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });
    }

    const parsed = funnelSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Generate unique slug
    const slug = `${parsed.data.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

    const funnel = await prisma.funnel.create({
      data: {
        workspaceId,
        ...parsed.data,
        slug,
      },
    });

    return NextResponse.json(funnel, { status: 201 });
  } catch (error) {
    console.error('Create funnel error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
