import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

const updateEnrollmentSchema = z.object({
  status: z.enum(['ACTIVE', 'COMPLETED', 'EXPIRED', 'CANCELED']).optional(),
  expiresAt: z.string().datetime().optional().nullable(),
});

// GET /api/courses/[courseId]/enrollments/[enrollmentId]
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
        contact: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        course: {
          include: {
            modules: {
              include: {
                lessons: true,
              },
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
        lessonProgress: true,
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    return NextResponse.json({ enrollment });
  } catch (error) {
    console.error('Error fetching enrollment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enrollment' },
      { status: 500 }
    );
  }
}

// PATCH /api/courses/[courseId]/enrollments/[enrollmentId]
export async function PATCH(
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
    const validatedData = updateEnrollmentSchema.parse(body);

    const existingEnrollment = await prisma.courseEnrollment.findUnique({
      where: { id: enrollmentId },
    });

    if (!existingEnrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (validatedData.status) {
      updateData.status = validatedData.status;
      if (validatedData.status === 'COMPLETED') {
        updateData.completedAt = new Date();
      }
    }

    if (validatedData.expiresAt !== undefined) {
      updateData.expiresAt = validatedData.expiresAt ? new Date(validatedData.expiresAt) : null;
    }

    const enrollment = await prisma.courseEnrollment.update({
      where: { id: enrollmentId },
      data: updateData,
      include: {
        contact: true,
        lessonProgress: true,
      },
    });

    return NextResponse.json({ enrollment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating enrollment:', error);
    return NextResponse.json(
      { error: 'Failed to update enrollment' },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[courseId]/enrollments/[enrollmentId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; enrollmentId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { enrollmentId } = await params;

  try {
    const existingEnrollment = await prisma.courseEnrollment.findUnique({
      where: { id: enrollmentId },
    });

    if (!existingEnrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    await prisma.courseEnrollment.delete({
      where: { id: enrollmentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting enrollment:', error);
    return NextResponse.json(
      { error: 'Failed to delete enrollment' },
      { status: 500 }
    );
  }
}
