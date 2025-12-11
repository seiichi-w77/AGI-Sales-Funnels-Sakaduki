import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';

// Mock storage for pages (in production, use database)
const pagesStore = new Map<string, unknown>();

// GET /api/pages - List all pages
export async function GET(request: Request) {
  try {
    const _session = await auth();
    // In production, check session

    const { searchParams } = new URL(request.url);
    const _workspaceId = searchParams.get('workspaceId');

    // Get all pages from store
    const pages = Array.from(pagesStore.values());

    return NextResponse.json({
      pages,
      total: pages.length,
    });
  } catch (error) {
    console.error('Failed to fetch pages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pages' },
      { status: 500 }
    );
  }
}

// POST /api/pages - Create a new page
export async function POST(request: Request) {
  try {
    const _session = await auth();
    // In production, check session

    const body = await request.json();
    const { name, slug, type = 'standard', sections = [] } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Page name is required' },
        { status: 400 }
      );
    }

    const pageId = crypto.randomUUID();
    const now = new Date().toISOString();

    const page = {
      id: pageId,
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      type,
      sections,
      seo: {
        title: name,
        metaDescription: '',
      },
      settings: {},
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    };

    pagesStore.set(pageId, page);

    return NextResponse.json({ page }, { status: 201 });
  } catch (error) {
    console.error('Failed to create page:', error);
    return NextResponse.json(
      { error: 'Failed to create page' },
      { status: 500 }
    );
  }
}
