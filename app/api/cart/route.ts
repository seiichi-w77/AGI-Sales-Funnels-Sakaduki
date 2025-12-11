import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { cookies } from 'next/headers';

const addItemSchema = z.object({
  workspaceId: z.string(),
  productId: z.string(),
  priceId: z.string(),
  variantId: z.string().optional(),
  quantity: z.number().int().min(1).default(1),
});

const updateItemSchema = z.object({
  cartItemId: z.string(),
  quantity: z.number().int().min(0),
});

// Get or create session ID for anonymous carts
async function getSessionId(): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get('cart_session')?.value;

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    // Note: cookies can only be set in Server Actions or Route Handlers
    // The client will need to handle this
  }

  return sessionId;
}

// Calculate cart totals
async function calculateCartTotals(cartId: string) {
  const items = await prisma.cartItem.findMany({
    where: { cartId },
  });

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const discount = 0; // Will be calculated with coupon
  const tax = 0; // Will be calculated based on settings
  const total = subtotal - discount + tax;

  return { subtotal, discount, tax, total };
}

// GET /api/cart - Get current cart
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const workspaceId = searchParams.get('workspaceId');
  const sessionId = searchParams.get('sessionId');

  if (!workspaceId) {
    return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });
  }

  const session = await auth();
  const userId = session?.user?.id;

  try {
    // Find active cart by user or session
    const cart = await prisma.cart.findFirst({
      where: {
        workspaceId,
        status: 'ACTIVE',
        OR: [
          { userId: userId || undefined },
          { sessionId: sessionId || undefined },
        ].filter(Boolean),
      },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, imageUrl: true, type: true, status: true },
            },
            price: {
              select: { id: true, name: true, type: true, amount: true, currency: true, interval: true },
            },
            variant: {
              select: { id: true, name: true, options: true },
            },
          },
        },
        coupon: true,
      },
    });

    if (!cart) {
      return NextResponse.json({
        cart: null,
        items: [],
        totals: { subtotal: 0, discount: 0, tax: 0, total: 0 },
      });
    }

    return NextResponse.json({
      cart: {
        id: cart.id,
        itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
        coupon: cart.coupon,
      },
      items: cart.items,
      totals: {
        subtotal: cart.subtotal,
        discount: cart.discount,
        tax: cart.tax,
        total: cart.total,
      },
    });
  } catch (error) {
    console.error('Get cart error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = addItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { workspaceId, productId, priceId, variantId, quantity } = parsed.data;

    // Verify product and price exist and are active
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { prices: true },
    });

    if (!product || product.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Product not available' }, { status: 400 });
    }

    const price = product.prices.find((p) => p.id === priceId);
    if (!price) {
      return NextResponse.json({ error: 'Price not found' }, { status: 400 });
    }

    // Check inventory if tracked
    if (product.trackInventory && product.inventoryCount < quantity) {
      return NextResponse.json(
        { error: 'Insufficient inventory', available: product.inventoryCount },
        { status: 400 }
      );
    }

    const session = await auth();
    const userId = session?.user?.id;
    const sessionId = body.sessionId || await getSessionId();

    // Find or create cart
    let cart = await prisma.cart.findFirst({
      where: {
        workspaceId,
        status: 'ACTIVE',
        OR: [
          { userId: userId || undefined },
          { sessionId: sessionId || undefined },
        ].filter(Boolean),
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          workspaceId,
          userId,
          sessionId: userId ? undefined : sessionId,
          status: 'ACTIVE',
        },
      });
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        priceId,
        variantId: variantId || null,
      },
    });

    if (existingItem) {
      // Update quantity
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      // Add new item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          priceId,
          variantId,
          quantity,
          unitPrice: price.amount,
          currency: price.currency,
        },
      });
    }

    // Update cart totals
    const totals = await calculateCartTotals(cart.id);
    await prisma.cart.update({
      where: { id: cart.id },
      data: totals,
    });

    // Return updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, imageUrl: true } },
            price: true,
            variant: true,
          },
        },
      },
    });

    return NextResponse.json({
      cart: updatedCart,
      sessionId,
    }, { status: 201 });
  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/cart - Update cart item quantity
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = updateItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { cartItemId, quantity } = parsed.data;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        cart: true,
        product: true,
      },
    });

    if (!cartItem) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }

    // Check inventory
    if (cartItem.product.trackInventory && cartItem.product.inventoryCount < quantity) {
      return NextResponse.json(
        { error: 'Insufficient inventory', available: cartItem.product.inventoryCount },
        { status: 400 }
      );
    }

    if (quantity === 0) {
      // Remove item
      await prisma.cartItem.delete({
        where: { id: cartItemId },
      });
    } else {
      // Update quantity
      await prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity },
      });
    }

    // Update cart totals
    const totals = await calculateCartTotals(cartItem.cartId);
    await prisma.cart.update({
      where: { id: cartItem.cartId },
      data: totals,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update cart error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/cart - Clear cart or remove item
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const cartId = searchParams.get('cartId');
  const cartItemId = searchParams.get('cartItemId');

  try {
    if (cartItemId) {
      // Remove single item
      const cartItem = await prisma.cartItem.findUnique({
        where: { id: cartItemId },
      });

      if (!cartItem) {
        return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
      }

      await prisma.cartItem.delete({
        where: { id: cartItemId },
      });

      // Update cart totals
      const totals = await calculateCartTotals(cartItem.cartId);
      await prisma.cart.update({
        where: { id: cartItem.cartId },
        data: totals,
      });
    } else if (cartId) {
      // Clear entire cart
      await prisma.cartItem.deleteMany({
        where: { cartId },
      });

      await prisma.cart.update({
        where: { id: cartId },
        data: { subtotal: 0, discount: 0, tax: 0, total: 0 },
      });
    } else {
      return NextResponse.json({ error: 'Cart ID or Cart Item ID required' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete cart error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
