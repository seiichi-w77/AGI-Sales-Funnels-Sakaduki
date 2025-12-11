import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { Prisma } from '@prisma/client';

const createRichMenuSchema = z.object({
  name: z.string().min(1).max(255),
  chatBarText: z.string().optional().nullable(),
  size: z.object({
    width: z.number().int(),
    height: z.number().int(),
  }),
  areas: z.array(z.any()),
  imageUrl: z.string().url().optional().nullable(),
  isDefault: z.boolean().default(false),
});

// GET /api/line/richmenus - List rich menus
export async function GET(_request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const richMenus = await prisma.lineRichMenu.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ richMenus });
  } catch (error) {
    console.error('Error fetching rich menus:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rich menus' },
      { status: 500 }
    );
  }
}

// POST /api/line/richmenus - Create rich menu
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = createRichMenuSchema.parse(body);

    // Generate a placeholder richMenuId (would be from LINE API in production)
    const richMenuId = `richmenu-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // If setting as default, unset other defaults
    if (validatedData.isDefault) {
      await prisma.lineRichMenu.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const richMenu = await prisma.lineRichMenu.create({
      data: {
        richMenuId,
        name: validatedData.name,
        chatBarText: validatedData.chatBarText,
        size: validatedData.size as Prisma.InputJsonValue,
        areas: validatedData.areas as Prisma.InputJsonValue,
        imageUrl: validatedData.imageUrl,
        isDefault: validatedData.isDefault,
      },
    });

    return NextResponse.json({ richMenu }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating rich menu:', error);
    return NextResponse.json(
      { error: 'Failed to create rich menu' },
      { status: 500 }
    );
  }
}
