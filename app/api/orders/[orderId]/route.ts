import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { OrderStatus, Prisma } from '@prisma/client';

const updateOrderSchema = z.object({
  status: z.enum([
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'CANCELED',
    'REFUNDED',
    'PARTIALLY_REFUNDED',
    'FAILED',
  ]).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

// GET /api/orders/[orderId] - Get single order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orderId } = await params;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
            price: true,
            variant: true,
          },
        },
        contact: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
        fulfillments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/orders/[orderId] - Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orderId } = await params;

  try {
    const body = await request.json();
    const parsed = updateOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Handle status-specific updates
    const updateData: Prisma.OrderUpdateInput = {};

    if (parsed.data.status) {
      updateData.status = parsed.data.status as OrderStatus;
    }
    if (parsed.data.notes !== undefined) {
      updateData.notes = parsed.data.notes;
    }
    if (parsed.data.metadata !== undefined) {
      updateData.metadata = parsed.data.metadata as Prisma.InputJsonValue;
    }

    if (parsed.data.status === 'CANCELED') {
      updateData.canceledAt = new Date();
    } else if (parsed.data.status === 'COMPLETED') {
      updateData.fulfilledAt = new Date();
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        workspaceId: existingOrder.workspaceId,
        actorId: session.user?.id,
        actorType: 'USER',
        action: 'order.update',
        entityType: 'Order',
        entityId: orderId,
        oldValue: { status: existingOrder.status },
        newValue: { status: order.status },
      },
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
