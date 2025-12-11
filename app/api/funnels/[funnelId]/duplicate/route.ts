import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

const duplicateSchema = z.object({
  name: z.string().min(1).max(255),
  includeSteps: z.boolean().default(true),
});

// POST /api/funnels/[funnelId]/duplicate - Duplicate funnel
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
    const parsed = duplicateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Get source funnel with steps
    const sourceFunnel = await prisma.funnel.findUnique({
      where: { id: funnelId },
      include: {
        steps: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!sourceFunnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }

    // Generate new slug
    const slug = `${parsed.data.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

    // Create duplicate funnel
    const newFunnel = await prisma.funnel.create({
      data: {
        workspaceId: sourceFunnel.workspaceId,
        name: parsed.data.name,
        slug,
        type: sourceFunnel.type,
        description: sourceFunnel.description,
        status: 'DRAFT', // Always start as draft
        settings: sourceFunnel.settings ?? undefined,
        // Don't copy publishedAt, thumbnail
      },
    });

    // Duplicate steps if requested
    if (parsed.data.includeSteps && sourceFunnel.steps.length > 0) {
      await prisma.funnelStep.createMany({
        data: sourceFunnel.steps.map((step) => ({
          funnelId: newFunnel.id,
          name: step.name,
          slug: step.slug,
          type: step.type,
          sortOrder: step.sortOrder,
          settings: step.settings ?? undefined,
          pageContent: step.pageContent ?? undefined,
          isPublished: false, // Reset publish status
        })),
      });
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        workspaceId: newFunnel.workspaceId,
        actorId: session.user?.id,
        actorType: 'USER',
        action: 'funnel.duplicate',
        entityType: 'Funnel',
        entityId: newFunnel.id,
        metadata: {
          sourceFunnelId: funnelId,
          sourceFunnelName: sourceFunnel.name,
        },
      },
    });

    return NextResponse.json(newFunnel, { status: 201 });
  } catch (error) {
    console.error('Duplicate funnel error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
