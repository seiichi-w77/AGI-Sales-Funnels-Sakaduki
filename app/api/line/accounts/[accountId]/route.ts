import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { Prisma } from '@prisma/client';

const updateAccountSchema = z.object({
  richMenuId: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  customFields: z.any().optional(),
});

// GET /api/line/accounts/[accountId]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { accountId } = await params;

  try {
    const account = await prisma.lineAccount.findUnique({
      where: { id: accountId },
      include: {
        contact: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        chatSessions: {
          orderBy: { updatedAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json({ account });
  } catch (error) {
    console.error('Error fetching account:', error);
    return NextResponse.json(
      { error: 'Failed to fetch account' },
      { status: 500 }
    );
  }
}

// PATCH /api/line/accounts/[accountId]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { accountId } = await params;

  try {
    const body = await request.json();
    const validatedData = updateAccountSchema.parse(body);

    const existingAccount = await prisma.lineAccount.findUnique({
      where: { id: accountId },
    });

    if (!existingAccount) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const account = await prisma.lineAccount.update({
      where: { id: accountId },
      data: {
        richMenuId: validatedData.richMenuId,
        tags: validatedData.tags,
        customFields: validatedData.customFields as Prisma.InputJsonValue | undefined,
      },
    });

    return NextResponse.json({ account });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating account:', error);
    return NextResponse.json(
      { error: 'Failed to update account' },
      { status: 500 }
    );
  }
}
