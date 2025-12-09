import { prisma } from '@/lib/db/prisma'
import type { Cart, CartItem } from '@prisma/client'

export interface CartWithItems extends Cart {
  items: (CartItem & {
    product: {
      id: string
      name: string
      imageUrl: string | null
      status: string
    }
    variant?: {
      id: string
      name: string
      price: number | null
    } | null
    price: {
      id: string
      name: string | null
      amount: number
      currency: string
      type: string
    }
  })[]
}

export interface AddToCartInput {
  productId: string
  priceId: string
  variantId?: string
  quantity?: number
}

/**
 * Get or create cart for user/session
 */
export async function getOrCreateCart(
  workspaceId: string,
  userId?: string,
  sessionId?: string
): Promise<CartWithItems> {
  if (!userId && !sessionId) {
    throw new Error('Either userId or sessionId is required')
  }

  // Try to find existing cart
  let cart = await prisma.cart.findFirst({
    where: {
      workspaceId,
      ...(userId ? { userId } : { sessionId }),
      status: 'ACTIVE',
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              status: true,
            },
          },
          variant: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
          price: {
            select: {
              id: true,
              name: true,
              amount: true,
              currency: true,
              type: true,
            },
          },
        },
      },
    },
  })

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        workspaceId,
        userId,
        sessionId,
        status: 'ACTIVE',
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                status: true,
              },
            },
            variant: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
            price: {
              select: {
                id: true,
                name: true,
                amount: true,
                currency: true,
                type: true,
              },
            },
          },
        },
      },
    })
  }

  return cart as CartWithItems
}

/**
 * Add item to cart
 */
export async function addToCart(cartId: string, input: AddToCartInput): Promise<CartWithItems> {
  const { productId, priceId, variantId, quantity = 1 } = input

  // Get price info
  const price = await prisma.productPrice.findUnique({
    where: { id: priceId },
    include: { product: true },
  })

  if (!price || price.productId !== productId) {
    throw new Error('Invalid price for product')
  }

  // Check if item already exists
  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId,
      productId,
      priceId,
      variantId: variantId || null,
    },
  })

  if (existingItem) {
    // Update quantity
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
    })
  } else {
    // Create new item
    await prisma.cartItem.create({
      data: {
        cartId,
        productId,
        priceId,
        variantId,
        quantity,
        unitPrice: price.amount,
        currency: price.currency,
      },
    })
  }

  // Update cart totals
  await updateCartTotals(cartId)

  return getCartById(cartId) as Promise<CartWithItems>
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(
  cartItemId: string,
  quantity: number
): Promise<CartWithItems> {
  const item = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
  })

  if (!item) {
    throw new Error('Cart item not found')
  }

  if (quantity <= 0) {
    await prisma.cartItem.delete({
      where: { id: cartItemId },
    })
  } else {
    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    })
  }

  await updateCartTotals(item.cartId)

  return getCartById(item.cartId) as Promise<CartWithItems>
}

/**
 * Remove item from cart
 */
export async function removeFromCart(cartItemId: string): Promise<CartWithItems> {
  const item = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
  })

  if (!item) {
    throw new Error('Cart item not found')
  }

  await prisma.cartItem.delete({
    where: { id: cartItemId },
  })

  await updateCartTotals(item.cartId)

  return getCartById(item.cartId) as Promise<CartWithItems>
}

/**
 * Clear cart
 */
export async function clearCart(cartId: string): Promise<void> {
  await prisma.cartItem.deleteMany({
    where: { cartId },
  })

  await updateCartTotals(cartId)
}

/**
 * Get cart by ID
 */
export async function getCartById(cartId: string): Promise<CartWithItems | null> {
  return prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              status: true,
            },
          },
          variant: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
          price: {
            select: {
              id: true,
              name: true,
              amount: true,
              currency: true,
              type: true,
            },
          },
        },
      },
    },
  }) as Promise<CartWithItems | null>
}

/**
 * Update cart totals
 */
async function updateCartTotals(cartId: string): Promise<void> {
  const items = await prisma.cartItem.findMany({
    where: { cartId },
  })

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)

  await prisma.cart.update({
    where: { id: cartId },
    data: {
      subtotal,
      total: subtotal, // Can add tax/discounts later
    },
  })
}

/**
 * Apply coupon to cart
 */
export async function applyCoupon(cartId: string, couponCode: string): Promise<CartWithItems> {
  const coupon = await prisma.coupon.findFirst({
    where: {
      code: couponCode,
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
  })

  if (!coupon) {
    throw new Error('Invalid or expired coupon')
  }

  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    throw new Error('Coupon usage limit reached')
  }

  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
  })

  if (!cart) {
    throw new Error('Cart not found')
  }

  let discount = 0
  if (coupon.type === 'PERCENTAGE') {
    discount = Math.round(cart.subtotal * (coupon.value / 100))
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount
    }
  } else {
    discount = coupon.value
  }

  await prisma.cart.update({
    where: { id: cartId },
    data: {
      couponId: coupon.id,
      discount,
      total: cart.subtotal - discount,
    },
  })

  return getCartById(cartId) as Promise<CartWithItems>
}

/**
 * Remove coupon from cart
 */
export async function removeCoupon(cartId: string): Promise<CartWithItems> {
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
  })

  if (!cart) {
    throw new Error('Cart not found')
  }

  await prisma.cart.update({
    where: { id: cartId },
    data: {
      couponId: null,
      discount: 0,
      total: cart.subtotal,
    },
  })

  return getCartById(cartId) as Promise<CartWithItems>
}

/**
 * Merge guest cart with user cart after login
 */
export async function mergeGuestCart(
  workspaceId: string,
  userId: string,
  sessionId: string
): Promise<CartWithItems | null> {
  const guestCart = await prisma.cart.findFirst({
    where: {
      workspaceId,
      sessionId,
      status: 'ACTIVE',
    },
    include: { items: true },
  })

  if (!guestCart || guestCart.items.length === 0) {
    return null
  }

  // Get or create user cart
  const userCart = await getOrCreateCart(workspaceId, userId)

  // Move items from guest cart to user cart
  for (const item of guestCart.items) {
    await addToCart(userCart.id, {
      productId: item.productId,
      priceId: item.priceId,
      variantId: item.variantId || undefined,
      quantity: item.quantity,
    })
  }

  // Mark guest cart as abandoned
  await prisma.cart.update({
    where: { id: guestCart.id },
    data: { status: 'ABANDONED' },
  })

  return getCartById(userCart.id) as Promise<CartWithItems>
}
