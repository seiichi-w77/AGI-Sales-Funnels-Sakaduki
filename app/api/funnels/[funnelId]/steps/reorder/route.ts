import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

const reorderSchema = z.object({
  stepOrders: z.array(
    z.object({
      stepId: z.string(),
      order: z.number().int().min(0),
    })
  ),
});

// PUT /api/funnels/[funnelId]/steps/reorder - Reorder steps
export async function PUT(
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
    const parsed = reorderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Check funnel exists
    const funnel = await prisma.funnel.findUnique({
      where: { id: funnelId },
    });

    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }

    // Update each step's sortOrder
    await Promise.all(
      parsed.data.stepOrders.map(({ stepId, order }) =>
        prisma.funnelStep.update({
          where: { id: stepId },
          data: { sortOrder: order },
        })
      )
    );

    // Get updated steps
    const steps = await prisma.funnelStep.findMany({
      where: { funnelId },
      orderBy: { sortOrder: 'asc' },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        workspaceId: funnel.workspaceId,
        actorId: session.user?.id,
        actorType: 'USER',
        action: 'funnel_steps.reorder',
        entityType: 'Funnel',
        entityId: funnelId,
        newValue: parsed.data.stepOrders,
      },
    });

    return NextResponse.json({ steps });
  } catch (error) {
    console.error('Reorder steps error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
