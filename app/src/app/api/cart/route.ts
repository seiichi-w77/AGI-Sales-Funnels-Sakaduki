import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { getOrCreateCart, addToCart, clearCart, applyCoupon, removeCoupon } from '@/lib/cart/service'
import { cookies } from 'next/headers'

const addToCartSchema = z.object({
  workspaceId: z.string(),
  productId: z.string(),
  priceId: z.string(),
  variantId: z.string().optional(),
  quantity: z.number().int().min(1).optional(),
})

const couponSchema = z.object({
  code: z.string().min(1),
})

// GET /api/cart - Get cart
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const sessionId = cookieStore.get('cart_session')?.value || crypto.randomUUID()

    // Set session cookie if not exists
    if (!cookieStore.get('cart_session')) {
      const response = NextResponse.json(
        await getOrCreateCart(workspaceId, session?.user?.id, sessionId)
      )
      response.cookies.set('cart_session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })
      return response
    }

    const cart = await getOrCreateCart(workspaceId, session?.user?.id, sessionId)
    return NextResponse.json(cart)
  } catch (error) {
    console.error('Error getting cart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/cart - Add to cart
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const body = await request.json()
    const validatedData = addToCartSchema.parse(body)

    const cookieStore = await cookies()
    let sessionId = cookieStore.get('cart_session')?.value

    if (!sessionId) {
      sessionId = crypto.randomUUID()
    }

    const cart = await getOrCreateCart(
      validatedData.workspaceId,
      session?.user?.id,
      sessionId
    )

    const updatedCart = await addToCart(cart.id, {
      productId: validatedData.productId,
      priceId: validatedData.priceId,
      variantId: validatedData.variantId,
      quantity: validatedData.quantity,
    })

    const response = NextResponse.json(updatedCart)

    if (!cookieStore.get('cart_session')) {
      response.cookies.set('cart_session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
      })
    }

    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 })
    }
    console.error('Error adding to cart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/cart - Clear cart
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const sessionId = cookieStore.get('cart_session')?.value

    if (!session?.user?.id && !sessionId) {
      return NextResponse.json({ error: 'No cart found' }, { status: 404 })
    }

    const cart = await getOrCreateCart(workspaceId, session?.user?.id, sessionId)
    await clearCart(cart.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error clearing cart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/cart - Apply/remove coupon
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    const action = searchParams.get('action')

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const sessionId = cookieStore.get('cart_session')?.value

    if (!session?.user?.id && !sessionId) {
      return NextResponse.json({ error: 'No cart found' }, { status: 404 })
    }

    const cart = await getOrCreateCart(workspaceId, session?.user?.id, sessionId)

    if (action === 'remove-coupon') {
      const updatedCart = await removeCoupon(cart.id)
      return NextResponse.json(updatedCart)
    }

    const body = await request.json()
    const { code } = couponSchema.parse(body)
    const updatedCart = await applyCoupon(cart.id, code)

    return NextResponse.json(updatedCart)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 })
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('Error applying coupon:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
