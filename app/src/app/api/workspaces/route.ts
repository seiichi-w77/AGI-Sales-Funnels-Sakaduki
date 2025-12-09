import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  createWorkspace,
  getWorkspacesForUser,
  generateUniqueSlug,
} from '@/lib/workspace/service'
import { z } from 'zod'

const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  logoUrl: z.string().url().optional(),
})

/**
 * GET /api/workspaces - List user's workspaces
 */
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workspaces = await getWorkspacesForUser(session.user.id)

    return NextResponse.json({ workspaces })
  } catch (error) {
    console.error('Error fetching workspaces:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workspaces' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/workspaces - Create new workspace
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = createWorkspaceSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { name, description, logoUrl } = parsed.data
    const slug = parsed.data.slug || (await generateUniqueSlug(name))

    const workspace = await createWorkspace({
      name,
      slug,
      description,
      logoUrl,
      ownerId: session.user.id,
    })

    return NextResponse.json({ workspace }, { status: 201 })
  } catch (error) {
    console.error('Error creating workspace:', error)

    if (error instanceof Error && error.message === 'Workspace slug already exists') {
      return NextResponse.json(
        { error: 'Workspace slug already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create workspace' },
      { status: 500 }
    )
  }
}
