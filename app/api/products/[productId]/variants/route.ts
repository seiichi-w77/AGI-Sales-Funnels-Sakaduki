import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { Prisma } from '@prisma/client';

const createVariantSchema = z.object({
  name: z.string().min(1).max(255),
  sku: z.string().optional().nullable(),
  price: z.number().int().min(0).optional().nullable(),
  compareAtPrice: z.number().int().min(0).optional().nullable(),
  inventoryCount: z.number().int().min(0).default(0),
  options: z.record(z.string()).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  sortOrder: z.number().int().default(0),
});

const updateVariantSchema = createVariantSchema.partial();

// GET /api/products/[productId]/variants - List product variants
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
    const variants = await prisma.productVariant.findMany({
      where: { productId },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ variants });
  } catch (error) {
    console.error('Get variants error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/products/[productId]/variants - Create product variant
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
    const parsed = createVariantSchema.safeParse(body);

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

    // Get max sort order
    const maxOrder = await prisma.productVariant.aggregate({
      where: { productId },
      _max: { sortOrder: true },
    });

    const variant = await prisma.productVariant.create({
      data: {
        productId,
        name: parsed.data.name,
        sku: parsed.data.sku,
        price: parsed.data.price,
        compareAtPrice: parsed.data.compareAtPrice,
        inventoryCount: parsed.data.inventoryCount,
        options: parsed.data.options as Prisma.InputJsonValue,
        imageUrl: parsed.data.imageUrl,
        sortOrder: parsed.data.sortOrder || (maxOrder._max.sortOrder || 0) + 1,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        workspaceId: product.workspaceId,
        actorId: session.user?.id,
        actorType: 'USER',
        action: 'product_variant.create',
        entityType: 'ProductVariant',
        entityId: variant.id,
        metadata: { productId } as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({ variant }, { status: 201 });
  } catch (error) {
    console.error('Create variant error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/products/[productId]/variants - Update variant (with variantId in body)
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
    const { variantId, ...data } = body;

    if (!variantId) {
      return NextResponse.json({ error: 'Variant ID required' }, { status: 400 });
    }

    const parsed = updateVariantSchema.safeParse(data);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existingVariant = await prisma.productVariant.findFirst({
      where: { id: variantId, productId },
      include: { product: true },
    });

    if (!existingVariant) {
      return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
    }

    const updateData: Prisma.ProductVariantUpdateInput = {};

    if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
    if (parsed.data.sku !== undefined) updateData.sku = parsed.data.sku;
    if (parsed.data.price !== undefined) updateData.price = parsed.data.price;
    if (parsed.data.compareAtPrice !== undefined) updateData.compareAtPrice = parsed.data.compareAtPrice;
    if (parsed.data.inventoryCount !== undefined) updateData.inventoryCount = parsed.data.inventoryCount;
    if (parsed.data.options !== undefined) updateData.options = parsed.data.options as Prisma.InputJsonValue;
    if (parsed.data.imageUrl !== undefined) updateData.imageUrl = parsed.data.imageUrl;
    if (parsed.data.sortOrder !== undefined) updateData.sortOrder = parsed.data.sortOrder;

    const variant = await prisma.productVariant.update({
      where: { id: variantId },
      data: updateData,
    });

    return NextResponse.json({ variant });
  } catch (error) {
    console.error('Update variant error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/products/[productId]/variants - Delete variant (with variantId in query)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { productId } = await params;
  const variantId = request.nextUrl.searchParams.get('variantId');

  if (!variantId) {
    return NextResponse.json({ error: 'Variant ID required' }, { status: 400 });
  }

  try {
    const variant = await prisma.productVariant.findFirst({
      where: { id: variantId, productId },
      include: {
        product: true,
        _count: { select: { orderItems: true, cartItems: true } },
      },
    });

    if (!variant) {
      return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
    }

    // Don't allow deletion if variant has orders
    if (variant._count.orderItems > 0) {
      return NextResponse.json(
        { error: 'Cannot delete variant with existing orders' },
        { status: 400 }
      );
    }

    await prisma.productVariant.delete({
      where: { id: variantId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete variant error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
