import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createCampaign, listCampaigns } from '@/lib/email/service'
import { hasWorkspaceAccess } from '@/lib/workspace/service'
import { z } from 'zod'

const createCampaignSchema = z.object({
  workspaceId: z.string(),
  name: z.string().min(1).max(200),
  subject: z.string().min(1).max(200),
  preheader: z.string().max(200).optional(),
  fromName: z.string().min(1).max(100),
  fromEmail: z.string().email(),
  replyTo: z.string().email().optional(),
  content: z.record(z.string(), z.unknown()),
  contentText: z.string().optional(),
  type: z.enum(['BROADCAST', 'AUTOMATION', 'TRANSACTIONAL']).default('BROADCAST'),
  audienceRules: z.record(z.string(), z.unknown()).optional(),
  scheduledAt: z.string().datetime().optional(),
})

/**
 * GET /api/email/campaigns - List campaigns
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 })
    }

    // Check access
    const hasAccess = await hasWorkspaceAccess(workspaceId, session.user.id)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const result = await listCampaigns(workspaceId, { limit, offset })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error listing campaigns:', error)
    return NextResponse.json(
      { error: 'Failed to list campaigns' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/email/campaigns - Create campaign
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = createCampaignSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { workspaceId } = parsed.data

    // Check access
    const hasAccess = await hasWorkspaceAccess(workspaceId, session.user.id)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const campaign = await createCampaign({
      ...parsed.data,
      scheduledAt: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : undefined,
    })

    return NextResponse.json({ campaign }, { status: 201 })
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
}
