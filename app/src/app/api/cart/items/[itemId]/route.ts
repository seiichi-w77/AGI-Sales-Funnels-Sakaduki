import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { updateCartItem, removeFromCart } from '@/lib/cart/service'

const updateItemSchema = z.object({
  quantity: z.number().int().min(0),
})

// PATCH /api/cart/items/[itemId] - Update cart item
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params
    const body = await request.json()
    const { quantity } = updateItemSchema.parse(body)

    const updatedCart = await updateCartItem(itemId, quantity)
    return NextResponse.json(updatedCart)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 })
    }
    if (error instanceof Error && error.message === 'Cart item not found') {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    console.error('Error updating cart item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/cart/items/[itemId] - Remove cart item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params
    const updatedCart = await removeFromCart(itemId)
    return NextResponse.json(updatedCart)
  } catch (error) {
    if (error instanceof Error && error.message === 'Cart item not found') {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    console.error('Error removing cart item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
