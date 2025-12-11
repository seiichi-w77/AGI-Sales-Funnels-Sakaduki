import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import prisma from '@/lib/db/prisma';

export type SupportedLocale = 'ja' | 'en';
export type DateFormat = 'YYYY/MM/DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY';

interface UpdatePreferencesRequest {
  language?: SupportedLocale;
  timezone?: string;
  dateFormat?: DateFormat;
}

interface UserPreferences {
  language: SupportedLocale;
  timezone: string;
  dateFormat: DateFormat;
}

// GET /api/users/me/preferences
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        language: true,
        timezone: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get dateFormat from localStorage on client side for now
    // Once prisma migrate is run, this can be stored in DB
    const preferences: UserPreferences = {
      language: (user.language as SupportedLocale) || 'ja',
      timezone: user.timezone || 'Asia/Tokyo',
      dateFormat: 'YYYY/MM/DD', // Default, will be stored client-side until DB migration
    };

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/users/me/preferences
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: UpdatePreferencesRequest = await request.json();

    // Validate language
    if (body.language && !['ja', 'en'].includes(body.language)) {
      return NextResponse.json(
        { error: 'Invalid language. Supported: ja, en' },
        { status: 400 }
      );
    }

    // Validate dateFormat
    if (body.dateFormat && !['YYYY/MM/DD', 'MM/DD/YYYY', 'DD/MM/YYYY'].includes(body.dateFormat)) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    const updateData: Partial<{
      language: string;
      timezone: string;
    }> = {};

    if (body.language) updateData.language = body.language;
    if (body.timezone) updateData.timezone = body.timezone;
    // dateFormat is stored client-side only for now (until DB migration is run)

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
      select: {
        id: true,
        language: true,
        timezone: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        preferences: {
          language: user.language as SupportedLocale,
          timezone: user.timezone,
          dateFormat: body.dateFormat || ('YYYY/MM/DD' as DateFormat),
        },
      },
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
