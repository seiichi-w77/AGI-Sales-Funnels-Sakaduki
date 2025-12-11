import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { hash } from 'bcryptjs'

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // Create Plans
  const starterPlan = await prisma.plan.upsert({
    where: { slug: 'starter' },
    update: {},
    create: {
      name: 'Starter',
      slug: 'starter',
      description: 'Perfect for getting started',
      priceMonthly: 9700, // $97
      priceYearly: 97000, // $970
      features: {
        funnels: 3,
        pages: 20,
        contacts: 1000,
        emailsPerMonth: 5000,
        courses: 1,
        customDomains: 1,
      },
      limits: {
        maxFunnels: 3,
        maxPages: 20,
        maxContacts: 1000,
        maxEmailsPerMonth: 5000,
        maxCourses: 1,
        maxCustomDomains: 1,
        maxTeamMembers: 2,
      },
      sortOrder: 1,
    },
  })

  const proPlan = await prisma.plan.upsert({
    where: { slug: 'pro' },
    update: {},
    create: {
      name: 'Pro',
      slug: 'pro',
      description: 'For growing businesses',
      priceMonthly: 29700, // $297
      priceYearly: 297000, // $2970
      features: {
        funnels: 'unlimited',
        pages: 'unlimited',
        contacts: 10000,
        emailsPerMonth: 50000,
        courses: 'unlimited',
        customDomains: 3,
        affiliateProgram: true,
        abTesting: true,
      },
      limits: {
        maxFunnels: -1, // unlimited
        maxPages: -1,
        maxContacts: 10000,
        maxEmailsPerMonth: 50000,
        maxCourses: -1,
        maxCustomDomains: 3,
        maxTeamMembers: 5,
      },
      sortOrder: 2,
    },
  })

  const funnelHackerPlan = await prisma.plan.upsert({
    where: { slug: 'funnel-hacker' },
    update: {},
    create: {
      name: 'Funnel Hacker',
      slug: 'funnel-hacker',
      description: 'Everything you need to scale',
      priceMonthly: 49700, // $497
      priceYearly: 497000, // $4970
      features: {
        funnels: 'unlimited',
        pages: 'unlimited',
        contacts: 'unlimited',
        emailsPerMonth: 'unlimited',
        courses: 'unlimited',
        customDomains: 'unlimited',
        affiliateProgram: true,
        abTesting: true,
        prioritySupport: true,
        apiAccess: true,
      },
      limits: {
        maxFunnels: -1,
        maxPages: -1,
        maxContacts: -1,
        maxEmailsPerMonth: -1,
        maxCourses: -1,
        maxCustomDomains: -1,
        maxTeamMembers: -1,
      },
      sortOrder: 3,
    },
  })

  console.log('✅ Plans created:', { starterPlan, proPlan, funnelHackerPlan })

  // Create a demo user and workspace (for development)
  if (process.env.NODE_ENV === 'development') {
    // テストユーザーのパスワードをハッシュ化
    const testPassword = await hash('Test1234!', 12)

    const demoUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {
        passwordHash: testPassword,
      },
      create: {
        email: 'test@example.com',
        passwordHash: testPassword,
        firstName: 'Test',
        lastName: 'User',
        timezone: 'Asia/Tokyo',
        language: 'ja',
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        status: 'ACTIVE',
      },
    })

    const demoWorkspace = await prisma.workspace.upsert({
      where: { slug: 'demo-workspace' },
      update: {},
      create: {
        name: 'Demo Workspace',
        slug: 'demo-workspace',
        description: 'A demo workspace for testing',
        ownerId: demoUser.id,
        settings: {
          timezone: 'Asia/Tokyo',
          currency: 'JPY',
          dateFormat: 'YYYY-MM-DD',
        },
      },
    })

    // Add user as workspace member
    await prisma.workspaceMember.upsert({
      where: {
        workspaceId_userId: {
          workspaceId: demoWorkspace.id,
          userId: demoUser.id,
        },
      },
      update: {},
      create: {
        workspaceId: demoWorkspace.id,
        userId: demoUser.id,
        role: 'OWNER',
        status: 'ACTIVE',
        joinedAt: new Date(),
      },
    })

    // Create subscription for demo workspace
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())

    await prisma.subscription.upsert({
      where: { stripeSubscriptionId: 'demo_subscription' },
      update: {},
      create: {
        workspaceId: demoWorkspace.id,
        planId: proPlan.id,
        status: 'ACTIVE',
        stripeSubscriptionId: 'demo_subscription',
        stripeCustomerId: 'demo_customer',
        currentPeriodStart: now,
        currentPeriodEnd: nextMonth,
      },
    })

    console.log('✅ Demo user and workspace created:', { demoUser, demoWorkspace })

    // Create sample products
    const sampleProduct = await prisma.product.upsert({
      where: {
        workspaceId_slug: {
          workspaceId: demoWorkspace.id,
          slug: 'sample-product',
        },
      },
      update: {},
      create: {
        workspaceId: demoWorkspace.id,
        name: 'Sample Digital Product',
        slug: 'sample-product',
        description: 'This is a sample digital product for testing',
        type: 'DIGITAL',
        status: 'ACTIVE',
      },
    })

    await prisma.productPrice.upsert({
      where: { stripePriceId: 'sample_price' },
      update: {},
      create: {
        productId: sampleProduct.id,
        name: 'Standard Price',
        type: 'ONE_TIME',
        amount: 9700, // $97
        currency: 'USD',
        isDefault: true,
        stripePriceId: 'sample_price',
      },
    })

    console.log('✅ Sample product created:', { sampleProduct })

    // Create sample funnel
    const sampleFunnel = await prisma.funnel.upsert({
      where: {
        workspaceId_slug: {
          workspaceId: demoWorkspace.id,
          slug: 'sample-funnel',
        },
      },
      update: {},
      create: {
        workspaceId: demoWorkspace.id,
        name: 'Sample Lead Magnet Funnel',
        slug: 'sample-funnel',
        type: 'LEAD_MAGNET',
        status: 'DRAFT',
        description: 'A sample funnel for testing',
      },
    })

    // Create funnel steps
    await prisma.funnelStep.createMany({
      data: [
        {
          funnelId: sampleFunnel.id,
          name: 'Opt-in Page',
          slug: 'optin',
          type: 'OPTIN',
          sortOrder: 0,
        },
        {
          funnelId: sampleFunnel.id,
          name: 'Thank You Page',
          slug: 'thank-you',
          type: 'THANK_YOU',
          sortOrder: 1,
        },
      ],
      skipDuplicates: true,
    })

    console.log('✅ Sample funnel created:', { sampleFunnel })

    // Create sample contacts
    const sampleContacts = [
      { firstName: '太郎', lastName: '山田', email: 'taro@example.com' },
      { firstName: '花子', lastName: '田中', email: 'hanako@example.com' },
      { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
    ]

    for (const contact of sampleContacts) {
      await prisma.contact.upsert({
        where: {
          workspaceId_email: {
            workspaceId: demoWorkspace.id,
            email: contact.email,
          },
        },
        update: {},
        create: {
          workspaceId: demoWorkspace.id,
          email: contact.email,
          firstName: contact.firstName,
          lastName: contact.lastName,
          status: 'ACTIVE',
          source: 'seed',
          subscribedAt: new Date(),
        },
      })
    }

    console.log('✅ Sample contacts created')

    // Create sample course
    const sampleCourse = await prisma.course.upsert({
      where: {
        workspaceId_slug: {
          workspaceId: demoWorkspace.id,
          slug: 'sample-course',
        },
      },
      update: {},
      create: {
        workspaceId: demoWorkspace.id,
        name: 'Sample Online Course',
        slug: 'sample-course',
        description: 'A sample online course for testing the LMS features',
        status: 'DRAFT',
      },
    })

    // Create course module
    const sampleModule = await prisma.courseModule.create({
      data: {
        courseId: sampleCourse.id,
        name: 'Module 1: Getting Started',
        description: 'Introduction to the course',
        sortOrder: 0,
      },
    })

    // Create course lessons
    await prisma.courseLesson.createMany({
      data: [
        {
          moduleId: sampleModule.id,
          name: 'Lesson 1: Welcome',
          type: 'VIDEO',
          sortOrder: 0,
          isPreview: true,
        },
        {
          moduleId: sampleModule.id,
          name: 'Lesson 2: Course Overview',
          type: 'TEXT',
          sortOrder: 1,
        },
      ],
    })

    console.log('✅ Sample course created:', { sampleCourse })
  }

  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
