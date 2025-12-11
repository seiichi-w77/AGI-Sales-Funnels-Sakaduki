import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { Prisma } from '@prisma/client';

const updateProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  shortDescription: z.string().max(500).optional(),
  type: z.enum(['DIGITAL', 'PHYSICAL', 'SERVICE', 'SUBSCRIPTION', 'COURSE', 'BUNDLE']).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
  imageUrl: z.string().url().optional().nullable(),
  sku: z.string().optional().nullable(),
  trackInventory: z.boolean().optional(),
  inventoryCount: z.number().int().min(0).optional(),
  weight: z.number().optional().nullable(),
  weightUnit: z.string().optional().nullable(),
  taxable: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional(),
});

// GET /api/products/[productId] - Get single product
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
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        prices: {
          orderBy: { isDefault: 'desc' },
        },
        variants: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: { orderItems: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/products/[productId] - Update product
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
    const parsed = updateProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Update slug if name changes
    let slug = existingProduct.slug;
    if (parsed.data.name && parsed.data.name !== existingProduct.name) {
      const baseSlug = parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const existingSlug = await prisma.product.findFirst({
        where: {
          workspaceId: existingProduct.workspaceId,
          slug: baseSlug,
          id: { not: productId },
        },
      });
      slug = existingSlug ? `${baseSlug}-${Date.now()}` : baseSlug;
    }

    // Build update data with proper types
    const updateData: Prisma.ProductUpdateInput = {
      slug,
    };

    if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
    if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
    if (parsed.data.shortDescription !== undefined) updateData.shortDescription = parsed.data.shortDescription;
    if (parsed.data.type !== undefined) updateData.type = parsed.data.type;
    if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
    if (parsed.data.imageUrl !== undefined) updateData.imageUrl = parsed.data.imageUrl;
    if (parsed.data.sku !== undefined) updateData.sku = parsed.data.sku;
    if (parsed.data.trackInventory !== undefined) updateData.trackInventory = parsed.data.trackInventory;
    if (parsed.data.inventoryCount !== undefined) updateData.inventoryCount = parsed.data.inventoryCount;
    if (parsed.data.weight !== undefined) updateData.weight = parsed.data.weight;
    if (parsed.data.weightUnit !== undefined) updateData.weightUnit = parsed.data.weightUnit;
    if (parsed.data.taxable !== undefined) updateData.taxable = parsed.data.taxable;
    if (parsed.data.metadata !== undefined) updateData.metadata = parsed.data.metadata as Prisma.InputJsonValue;

    const product = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        prices: true,
        variants: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        workspaceId: existingProduct.workspaceId,
        actorId: session.user?.id,
        actorType: 'USER',
        action: 'product.update',
        entityType: 'Product',
        entityId: productId,
        oldValue: existingProduct,
        newValue: product,
      },
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/products/[productId] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { productId } = await params;

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        _count: {
          select: { orderItems: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Don't allow deletion if product has orders
    if (product._count.orderItems > 0) {
      // Instead, archive the product
      await prisma.product.update({
        where: { id: productId },
        data: { status: 'ARCHIVED' },
      });

      return NextResponse.json({
        message: 'Product has orders and was archived instead of deleted',
        archived: true,
      });
    }

    // Create audit log before deletion
    await prisma.auditLog.create({
      data: {
        workspaceId: product.workspaceId,
        actorId: session.user?.id,
        actorType: 'USER',
        action: 'product.delete',
        entityType: 'Product',
        entityId: productId,
        oldValue: product,
      },
    });

    // Delete product (cascades to prices and variants)
    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
