import { prisma } from '@/lib/db/prisma'
import type {
  Course,
  CourseModule,
  CourseLesson,
  CourseEnrollment,
  CourseStatus,
  LessonType,
  EnrollmentStatus,
} from '@prisma/client'

export interface CreateCourseInput {
  workspaceId: string
  name: string
  slug: string
  description?: string
  thumbnail?: string
  productId?: string
  settings?: Record<string, unknown>
}

export interface UpdateCourseInput {
  name?: string
  description?: string
  thumbnail?: string
  settings?: Record<string, unknown>
  status?: CourseStatus
}

export interface CreateModuleInput {
  courseId: string
  name: string
  description?: string
  sortOrder?: number
}

export interface CreateLessonInput {
  moduleId: string
  name: string
  description?: string
  type: LessonType
  content?: Record<string, unknown>
  videoUrl?: string
  duration?: number
  sortOrder?: number
  isPreview?: boolean
  dripDelay?: number
}

/**
 * Create a new course
 */
export async function createCourse(input: CreateCourseInput): Promise<Course> {
  const { workspaceId, name, slug, description, thumbnail, productId, settings } = input

  // Check if slug exists
  const existingCourse = await prisma.course.findUnique({
    where: {
      workspaceId_slug: {
        workspaceId,
        slug,
      },
    },
  })

  if (existingCourse) {
    throw new Error('Course slug already exists in this workspace')
  }

  return prisma.course.create({
    data: {
      workspaceId,
      name,
      slug,
      description,
      thumbnail,
      productId,
      settings: settings as object,
      status: 'DRAFT',
    },
  })
}

/**
 * Get course by ID with full details
 */
export async function getCourseById(courseId: string): Promise<Course | null> {
  return prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { sortOrder: 'asc' },
        include: {
          lessons: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      },
      product: true,
      _count: {
        select: {
          enrollments: true,
        },
      },
    },
  })
}

/**
 * Get course by slug
 */
