import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

// GET /api/analytics/live - Get live/real-time metrics
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get('workspaceId');

  if (!workspaceId) {
    return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 });
  }

  // Get data from last 30 minutes for "live" metrics
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  try {
    // Get recent orders (last 30 minutes)
    const recentOrders = await prisma.order.findMany({
      where: {
        workspaceId,
        createdAt: { gte: thirtyMinutesAgo },
      },
include: {
        contact: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Get recent contacts (last 30 minutes)
    const recentContacts = await prisma.contact.findMany({
      where: {
        workspaceId,
        createdAt: { gte: thirtyMinutesAgo },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        source: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Get recent enrollments (last 30 minutes)
    const recentEnrollments = await prisma.courseEnrollment.findMany({
      where: {
        course: { workspaceId },
        createdAt: { gte: thirtyMinutesAgo },
      },
      select: {
        id: true,
        createdAt: true,
        course: {
          select: {
            name: true,
          },
        },
        contact: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Count active users (orders or contacts created in last 5 minutes)
    const recentOrderCount = await prisma.order.count({
      where: {
        workspaceId,
        createdAt: { gte: fiveMinutesAgo },
      },
    });

    const recentContactCount = await prisma.contact.count({
      where: {
        workspaceId,
        createdAt: { gte: fiveMinutesAgo },
      },
    });

    // Get today's analytics
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayAnalytics = await prisma.funnelAnalytics.findMany({
      where: {
        funnel: { workspaceId },
        date: { gte: todayStart },
      },
    });

    const todayMetrics = todayAnalytics.reduce(
      (acc, fa) => ({
        visitors: acc.visitors + fa.visitors,
        sales: acc.sales + fa.sales,
        revenue: acc.revenue + fa.revenue,
      }),
      { visitors: 0, sales: 0, revenue: 0 }
    );

    // Build activity feed
    const activityFeed = [
      ...recentOrders.map((o) => ({
        type: 'order' as const,
        id: o.id,
        message: `${o.contact?.firstName || 'Customer'} placed an order`,
        amount: o.total,
        timestamp: o.createdAt,
      })),
      ...recentContacts.map((c) => ({
        type: 'contact' as const,
        id: c.id,
        message: `New contact: ${c.email}`,
        source: c.source,
        timestamp: c.createdAt,
      })),
      ...recentEnrollments.map((e) => ({
        type: 'enrollment' as const,
        id: e.id,
        message: `${e.contact?.firstName || 'Student'} enrolled in ${e.course.name}`,
        timestamp: e.createdAt,
      })),
    ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 20);

    return NextResponse.json({
      live: {
        timestamp: new Date(),
        activeUsers: recentOrderCount + recentContactCount,
        today: {
          visitors: todayMetrics.visitors,
          sales: todayMetrics.sales,
          revenue: todayMetrics.revenue,
        },
        recent: {
          orders: recentOrders.map((o) => ({
            id: o.id,
            amount: o.total,
            status: o.status,
            customer: o.contact?.firstName || 'Customer',
            timestamp: o.createdAt,
          })),
          contacts: recentContacts.map((c) => ({
            id: c.id,
            email: c.email,
            name: `${c.firstName || ''} ${c.lastName || ''}`.trim(),
            source: c.source,
            timestamp: c.createdAt,
          })),
          enrollments: recentEnrollments.map((e) => ({
            id: e.id,
            course: e.course.name,
            student: e.contact?.firstName || 'Student',
            timestamp: e.createdAt,
          })),
        },
        activityFeed,
      },
    });
  } catch (error) {
    console.error('Error fetching live data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch live data' },
      { status: 500 }
    );
  }
}
