import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

// GET /api/broadcasts/[broadcastId]/analytics - 分析データ取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ broadcastId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { broadcastId } = await params;
  const searchParams = request.nextUrl.searchParams;
  const _period = searchParams.get('period') || '7d';

  try {
    const broadcast = await prisma.emailCampaign.findUnique({
      where: { id: broadcastId },
    });

    if (!broadcast) {
      return NextResponse.json({ error: 'Broadcast not found' }, { status: 404 });
    }

    // イベント統計
    const eventStats = await prisma.emailEvent.groupBy({
      by: ['type'],
      where: { campaignId: broadcastId },
      _count: true,
    });

    const stats = eventStats.reduce((acc, e) => {
      acc[e.type.toLowerCase()] = e._count;
      return acc;
    }, {} as Record<string, number>);

    // 計算統計
    const sent = broadcast.totalSent;
    const delivered = stats.delivered || sent - (stats.bounced || 0);
    const opened = stats.opened || broadcast.totalOpened;
    const clicked = stats.clicked || broadcast.totalClicked;
    const bounced = stats.bounced || broadcast.totalBounced;
    const unsubscribed = stats.unsubscribed || 0;
    const complained = stats.complained || 0;

    const deliveryRate = sent > 0 ? ((delivered / sent) * 100) : 0;
    const openRate = delivered > 0 ? ((opened / delivered) * 100) : 0;
    const clickRate = delivered > 0 ? ((clicked / delivered) * 100) : 0;
    const clickToOpenRate = opened > 0 ? ((clicked / opened) * 100) : 0;
    const bounceRate = sent > 0 ? ((bounced / sent) * 100) : 0;
    const unsubscribeRate = delivered > 0 ? ((unsubscribed / delivered) * 100) : 0;

    // 時系列データ
    const timeline = await prisma.$queryRaw<Array<{
      hour: Date;
      opens: bigint;
      clicks: bigint;
    }>>`
      SELECT
        date_trunc('hour', "occurredAt") as hour,
        COUNT(*) FILTER (WHERE type = 'OPENED') as opens,
        COUNT(*) FILTER (WHERE type = 'CLICKED') as clicks
      FROM email_events
      WHERE "campaignId" = ${broadcastId}
      GROUP BY date_trunc('hour', "occurredAt")
      ORDER BY hour ASC
      LIMIT 168
    `;

    // リンククリック詳細
    const linkClicks = await prisma.$queryRaw<Array<{
      url: string;
      total_clicks: bigint;
      unique_clicks: bigint;
    }>>`
      SELECT
        metadata->>'url' as url,
        COUNT(*) as total_clicks,
        COUNT(DISTINCT "contactId") as unique_clicks
      FROM email_events
      WHERE "campaignId" = ${broadcastId}
        AND type = 'CLICKED'
        AND metadata->>'url' IS NOT NULL
      GROUP BY metadata->>'url'
      ORDER BY total_clicks DESC
      LIMIT 50
    `;

    // 最近のイベント
    const recentEvents = await prisma.emailEvent.findMany({
      where: { campaignId: broadcastId },
      orderBy: { occurredAt: 'desc' },
      take: 20,
      include: {
        contact: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({
      analytics: {
        summary: {
          sent,
          delivered,
          opened,
          clicked,
          bounced,
          unsubscribed,
          complained,
        },
        rates: {
          deliveryRate: deliveryRate.toFixed(2),
          openRate: openRate.toFixed(2),
          clickRate: clickRate.toFixed(2),
          clickToOpenRate: clickToOpenRate.toFixed(2),
          bounceRate: bounceRate.toFixed(2),
          unsubscribeRate: unsubscribeRate.toFixed(2),
        },
        timeline: timeline.map((t) => ({
          hour: t.hour,
          opens: Number(t.opens),
          clicks: Number(t.clicks),
        })),
        linkClicks: linkClicks.map((l) => ({
          url: l.url,
          totalClicks: Number(l.total_clicks),
          uniqueClicks: Number(l.unique_clicks),
        })),
        recentEvents,
      },
    });
  } catch (error) {
    console.error('Get broadcast analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
