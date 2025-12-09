import { prisma } from '@/lib/db/prisma'

export type AuditAction =
  // Workspace actions
  | 'workspace.created'
  | 'workspace.updated'
  | 'workspace.deleted'
  | 'workspace.member_added'
  | 'workspace.member_removed'
  | 'workspace.member_role_changed'
  // Funnel actions
  | 'funnel.created'
  | 'funnel.updated'
  | 'funnel.deleted'
  | 'funnel.published'
  | 'funnel.unpublished'
  | 'funnel.cloned'
  // Funnel step actions
  | 'funnel_step.created'
  | 'funnel_step.updated'
  | 'funnel_step.deleted'
  | 'funnel_step.reordered'
  // Product actions
  | 'product.created'
  | 'product.updated'
  | 'product.deleted'
  | 'product.archived'
  // Order actions
  | 'order.created'
  | 'order.updated'
  | 'order.refunded'
  | 'order.cancelled'
  | 'order.fulfilled'
  // Settings actions
  | 'settings.updated'
  | 'domain.added'
  | 'domain.removed'
  | 'domain.verified'
  | 'theme.created'
  | 'theme.updated'
  | 'theme.deleted'
  // Security actions
  | 'security.password_changed'
  | 'security.2fa_enabled'
  | 'security.2fa_disabled'
  | 'security.login'
  | 'security.logout'
  | 'security.api_key_created'
  | 'security.api_key_revoked'

export type AuditSeverity = 'info' | 'warning' | 'critical'

export interface AuditLogEntry {
  id: string
  workspaceId: string
  userId: string
  userEmail: string
  userName?: string
  action: AuditAction
  severity: AuditSeverity
  resourceType: string
  resourceId?: string
  resourceName?: string
  details: Record<string, unknown>
  metadata: {
    ipAddress?: string
    userAgent?: string
    requestId?: string
  }
  createdAt: string
}

export interface CreateAuditLogInput {
  workspaceId: string
  userId: string
  userEmail: string
  userName?: string
  action: AuditAction
  resourceType: string
  resourceId?: string
  resourceName?: string
  details?: Record<string, unknown>
  metadata?: {
    ipAddress?: string
    userAgent?: string
    requestId?: string
  }
}

const ACTION_SEVERITY: Record<AuditAction, AuditSeverity> = {
  // Info level
  'workspace.created': 'info',
  'workspace.updated': 'info',
  'funnel.created': 'info',
  'funnel.updated': 'info',
  'funnel.published': 'info',
  'funnel.unpublished': 'info',
  'funnel.cloned': 'info',
  'funnel_step.created': 'info',
  'funnel_step.updated': 'info',
  'funnel_step.reordered': 'info',
  'product.created': 'info',
  'product.updated': 'info',
  'order.created': 'info',
  'order.updated': 'info',
  'order.fulfilled': 'info',
  'settings.updated': 'info',
  'domain.added': 'info',
  'domain.verified': 'info',
  'theme.created': 'info',
  'theme.updated': 'info',
  'security.login': 'info',
  'security.logout': 'info',

  // Warning level
  'workspace.member_added': 'warning',
  'workspace.member_removed': 'warning',
  'workspace.member_role_changed': 'warning',
  'funnel.deleted': 'warning',
  'funnel_step.deleted': 'warning',
  'product.deleted': 'warning',
  'product.archived': 'warning',
  'order.refunded': 'warning',
  'order.cancelled': 'warning',
  'domain.removed': 'warning',
  'theme.deleted': 'warning',
  'security.password_changed': 'warning',
  'security.2fa_enabled': 'warning',
  'security.2fa_disabled': 'warning',
  'security.api_key_created': 'warning',

  // Critical level
  'workspace.deleted': 'critical',
  'security.api_key_revoked': 'critical',
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(input: CreateAuditLogInput): Promise<AuditLogEntry> {
  const {
    workspaceId,
    userId,
    userEmail,
    userName,
    action,
    resourceType,
    resourceId,
    resourceName,
    details = {},
    metadata = {},
  } = input

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  })

  const settings = (workspace?.settings || {}) as Record<string, unknown>
  const auditLogs = (settings.auditLogs || []) as AuditLogEntry[]

  const entry: AuditLogEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    workspaceId,
    userId,
    userEmail,
    userName,
    action,
    severity: ACTION_SEVERITY[action] || 'info',
    resourceType,
    resourceId,
    resourceName,
    details,
    metadata,
    createdAt: new Date().toISOString(),
  }

  // Keep only the last 10000 entries to prevent bloat
  const trimmedLogs = auditLogs.slice(-9999)

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      settings: {
        ...settings,
        auditLogs: [...trimmedLogs, entry],
      } as object,
    },
  })

  return entry
}

