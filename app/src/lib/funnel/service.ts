import { prisma } from '@/lib/db/prisma'
import type { Funnel, FunnelStep, FunnelType, FunnelStatus, FunnelStepType } from '@prisma/client'

export interface CreateFunnelInput {
  workspaceId: string
  name: string
  slug: string
  type?: FunnelType
  description?: string
  thumbnail?: string
  settings?: Record<string, unknown>
}

export interface UpdateFunnelInput {
  name?: string
  description?: string | null
  thumbnail?: string | null
  settings?: Record<string, unknown>
  status?: FunnelStatus
}

export interface CreateFunnelStepInput {
  funnelId: string
  name: string
  slug: string
  type: FunnelStepType
  sortOrder?: number
  settings?: Record<string, unknown>
  pageContent?: Record<string, unknown>
}

export interface UpdateFunnelStepInput {
  name?: string
  type?: FunnelStepType
  settings?: Record<string, unknown>
  pageContent?: Record<string, unknown>
  isPublished?: boolean
}

/**
 * Create a new funnel
 */
export async function createFunnel(input: CreateFunnelInput): Promise<Funnel> {
  const { workspaceId, name, slug, type = 'LEAD_MAGNET', description, thumbnail, settings } = input

  // Check if slug is already taken in workspace
  const existingFunnel = await prisma.funnel.findUnique({
    where: {
      workspaceId_slug: {
        workspaceId,
        slug,
      },
    },
  })

  if (existingFunnel) {
    throw new Error('Funnel slug already exists in this workspace')
  }

  return prisma.funnel.create({
    data: {
      workspaceId,
      name,
      slug,
      type,
      description,
      thumbnail,
      settings: settings as object,
      status: 'DRAFT',
    },
  })
}

/**
 * Get funnel by ID
 */
export async function getFunnelById(funnelId: string): Promise<Funnel | null> {
  return prisma.funnel.findUnique({
    where: { id: funnelId },
    include: {
      steps: {
        orderBy: { sortOrder: 'asc' },
        include: {
          variants: true,
        },
      },
      products: {
        include: {
          product: true,
        },
      },
      _count: {
        select: {
          analytics: true,
        },
      },
    },
  })
}

/**
 * Get funnel by slug within workspace
 */
