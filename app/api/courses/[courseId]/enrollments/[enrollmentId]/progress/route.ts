import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

interface ModuleWithLessons {
  id: string;
  lessons: unknown[];
}

interface ProgressEntry {
  status: string;
}

const updateProgressSchema = z.object({
  lessonId: z.string().min(1),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']),
  progress: z.number().int().min(0).max(100).optional(),
});

// GET /api/courses/[courseId]/enrollments/[enrollmentId]/progress
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; enrollmentId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { enrollmentId } = await params;

  try {
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        lessonProgress: {
          include: {
            lesson: {
              select: {
                id: true,
                name: true,
                moduleId: true,
              },
            },
          },
        },
        course: {
          include: {
            modules: {
              include: {
                lessons: true,
              },
            },
          },
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    // Calculate total lessons and progress
    const totalLessons = enrollment.course.modules.reduce(
      (acc: number, mod: ModuleWithLessons) => acc + mod.lessons.length,
      0
    );
    const completedLessons = enrollment.lessonProgress.filter(
      (p: ProgressEntry) => p.status === 'COMPLETED'
    ).length;
    const overallProgress = totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

    return NextResponse.json({
      progress: {
        enrollmentId,
        totalLessons,
        completedLessons,
        overallProgress,
        lessonProgress: enrollment.lessonProgress,
      },
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

// POST /api/courses/[courseId]/enrollments/[enrollmentId]/progress
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; enrollmentId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { enrollmentId } = await params;

  try {
    const body = await request.json();
    const validatedData = updateProgressSchema.parse(body);

    // Update or create lesson progress
    const lessonProgress = await prisma.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId,
          lessonId: validatedData.lessonId,
        },
      },
      create: {
        enrollmentId,
        lessonId: validatedData.lessonId,
        status: validatedData.status,
        progress: validatedData.progress || 0,
        completedAt: validatedData.status === 'COMPLETED' ? new Date() : null,
      },
      update: {
        status: validatedData.status,
        progress: validatedData.progress,
        completedAt: validatedData.status === 'COMPLETED' ? new Date() : undefined,
      },
    });

    // Recalculate overall progress
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        lessonProgress: true,
        course: {
          include: {
            modules: {
              include: {
                lessons: true,
              },
            },
          },
        },
      },
    });

    if (enrollment) {
      const totalLessons = enrollment.course.modules.reduce(
        (acc: number, mod: ModuleWithLessons) => acc + mod.lessons.length,
        0
      );
      const completedLessons = enrollment.lessonProgress.filter(
        (p: ProgressEntry) => p.status === 'COMPLETED'
      ).length;
      const overallProgress = totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

      // Update enrollment progress and status
      await prisma.courseEnrollment.update({
        where: { id: enrollmentId },
        data: {
          progress: overallProgress,
          status: overallProgress === 100 ? 'COMPLETED' : 'ACTIVE',
          completedAt: overallProgress === 100 ? new Date() : null,
        },
      });
    }

    return NextResponse.json({ lessonProgress });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}
