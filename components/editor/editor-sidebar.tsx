'use client';

import { useEditorStore, ElementType } from '@/lib/stores/editor-store';
import { cn } from '@/lib/utils';
import {
  Heading,
  Type,
  Image,
  Video,
  MousePointer2,
  LayoutGrid,
  Columns,
  Square,
  Minus,
  FormInput,
} from 'lucide-react';

const elements = [
  { type: 'section' as const, label: 'Section', icon: LayoutGrid },
  { type: 'row' as const, label: 'Row', icon: Columns },
  { type: 'column' as const, label: 'Column', icon: Square },
  { type: 'headline' as const, label: 'Headline', icon: Heading },
  { type: 'text' as const, label: 'Text', icon: Type },
  { type: 'image' as const, label: 'Image', icon: Image },
  { type: 'video' as const, label: 'Video', icon: Video },
  { type: 'button' as const, label: 'Button', icon: MousePointer2 },
  { type: 'divider' as const, label: 'Divider', icon: Minus },
  { type: 'input' as const, label: 'Input', icon: FormInput },
];

export function EditorSidebar() {
  const { addElement, selectedId } = useEditorStore();

  const handleAddElement = (type: ElementType) => {
    const newElement = {
      id: crypto.randomUUID(),
      type,
      content: getDefaultContent(type),
      styles: {},
      children: type === 'section' || type === 'row' || type === 'column' ? [] : undefined,
    };

    addElement(newElement, selectedId || undefined);
  };

  return (
    <div className="w-64 border-r bg-card overflow-y-auto">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Elements</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Drag or click to add
        </p>
      </div>

      <div className="p-4">
        <h4 className="text-xs font-medium text-muted-foreground uppercase mb-3">
          Layout
        </h4>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {elements.slice(0, 3).map((el) => (
            <ElementButton
              key={el.type}
              {...el}
              onClick={() => handleAddElement(el.type)}
            />
          ))}
        </div>

        <h4 className="text-xs font-medium text-muted-foreground uppercase mb-3">
          Content
        </h4>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {elements.slice(3, 7).map((el) => (
            <ElementButton
              key={el.type}
              {...el}
              onClick={() => handleAddElement(el.type)}
            />
          ))}
        </div>

        <h4 className="text-xs font-medium text-muted-foreground uppercase mb-3">
          Form
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {elements.slice(7).map((el) => (
            <ElementButton
              key={el.type}
              {...el}
              onClick={() => handleAddElement(el.type)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ElementButton({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: React.ElementType;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center p-3 rounded-lg border',
        'hover:bg-accent hover:border-primary transition-colors',
        'cursor-pointer'
      )}
    >
      <Icon className="h-5 w-5 mb-1" />
      <span className="text-xs">{label}</span>
    </button>
  );
}

function getDefaultContent(type: ElementType): string | undefined {
  switch (type) {
    case 'headline':
      return 'Your Headline Here';
    case 'text':
      return 'Enter your text content here. Click to edit.';
    case 'button':
      return 'Click Here';
    default:
      return undefined;
  }
}
