import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  cancelSubscription,
  resumeSubscription,
  changeSubscriptionPlan,
} from '@/lib/subscription/service'
import { hasWorkspaceRole } from '@/lib/workspace/service'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const updateSubscriptionSchema = z.object({
  action: z.enum(['cancel', 'resume', 'change_plan']),
  reason: z.string().optional(),
  cancelImmediately: z.boolean().optional(),
  newPlanId: z.string().optional(),
})

interface RouteParams {
  params: Promise<{ subscriptionId: string }>
}

/**
 * GET /api/subscriptions/[subscriptionId] - Get subscription details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { subscriptionId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        plan: true,
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // Check access
    const hasAccess = await hasWorkspaceRole(subscription.workspaceId, session.user.id, [
      'OWNER',
      'ADMIN',
      'MEMBER',
      'VIEWER',
    ])
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

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
 * POST /api/subscriptions/[subscriptionId] - Subscription actions (cancel, resume, change plan)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { subscriptionId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    })

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // Check admin access
    const hasAdminAccess = await hasWorkspaceRole(subscription.workspaceId, session.user.id, [
      'OWNER',
      'ADMIN',
    ])
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = updateSubscriptionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { action, reason, cancelImmediately, newPlanId } = parsed.data

    switch (action) {
      case 'cancel': {
        const canceled = await cancelSubscription(subscriptionId, reason, cancelImmediately)
        return NextResponse.json({ subscription: canceled })
      }

      case 'resume': {
        const resumed = await resumeSubscription(subscriptionId)
        return NextResponse.json({ subscription: resumed })
      }

      case 'change_plan': {
        if (!newPlanId) {
          return NextResponse.json({ error: 'newPlanId is required' }, { status: 400 })
        }
        const changed = await changeSubscriptionPlan(subscriptionId, newPlanId)
        return NextResponse.json({ subscription: changed })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error updating subscription:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}
