import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

// GET /api/funnels/[funnelId]/analytics - Get funnel analytics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ funnelId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { funnelId } = await params;
  const searchParams = request.nextUrl.searchParams;
  const period = searchParams.get('period') || '7d'; // 7d, 30d, 90d, all

  try {
    // Get funnel with steps
    const funnel = await prisma.funnel.findUnique({
      where: { id: funnelId },
      include: {
        steps: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }

    // Calculate date range (for future use with real analytics data)
    const now = new Date();

    // Get page views for each step (from analytics events)
    // For MVP, we'll generate mock data since PageView model may not exist yet
    const stepAnalytics = funnel.steps.map((step, index) => {
      // Mock data - in production, this would come from actual analytics
      const baseViews = Math.floor(Math.random() * 1000) + 500;
      const dropOffRate = 0.2 + (index * 0.1); // Increasing drop-off per step
      const views = Math.floor(baseViews * Math.pow(1 - dropOffRate, index));
      const uniqueVisitors = Math.floor(views * 0.7);
      const avgTimeOnPage = Math.floor(Math.random() * 180) + 30; // 30-210 seconds

      return {
        stepId: step.id,
        stepName: step.name,
        stepType: step.type,
        sortOrder: step.sortOrder,
        views,
        uniqueVisitors,
        avgTimeOnPage,
        bounceRate: Math.round((Math.random() * 30 + 20) * 10) / 10, // 20-50%
      };
    });

    // Calculate funnel conversion rates
    const firstStepViews = stepAnalytics[0]?.views || 0;
    const lastStepViews = stepAnalytics[stepAnalytics.length - 1]?.views || 0;
    const overallConversion = firstStepViews > 0
      ? Math.round((lastStepViews / firstStepViews) * 100 * 10) / 10
      : 0;

    // Generate daily trends (mock data)
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 30;
    const dailyTrend = Array.from({ length: days }, (_, i) => {
      const date = new Date(now.getTime() - (days - 1 - i) * 24 * 60 * 60 * 1000);
      return {
        date: date.toISOString().split('T')[0],
        views: Math.floor(Math.random() * 200) + 50,
        conversions: Math.floor(Math.random() * 20) + 5,
      };
    });

    // Calculate totals
    const totalViews = dailyTrend.reduce((sum, day) => sum + day.views, 0);
    const totalConversions = dailyTrend.reduce((sum, day) => sum + day.conversions, 0);
    const totalUniqueVisitors = Math.floor(totalViews * 0.65);

    const analytics = {
      funnel: {
        id: funnel.id,
        name: funnel.name,
        status: funnel.status,
      },
      period,
      summary: {
        totalViews,
        totalUniqueVisitors,
        totalConversions,
        overallConversionRate: overallConversion,
        avgTimeOnFunnel: Math.floor(Math.random() * 300) + 120, // 2-7 minutes
      },
      steps: stepAnalytics,
      dailyTrend,
      comparison: {
        viewsChange: Math.round((Math.random() * 40 - 20) * 10) / 10, // -20% to +20%
        conversionsChange: Math.round((Math.random() * 40 - 20) * 10) / 10,
        visitorsChange: Math.round((Math.random() * 40 - 20) * 10) / 10,
      },
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
