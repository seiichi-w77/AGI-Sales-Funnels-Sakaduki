'use client';

import { usePageEditorStore, Page } from '@/lib/stores/page-editor-store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Undo2,
  Redo2,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  EyeOff,
  Save,
  Globe,
  Settings,
  PanelLeft,
  PanelRight,
  MoreVertical,
  Code,
  Download,
  Upload,
  Trash2,
  Copy,
} from 'lucide-react';

interface PageEditorToolbarProps {
  onSave?: (page: Page) => Promise<void>;
  onPublish?: (page: Page) => Promise<void>;
}

export function PageEditorToolbar({ onSave, onPublish }: PageEditorToolbarProps) {
  const {
    device,
    setDevice,
    undo,
    redo,
    historyIndex,
    history,
    isDirty,
    isSaving,
    page,
    showLeftPanel,
    showRightPanel,
    toggleLeftPanel,
    toggleRightPanel,
    isPreviewMode,
    togglePreviewMode,
    savePage,
  } = usePageEditorStore();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleSave = async () => {
    if (onSave && page) {
      await onSave(page);
    } else {
      await savePage();
    }
  };

  const handlePublish = async () => {
    if (onPublish && page) {
      await onPublish(page);
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="h-14 border-b bg-card flex items-center justify-between px-4">
        {/* Left Section - Undo/Redo & Panel Toggles */}
        <div className="flex items-center gap-2">
          {/* Panel Toggles */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showLeftPanel ? 'secondary' : 'ghost'}
                size="icon"
                onClick={toggleLeftPanel}
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Elements Panel</TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Undo/Redo */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={!canUndo}
                onClick={undo}
              >
                <Undo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={!canRedo}
                onClick={redo}
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo (Ctrl+Shift+Z)</TooltipContent>
          </Tooltip>
        </div>

        {/* Center Section - Device Preview */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={device === 'desktop' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setDevice('desktop')}
              >
                <Monitor className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Desktop View</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={device === 'tablet' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setDevice('tablet')}
              >
                <Tablet className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Tablet View (768px)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={device === 'mobile' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setDevice('mobile')}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Mobile View (375px)</TooltipContent>
          </Tooltip>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2">
          {/* More Options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Code className="h-4 w-4 mr-2" />
                View Code
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate Page
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Export
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Page
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Page Settings</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showRightPanel ? 'secondary' : 'ghost'}
                size="icon"
                onClick={toggleRightPanel}
              >
                <PanelRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Properties Panel</TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Preview */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isPreviewMode ? 'secondary' : 'outline'}
                onClick={togglePreviewMode}
              >
                {isPreviewMode ? (
                  <EyeOff className="h-4 w-4 mr-2" />
                ) : (
                  <Eye className="h-4 w-4 mr-2" />
                )}
                {isPreviewMode ? 'Edit' : 'Preview'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isPreviewMode ? 'Exit Preview Mode' : 'Preview Page'}
            </TooltipContent>
          </Tooltip>

          {/* Save */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={isSaving || !isDirty}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save (Ctrl+S)</TooltipContent>
          </Tooltip>

          {/* Publish */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handlePublish}>
                <Globe className="h-4 w-4 mr-2" />
                Publish
              </Button>
            </TooltipTrigger>
            <TooltipContent>Publish Page</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
