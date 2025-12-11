import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

const updateFunnelSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  type: z.enum(['LEAD_MAGNET', 'BOOK', 'CART', 'WEBINAR', 'VSL', 'STOREFRONT', 'CUSTOM']).optional(),
  description: z.string().max(1000).optional().nullable(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  settings: z.record(z.unknown()).optional(),
});

// GET /api/funnels/[funnelId] - Get single funnel
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ funnelId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { funnelId } = await params;

  try {
    const funnel = await prisma.funnel.findUnique({
      where: { id: funnelId },
      include: {
        steps: {
          orderBy: { sortOrder: 'asc' },
        },
        products: {
          include: {
            product: true,
          },
        },
        analytics: {
          take: 30,
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }

    return NextResponse.json({ funnel });
  } catch (error) {
    console.error('Get funnel error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/funnels/[funnelId] - Update funnel
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ funnelId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { funnelId } = await params;

  try {
    const body = await request.json();
    const parsed = updateFunnelSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Check funnel exists
    const existingFunnel = await prisma.funnel.findUnique({
      where: { id: funnelId },
    });

    if (!existingFunnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }

    // Handle publish/unpublish
    const updateData: Record<string, unknown> = { ...parsed.data };

    if (parsed.data.status === 'PUBLISHED' && existingFunnel.status !== 'PUBLISHED') {
      updateData.publishedAt = new Date();
    }

    const funnel = await prisma.funnel.update({
      where: { id: funnelId },
      data: updateData,
      include: {
        steps: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        workspaceId: funnel.workspaceId,
        actorId: session.user?.id,
        actorType: 'USER',
        action: 'funnel.update',
        entityType: 'Funnel',
        entityId: funnelId,
        oldValue: existingFunnel,
        newValue: funnel,
      },
    });

    return NextResponse.json({ funnel });
  } catch (error) {
    console.error('Update funnel error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/funnels/[funnelId] - Delete funnel
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ funnelId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { funnelId } = await params;

  try {
    const funnel = await prisma.funnel.findUnique({
      where: { id: funnelId },
    });

    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }

    // Create audit log before deletion
    await prisma.auditLog.create({
      data: {
        workspaceId: funnel.workspaceId,
        actorId: session.user?.id,
        actorType: 'USER',
        action: 'funnel.delete',
        entityType: 'Funnel',
        entityId: funnelId,
        oldValue: funnel,
      },
    });

    // Delete funnel (cascade will handle steps and analytics)
    await prisma.funnel.delete({
      where: { id: funnelId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete funnel error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
