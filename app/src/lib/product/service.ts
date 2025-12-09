import { prisma } from '@/lib/db/prisma'
import type { Product, ProductPrice, ProductVariant, ProductType, ProductStatus, PriceType } from '@prisma/client'

export interface CreateProductInput {
  workspaceId: string
  name: string
  slug: string
  description?: string
  shortDescription?: string
  imageUrl?: string
  type?: ProductType
  sku?: string
  trackInventory?: boolean
  inventoryCount?: number
  taxable?: boolean
  metadata?: Record<string, unknown>
}

export interface UpdateProductInput {
  name?: string
  description?: string | null
  shortDescription?: string | null
  imageUrl?: string | null
  status?: ProductStatus
  sku?: string | null
  trackInventory?: boolean
  inventoryCount?: number
  taxable?: boolean
  metadata?: Record<string, unknown>
}

export interface CreatePriceInput {
  productId: string
  name?: string
  type: PriceType
  amount: number
  currency?: string
  interval?: 'day' | 'week' | 'month' | 'year'
  intervalCount?: number
  trialDays?: number
  installments?: number
  isDefault?: boolean
}

export interface CreateVariantInput {
  productId: string
  name: string
  sku?: string
  price?: number
  compareAtPrice?: number
  inventoryCount?: number
  options?: Record<string, string>
  imageUrl?: string
}

/**
 * Create a new product
 */
export async function createProduct(input: CreateProductInput): Promise<Product> {
  const {
    workspaceId,
    name,
    slug,
    description,
    shortDescription,
    imageUrl,
    type = 'DIGITAL',
    sku,
    trackInventory = false,
    inventoryCount = 0,
    taxable = true,
    metadata,
  } = input

  // Check if slug exists
  const existingProduct = await prisma.product.findUnique({
    where: {
      workspaceId_slug: {
        workspaceId,
        slug,
      },
    },
  })

  if (existingProduct) {
    throw new Error('Product slug already exists in this workspace')
  }

  return prisma.product.create({
    data: {
      workspaceId,
      name,
      slug,
      description,
      shortDescription,
      imageUrl,
      type,
      status: 'DRAFT',
      sku,
      trackInventory,
      inventoryCount,
      taxable,
      metadata: metadata as object,
    },
  })
}

/**
 * Get product by ID with full details
 */
export async function getProductById(productId: string): Promise<Product | null> {
  return prisma.product.findUnique({
    where: { id: productId },
    include: {
      prices: {
        orderBy: { createdAt: 'asc' },
      },
      variants: {
        orderBy: { sortOrder: 'asc' },
      },
      _count: {
        select: {
          orderItems: true,
        },
      },
    },
  })
}

/**
 * Get product by slug
 */
export async function getProductBySlug(
  workspaceId: string,
  slug: string
): Promise<Product | null> {
  return prisma.product.findUnique({
    where: {
      workspaceId_slug: {
        workspaceId,
        slug,
      },
    },
    include: {
      prices: true,
      variants: true,
    },
  })
}

/**
 * List products in workspace
 */
