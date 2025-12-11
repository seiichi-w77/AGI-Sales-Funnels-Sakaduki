'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageEditor } from '@/components/page-editor';
import { Page } from '@/lib/stores/page-editor-store';
import { Loader2 } from 'lucide-react';

// Demo page data for testing
const demoPage: Page = {
  id: 'demo-page-1',
  name: 'Demo Landing Page',
  slug: 'demo-landing-page',
  type: 'landing-page',
  sections: [],
  seo: {
    title: 'Demo Landing Page',
    metaDescription: 'A demo landing page created with the page editor',
  },
  settings: {},
  status: 'draft',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function PageEditorPage() {
  const params = useParams();
  const router = useRouter();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pageId = params.pageId as string;

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      setError(null);

      try {
        // For demo purposes, use demo page if pageId is 'new' or 'demo'
        if (pageId === 'new' || pageId === 'demo') {
          setPage({
            ...demoPage,
            id: pageId === 'new' ? crypto.randomUUID() : 'demo-page-1',
          });
        } else {
          // Fetch from API
          const response = await fetch(`/api/pages/${pageId}`);
          if (response.ok) {
            const data = await response.json();
            setPage(data.page);
          } else if (response.status === 404) {
            // Page not found, create new
            setPage({
              ...demoPage,
              id: pageId,
            });
          } else {
            throw new Error('Failed to load page');
          }
        }
      } catch (err) {
        console.error('Failed to fetch page:', err);
        // Use demo page on error
        setPage({
          ...demoPage,
          id: pageId,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [pageId]);

  const handleSave = async (updatedPage: Page) => {
    try {
      const response = await fetch(`/api/pages/${updatedPage.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPage),
      });

      if (!response.ok) {
        throw new Error('Failed to save page');
      }

      // Update local state
      setPage(updatedPage);
    } catch (err) {
      console.error('Save failed:', err);
      // Continue without throwing - auto-save should be non-blocking
    }
  };

  const handlePublish = async (updatedPage: Page) => {
    try {
      const response = await fetch(`/api/pages/${updatedPage.id}/publish`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to publish page');
      }

      // Update local state
      setPage({
        ...updatedPage,
        status: 'published',
        publishedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Publish failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading page editor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="text-primary hover:underline"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <PageEditor
      page={page || undefined}
      onSave={handleSave}
      onPublish={handlePublish}
    />
  );
}
