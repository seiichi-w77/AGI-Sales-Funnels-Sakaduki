import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { Prisma } from '@prisma/client';

const updateAffiliateSchema = z.object({
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  website: z.string().url().optional().nullable(),
  paypalEmail: z.string().email().optional().nullable(),
  bankInfo: z.any().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']).optional(),
  customCommission: z.number().int().min(0).optional().nullable(),
  rejectionReason: z.string().optional().nullable(),
});

// GET /api/affiliates/[affiliateId]
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
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: affiliateId },
      include: {
        program: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        referrer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            affiliateCode: true,
          },
        },
        links: true,
        _count: {
          select: {
            clicks: true,
            conversions: true,
            referrals: true,
          },
        },
      },
    });

    if (!affiliate) {
      return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 });
    }

    // Get earnings statistics
    const [totalEarnings, pendingEarnings, paidEarnings] = await Promise.all([
      prisma.affiliateConversion.aggregate({
        where: {
          affiliateId,
          status: { in: ['APPROVED', 'PAID'] },
        },
        _sum: { commissionAmount: true },
      }),
      prisma.affiliateConversion.aggregate({
        where: {
          affiliateId,
          status: 'PENDING',
        },
        _sum: { commissionAmount: true },
      }),
      prisma.affiliateConversion.aggregate({
        where: {
          affiliateId,
          status: 'PAID',
        },
        _sum: { commissionAmount: true },
      }),
    ]);

    return NextResponse.json({
      affiliate: {
        ...affiliate,
        earnings: {
          total: totalEarnings._sum.commissionAmount || 0,
          pending: pendingEarnings._sum.commissionAmount || 0,
          paid: paidEarnings._sum.commissionAmount || 0,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching affiliate:', error);
    return NextResponse.json(
      { error: 'Failed to fetch affiliate' },
      { status: 500 }
    );
  }
}

// PATCH /api/affiliates/[affiliateId]
export async function PATCH(
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
    const validatedData = updateAffiliateSchema.parse(body);

    const existingAffiliate = await prisma.affiliate.findUnique({
      where: { id: affiliateId },
    });

    if (!existingAffiliate) {
      return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {
      ...validatedData,
      bankInfo: validatedData.bankInfo as Prisma.InputJsonValue | undefined,
    };

    // Handle status changes
    if (validatedData.status) {
      if (validatedData.status === 'APPROVED' && existingAffiliate.status !== 'APPROVED') {
        updateData.approvedAt = new Date();
        updateData.rejectedAt = null;
        updateData.rejectionReason = null;
      } else if (validatedData.status === 'REJECTED') {
        updateData.rejectedAt = new Date();
        updateData.approvedAt = null;
      }
    }

    const affiliate = await prisma.affiliate.update({
      where: { id: affiliateId },
      data: updateData,
    });

    return NextResponse.json({ affiliate });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating affiliate:', error);
    return NextResponse.json(
      { error: 'Failed to update affiliate' },
      { status: 500 }
    );
  }
}

// DELETE /api/affiliates/[affiliateId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ affiliateId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { affiliateId } = await params;

  try {
    const existingAffiliate = await prisma.affiliate.findUnique({
      where: { id: affiliateId },
    });

    if (!existingAffiliate) {
      return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 });
    }

    await prisma.affiliate.delete({
      where: { id: affiliateId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting affiliate:', error);
    return NextResponse.json(
      { error: 'Failed to delete affiliate' },
      { status: 500 }
    );
  }
}
