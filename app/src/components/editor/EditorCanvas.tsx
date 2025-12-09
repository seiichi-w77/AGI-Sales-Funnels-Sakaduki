'use client'

import React, { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { EditorElement, ElementType } from './types'
import { ELEMENT_TEMPLATES } from './types'

interface EditorCanvasProps {
  elements: EditorElement[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onUpdate: (elements: EditorElement[]) => void
  devicePreview: 'desktop' | 'tablet' | 'mobile'
}

const deviceWidths = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
}

export function EditorCanvas({
  elements,
  selectedId,
  onSelect,
  onUpdate,
  devicePreview,
}: EditorCanvasProps) {
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent, elementId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverId(elementId)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOverId(null)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent, parentId: string, index: number) => {
      e.preventDefault()
      e.stopPropagation()
      setDragOverId(null)

      const elementType = e.dataTransfer.getData('elementType') as ElementType
      if (!elementType) return

      const template = ELEMENT_TEMPLATES[elementType]
      if (!template) return

      const newElement: EditorElement = {
        ...template,
        id: `${elementType}-${Date.now()}`,
      }

      const updatedElements = addElementToParent(elements, parentId, newElement, index)
      onUpdate(updatedElements)
    },
    [elements, onUpdate]
  )

  const handleCanvasDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOverId(null)

      const elementType = e.dataTransfer.getData('elementType') as ElementType
      if (!elementType) return

      const template = ELEMENT_TEMPLATES[elementType]
      if (!template) return

      const newElement: EditorElement = {
        ...template,
        id: `${elementType}-${Date.now()}`,
      }

      onUpdate([...elements, newElement])
    },
    [elements, onUpdate]
  )

  return (
    <div
      className="flex-1 overflow-auto bg-slate-950 p-8"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleCanvasDrop}
    >
      <div
        className="mx-auto min-h-[600px] bg-slate-900 transition-all duration-300"
        style={{ width: deviceWidths[devicePreview] }}
      >
        {elements.length === 0 ? (
          <div className="flex h-[600px] items-center justify-center border-2 border-dashed border-slate-700">
            <div className="text-center">
              <p className="text-lg text-slate-400">Drag elements here to start building</p>
              <p className="text-sm text-slate-500 mt-2">
                or click on elements in the sidebar
              </p>
            </div>
          </div>
        ) : (
          elements.map((element, index) => (
            <RenderElement
              key={element.id}
              element={element}
              selectedId={selectedId}
              onSelect={onSelect}
              dragOverId={dragOverId}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              index={index}
            />
          ))
        )}
      </div>
    </div>
  )
}

interface RenderElementProps {
  element: EditorElement
  selectedId: string | null
  onSelect: (id: string | null) => void
  dragOverId: string | null
  onDragOver: (e: React.DragEvent, id: string) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, parentId: string, index: number) => void
  index: number
}

