import { prisma } from '@/lib/db/prisma'

export type FulfillmentType = 'digital' | 'physical' | 'service' | 'membership' | 'webhook'
export type FulfillmentStatus = 'pending' | 'processing' | 'fulfilled' | 'failed' | 'cancelled'
export type DeliveryMethod = 'email' | 'download' | 'webhook' | 'manual' | 'api'

export interface FulfillmentRule {
  id: string
  name: string
  productId: string
  type: FulfillmentType
  deliveryMethod: DeliveryMethod
  settings: {
    // Digital delivery
    downloadUrl?: string
    downloadExpiry?: number // Hours
    maxDownloads?: number

    // Email delivery
    emailTemplate?: string
    emailSubject?: string

    // Webhook delivery
    webhookUrl?: string
    webhookHeaders?: Record<string, string>

    // Membership
    membershipLevel?: string
    membershipDuration?: number // Days

    // Physical
    shippingRequired?: boolean
    shippingProvider?: string

    // Service
    serviceDetails?: string
    bookingRequired?: boolean
  }
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface FulfillmentRecord {
  id: string
  orderId: string
  orderItemId: string
  productId: string
  ruleId: string
  status: FulfillmentStatus
  type: FulfillmentType
  deliveryMethod: DeliveryMethod
  deliveryDetails: {
    emailSentTo?: string
    downloadLink?: string
    downloadCount?: number
    webhookResponse?: string
    trackingNumber?: string
    shippingCarrier?: string
    membershipGranted?: boolean
    errorMessage?: string
  }
  attempts: number
  lastAttemptAt?: string
  fulfilledAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateFulfillmentRuleInput {
  workspaceId: string
  name: string
  productId: string
  type: FulfillmentType
  deliveryMethod: DeliveryMethod
  settings?: FulfillmentRule['settings']
  isActive?: boolean
}

/**
 * Get all fulfillment rules for a workspace
 */
export async function getFulfillmentRules(workspaceId: string): Promise<FulfillmentRule[]> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  })

  if (!workspace?.settings) {
    return []
  }

  const settings = workspace.settings as Record<string, unknown>
  return (settings.fulfillmentRules || []) as FulfillmentRule[]
}

/**
 * Get fulfillment rules for a product
 */
export async function getFulfillmentRulesForProduct(
  workspaceId: string,
  productId: string
): Promise<FulfillmentRule[]> {
  const rules = await getFulfillmentRules(workspaceId)
  return rules.filter((r) => r.productId === productId && r.isActive)
}

/**
 * Create a fulfillment rule
 */
export async function createFulfillmentRule(input: CreateFulfillmentRuleInput): Promise<FulfillmentRule> {
  const { workspaceId, name, productId, type, deliveryMethod, settings = {}, isActive = true } = input

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  })

  const workspaceSettings = (workspace?.settings || {}) as Record<string, unknown>
  const rules = (workspaceSettings.fulfillmentRules || []) as FulfillmentRule[]

  const newRule: FulfillmentRule = {
    id: `rule-${Date.now()}`,
    name,
    productId,
    type,
    deliveryMethod,
    settings,
    isActive,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      settings: {
        ...workspaceSettings,
        fulfillmentRules: [...rules, newRule],
      } as object,
    },
  })

  return newRule
}

/**
 * Update a fulfillment rule
 */
export async function updateFulfillmentRule(
  workspaceId: string,
  ruleId: string,
  updates: Partial<Omit<FulfillmentRule, 'id' | 'createdAt'>>
): Promise<FulfillmentRule> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  })

  if (!workspace?.settings) {
    throw new Error('Workspace not found')
  }

  const settings = workspace.settings as Record<string, unknown>
  const rules = (settings.fulfillmentRules || []) as FulfillmentRule[]

  const ruleIndex = rules.findIndex((r) => r.id === ruleId)
  if (ruleIndex === -1) {
    throw new Error('Fulfillment rule not found')
  }

  const updatedRule: FulfillmentRule = {
    ...rules[ruleIndex],
    ...updates,
    settings: { ...rules[ruleIndex].settings, ...updates.settings },
    updatedAt: new Date().toISOString(),
  }

  rules[ruleIndex] = updatedRule

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      settings: {
        ...settings,
        fulfillmentRules: rules,
      } as object,
    },
  })

  return updatedRule
}

/**
 * Delete a fulfillment rule
 */
