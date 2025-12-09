import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  createSubscription,
  getSubscriptionByWorkspaceId,
  getPlans,
  getSubscriptionUsage,
} from '@/lib/subscription/service'
import { hasWorkspaceAccess, hasWorkspaceRole } from '@/lib/workspace/service'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const createSubscriptionSchema = z.object({
  workspaceId: z.string(),
  planId: z.string(),
  paymentMethodId: z.string().optional(),
})

/**
 * GET /api/subscriptions - Get subscription for workspace or list plans
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    const listPlans = searchParams.get('plans') === 'true'
    const getUsage = searchParams.get('usage') === 'true'

    // List all available plans
    if (listPlans) {
      const plans = await getPlans()
      return NextResponse.json({ plans })
    }

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 })
    }

    // Check access
    const hasAccess = await hasWorkspaceAccess(workspaceId, session.user.id)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get usage metrics
    if (getUsage) {
      const usage = await getSubscriptionUsage(workspaceId)
      return NextResponse.json({ usage })
    }

    // Get subscription
    const subscription = await getSubscriptionByWorkspaceId(workspaceId)

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/subscriptions - Create new subscription
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = createSubscriptionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { workspaceId, planId, paymentMethodId } = parsed.data

    // Check admin access
    const hasAdminAccess = await hasWorkspaceRole(workspaceId, session.user.id, ['OWNER', 'ADMIN'])
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get user email
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    })

    if (!user?.email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 })
    }

    const subscription = await createSubscription({
      workspaceId,
      planId,
      paymentMethodId,
      email: user.email,
    })

    return NextResponse.json({ subscription }, { status: 201 })
  } catch (error) {
    console.error('Error creating subscription:', error)

    if (error instanceof Error) {
      if (error.message === 'Plan not found') {
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
      }
      if (error.message === 'Workspace already has an active subscription') {
        return NextResponse.json({ error: 'Workspace already has an active subscription' }, { status: 409 })
      }
    }

    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}
