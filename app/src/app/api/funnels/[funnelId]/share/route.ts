import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  getShareLinks,
  createShareLink,
  deactivateShareLink,
  deleteShareLink,
  cloneFunnel,
  validateShareToken,
  getFunnelForShare,
  exportFunnelAsJson,
  importFunnelFromJson,
} from '@/lib/funnel-share/service'
import { getFunnelById } from '@/lib/funnel/service'
import { hasWorkspaceRole, hasWorkspaceAccess } from '@/lib/workspace/service'
import { z } from 'zod'

const createShareLinkSchema = z.object({
  permission: z.enum(['view', 'clone', 'edit']),
  password: z.string().min(4).max(100).optional(),
  expiresAt: z.string().datetime().optional(),
  maxUses: z.number().min(1).max(1000).optional(),
})

const cloneFunnelSchema = z.object({
  targetWorkspaceId: z.string(),
  newName: z.string().min(1).max(100),
  shareToken: z.string().optional(),
})

const validateTokenSchema = z.object({
  token: z.string(),
  password: z.string().optional(),
})

const importFunnelSchema = z.object({
  workspaceId: z.string(),
  data: z.object({
    funnel: z.object({
      name: z.string(),
      description: z.string().optional(),
      settings: z.record(z.string(), z.unknown()).optional(),
    }),
    steps: z.array(z.object({
      name: z.string(),
      slug: z.string(),
      type: z.string(),
      sortOrder: z.number(),
      pageContent: z.record(z.string(), z.unknown()).optional(),
      settings: z.record(z.string(), z.unknown()).optional(),
    })),
  }),
})

interface RouteParams {
  params: Promise<{ funnelId: string }>
}

/**
 * GET /api/funnels/[funnelId]/share
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { funnelId } = await params

    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const password = searchParams.get('password') || undefined
    const exportJson = searchParams.get('export') === 'true'

    // Public share link access
    if (token) {
      const result = await getFunnelForShare(funnelId, token, password)
      if (!result.funnel) {
        return NextResponse.json({ error: result.error }, { status: 403 })
      }
      return NextResponse.json({ funnel: result.funnel })
    }

    // Authenticated access
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const funnel = await getFunnelById(funnelId)
    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 })
    }

    const hasAccess = await hasWorkspaceRole(funnel.workspaceId, session.user.id, [
      'OWNER', 'ADMIN',
    ])
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Export funnel as JSON
    if (exportJson) {
      const exportData = await exportFunnelAsJson(funnelId)
      return NextResponse.json({ export: exportData })
    }

    // Get share links
    const shareLinks = await getShareLinks(funnelId)

    return NextResponse.json({ shareLinks })
  } catch (error) {
    console.error('Error with share:', error)
    return NextResponse.json({ error: 'Failed to process share request' }, { status: 500 })
  }
}

/**
 * POST /api/funnels/[funnelId]/share
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { funnelId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    // Clone funnel
    if (action === 'clone') {
      const parsed = cloneFunnelSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid input', details: parsed.error.flatten() },
          { status: 400 }
        )
      }

      // Check target workspace access
      const hasTargetAccess = await hasWorkspaceRole(
        parsed.data.targetWorkspaceId,
        session.user.id,
        ['OWNER', 'ADMIN']
      )
      if (!hasTargetAccess) {
        return NextResponse.json({ error: 'No access to target workspace' }, { status: 403 })
      }

      // If no share token, check source funnel access
      if (!parsed.data.shareToken) {
        const funnel = await getFunnelById(funnelId)
        if (!funnel) {
          return NextResponse.json({ error: 'Funnel not found' }, { status: 404 })
        }

        const hasSourceAccess = await hasWorkspaceAccess(funnel.workspaceId, session.user.id)
        if (!hasSourceAccess) {
          return NextResponse.json({ error: 'No access to source funnel' }, { status: 403 })
        }
      }

      const clonedFunnel = await cloneFunnel({
        sourceFunnelId: funnelId,
        targetWorkspaceId: parsed.data.targetWorkspaceId,
        newName: parsed.data.newName,
        userId: session.user.id,
        shareToken: parsed.data.shareToken,
      })

      return NextResponse.json({ funnel: clonedFunnel }, { status: 201 })
    }

    // Validate share token
    if (action === 'validate') {
      const parsed = validateTokenSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid input', details: parsed.error.flatten() },
          { status: 400 }
        )
      }

      const result = await validateShareToken(funnelId, parsed.data.token, parsed.data.password)
      return NextResponse.json(result)
    }

    // Import funnel
    if (action === 'import') {
      const parsed = importFunnelSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid input', details: parsed.error.flatten() },
          { status: 400 }
        )
      }

      const hasImportAccess = await hasWorkspaceRole(
        parsed.data.workspaceId,
        session.user.id,
        ['OWNER', 'ADMIN']
      )
      if (!hasImportAccess) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const importedFunnel = await importFunnelFromJson(
        parsed.data.workspaceId,
        session.user.id,
        parsed.data.data
      )

      return NextResponse.json({ funnel: importedFunnel }, { status: 201 })
    }

    // Create share link
    const funnel = await getFunnelById(funnelId)
    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 })
    }

    const hasAdminAccess = await hasWorkspaceRole(funnel.workspaceId, session.user.id, [
      'OWNER', 'ADMIN',
    ])
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const parsed = createShareLinkSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const shareLink = await createShareLink({
      funnelId,
      createdBy: session.user.id,
      ...parsed.data,
    })

    return NextResponse.json({ shareLink }, { status: 201 })
  } catch (error) {
    console.error('Error with share:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to process share request' }, { status: 500 })
  }
}

/**
 * PATCH /api/funnels/[funnelId]/share
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { funnelId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const funnel = await getFunnelById(funnelId)
    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 })
    }

    const hasAdminAccess = await hasWorkspaceRole(funnel.workspaceId, session.user.id, [
      'OWNER', 'ADMIN',
    ])
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const linkId = searchParams.get('linkId')

    if (!linkId) {
      return NextResponse.json({ error: 'linkId is required' }, { status: 400 })
    }

    await deactivateShareLink(funnelId, linkId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deactivating share link:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to deactivate share link' }, { status: 500 })
  }
}

/**
 * DELETE /api/funnels/[funnelId]/share
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { funnelId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const funnel = await getFunnelById(funnelId)
    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 })
    }

    const hasAdminAccess = await hasWorkspaceRole(funnel.workspaceId, session.user.id, [
      'OWNER', 'ADMIN',
    ])
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const linkId = searchParams.get('linkId')

    if (!linkId) {
      return NextResponse.json({ error: 'linkId is required' }, { status: 400 })
    }

    await deleteShareLink(funnelId, linkId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting share link:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to delete share link' }, { status: 500 })
  }
}
