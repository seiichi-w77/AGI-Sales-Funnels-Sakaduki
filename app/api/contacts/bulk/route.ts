import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { triggerTagAdded, triggerTagRemoved } from '@/lib/workflows/triggers';
import { Prisma } from '@prisma/client';

const bulkAddTagsSchema = z.object({
  workspaceId: z.string(),
  contactIds: z.array(z.string()),
  tags: z.array(z.string()),
});

const bulkRemoveTagsSchema = z.object({
  workspaceId: z.string(),
  contactIds: z.array(z.string()),
  tags: z.array(z.string()),
});

const bulkDeleteSchema = z.object({
  workspaceId: z.string(),
  contactIds: z.array(z.string()),
  permanent: z.boolean().optional(),
});

const bulkUpdateSchema = z.object({
  workspaceId: z.string(),
  contactIds: z.array(z.string()),
  data: z.object({
    status: z.enum(['ACTIVE', 'UNSUBSCRIBED', 'BOUNCED', 'COMPLAINED', 'ARCHIVED']).optional(),
    source: z.string().optional(),
  }),
});

// POST /api/contacts/bulk - バルクアクション
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');

  try {
    const body = await request.json();

    switch (action) {
      case 'addTags': {
        const parsed = bulkAddTagsSchema.safeParse(body);
        if (!parsed.success) {
          return NextResponse.json(
            { error: 'Invalid input', details: parsed.error.flatten() },
            { status: 400 }
          );
        }

        const contacts = await prisma.contact.findMany({
          where: {
            id: { in: parsed.data.contactIds },
            workspaceId: parsed.data.workspaceId,
          },
        });

        let updated = 0;
        for (const contact of contacts) {
          const currentTags = contact.tags || [];
          const newTags = Array.from(new Set([...currentTags, ...parsed.data.tags]));
          const addedTags = parsed.data.tags.filter((t) => !currentTags.includes(t));

          if (addedTags.length > 0) {
            await prisma.contact.update({
              where: { id: contact.id },
              data: { tags: newTags },
            });

            for (const tag of addedTags) {
              await triggerTagAdded(contact.workspaceId, contact.id, tag);
            }
            updated++;
          }
        }

        await prisma.auditLog.create({
          data: {
            workspaceId: parsed.data.workspaceId,
            actorId: session.user?.id,
            actorType: 'USER',
            action: 'contacts.bulk_add_tags',
            entityType: 'Contact',
            metadata: {
              contactCount: contacts.length,
              tags: parsed.data.tags,
            },
          },
        });

        return NextResponse.json({ success: true, updated });
      }

      case 'removeTags': {
        const parsed = bulkRemoveTagsSchema.safeParse(body);
        if (!parsed.success) {
          return NextResponse.json(
            { error: 'Invalid input', details: parsed.error.flatten() },
            { status: 400 }
          );
        }

        const contacts = await prisma.contact.findMany({
          where: {
            id: { in: parsed.data.contactIds },
            workspaceId: parsed.data.workspaceId,
          },
        });

        let updated = 0;
        for (const contact of contacts) {
          const currentTags = contact.tags || [];
          const removedTags = parsed.data.tags.filter((t) => currentTags.includes(t));
          const remainingTags = currentTags.filter((t) => !parsed.data.tags.includes(t));

          if (removedTags.length > 0) {
            await prisma.contact.update({
              where: { id: contact.id },
              data: { tags: remainingTags },
            });

            for (const tag of removedTags) {
              await triggerTagRemoved(contact.workspaceId, contact.id, tag);
            }
            updated++;
          }
        }

        await prisma.auditLog.create({
          data: {
            workspaceId: parsed.data.workspaceId,
            actorId: session.user?.id,
            actorType: 'USER',
            action: 'contacts.bulk_remove_tags',
            entityType: 'Contact',
            metadata: {
              contactCount: contacts.length,
              tags: parsed.data.tags,
            },
          },
        });

        return NextResponse.json({ success: true, updated });
      }

      case 'delete': {
        const parsed = bulkDeleteSchema.safeParse(body);
        if (!parsed.success) {
          return NextResponse.json(
            { error: 'Invalid input', details: parsed.error.flatten() },
            { status: 400 }
          );
        }

        if (parsed.data.permanent) {
          await prisma.contact.deleteMany({
            where: {
              id: { in: parsed.data.contactIds },
              workspaceId: parsed.data.workspaceId,
            },
          });
        } else {
          await prisma.contact.updateMany({
            where: {
              id: { in: parsed.data.contactIds },
              workspaceId: parsed.data.workspaceId,
            },
            data: { status: 'ARCHIVED' },
          });
        }

        await prisma.auditLog.create({
          data: {
            workspaceId: parsed.data.workspaceId,
            actorId: session.user?.id,
            actorType: 'USER',
            action: parsed.data.permanent ? 'contacts.bulk_delete' : 'contacts.bulk_archive',
            entityType: 'Contact',
            metadata: {
              contactIds: parsed.data.contactIds,
              count: parsed.data.contactIds.length,
            },
          },
        });

        return NextResponse.json({ success: true, deleted: parsed.data.contactIds.length });
      }

      case 'update': {
        const parsed = bulkUpdateSchema.safeParse(body);
        if (!parsed.success) {
          return NextResponse.json(
            { error: 'Invalid input', details: parsed.error.flatten() },
            { status: 400 }
          );
        }

        const result = await prisma.contact.updateMany({
          where: {
            id: { in: parsed.data.contactIds },
            workspaceId: parsed.data.workspaceId,
          },
          data: parsed.data.data as Prisma.ContactUpdateManyMutationInput,
        });

        await prisma.auditLog.create({
          data: {
            workspaceId: parsed.data.workspaceId,
            actorId: session.user?.id,
            actorType: 'USER',
            action: 'contacts.bulk_update',
            entityType: 'Contact',
            metadata: {
              contactIds: parsed.data.contactIds,
              updates: parsed.data.data,
            },
          },
        });

        return NextResponse.json({ success: true, updated: result.count });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Valid actions: addTags, removeTags, delete, update' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Bulk action error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
