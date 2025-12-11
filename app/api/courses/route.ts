import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { Prisma } from '@prisma/client';

const createCourseSchema = z.object({
  workspaceId: z.string().min(1),
  name: z.string().min(1).max(255),
  description: z.string().optional().nullable(),
  thumbnail: z.string().url().optional().nullable(),
  productId: z.string().optional().nullable(),
  settings: z.any().optional(),
});

// GET /api/courses - List courses
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get('workspaceId');
  const status = searchParams.get('status');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (workspaceId) {
    where.workspaceId = workspaceId;
  }

  if (status) {
    where.status = status;
  }

  try {
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          modules: {
            include: {
              lessons: true,
            },
            orderBy: { sortOrder: 'asc' },
          },
          enrollments: {
            select: { id: true },
          },
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.course.count({ where }),
    ]);

    const coursesWithStats = courses.map((course) => {
      const lessonCount = course.modules.reduce(
        (acc: number, mod: { lessons: unknown[] }) => acc + mod.lessons.length,
        0
      );
      return {
        ...course,
        _count: {
          enrollments: course.enrollments.length,
          modules: course.modules.length,
          lessons: lessonCount,
        },
      };
    });

    return NextResponse.json({
      courses: coursesWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

// POST /api/courses - Create course
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = createCourseSchema.parse(body);

    // Generate unique slug
    const baseSlug = validatedData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    let slug = baseSlug;

    for (let counter = 1; counter <= 100; counter++) {
      const existing = await prisma.course.findFirst({
        where: {
          workspaceId: validatedData.workspaceId,
          slug,
        },
      });

      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
    }

    const course = await prisma.course.create({
      data: {
        workspaceId: validatedData.workspaceId,
        name: validatedData.name,
        slug,
        description: validatedData.description,
        thumbnail: validatedData.thumbnail,
        productId: validatedData.productId,
        settings: validatedData.settings as Prisma.InputJsonValue | undefined,
        status: 'DRAFT',
      },
      include: {
        modules: true,
        product: true,
      },
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}
