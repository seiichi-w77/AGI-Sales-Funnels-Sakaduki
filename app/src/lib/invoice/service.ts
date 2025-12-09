import { prisma } from '@/lib/db/prisma'
import { stripe } from '@/lib/stripe/config'
import type { Invoice, InvoiceStatus, InvoiceItem } from '@prisma/client'

export interface CreateInvoiceInput {
  workspaceId: string
  subscriptionId?: string
  items: {
    description: string
    quantity: number
    unitPrice: number
  }[]
  dueDate?: Date
  currency?: string
}

export interface InvoiceWithItems extends Invoice {
  items: InvoiceItem[]
}

/**
 * Generate unique invoice number
 */
export async function generateInvoiceNumber(workspaceId: string): Promise<string> {
  const count = await prisma.invoice.count({
    where: { workspaceId },
  })

  const year = new Date().getFullYear()
  const number = (count + 1).toString().padStart(5, '0')

  return `INV-${year}-${number}`
}

/**
 * Create a new invoice
 */
export async function createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
  const { workspaceId, subscriptionId, items, dueDate, currency = 'USD' } = input

  const invoiceNumber = await generateInvoiceNumber(workspaceId)

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const tax = 0 // Tax calculation should be done separately
  const total = subtotal + tax

  const invoice = await prisma.invoice.create({
    data: {
      workspaceId,
      subscriptionId,
      number: invoiceNumber,
      status: 'DRAFT',
      subtotal,
      tax,
      total,
      currency,
      dueDate,
      items: {
        create: items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.unitPrice * item.quantity,
        })),
      },
    },
    include: {
      items: true,
    },
  })

  return invoice
}

/**
 * Get invoice by ID
 */
export async function getInvoiceById(invoiceId: string): Promise<InvoiceWithItems | null> {
  return prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      items: true,
      workspace: {
        select: {
          id: true,
          name: true,
          logoUrl: true,
        },
      },
      subscription: {
        select: {
          id: true,
          plan: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  })
}

/**
 * Get invoice by number
 */
export async function getInvoiceByNumber(number: string): Promise<InvoiceWithItems | null> {
  return prisma.invoice.findUnique({
    where: { number },
    include: {
      items: true,
    },
  })
}

/**
 * List invoices for workspace
 */
export async function listInvoices(
  workspaceId: string,
  options?: {
    status?: InvoiceStatus
    subscriptionId?: string
    limit?: number
    offset?: number
  }
): Promise<{ invoices: Invoice[]; total: number }> {
  const { status, subscriptionId, limit = 20, offset = 0 } = options || {}

  const where = {
    workspaceId,
    ...(status && { status }),
    ...(subscriptionId && { subscriptionId }),
  }

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.invoice.count({ where }),
  ])

  return { invoices, total }
}

/**
 * Update invoice status
 */
export async function updateInvoiceStatus(
  invoiceId: string,
  status: InvoiceStatus,
  paidAt?: Date
): Promise<Invoice> {
  return prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status,
      paidAt: status === 'PAID' ? paidAt || new Date() : undefined,
    },
  })
}

/**
 * Send invoice
 */
export async function sendInvoice(invoiceId: string): Promise<Invoice> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      workspace: true,
    },
  })

  if (!invoice) {
    throw new Error('Invoice not found')
  }

  if (invoice.status !== 'DRAFT') {
    throw new Error('Invoice has already been sent')
  }

  // Update status to OPEN
  const updatedInvoice = await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: 'OPEN' },
  })

  // TODO: Send email notification
  // await sendInvoiceEmail(invoice)

  return updatedInvoice
}

/**
 * Void invoice
 */
export async function voidInvoice(invoiceId: string): Promise<Invoice> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
  })

  if (!invoice) {
    throw new Error('Invoice not found')
  }

  if (invoice.status === 'PAID') {
    throw new Error('Cannot void a paid invoice')
  }

  return prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: 'VOID' },
  })
}

/**
 * Mark invoice as paid
 */
export async function markInvoiceAsPaid(
  invoiceId: string,
  stripePaymentIntentId?: string
): Promise<Invoice> {
  return prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status: 'PAID',
      paidAt: new Date(),
      stripeInvoiceId: stripePaymentIntentId,
    },
  })
}

/**
 * Create invoice from order
 */
export async function createInvoiceFromOrder(orderId: string): Promise<Invoice> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
    },
  })

  if (!order) {
    throw new Error('Order not found')
  }

  const invoiceNumber = await generateInvoiceNumber(order.workspaceId)

  return prisma.invoice.create({
    data: {
      workspaceId: order.workspaceId,
      number: invoiceNumber,
      status: order.status === 'COMPLETED' ? 'PAID' : 'OPEN',
      subtotal: order.subtotal,
      tax: order.taxTotal,
      total: order.total,
      currency: order.currency,
      paidAt: order.paidAt,
      items: {
        create: order.items.map((item) => ({
          description: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.totalPrice,
        })),
      },
    },
    include: {
      items: true,
    },
  })
}

/**
 * Generate invoice PDF data
 */
export async function generateInvoicePdfData(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      items: true,
      workspace: {
        select: {
          name: true,
          logoUrl: true,
        },
      },
    },
  })

  if (!invoice) {
    throw new Error('Invoice not found')
  }

  return {
    invoiceNumber: invoice.number,
    status: invoice.status,
    createdAt: invoice.createdAt,
    dueDate: invoice.dueDate,
    paidAt: invoice.paidAt,
    currency: invoice.currency,
    company: {
      name: invoice.workspace.name,
      logo: invoice.workspace.logoUrl,
    },
    items: invoice.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      amount: item.amount,
    })),
    subtotal: invoice.subtotal,
    tax: invoice.tax,
    total: invoice.total,
  }
}

/**
 * Get invoice analytics for workspace
 */
export async function getInvoiceAnalytics(workspaceId: string) {
  const [totalInvoices, paidInvoices, openInvoices, totalRevenue, outstandingAmount] =
    await Promise.all([
      prisma.invoice.count({ where: { workspaceId } }),
      prisma.invoice.count({ where: { workspaceId, status: 'PAID' } }),
      prisma.invoice.count({ where: { workspaceId, status: 'OPEN' } }),
      prisma.invoice.aggregate({
        where: { workspaceId, status: 'PAID' },
        _sum: { total: true },
      }),
      prisma.invoice.aggregate({
        where: { workspaceId, status: 'OPEN' },
        _sum: { total: true },
      }),
    ])

  return {
    totalInvoices,
    paidInvoices,
    openInvoices,
    totalRevenue: totalRevenue._sum.total || 0,
    outstandingAmount: outstandingAmount._sum.total || 0,
    collectionRate: totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0,
  }
}

/**
 * Process Stripe invoice webhook
 */
export async function processInvoiceWebhook(
  event: string,
  stripeInvoiceId: string,
  data: Record<string, unknown>
): Promise<void> {
  const invoice = await prisma.invoice.findUnique({
    where: { stripeInvoiceId },
  })

  switch (event) {
    case 'invoice.paid':
      if (invoice) {
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            status: 'PAID',
            paidAt: new Date(),
          },
        })
      }
      break

    case 'invoice.payment_failed':
      if (invoice) {
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: { status: 'UNCOLLECTIBLE' },
        })
      }
      break
  }
}