/**
 * Get audit logs with filtering
 */
export async function getAuditLogs(
  workspaceId: string,
  options: {
    userId?: string
    action?: AuditAction
    resourceType?: string
    resourceId?: string
    severity?: AuditSeverity
    startDate?: string
    endDate?: string
    limit?: number
    offset?: number
  } = {}
): Promise<{ logs: AuditLogEntry[]; total: number }> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  })

  if (!workspace?.settings) {
    return { logs: [], total: 0 }
  }

  const settings = workspace.settings as Record<string, unknown>
  let logs = (settings.auditLogs || []) as AuditLogEntry[]

  // Apply filters
  if (options.userId) {
    logs = logs.filter((l) => l.userId === options.userId)
  }
  if (options.action) {
    logs = logs.filter((l) => l.action === options.action)
  }
  if (options.resourceType) {
    logs = logs.filter((l) => l.resourceType === options.resourceType)
  }
  if (options.resourceId) {
    logs = logs.filter((l) => l.resourceId === options.resourceId)
  }
  if (options.severity) {
    logs = logs.filter((l) => l.severity === options.severity)
  }
  if (options.startDate) {
    logs = logs.filter((l) => new Date(l.createdAt) >= new Date(options.startDate!))
  }
  if (options.endDate) {
    logs = logs.filter((l) => new Date(l.createdAt) <= new Date(options.endDate!))
  }

  const total = logs.length

  // Sort by most recent first
  logs = logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  // Apply pagination
  const limit = options.limit || 50
  const offset = options.offset || 0
  logs = logs.slice(offset, offset + limit)

  return { logs, total }
}

/**
 * Get audit log by ID
 */
export async function getAuditLogById(
  workspaceId: string,
  logId: string
): Promise<AuditLogEntry | null> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  })

  if (!workspace?.settings) {
    return null
  }

  const settings = workspace.settings as Record<string, unknown>
  const logs = (settings.auditLogs || []) as AuditLogEntry[]

  return logs.find((l) => l.id === logId) || null
}

/**
 * Get audit log statistics
 */
export async function getAuditLogStats(
  workspaceId: string,
  days: number = 30
): Promise<{
  totalLogs: number
  byAction: Record<string, number>
  bySeverity: Record<AuditSeverity, number>
  byUser: Record<string, number>
  byResourceType: Record<string, number>
  dailyActivity: Record<string, number>
}> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  })

  if (!workspace?.settings) {
    return {
      totalLogs: 0,
      byAction: {},
      bySeverity: { info: 0, warning: 0, critical: 0 },
      byUser: {},
      byResourceType: {},
      dailyActivity: {},
    }
  }

  const settings = workspace.settings as Record<string, unknown>
  const logs = (settings.auditLogs || []) as AuditLogEntry[]

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  const recentLogs = logs.filter((l) => new Date(l.createdAt) >= cutoffDate)

  const byAction: Record<string, number> = {}
  const bySeverity: Record<AuditSeverity, number> = { info: 0, warning: 0, critical: 0 }
  const byUser: Record<string, number> = {}
  const byResourceType: Record<string, number> = {}
  const dailyActivity: Record<string, number> = {}

  for (const log of recentLogs) {
    // By action
    byAction[log.action] = (byAction[log.action] || 0) + 1

    // By severity
    bySeverity[log.severity] = (bySeverity[log.severity] || 0) + 1

    // By user
    const userKey = log.userEmail
    byUser[userKey] = (byUser[userKey] || 0) + 1

    // By resource type
    byResourceType[log.resourceType] = (byResourceType[log.resourceType] || 0) + 1

    // Daily activity
    const dateKey = new Date(log.createdAt).toISOString().split('T')[0]
    dailyActivity[dateKey] = (dailyActivity[dateKey] || 0) + 1
  }

  return {
    totalLogs: recentLogs.length,
    byAction,
    bySeverity,
    byUser,
    byResourceType,
    dailyActivity,
  }
}

