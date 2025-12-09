import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getWorkspaceTaxRates, getTaxRate } from '@/lib/tax/service'
import { hasWorkspaceAccess } from '@/lib/workspace/service'
import { z } from 'zod'

/**
 * GET /api/tax/rates - Get tax rates
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    const country = searchParams.get('country')
    const state = searchParams.get('state')

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 })
    }

    // Check access
    const hasAccess = await hasWorkspaceAccess(workspaceId, session.user.id)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get specific rate for address
    if (country) {
      const rate = await getTaxRate(workspaceId, {
        country,
        state: state || undefined,
      })
      return NextResponse.json({ rate })
    }

    // Get all rates for workspace
    const rates = await getWorkspaceTaxRates(workspaceId)

    return NextResponse.json({ rates })
  } catch (error) {
    console.error('Error fetching tax rates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tax rates' },
      { status: 500 }
    )
  }
}
