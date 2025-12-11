import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

const updateCourseSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  thumbnail: z.string().url().optional().nullable(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  productId: z.string().optional().nullable(),
  settings: z.record(z.unknown()).optional().nullable(),
});

interface ModuleWithLessons {
  id: string;
  lessons: unknown[];
}

interface EnrollmentWithProgress {
  status: string;
  progress: number;
}

// GET /api/courses/[courseId] - Get course details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { courseId } = await params;

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: {
              orderBy: { sortOrder: 'asc' },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
        enrollments: {
          include: {
            contact: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            lessonProgress: true,
          },
        },
        product: true,
      },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Calculate stats
    const totalLessons = course.modules.reduce(
      (acc: number, mod: ModuleWithLessons) => acc + mod.lessons.length,
      0
    );
    const completedEnrollments = course.enrollments.filter(
      (e: EnrollmentWithProgress) => e.status === 'COMPLETED'
    ).length;
    const avgProgress =
      course.enrollments.length > 0
        ? course.enrollments.reduce((acc: number, e: EnrollmentWithProgress) => acc + e.progress, 0) /
          course.enrollments.length
        : 0;

    return NextResponse.json({
      course: {
        ...course,
        stats: {
          totalModules: course.modules.length,
          totalLessons,
          totalEnrollments: course.enrollments.length,
          completedEnrollments,
          averageProgress: Math.round(avgProgress),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

// PATCH /api/courses/[courseId] - Update course
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { courseId } = await params;

  try {
    const body = await request.json();
    const validatedData = updateCourseSchema.parse(body);

    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = { ...validatedData };

    // Set publishedAt when publishing
    if (validatedData.status === 'PUBLISHED' && !existingCourse.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const course = await prisma.course.update({
      where: { id: courseId },
      data: updateData,
      include: {
        modules: {
          include: {
            lessons: true,
          },
        },
        product: true,
      },
    });

    return NextResponse.json({ course });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[courseId] - Delete course
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { courseId } = await params;

  try {
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    await prisma.course.delete({
      where: { id: courseId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}
