import { prisma } from '@/lib/db/prisma'
import { nanoid } from 'nanoid'

export type SharePermission = 'view' | 'clone' | 'edit'

export interface FunnelShareLink {
  id: string
  funnelId: string
  token: string
  permission: SharePermission
  password?: string
  expiresAt?: string
  maxUses?: number
  usageCount: number
  isActive: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface CreateShareLinkInput {
  funnelId: string
  permission: SharePermission
  password?: string
  expiresAt?: string
  maxUses?: number
  createdBy: string
}

export interface CloneFunnelInput {
  sourceFunnelId: string
  targetWorkspaceId: string
  newName: string
  userId: string
  shareToken?: string
}

/**
 * Get all share links for a funnel
 */
export async function getShareLinks(funnelId: string): Promise<FunnelShareLink[]> {
  const funnel = await prisma.funnel.findUnique({
    where: { id: funnelId },
    select: { settings: true },
  })

  if (!funnel?.settings) {
    return []
  }

  const settings = funnel.settings as Record<string, unknown>
  return (settings.shareLinks || []) as FunnelShareLink[]
}

/**
 * Create a share link
 */
export async function createShareLink(input: CreateShareLinkInput): Promise<FunnelShareLink> {
  const { funnelId, permission, password, expiresAt, maxUses, createdBy } = input

  const funnel = await prisma.funnel.findUnique({
    where: { id: funnelId },
    select: { settings: true },
  })

  const settings = (funnel?.settings || {}) as Record<string, unknown>
  const shareLinks = (settings.shareLinks || []) as FunnelShareLink[]

  const shareLink: FunnelShareLink = {
    id: `share-${Date.now()}`,
    funnelId,
    token: nanoid(32),
    permission,
    password,
    expiresAt,
    maxUses,
    usageCount: 0,
    isActive: true,
    createdBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await prisma.funnel.update({
    where: { id: funnelId },
    data: {
      settings: {
        ...settings,
        shareLinks: [...shareLinks, shareLink],
      } as object,
    },
  })

  return shareLink
}

/**
 * Validate share token
 */
export async function validateShareToken(
  funnelId: string,
  token: string,
  password?: string
): Promise<{ valid: boolean; permission?: SharePermission; error?: string }> {
  const shareLinks = await getShareLinks(funnelId)
  const shareLink = shareLinks.find((l) => l.token === token)

  if (!shareLink) {
    return { valid: false, error: 'Invalid share link' }
  }

  if (!shareLink.isActive) {
    return { valid: false, error: 'Share link is no longer active' }
  }

  if (shareLink.expiresAt && new Date(shareLink.expiresAt) < new Date()) {
    return { valid: false, error: 'Share link has expired' }
  }

  if (shareLink.maxUses && shareLink.usageCount >= shareLink.maxUses) {
    return { valid: false, error: 'Share link usage limit reached' }
  }

  if (shareLink.password && shareLink.password !== password) {
    return { valid: false, error: 'Invalid password' }
  }

  return { valid: true, permission: shareLink.permission }
}

/**
 * Record share link usage
 */
export async function recordShareLinkUsage(funnelId: string, token: string): Promise<void> {
  const funnel = await prisma.funnel.findUnique({
    where: { id: funnelId },
    select: { settings: true },
  })

  if (!funnel?.settings) return

  const settings = funnel.settings as Record<string, unknown>
  const shareLinks = (settings.shareLinks || []) as FunnelShareLink[]

  const linkIndex = shareLinks.findIndex((l) => l.token === token)
  if (linkIndex === -1) return

  shareLinks[linkIndex].usageCount++
  shareLinks[linkIndex].updatedAt = new Date().toISOString()

  await prisma.funnel.update({
    where: { id: funnelId },
    data: {
      settings: {
        ...settings,
        shareLinks,
      } as object,
    },
  })
}

/**
 * Deactivate share link
 */
export async function deactivateShareLink(funnelId: string, linkId: string): Promise<void> {
  const funnel = await prisma.funnel.findUnique({
    where: { id: funnelId },
    select: { settings: true },
  })

  if (!funnel?.settings) {
    throw new Error('Funnel not found')
  }

  const settings = funnel.settings as Record<string, unknown>
  const shareLinks = (settings.shareLinks || []) as FunnelShareLink[]

  const linkIndex = shareLinks.findIndex((l) => l.id === linkId)
  if (linkIndex === -1) {
    throw new Error('Share link not found')
  }

  shareLinks[linkIndex].isActive = false
  shareLinks[linkIndex].updatedAt = new Date().toISOString()

  await prisma.funnel.update({
    where: { id: funnelId },
    data: {
      settings: {
        ...settings,
        shareLinks,
      } as object,
    },
  })
}

/**
 * Delete share link
 */
export async function deleteShareLink(funnelId: string, linkId: string): Promise<void> {
  const funnel = await prisma.funnel.findUnique({
    where: { id: funnelId },
    select: { settings: true },
  })

  if (!funnel?.settings) {
    throw new Error('Funnel not found')
  }

  const settings = funnel.settings as Record<string, unknown>
  const shareLinks = (settings.shareLinks || []) as FunnelShareLink[]

  const filteredLinks = shareLinks.filter((l) => l.id !== linkId)

  await prisma.funnel.update({
    where: { id: funnelId },
    data: {
      settings: {
        ...settings,
        shareLinks: filteredLinks,
      } as object,
    },
  })
}

/**
 * Clone a funnel to another workspace
 */
export async function cloneFunnel(input: CloneFunnelInput): Promise<{ id: string; name: string }> {
  const { sourceFunnelId, targetWorkspaceId, newName, userId, shareToken } = input

  // Validate share token if provided
  if (shareToken) {
    const validation = await validateShareToken(sourceFunnelId, shareToken)
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid share token')
    }
    if (validation.permission !== 'clone' && validation.permission !== 'edit') {
      throw new Error('Share link does not allow cloning')
    }
    await recordShareLinkUsage(sourceFunnelId, shareToken)
  }

  // Get source funnel with steps
  const sourceFunnel = await prisma.funnel.findUnique({
    where: { id: sourceFunnelId },
    include: {
      steps: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  if (!sourceFunnel) {
    throw new Error('Source funnel not found')
  }

  // Create new funnel
  const newFunnel = await prisma.funnel.create({
    data: {
      name: newName,
      slug: `${newName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
      description: sourceFunnel.description,
      status: 'DRAFT',
      workspaceId: targetWorkspaceId,
      settings: {
        ...(sourceFunnel.settings as object || {}),
        clonedFrom: {
          funnelId: sourceFunnelId,
          funnelName: sourceFunnel.name,
          clonedAt: new Date().toISOString(),
          clonedBy: userId,
        },
        // Clear share links and A/B tests from cloned funnel
        shareLinks: [],
        abTests: [],
      } as object,
    },
  })

  // Clone steps with new IDs
  const stepIdMap: Record<string, string> = {}

  for (const step of sourceFunnel.steps) {
    const newStepId = `step-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    stepIdMap[step.id] = newStepId

    await prisma.funnelStep.create({
      data: {
        id: newStepId,
        name: step.name,
        slug: step.slug,
        type: step.type,
        sortOrder: step.sortOrder,
        pageContent: step.pageContent as object || {},
        settings: {
          ...(step.settings as object || {}),
          // Clear step-specific data that shouldn't be cloned
          popups: [],
          orderBumps: [],
          popupStats: {},
        } as object,
        funnelId: newFunnel.id,
      },
    })
  }

  // Update any internal step references in funnel settings
  const funnelSettings = (newFunnel.settings || {}) as Record<string, unknown>
  if (funnelSettings.headerId && typeof funnelSettings.headerId === 'string') {
    // Header/footer IDs are workspace-level, keep them only if same workspace
    if (sourceFunnel.workspaceId !== targetWorkspaceId) {
      delete funnelSettings.headerId
      delete funnelSettings.footerId
    }
  }

  await prisma.funnel.update({
    where: { id: newFunnel.id },
    data: {
      settings: funnelSettings as object,
    },
  })

  return {
    id: newFunnel.id,
    name: newFunnel.name,
  }
}

/**
 * Get funnel for sharing (public view)
 */
export async function getFunnelForShare(
  funnelId: string,
  token: string,
  password?: string
): Promise<{
  funnel: {
    id: string
    name: string
    description: string | null
    stepsCount: number
  } | null
  error?: string
}> {
  const validation = await validateShareToken(funnelId, token, password)

  if (!validation.valid) {
    return { funnel: null, error: validation.error }
  }

  const funnel = await prisma.funnel.findUnique({
    where: { id: funnelId },
    include: {
      _count: {
        select: { steps: true },
      },
    },
  })

  if (!funnel) {
    return { funnel: null, error: 'Funnel not found' }
  }

  return {
    funnel: {
      id: funnel.id,
      name: funnel.name,
      description: funnel.description,
      stepsCount: funnel._count.steps,
    },
  }
}

/**
 * Export funnel as JSON (for backup/transfer)
 */
export async function exportFunnelAsJson(funnelId: string): Promise<object> {
  const funnel = await prisma.funnel.findUnique({
    where: { id: funnelId },
    include: {
      steps: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  if (!funnel) {
    throw new Error('Funnel not found')
  }

  // Remove sensitive data
  const settings = (funnel.settings || {}) as Record<string, unknown>
  delete settings.shareLinks
  delete settings.abTests

  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    funnel: {
      name: funnel.name,
      description: funnel.description,
      settings,
    },
    steps: funnel.steps.map((step) => {
      const stepSettings = (step.settings || {}) as Record<string, unknown>
      delete stepSettings.popupStats
      return {
        name: step.name,
        slug: step.slug,
        type: step.type,
        sortOrder: step.sortOrder,
        pageContent: step.pageContent,
        settings: stepSettings,
      }
    }),
  }
}

/**
 * Import funnel from JSON
 */
export async function importFunnelFromJson(
  workspaceId: string,
  userId: string,
  data: {
    funnel: {
      name: string
      description?: string
      settings?: Record<string, unknown>
    }
    steps: {
      name: string
      slug: string
      type: string
      sortOrder: number
      pageContent?: Record<string, unknown>
      settings?: Record<string, unknown>
    }[]
  }
): Promise<{ id: string; name: string }> {
  const newFunnel = await prisma.funnel.create({
    data: {
      name: data.funnel.name,
      slug: `${data.funnel.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
      description: data.funnel.description || null,
      status: 'DRAFT',
      workspaceId,
      settings: {
        ...(data.funnel.settings || {}),
        importedAt: new Date().toISOString(),
        importedBy: userId,
        shareLinks: [],
        abTests: [],
      } as object,
    },
  })

  for (const step of data.steps) {
    await prisma.funnelStep.create({
      data: {
        name: step.name,
        slug: step.slug,
        type: step.type as 'OPTIN' | 'SALES' | 'UPSELL' | 'DOWNSELL' | 'ORDER_FORM' | 'CHECKOUT' | 'THANK_YOU' | 'WEBINAR' | 'MEMBER' | 'CUSTOM',
        sortOrder: step.sortOrder,
        pageContent: (step.pageContent || {}) as object,
        settings: {
          ...(step.settings || {}),
          popups: [],
          orderBumps: [],
          popupStats: {},
        } as object,
        funnelId: newFunnel.id,
      },
    })
  }

  return {
    id: newFunnel.id,
    name: newFunnel.name,
  }
}
