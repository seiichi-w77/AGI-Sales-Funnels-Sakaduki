import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { getProductById, updateProduct, deleteProduct } from '@/lib/product/service'
import { prisma } from '@/lib/db/prisma'

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
  sku: z.string().optional().nullable(),
  trackInventory: z.boolean().optional(),
  inventoryCount: z.number().int().min(0).optional(),
  taxable: z.boolean().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

// Helper to get product and verify access
async function getProductWithAccess(productId: string, userId: string, requireAdmin = false) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { workspace: true },
  })

  if (!product) {
    return { error: 'Product not found', status: 404 }
  }

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: product.workspaceId,
        userId,
      },
    },
  })

  if (!member) {
    return { error: 'Access denied', status: 403 }
  }

  if (requireAdmin && !['OWNER', 'ADMIN'].includes(member.role)) {
    return { error: 'Admin access required', status: 403 }
  }

  return { product, member }
}

// GET /api/products/[productId] - Get product
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
    const result = await getProductWithAccess(productId, session.user.id)

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    const product = await getProductById(productId)
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error getting product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/products/[productId] - Update product
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId } = await params
    const result = await getProductWithAccess(productId, session.user.id, true)

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    const body = await request.json()
    const validatedData = updateProductSchema.parse(body)

    const product = await updateProduct(productId, validatedData)
    return NextResponse.json(product)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 })
    }
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/products/[productId] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId } = await params
    const result = await getProductWithAccess(productId, session.user.id, true)

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    await deleteProduct(productId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
