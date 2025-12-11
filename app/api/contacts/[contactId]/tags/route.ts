import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { triggerTagAdded, triggerTagRemoved } from '@/lib/workflows/triggers';

const addTagsSchema = z.object({
  tags: z.array(z.string()),
});

const removeTagsSchema = z.object({
  tags: z.array(z.string()),
});

// GET /api/contacts/[contactId]/tags - タグ取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ contactId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { contactId } = await params;

  try {
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
      select: { tags: true },
    });

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json({ tags: contact.tags });
  } catch (error) {
    console.error('Get contact tags error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/contacts/[contactId]/tags - タグ追加
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ contactId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { contactId } = await params;

  try {
    const body = await request.json();
    const parsed = addTagsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    const currentTags = contact.tags || [];
    const newTags = parsed.data.tags.filter((t) => !currentTags.includes(t));
    const allTags = Array.from(new Set([...currentTags, ...parsed.data.tags]));

    const updatedContact = await prisma.contact.update({
      where: { id: contactId },
      data: { tags: allTags },
    });

    // 新しく追加されたタグごとにワークフロートリガー
    for (const tag of newTags) {
      await triggerTagAdded(contact.workspaceId, contactId, tag);

      // アクティビティログ
      await prisma.contactActivity.create({
        data: {
          contactId,
          type: 'tag_added',
          description: 'Tag added: ' + tag,
          metadata: { tag },
        },
      });
    }

    return NextResponse.json({ tags: updatedContact.tags, addedTags: newTags });
  } catch (error) {
    console.error('Add contact tags error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/contacts/[contactId]/tags - タグ削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ contactId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { contactId } = await params;

  try {
    const body = await request.json();
    const parsed = removeTagsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    const currentTags = contact.tags || [];
    const removedTags = parsed.data.tags.filter((t) => currentTags.includes(t));
    const remainingTags = currentTags.filter((t) => !parsed.data.tags.includes(t));

    const updatedContact = await prisma.contact.update({
      where: { id: contactId },
      data: { tags: remainingTags },
    });

    // 削除されたタグごとにワークフロートリガー
    for (const tag of removedTags) {
      await triggerTagRemoved(contact.workspaceId, contactId, tag);

      // アクティビティログ
      await prisma.contactActivity.create({
        data: {
          contactId,
          type: 'tag_removed',
          description: 'Tag removed: ' + tag,
          metadata: { tag },
        },
      });
    }

    return NextResponse.json({ tags: updatedContact.tags, removedTags });
  } catch (error) {
    console.error('Remove contact tags error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
