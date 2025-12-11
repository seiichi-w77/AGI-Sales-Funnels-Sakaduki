import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { CouponType, Prisma } from '@prisma/client';

const updateCouponSchema = z.object({
  name: z.string().optional(),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']).optional(),
  value: z.number().int().min(0).optional(),
  maxDiscount: z.number().int().min(0).optional().nullable(),
  usageLimit: z.number().int().min(0).optional().nullable(),
  minPurchase: z.number().int().min(0).optional().nullable(),
  isActive: z.boolean().optional(),
  startsAt: z.string().datetime().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  metadata: z.record(z.unknown()).optional(),
});

// GET /api/coupons/[couponId] - Get coupon details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ couponId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { couponId } = await params;

  try {
    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
      include: {
        _count: {
          select: { carts: true },
        },
      },
    });

    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    return NextResponse.json({ coupon });
  } catch (error) {
    console.error('Get coupon error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/coupons/[couponId] - Update coupon
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ couponId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { couponId } = await params;

  try {
    const body = await request.json();
    const parsed = updateCouponSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existingCoupon = await prisma.coupon.findUnique({
      where: { id: couponId },
    });

    if (!existingCoupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    const updateData: Prisma.CouponUpdateInput = {};

    if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
    if (parsed.data.type !== undefined) updateData.type = parsed.data.type as CouponType;
    if (parsed.data.value !== undefined) updateData.value = parsed.data.value;
    if (parsed.data.maxDiscount !== undefined) updateData.maxDiscount = parsed.data.maxDiscount;
    if (parsed.data.usageLimit !== undefined) updateData.usageLimit = parsed.data.usageLimit;
    if (parsed.data.minPurchase !== undefined) updateData.minPurchase = parsed.data.minPurchase;
    if (parsed.data.isActive !== undefined) updateData.isActive = parsed.data.isActive;
    if (parsed.data.startsAt !== undefined) {
      updateData.startsAt = parsed.data.startsAt ? new Date(parsed.data.startsAt) : null;
    }
    if (parsed.data.expiresAt !== undefined) {
      updateData.expiresAt = parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null;
    }
    if (parsed.data.metadata !== undefined) {
      updateData.metadata = parsed.data.metadata as Prisma.InputJsonValue;
    }

    const coupon = await prisma.coupon.update({
      where: { id: couponId },
      data: updateData,
    });

    return NextResponse.json({ coupon });
  } catch (error) {
    console.error('Update coupon error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/coupons/[couponId] - Delete coupon
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ couponId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { couponId } = await params;

  try {
    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
      include: {
        _count: { select: { carts: true } },
      },
    });

    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    // Check if coupon has been used
    if (coupon.usageCount > 0) {
      // Archive instead of delete
      await prisma.coupon.update({
        where: { id: couponId },
        data: { isActive: false },
      });
      return NextResponse.json({ success: true, archived: true });
    }

    await prisma.coupon.delete({
      where: { id: couponId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete coupon error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
