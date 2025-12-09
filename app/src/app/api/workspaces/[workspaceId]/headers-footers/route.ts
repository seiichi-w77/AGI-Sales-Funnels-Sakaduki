import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  getHeadersFooters,
  createHeaderFooter,
  updateHeaderFooter,
  deleteHeaderFooter,
  getHeaderFooterTemplates,
} from '@/lib/header-footer/service'
import { hasWorkspaceAccess, hasWorkspaceRole } from '@/lib/workspace/service'
import { z } from 'zod'

const createHeaderFooterSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['header', 'footer']),
  content: z.record(z.string(), z.unknown()),
  styles: z.record(z.string(), z.unknown()).optional(),
  isDefault: z.boolean().optional(),
})

const updateHeaderFooterSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  content: z.record(z.string(), z.unknown()).optional(),
  styles: z.record(z.string(), z.unknown()).optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
})

interface RouteParams {
  params: Promise<{ workspaceId: string }>
}

/**
 * GET /api/workspaces/[workspaceId]/headers-footers
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
    const type = searchParams.get('type') as 'header' | 'footer' | null
    const templates = searchParams.get('templates') === 'true'

    if (templates) {
      return NextResponse.json({ templates: getHeaderFooterTemplates() })
    }

    const headersFooters = await getHeadersFooters(workspaceId, type || undefined)

    return NextResponse.json({ headersFooters })
  } catch (error) {
    console.error('Error listing headers/footers:', error)
    return NextResponse.json({ error: 'Failed to list headers/footers' }, { status: 500 })
  }
}

/**
 * POST /api/workspaces/[workspaceId]/headers-footers
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
    const parsed = createHeaderFooterSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const headerFooter = await createHeaderFooter({
      workspaceId,
      ...parsed.data,
    })

    return NextResponse.json({ headerFooter }, { status: 201 })
  } catch (error) {
    console.error('Error creating header/footer:', error)
    return NextResponse.json({ error: 'Failed to create header/footer' }, { status: 500 })
  }
}

/**
 * PATCH /api/workspaces/[workspaceId]/headers-footers
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
    const parsed = updateHeaderFooterSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { id, ...updates } = parsed.data
    const headerFooter = await updateHeaderFooter(workspaceId, id, updates)

    return NextResponse.json({ headerFooter })
  } catch (error) {
    console.error('Error updating header/footer:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update header/footer' }, { status: 500 })
  }
}

/**
 * DELETE /api/workspaces/[workspaceId]/headers-footers
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

    await deleteHeaderFooter(workspaceId, id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting header/footer:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to delete header/footer' }, { status: 500 })
  }
}
