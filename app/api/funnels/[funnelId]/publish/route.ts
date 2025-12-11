import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

const publishSchema = z.object({
  action: z.enum(['publish', 'unpublish']),
});

// POST /api/funnels/[funnelId]/publish - Publish or unpublish funnel
export async function POST(
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
    const parsed = publishSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const funnel = await prisma.funnel.findUnique({
      where: { id: funnelId },
      include: {
        steps: true,
      },
    });

    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }

    if (parsed.data.action === 'publish') {
      // Validation checks before publishing
      const errors: string[] = [];

      if (funnel.steps.length === 0) {
        errors.push('Funnel must have at least one step');
      }

      // Check if all steps have content
      const emptySteps = funnel.steps.filter(
        (step) => !step.pageContent || Object.keys(step.pageContent as object).length === 0
      );
      if (emptySteps.length > 0) {
        errors.push(`${emptySteps.length} step(s) have no content`);
      }

      if (errors.length > 0) {
        return NextResponse.json(
          { error: 'Cannot publish funnel', details: errors },
          { status: 400 }
        );
      }

      // Publish funnel
      const updatedFunnel = await prisma.funnel.update({
        where: { id: funnelId },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
        },
        include: {
          steps: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      });

      // Update all steps to published
      await prisma.funnelStep.updateMany({
        where: { funnelId },
        data: { isPublished: true },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          workspaceId: funnel.workspaceId,
          actorId: session.user?.id,
          actorType: 'USER',
          action: 'funnel.publish',
          entityType: 'Funnel',
          entityId: funnelId,
        },
      });

      return NextResponse.json({
        funnel: updatedFunnel,
        message: 'Funnel published successfully',
      });
    } else {
      // Unpublish funnel
      const updatedFunnel = await prisma.funnel.update({
        where: { id: funnelId },
        data: {
          status: 'DRAFT',
        },
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
          action: 'funnel.unpublish',
          entityType: 'Funnel',
          entityId: funnelId,
        },
      });

      return NextResponse.json({
        funnel: updatedFunnel,
        message: 'Funnel unpublished',
      });
    }
  } catch (error) {
    console.error('Publish funnel error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
