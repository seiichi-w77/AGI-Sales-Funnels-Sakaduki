import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  getAuditLogs,
  getAuditLogById,
  getAuditLogStats,
  exportAuditLogs,
  searchAuditLogs,
  cleanupOldAuditLogs,
} from '@/lib/audit/service'
import { hasWorkspaceRole } from '@/lib/workspace/service'

interface RouteParams {
  params: Promise<{ workspaceId: string }>
}

/**
 * GET /api/workspaces/[workspaceId]/audit-logs
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { workspaceId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only owners and admins can view audit logs
    const hasAccess = await hasWorkspaceRole(workspaceId, session.user.id, ['OWNER', 'ADMIN'])
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)

    // Get single log by ID
    const logId = searchParams.get('logId')
    if (logId) {
      const log = await getAuditLogById(workspaceId, logId)
      if (!log) {
        return NextResponse.json({ error: 'Audit log not found' }, { status: 404 })
      }
      return NextResponse.json({ log })
    }

    // Get stats
    const stats = searchParams.get('stats') === 'true'
    if (stats) {
      const days = parseInt(searchParams.get('days') || '30', 10)
      const auditStats = await getAuditLogStats(workspaceId, days)
      return NextResponse.json({ stats: auditStats })
    }

    // Export as CSV
    const exportCsv = searchParams.get('export') === 'csv'
    if (exportCsv) {
      const csv = await exportAuditLogs(workspaceId, {
        startDate: searchParams.get('startDate') || undefined,
        endDate: searchParams.get('endDate') || undefined,
      })

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="audit-logs-${workspaceId}-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }

    // Search logs
    const query = searchParams.get('search')
    if (query) {
      const limit = parseInt(searchParams.get('limit') || '50', 10)
      const logs = await searchAuditLogs(workspaceId, query, limit)
      return NextResponse.json({ logs, total: logs.length })
    }

    // List logs with filters
    const options: {
      userId?: string
      action?: string
      resourceType?: string
      resourceId?: string
      severity?: string
      startDate?: string
      endDate?: string
      limit?: number
      offset?: number
    } = {}

    const userId = searchParams.get('userId')
    if (userId) options.userId = userId

    const action = searchParams.get('action')
    if (action) options.action = action

    const resourceType = searchParams.get('resourceType')
    if (resourceType) options.resourceType = resourceType

    const resourceId = searchParams.get('resourceId')
    if (resourceId) options.resourceId = resourceId

    const severity = searchParams.get('severity')
    if (severity) options.severity = severity

    const startDate = searchParams.get('startDate')
    if (startDate) options.startDate = startDate

    const endDate = searchParams.get('endDate')
    if (endDate) options.endDate = endDate

    const limit = searchParams.get('limit')
    if (limit) options.limit = parseInt(limit, 10)

    const offset = searchParams.get('offset')
    if (offset) options.offset = parseInt(offset, 10)

    const result = await getAuditLogs(workspaceId, options as Parameters<typeof getAuditLogs>[1])

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error getting audit logs:', error)
    return NextResponse.json({ error: 'Failed to get audit logs' }, { status: 500 })
  }
}

/**
 * POST /api/workspaces/[workspaceId]/audit-logs
 * Used for cleanup operations
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { workspaceId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only owners can perform cleanup
    const hasAccess = await hasWorkspaceRole(workspaceId, session.user.id, ['OWNER'])
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'cleanup') {
      const body = await request.json()
      const retentionDays = body.retentionDays || 90

      if (retentionDays < 30) {
        return NextResponse.json(
          { error: 'Retention period must be at least 30 days' },
          { status: 400 }
        )
      }

      const deletedCount = await cleanupOldAuditLogs(workspaceId, retentionDays)
      return NextResponse.json({
        success: true,
        deletedCount,
        message: `Deleted ${deletedCount} audit log entries older than ${retentionDays} days`,
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error with audit log action:', error)
    return NextResponse.json({ error: 'Failed to process audit log action' }, { status: 500 })
  }
}