/**
 * Export audit logs as CSV
 */
export async function exportAuditLogs(
  workspaceId: string,
  options: {
    startDate?: string
    endDate?: string
  } = {}
): Promise<string> {
  const { logs } = await getAuditLogs(workspaceId, {
    ...options,
    limit: 100000, // Export all matching logs
  })

  const headers = [
    'ID',
    'Timestamp',
    'User Email',
    'User Name',
    'Action',
    'Severity',
    'Resource Type',
    'Resource ID',
    'Resource Name',
    'IP Address',
    'Details',
  ]

  const rows = logs.map((log) => [
    log.id,
    log.createdAt,
    log.userEmail,
    log.userName || '',
    log.action,
    log.severity,
    log.resourceType,
    log.resourceId || '',
    log.resourceName || '',
    log.metadata.ipAddress || '',
    JSON.stringify(log.details),
  ])

  const csv = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n')

  return csv
}

/**
 * Delete old audit logs (retention policy)
 */
export async function cleanupOldAuditLogs(
  workspaceId: string,
  retentionDays: number = 90
): Promise<number> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  })

  if (!workspace?.settings) {
    return 0
  }

  const settings = workspace.settings as Record<string, unknown>
  const logs = (settings.auditLogs || []) as AuditLogEntry[]

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

  const filteredLogs = logs.filter((l) => new Date(l.createdAt) >= cutoffDate)
  const deletedCount = logs.length - filteredLogs.length

  if (deletedCount > 0) {
    await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        settings: {
          ...settings,
          auditLogs: filteredLogs,
        } as object,
      },
    })
  }

  return deletedCount
}

/**
 * Search audit logs
 */
export async function searchAuditLogs(
  workspaceId: string,
  query: string,
  limit: number = 50
): Promise<AuditLogEntry[]> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  })

  if (!workspace?.settings) {
    return []
  }

  const settings = workspace.settings as Record<string, unknown>
  const logs = (settings.auditLogs || []) as AuditLogEntry[]

  const lowerQuery = query.toLowerCase()

  const matchingLogs = logs.filter((log) => {
    return (
      log.action.toLowerCase().includes(lowerQuery) ||
      log.userEmail.toLowerCase().includes(lowerQuery) ||
      (log.userName && log.userName.toLowerCase().includes(lowerQuery)) ||
      log.resourceType.toLowerCase().includes(lowerQuery) ||
      (log.resourceName && log.resourceName.toLowerCase().includes(lowerQuery)) ||
      (log.resourceId && log.resourceId.toLowerCase().includes(lowerQuery)) ||
      JSON.stringify(log.details).toLowerCase().includes(lowerQuery)
    )
  })

  return matchingLogs
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
}

/**
 * Helper function to create audit log with request context
 */
export function getAuditMetadataFromRequest(request: Request): {
  ipAddress?: string
  userAgent?: string
  requestId?: string
} {
  return {
    ipAddress: request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               undefined,
    userAgent: request.headers.get('user-agent') || undefined,
    requestId: request.headers.get('x-request-id') || undefined,
  }
}
