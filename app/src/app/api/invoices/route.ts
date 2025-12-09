import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  createInvoice,
  listInvoices,
  getInvoiceAnalytics,
  createInvoiceFromOrder,
} from '@/lib/invoice/service'
import { hasWorkspaceAccess, hasWorkspaceRole } from '@/lib/workspace/service'
import { z } from 'zod'

const createInvoiceSchema = z.object({
  workspaceId: z.string(),
  subscriptionId: z.string().optional(),
  orderId: z.string().optional(),
  items: z
    .array(
      z.object({
        description: z.string(),
        quantity: z.number().int().min(1),
        unitPrice: z.number().int().min(0),
      })
    )
    .optional(),
  dueDate: z.string().datetime().optional(),
  currency: z.string().length(3).default('USD'),
})

/**
 * GET /api/invoices - List invoices for workspace
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    const status = searchParams.get('status') as
      | 'DRAFT'
      | 'OPEN'
      | 'PAID'
      | 'VOID'
      | 'UNCOLLECTIBLE'
      | null
    const analytics = searchParams.get('analytics') === 'true'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 })
    }

    // Check access
    const hasAccess = await hasWorkspaceAccess(workspaceId, session.user.id)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get analytics
    if (analytics) {
      const data = await getInvoiceAnalytics(workspaceId)
      return NextResponse.json(data)
    }

    // List invoices
    const result = await listInvoices(workspaceId, {
      status: status || undefined,
      limit,
      offset,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error listing invoices:', error)
    return NextResponse.json(
      { error: 'Failed to list invoices' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/invoices - Create new invoice
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = createInvoiceSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { workspaceId, subscriptionId, orderId, items, dueDate, currency } = parsed.data

    // Check admin access
    const hasAdminAccess = await hasWorkspaceRole(workspaceId, session.user.id, [
      'OWNER',
      'ADMIN',
    ])
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let invoice

    // Create from order
    if (orderId) {
      invoice = await createInvoiceFromOrder(orderId)
    } else if (items && items.length > 0) {
      // Create manual invoice
      invoice = await createInvoice({
        workspaceId,
        subscriptionId,
        items,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        currency,
      })
    } else {
      return NextResponse.json(
        { error: 'Either orderId or items must be provided' },
        { status: 400 }
      )
    }

    return NextResponse.json({ invoice }, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    )
  }
}