export async function getFunnelBySlug(
  workspaceId: string,
  slug: string
): Promise<Funnel | null> {
  return prisma.funnel.findUnique({
    where: {
      workspaceId_slug: {
        workspaceId,
        slug,
      },
    },
    include: {
      steps: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  })
}

/**
 * List funnels in a workspace
 */
export async function listFunnels(
  workspaceId: string,
  options?: {
    status?: FunnelStatus
    type?: FunnelType
    limit?: number
    offset?: number
  }
): Promise<{ funnels: Funnel[]; total: number }> {
  const { status, type, limit = 20, offset = 0 } = options || {}

  const where = {
    workspaceId,
    ...(status && { status }),
    ...(type && { type }),
  }

  const [funnels, total] = await Promise.all([
    prisma.funnel.findMany({
      where,
      include: {
        _count: {
          select: {
            steps: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.funnel.count({ where }),
  ])

  return { funnels, total }
}

/**
 * Update funnel
 */
export async function updateFunnel(
  funnelId: string,
  input: UpdateFunnelInput
): Promise<Funnel> {
  return prisma.funnel.update({
    where: { id: funnelId },
    data: {
      name: input.name,
      description: input.description,
      thumbnail: input.thumbnail,
      settings: input.settings as object,
      status: input.status,
    },
  })
}

/**
 * Delete funnel
 */
export async function deleteFunnel(funnelId: string): Promise<void> {
  await prisma.funnel.delete({
    where: { id: funnelId },
  })
}

/**
 * Publish funnel
 */
export async function publishFunnel(funnelId: string): Promise<Funnel> {
  return prisma.funnel.update({
    where: { id: funnelId },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  })
}

/**
 * Unpublish funnel
 */
export async function unpublishFunnel(funnelId: string): Promise<Funnel> {
  return prisma.funnel.update({
    where: { id: funnelId },
    data: {
      status: 'DRAFT',
    },
  })
}

/**
 * Create funnel step
 */
export async function createFunnelStep(input: CreateFunnelStepInput): Promise<FunnelStep> {
  const { funnelId, name, slug, type, sortOrder, settings, pageContent } = input

  // Get max sort order if not provided
  let order = sortOrder
  if (order === undefined) {
    const lastStep = await prisma.funnelStep.findFirst({
      where: { funnelId },
      orderBy: { sortOrder: 'desc' },
    })
    order = (lastStep?.sortOrder ?? -1) + 1
  }

  // Check if slug is already taken
  const existingStep = await prisma.funnelStep.findUnique({
    where: {
      funnelId_slug: {
        funnelId,
        slug,
      },
    },
  })

  if (existingStep) {
    throw new Error('Step slug already exists in this funnel')
  }

  return prisma.funnelStep.create({
    data: {
      funnelId,
      name,
      slug,
      type,
      sortOrder: order,
      settings: settings as object,
      pageContent: pageContent as object,
    },
  })
}

/**
 * Get funnel step by ID
 */
export async function getFunnelStepById(stepId: string): Promise<FunnelStep | null> {
  return prisma.funnelStep.findUnique({
    where: { id: stepId },
    include: {
      variants: true,
      funnel: {
        select: {
          id: true,
          name: true,
          workspaceId: true,
        },
      },
    },
  })
}

/**
 * Update funnel step
 */
export async function updateFunnelStep(
  stepId: string,
  input: UpdateFunnelStepInput
): Promise<FunnelStep> {
  return prisma.funnelStep.update({
    where: { id: stepId },
    data: {
      name: input.name,
      type: input.type,
      settings: input.settings as object,
      pageContent: input.pageContent as object,
      isPublished: input.isPublished,
    },
  })
}

/**
 * Delete funnel step
 */
export async function deleteFunnelStep(stepId: string): Promise<void> {
  await prisma.funnelStep.delete({
    where: { id: stepId },
  })
}

/**
 * Reorder funnel steps
 */
export async function reorderFunnelSteps(
  funnelId: string,
  stepIds: string[]
): Promise<void> {
  await prisma.$transaction(
    stepIds.map((id, index) =>
      prisma.funnelStep.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  )
}

/**
 * Duplicate funnel
 */
export async function duplicateFunnel(
  funnelId: string,
  newName: string,
  newSlug: string
): Promise<Funnel> {
  const original = await prisma.funnel.findUnique({
    where: { id: funnelId },
    include: {
      steps: {
        include: {
          variants: true,
        },
      },
    },
  })

  if (!original) {
    throw new Error('Funnel not found')
  }

  return prisma.funnel.create({
    data: {
      workspaceId: original.workspaceId,
      name: newName,
      slug: newSlug,
      type: original.type,
      description: original.description,
      thumbnail: original.thumbnail,
      settings: original.settings as object,
      status: 'DRAFT',
      steps: {
        create: original.steps.map((step) => ({
          name: step.name,
          slug: step.slug,
          type: step.type,
          sortOrder: step.sortOrder,
          settings: step.settings as object,
          pageContent: step.pageContent as object,
          isPublished: false,
          variants: {
            create: step.variants.map((variant) => ({
              name: variant.name,
              weight: variant.weight,
              pageContent: variant.pageContent as object,
              isControl: variant.isControl,
              isActive: variant.isActive,
            })),
          },
        })),
      },
    },
    include: {
      steps: true,
    },
  })
}

/**
 * Generate unique slug for funnel
 */
export async function generateUniqueFunnelSlug(
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
    await prisma.funnel.findUnique({
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
 * Get funnel analytics
 */
export async function getFunnelAnalytics(
  funnelId: string,
  startDate: Date,
  endDate: Date
) {
  const analytics = await prisma.funnelAnalytics.findMany({
    where: {
      funnelId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { date: 'asc' },
  })

  const totals = analytics.reduce(
    (acc, day) => ({
      visitors: acc.visitors + day.visitors,
      uniqueVisitors: acc.uniqueVisitors + day.uniqueVisitors,
      pageViews: acc.pageViews + day.pageViews,
      optins: acc.optins + day.optins,
      sales: acc.sales + day.sales,
      revenue: acc.revenue + day.revenue,
    }),
    {
      visitors: 0,
      uniqueVisitors: 0,
      pageViews: 0,
      optins: 0,
      sales: 0,
      revenue: 0,
    }
  )

  return {
    daily: analytics,
    totals,
    conversionRate: totals.uniqueVisitors > 0
      ? ((totals.optins / totals.uniqueVisitors) * 100).toFixed(2)
      : 0,
    salesRate: totals.uniqueVisitors > 0
      ? ((totals.sales / totals.uniqueVisitors) * 100).toFixed(2)
      : 0,
  }
}

/**
 * Get default page content template for step type
 */
export function getDefaultPageContent(type: FunnelStepType): Record<string, unknown> {
  const templates: Record<FunnelStepType, Record<string, unknown>> = {
    OPTIN: {
      sections: [
        {
          type: 'hero',
          content: {
            headline: 'Get Your Free Guide',
            subheadline: 'Enter your email to receive instant access',
          },
        },
        {
          type: 'form',
          fields: [
            { name: 'email', type: 'email', required: true, label: 'Email Address' },
            { name: 'firstName', type: 'text', required: false, label: 'First Name' },
          ],
          submitButton: 'Get Instant Access',
        },
      ],
    },
    SALES: {
      sections: [
        {
          type: 'hero',
          content: {
            headline: 'Transform Your Business',
            subheadline: 'The complete solution you\'ve been waiting for',
          },
        },
        {
          type: 'video',
          videoUrl: '',
        },
        {
          type: 'benefits',
          items: [],
        },
        {
          type: 'cta',
          content: {
            headline: 'Ready to get started?',
            buttonText: 'Buy Now',
          },
        },
      ],
    },
    ORDER_FORM: {
      sections: [
        {
          type: 'orderSummary',
        },
        {
          type: 'paymentForm',
        },
      ],
    },
    CHECKOUT: {
      sections: [
        {
          type: 'checkout',
        },
      ],
    },
    UPSELL: {
      sections: [
        {
          type: 'hero',
          content: {
            headline: 'Wait! Special One-Time Offer',
            subheadline: 'Upgrade your order with this exclusive deal',
          },
        },
        {
          type: 'offer',
        },
        {
          type: 'cta',
          content: {
            acceptButton: 'Yes! Add This To My Order',
            declineButton: 'No thanks, I\'ll pass',
          },
        },
      ],
    },
    DOWNSELL: {
      sections: [
        {
          type: 'hero',
          content: {
            headline: 'Before You Go...',
            subheadline: 'How about a special discount?',
          },
        },
        {
          type: 'offer',
        },
      ],
    },
    THANK_YOU: {
      sections: [
        {
          type: 'hero',
          content: {
            headline: 'Thank You!',
            subheadline: 'Your order has been confirmed',
          },
        },
        {
          type: 'orderDetails',
        },
        {
          type: 'nextSteps',
        },
      ],
    },
    WEBINAR: {
      sections: [
        {
          type: 'hero',
          content: {
            headline: 'Free Training',
            subheadline: 'Register for our exclusive webinar',
          },
        },
        {
          type: 'webinarRegistration',
        },
      ],
    },
    MEMBER: {
      sections: [
        {
          type: 'memberArea',
        },
      ],
    },
    CUSTOM: {
      sections: [],
    },
  }

  return templates[type] || { sections: [] }
}
