import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  getLocaleSettings,
  updateLocaleSettings,
  getCustomTranslations,
  setCustomTranslation,
  deleteCustomTranslation,
  getContentTranslations,
  setContentTranslation,
  deleteContentTranslations,
  getSystemTranslations,
  getAvailableLocales,
  batchTranslate,
  type SupportedLocale,
} from '@/lib/i18n/service'
import { hasWorkspaceAccess, hasWorkspaceRole } from '@/lib/workspace/service'
import { z } from 'zod'

const SUPPORTED_LOCALES = ['en', 'ja', 'es', 'fr', 'de', 'pt', 'zh', 'ko'] as const

const updateLocaleSettingsSchema = z.object({
  defaultLocale: z.enum(SUPPORTED_LOCALES).optional(),
  enabledLocales: z.array(z.enum(SUPPORTED_LOCALES)).optional(),
  autoDetect: z.boolean().optional(),
  fallbackLocale: z.enum(SUPPORTED_LOCALES).optional(),
})

const setTranslationSchema = z.object({
  key: z.string().min(1).max(200),
  translations: z.record(z.enum(SUPPORTED_LOCALES), z.string()),
})

const setContentTranslationSchema = z.object({
  contentType: z.enum(['funnel', 'step', 'product', 'email']),
  contentId: z.string(),
  field: z.string(),
  locale: z.enum(SUPPORTED_LOCALES),
  value: z.string(),
})

const batchTranslateSchema = z.object({
  keys: z.array(z.string()),
  locale: z.enum(SUPPORTED_LOCALES),
})

interface RouteParams {
  params: Promise<{ workspaceId: string }>
}

/**
 * GET /api/workspaces/[workspaceId]/i18n
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { workspaceId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasAccess = await hasWorkspaceAccess(workspaceId, session.user.id)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)

    // Get available locales
    if (searchParams.get('availableLocales') === 'true') {
      return NextResponse.json({ locales: getAvailableLocales() })
    }

    // Get system translations for a locale
    const systemLocale = searchParams.get('systemTranslations')
    if (systemLocale) {
      const translations = getSystemTranslations(systemLocale as SupportedLocale)
      return NextResponse.json({ translations })
    }

    // Get content translations
    const contentType = searchParams.get('contentType')
    const contentId = searchParams.get('contentId')
    if (contentType && contentId) {
      const translations = await getContentTranslations(
        workspaceId,
        contentType as 'funnel' | 'step' | 'product' | 'email',
        contentId
      )
      return NextResponse.json({ translations })
    }

    // Default: Get locale settings and custom translations
    const [localeSettings, customTranslations] = await Promise.all([
      getLocaleSettings(workspaceId),
      getCustomTranslations(workspaceId),
    ])

    return NextResponse.json({
      localeSettings,
      customTranslations,
    })
  } catch (error) {
    console.error('Error getting i18n data:', error)
    return NextResponse.json({ error: 'Failed to get i18n data' }, { status: 500 })
  }
}

/**
 * POST /api/workspaces/[workspaceId]/i18n
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { workspaceId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasAdminAccess = await hasWorkspaceRole(workspaceId, session.user.id, ['OWNER', 'ADMIN'])
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    // Batch translate
    if (action === 'batchTranslate') {
      const parsed = batchTranslateSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid input', details: parsed.error.flatten() },
          { status: 400 }
        )
      }

      const translations = await batchTranslate(workspaceId, parsed.data.keys, parsed.data.locale)
      return NextResponse.json({ translations })
    }

    // Set content translation
    if (action === 'setContentTranslation') {
      const parsed = setContentTranslationSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid input', details: parsed.error.flatten() },
          { status: 400 }
        )
      }

      const translation = await setContentTranslation(
        workspaceId,
        parsed.data.contentType,
        parsed.data.contentId,
        parsed.data.field,
        parsed.data.locale,
        parsed.data.value
      )
      return NextResponse.json({ translation })
    }

    // Delete content translations
    if (action === 'deleteContentTranslations') {
      const { contentType, contentId } = body
      if (!contentType || !contentId) {
        return NextResponse.json(
          { error: 'contentType and contentId are required' },
          { status: 400 }
        )
      }

      await deleteContentTranslations(workspaceId, contentType, contentId)
      return NextResponse.json({ success: true })
    }

    // Set custom translation
    const parsed = setTranslationSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    await setCustomTranslation(workspaceId, parsed.data.key, parsed.data.translations)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error with i18n:', error)
    return NextResponse.json({ error: 'Failed to process i18n request' }, { status: 500 })
  }
}

/**
 * PATCH /api/workspaces/[workspaceId]/i18n
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { workspaceId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasAdminAccess = await hasWorkspaceRole(workspaceId, session.user.id, ['OWNER', 'ADMIN'])
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = updateLocaleSettingsSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const localeSettings = await updateLocaleSettings(workspaceId, parsed.data)
    return NextResponse.json({ localeSettings })
  } catch (error) {
    console.error('Error updating locale settings:', error)
    return NextResponse.json({ error: 'Failed to update locale settings' }, { status: 500 })
  }
}

/**
 * DELETE /api/workspaces/[workspaceId]/i18n
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { workspaceId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasAdminAccess = await hasWorkspaceRole(workspaceId, session.user.id, ['OWNER', 'ADMIN'])
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json({ error: 'key is required' }, { status: 400 })
    }

    await deleteCustomTranslation(workspaceId, key)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting translation:', error)
    return NextResponse.json({ error: 'Failed to delete translation' }, { status: 500 })
  }
}
