import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

const createModuleSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
});

// GET /api/courses/[courseId]/modules - List modules
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
    const modules = await prisma.courseModule.findMany({
      where: { courseId },
      include: {
        lessons: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ modules });
  } catch (error) {
    console.error('Error fetching modules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch modules' },
      { status: 500 }
    );
  }
}

// POST /api/courses/[courseId]/modules - Create module
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
    const validatedData = createModuleSchema.parse(body);

    // Get max sort order
    const lastModule = await prisma.courseModule.findFirst({
      where: { courseId },
      orderBy: { sortOrder: 'desc' },
    });

    const sortOrder = validatedData.sortOrder || (lastModule ? lastModule.sortOrder + 1 : 0);

    const module = await prisma.courseModule.create({
      data: {
        courseId,
        name: validatedData.name,
        description: validatedData.description,
        sortOrder,
      },
      include: {
        lessons: true,
      },
    });

    return NextResponse.json({ module }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating module:', error);
    return NextResponse.json(
      { error: 'Failed to create module' },
      { status: 500 }
    );
  }
}