export async function deleteFulfillmentRule(workspaceId: string, ruleId: string): Promise<void> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  })

  if (!workspace?.settings) {
    throw new Error('Workspace not found')
  }

  const settings = workspace.settings as Record<string, unknown>
  const rules = (settings.fulfillmentRules || []) as FulfillmentRule[]

  const filteredRules = rules.filter((r) => r.id !== ruleId)

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      settings: {
        ...settings,
        fulfillmentRules: filteredRules,
      } as object,
    },
  })
}

/**
 * Get fulfillment records for an order
 */
export async function getFulfillmentRecords(orderId: string): Promise<FulfillmentRecord[]> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { metadata: true },
  })

  if (!order?.metadata) {
    return []
  }

  const metadata = order.metadata as Record<string, unknown>
  return (metadata.fulfillmentRecords || []) as FulfillmentRecord[]
}

/**
 * Create fulfillment record
 */
export async function createFulfillmentRecord(
  orderId: string,
  record: Omit<FulfillmentRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<FulfillmentRecord> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { metadata: true },
  })

  const metadata = (order?.metadata || {}) as Record<string, unknown>
  const records = (metadata.fulfillmentRecords || []) as FulfillmentRecord[]

  const newRecord: FulfillmentRecord = {
    ...record,
    id: `fulfillment-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      metadata: {
        ...metadata,
        fulfillmentRecords: [...records, newRecord],
      } as object,
    },
  })

  return newRecord
}

/**
 * Update fulfillment record
 */
export async function updateFulfillmentRecord(
  orderId: string,
  recordId: string,
  updates: Partial<Pick<FulfillmentRecord, 'status' | 'deliveryDetails' | 'attempts' | 'lastAttemptAt' | 'fulfilledAt'>>
): Promise<FulfillmentRecord> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { metadata: true },
  })

  if (!order?.metadata) {
    throw new Error('Order not found')
  }

  const metadata = order.metadata as Record<string, unknown>
  const records = (metadata.fulfillmentRecords || []) as FulfillmentRecord[]

  const recordIndex = records.findIndex((r) => r.id === recordId)
  if (recordIndex === -1) {
    throw new Error('Fulfillment record not found')
  }

  const updatedRecord: FulfillmentRecord = {
    ...records[recordIndex],
    ...updates,
    deliveryDetails: { ...records[recordIndex].deliveryDetails, ...updates.deliveryDetails },
    updatedAt: new Date().toISOString(),
  }

  records[recordIndex] = updatedRecord

  await prisma.order.update({
    where: { id: orderId },
    data: {
      metadata: {
        ...metadata,
        fulfillmentRecords: records,
      } as object,
    },
  })

  return updatedRecord
}

/**
 * Process fulfillment for an order
 */
export async function processOrderFulfillment(
  orderId: string,
  workspaceId: string
): Promise<FulfillmentRecord[]> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  })

  if (!order) {
    throw new Error('Order not found')
  }

  const fulfillmentRecords: FulfillmentRecord[] = []

  for (const item of order.items) {
    // Skip items without a product
    if (!item.productId) continue

    const rules = await getFulfillmentRulesForProduct(workspaceId, item.productId)

    for (const rule of rules) {
      const record = await createFulfillmentRecord(orderId, {
        orderId,
        orderItemId: item.id,
        productId: item.productId,
        ruleId: rule.id,
        status: 'pending',
        type: rule.type,
        deliveryMethod: rule.deliveryMethod,
        deliveryDetails: {},
        attempts: 0,
      })

      // Process based on delivery method
      try {
        const processedRecord = await executeFulfillment(orderId, record, rule, order)
        fulfillmentRecords.push(processedRecord)
      } catch (error) {
        await updateFulfillmentRecord(orderId, record.id, {
          status: 'failed',
          deliveryDetails: {
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          },
          attempts: 1,
          lastAttemptAt: new Date().toISOString(),
        })
        fulfillmentRecords.push(record)
      }
    }
  }

  return fulfillmentRecords
}

/**
 * Execute specific fulfillment
 */
async function executeFulfillment(
  orderId: string,
  record: FulfillmentRecord,
  rule: FulfillmentRule,
  order: { email: string | null }
): Promise<FulfillmentRecord> {
  await updateFulfillmentRecord(orderId, record.id, {
    status: 'processing',
    attempts: record.attempts + 1,
    lastAttemptAt: new Date().toISOString(),
  })

  switch (rule.deliveryMethod) {
    case 'download': {
      // Generate download link with token
      const downloadToken = `${record.id}-${Date.now()}`
      const downloadUrl = rule.settings.downloadUrl
        ? `${rule.settings.downloadUrl}?token=${downloadToken}`
        : undefined

      return updateFulfillmentRecord(orderId, record.id, {
        status: 'fulfilled',
        deliveryDetails: {
          downloadLink: downloadUrl,
          downloadCount: 0,
        },
        fulfilledAt: new Date().toISOString(),
      })
    }

    case 'email': {
      // In production, integrate with email service
      console.log(`Would send email to ${order.email}`)
      return updateFulfillmentRecord(orderId, record.id, {
        status: 'fulfilled',
        deliveryDetails: {
          emailSentTo: order.email || undefined,
        },
        fulfilledAt: new Date().toISOString(),
      })
    }

    case 'webhook': {
      if (!rule.settings.webhookUrl) {
        throw new Error('Webhook URL not configured')
      }

      const response = await fetch(rule.settings.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...rule.settings.webhookHeaders,
        },
        body: JSON.stringify({
          event: 'order.fulfilled',
          orderId,
          productId: record.productId,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status}`)
      }

      return updateFulfillmentRecord(orderId, record.id, {
        status: 'fulfilled',
        deliveryDetails: {
          webhookResponse: `${response.status} ${response.statusText}`,
        },
        fulfilledAt: new Date().toISOString(),
      })
    }

    case 'manual': {
      // Manual fulfillment - just mark as pending for manual action
      return updateFulfillmentRecord(orderId, record.id, {
        status: 'pending',
      })
    }

    default:
      throw new Error(`Unsupported delivery method: ${rule.deliveryMethod}`)
  }
}

