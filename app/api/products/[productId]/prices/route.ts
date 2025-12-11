import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

const createPriceSchema = z.object({
  name: z.string().optional(),
  type: z.enum(['ONE_TIME', 'RECURRING', 'PAYMENT_PLAN']),
  amount: z.number().int().min(0),
  currency: z.string().default('JPY'),
  interval: z.string().optional(), // month, year, week, day
  intervalCount: z.number().int().min(1).optional(),
  trialDays: z.number().int().min(0).optional(),
  installments: z.number().int().min(2).optional(), // For payment plans
  isDefault: z.boolean().optional(),
});

const updatePriceSchema = createPriceSchema.partial();

// GET /api/products/[productId]/prices - List product prices
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { productId } = await params;

  try {
    const prices = await prisma.productPrice.findMany({
      where: { productId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    return NextResponse.json({ prices });
  } catch (error) {
    console.error('Get prices error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/products/[productId]/prices - Create product price
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { productId } = await params;

  try {
    const body = await request.json();
    const parsed = createPriceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Check product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // If this is set as default, unset other defaults
    if (parsed.data.isDefault) {
      await prisma.productPrice.updateMany({
        where: { productId },
        data: { isDefault: false },
      });
    }

    // Check if this is the first price (make it default)
    const existingPrices = await prisma.productPrice.count({
      where: { productId },
    });

    const price = await prisma.productPrice.create({
      data: {
        productId,
        ...parsed.data,
        isDefault: parsed.data.isDefault || existingPrices === 0,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        workspaceId: product.workspaceId,
        actorId: session.user?.id,
        actorType: 'USER',
        action: 'product_price.create',
        entityType: 'ProductPrice',
        entityId: price.id,
        metadata: { productId },
      },
    });

    return NextResponse.json({ price }, { status: 201 });
  } catch (error) {
    console.error('Create price error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/products/[productId]/prices - Update price (with priceId in body)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { productId } = await params;

  try {
    const body = await request.json();
    const { priceId, ...data } = body;

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID required' }, { status: 400 });
    }

    const parsed = updatePriceSchema.safeParse(data);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existingPrice = await prisma.productPrice.findFirst({
      where: { id: priceId, productId },
      include: { product: true },
    });

    if (!existingPrice) {
      return NextResponse.json({ error: 'Price not found' }, { status: 404 });
    }

    // If setting as default, unset others
    if (parsed.data.isDefault) {
      await prisma.productPrice.updateMany({
        where: { productId, id: { not: priceId } },
        data: { isDefault: false },
      });
    }

    const price = await prisma.productPrice.update({
      where: { id: priceId },
      data: parsed.data,
    });

    return NextResponse.json({ price });
  } catch (error) {
    console.error('Update price error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/products/[productId]/prices - Delete price (with priceId in query)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { productId } = await params;
  const priceId = request.nextUrl.searchParams.get('priceId');

  if (!priceId) {
    return NextResponse.json({ error: 'Price ID required' }, { status: 400 });
  }

  try {
    const price = await prisma.productPrice.findFirst({
      where: { id: priceId, productId },
      include: {
        product: true,
        _count: { select: { orderItems: true } },
      },
    });

    if (!price) {
      return NextResponse.json({ error: 'Price not found' }, { status: 404 });
    }

    // Don't allow deletion if price has orders
    if (price._count.orderItems > 0) {
      return NextResponse.json(
        { error: 'Cannot delete price with existing orders' },
        { status: 400 }
      );
    }

    await prisma.productPrice.delete({
      where: { id: priceId },
    });

    // If deleted price was default, set another as default
    if (price.isDefault) {
      const nextPrice = await prisma.productPrice.findFirst({
        where: { productId },
        orderBy: { createdAt: 'asc' },
      });
      if (nextPrice) {
        await prisma.productPrice.update({
          where: { id: nextPrice.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete price error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
