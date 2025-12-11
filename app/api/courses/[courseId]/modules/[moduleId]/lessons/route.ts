import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { Prisma } from '@prisma/client';

const createLessonSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional().nullable(),
  type: z.enum(['VIDEO', 'TEXT', 'QUIZ', 'DOWNLOAD', 'ASSIGNMENT']).default('VIDEO'),
  content: z.any().optional(),
  videoUrl: z.string().url().optional().nullable(),
  duration: z.number().int().min(0).optional().nullable(),
  sortOrder: z.number().int().default(0),
  isPreview: z.boolean().default(false),
  dripDelay: z.number().int().min(0).optional().nullable(),
});

// GET /api/courses/[courseId]/modules/[moduleId]/lessons
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; moduleId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { moduleId } = await params;

  try {
    const lessons = await prisma.courseLesson.findMany({
      where: { moduleId },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ lessons });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lessons' },
      { status: 500 }
    );
  }
}

// POST /api/courses/[courseId]/modules/[moduleId]/lessons
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; moduleId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { moduleId } = await params;

  try {
    const body = await request.json();
    const validatedData = createLessonSchema.parse(body);

    // Get max sort order
    const lastLesson = await prisma.courseLesson.findFirst({
      where: { moduleId },
      orderBy: { sortOrder: 'desc' },
    });

    const sortOrder = validatedData.sortOrder || (lastLesson ? lastLesson.sortOrder + 1 : 0);

    const lesson = await prisma.courseLesson.create({
      data: {
        moduleId,
        name: validatedData.name,
        description: validatedData.description,
        type: validatedData.type,
        content: validatedData.content as Prisma.InputJsonValue | undefined,
        videoUrl: validatedData.videoUrl,
        duration: validatedData.duration,
        sortOrder,
        isPreview: validatedData.isPreview,
        dripDelay: validatedData.dripDelay,
      },
    });

    return NextResponse.json({ lesson }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating lesson:', error);
    return NextResponse.json(
      { error: 'Failed to create lesson' },
      { status: 500 }
    );
  }
}
