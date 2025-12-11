import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { Prisma as _Prisma } from '@prisma/client';

const importContactSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  tags: z.array(z.string()).optional(),
  source: z.string().optional(),
});

const importRequestSchema = z.object({
  workspaceId: z.string(),
  contacts: z.array(importContactSchema),
  skipDuplicates: z.boolean().optional(),
  updateDuplicates: z.boolean().optional(),
});

// POST /api/contacts/import - CSVインポート
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = importRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { workspaceId, contacts, skipDuplicates, updateDuplicates } = parsed.data;

    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as { email: string; error: string }[],
    };

    for (const contactData of contacts) {
      try {
        const existing = await prisma.contact.findUnique({
          where: {
            workspaceId_email: {
              workspaceId,
              email: contactData.email,
            },
          },
        });

        if (existing) {
          if (updateDuplicates) {
            await prisma.contact.update({
              where: { id: existing.id },
              data: {
                firstName: contactData.firstName || existing.firstName,
                lastName: contactData.lastName || existing.lastName,
                phone: contactData.phone || existing.phone,
                company: contactData.company || existing.company,
                jobTitle: contactData.jobTitle || existing.jobTitle,
                tags: contactData.tags
                  ? Array.from(new Set([...existing.tags, ...contactData.tags]))
                  : existing.tags,
              },
            });
            results.updated++;
          } else if (skipDuplicates) {
            results.skipped++;
          } else {
            results.errors.push({
              email: contactData.email,
              error: 'Duplicate email',
            });
          }
        } else {
          await prisma.contact.create({
            data: {
              workspaceId,
              email: contactData.email,
              firstName: contactData.firstName,
              lastName: contactData.lastName,
              phone: contactData.phone,
              company: contactData.company,
              jobTitle: contactData.jobTitle,
              tags: contactData.tags || [],
              source: contactData.source || 'import',
              status: 'ACTIVE',
              ownerId: session.user?.id,
              subscribedAt: new Date(),
            },
          });
          results.created++;
        }
      } catch (error) {
        results.errors.push({
          email: contactData.email,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // 監査ログ
    await prisma.auditLog.create({
      data: {
        workspaceId,
        actorId: session.user?.id,
        actorType: 'USER',
        action: 'contacts.import',
        entityType: 'Contact',
        metadata: {
          total: contacts.length,
          created: results.created,
          updated: results.updated,
          skipped: results.skipped,
          errors: results.errors.length,
        },
      },
    });

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('Import contacts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
