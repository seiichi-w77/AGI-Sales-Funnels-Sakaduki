'use client'

import React, { useState, useCallback } from 'react'
import { EditorCanvas } from './EditorCanvas'
import { EditorSidebar } from './EditorSidebar'
import { EditorToolbar } from './EditorToolbar'
import { EditorPropertiesPanel } from './EditorPropertiesPanel'
import type { EditorElement, ElementType } from './types'
import { ELEMENT_TEMPLATES } from './types'

interface FunnelEditorProps {
  initialElements?: EditorElement[]
  onSave?: (elements: EditorElement[]) => Promise<void>
}

export function FunnelEditor({ initialElements = [], onSave }: FunnelEditorProps) {
  const [elements, setElements] = useState<EditorElement[]>(initialElements)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [devicePreview, setDevicePreview] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [history, setHistory] = useState<{ past: EditorElement[][]; future: EditorElement[][] }>({
    past: [],
    future: [],
  })
  const [isSaving, setIsSaving] = useState(false)
  const [zoom, setZoom] = useState(100)

  const selectedElement = selectedId
    ? findElementById(elements, selectedId)
    : null

  // Add element to canvas
  const handleAddElement = useCallback((type: ElementType) => {
    const template = ELEMENT_TEMPLATES[type]
    if (!template) return

    const newElement: EditorElement = {
      ...template,
      id: `${type}-${Date.now()}`,
    }

    setHistory((prev) => ({
      past: [...prev.past, elements],
      future: [],
    }))
    setElements([...elements, newElement])
  }, [elements])

  // Update elements
  const handleUpdateElements = useCallback((updatedElements: EditorElement[]) => {
    setHistory((prev) => ({
      past: [...prev.past, elements],
      future: [],
    }))
    setElements(updatedElements)
  }, [elements])

  // Update single element
  const handleUpdateElement = useCallback((updatedElement: EditorElement) => {
    const updateElement = (elems: EditorElement[]): EditorElement[] => {
      return elems.map((el) => {
        if (el.id === updatedElement.id) {
          return updatedElement
        }
        if (el.children) {
          return { ...el, children: updateElement(el.children) }
        }
        return el
      })
    }

    setHistory((prev) => ({
      past: [...prev.past, elements],
      future: [],
    }))
    setElements(updateElement(elements))
  }, [elements])

  // Delete element
  const handleDeleteElement = useCallback((id: string) => {
    const deleteElement = (elems: EditorElement[]): EditorElement[] => {
      return elems
        .filter((el) => el.id !== id)
        .map((el) => {
          if (el.children) {
            return { ...el, children: deleteElement(el.children) }
          }
          return el
        })
    }

    setHistory((prev) => ({
      past: [...prev.past, elements],
      future: [],
    }))
    setElements(deleteElement(elements))
    setSelectedId(null)
  }, [elements])

  // Duplicate element
  const handleDuplicateElement = useCallback((id: string) => {
    const duplicateElement = (elems: EditorElement[]): EditorElement[] => {
      const result: EditorElement[] = []
      for (const el of elems) {
        result.push(el)
        if (el.id === id) {
          const duplicated = duplicateWithNewIds(el)
          result.push(duplicated)
        }
        if (el.children) {
          el.children = duplicateElement(el.children)
        }
      }
      return result
    }

    setHistory((prev) => ({
      past: [...prev.past, elements],
      future: [],
    }))
    setElements(duplicateElement(elements))
  }, [elements])

  // Move element up
  const handleMoveUp = useCallback((id: string) => {
    const moveUp = (elems: EditorElement[]): EditorElement[] => {
      const index = elems.findIndex((el) => el.id === id)
      if (index > 0) {
        const newElems = [...elems]
        ;[newElems[index - 1], newElems[index]] = [newElems[index], newElems[index - 1]]
        return newElems
      }
      return elems.map((el) => {
        if (el.children) {
          return { ...el, children: moveUp(el.children) }
        }
        return el
      })
    }

    setHistory((prev) => ({
      past: [...prev.past, elements],
      future: [],
    }))
    setElements(moveUp(elements))
  }, [elements])

  // Move element down
  const handleMoveDown = useCallback((id: string) => {
    const moveDown = (elems: EditorElement[]): EditorElement[] => {
      const index = elems.findIndex((el) => el.id === id)
      if (index >= 0 && index < elems.length - 1) {
        const newElems = [...elems]
        ;[newElems[index], newElems[index + 1]] = [newElems[index + 1], newElems[index]]
        return newElems
      }
      return elems.map((el) => {
        if (el.children) {
          return { ...el, children: moveDown(el.children) }
        }
        return el
      })
    }

    setHistory((prev) => ({
      past: [...prev.past, elements],
      future: [],
    }))
    setElements(moveDown(elements))
  }, [elements])

  // Undo
  const handleUndo = useCallback(() => {
    if (history.past.length === 0) return

    const previous = history.past[history.past.length - 1]
    setHistory({
      past: history.past.slice(0, -1),
      future: [elements, ...history.future],
    })
    setElements(previous)
  }, [elements, history])

  // Redo
  const handleRedo = useCallback(() => {
    if (history.future.length === 0) return

    const next = history.future[0]
    setHistory({
      past: [...history.past, elements],
      future: history.future.slice(1),
    })
    setElements(next)
  }, [elements, history])

  // Preview
  const handlePreview = useCallback(() => {
    // Open preview in new window
    const previewWindow = window.open('', '_blank')
    if (previewWindow) {
      const html = generatePreviewHtml(elements)
      previewWindow.document.write(html)
      previewWindow.document.close()
    }
  }, [elements])

  // Save
  const handleSave = useCallback(async () => {
    if (!onSave) return

    setIsSaving(true)
    try {
      await onSave(elements)
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setIsSaving(false)
    }
  }, [elements, onSave])

  return (
    <div className="h-screen flex flex-col bg-slate-950">
      <EditorToolbar
        devicePreview={devicePreview}
        onDeviceChange={setDevicePreview}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onPreview={handlePreview}
        onSave={handleSave}
        canUndo={history.past.length > 0}
        canRedo={history.future.length > 0}
        isSaving={isSaving}
        zoom={zoom}
        onZoomChange={setZoom}
      />
      <div className="flex-1 flex overflow-hidden">
        <EditorSidebar onAddElement={handleAddElement} />
        <EditorCanvas
          elements={elements}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onUpdate={handleUpdateElements}
          devicePreview={devicePreview}
        />
        <EditorPropertiesPanel
          element={selectedElement}
          onUpdate={handleUpdateElement}
          onDelete={handleDeleteElement}
          onDuplicate={handleDuplicateElement}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
        />
      </div>
    </div>
  )
}

