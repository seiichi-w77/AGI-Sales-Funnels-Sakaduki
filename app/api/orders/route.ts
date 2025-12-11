import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { OrderStatus, Prisma } from '@prisma/client';

const addressSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  company: z.string().optional(),
  address1: z.string(),
  address2: z.string().optional(),
  city: z.string(),
  state: z.string().optional(),
  postalCode: z.string(),
  country: z.string(),
  phone: z.string().optional(),
});

const createOrderSchema = z.object({
  workspaceId: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  billingAddress: addressSchema.optional(),
  shippingAddress: addressSchema.optional(),
  items: z.array(z.object({
    productId: z.string(),
    priceId: z.string(),
    variantId: z.string().optional(),
    quantity: z.number().int().min(1).default(1),
  })),
  notes: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Generate unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

// GET /api/orders - List orders
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const workspaceId = searchParams.get('workspaceId');
  const status = searchParams.get('status');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  if (!workspaceId) {
    return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });
  }

  try {
    const where: Prisma.OrderWhereInput = { workspaceId };
    if (status) {
      where.status = status as OrderStatus;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true, imageUrl: true },
              },
            },
          },
          contact: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          _count: {
            select: { transactions: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/orders - Create order (internal use, checkout creates orders)
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { workspaceId, items, ...orderData } = parsed.data;

    // Fetch product and price details for each item
    const itemDetails = await Promise.all(
      items.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: { prices: true },
        });

        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        const price = product.prices.find((p) => p.id === item.priceId);
        if (!price) {
          throw new Error(`Price not found: ${item.priceId}`);
        }

        return {
          productId: product.id,
          priceId: price.id,
          variantId: item.variantId,
          name: product.name,
          description: product.shortDescription,
          quantity: item.quantity,
          unitPrice: price.amount,
          totalPrice: price.amount * item.quantity,
        };
      })
    );

    // Calculate totals
    const subtotal = itemDetails.reduce((sum, item) => sum + item.totalPrice, 0);
    const discountTotal = 0; // Will be handled by coupon system later
    const taxTotal = 0; // Will be calculated based on settings
    const shippingTotal = 0; // Will be calculated based on shipping settings
    const total = subtotal - discountTotal + taxTotal + shippingTotal;

    // Create order with items
    const order = await prisma.order.create({
      data: {
        workspaceId,
        orderNumber: generateOrderNumber(),
        status: 'PENDING',
        email: orderData.email,
        phone: orderData.phone,
        billingAddress: orderData.billingAddress as object | undefined,
        shippingAddress: orderData.shippingAddress as object | undefined,
        subtotal,
        discountTotal,
        taxTotal,
        shippingTotal,
        total,
        currency: 'JPY',
        notes: orderData.notes,
        metadata: orderData.metadata as object | undefined,
        items: {
          create: itemDetails,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        workspaceId,
        actorId: session.user?.id,
        actorType: 'USER',
        action: 'order.create',
        entityType: 'Order',
        entityId: order.id,
        metadata: { orderNumber: order.orderNumber },
      },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
