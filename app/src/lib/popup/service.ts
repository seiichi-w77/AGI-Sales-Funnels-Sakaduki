import { prisma } from '@/lib/db/prisma'

export type PopupTrigger = 'exit_intent' | 'time_delay' | 'scroll_depth' | 'click' | 'page_load'
export type PopupPosition = 'center' | 'top' | 'bottom' | 'left' | 'right' | 'bottom-right' | 'bottom-left'
export type PopupAnimation = 'fade' | 'slide' | 'bounce' | 'zoom' | 'none'

export interface PopupSettings {
  id: string
  name: string
  trigger: PopupTrigger
  triggerValue?: number // delay in seconds, scroll percentage, etc.
  position: PopupPosition
  animation: PopupAnimation
  overlay: boolean
  overlayColor: string
  overlayOpacity: number
  closeOnOverlayClick: boolean
  closeButton: boolean
  width: string
  maxWidth: string
  borderRadius: string
  backgroundColor: string
  padding: string
  showOnMobile: boolean
  frequency: 'always' | 'once_per_session' | 'once_per_day' | 'once_per_week' | 'once'
  startDate?: string
  endDate?: string
  isActive: boolean
}

export interface CreatePopupInput {
  funnelStepId: string
  name: string
  trigger: PopupTrigger
  triggerValue?: number
  position?: PopupPosition
  animation?: PopupAnimation
  content: Record<string, unknown>
  settings?: Partial<PopupSettings>
}

