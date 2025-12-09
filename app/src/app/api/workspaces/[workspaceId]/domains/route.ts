import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  getDomains,
  createDomain,
  updateDomain,
  deleteDomain,
  verifyDomain,
  activateDomain,
  getDomainVerificationInfo,
  getDnsInstructions,
  isSubdomainAvailable,
  generateSubdomain,
} from '@/lib/domain/service'
import { hasWorkspaceAccess, hasWorkspaceRole } from '@/lib/workspace/service'
import { z } from 'zod'

const createDomainSchema = z.object({
  domain: z.string().min(1).max(253),
  type: z.enum(['custom', 'subdomain']).optional(),
  funnelId: z.string().optional(),
  isPrimary: z.boolean().optional(),
})

const updateDomainSchema = z.object({
  id: z.string(),
  funnelId: z.string().nullable().optional(),
  isPrimary: z.boolean().optional(),
})

interface RouteParams {
  params: Promise<{ workspaceId: string }>
}

/**
 * GET /api/workspaces/[workspaceId]/domains
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
    const checkSubdomain = searchParams.get('checkSubdomain')
    const generateFrom = searchParams.get('generateSubdomain')

    // Check subdomain availability
    if (checkSubdomain) {
      const available = await isSubdomainAvailable(checkSubdomain)
      return NextResponse.json({ available })
    }

    // Generate subdomain suggestion
    if (generateFrom) {
      const subdomain = generateSubdomain(generateFrom)
      const available = await isSubdomainAvailable(subdomain)
      return NextResponse.json({ subdomain, available })
    }

    const domains = await getDomains(workspaceId)

    // Add verification info and DNS instructions to each domain
    const domainsWithInfo = domains.map((domain) => ({
      ...domain,
      verificationInfo: getDomainVerificationInfo(domain),
      dnsInstructions: getDnsInstructions(domain),
    }))

    return NextResponse.json({ domains: domainsWithInfo })
  } catch (error) {
    console.error('Error listing domains:', error)
    return NextResponse.json({ error: 'Failed to list domains' }, { status: 500 })
  }
}

/**
 * POST /api/workspaces/[workspaceId]/domains
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

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const domainId = searchParams.get('domainId')

    // Verify domain
    if (action === 'verify' && domainId) {
      const result = await verifyDomain(workspaceId, domainId)
      return NextResponse.json(result)
    }

    // Activate domain
    if (action === 'activate' && domainId) {
      const body = await request.json()
      const domain = await activateDomain(workspaceId, domainId, body.sslCertificateId)
      return NextResponse.json({ domain })
    }

    // Create domain
    const body = await request.json()
    const parsed = createDomainSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const domain = await createDomain({
      workspaceId,
      ...parsed.data,
    })

    return NextResponse.json({
      domain: {
        ...domain,
        verificationInfo: getDomainVerificationInfo(domain),
        dnsInstructions: getDnsInstructions(domain),
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Error with domain:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to process domain request' }, { status: 500 })
  }
}

/**
 * PATCH /api/workspaces/[workspaceId]/domains
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
    const parsed = updateDomainSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { id, funnelId, isPrimary } = parsed.data
    const updates: { funnelId?: string; isPrimary?: boolean } = {}

    if (funnelId !== undefined) {
      updates.funnelId = funnelId || undefined
    }
    if (isPrimary !== undefined) {
      updates.isPrimary = isPrimary
    }

    const domain = await updateDomain(workspaceId, id, updates)

    return NextResponse.json({
      domain: {
        ...domain,
        verificationInfo: getDomainVerificationInfo(domain),
        dnsInstructions: getDnsInstructions(domain),
      },
    })
  } catch (error) {
    console.error('Error updating domain:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update domain' }, { status: 500 })
  }
}

/**
 * DELETE /api/workspaces/[workspaceId]/domains
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

    await deleteDomain(workspaceId, id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting domain:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to delete domain' }, { status: 500 })
  }
}
