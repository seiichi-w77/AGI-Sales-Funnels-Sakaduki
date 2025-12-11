import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { Prisma, ContactStatus } from '@prisma/client';

// GET /api/contacts/export - CSVエクスポート
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const workspaceId = searchParams.get('workspaceId');
  const status = searchParams.get('status');
  const tags = searchParams.get('tags');
  const format = searchParams.get('format') || 'csv';

  if (!workspaceId) {
    return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 });
  }

  try {
    const where: Prisma.ContactWhereInput = { workspaceId };

    if (status) {
      where.status = status as ContactStatus;
    }

    if (tags) {
      const tagList = tags.split(',').map((t) => t.trim());
      where.tags = { hasSome: tagList };
    }

    const contacts = await prisma.contact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    if (format === 'json') {
      // 監査ログ
      await prisma.auditLog.create({
        data: {
          workspaceId,
          actorId: session.user?.id,
          actorType: 'USER',
          action: 'contacts.export',
          entityType: 'Contact',
          metadata: { format: 'json', count: contacts.length },
        },
      });

      return NextResponse.json({ contacts });
    }

    // CSV形式
    const headers = [
      'email',
      'firstName',
      'lastName',
      'phone',
      'company',
      'jobTitle',
      'status',
      'tags',
      'source',
      'score',
      'createdAt',
      'lastActivityAt',
    ];

    const csvRows = [headers.join(',')];

    for (const contact of contacts) {
      const row = [
        escapeCSV(contact.email),
        escapeCSV(contact.firstName || ''),
        escapeCSV(contact.lastName || ''),
        escapeCSV(contact.phone || ''),
        escapeCSV(contact.company || ''),
        escapeCSV(contact.jobTitle || ''),
        contact.status,
        escapeCSV(contact.tags.join(';')),
        escapeCSV(contact.source || ''),
        contact.score.toString(),
        contact.createdAt.toISOString(),
        contact.lastActivityAt?.toISOString() || '',
      ];
      csvRows.push(row.join(','));
    }

    const csvContent = csvRows.join('\n');

    // 監査ログ
    await prisma.auditLog.create({
      data: {
        workspaceId,
        actorId: session.user?.id,
        actorType: 'USER',
        action: 'contacts.export',
        entityType: 'Contact',
        metadata: { format: 'csv', count: contacts.length },
      },
    });

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="contacts.csv"',
      },
    });
  } catch (error) {
    console.error('Export contacts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}
