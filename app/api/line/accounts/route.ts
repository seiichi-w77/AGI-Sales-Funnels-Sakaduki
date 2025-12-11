import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

// GET /api/line/accounts - List LINE accounts
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const workspaceId = searchParams.get('workspaceId');

  if (!workspaceId) {
    return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });
  }

  // LINE accounts are linked through contacts which belong to a workspace
  const accounts = await prisma.lineAccount.findMany({
    where: {
      contact: {
        workspaceId,
      },
    },
    select: {
      id: true,
      lineUserId: true,
      displayName: true,
      pictureUrl: true,
      isBlocked: true,
      followedAt: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ accounts });
}

// POST /api/line/accounts - Link LINE account to contact
// Note: LINE accounts are created when users follow the LINE Official Account
// This endpoint links an existing LINE user to a contact
const linkAccountSchema = z.object({
  contactId: z.string(),
  lineUserId: z.string(),
  displayName: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = linkAccountSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Check if LINE user already linked
    const existing = await prisma.lineAccount.findUnique({
      where: { lineUserId: parsed.data.lineUserId },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'This LINE user is already linked' },
        { status: 400 }
      );
    }

    const account = await prisma.lineAccount.create({
      data: {
        contactId: parsed.data.contactId,
        lineUserId: parsed.data.lineUserId,
        displayName: parsed.data.displayName,
        followedAt: new Date(),
      },
      select: {
        id: true,
        lineUserId: true,
        displayName: true,
        createdAt: true,
      },
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error('Link LINE account error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
