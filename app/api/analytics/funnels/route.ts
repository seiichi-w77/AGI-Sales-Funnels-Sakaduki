import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

interface FunnelAnalyticsRecord {
  funnelId: string;
  visitors: number;
  uniqueVisitors: number;
  pageViews: number;
  optins: number;
  sales: number;
  revenue: number;
}

// GET /api/analytics/funnels - Get funnel analytics
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get('workspaceId');
  const funnelId = searchParams.get('funnelId');
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
    // Build where clause
    const whereClause: Record<string, unknown> = {
      funnel: { workspaceId },
      date: { gte: startDate },
    };

    if (funnelId) {
      whereClause.funnelId = funnelId;
    }

    // Get funnel analytics
    const analytics = await prisma.funnelAnalytics.findMany({
      where: whereClause,
      include: {
        funnel: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    // Group by funnel and calculate totals
    const funnelMap = new Map<string, FunnelAnalyticsRecord>();

    analytics.forEach((a) => {
      const existing = funnelMap.get(a.funnelId);
      if (existing) {
        existing.visitors += a.visitors;
        existing.uniqueVisitors += a.uniqueVisitors;
        existing.pageViews += a.pageViews;
        existing.optins += a.optins;
        existing.sales += a.sales;
        existing.revenue += a.revenue;
      } else {
        funnelMap.set(a.funnelId, {
          funnelId: a.funnelId,
          visitors: a.visitors,
          uniqueVisitors: a.uniqueVisitors,
          pageViews: a.pageViews,
          optins: a.optins,
          sales: a.sales,
          revenue: a.revenue,
        });
      }
    });

    // Get funnel details
    const funnelIds = Array.from(funnelMap.keys());
    const funnels = await prisma.funnel.findMany({
      where: { id: { in: funnelIds } },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
      },
    });

    const funnelLookup = new Map(funnels.map((f) => [f.id, f]));

    // Build response
    const funnelAnalytics = Array.from(funnelMap.values()).map((fa) => {
      const funnel = funnelLookup.get(fa.funnelId);
      const conversionRate =
        fa.uniqueVisitors > 0
          ? ((fa.sales / fa.uniqueVisitors) * 100).toFixed(2)
          : '0.00';

      return {
        funnel: funnel || { id: fa.funnelId, name: 'Unknown', slug: '', status: 'DRAFT' },
        metrics: {
          visitors: fa.visitors,
          uniqueVisitors: fa.uniqueVisitors,
          pageViews: fa.pageViews,
          optins: fa.optins,
          sales: fa.sales,
          revenue: fa.revenue,
          conversionRate: parseFloat(conversionRate),
        },
      };
    });

    // Get daily breakdown if single funnel
    let dailyBreakdown: { date: Date; visitors: number; uniqueVisitors: number; pageViews: number; optins: number; sales: number; revenue: number }[] = [];
    if (funnelId) {
      dailyBreakdown = analytics
        .filter((a) => a.funnelId === funnelId)
        .map((a) => ({
          date: a.date,
          visitors: a.visitors,
          uniqueVisitors: a.uniqueVisitors,
          pageViews: a.pageViews,
          optins: a.optins,
          sales: a.sales,
          revenue: a.revenue,
        }));
    }

    return NextResponse.json({
      analytics: {
        period,
        startDate,
        endDate: now,
        funnels: funnelAnalytics,
        dailyBreakdown: funnelId ? dailyBreakdown : undefined,
      },
    });
  } catch (error) {
    console.error('Error fetching funnel analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch funnel analytics' },
      { status: 500 }
    );
  }
}
