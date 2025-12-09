'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import {
  Monitor,
  Tablet,
  Smartphone,
  Undo2,
  Redo2,
  Eye,
  Save,
  Settings,
  ZoomIn,
  ZoomOut,
  Layers,
} from 'lucide-react'

interface EditorToolbarProps {
  devicePreview: 'desktop' | 'tablet' | 'mobile'
  onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void
  onUndo: () => void
  onRedo: () => void
  onPreview: () => void
  onSave: () => void
  canUndo: boolean
  canRedo: boolean
  isSaving: boolean
  zoom: number
  onZoomChange: (zoom: number) => void
}

export function EditorToolbar({
  devicePreview,
  onDeviceChange,
  onUndo,
  onRedo,
  onPreview,
  onSave,
  canUndo,
  canRedo,
  isSaving,
  zoom,
  onZoomChange,
}: EditorToolbarProps) {
  return (
    <div className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4">
      {/* Left: Device Preview */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${devicePreview === 'desktop' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
          onClick={() => onDeviceChange('desktop')}
        >
          <Monitor className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${devicePreview === 'tablet' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
          onClick={() => onDeviceChange('tablet')}
        >
          <Tablet className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${devicePreview === 'mobile' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
          onClick={() => onDeviceChange('mobile')}
        >
          <Smartphone className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-slate-700 mx-2" />

        {/* Zoom Controls */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-400 hover:text-white"
          onClick={() => onZoomChange(Math.max(50, zoom - 10))}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-sm text-slate-400 w-12 text-center">{zoom}%</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-400 hover:text-white"
          onClick={() => onZoomChange(Math.min(150, zoom + 10))}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      {/* Center: Undo/Redo */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-400 hover:text-white disabled:opacity-50"
          onClick={onUndo}
          disabled={!canUndo}
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-400 hover:text-white disabled:opacity-50"
          onClick={onRedo}
          disabled={!canRedo}
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-white"
          onClick={onPreview}
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
        <Button
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
          onClick={onSave}
          disabled={isSaving}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  )
}
