'use client';

import { useEditorStore, EditorElement } from '@/lib/stores/editor-store';
import { cn } from '@/lib/utils';

export function EditorCanvas() {
  const { elements, selectedId, hoveredId, device, selectElement, hoverElement } =
    useEditorStore();

  const deviceWidth = {
    desktop: 'w-full',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]',
  };

  return (
    <div className="flex-1 overflow-auto bg-muted/50 p-4">
      <div
        className={cn(
          'mx-auto bg-background min-h-[600px] shadow-lg transition-all',
          deviceWidth[device]
        )}
        onClick={() => selectElement(null)}
      >
        {elements.length === 0 ? (
          <EmptyCanvas />
        ) : (
          elements.map((element) => (
            <RenderElement
              key={element.id}
              element={element}
              selectedId={selectedId}
              hoveredId={hoveredId}
              onSelect={selectElement}
              onHover={hoverElement}
            />
          ))
        )}
      </div>
    </div>
  );
}

function EmptyCanvas() {
  return (
    <div className="flex items-center justify-center h-[600px] border-2 border-dashed border-muted-foreground/25 m-4 rounded-lg">
      <div className="text-center text-muted-foreground">
        <p className="text-lg font-medium">Start Building</p>
        <p className="text-sm">Drag elements from the sidebar</p>
      </div>
    </div>
  );
}

function RenderElement({
  element,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
}: {
  element: EditorElement;
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
}) {
  const isSelected = selectedId === element.id;
  const isHovered = hoveredId === element.id;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(element.id);
  };

  const baseStyles = cn(
    'relative transition-all',
    isSelected && 'ring-2 ring-primary',
    isHovered && !isSelected && 'ring-1 ring-primary/50'
  );

  const renderChildren = () =>
    element.children?.map((child) => (
      <RenderElement
        key={child.id}
        element={child}
        selectedId={selectedId}
        hoveredId={hoveredId}
        onSelect={onSelect}
        onHover={onHover}
      />
    ));

  switch (element.type) {
    case 'section':
      return (
        <section
          className={cn(baseStyles, 'py-8 px-4')}
          style={element.styles}
          onClick={handleClick}
          onMouseEnter={() => onHover(element.id)}
          onMouseLeave={() => onHover(null)}
        >
          {renderChildren()}
        </section>
      );

    case 'row':
      return (
        <div
          className={cn(baseStyles, 'flex gap-4')}
          style={element.styles}
          onClick={handleClick}
          onMouseEnter={() => onHover(element.id)}
          onMouseLeave={() => onHover(null)}
        >
          {renderChildren()}
        </div>
      );

    case 'column':
      return (
        <div
          className={cn(baseStyles, 'flex-1 p-2')}
          style={element.styles}
          onClick={handleClick}
          onMouseEnter={() => onHover(element.id)}
          onMouseLeave={() => onHover(null)}
        >
          {renderChildren()}
        </div>
      );

    case 'headline':
      return (
        <h2
          className={cn(baseStyles, 'text-3xl font-bold p-2')}
          style={element.styles}
          onClick={handleClick}
          onMouseEnter={() => onHover(element.id)}
          onMouseLeave={() => onHover(null)}
        >
          {element.content || 'Headline'}
        </h2>
      );

    case 'text':
      return (
        <p
          className={cn(baseStyles, 'p-2')}
          style={element.styles}
          onClick={handleClick}
          onMouseEnter={() => onHover(element.id)}
          onMouseLeave={() => onHover(null)}
        >
          {element.content || 'Text paragraph'}
        </p>
      );

    case 'image':
      return (
        <div
          className={cn(baseStyles, 'p-2')}
          onClick={handleClick}
          onMouseEnter={() => onHover(element.id)}
          onMouseLeave={() => onHover(null)}
        >
          <div
            className="w-full h-48 bg-muted flex items-center justify-center rounded"
            style={element.styles}
          >
            <span className="text-muted-foreground">Image Placeholder</span>
          </div>
        </div>
      );

    case 'video':
      return (
        <div
          className={cn(baseStyles, 'p-2')}
          onClick={handleClick}
          onMouseEnter={() => onHover(element.id)}
          onMouseLeave={() => onHover(null)}
        >
          <div
            className="w-full aspect-video bg-black flex items-center justify-center rounded"
            style={element.styles}
          >
            <span className="text-white">Video Placeholder</span>
          </div>
        </div>
      );

    case 'button':
      return (
        <div
          className={cn(baseStyles, 'p-2')}
          onClick={handleClick}
          onMouseEnter={() => onHover(element.id)}
          onMouseLeave={() => onHover(null)}
        >
          <button
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium"
            style={element.styles}
          >
            {element.content || 'Click Here'}
          </button>
        </div>
      );

    case 'divider':
      return (
        <div
          className={cn(baseStyles, 'py-4')}
          onClick={handleClick}
          onMouseEnter={() => onHover(element.id)}
          onMouseLeave={() => onHover(null)}
        >
          <hr className="border-t border-border" style={element.styles} />
        </div>
      );

    default:
      return null;
  }
}
