import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { firstName, lastName, email, password } = parsed.data

    // TODO: Check if user already exists with Prisma
    // const existingUser = await prisma.user.findUnique({ where: { email } })
    // if (existingUser) {
    //   return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    // }

    // Hash password
    const passwordHash = await hash(password, 12)

    // TODO: Create user with Prisma
    // const user = await prisma.user.create({
    //   data: {
    //     email,
    //     firstName,
    //     lastName,
    //     passwordHash,
    //     status: 'ACTIVE',
    //   },
    // })

    // Placeholder response - replace with actual user creation
    const user = {
      id: 'placeholder-id',
      email,
      firstName,
      lastName,
      createdAt: new Date().toISOString(),
    }

    console.log('User registered:', { email, firstName, lastName, passwordHash: '***' })

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
