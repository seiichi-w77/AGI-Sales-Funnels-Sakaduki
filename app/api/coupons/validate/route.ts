import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';

const validateCouponSchema = z.object({
  code: z.string().transform((val) => val.toUpperCase()),
  workspaceId: z.string(),
  cartId: z.string().optional(),
  subtotal: z.number().int().min(0).optional(),
});

// POST /api/coupons/validate - Validate and apply coupon code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = validateCouponSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { code, workspaceId, cartId, subtotal } = parsed.data;

    // Find coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon) {
      return NextResponse.json(
        { valid: false, error: 'Coupon code not found' },
        { status: 404 }
      );
    }

    // Check workspace match
    if (coupon.workspaceId !== workspaceId) {
      return NextResponse.json(
        { valid: false, error: 'Coupon code not found' },
        { status: 404 }
      );
    }

    // Check if active
    if (!coupon.isActive) {
      return NextResponse.json(
        { valid: false, error: 'This coupon is no longer active' },
        { status: 400 }
      );
    }

    // Check start date
    if (coupon.startsAt && new Date() < new Date(coupon.startsAt)) {
      return NextResponse.json(
        { valid: false, error: 'This coupon is not yet active' },
        { status: 400 }
      );
    }

    // Check expiration
    if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
      return NextResponse.json(
        { valid: false, error: 'This coupon has expired' },
        { status: 400 }
      );
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json(
        { valid: false, error: 'This coupon has reached its usage limit' },
        { status: 400 }
      );
    }

    // Get cart subtotal if cartId provided
    let purchaseAmount = subtotal || 0;
    if (cartId && !subtotal) {
      const cart = await prisma.cart.findUnique({
        where: { id: cartId },
      });
      if (cart) {
        purchaseAmount = cart.subtotal;
      }
    }

    // Check minimum purchase
    if (coupon.minPurchase && purchaseAmount < coupon.minPurchase) {
      return NextResponse.json(
        {
          valid: false,
          error: `Minimum purchase of ¥${coupon.minPurchase} required`,
        },
        { status: 400 }
      );
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discountAmount = Math.round(purchaseAmount * (coupon.value / 100));
      // Apply max discount cap if set
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      // FIXED_AMOUNT
      discountAmount = coupon.value;
      // Don't allow discount to exceed purchase amount
      if (discountAmount > purchaseAmount) {
        discountAmount = purchaseAmount;
      }
    }

    // Apply coupon to cart if cartId provided
    if (cartId) {
      await prisma.cart.update({
        where: { id: cartId },
        data: {
          couponId: coupon.id,
          discount: discountAmount,
          total: purchaseAmount - discountAmount,
        },
      });
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        type: coupon.type,
        value: coupon.value,
      },
      discount: discountAmount,
      message: coupon.type === 'PERCENTAGE'
        ? `${coupon.value}% off applied`
        : `¥${coupon.value} off applied`,
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/coupons/validate - Remove coupon from cart
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cartId = searchParams.get('cartId');

    if (!cartId) {
      return NextResponse.json({ error: 'Cart ID required' }, { status: 400 });
    }

    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
    });

    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    // Remove coupon and recalculate total
    await prisma.cart.update({
      where: { id: cartId },
      data: {
        couponId: null,
        discount: 0,
        total: cart.subtotal + cart.tax,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove coupon error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
