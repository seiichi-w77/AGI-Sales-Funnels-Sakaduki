import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { Prisma } from '@prisma/client';

const createAffiliateSchema = z.object({
  programId: z.string().min(1),
  email: z.string().email(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  website: z.string().url().optional().nullable(),
  paypalEmail: z.string().email().optional().nullable(),
  bankInfo: z.any().optional(),
  referredBy: z.string().optional().nullable(),
});

function generateAffiliateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// GET /api/affiliates - List affiliates
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const programId = searchParams.get('programId');
  const status = searchParams.get('status');

  if (!programId) {
    return NextResponse.json({ error: 'programId is required' }, { status: 400 });
  }

  const where: Record<string, unknown> = { programId };
  if (status) {
    where.status = status;
  }

  try {
    const affiliates = await prisma.affiliate.findMany({
      where,
      include: {
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
          },
        },
        _count: {
          select: {
            clicks: true,
            conversions: true,
            referrals: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate earnings for each affiliate
    const affiliatesWithEarnings = await Promise.all(
      affiliates.map(async (affiliate) => {
        const earnings = await prisma.affiliateConversion.aggregate({
          where: {
            affiliateId: affiliate.id,
            status: { in: ['APPROVED', 'PAID'] },
          },
          _sum: {
            commissionAmount: true,
          },
        });

        return {
          ...affiliate,
          totalEarnings: earnings._sum.commissionAmount || 0,
        };
      })
    );

    return NextResponse.json({ affiliates: affiliatesWithEarnings });
  } catch (error) {
    console.error('Error fetching affiliates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch affiliates' },
      { status: 500 }
    );
  }
}

// POST /api/affiliates - Register as affiliate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createAffiliateSchema.parse(body);

    // Check if program exists
    const program = await prisma.affiliateProgram.findUnique({
      where: { id: validatedData.programId },
    });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    // Check if email already registered for this program
    const existingAffiliate = await prisma.affiliate.findFirst({
      where: {
        programId: validatedData.programId,
        email: validatedData.email,
      },
    });

    if (existingAffiliate) {
      return NextResponse.json(
        { error: 'Email already registered for this program' },
        { status: 400 }
      );
    }

    // Generate unique affiliate code
    let affiliateCode = generateAffiliateCode();
    for (let i = 0; i < 100; i++) {
      const existing = await prisma.affiliate.findUnique({
        where: { affiliateCode },
      });
      if (!existing) break;
      affiliateCode = generateAffiliateCode();
    }

    const affiliate = await prisma.affiliate.create({
      data: {
        programId: validatedData.programId,
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        company: validatedData.company,
        phone: validatedData.phone,
        website: validatedData.website,
        affiliateCode,
        paypalEmail: validatedData.paypalEmail,
        bankInfo: validatedData.bankInfo as Prisma.InputJsonValue | undefined,
        referredBy: validatedData.referredBy,
        status: program.autoApprove ? 'APPROVED' : 'PENDING',
        approvedAt: program.autoApprove ? new Date() : null,
      },
    });

    return NextResponse.json({ affiliate }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating affiliate:', error);
    return NextResponse.json(
      { error: 'Failed to create affiliate' },
      { status: 500 }
    );
  }
}