export async function listProducts(
  workspaceId: string,
  options?: {
    status?: ProductStatus
    type?: ProductType
    limit?: number
    offset?: number
  }
): Promise<{ products: Product[]; total: number }> {
  const { status, type, limit = 20, offset = 0 } = options || {}

  const where = {
    workspaceId,
    ...(status && { status }),
    ...(type && { type }),
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        prices: {
          where: { isDefault: true },
          take: 1,
        },
        _count: {
          select: {
            variants: true,
            orderItems: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.product.count({ where }),
  ])

  return { products, total }
}

/**
 * Update product
 */
export async function updateProduct(
  productId: string,
  input: UpdateProductInput
): Promise<Product> {
  return prisma.product.update({
    where: { id: productId },
    data: {
      name: input.name,
      description: input.description,
      shortDescription: input.shortDescription,
      imageUrl: input.imageUrl,
      status: input.status,
      sku: input.sku,
      trackInventory: input.trackInventory,
      inventoryCount: input.inventoryCount,
      taxable: input.taxable,
      metadata: input.metadata as object,
    },
  })
}

/**
 * Delete product
 */
export async function deleteProduct(productId: string): Promise<void> {
  await prisma.product.delete({
    where: { id: productId },
  })
}

/**
 * Create product price
 */
export async function createPrice(input: CreatePriceInput): Promise<ProductPrice> {
  const {
    productId,
    name,
    type,
    amount,
    currency = 'USD',
    interval,
    intervalCount = 1,
    trialDays,
    installments,
    isDefault = false,
  } = input

  // If setting as default, unset other defaults
  if (isDefault) {
    await prisma.productPrice.updateMany({
      where: { productId, isDefault: true },
      data: { isDefault: false },
    })
  }

  return prisma.productPrice.create({
    data: {
      productId,
      name,
      type,
      amount,
      currency,
      interval,
      intervalCount,
      trialDays,
      installments,
      isDefault,
    },
  })
}

/**
 * Update product price
 */
export async function updatePrice(
  priceId: string,
  input: Partial<CreatePriceInput>
): Promise<ProductPrice> {
  return prisma.productPrice.update({
    where: { id: priceId },
    data: {
      name: input.name,
      type: input.type,
      amount: input.amount,
      currency: input.currency,
      interval: input.interval,
      intervalCount: input.intervalCount,
      trialDays: input.trialDays,
      installments: input.installments,
      isDefault: input.isDefault,
    },
  })
}

/**
 * Delete product price
 */
export async function deletePrice(priceId: string): Promise<void> {
  await prisma.productPrice.delete({
    where: { id: priceId },
  })
}

/**
 * Create product variant
 */
export async function createVariant(input: CreateVariantInput): Promise<ProductVariant> {
  const { productId, name, sku, price, compareAtPrice, inventoryCount = 0, options, imageUrl } = input

  // Get max sort order
  const lastVariant = await prisma.productVariant.findFirst({
    where: { productId },
    orderBy: { sortOrder: 'desc' },
  })
  const sortOrder = (lastVariant?.sortOrder ?? -1) + 1

  return prisma.productVariant.create({
    data: {
      productId,
      name,
      sku,
      price,
      compareAtPrice,
      inventoryCount,
      options: options as object,
      imageUrl,
      sortOrder,
    },
  })
}

/**
 * Update product variant
 */
export async function updateVariant(
  variantId: string,
  input: Partial<CreateVariantInput>
): Promise<ProductVariant> {
  return prisma.productVariant.update({
    where: { id: variantId },
    data: {
      name: input.name,
      sku: input.sku,
      price: input.price,
      compareAtPrice: input.compareAtPrice,
      inventoryCount: input.inventoryCount,
      options: input.options as object,
      imageUrl: input.imageUrl,
    },
  })
}

/**
 * Delete product variant
 */
export async function deleteVariant(variantId: string): Promise<void> {
  await prisma.productVariant.delete({
    where: { id: variantId },
  })
}

/**
 * Update inventory
 */
export async function updateInventory(
  productId: string,
  variantId: string | null,
  quantity: number,
  operation: 'set' | 'increment' | 'decrement'
): Promise<void> {
  if (variantId) {
    await prisma.productVariant.update({
      where: { id: variantId },
      data: {
        inventoryCount:
          operation === 'set'
            ? quantity
            : operation === 'increment'
              ? { increment: quantity }
              : { decrement: quantity },
      },
    })
  } else {
    await prisma.product.update({
      where: { id: productId },
      data: {
        inventoryCount:
          operation === 'set'
            ? quantity
            : operation === 'increment'
              ? { increment: quantity }
              : { decrement: quantity },
      },
    })
  }
}

/**
 * Generate unique product slug
 */
export async function generateUniqueProductSlug(
  workspaceId: string,
  name: string
): Promise<string> {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  let slug = baseSlug
  let counter = 1

  while (
    await prisma.product.findUnique({
      where: {
        workspaceId_slug: {
          workspaceId,
          slug,
        },
      },
    })
  ) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

/**
 * Get product analytics
 */
export async function getProductAnalytics(productId: string) {
  const [orderItems, totalRevenue] = await Promise.all([
    prisma.orderItem.count({
      where: { productId },
    }),
    prisma.orderItem.aggregate({
      where: { productId },
      _sum: {
        totalPrice: true,
      },
    }),
  ])

  return {
    totalSales: orderItems,
    totalRevenue: totalRevenue._sum.totalPrice || 0,
  }
}
