'use client'

import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import type { EditorElement } from './types'
import { Trash2, Copy, MoveUp, MoveDown } from 'lucide-react'

interface EditorPropertiesPanelProps {
  element: EditorElement | null
  onUpdate: (element: EditorElement) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
}

export function EditorPropertiesPanel({
  element,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}: EditorPropertiesPanelProps) {
  if (!element) {
    return (
      <div className="w-80 bg-slate-900 border-l border-slate-800 p-4">
        <div className="text-center text-slate-500 mt-20">
          <p>Select an element to edit</p>
        </div>
      </div>
    )
  }

  const updateContent = (key: string, value: unknown) => {
    onUpdate({
      ...element,
      content: { ...element.content, [key]: value },
    })
  }

  const updateStyle = (key: string, value: string) => {
    onUpdate({
      ...element,
      styles: { ...element.styles, [key]: value },
    })
  }

  const updateSetting = (key: string, value: unknown) => {
    onUpdate({
      ...element,
      settings: { ...element.settings, [key]: value },
    })
  }

  return (
    <div className="w-80 bg-slate-900 border-l border-slate-800 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold capitalize">{element.type}</h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-white"
              onClick={() => onMoveUp(element.id)}
            >
              <MoveUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-white"
              onClick={() => onMoveDown(element.id)}
            >
              <MoveDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-white"
              onClick={() => onDuplicate(element.id)}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-400 hover:text-red-300"
              onClick={() => onDelete(element.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="w-full bg-slate-800 p-1">
          <TabsTrigger value="content" className="flex-1 data-[state=active]:bg-slate-700">
            Content
          </TabsTrigger>
          <TabsTrigger value="style" className="flex-1 data-[state=active]:bg-slate-700">
            Style
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-1 data-[state=active]:bg-slate-700">
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="p-4 space-y-4">
          {element.type === 'heading' && (
            <>
              <div className="space-y-2">
                <Label className="text-white">Text</Label>
                <Input
                  value={(element.content.text as string) || ''}
                  onChange={(e) => updateContent('text', e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Heading Level</Label>
                <select
                  value={(element.content.level as string) || 'h2'}
                  onChange={(e) => updateContent('level', e.target.value)}
                  className="w-full rounded-md bg-slate-800 border border-slate-700 text-white px-3 py-2"
                >
                  <option value="h1">H1</option>
                  <option value="h2">H2</option>
                  <option value="h3">H3</option>
                  <option value="h4">H4</option>
                  <option value="h5">H5</option>
                  <option value="h6">H6</option>
                </select>
              </div>
            </>
          )}

          {element.type === 'text' && (
            <div className="space-y-2">
              <Label className="text-white">Text</Label>
              <textarea
                value={(element.content.text as string) || ''}
                onChange={(e) => updateContent('text', e.target.value)}
                className="w-full h-32 rounded-md bg-slate-800 border border-slate-700 text-white px-3 py-2 resize-none"
              />
            </div>
          )}

          {element.type === 'image' && (
            <>
              <div className="space-y-2">
                <Label className="text-white">Image URL</Label>
                <Input
                  value={(element.content.src as string) || ''}
                  onChange={(e) => updateContent('src', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Alt Text</Label>
                <Input
                  value={(element.content.alt as string) || ''}
                  onChange={(e) => updateContent('alt', e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </>
          )}

          {element.type === 'button' && (
            <div className="space-y-2">
              <Label className="text-white">Button Text</Label>
              <Input
                value={(element.content.text as string) || ''}
                onChange={(e) => updateContent('text', e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          )}

          {element.type === 'video' && (
            <div className="space-y-2">
              <Label className="text-white">Video URL</Label>
              <Input
                value={(element.content.url as string) || ''}
                onChange={(e) => updateContent('url', e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          )}
        </TabsContent>

        {/* Style Tab */}
        <TabsContent value="style" className="p-4 space-y-4">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-400">Layout</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">Width</Label>
                <Input
                  value={element.styles.width || ''}
                  onChange={(e) => updateStyle('width', e.target.value)}
                  placeholder="100%"
                  className="bg-slate-800 border-slate-700 text-white text-sm h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">Height</Label>
                <Input
                  value={element.styles.height || ''}
                  onChange={(e) => updateStyle('height', e.target.value)}
                  placeholder="auto"
                  className="bg-slate-800 border-slate-700 text-white text-sm h-8"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">Padding</Label>
                <Input
                  value={element.styles.padding || ''}
                  onChange={(e) => updateStyle('padding', e.target.value)}
                  placeholder="16px"
                  className="bg-slate-800 border-slate-700 text-white text-sm h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">Margin</Label>
                <Input
                  value={element.styles.margin || ''}
                  onChange={(e) => updateStyle('margin', e.target.value)}
                  placeholder="0"
                  className="bg-slate-800 border-slate-700 text-white text-sm h-8"
                />
              </div>
            </div>
          </div>

          <Separator className="bg-slate-800" />

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-400">Colors</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">Background</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={element.styles.backgroundColor || '#000000'}
                    onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                    className="h-8 w-8 rounded cursor-pointer"
                  />
                  <Input
                    value={element.styles.backgroundColor || ''}
                    onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                    placeholder="#000000"
                    className="flex-1 bg-slate-800 border-slate-700 text-white text-sm h-8"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">Text Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={element.styles.color || '#ffffff'}
                    onChange={(e) => updateStyle('color', e.target.value)}
                    className="h-8 w-8 rounded cursor-pointer"
                  />
                  <Input
                    value={element.styles.color || ''}
                    onChange={(e) => updateStyle('color', e.target.value)}
                    placeholder="#ffffff"
                    className="flex-1 bg-slate-800 border-slate-700 text-white text-sm h-8"
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-slate-800" />

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-400">Typography</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">Font Size</Label>
                <Input
                  value={element.styles.fontSize || ''}
                  onChange={(e) => updateStyle('fontSize', e.target.value)}
                  placeholder="16px"
                  className="bg-slate-800 border-slate-700 text-white text-sm h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">Font Weight</Label>
                <select
                  value={element.styles.fontWeight || '400'}
                  onChange={(e) => updateStyle('fontWeight', e.target.value)}
                  className="w-full rounded-md bg-slate-800 border border-slate-700 text-white px-3 py-1 text-sm h-8"
                >
                  <option value="300">Light</option>
                  <option value="400">Normal</option>
                  <option value="500">Medium</option>
                  <option value="600">Semibold</option>
                  <option value="700">Bold</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-500">Text Align</Label>
              <div className="flex gap-1">
                {['left', 'center', 'right'].map((align) => (
                  <button
                    key={align}
                    onClick={() => updateStyle('textAlign', align)}
                    className={`flex-1 py-1.5 rounded text-sm capitalize ${
                      element.styles.textAlign === align
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Separator className="bg-slate-800" />

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-400">Border</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">Border Radius</Label>
                <Input
                  value={element.styles.borderRadius || ''}
                  onChange={(e) => updateStyle('borderRadius', e.target.value)}
                  placeholder="8px"
                  className="bg-slate-800 border-slate-700 text-white text-sm h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">Border Width</Label>
                <Input
                  value={element.styles.borderWidth || ''}
                  onChange={(e) => updateStyle('borderWidth', e.target.value)}
                  placeholder="1px"
                  className="bg-slate-800 border-slate-700 text-white text-sm h-8"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="p-4 space-y-4">
          {element.type === 'button' && (
            <>
              <div className="space-y-2">
                <Label className="text-white">Link URL</Label>
                <Input
                  value={(element.settings.link as string) || ''}
                  onChange={(e) => updateSetting('link', e.target.value)}
                  placeholder="https://example.com"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Action</Label>
                <select
                  value={(element.settings.action as string) || 'link'}
                  onChange={(e) => updateSetting('action', e.target.value)}
                  className="w-full rounded-md bg-slate-800 border border-slate-700 text-white px-3 py-2"
                >
                  <option value="link">Go to URL</option>
                  <option value="scroll">Scroll to Section</option>
                  <option value="popup">Open Popup</option>
                  <option value="submit">Submit Form</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="newTab"
                  checked={(element.settings.openInNewTab as boolean) || false}
                  onChange={(e) => updateSetting('openInNewTab', e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700"
                />
                <Label htmlFor="newTab" className="text-white text-sm">
                  Open in new tab
                </Label>
              </div>
            </>
          )}

          {element.type === 'image' && (
            <div className="space-y-2">
              <Label className="text-white">Link URL</Label>
              <Input
                value={(element.settings.link as string) || ''}
                onChange={(e) => updateSetting('link', e.target.value)}
                placeholder="https://example.com"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          )}

          {element.type === 'video' && (
            <>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoplay"
                  checked={(element.settings.autoplay as boolean) || false}
                  onChange={(e) => updateSetting('autoplay', e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700"
                />
                <Label htmlFor="autoplay" className="text-white text-sm">
                  Autoplay
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="controls"
                  checked={(element.settings.controls as boolean) !== false}
                  onChange={(e) => updateSetting('controls', e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700"
                />
                <Label htmlFor="controls" className="text-white text-sm">
                  Show Controls
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="loop"
                  checked={(element.settings.loop as boolean) || false}
                  onChange={(e) => updateSetting('loop', e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700"
                />
                <Label htmlFor="loop" className="text-white text-sm">
                  Loop
                </Label>
              </div>
            </>
          )}

          {!['button', 'image', 'video'].includes(element.type) && (
            <div className="text-center text-slate-500 mt-8">
              <p>No settings for this element</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