export interface Popup extends PopupSettings {
  funnelStepId: string
  content: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

/**
 * Get popups for a funnel step
 */
export async function getPopupsForStep(funnelStepId: string): Promise<Popup[]> {
  const step = await prisma.funnelStep.findUnique({
    where: { id: funnelStepId },
    select: { settings: true },
  })

  if (!step?.settings) {
    return []
  }

  const settings = step.settings as Record<string, unknown>
  return (settings.popups || []) as Popup[]
}

/**
 * Create a new popup
 */
export async function createPopup(input: CreatePopupInput): Promise<Popup> {
  const {
    funnelStepId,
    name,
    trigger,
    triggerValue,
    position = 'center',
    animation = 'fade',
    content,
    settings = {},
  } = input

  const step = await prisma.funnelStep.findUnique({
    where: { id: funnelStepId },
    select: { settings: true },
  })

  const stepSettings = (step?.settings || {}) as Record<string, unknown>
  const existingPopups = (stepSettings.popups || []) as Popup[]

  const newPopup: Popup = {
    id: `popup-${Date.now()}`,
    funnelStepId,
    name,
    trigger,
    triggerValue,
    position,
    animation,
    content,
    overlay: settings.overlay ?? true,
    overlayColor: settings.overlayColor ?? '#000000',
    overlayOpacity: settings.overlayOpacity ?? 0.5,
    closeOnOverlayClick: settings.closeOnOverlayClick ?? true,
    closeButton: settings.closeButton ?? true,
    width: settings.width ?? 'auto',
    maxWidth: settings.maxWidth ?? '500px',
    borderRadius: settings.borderRadius ?? '8px',
    backgroundColor: settings.backgroundColor ?? '#ffffff',
    padding: settings.padding ?? '24px',
    showOnMobile: settings.showOnMobile ?? true,
    frequency: settings.frequency ?? 'once_per_session',
    startDate: settings.startDate,
    endDate: settings.endDate,
    isActive: settings.isActive ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await prisma.funnelStep.update({
    where: { id: funnelStepId },
    data: {
      settings: {
        ...stepSettings,
        popups: [...existingPopups, newPopup],
      } as object,
    },
  })

  return newPopup
}

/**
 * Update a popup
 */
export async function updatePopup(
  funnelStepId: string,
  popupId: string,
  updates: Partial<Omit<Popup, 'id' | 'funnelStepId' | 'createdAt'>>
): Promise<Popup> {
  const step = await prisma.funnelStep.findUnique({
    where: { id: funnelStepId },
    select: { settings: true },
  })

  if (!step?.settings) {
    throw new Error('Step not found')
  }

  const settings = step.settings as Record<string, unknown>
  const popups = (settings.popups || []) as Popup[]

  const popupIndex = popups.findIndex((p) => p.id === popupId)
  if (popupIndex === -1) {
    throw new Error('Popup not found')
  }

  const updatedPopup: Popup = {
    ...popups[popupIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  popups[popupIndex] = updatedPopup

  await prisma.funnelStep.update({
    where: { id: funnelStepId },
    data: {
      settings: {
        ...settings,
        popups,
      } as object,
    },
  })

  return updatedPopup
}

/**
 * Delete a popup
 */
export async function deletePopup(funnelStepId: string, popupId: string): Promise<void> {
  const step = await prisma.funnelStep.findUnique({
    where: { id: funnelStepId },
    select: { settings: true },
  })

  if (!step?.settings) {
    throw new Error('Step not found')
  }

  const settings = step.settings as Record<string, unknown>
  const popups = (settings.popups || []) as Popup[]

  const filteredPopups = popups.filter((p) => p.id !== popupId)

  await prisma.funnelStep.update({
    where: { id: funnelStepId },
    data: {
      settings: {
        ...settings,
        popups: filteredPopups,
      } as object,
    },
  })
}

/**
 * Get popup templates
 */
export function getPopupTemplates(): Record<string, Popup['content']> {
  return {
    newsletter: {
      type: 'newsletter',
      headline: 'Subscribe to Our Newsletter',
      description: 'Get the latest updates and exclusive offers delivered to your inbox.',
      formFields: [
        { name: 'email', type: 'email', placeholder: 'Enter your email', required: true },
      ],
      submitButton: {
        text: 'Subscribe',
        backgroundColor: '#2563eb',
        color: '#ffffff',
      },
      privacyText: 'We respect your privacy. Unsubscribe at any time.',
    },
    discount: {
      type: 'discount',
      headline: 'Special Offer!',
      description: 'Get 20% off your first order',
      couponCode: 'SAVE20',
      ctaButton: {
        text: 'Claim Now',
        backgroundColor: '#16a34a',
        color: '#ffffff',
      },
      expiryText: 'Offer expires in 24 hours',
    },
    exit_intent: {
      type: 'exit_intent',
      headline: "Wait! Don't Leave Yet",
      description: "We have a special offer just for you",
      ctaButton: {
        text: 'Get My Discount',
        backgroundColor: '#dc2626',
        color: '#ffffff',
      },
      declineText: 'No thanks, I\'ll pass',
    },
    countdown: {
      type: 'countdown',
      headline: 'Limited Time Offer',
      description: 'This deal ends soon!',
      countdownTarget: '',
      ctaButton: {
        text: 'Shop Now',
        backgroundColor: '#f59e0b',
        color: '#000000',
      },
    },
    video: {
      type: 'video',
      headline: 'Watch This First',
      videoUrl: '',
      autoplay: true,
      ctaButton: {
        text: 'Learn More',
        backgroundColor: '#2563eb',
        color: '#ffffff',
      },
    },
    announcement: {
      type: 'announcement',
      headline: 'New Feature Alert!',
      description: "We've just launched something amazing",
      imageUrl: '',
      ctaButton: {
        text: 'Check It Out',
        backgroundColor: '#7c3aed',
        color: '#ffffff',
      },
    },
  }
}

/**
 * Track popup impression
 */
export async function trackPopupImpression(
  funnelStepId: string,
  popupId: string
): Promise<void> {
  const step = await prisma.funnelStep.findUnique({
    where: { id: funnelStepId },
    select: { settings: true },
  })

  if (!step?.settings) return

  const settings = step.settings as Record<string, unknown>
  const popupStats = (settings.popupStats || {}) as Record<
    string,
    { impressions: number; conversions: number }
  >

  if (!popupStats[popupId]) {
    popupStats[popupId] = { impressions: 0, conversions: 0 }
  }

  popupStats[popupId].impressions++

  await prisma.funnelStep.update({
    where: { id: funnelStepId },
    data: {
      settings: {
        ...settings,
        popupStats,
      } as object,
    },
  })
}

/**
 * Track popup conversion
 */
export async function trackPopupConversion(
  funnelStepId: string,
  popupId: string
): Promise<void> {
  const step = await prisma.funnelStep.findUnique({
    where: { id: funnelStepId },
    select: { settings: true },
  })

  if (!step?.settings) return

  const settings = step.settings as Record<string, unknown>
  const popupStats = (settings.popupStats || {}) as Record<
    string,
    { impressions: number; conversions: number }
  >

  if (!popupStats[popupId]) {
    popupStats[popupId] = { impressions: 0, conversions: 0 }
  }

  popupStats[popupId].conversions++

  await prisma.funnelStep.update({
    where: { id: funnelStepId },
    data: {
      settings: {
        ...settings,
        popupStats,
      } as object,
    },
  })
}

/**
 * Get popup statistics
 */
export async function getPopupStats(
  funnelStepId: string
): Promise<Record<string, { impressions: number; conversions: number; conversionRate: number }>> {
  const step = await prisma.funnelStep.findUnique({
    where: { id: funnelStepId },
    select: { settings: true },
  })

  if (!step?.settings) {
    return {}
  }

  const settings = step.settings as Record<string, unknown>
  const popupStats = (settings.popupStats || {}) as Record<
    string,
    { impressions: number; conversions: number }
  >

  const result: Record<string, { impressions: number; conversions: number; conversionRate: number }> = {}

  for (const [popupId, stats] of Object.entries(popupStats)) {
    result[popupId] = {
      impressions: stats.impressions,
      conversions: stats.conversions,
      conversionRate: stats.impressions > 0 ? (stats.conversions / stats.impressions) * 100 : 0,
    }
  }

  return result
}