function RenderElement({
  element,
  selectedId,
  onSelect,
  dragOverId,
  onDragOver,
  onDragLeave,
  onDrop,
  index,
}: RenderElementProps) {
  const isSelected = selectedId === element.id
  const isDragOver = dragOverId === element.id

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect(element.id)
  }

  const baseClasses = cn(
    'relative transition-all duration-150 cursor-pointer',
    isSelected && 'ring-2 ring-blue-500',
    isDragOver && 'ring-2 ring-green-500 bg-green-500/10'
  )

  // Render based on element type
  switch (element.type) {
    case 'section':
      return (
        <section
          className={baseClasses}
          style={element.styles as React.CSSProperties}
          onClick={handleClick}
          onDragOver={(e) => onDragOver(e, element.id)}
          onDragLeave={onDragLeave}
          onDrop={(e) => onDrop(e, element.id, element.children?.length || 0)}
        >
          {isSelected && <ElementLabel type="Section" />}
          {element.children?.map((child, idx) => (
            <RenderElement
              key={child.id}
              element={child}
              selectedId={selectedId}
              onSelect={onSelect}
              dragOverId={dragOverId}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              index={idx}
            />
          ))}
          {(!element.children || element.children.length === 0) && (
            <div className="p-4 text-center text-slate-500 border border-dashed border-slate-700 m-2">
              Drop elements here
            </div>
          )}
        </section>
      )

    case 'row':
      return (
        <div
          className={baseClasses}
          style={element.styles as React.CSSProperties}
          onClick={handleClick}
          onDragOver={(e) => onDragOver(e, element.id)}
          onDragLeave={onDragLeave}
          onDrop={(e) => onDrop(e, element.id, element.children?.length || 0)}
        >
          {isSelected && <ElementLabel type="Row" />}
          {element.children?.map((child, idx) => (
            <RenderElement
              key={child.id}
              element={child}
              selectedId={selectedId}
              onSelect={onSelect}
              dragOverId={dragOverId}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              index={idx}
            />
          ))}
          {(!element.children || element.children.length === 0) && (
            <div className="p-4 text-center text-slate-500 border border-dashed border-slate-700 flex-1">
              Add columns
            </div>
          )}
        </div>
      )

    case 'column':
      return (
        <div
          className={baseClasses}
          style={element.styles as React.CSSProperties}
          onClick={handleClick}
          onDragOver={(e) => onDragOver(e, element.id)}
          onDragLeave={onDragLeave}
          onDrop={(e) => onDrop(e, element.id, element.children?.length || 0)}
        >
          {isSelected && <ElementLabel type="Column" />}
          {element.children?.map((child, idx) => (
            <RenderElement
              key={child.id}
              element={child}
              selectedId={selectedId}
              onSelect={onSelect}
              dragOverId={dragOverId}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              index={idx}
            />
          ))}
          {(!element.children || element.children.length === 0) && (
            <div className="p-4 text-center text-slate-500 border border-dashed border-slate-700">
              Drop elements here
            </div>
          )}
        </div>
      )

    case 'heading':
      const HeadingTag = (element.content.level || 'h2') as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
      return (
        <div className={baseClasses} onClick={handleClick}>
          {isSelected && <ElementLabel type="Heading" />}
          <HeadingTag style={element.styles as React.CSSProperties}>
            {element.content.text as string}
          </HeadingTag>
        </div>
      )

    case 'text':
      return (
        <div className={baseClasses} onClick={handleClick}>
          {isSelected && <ElementLabel type="Text" />}
          <p style={element.styles as React.CSSProperties}>{element.content.text as string}</p>
        </div>
      )

    case 'image':
      return (
        <div className={baseClasses} onClick={handleClick}>
          {isSelected && <ElementLabel type="Image" />}
          {element.content.src ? (
            <img
              src={element.content.src as string}
              alt={element.content.alt as string}
              style={element.styles as React.CSSProperties}
            />
          ) : (
            <div
              className="flex items-center justify-center bg-slate-800 text-slate-500"
              style={{ ...element.styles, minHeight: '200px' } as React.CSSProperties}
            >
              Click to add image
            </div>
          )}
        </div>
      )

    case 'button':
      return (
        <div className={baseClasses} onClick={handleClick}>
          {isSelected && <ElementLabel type="Button" />}
          <button
            style={element.styles as React.CSSProperties}
            className="hover:opacity-90 transition-opacity"
          >
            {element.content.text as string}
          </button>
        </div>
      )

    case 'divider':
      return (
        <div className={baseClasses} onClick={handleClick}>
          {isSelected && <ElementLabel type="Divider" />}
          <hr style={element.styles as React.CSSProperties} />
        </div>
      )

    case 'spacer':
      return (
        <div
          className={cn(baseClasses, 'bg-slate-800/30')}
          style={element.styles as React.CSSProperties}
          onClick={handleClick}
        >
          {isSelected && <ElementLabel type="Spacer" />}
        </div>
      )

    default:
      return (
        <div className={baseClasses} onClick={handleClick}>
          {isSelected && <ElementLabel type={element.type} />}
          <div className="p-4 text-slate-500">
            {element.type} element
          </div>
        </div>
      )
  }
}

function ElementLabel({ type }: { type: string }) {
  return (
    <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded">
      {type}
    </div>
  )
}

// Helper function to add element to parent
function addElementToParent(
  elements: EditorElement[],
  parentId: string,
  newElement: EditorElement,
  index: number
): EditorElement[] {
  return elements.map((element) => {
    if (element.id === parentId) {
      const children = element.children || []
      const updatedChildren = [
        ...children.slice(0, index),
        newElement,
        ...children.slice(index),
      ]
      return { ...element, children: updatedChildren }
    }
    if (element.children) {
      return {
        ...element,
        children: addElementToParent(element.children, parentId, newElement, index),
      }
    }
    return element
  })
}
