import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

const productSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['DIGITAL', 'PHYSICAL', 'SUBSCRIPTION', 'SERVICE']),
  description: z.string().optional(),
  price: z.number().min(0),
  currency: z.string().default('JPY'),
});

// GET /api/products - List products
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const workspaceId = searchParams.get('workspaceId');

  if (!workspaceId) {
    return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });
  }

  const products = await prisma.product.findMany({
    where: { workspaceId },
    include: {
      _count: {
        select: { orderItems: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ products });
}

// POST /api/products - Create product
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { workspaceId, ...data } = body;

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });
    }

    const parsed = productSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Generate unique slug
    const slug = `${parsed.data.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

    const product = await prisma.product.create({
      data: {
        workspace: { connect: { id: workspaceId } },
        slug,
        ...parsed.data,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
