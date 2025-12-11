import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { Prisma } from '@prisma/client';

const createProgramSchema = z.object({
  workspaceId: z.string().min(1),
  name: z.string().min(1).max(255),
  description: z.string().optional().nullable(),
  commissionType: z.enum(['PERCENTAGE', 'FIXED']).default('PERCENTAGE'),
  commissionRate: z.number().int().min(0).default(10),
  tier2Rate: z.number().int().min(0).optional().nullable(),
  cookieDays: z.number().int().min(1).default(45),
  minPayout: z.number().int().min(0).default(5000),
  autoApprove: z.boolean().default(false),
  termsUrl: z.string().url().optional().nullable(),
  settings: z.any().optional(),
});

// GET /api/affiliates/programs - List programs
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get('workspaceId');

  if (!workspaceId) {
    return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 });
  }

  try {
    const programs = await prisma.affiliateProgram.findMany({
      where: { workspaceId },
      include: {
        _count: {
          select: {
            affiliates: true,
            products: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ programs });
  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch programs' },
      { status: 500 }
    );
  }
}

// POST /api/affiliates/programs - Create program
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = createProgramSchema.parse(body);

    // Generate slug
    const baseSlug = validatedData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    let slug = baseSlug;

    for (let counter = 1; counter <= 100; counter++) {
      const existing = await prisma.affiliateProgram.findFirst({
        where: {
          workspaceId: validatedData.workspaceId,
          slug,
        },
      });

      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
    }

    const program = await prisma.affiliateProgram.create({
      data: {
        workspaceId: validatedData.workspaceId,
        name: validatedData.name,
        slug,
        description: validatedData.description,
        commissionType: validatedData.commissionType,
        commissionRate: validatedData.commissionRate,
        tier2Rate: validatedData.tier2Rate,
        cookieDays: validatedData.cookieDays,
        minPayout: validatedData.minPayout,
        autoApprove: validatedData.autoApprove,
        termsUrl: validatedData.termsUrl,
        settings: validatedData.settings as Prisma.InputJsonValue | undefined,
      },
    });

    return NextResponse.json({ program }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating program:', error);
    return NextResponse.json(
      { error: 'Failed to create program' },
      { status: 500 }
    );
  }
}
