import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

// GET /api/analytics/dashboard - Get dashboard metrics
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get('workspaceId');
  const period = searchParams.get('period') || '7d';

  if (!workspaceId) {
    return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 });
  }

  // Calculate date range
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  try {
    // Get funnel analytics
    const funnelAnalytics = await prisma.funnelAnalytics.findMany({
      where: {
        funnel: { workspaceId },
        date: { gte: startDate },
      },
    });

    // Aggregate funnel metrics
    const funnelMetrics = funnelAnalytics.reduce(
      (acc, fa) => ({
        visitors: acc.visitors + fa.visitors,
        uniqueVisitors: acc.uniqueVisitors + fa.uniqueVisitors,
        pageViews: acc.pageViews + fa.pageViews,
        optins: acc.optins + fa.optins,
        sales: acc.sales + fa.sales,
        revenue: acc.revenue + fa.revenue,
      }),
      { visitors: 0, uniqueVisitors: 0, pageViews: 0, optins: 0, sales: 0, revenue: 0 }
    );

    // Get order stats
    const orders = await prisma.order.findMany({
      where: {
        workspaceId,
        createdAt: { gte: startDate },
      },
      select: {
        status: true,
        total: true,
      },
    });

    const orderStats = {
      total: orders.length,
      completed: orders.filter((o) => o.status === 'COMPLETED').length,
      revenue: orders
        .filter((o) => o.status === 'COMPLETED')
        .reduce((sum, o) => sum + o.total, 0),
    };

    // Get contact stats
    const contactCount = await prisma.contact.count({
      where: {
        workspaceId,
        createdAt: { gte: startDate },
      },
    });

    // Get email stats
    const emailEvents = await prisma.emailEvent.findMany({
      where: {
        contact: { workspaceId },
        occurredAt: { gte: startDate },
      },
      select: {
        type: true,
      },
    });

    const emailStats = {
      sent: emailEvents.filter((e) => e.type === 'SENT').length,
      delivered: emailEvents.filter((e) => e.type === 'DELIVERED').length,
      opened: emailEvents.filter((e) => e.type === 'OPENED').length,
      clicked: emailEvents.filter((e) => e.type === 'CLICKED').length,
    };

    // Get course enrollment stats
    const enrollmentCount = await prisma.courseEnrollment.count({
      where: {
        course: { workspaceId },
        createdAt: { gte: startDate },
      },
    });

    // Calculate conversion rate
    const conversionRate =
      funnelMetrics.uniqueVisitors > 0
        ? ((funnelMetrics.sales / funnelMetrics.uniqueVisitors) * 100).toFixed(2)
        : '0.00';

    return NextResponse.json({
      dashboard: {
        period,
        startDate,
        endDate: now,
        metrics: {
          traffic: {
            visitors: funnelMetrics.visitors,
            uniqueVisitors: funnelMetrics.uniqueVisitors,
            pageViews: funnelMetrics.pageViews,
          },
          conversions: {
            optins: funnelMetrics.optins,
            sales: funnelMetrics.sales,
            conversionRate: parseFloat(conversionRate),
          },
          revenue: {
            total: orderStats.revenue,
            orders: orderStats.completed,
            averageOrderValue:
              orderStats.completed > 0
                ? Math.round(orderStats.revenue / orderStats.completed)
                : 0,
          },
          contacts: {
            newContacts: contactCount,
          },
          email: emailStats,
          courses: {
            enrollments: enrollmentCount,
          },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard' },
      { status: 500 }
    );
  }
}
