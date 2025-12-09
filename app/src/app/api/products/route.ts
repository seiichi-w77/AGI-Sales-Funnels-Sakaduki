import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { createProduct, listProducts, generateUniqueProductSlug } from '@/lib/product/service'
import { prisma } from '@/lib/db/prisma'

const createProductSchema = z.object({
  workspaceId: z.string(),
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  imageUrl: z.string().url().optional(),
  type: z.enum(['DIGITAL', 'PHYSICAL', 'SERVICE', 'SUBSCRIPTION', 'BUNDLE']).optional(),
  sku: z.string().optional(),
  trackInventory: z.boolean().optional(),
  inventoryCount: z.number().int().min(0).optional(),
  taxable: z.boolean().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

// GET /api/products - List products
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    const status = searchParams.get('status') as 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | null
    const type = searchParams.get('type') as 'DIGITAL' | 'PHYSICAL' | 'SERVICE' | 'SUBSCRIPTION' | 'BUNDLE' | null
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 })
    }

    // Verify user has access to workspace
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: session.user.id,
        },
      },
    })

    if (!member) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const result = await listProducts(workspaceId, {
      status: status || undefined,
      type: type || undefined,
      limit,
      offset,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error listing products:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/products - Create product
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createProductSchema.parse(body)

    // Verify user has access to workspace
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: validatedData.workspaceId,
          userId: session.user.id,
        },
      },
    })

    if (!member || !['OWNER', 'ADMIN'].includes(member.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Generate slug if not provided
    const slug = validatedData.slug || await generateUniqueProductSlug(validatedData.workspaceId, validatedData.name)

    const product = await createProduct({
      ...validatedData,
      slug,
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 })
    }
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
