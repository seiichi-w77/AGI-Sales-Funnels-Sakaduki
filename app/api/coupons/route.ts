import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { CouponType, Prisma } from '@prisma/client';

const createCouponSchema = z.object({
  workspaceId: z.string(),
  code: z.string().min(1).max(50).transform((val) => val.toUpperCase()),
  name: z.string().optional(),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']).default('PERCENTAGE'),
  value: z.number().int().min(0),
  maxDiscount: z.number().int().min(0).optional(),
  usageLimit: z.number().int().min(0).optional(),
  minPurchase: z.number().int().min(0).optional(),
  isActive: z.boolean().default(true),
  startsAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const _updateCouponSchema = createCouponSchema.partial().omit({ workspaceId: true, code: true });

// GET /api/coupons - List coupons
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const workspaceId = searchParams.get('workspaceId');
  const isActive = searchParams.get('isActive');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  if (!workspaceId) {
    return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });
  }

  try {
    const where: Prisma.CouponWhereInput = { workspaceId };
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        include: {
          _count: {
            select: { carts: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.coupon.count({ where }),
    ]);

    return NextResponse.json({
      coupons,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get coupons error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/coupons - Create coupon
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createCouponSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { workspaceId, ...data } = parsed.data;

    // Check if code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: data.code },
    });

    if (existingCoupon) {
      return NextResponse.json(
        { error: 'Coupon code already exists' },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        workspaceId,
        code: data.code,
        name: data.name,
        type: data.type as CouponType,
        value: data.value,
        maxDiscount: data.maxDiscount,
        usageLimit: data.usageLimit,
        minPurchase: data.minPurchase,
        isActive: data.isActive,
        startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        metadata: data.metadata as Prisma.InputJsonValue,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        workspaceId,
        actorId: session.user?.id,
        actorType: 'USER',
        action: 'coupon.create',
        entityType: 'Coupon',
        entityId: coupon.id,
        metadata: { code: coupon.code } as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error) {
    console.error('Create coupon error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
