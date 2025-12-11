import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

const updateStepSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(100).optional(),
  type: z
    .enum([
      'OPTIN',
      'SALES',
      'UPSELL',
      'DOWNSELL',
      'ORDER_FORM',
      'CHECKOUT',
      'THANK_YOU',
      'WEBINAR',
      'MEMBER',
      'CUSTOM',
    ])
    .optional(),
  settings: z.record(z.unknown()).optional(),
  pageContent: z.record(z.unknown()).optional(),
  isPublished: z.boolean().optional(),
});

// GET /api/funnels/[funnelId]/steps/[stepId] - Get single step
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ funnelId: string; stepId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { funnelId, stepId } = await params;

  try {
    const step = await prisma.funnelStep.findFirst({
      where: {
        id: stepId,
        funnelId,
      },
      include: {
        variants: true,
        funnel: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
          },
        },
      },
    });

    if (!step) {
      return NextResponse.json({ error: 'Step not found' }, { status: 404 });
    }

    return NextResponse.json({ step });
  } catch (error) {
    console.error('Get step error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/funnels/[funnelId]/steps/[stepId] - Update step
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ funnelId: string; stepId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { funnelId, stepId } = await params;

  try {
    const body = await request.json();
    const parsed = updateStepSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existingStep = await prisma.funnelStep.findFirst({
      where: {
        id: stepId,
        funnelId,
      },
      include: {
        funnel: true,
      },
    });

    if (!existingStep) {
      return NextResponse.json({ error: 'Step not found' }, { status: 404 });
    }

    // Check slug uniqueness if being updated
    if (parsed.data.slug && parsed.data.slug !== existingStep.slug) {
      const slugExists = await prisma.funnelStep.findFirst({
        where: {
          funnelId,
          slug: parsed.data.slug,
          id: { not: stepId },
        },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: 'Slug already exists in this funnel' },
          { status: 400 }
        );
      }
    }

    const updateData: {
      name?: string;
      slug?: string;
      type?: 'OPTIN' | 'SALES' | 'UPSELL' | 'DOWNSELL' | 'ORDER_FORM' | 'CHECKOUT' | 'THANK_YOU' | 'WEBINAR' | 'MEMBER' | 'CUSTOM';
      settings?: object;
      pageContent?: object;
      isPublished?: boolean;
    } = {};

    if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
    if (parsed.data.slug !== undefined) updateData.slug = parsed.data.slug;
    if (parsed.data.type !== undefined) updateData.type = parsed.data.type;
    if (parsed.data.settings !== undefined) updateData.settings = parsed.data.settings as object;
    if (parsed.data.pageContent !== undefined) updateData.pageContent = parsed.data.pageContent as object;
    if (parsed.data.isPublished !== undefined) updateData.isPublished = parsed.data.isPublished;

    const step = await prisma.funnelStep.update({
      where: { id: stepId },
      data: updateData,
      include: {
        variants: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        workspaceId: existingStep.funnel.workspaceId,
        actorId: session.user?.id,
        actorType: 'USER',
        action: 'funnel_step.update',
        entityType: 'FunnelStep',
        entityId: stepId,
        oldValue: existingStep,
        newValue: step,
      },
    });

    return NextResponse.json({ step });
  } catch (error) {
    console.error('Update step error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/funnels/[funnelId]/steps/[stepId] - Delete step
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ funnelId: string; stepId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { funnelId, stepId } = await params;

  try {
    const step = await prisma.funnelStep.findFirst({
      where: {
        id: stepId,
        funnelId,
      },
      include: {
        funnel: true,
      },
    });

    if (!step) {
      return NextResponse.json({ error: 'Step not found' }, { status: 404 });
    }

    // Create audit log before deletion
    await prisma.auditLog.create({
      data: {
        workspaceId: step.funnel.workspaceId,
        actorId: session.user?.id,
        actorType: 'USER',
        action: 'funnel_step.delete',
        entityType: 'FunnelStep',
        entityId: stepId,
        oldValue: step,
      },
    });

    // Delete step
    await prisma.funnelStep.delete({
      where: { id: stepId },
    });

    // Reorder remaining steps
    const remainingSteps = await prisma.funnelStep.findMany({
      where: { funnelId },
      orderBy: { sortOrder: 'asc' },
    });

    for (let i = 0; i < remainingSteps.length; i++) {
      if (remainingSteps[i].sortOrder !== i) {
        await prisma.funnelStep.update({
          where: { id: remainingSteps[i].id },
          data: { sortOrder: i },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete step error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
