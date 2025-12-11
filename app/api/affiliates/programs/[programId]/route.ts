import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { Prisma } from '@prisma/client';

const updateProgramSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  commissionType: z.enum(['PERCENTAGE', 'FIXED']).optional(),
  commissionRate: z.number().int().min(0).optional(),
  tier2Rate: z.number().int().min(0).optional().nullable(),
  cookieDays: z.number().int().min(1).optional(),
  minPayout: z.number().int().min(0).optional(),
  autoApprove: z.boolean().optional(),
  termsUrl: z.string().url().optional().nullable(),
  status: z.enum(['ACTIVE', 'PAUSED', 'CLOSED']).optional(),
  settings: z.any().optional(),
});

// GET /api/affiliates/programs/[programId]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ programId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { programId } = await params;

  try {
    const program = await prisma.affiliateProgram.findUnique({
      where: { id: programId },
      include: {
        affiliates: {
          include: {
            _count: {
              select: {
                clicks: true,
                conversions: true,
              },
            },
          },
        },
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        resources: true,
      },
    });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    return NextResponse.json({ program });
  } catch (error) {
    console.error('Error fetching program:', error);
    return NextResponse.json(
      { error: 'Failed to fetch program' },
      { status: 500 }
    );
  }
}

// PATCH /api/affiliates/programs/[programId]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ programId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { programId } = await params;

  try {
    const body = await request.json();
    const validatedData = updateProgramSchema.parse(body);

    const existingProgram = await prisma.affiliateProgram.findUnique({
      where: { id: programId },
    });

    if (!existingProgram) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    const program = await prisma.affiliateProgram.update({
      where: { id: programId },
      data: {
        ...validatedData,
        settings: validatedData.settings as Prisma.InputJsonValue | undefined,
      },
    });

    return NextResponse.json({ program });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating program:', error);
    return NextResponse.json(
      { error: 'Failed to update program' },
      { status: 500 }
    );
  }
}

// DELETE /api/affiliates/programs/[programId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ programId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { programId } = await params;

  try {
    const existingProgram = await prisma.affiliateProgram.findUnique({
      where: { id: programId },
    });

    if (!existingProgram) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    await prisma.affiliateProgram.delete({
      where: { id: programId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting program:', error);
    return NextResponse.json(
      { error: 'Failed to delete program' },
      { status: 500 }
    );
  }
}
