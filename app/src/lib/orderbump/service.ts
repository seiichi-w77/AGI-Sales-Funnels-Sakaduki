import { prisma } from '@/lib/db/prisma'

export interface OrderBump {
  id: string
  funnelStepId: string
  productId: string
  headline: string
  description: string
  displayPrice: number
  discountPrice?: number
  imageUrl?: string | null
  isActive: boolean
  position: 'before_checkout' | 'after_checkout' | 'in_form'
  sortOrder: number
}

export interface CreateOrderBumpInput {
  funnelStepId: string
  productId: string
  priceId: string
  headline: string
  description: string
  discountPercent?: number
  imageUrl?: string
  position?: 'before_checkout' | 'after_checkout' | 'in_form'
}

export interface OrderBumpStats {
  totalImpressions: number
  totalAccepted: number
  acceptanceRate: number
  totalRevenue: number
}

/**
 * Get order bumps for a funnel step
 */
export async function getOrderBumpsForStep(funnelStepId: string): Promise<OrderBump[]> {
  const step = await prisma.funnelStep.findUnique({
    where: { id: funnelStepId },
    select: {
      settings: true,
    },
  })

  if (!step?.settings) {
    return []
  }

  const settings = step.settings as Record<string, unknown>
  const orderBumps = (settings.orderBumps || []) as OrderBump[]

  // Fetch product details for each order bump
  const bumpsWithProducts: OrderBump[] = []

  for (const bump of orderBumps) {
    const product = await prisma.product.findUnique({
      where: { id: bump.productId },
      include: {
        prices: {
          where: { isDefault: true },
          take: 1,
        },
      },
    })

    if (product) {
      bumpsWithProducts.push({
        ...bump,
        displayPrice: product.prices[0]?.amount || 0,
        imageUrl: bump.imageUrl || product.imageUrl,
      })
    }
  }

  return bumpsWithProducts
}

/**
 * Create an order bump for a funnel step
 */
export async function createOrderBump(input: CreateOrderBumpInput): Promise<OrderBump> {
  const {
    funnelStepId,
    productId,
    priceId,
    headline,
    description,
    discountPercent,
    imageUrl,
    position = 'before_checkout',
  } = input

  // Get product and price
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      prices: {
        where: { id: priceId },
      },
    },
  })

  if (!product || product.prices.length === 0) {
    throw new Error('Product or price not found')
  }

  const price = product.prices[0]
  const displayPrice = price.amount
  const discountPrice = discountPercent
    ? Math.round(displayPrice * (1 - discountPercent / 100))
    : undefined

  // Get current step settings
  const step = await prisma.funnelStep.findUnique({
    where: { id: funnelStepId },
    select: { settings: true },
  })

  const settings = (step?.settings || {}) as Record<string, unknown>
  const existingBumps = (settings.orderBumps || []) as OrderBump[]

  const newBump: OrderBump = {
    id: `bump-${Date.now()}`,
    funnelStepId,
    productId,
    headline,
    description,
    displayPrice,
    discountPrice,
    imageUrl: imageUrl || product.imageUrl || undefined,
    isActive: true,
    position,
    sortOrder: existingBumps.length,
  }

  // Update step settings
  await prisma.funnelStep.update({
    where: { id: funnelStepId },
    data: {
      settings: {
        ...settings,
        orderBumps: [...existingBumps, newBump],
      } as object,
    },
  })

  return newBump
}

/**
 * Update an order bump
 */
export async function updateOrderBump(
  funnelStepId: string,
  bumpId: string,
  updates: Partial<Omit<OrderBump, 'id' | 'funnelStepId'>>
): Promise<OrderBump> {
  const step = await prisma.funnelStep.findUnique({
    where: { id: funnelStepId },
    select: { settings: true },
  })

  if (!step?.settings) {
    throw new Error('Step not found')
  }

  const settings = step.settings as Record<string, unknown>
  const orderBumps = (settings.orderBumps || []) as OrderBump[]

  const bumpIndex = orderBumps.findIndex((b) => b.id === bumpId)
  if (bumpIndex === -1) {
    throw new Error('Order bump not found')
  }

  const updatedBump = { ...orderBumps[bumpIndex], ...updates }
  orderBumps[bumpIndex] = updatedBump

  await prisma.funnelStep.update({
    where: { id: funnelStepId },
    data: {
      settings: {
        ...settings,
        orderBumps,
      } as object,
    },
  })

  return updatedBump
}

/**
 * Delete an order bump
 */
export async function deleteOrderBump(funnelStepId: string, bumpId: string): Promise<void> {
  const step = await prisma.funnelStep.findUnique({
    where: { id: funnelStepId },
    select: { settings: true },
  })

  if (!step?.settings) {
    throw new Error('Step not found')
  }

  const settings = step.settings as Record<string, unknown>
  const orderBumps = (settings.orderBumps || []) as OrderBump[]

  const filteredBumps = orderBumps.filter((b) => b.id !== bumpId)

  await prisma.funnelStep.update({
    where: { id: funnelStepId },
    data: {
      settings: {
        ...settings,
        orderBumps: filteredBumps,
      } as object,
    },
  })
}

/**
 * Reorder order bumps
 */
