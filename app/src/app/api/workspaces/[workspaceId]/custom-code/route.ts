import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  getCustomCodes,
  createCustomCode,
  updateCustomCode,
  deleteCustomCode,
  duplicateCustomCode,
  reorderCustomCodes,
  validateCode,
  getCodeSnippetLibrary,
  getCompiledCode,
} from '@/lib/custom-code/service'
import { hasWorkspaceAccess, hasWorkspaceRole } from '@/lib/workspace/service'
import { z } from 'zod'

const createCustomCodeSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['css', 'js']),
  code: z.string().max(100000),
  location: z.enum(['head', 'body_start', 'body_end']).optional(),
  scope: z.enum(['funnel', 'step', 'workspace']),
  scopeId: z.string(),
  isActive: z.boolean().optional(),
  order: z.number().optional(),
  description: z.string().max(500).optional(),
})

const updateCustomCodeSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  code: z.string().max(100000).optional(),
  location: z.enum(['head', 'body_start', 'body_end']).optional(),
  isActive: z.boolean().optional(),
  order: z.number().optional(),
  description: z.string().max(500).optional(),
})

const validateCodeSchema = z.object({
  code: z.string(),
  type: z.enum(['css', 'js']),
})

const reorderSchema = z.object({
  codeOrders: z.array(z.object({
    id: z.string(),
    order: z.number(),
  })),
})

interface RouteParams {
  params: Promise<{ workspaceId: string }>
}

/**
 * GET /api/workspaces/[workspaceId]/custom-code
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
    const library = searchParams.get('library') === 'true'
    const compiled = searchParams.get('compiled') === 'true'
    const funnelId = searchParams.get('funnelId')
    const stepId = searchParams.get('stepId') || undefined

    // Get code snippet library
    if (library) {
      return NextResponse.json({ snippets: getCodeSnippetLibrary() })
    }

    // Get compiled code for rendering
    if (compiled && funnelId) {
      const compiledCode = await getCompiledCode(workspaceId, funnelId, stepId)
      return NextResponse.json({ compiled: compiledCode })
    }

    const customCodes = await getCustomCodes(workspaceId)

    return NextResponse.json({ customCodes })
  } catch (error) {
    console.error('Error listing custom codes:', error)
    return NextResponse.json({ error: 'Failed to list custom codes' }, { status: 500 })
  }
}

/**
 * POST /api/workspaces/[workspaceId]/custom-code
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

    // Validate code
    if (action === 'validate') {
      const parsed = validateCodeSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid input', details: parsed.error.flatten() },
          { status: 400 }
        )
      }

      const validation = validateCode(parsed.data.code, parsed.data.type)
      return NextResponse.json(validation)
    }

    // Duplicate code
    if (action === 'duplicate') {
      const { codeId, newName } = body
      if (!codeId) {
        return NextResponse.json({ error: 'codeId is required' }, { status: 400 })
      }

      const duplicatedCode = await duplicateCustomCode(workspaceId, codeId, newName)
      return NextResponse.json({ customCode: duplicatedCode }, { status: 201 })
    }

    // Reorder codes
    if (action === 'reorder') {
      const parsed = reorderSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid input', details: parsed.error.flatten() },
          { status: 400 }
        )
      }

      await reorderCustomCodes(workspaceId, parsed.data.codeOrders)
      return NextResponse.json({ success: true })
    }

    // Create custom code
    const parsed = createCustomCodeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const customCode = await createCustomCode({
      workspaceId,
      ...parsed.data,
    })

    return NextResponse.json({ customCode }, { status: 201 })
  } catch (error) {
    console.error('Error with custom code:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to process custom code request' }, { status: 500 })
  }
}

/**
 * PATCH /api/workspaces/[workspaceId]/custom-code
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
    const parsed = updateCustomCodeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { id, ...updates } = parsed.data
    const customCode = await updateCustomCode(workspaceId, id, updates)

    return NextResponse.json({ customCode })
  } catch (error) {
    console.error('Error updating custom code:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update custom code' }, { status: 500 })
  }
}

/**
 * DELETE /api/workspaces/[workspaceId]/custom-code
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

    await deleteCustomCode(workspaceId, id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting custom code:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to delete custom code' }, { status: 500 })
  }
}
