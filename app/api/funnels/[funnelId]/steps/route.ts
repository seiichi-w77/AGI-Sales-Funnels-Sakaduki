import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

const createStepSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum([
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
  ]),
  slug: z.string().min(1).max(100).optional(),
  settings: z.record(z.unknown()).optional(),
  pageContent: z.record(z.unknown()).optional(),
  insertAfter: z.string().optional(), // Step ID to insert after
});

// GET /api/funnels/[funnelId]/steps - List steps
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
    const steps = await prisma.funnelStep.findMany({
      where: { funnelId },
      orderBy: { sortOrder: 'asc' },
      include: {
        variants: true,
      },
    });

    return NextResponse.json({ steps });
  } catch (error) {
    console.error('Get steps error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/funnels/[funnelId]/steps - Create step
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
    const parsed = createStepSchema.safeParse(body);

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

    // Get current max sortOrder
    const lastStep = await prisma.funnelStep.findFirst({
      where: { funnelId },
      orderBy: { sortOrder: 'desc' },
    });

    let sortOrder = (lastStep?.sortOrder ?? -1) + 1;

    // If insertAfter is specified, adjust sortOrder
    if (parsed.data.insertAfter) {
      const afterStep = await prisma.funnelStep.findUnique({
        where: { id: parsed.data.insertAfter },
      });

      if (afterStep) {
        sortOrder = afterStep.sortOrder + 1;

        // Shift all steps after this position
        await prisma.funnelStep.updateMany({
          where: {
            funnelId,
            sortOrder: { gte: sortOrder },
          },
          data: {
            sortOrder: { increment: 1 },
          },
        });
      }
    }

    // Generate slug if not provided
    const slug =
      parsed.data.slug ||
      parsed.data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    // Check slug uniqueness within funnel
    const existingSlug = await prisma.funnelStep.findFirst({
      where: {
        funnelId,
        slug,
      },
    });

    const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

    const step = await prisma.funnelStep.create({
      data: {
        funnelId,
        name: parsed.data.name,
        slug: finalSlug,
        type: parsed.data.type,
        sortOrder,
        settings: parsed.data.settings as object | undefined,
        pageContent: parsed.data.pageContent as object | undefined,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        workspaceId: funnel.workspaceId,
        actorId: session.user?.id,
        actorType: 'USER',
        action: 'funnel_step.create',
        entityType: 'FunnelStep',
        entityId: step.id,
        metadata: { funnelId },
      },
    });

    return NextResponse.json({ step }, { status: 201 });
  } catch (error) {
    console.error('Create step error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