/**
 * Retry failed fulfillment
 */
export async function retryFulfillment(
  orderId: string,
  recordId: string,
  workspaceId: string
): Promise<FulfillmentRecord> {
  const records = await getFulfillmentRecords(orderId)
  const record = records.find((r) => r.id === recordId)

  if (!record) {
    throw new Error('Fulfillment record not found')
  }

  if (record.status !== 'failed') {
    throw new Error('Can only retry failed fulfillments')
  }

  const rules = await getFulfillmentRules(workspaceId)
  const rule = rules.find((r) => r.id === record.ruleId)

  if (!rule) {
    throw new Error('Fulfillment rule not found')
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { email: true },
  })

  if (!order) {
    throw new Error('Order not found')
  }

  return executeFulfillment(orderId, record, rule, order)
}

/**
 * Mark fulfillment as manually completed
 */
export async function markFulfillmentComplete(
  orderId: string,
  recordId: string,
  details?: Record<string, string>
): Promise<FulfillmentRecord> {
  return updateFulfillmentRecord(orderId, recordId, {
    status: 'fulfilled',
    deliveryDetails: details,
    fulfilledAt: new Date().toISOString(),
  })
}

/**
 * Cancel fulfillment
 */
export async function cancelFulfillment(orderId: string, recordId: string): Promise<FulfillmentRecord> {
  return updateFulfillmentRecord(orderId, recordId, {
    status: 'cancelled',
  })
}

/**
 * Get fulfillment statistics
 */
export async function getFulfillmentStats(workspaceId: string): Promise<{
  total: number
  pending: number
  processing: number
  fulfilled: number
  failed: number
  cancelled: number
}> {
  // Get all orders for workspace
  const orders = await prisma.order.findMany({
    where: { workspaceId },
    select: { metadata: true },
  })

  const stats = {
    total: 0,
    pending: 0,
    processing: 0,
    fulfilled: 0,
    failed: 0,
    cancelled: 0,
  }

  for (const order of orders) {
    if (!order.metadata) continue
    const metadata = order.metadata as Record<string, unknown>
    const records = (metadata.fulfillmentRecords || []) as FulfillmentRecord[]

    for (const record of records) {
      stats.total++
      switch (record.status) {
        case 'pending':
          stats.pending++
          break
        case 'processing':
          stats.processing++
          break
        case 'fulfilled':
          stats.fulfilled++
          break
        case 'failed':
          stats.failed++
          break
        case 'cancelled':
          stats.cancelled++
          break
      }
    }
  }

  return stats
}
