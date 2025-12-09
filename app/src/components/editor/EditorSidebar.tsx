'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { ELEMENT_CATEGORIES, ELEMENT_TEMPLATES, type ElementType } from './types'
import {
  LayoutGrid,
  Type,
  Image,
  Video,
  MousePointer,
  FormInput,
  Minus,
  Timer,
  MessageSquare,
  DollarSign,
  HelpCircle,
  Layers,
  Code,
  Columns,
  Square,
} from 'lucide-react'

const elementIcons: Record<string, React.ElementType> = {
  section: LayoutGrid,
  row: Columns,
  column: Square,
  heading: Type,
  text: Type,
  image: Image,
  video: Video,
  button: MousePointer,
  form: FormInput,
  input: FormInput,
  select: FormInput,
  checkbox: FormInput,
  divider: Minus,
  spacer: Square,
  countdown: Timer,
  testimonial: MessageSquare,
  pricing: DollarSign,
  faq: HelpCircle,
  popup: Layers,
  html: Code,
}

interface EditorSidebarProps {
  onAddElement: (type: ElementType) => void
}

export function EditorSidebar({ onAddElement }: EditorSidebarProps) {
  const handleDragStart = (e: React.DragEvent, elementType: ElementType) => {
    e.dataTransfer.setData('elementType', elementType)
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 overflow-y-auto">
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-white font-semibold">Elements</h2>
        <p className="text-xs text-slate-400 mt-1">Drag to canvas or click to add</p>
      </div>

      <div className="p-4 space-y-6">
        {ELEMENT_CATEGORIES.map((category) => (
          <div key={category.name}>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              {category.name}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {category.elements.map((elementType) => {
                const Icon = elementIcons[elementType] || Square
                return (
                  <button
                    key={elementType}
                    className={cn(
                      'flex flex-col items-center gap-2 p-3 rounded-lg',
                      'bg-slate-800 hover:bg-slate-700 transition-colors',
                      'text-slate-300 hover:text-white',
                      'cursor-grab active:cursor-grabbing'
                    )}
                    draggable
                    onDragStart={(e) => handleDragStart(e, elementType as ElementType)}
                    onClick={() => onAddElement(elementType as ElementType)}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs capitalize">{elementType}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