export async function reorderOrderBumps(
  funnelStepId: string,
  bumpIds: string[]
): Promise<void> {
  const step = await prisma.funnelStep.findUnique({
    where: { id: funnelStepId },
    select: { settings: true },
  })

  if (!step?.settings) {
    throw new Error('Step not found')
  }

  const settings = step.settings as Record<string, unknown>
  const orderBumps = (settings.orderBumps || []) as OrderBump[]

  // Create a map for quick lookup
  const bumpMap = new Map(orderBumps.map((b) => [b.id, b]))

  // Reorder based on provided IDs
  const reorderedBumps = bumpIds
    .map((id, index) => {
      const bump = bumpMap.get(id)
      if (bump) {
        return { ...bump, sortOrder: index }
      }
      return null
    })
    .filter((b): b is OrderBump => b !== null)

  await prisma.funnelStep.update({
    where: { id: funnelStepId },
    data: {
      settings: {
        ...settings,
        orderBumps: reorderedBumps,
      } as object,
    },
  })
}

/**
 * Add order bump to cart
 */
export async function addOrderBumpToCart(
  cartId: string,
  bumpId: string,
  funnelStepId: string
): Promise<void> {
  // Get order bump details
  const bumps = await getOrderBumpsForStep(funnelStepId)
  const bump = bumps.find((b) => b.id === bumpId)

  if (!bump || !bump.isActive) {
    throw new Error('Order bump not found or inactive')
  }

  // Get product and price
  const product = await prisma.product.findUnique({
    where: { id: bump.productId },
    include: {
      prices: {
        where: { isDefault: true },
        take: 1,
      },
    },
  })

  if (!product || product.prices.length === 0) {
    throw new Error('Product not found')
  }

  const price = product.prices[0]
  const unitPrice = bump.discountPrice || bump.displayPrice

  // Check if item already exists in cart
  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId,
      productId: bump.productId,
    },
  })

  if (existingItem) {
    // Update quantity
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + 1 },
    })
  } else {
    // Add new item
    await prisma.cartItem.create({
      data: {
        cartId,
        productId: bump.productId,
        priceId: price.id,
        quantity: 1,
        unitPrice,
        currency: price.currency,
        metadata: {
          orderBumpId: bumpId,
          funnelStepId,
        },
      },
    })
  }

  // Recalculate cart totals
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { items: true },
  })

  if (cart) {
    const subtotal = cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
    await prisma.cart.update({
      where: { id: cartId },
      data: {
        subtotal,
        total: subtotal + cart.tax - cart.discount,
      },
    })
  }
}

/**
 * Track order bump impression
 */
export async function trackOrderBumpImpression(
  funnelStepId: string,
  bumpId: string,
  sessionId: string
): Promise<void> {
  // In a production app, this would store analytics data
  // For now, we'll track in funnel analytics
  const step = await prisma.funnelStep.findUnique({
    where: { id: funnelStepId },
    select: {
      funnelId: true,
      settings: true,
    },
  })

  if (!step) return

  const settings = (step.settings || {}) as Record<string, unknown>
  const bumpStats = (settings.bumpStats || {}) as Record<string, { impressions: number; accepted: number }>

  if (!bumpStats[bumpId]) {
    bumpStats[bumpId] = { impressions: 0, accepted: 0 }
  }

  bumpStats[bumpId].impressions++

  await prisma.funnelStep.update({
    where: { id: funnelStepId },
    data: {
      settings: {
        ...settings,
        bumpStats,
      } as object,
    },
  })
}

/**
 * Track order bump acceptance
 */
export async function trackOrderBumpAcceptance(
  funnelStepId: string,
  bumpId: string,
  revenue: number
): Promise<void> {
  const step = await prisma.funnelStep.findUnique({
    where: { id: funnelStepId },
    select: { settings: true },
  })

  if (!step?.settings) return

  const settings = step.settings as Record<string, unknown>
  const bumpStats = (settings.bumpStats || {}) as Record<
    string,
    { impressions: number; accepted: number; revenue: number }
  >

  if (!bumpStats[bumpId]) {
    bumpStats[bumpId] = { impressions: 0, accepted: 0, revenue: 0 }
  }

  bumpStats[bumpId].accepted++
  bumpStats[bumpId].revenue = (bumpStats[bumpId].revenue || 0) + revenue

  await prisma.funnelStep.update({
    where: { id: funnelStepId },
    data: {
      settings: {
        ...settings,
        bumpStats,
      } as object,
    },
  })
}

/**
 * Get order bump stats for a funnel step
 */
export async function getOrderBumpStats(funnelStepId: string): Promise<Record<string, OrderBumpStats>> {
  const step = await prisma.funnelStep.findUnique({
    where: { id: funnelStepId },
    select: { settings: true },
  })

  if (!step?.settings) {
    return {}
  }

  const settings = step.settings as Record<string, unknown>
  const bumpStats = (settings.bumpStats || {}) as Record<
    string,
    { impressions: number; accepted: number; revenue: number }
  >

  const result: Record<string, OrderBumpStats> = {}

  for (const [bumpId, stats] of Object.entries(bumpStats)) {
    result[bumpId] = {
      totalImpressions: stats.impressions,
      totalAccepted: stats.accepted,
      acceptanceRate: stats.impressions > 0 ? (stats.accepted / stats.impressions) * 100 : 0,
      totalRevenue: stats.revenue || 0,
    }
  }

  return result
}
