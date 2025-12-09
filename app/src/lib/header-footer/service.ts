import { prisma } from '@/lib/db/prisma'

export interface HeaderFooterSettings {
  id: string
  name: string
  type: 'header' | 'footer'
  isDefault: boolean
  isActive: boolean
  content: Record<string, unknown>
  styles: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface CreateHeaderFooterInput {
  workspaceId: string
  name: string
  type: 'header' | 'footer'
  content: Record<string, unknown>
  styles?: Record<string, unknown>
  isDefault?: boolean
}

/**
 * Get all headers/footers for a workspace
 */
export async function getHeadersFooters(
  workspaceId: string,
  type?: 'header' | 'footer'
): Promise<HeaderFooterSettings[]> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  })

  if (!workspace?.settings) {
    return []
  }

  const settings = workspace.settings as Record<string, unknown>
  const headersFooters = (settings.headersFooters || []) as HeaderFooterSettings[]

  if (type) {
    return headersFooters.filter((hf) => hf.type === type)
  }

  return headersFooters
}

/**
 * Get header/footer by ID
 */
export async function getHeaderFooterById(
  workspaceId: string,
  id: string
): Promise<HeaderFooterSettings | null> {
  const headersFooters = await getHeadersFooters(workspaceId)
  return headersFooters.find((hf) => hf.id === id) || null
}

/**
 * Create header/footer
 */
export async function createHeaderFooter(
  input: CreateHeaderFooterInput
): Promise<HeaderFooterSettings> {
  const { workspaceId, name, type, content, styles = {}, isDefault = false } = input

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  })

  const settings = (workspace?.settings || {}) as Record<string, unknown>
  const headersFooters = (settings.headersFooters || []) as HeaderFooterSettings[]

  // If setting as default, unset other defaults of same type
  if (isDefault) {
    for (const hf of headersFooters) {
      if (hf.type === type) {
        hf.isDefault = false
      }
    }
  }

  const newHeaderFooter: HeaderFooterSettings = {
    id: `${type}-${Date.now()}`,
    name,
    type,
    isDefault,
    isActive: true,
    content,
    styles,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      settings: {
        ...settings,
        headersFooters: [...headersFooters, newHeaderFooter],
      } as object,
    },
  })

  return newHeaderFooter
}

/**
 * Update header/footer
 */
export async function updateHeaderFooter(
  workspaceId: string,
  id: string,
  updates: Partial<Omit<HeaderFooterSettings, 'id' | 'type' | 'createdAt'>>
): Promise<HeaderFooterSettings> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  })

  if (!workspace?.settings) {
    throw new Error('Workspace settings not found')
  }

  const settings = workspace.settings as Record<string, unknown>
  const headersFooters = (settings.headersFooters || []) as HeaderFooterSettings[]

  const index = headersFooters.findIndex((hf) => hf.id === id)
  if (index === -1) {
    throw new Error('Header/Footer not found')
  }

  // If setting as default, unset other defaults of same type
  if (updates.isDefault) {
    const type = headersFooters[index].type
    for (const hf of headersFooters) {
      if (hf.type === type && hf.id !== id) {
        hf.isDefault = false
      }
    }
  }

  const updatedHeaderFooter: HeaderFooterSettings = {
    ...headersFooters[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  headersFooters[index] = updatedHeaderFooter

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      settings: {
        ...settings,
        headersFooters,
      } as object,
    },
  })

  return updatedHeaderFooter
}

/**
 * Delete header/footer
 */
export async function deleteHeaderFooter(workspaceId: string, id: string): Promise<void> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  })

  if (!workspace?.settings) {
    throw new Error('Workspace settings not found')
  }

  const settings = workspace.settings as Record<string, unknown>
  const headersFooters = (settings.headersFooters || []) as HeaderFooterSettings[]

  const filteredHeadersFooters = headersFooters.filter((hf) => hf.id !== id)

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      settings: {
        ...settings,
        headersFooters: filteredHeadersFooters,
      } as object,
    },
  })
}

/**
 * Get default header/footer templates
 */
export function getHeaderFooterTemplates(): Record<string, { type: 'header' | 'footer'; content: Record<string, unknown>; styles: Record<string, unknown> }> {
  return {
    simple_header: {
      type: 'header',
      content: {
        logo: { src: '', alt: 'Logo', width: 120 },
        navigation: [
          { text: 'Home', url: '/' },
          { text: 'Features', url: '/features' },
          { text: 'Pricing', url: '/pricing' },
          { text: 'Contact', url: '/contact' },
        ],
        cta: { text: 'Get Started', url: '/signup' },
      },
      styles: {
        backgroundColor: '#1e293b',
        textColor: '#ffffff',
        padding: '16px 24px',
        position: 'sticky',
        borderBottom: '1px solid #334155',
      },
    },
    minimal_header: {
      type: 'header',
      content: {
        logo: { src: '', alt: 'Logo', width: 100 },
        centerText: '',
      },
      styles: {
        backgroundColor: 'transparent',
        textColor: '#ffffff',
        padding: '24px',
        position: 'absolute',
      },
    },
    simple_footer: {
      type: 'footer',
      content: {
        logo: { src: '', alt: 'Logo', width: 100 },
        columns: [
          {
            title: 'Product',
            links: [
              { text: 'Features', url: '/features' },
              { text: 'Pricing', url: '/pricing' },
              { text: 'FAQ', url: '/faq' },
            ],
          },
          {
            title: 'Company',
            links: [
              { text: 'About', url: '/about' },
              { text: 'Blog', url: '/blog' },
              { text: 'Careers', url: '/careers' },
            ],
          },
          {
            title: 'Legal',
            links: [
              { text: 'Privacy', url: '/privacy' },
              { text: 'Terms', url: '/terms' },
            ],
          },
        ],
        socialLinks: [
          { platform: 'twitter', url: '' },
          { platform: 'facebook', url: '' },
          { platform: 'instagram', url: '' },
        ],
        copyright: '© 2024 Company Name. All rights reserved.',
      },
      styles: {
        backgroundColor: '#0f172a',
        textColor: '#94a3b8',
        padding: '48px 24px',
        borderTop: '1px solid #1e293b',
      },
    },
    minimal_footer: {
      type: 'footer',
      content: {
        copyright: '© 2024 Company Name',
        links: [
          { text: 'Privacy', url: '/privacy' },
          { text: 'Terms', url: '/terms' },
        ],
      },
      styles: {
        backgroundColor: 'transparent',
        textColor: '#64748b',
        padding: '24px',
        textAlign: 'center',
      },
    },
  }
}

/**
 * Assign header/footer to funnel
 */
export async function assignHeaderFooterToFunnel(
  funnelId: string,
  headerId: string | null,
  footerId: string | null
): Promise<void> {
  const funnel = await prisma.funnel.findUnique({
    where: { id: funnelId },
    select: { settings: true },
  })

  const settings = (funnel?.settings || {}) as Record<string, unknown>

  await prisma.funnel.update({
    where: { id: funnelId },
    data: {
      settings: {
        ...settings,
        headerId,
        footerId,
      } as object,
    },
  })
}

/**
 * Get assigned header/footer for funnel
 */
export async function getFunnelHeaderFooter(
  funnelId: string
): Promise<{ headerId: string | null; footerId: string | null }> {
  const funnel = await prisma.funnel.findUnique({
    where: { id: funnelId },
    select: { settings: true },
  })

  const settings = (funnel?.settings || {}) as Record<string, unknown>

  return {
    headerId: (settings.headerId as string) || null,
    footerId: (settings.footerId as string) || null,
  }
}
