import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { Prisma } from '@prisma/client';

const sendMessageSchema = z.object({
  lineAccountId: z.string().min(1),
  type: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'STICKER', 'LOCATION', 'TEMPLATE', 'FLEX', 'RICHMENU']),
  content: z.any(),
});

const broadcastSchema = z.object({
  workspaceId: z.string().min(1),
  type: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'STICKER', 'LOCATION', 'TEMPLATE', 'FLEX']),
  content: z.any(),
  tags: z.array(z.string()).optional(),
});

// GET /api/line/messages - Get messages
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const lineAccountId = searchParams.get('lineAccountId');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const skip = (page - 1) * limit;

  if (!lineAccountId) {
    return NextResponse.json({ error: 'lineAccountId is required' }, { status: 400 });
  }

  try {
    const [messages, total] = await Promise.all([
      prisma.lineMessage.findMany({
        where: { lineAccountId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.lineMessage.count({ where: { lineAccountId } }),
    ]);

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST /api/line/messages - Send message
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Check if broadcast
    if (body.workspaceId) {
      const validatedData = broadcastSchema.parse(body);
      return await handleBroadcast(validatedData);
    }

    const validatedData = sendMessageSchema.parse(body);

    // Verify account exists
    const account = await prisma.lineAccount.findUnique({
      where: { id: validatedData.lineAccountId },
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Create message record
    const message = await prisma.lineMessage.create({
      data: {
        lineAccountId: validatedData.lineAccountId,
        direction: 'OUTBOUND',
        type: validatedData.type,
        content: validatedData.content as Prisma.InputJsonValue,
        status: 'PENDING',
      },
    });

    // TODO: Actually send via LINE Messaging API
    // For now, simulate success
    await prisma.lineMessage.update({
      where: { id: message.id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

async function handleBroadcast(data: z.infer<typeof broadcastSchema>) {
  // Get target accounts
  const where: Record<string, unknown> = {
    contact: { workspaceId: data.workspaceId },
    isBlocked: false,
  };

  if (data.tags && data.tags.length > 0) {
    where.tags = { hasSome: data.tags };
  }

  const accounts = await prisma.lineAccount.findMany({
    where,
    select: { id: true },
  });

  if (accounts.length === 0) {
    return NextResponse.json({ error: 'No target accounts found' }, { status: 400 });
  }

  // Create messages for all accounts
  const messages = await prisma.lineMessage.createMany({
    data: accounts.map((account) => ({
      lineAccountId: account.id,
      direction: 'OUTBOUND' as const,
      type: data.type,
      content: data.content as Prisma.InputJsonValue,
      status: 'PENDING' as const,
    })),
  });

  // TODO: Actually send via LINE Messaging API broadcast

  return NextResponse.json({
    broadcast: {
      targetCount: accounts.length,
      messagesCreated: messages.count,
    },
  }, { status: 201 });
}
