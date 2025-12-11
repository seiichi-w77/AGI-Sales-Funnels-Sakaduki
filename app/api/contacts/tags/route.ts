import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

// GET /api/contacts/tags - ワークスペース内の全タグを取得
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const workspaceId = searchParams.get('workspaceId');

  if (!workspaceId) {
    return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 });
  }

  try {
    // タグと使用数を集計
    const tagStats = await prisma.$queryRaw<{ tag: string; count: bigint }[]>`
      SELECT unnest(tags) as tag, COUNT(*) as count
      FROM contacts
      WHERE "workspaceId" = ${workspaceId}
      GROUP BY unnest(tags)
      ORDER BY count DESC
    `;

    const tags = tagStats.map((t) => ({
      name: t.tag,
      count: Number(t.count),
    }));

    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Get tags error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