export async function getCourseBySlug(
  workspaceId: string,
  slug: string
): Promise<Course | null> {
  return prisma.course.findUnique({
    where: {
      workspaceId_slug: {
        workspaceId,
        slug,
      },
    },
    include: {
      modules: {
        orderBy: { sortOrder: 'asc' },
        include: {
          lessons: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      },
    },
  })
}

/**
 * List courses in workspace
 */
export async function listCourses(
  workspaceId: string,
  options?: {
    status?: CourseStatus
    limit?: number
    offset?: number
  }
): Promise<{ courses: Course[]; total: number }> {
  const { status, limit = 20, offset = 0 } = options || {}

  const where = {
    workspaceId,
    ...(status && { status }),
  }

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      include: {
        _count: {
          select: {
            modules: true,
            enrollments: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.course.count({ where }),
  ])

  return { courses, total }
}

/**
 * Update course
 */
export async function updateCourse(
  courseId: string,
  input: UpdateCourseInput
): Promise<Course> {
  return prisma.course.update({
    where: { id: courseId },
    data: {
      name: input.name,
      description: input.description,
      thumbnail: input.thumbnail,
      settings: input.settings as object,
      status: input.status,
    },
  })
}

/**
 * Delete course
 */
export async function deleteCourse(courseId: string): Promise<void> {
  await prisma.course.delete({
    where: { id: courseId },
  })
}

/**
 * Publish course
 */
export async function publishCourse(courseId: string): Promise<Course> {
  return prisma.course.update({
    where: { id: courseId },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  })
}

/**
 * Create module
 */
export async function createModule(input: CreateModuleInput): Promise<CourseModule> {
  const { courseId, name, description, sortOrder } = input

  // Get max sort order if not provided
  let order = sortOrder
  if (order === undefined) {
    const lastModule = await prisma.courseModule.findFirst({
      where: { courseId },
      orderBy: { sortOrder: 'desc' },
    })
    order = (lastModule?.sortOrder ?? -1) + 1
  }

  return prisma.courseModule.create({
    data: {
      courseId,
      name,
      description,
      sortOrder: order,
    },
  })
}

/**
 * Update module
 */
export async function updateModule(
  moduleId: string,
  input: { name?: string; description?: string }
): Promise<CourseModule> {
  return prisma.courseModule.update({
    where: { id: moduleId },
    data: input,
  })
}

/**
 * Delete module
 */
export async function deleteModule(moduleId: string): Promise<void> {
  await prisma.courseModule.delete({
    where: { id: moduleId },
  })
}

/**
 * Reorder modules
 */
export async function reorderModules(
  courseId: string,
  moduleIds: string[]
): Promise<void> {
  await prisma.$transaction(
    moduleIds.map((id, index) =>
      prisma.courseModule.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  )
}

/**
 * Create lesson
 */
export async function createLesson(input: CreateLessonInput): Promise<CourseLesson> {
  const {
    moduleId,
    name,
    description,
    type,
    content,
    videoUrl,
    duration,
    sortOrder,
    isPreview = false,
    dripDelay,
  } = input

  // Get max sort order if not provided
  let order = sortOrder
  if (order === undefined) {
    const lastLesson = await prisma.courseLesson.findFirst({
      where: { moduleId },
      orderBy: { sortOrder: 'desc' },
    })
    order = (lastLesson?.sortOrder ?? -1) + 1
  }

  return prisma.courseLesson.create({
    data: {
      moduleId,
      name,
      description,
      type,
      content: content as object,
      videoUrl,
      duration,
      sortOrder: order,
      isPreview,
      dripDelay,
    },
  })
}

/**
 * Update lesson
 */
export async function updateLesson(
  lessonId: string,
  input: Partial<CreateLessonInput>
): Promise<CourseLesson> {
  return prisma.courseLesson.update({
    where: { id: lessonId },
    data: {
      name: input.name,
      description: input.description,
      type: input.type,
      content: input.content as object,
      videoUrl: input.videoUrl,
      duration: input.duration,
      isPreview: input.isPreview,
      dripDelay: input.dripDelay,
    },
  })
}

/**
 * Delete lesson
 */
export async function deleteLesson(lessonId: string): Promise<void> {
  await prisma.courseLesson.delete({
    where: { id: lessonId },
  })
}

/**
 * Reorder lessons
 */
export async function reorderLessons(
  moduleId: string,
  lessonIds: string[]
): Promise<void> {
  await prisma.$transaction(
    lessonIds.map((id, index) =>
      prisma.courseLesson.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  )
}

/**
 * Enroll contact in course
 */
export async function enrollContact(
  courseId: string,
  contactId: string,
  expiresAt?: Date
): Promise<CourseEnrollment> {
  // Check if already enrolled
  const existingEnrollment = await prisma.courseEnrollment.findUnique({
    where: {
      courseId_contactId: {
        courseId,
        contactId,
      },
    },
  })

  if (existingEnrollment) {
    // Reactivate if expired or canceled
    if (['EXPIRED', 'CANCELED'].includes(existingEnrollment.status)) {
      return prisma.courseEnrollment.update({
        where: { id: existingEnrollment.id },
        data: {
          status: 'ACTIVE',
          expiresAt,
          progress: 0,
          completedAt: null,
        },
      })
    }
    throw new Error('Contact is already enrolled in this course')
  }

  return prisma.courseEnrollment.create({
    data: {
      courseId,
      contactId,
      status: 'ACTIVE',
      expiresAt,
    },
  })
}

/**
 * Update enrollment status
 */
export async function updateEnrollmentStatus(
  enrollmentId: string,
  status: EnrollmentStatus
): Promise<CourseEnrollment> {
  const data: { status: EnrollmentStatus; completedAt?: Date } = { status }

  if (status === 'COMPLETED') {
    data.completedAt = new Date()
  }

  return prisma.courseEnrollment.update({
    where: { id: enrollmentId },
    data,
  })
}

/**
 * Get enrollment with progress
 */
export async function getEnrollmentWithProgress(
  courseId: string,
  contactId: string
) {
  const enrollment = await prisma.courseEnrollment.findUnique({
    where: {
      courseId_contactId: {
        courseId,
        contactId,
      },
    },
    include: {
      lessonProgress: {
        include: {
          lesson: true,
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
  })

  if (!enrollment) return null

  // Calculate total lessons and completed
  const totalLessons = enrollment.course.modules.reduce(
    (acc, module) => acc + module.lessons.length,
    0
  )
  const completedLessons = enrollment.lessonProgress.filter(
    (p) => p.status === 'COMPLETED'
  ).length

  const progressPercentage =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  return {
    ...enrollment,
    totalLessons,
    completedLessons,
    progressPercentage,
  }
}

/**
 * Mark lesson as complete
 */
export async function completeLessonProgress(
  enrollmentId: string,
  lessonId: string
): Promise<void> {
  const existingProgress = await prisma.lessonProgress.findUnique({
    where: {
      enrollmentId_lessonId: {
        enrollmentId,
        lessonId,
      },
    },
  })

  if (existingProgress) {
    await prisma.lessonProgress.update({
      where: { id: existingProgress.id },
      data: {
        status: 'COMPLETED',
        progress: 100,
        completedAt: new Date(),
      },
    })
  } else {
    await prisma.lessonProgress.create({
      data: {
        enrollmentId,
        lessonId,
        status: 'COMPLETED',
        progress: 100,
        completedAt: new Date(),
      },
    })
  }

  // Update overall enrollment progress
  await updateEnrollmentProgress(enrollmentId)
}

/**
 * Update lesson progress
 */
export async function updateLessonProgress(
  enrollmentId: string,
  lessonId: string,
  progress: number
): Promise<void> {
  const existingProgress = await prisma.lessonProgress.findUnique({
    where: {
      enrollmentId_lessonId: {
        enrollmentId,
        lessonId,
      },
    },
  })

  if (existingProgress) {
    await prisma.lessonProgress.update({
      where: { id: existingProgress.id },
      data: {
        progress,
        status: progress >= 100 ? 'COMPLETED' : 'IN_PROGRESS',
        completedAt: progress >= 100 ? new Date() : null,
      },
    })
  } else {
    await prisma.lessonProgress.create({
      data: {
        enrollmentId,
        lessonId,
        progress,
        status: progress >= 100 ? 'COMPLETED' : 'IN_PROGRESS',
        completedAt: progress >= 100 ? new Date() : null,
      },
    })
  }

  // Update overall enrollment progress
  await updateEnrollmentProgress(enrollmentId)
}

/**
 * Update overall enrollment progress
 */
async function updateEnrollmentProgress(enrollmentId: string): Promise<void> {
  const enrollment = await prisma.courseEnrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      course: {
        include: {
          modules: {
            include: {
              lessons: true,
            },
          },
        },
      },
      lessonProgress: true,
    },
  })

  if (!enrollment) return

  const totalLessons = enrollment.course.modules.reduce(
    (acc, module) => acc + module.lessons.length,
    0
  )
  const completedLessons = enrollment.lessonProgress.filter(
    (p) => p.status === 'COMPLETED'
  ).length

  const progress =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  const isCompleted = progress >= 100

  await prisma.courseEnrollment.update({
    where: { id: enrollmentId },
    data: {
      progress,
      status: isCompleted ? 'COMPLETED' : 'ACTIVE',
      completedAt: isCompleted ? new Date() : null,
    },
  })
}

/**
 * Get course analytics
 */
export async function getCourseAnalytics(courseId: string) {
  const [enrollments, completedEnrollments, course] = await Promise.all([
    prisma.courseEnrollment.count({ where: { courseId } }),
    prisma.courseEnrollment.count({
      where: { courseId, status: 'COMPLETED' },
    }),
    prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: true,
          },
        },
      },
    }),
  ])

  const totalLessons = course?.modules.reduce(
    (acc, module) => acc + module.lessons.length,
    0
  ) || 0

  const completionRate =
    enrollments > 0
      ? ((completedEnrollments / enrollments) * 100).toFixed(1)
      : 0

  return {
    totalEnrollments: enrollments,
    completedEnrollments,
    completionRate,
    totalModules: course?.modules.length || 0,
    totalLessons,
  }
}

/**
 * Generate unique course slug
 */
export async function generateUniqueCourseSlug(
  workspaceId: string,
  name: string
): Promise<string> {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  let slug = baseSlug
  let counter = 1

  while (
    await prisma.course.findUnique({
      where: {
        workspaceId_slug: {
          workspaceId,
          slug,
        },
      },
    })
  ) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}
