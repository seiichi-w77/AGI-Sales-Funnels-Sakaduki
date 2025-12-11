import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { Prisma } from '@prisma/client';

const createPayoutSchema = z.object({
  method: z.enum(['PAYPAL', 'BANK_TRANSFER', 'CHECK']),
  notes: z.string().optional().nullable(),
});

// GET /api/affiliates/[affiliateId]/payouts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ affiliateId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { affiliateId } = await params;

  try {
    const payouts = await prisma.affiliatePayout.findMany({
      where: { affiliateId },
      include: {
        _count: {
          select: {
            conversions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ payouts });
  } catch (error) {
    console.error('Error fetching payouts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payouts' },
      { status: 500 }
    );
  }
}

// POST /api/affiliates/[affiliateId]/payouts - Create payout
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ affiliateId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { affiliateId } = await params;

  try {
    const body = await request.json();
    const validatedData = createPayoutSchema.parse(body);

    // Get affiliate and program
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: affiliateId },
      include: { program: true },
    });

    if (!affiliate) {
      return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 });
    }

    // Get approved unpaid conversions
    const approvedConversions = await prisma.affiliateConversion.findMany({
      where: {
        affiliateId,
        status: 'APPROVED',
        payoutId: null,
      },
    });

    if (approvedConversions.length === 0) {
      return NextResponse.json(
        { error: 'No approved conversions to pay out' },
        { status: 400 }
      );
    }

    const totalAmount = approvedConversions.reduce(
      (sum, c) => sum + c.commissionAmount,
      0
    );

    // Check minimum payout
    if (totalAmount < affiliate.program.minPayout) {
      return NextResponse.json(
        { error: `Minimum payout amount is ${affiliate.program.minPayout}` },
        { status: 400 }
      );
    }

    // Create payout and update conversions
    const payout = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const newPayout = await tx.affiliatePayout.create({
        data: {
          affiliateId,
          amount: totalAmount,
          method: validatedData.method,
          notes: validatedData.notes,
          status: 'PENDING',
        },
      });

      // Update conversions
      await tx.affiliateConversion.updateMany({
        where: {
          id: { in: approvedConversions.map((c) => c.id) },
        },
        data: {
          payoutId: newPayout.id,
        },
      });

      return newPayout;
    });

    return NextResponse.json({ payout }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating payout:', error);
    return NextResponse.json(
      { error: 'Failed to create payout' },
      { status: 500 }
    );
  }
}