// Helper: Find element by ID
function findElementById(
  elements: EditorElement[],
  id: string
): EditorElement | null {
  for (const element of elements) {
    if (element.id === id) return element
    if (element.children) {
      const found = findElementById(element.children, id)
      if (found) return found
    }
  }
  return null
}

// Helper: Duplicate element with new IDs
function duplicateWithNewIds(element: EditorElement): EditorElement {
  return {
    ...element,
    id: `${element.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    children: element.children?.map(duplicateWithNewIds),
  }
}

// Helper: Generate preview HTML
function generatePreviewHtml(elements: EditorElement[]): string {
  const renderElement = (el: EditorElement): string => {
    const style = Object.entries(el.styles)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`)
      .join('; ')

    switch (el.type) {
      case 'section':
        return `<section style="${style}">${el.children?.map(renderElement).join('') || ''}</section>`
      case 'row':
        return `<div style="${style}">${el.children?.map(renderElement).join('') || ''}</div>`
      case 'column':
        return `<div style="${style}">${el.children?.map(renderElement).join('') || ''}</div>`
      case 'heading':
        const tag = el.content.level || 'h2'
        return `<${tag} style="${style}">${el.content.text}</${tag}>`
      case 'text':
        return `<p style="${style}">${el.content.text}</p>`
      case 'image':
        return `<img src="${el.content.src}" alt="${el.content.alt}" style="${style}" />`
      case 'button':
        return `<button style="${style}">${el.content.text}</button>`
      case 'divider':
        return `<hr style="${style}" />`
      case 'spacer':
        return `<div style="${style}"></div>`
      default:
        return ''
    }
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Preview</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: system-ui, sans-serif; background: #0f172a; color: #fff; }
      </style>
    </head>
    <body>
      ${elements.map(renderElement).join('')}
    </body>
    </html>
  `
}
