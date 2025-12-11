import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';

// Mock storage for pages (shared with main route)
// In production, use database
const pagesStore = new Map<string, unknown>();

// GET /api/pages/[pageId] - Get a specific page
export async function GET(
  request: Request,
  { params }: { params: { pageId: string } }
) {
  try {
    const _session = await auth();
    const { pageId } = params;

    // Get page from store
    const page = pagesStore.get(pageId);

    if (!page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ page });
  } catch (error) {
    console.error('Failed to fetch page:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page' },
      { status: 500 }
    );
  }
}

// PUT /api/pages/[pageId] - Update a page
export async function PUT(
  request: Request,
  { params }: { params: { pageId: string } }
) {
  try {
    const _session = await auth();
    const { pageId } = params;
    const body = await request.json();

    // Get existing page or create new one
    let page = pagesStore.get(pageId) as Record<string, unknown> | undefined;

    if (!page) {
      // Create new page if it doesn't exist
      page = {
        id: pageId,
        createdAt: new Date().toISOString(),
      };
    }

    // Update page
    const updatedPage = {
      ...page,
      ...body,
      id: pageId,
      updatedAt: new Date().toISOString(),
    };

    pagesStore.set(pageId, updatedPage);

    return NextResponse.json({ page: updatedPage });
  } catch (error) {
    console.error('Failed to update page:', error);
    return NextResponse.json(
      { error: 'Failed to update page' },
      { status: 500 }
    );
  }
}

// DELETE /api/pages/[pageId] - Delete a page
export async function DELETE(
  request: Request,
  { params }: { params: { pageId: string } }
) {
  try {
    const _session = await auth();
    const { pageId } = params;

    if (!pagesStore.has(pageId)) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    pagesStore.delete(pageId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete page:', error);
    return NextResponse.json(
      { error: 'Failed to delete page' },
      { status: 500 }
    );
  }
}
