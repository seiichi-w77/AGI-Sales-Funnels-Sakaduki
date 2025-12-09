import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { getOrderById, updateOrderStatus } from '@/lib/checkout/service'
import { prisma } from '@/lib/db/prisma'

const updateOrderSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELED', 'PARTIALLY_REFUNDED']),
})

// GET /api/orders/[orderId] - Get order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await auth()
    const { orderId } = await params

    const order = await getOrderById(orderId)

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check access - either workspace member or customer
    if (session?.user?.id) {
      const member = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: order.workspaceId,
            userId: session.user.id,
          },
        },
      })

      // Check if this user is the contact owner
      const isContactOwner = order.contact?.ownerId === session.user.id

      if (!member && !isContactOwner) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    } else {
      // Anonymous access - check by email in request
      const { searchParams } = new URL(request.url)
      const email = searchParams.get('email')

      if (order.email !== email) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error getting order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/orders/[orderId] - Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId } = await params
    const order = await getOrderById(orderId)

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Verify admin access
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: order.workspaceId,
          userId: session.user.id,
        },
      },
    })

    if (!member || !['OWNER', 'ADMIN'].includes(member.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { status } = updateOrderSchema.parse(body)

    const updatedOrder = await updateOrderStatus(orderId, status)
    return NextResponse.json(updatedOrder)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 })
    }
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
