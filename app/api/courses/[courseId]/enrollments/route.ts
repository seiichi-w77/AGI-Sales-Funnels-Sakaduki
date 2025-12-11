import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

const createEnrollmentSchema = z.object({
  contactId: z.string().min(1),
  expiresAt: z.string().datetime().optional().nullable(),
});

// GET /api/courses/[courseId]/enrollments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { courseId } = await params;
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { courseId };

  if (status) {
    where.status = status;
  }

  try {
    const [enrollments, total] = await Promise.all([
      prisma.courseEnrollment.findMany({
        where,
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
        orderBy: { startedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.courseEnrollment.count({ where }),
    ]);

    return NextResponse.json({
      enrollments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enrollments' },
      { status: 500 }
    );
  }
}

// POST /api/courses/[courseId]/enrollments
export async function POST(
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
    const validatedData = createEnrollmentSchema.parse(body);

    // Check if already enrolled
    const existing = await prisma.courseEnrollment.findFirst({
      where: {
        courseId,
        contactId: validatedData.contactId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Contact is already enrolled in this course' },
        { status: 409 }
      );
    }

    const enrollment = await prisma.courseEnrollment.create({
      data: {
        courseId,
        contactId: validatedData.contactId,
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
        status: 'ACTIVE',
        progress: 0,
      },
      include: {
        contact: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({ enrollment }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating enrollment:', error);
    return NextResponse.json(
      { error: 'Failed to create enrollment' },
      { status: 500 }
    );
  }
}
