import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

// GET /api/analytics/reports - Generate reports
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get('workspaceId');
  const reportType = searchParams.get('type') || 'sales';
  const period = searchParams.get('period') || '30d';
  const format = searchParams.get('format') || 'json';

  if (!workspaceId) {
    return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 });
  }

  // Calculate date range
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case '365d':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  try {
    let reportData: unknown;

    switch (reportType) {
      case 'sales':
        reportData = await generateSalesReport(workspaceId, startDate, now);
        break;
      case 'conversion':
        reportData = await generateConversionReport(workspaceId, startDate, now);
        break;
      case 'traffic':
        reportData = await generateTrafficReport(workspaceId, startDate, now);
        break;
      case 'contacts':
        reportData = await generateContactsReport(workspaceId, startDate, now);
        break;
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    // Handle CSV export
    if (format === 'csv') {
      const csvContent = convertToCSV(reportData as Record<string, unknown>[]);
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${reportType}-report-${period}.csv"`,
        },
      });
    }

    return NextResponse.json({
      report: {
        type: reportType,
        period,
        startDate,
        endDate: now,
        data: reportData,
      },
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

async function generateSalesReport(workspaceId: string, startDate: Date, endDate: Date) {
  const orders = await prisma.order.findMany({
    where: {
      workspaceId,
      createdAt: { gte: startDate, lte: endDate },
    },
    include: {
      contact: {
        select: {
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalRevenue = orders
    .filter((o) => o.status === 'COMPLETED')
    .reduce((sum, o) => sum + o.total, 0);

  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED').length;
  const averageOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;

  // Group by day
  const dailySales = new Map<string, { date: string; revenue: number; orders: number }>();
  orders.forEach((o) => {
    const dateKey = o.createdAt.toISOString().split('T')[0];
    const existing = dailySales.get(dateKey);
    if (existing) {
      existing.orders += 1;
      if (o.status === 'COMPLETED') {
        existing.revenue += o.total;
      }
    } else {
      dailySales.set(dateKey, {
        date: dateKey,
        orders: 1,
        revenue: o.status === 'COMPLETED' ? o.total : 0,
      });
    }
  });

  return {
    summary: {
      totalRevenue,
      totalOrders,
      completedOrders,
      averageOrderValue: Math.round(averageOrderValue),
    },
    dailySales: Array.from(dailySales.values()).sort((a, b) => a.date.localeCompare(b.date)),
    recentOrders: orders.slice(0, 50).map((o) => ({
      id: o.id,
      date: o.createdAt,
      customer: o.contact
        ? `${o.contact.firstName || ''} ${o.contact.lastName || ''} (${o.contact.email})`
        : 'Unknown',
      amount: o.total,
      status: o.status,
      items: o.items.map((i) => ({
        product: i.product?.name || 'Unknown',
        quantity: i.quantity,
        price: i.unitPrice,
      })),
    })),
  };
}

async function generateConversionReport(workspaceId: string, startDate: Date, endDate: Date) {
  const funnelAnalytics = await prisma.funnelAnalytics.findMany({
    where: {
      funnel: { workspaceId },
      date: { gte: startDate, lte: endDate },
    },
    include: {
      funnel: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Group by funnel
  const funnelStats = new Map<string, { name: string; visitors: number; optins: number; sales: number }>();
  funnelAnalytics.forEach((fa) => {
    const existing = funnelStats.get(fa.funnelId);
    if (existing) {
      existing.visitors += fa.uniqueVisitors;
      existing.optins += fa.optins;
      existing.sales += fa.sales;
    } else {
      funnelStats.set(fa.funnelId, {
        name: fa.funnel.name,
        visitors: fa.uniqueVisitors,
        optins: fa.optins,
        sales: fa.sales,
      });
    }
  });

  const funnelConversions = Array.from(funnelStats.values()).map((f) => ({
    funnel: f.name,
    visitors: f.visitors,
    optins: f.optins,
    sales: f.sales,
    optinRate: f.visitors > 0 ? ((f.optins / f.visitors) * 100).toFixed(2) : '0.00',
    salesRate: f.visitors > 0 ? ((f.sales / f.visitors) * 100).toFixed(2) : '0.00',
  }));

  const totalVisitors = Array.from(funnelStats.values()).reduce((sum, f) => sum + f.visitors, 0);
  const totalOptins = Array.from(funnelStats.values()).reduce((sum, f) => sum + f.optins, 0);
  const totalSales = Array.from(funnelStats.values()).reduce((sum, f) => sum + f.sales, 0);

  return {
    summary: {
      totalVisitors,
      totalOptins,
      totalSales,
      overallOptinRate: totalVisitors > 0 ? ((totalOptins / totalVisitors) * 100).toFixed(2) : '0.00',
      overallSalesRate: totalVisitors > 0 ? ((totalSales / totalVisitors) * 100).toFixed(2) : '0.00',
    },
    funnelConversions,
  };
}

async function generateTrafficReport(workspaceId: string, startDate: Date, endDate: Date) {
  const funnelAnalytics = await prisma.funnelAnalytics.findMany({
    where: {
      funnel: { workspaceId },
      date: { gte: startDate, lte: endDate },
    },
    orderBy: { date: 'asc' },
  });

  // Group by day
  const dailyTraffic = new Map<string, { date: string; visitors: number; uniqueVisitors: number; pageViews: number }>();
  funnelAnalytics.forEach((fa) => {
    const dateKey = fa.date.toISOString().split('T')[0];
    const existing = dailyTraffic.get(dateKey);
    if (existing) {
      existing.visitors += fa.visitors;
      existing.uniqueVisitors += fa.uniqueVisitors;
      existing.pageViews += fa.pageViews;
    } else {
      dailyTraffic.set(dateKey, {
        date: dateKey,
        visitors: fa.visitors,
        uniqueVisitors: fa.uniqueVisitors,
        pageViews: fa.pageViews,
      });
    }
  });

  const totalVisitors = funnelAnalytics.reduce((sum, fa) => sum + fa.visitors, 0);
  const totalUniqueVisitors = funnelAnalytics.reduce((sum, fa) => sum + fa.uniqueVisitors, 0);
  const totalPageViews = funnelAnalytics.reduce((sum, fa) => sum + fa.pageViews, 0);

  return {
    summary: {
      totalVisitors,
      totalUniqueVisitors,
      totalPageViews,
      avgDailyVisitors: Math.round(totalVisitors / Math.max(dailyTraffic.size, 1)),
    },
    dailyTraffic: Array.from(dailyTraffic.values()),
  };
}

async function generateContactsReport(workspaceId: string, startDate: Date, endDate: Date) {
  const contacts = await prisma.contact.findMany({
    where: {
      workspaceId,
      createdAt: { gte: startDate, lte: endDate },
    },
select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      status: true,
      source: true,
      createdAt: true,
      tags: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Group by day
  const dailyContacts = new Map<string, { date: string; count: number }>();
  contacts.forEach((c) => {
    const dateKey = c.createdAt.toISOString().split('T')[0];
    const existing = dailyContacts.get(dateKey);
    if (existing) {
      existing.count += 1;
    } else {
      dailyContacts.set(dateKey, { date: dateKey, count: 1 });
    }
  });

  // Group by source
  const sourceBreakdown = new Map<string, number>();
  contacts.forEach((c) => {
    const source = c.source || 'unknown';
    sourceBreakdown.set(source, (sourceBreakdown.get(source) || 0) + 1);
  });

  // Group by status
  const statusBreakdown = new Map<string, number>();
  contacts.forEach((c) => {
    statusBreakdown.set(c.status, (statusBreakdown.get(c.status) || 0) + 1);
  });

  return {
    summary: {
      totalContacts: contacts.length,
      avgDailyContacts: Math.round(contacts.length / Math.max(dailyContacts.size, 1)),
    },
    dailyContacts: Array.from(dailyContacts.values()).sort((a, b) => a.date.localeCompare(b.date)),
    sourceBreakdown: Array.from(sourceBreakdown.entries()).map(([source, count]) => ({
      source,
      count,
    })),
    statusBreakdown: Array.from(statusBreakdown.entries()).map(([status, count]) => ({
      status,
      count,
    })),
    recentContacts: contacts.slice(0, 50).map((c) => ({
      id: c.id,
      email: c.email,
      name: `${c.firstName || ''} ${c.lastName || ''}`.trim(),
      status: c.status,
      source: c.source,
      createdAt: c.createdAt,
      tags: c.tags,
    })),
  };
}

function convertToCSV(data: Record<string, unknown>[]): string {
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }

  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((header) => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value).includes(',') ? `"${value}"` : String(value);
    }).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}
