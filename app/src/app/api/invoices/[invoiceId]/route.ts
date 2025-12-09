import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  getInvoiceById,
  updateInvoiceStatus,
  sendInvoice,
  voidInvoice,
  markInvoiceAsPaid,
  generateInvoicePdfData,
} from '@/lib/invoice/service'
import { hasWorkspaceAccess, hasWorkspaceRole } from '@/lib/workspace/service'
import { z } from 'zod'

const updateInvoiceSchema = z.object({
  action: z.enum(['send', 'void', 'mark_paid', 'update_status']),
  status: z.enum(['DRAFT', 'OPEN', 'PAID', 'VOID', 'UNCOLLECTIBLE']).optional(),
})

interface RouteParams {
  params: Promise<{ invoiceId: string }>
}

/**
 * GET /api/invoices/[invoiceId] - Get invoice details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { invoiceId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format')

    const invoice = await getInvoiceById(invoiceId)

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Check access
    const hasAccess = await hasWorkspaceAccess(invoice.workspaceId, session.user.id)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Return PDF data format
    if (format === 'pdf') {
      const pdfData = await generateInvoicePdfData(invoiceId)
      return NextResponse.json(pdfData)
    }

    return NextResponse.json({ invoice })
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/invoices/[invoiceId] - Invoice actions (send, void, mark paid)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { invoiceId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const invoice = await getInvoiceById(invoiceId)

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Check admin access
    const hasAdminAccess = await hasWorkspaceRole(invoice.workspaceId, session.user.id, [
      'OWNER',
      'ADMIN',
    ])
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = updateInvoiceSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { action, status } = parsed.data
    let updatedInvoice

    switch (action) {
      case 'send':
        updatedInvoice = await sendInvoice(invoiceId)
        break

      case 'void':
        updatedInvoice = await voidInvoice(invoiceId)
        break

      case 'mark_paid':
        updatedInvoice = await markInvoiceAsPaid(invoiceId)
        break

      case 'update_status':
        if (!status) {
          return NextResponse.json({ error: 'status is required' }, { status: 400 })
        }
        updatedInvoice = await updateInvoiceStatus(invoiceId, status)
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ invoice: updatedInvoice })
  } catch (error) {
    console.error('Error updating invoice:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    )
  }
}
