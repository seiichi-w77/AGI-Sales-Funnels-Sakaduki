import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  getABTests,
  createABTest,
  updateABTest,
  deleteABTest,
  addABTestVariant,
  updateVariantWeights,
  getABTestResults,
  declareWinner,
} from '@/lib/abtest/service'
import { getFunnelById } from '@/lib/funnel/service'
import { hasWorkspaceRole } from '@/lib/workspace/service'
import { z } from 'zod'

const createABTestSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  originalStepId: z.string(),
  goal: z.enum(['conversion', 'clicks', 'time_on_page', 'bounce_rate', 'revenue']).optional(),
  confidenceLevel: z.number().min(80).max(99).optional(),
  minimumSampleSize: z.number().min(10).max(100000).optional(),
})

const updateABTestSchema = z.object({
  testId: z.string(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  goal: z.enum(['conversion', 'clicks', 'time_on_page', 'bounce_rate', 'revenue']).optional(),
  confidenceLevel: z.number().min(80).max(99).optional(),
  minimumSampleSize: z.number().min(10).max(100000).optional(),
  status: z.enum(['draft', 'running', 'paused', 'completed']).optional(),
})

const addVariantSchema = z.object({
  testId: z.string(),
  name: z.string().min(1).max(100),
  stepId: z.string(),
  weight: z.number().min(1).max(99).optional(),
})

const updateWeightsSchema = z.object({
  testId: z.string(),
  weights: z.array(z.object({
    variantId: z.string(),
    weight: z.number().min(0).max(100),
  })),
})

const declareWinnerSchema = z.object({
  testId: z.string(),
  variantId: z.string(),
})

interface RouteParams {
  params: Promise<{ funnelId: string }>
}

/**
 * GET /api/funnels/[funnelId]/abtests
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    const hasAccess = await hasWorkspaceRole(funnel.workspaceId, session.user.id, [
      'OWNER', 'ADMIN', 'MEMBER', 'VIEWER',
    ])
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const testId = searchParams.get('testId')
    const results = searchParams.get('results') === 'true'

    if (testId && results) {
      const testResults = await getABTestResults(funnelId, testId)
      return NextResponse.json({ results: testResults })
    }

    const abTests = await getABTests(funnelId)

    return NextResponse.json({ abTests })
  } catch (error) {
    console.error('Error listing A/B tests:', error)
    return NextResponse.json({ error: 'Failed to list A/B tests' }, { status: 500 })
  }
}

/**
 * POST /api/funnels/[funnelId]/abtests
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
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

    const body = await request.json()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    // Handle different actions
    if (action === 'addVariant') {
      const parsed = addVariantSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid input', details: parsed.error.flatten() },
          { status: 400 }
        )
      }

      const { testId, ...variantData } = parsed.data
      const test = await addABTestVariant(funnelId, testId, variantData)
      return NextResponse.json({ test })
    }

    if (action === 'updateWeights') {
      const parsed = updateWeightsSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid input', details: parsed.error.flatten() },
          { status: 400 }
        )
      }

      const { testId, weights } = parsed.data
      const test = await updateVariantWeights(funnelId, testId, weights)
      return NextResponse.json({ test })
    }

    if (action === 'declareWinner') {
      const parsed = declareWinnerSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid input', details: parsed.error.flatten() },
          { status: 400 }
        )
      }

      const { testId, variantId } = parsed.data
      const test = await declareWinner(funnelId, testId, variantId)
      return NextResponse.json({ test })
    }

    // Default: Create new A/B test
    const parsed = createABTestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const abTest = await createABTest({
      funnelId,
      ...parsed.data,
    })

    return NextResponse.json({ abTest }, { status: 201 })
  } catch (error) {
    console.error('Error with A/B test:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to process A/B test request' }, { status: 500 })
  }
}

/**
 * PATCH /api/funnels/[funnelId]/abtests
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

    const body = await request.json()
    const parsed = updateABTestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { testId, ...updates } = parsed.data
    const abTest = await updateABTest(funnelId, testId, updates)

    return NextResponse.json({ abTest })
  } catch (error) {
    console.error('Error updating A/B test:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update A/B test' }, { status: 500 })
  }
}

/**
 * DELETE /api/funnels/[funnelId]/abtests
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
    const testId = searchParams.get('testId')

    if (!testId) {
      return NextResponse.json({ error: 'testId is required' }, { status: 400 })
    }

    await deleteABTest(funnelId, testId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting A/B test:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to delete A/B test' }, { status: 500 })
  }
}
