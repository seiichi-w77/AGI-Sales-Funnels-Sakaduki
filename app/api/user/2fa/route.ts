import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { authenticator } from 'otplib';
import { z } from 'zod';
import crypto from 'crypto';

// Generate backup codes
function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  return codes;
}

// Get 2FA status
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        twoFactorEnabled: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ enabled: user.twoFactorEnabled });
  } catch (error) {
    console.error('Error fetching 2FA status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Setup 2FA - Generate secret
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'setup') {
      // Generate new secret
      const secret = authenticator.generateSecret();

      // Get user email for the authenticator label
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { email: true },
      });

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Generate OTP auth URL for QR code
      const otpAuthUrl = authenticator.keyuri(
        user.email,
        'AGI-Sales-Funnels-Sakaduki',
        secret
      );

      // Store secret temporarily (not enabled yet)
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          twoFactorSecret: secret,
        },
      });

      return NextResponse.json({
        secret,
        otpAuthUrl,
      });
    }

    if (action === 'verify') {
      const verifySchema = z.object({
        token: z.string().length(6),
      });

      const { token } = verifySchema.parse(body);

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          twoFactorSecret: true,
        },
      });

      if (!user?.twoFactorSecret) {
        return NextResponse.json(
          { error: '2FA setup not initiated' },
          { status: 400 }
        );
      }

      // Verify the token
      const isValid = authenticator.verify({
        token,
        secret: user.twoFactorSecret,
      });

      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid verification code' },
          { status: 400 }
        );
      }

      // Generate backup codes
      const backupCodes = generateBackupCodes();
      // TODO: Store hashed backup codes in database when backup codes table is added
      // const hashedBackupCodes = backupCodes.map(code =>
      //   crypto.createHash('sha256').update(code).digest('hex')
      // );

      // Enable 2FA
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          twoFactorEnabled: true,
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          actorId: session.user.id,
          actorType: 'USER',
          action: '2fa.enable',
          entityType: 'User',
          entityId: session.user.id,
          metadata: { backupCodesCount: backupCodes.length },
        },
      });

      return NextResponse.json({
        success: true,
        backupCodes,
        message: 'Two-factor authentication enabled successfully',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error with 2FA:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Disable 2FA
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const schema = z.object({
      password: z.string().min(1),
    });

    const { password: _password } = schema.parse(body);

    // TODO: Verify password with bcrypt when implementing full password verification
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        passwordHash: true,
        twoFactorEnabled: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.twoFactorEnabled) {
      return NextResponse.json(
        { error: '2FA is not enabled' },
        { status: 400 }
      );
    }

    // For now, we'll skip password verification in dev mode
    // In production, you would verify the password here

    // Disable 2FA
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        actorType: 'USER',
        action: '2fa.disable',
        entityType: 'User',
        entityId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Two-factor authentication disabled',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error disabling 2FA:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
