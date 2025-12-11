'use client';

import { useEditorStore } from '@/lib/stores/editor-store';
import { Button } from '@/components/ui/button';
import {
  Undo,
  Redo,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Save,
  Settings,
} from 'lucide-react';
export function EditorToolbar() {
  const { device, setDevice, undo, redo, historyIndex, history } = useEditorStore();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="h-14 border-b bg-card flex items-center justify-between px-4">
      {/* Left - Undo/Redo */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" disabled={!canUndo} onClick={undo}>
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" disabled={!canRedo} onClick={redo}>
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Center - Device Preview */}
      <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
        <Button
          variant={device === 'desktop' ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => setDevice('desktop')}
        >
          <Monitor className="h-4 w-4" />
        </Button>
        <Button
          variant={device === 'tablet' ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => setDevice('tablet')}
        >
          <Tablet className="h-4 w-4" />
        </Button>
        <Button
          variant={device === 'mobile' ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => setDevice('mobile')}
        >
          <Smartphone className="h-4 w-4" />
        </Button>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="outline">
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  );
}
