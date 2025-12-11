'use client';

import { useEffect, useCallback } from 'react';
import { usePageEditorStore, Page } from '@/lib/stores/page-editor-store';
import { PageEditorToolbar } from './page-editor-toolbar';
import { PageEditorSidebar } from './page-editor-sidebar';
import { PageEditorCanvas } from './page-editor-canvas';
import { PageEditorProperties } from './page-editor-properties';

interface PageEditorProps {
  page?: Page;
  onSave?: (page: Page) => Promise<void>;
  onPublish?: (page: Page) => Promise<void>;
}

export function PageEditor({ page, onSave, onPublish }: PageEditorProps) {
  const {
    setPage,
    showLeftPanel,
    showRightPanel,
    isPreviewMode,
    isDirty,
    autoSaveEnabled,
    savePage,
    saveToHistory,
    undo,
    redo,
  } = usePageEditorStore();

  // Initialize page
  useEffect(() => {
    if (page) {
      setPage(page);
    }
  }, [page, setPage]);

  // Auto-save
  useEffect(() => {
    if (!autoSaveEnabled || !isDirty) return;

    const timeout = setTimeout(() => {
      if (onSave) {
        const currentPage = usePageEditorStore.getState().page;
        if (currentPage) {
          onSave(currentPage);
        }
      } else {
        savePage();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(timeout);
  }, [isDirty, autoSaveEnabled, onSave, savePage]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Undo: Ctrl/Cmd + Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
      if ((e.ctrlKey || e.metaKey) && (e.key === 'Z' || e.key === 'y')) {
        e.preventDefault();
        redo();
      }

      // Save: Ctrl/Cmd + S
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (onSave) {
          const currentPage = usePageEditorStore.getState().page;
          if (currentPage) {
            onSave(currentPage);
          }
        } else {
          savePage();
        }
      }
    },
    [undo, redo, savePage, onSave]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Save to history on changes
  useEffect(() => {
    if (isDirty) {
      const timeout = setTimeout(saveToHistory, 1000);
      return () => clearTimeout(timeout);
    }
  }, [isDirty, saveToHistory]);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Toolbar */}
      <PageEditorToolbar onSave={onSave} onPublish={onPublish} />

      {/* Main Editor Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Elements Panel */}
        {showLeftPanel && !isPreviewMode && (
          <PageEditorSidebar />
        )}

        {/* Canvas */}
        <PageEditorCanvas />

        {/* Right Sidebar - Properties Panel */}
        {showRightPanel && !isPreviewMode && (
          <PageEditorProperties />
        )}
      </div>

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
}

function StatusBar() {
  const { isDirty, isSaving, lastSaved, page } = usePageEditorStore();

  return (
    <div className="h-8 border-t bg-muted/50 flex items-center justify-between px-4 text-xs text-muted-foreground">
      <div className="flex items-center gap-4">
        <span>
          Status: {page?.status === 'published' ? 'Published' : 'Draft'}
        </span>
        {isDirty && <span className="text-yellow-600">Unsaved changes</span>}
      </div>
      <div className="flex items-center gap-4">
        {isSaving && <span>Saving...</span>}
        {lastSaved && (
          <span>
            Last saved: {new Date(lastSaved).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
}
