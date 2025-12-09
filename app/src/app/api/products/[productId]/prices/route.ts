import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { createPrice } from '@/lib/product/service'
import { prisma } from '@/lib/db/prisma'

const createPriceSchema = z.object({
  name: z.string().optional(),
  type: z.enum(['ONE_TIME', 'RECURRING', 'PAYMENT_PLAN']),
  amount: z.number().int().min(0),
  currency: z.string().length(3).optional(),
  interval: z.enum(['day', 'week', 'month', 'year']).optional(),
  intervalCount: z.number().int().min(1).optional(),
  trialDays: z.number().int().min(0).optional(),
  installments: z.number().int().min(2).optional(),
  isDefault: z.boolean().optional(),
})

// POST /api/products/[productId]/prices - Create price
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId } = await params

    // Verify product exists and user has access
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: product.workspaceId,
          userId: session.user.id,
        },
      },
    })

    if (!member || !['OWNER', 'ADMIN'].includes(member.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createPriceSchema.parse(body)

    const price = await createPrice({
      productId,
      ...validatedData,
    })

    return NextResponse.json(price, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 })
    }
    console.error('Error creating price:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/products/[productId]/prices - List prices
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId } = await params

    // Verify product exists and user has access
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        prices: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: product.workspaceId,
          userId: session.user.id,
        },
      },
    })

    if (!member) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json(product.prices)
  } catch (error) {
    console.error('Error listing prices:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
