import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  getThemes,
  createTheme,
  updateTheme,
  deleteTheme,
  getPresetThemes,
  getDefaultTheme,
} from '@/lib/theme/service'
import { hasWorkspaceAccess, hasWorkspaceRole } from '@/lib/workspace/service'
import { z } from 'zod'

const colorsSchema = z.object({
  primary: z.string().optional(),
  secondary: z.string().optional(),
  accent: z.string().optional(),
  background: z.string().optional(),
  surface: z.string().optional(),
  text: z.string().optional(),
  textMuted: z.string().optional(),
  border: z.string().optional(),
  success: z.string().optional(),
  error: z.string().optional(),
  warning: z.string().optional(),
  info: z.string().optional(),
})

const typographySchema = z.object({
  fontFamily: z.string().optional(),
  headingFontFamily: z.string().optional(),
  baseFontSize: z.string().optional(),
  lineHeight: z.string().optional(),
  headingLineHeight: z.string().optional(),
})

const spacingSchema = z.object({
  unit: z.number().optional(),
  containerMaxWidth: z.string().optional(),
  sectionPadding: z.string().optional(),
})

const bordersSchema = z.object({
  radius: z.string().optional(),
  radiusLarge: z.string().optional(),
  radiusSmall: z.string().optional(),
  width: z.string().optional(),
})

const shadowsSchema = z.object({
  small: z.string().optional(),
  medium: z.string().optional(),
  large: z.string().optional(),
})

const buttonsSchema = z.object({
  borderRadius: z.string().optional(),
  padding: z.string().optional(),
  fontSize: z.string().optional(),
  fontWeight: z.string().optional(),
})

const createThemeSchema = z.object({
  name: z.string().min(1).max(100),
  colors: colorsSchema.optional(),
  typography: typographySchema.optional(),
  spacing: spacingSchema.optional(),
  borders: bordersSchema.optional(),
  shadows: shadowsSchema.optional(),
  buttons: buttonsSchema.optional(),
  isDefault: z.boolean().optional(),
})

const updateThemeSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  colors: colorsSchema.optional(),
  typography: typographySchema.optional(),
  spacing: spacingSchema.optional(),
  borders: bordersSchema.optional(),
  shadows: shadowsSchema.optional(),
  buttons: buttonsSchema.optional(),
  isDefault: z.boolean().optional(),
})

interface RouteParams {
  params: Promise<{ workspaceId: string }>
}

/**
 * GET /api/workspaces/[workspaceId]/themes
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
    const presets = searchParams.get('presets') === 'true'
    const defaults = searchParams.get('defaults') === 'true'

    if (presets) {
      return NextResponse.json({ presets: getPresetThemes() })
    }

    if (defaults) {
      return NextResponse.json({ defaults: getDefaultTheme() })
    }

    const themes = await getThemes(workspaceId)

    return NextResponse.json({ themes })
  } catch (error) {
    console.error('Error listing themes:', error)
    return NextResponse.json({ error: 'Failed to list themes' }, { status: 500 })
  }
}

/**
 * POST /api/workspaces/[workspaceId]/themes
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
    const parsed = createThemeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const theme = await createTheme({
      workspaceId,
      ...parsed.data,
    })

    return NextResponse.json({ theme }, { status: 201 })
  } catch (error) {
    console.error('Error creating theme:', error)
    return NextResponse.json({ error: 'Failed to create theme' }, { status: 500 })
  }
}

/**
 * PATCH /api/workspaces/[workspaceId]/themes
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
    const parsed = updateThemeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { id, ...updates } = parsed.data
    const theme = await updateTheme(workspaceId, id, updates)

    return NextResponse.json({ theme })
  } catch (error) {
    console.error('Error updating theme:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update theme' }, { status: 500 })
  }
}

/**
 * DELETE /api/workspaces/[workspaceId]/themes
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
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    await deleteTheme(workspaceId, id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting theme:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to delete theme' }, { status: 500 })
  }
}
