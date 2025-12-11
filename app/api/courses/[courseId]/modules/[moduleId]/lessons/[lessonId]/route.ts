import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { Prisma } from '@prisma/client';

const updateLessonSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  type: z.enum(['VIDEO', 'TEXT', 'QUIZ', 'DOWNLOAD', 'ASSIGNMENT']).optional(),
  content: z.any().optional(),
  videoUrl: z.string().url().optional().nullable(),
  duration: z.number().int().min(0).optional().nullable(),
  sortOrder: z.number().int().optional(),
  isPreview: z.boolean().optional(),
  dripDelay: z.number().int().min(0).optional().nullable(),
});

// GET /api/courses/[courseId]/modules/[moduleId]/lessons/[lessonId]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; moduleId: string; lessonId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { lessonId } = await params;

  try {
    const lesson = await prisma.courseLesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    return NextResponse.json({ lesson });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lesson' },
      { status: 500 }
    );
  }
}

// PATCH /api/courses/[courseId]/modules/[moduleId]/lessons/[lessonId]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; moduleId: string; lessonId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { lessonId } = await params;

  try {
    const body = await request.json();
    const validatedData = updateLessonSchema.parse(body);

    const existingLesson = await prisma.courseLesson.findUnique({
      where: { id: lessonId },
    });

    if (!existingLesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    const updateData = {
      ...validatedData,
      content: validatedData.content as Prisma.InputJsonValue | undefined,
    };

    const lesson = await prisma.courseLesson.update({
      where: { id: lessonId },
      data: updateData,
    });

    return NextResponse.json({ lesson });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating lesson:', error);
    return NextResponse.json(
      { error: 'Failed to update lesson' },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[courseId]/modules/[moduleId]/lessons/[lessonId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; moduleId: string; lessonId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { lessonId } = await params;

  try {
    const existingLesson = await prisma.courseLesson.findUnique({
      where: { id: lessonId },
    });

    if (!existingLesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    await prisma.courseLesson.delete({
      where: { id: lessonId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    return NextResponse.json(
      { error: 'Failed to delete lesson' },
      { status: 500 }
    );
  }
}
