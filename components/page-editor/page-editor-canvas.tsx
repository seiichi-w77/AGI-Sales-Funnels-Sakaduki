'use client';

import { useCallback, useState } from 'react';
import { usePageEditorStore, PageElement, ElementType, createDefaultElement } from '@/lib/stores/page-editor-store';
import { cn } from '@/lib/utils';
import { Plus, Move, Trash2, Copy, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function PageEditorCanvas() {
  const {
    page,
    device,
    selectedId,
    hoveredId,
    selectElement,
    hoverElement,
    isPreviewMode,
    drag,
    startDrag,
    updateDropTarget,
    endDrag,
    addElement,
  } = usePageEditorStore();

  const deviceWidth = {
    desktop: 'w-full max-w-[1400px]',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]',
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      selectElement(null);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const elementType = e.dataTransfer.getData('elementType') as ElementType;

      if (elementType) {
        const newElement = createDefaultElement(elementType);
        addElement(newElement);
      } else if (drag.isDragging) {
        endDrag();
      }
    },
    [addElement, drag.isDragging, endDrag]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  if (!page) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/30">
        <p className="text-muted-foreground">No page loaded</p>
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-auto bg-muted/30 p-4 md:p-8"
      onClick={handleCanvasClick}
    >
      <div
        className={cn(
          'mx-auto bg-background min-h-[800px] shadow-xl transition-all duration-300 rounded-lg overflow-hidden',
          deviceWidth[device]
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {page.sections.length === 0 ? (
          <EmptyCanvas />
        ) : (
          page.sections.map((element, index) => (
            <RenderElement
              key={element.id}
              element={element}
              selectedId={selectedId}
              hoveredId={hoveredId}
              onSelect={selectElement}
              onHover={hoverElement}
              isPreviewMode={isPreviewMode}
              drag={drag}
              onDragStart={startDrag}
              onDropTargetUpdate={updateDropTarget}
              index={index}
              parentId={null}
            />
          ))
        )}

        {/* Add Section Button */}
        {!isPreviewMode && (
          <AddSectionButton />
        )}
      </div>
    </div>
  );
}

function EmptyCanvas() {
  const { addElement } = usePageEditorStore();

  const handleAddSection = () => {
    const section = createDefaultElement('section');
    addElement(section);
  };

  return (
    <div
      className="flex flex-col items-center justify-center h-[600px] border-2 border-dashed border-muted-foreground/25 m-4 rounded-lg cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
      onClick={handleAddSection}
    >
      <Plus className="h-12 w-12 text-muted-foreground/50 mb-4" />
      <p className="text-lg font-medium text-muted-foreground">Start Building Your Page</p>
      <p className="text-sm text-muted-foreground/75 mt-1">Click to add a section or drag elements from the sidebar</p>
    </div>
  );
}

function AddSectionButton() {
  const { addElement } = usePageEditorStore();

  const handleAddSection = () => {
    const section = createDefaultElement('section');
    addElement(section);
  };

  return (
    <div
      className="flex items-center justify-center py-8 border-t border-dashed border-muted-foreground/25 cursor-pointer hover:bg-accent/50 transition-colors group"
      onClick={handleAddSection}
    >
      <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary mr-2" />
      <span className="text-sm text-muted-foreground group-hover:text-primary">Add Section</span>
    </div>
  );
}

interface RenderElementProps {
  element: PageElement;
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
  isPreviewMode: boolean;
  drag: {
    isDragging: boolean;
    draggedId: string | null;
    dropTargetId: string | null;
    dropPosition: 'before' | 'after' | 'inside' | null;
  };
  onDragStart: (id: string) => void;
  onDropTargetUpdate: (id: string | null, position: 'before' | 'after' | 'inside' | null) => void;
  index: number;
  parentId: string | null;
}

function RenderElement({
  element,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
  isPreviewMode,
  drag,
  onDragStart,
  onDropTargetUpdate,
  index: _index,
  parentId: _parentId,
}: RenderElementProps) {
  const { removeElement, duplicateElement, copyElement, addElement } = usePageEditorStore();
  const [showDropIndicator, setShowDropIndicator] = useState<'before' | 'after' | 'inside' | null>(null);

  const isSelected = selectedId === element.id;
  const isHovered = hoveredId === element.id && !isPreviewMode;
  const isDragged = drag.draggedId === element.id;
  const isDropTarget = drag.dropTargetId === element.id;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPreviewMode) {
      onSelect(element.id);
    }
  };

  const handleMouseEnter = () => {
    if (!isPreviewMode) {
      onHover(element.id);
    }
  };

  const handleMouseLeave = () => {
    if (!isPreviewMode) {
      onHover(null);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(element.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;

    let position: 'before' | 'after' | 'inside' = 'inside';
    if (y < height * 0.25) {
      position = 'before';
    } else if (y > height * 0.75) {
      position = 'after';
    }

    setShowDropIndicator(position);
    onDropTargetUpdate(element.id, position);
  };

  const handleDragLeave = () => {
    setShowDropIndicator(null);
  };

  const handleAddChild = () => {
    const row = createDefaultElement('row');
    addElement(row, element.id);
  };

  // Element-specific styles
  const getElementStyles = () => {
    const styles: Record<string, unknown> = {};

    if (element.styles) {
      if (element.styles.backgroundColor) styles.backgroundColor = element.styles.backgroundColor;
      if (element.styles.color) styles.color = element.styles.color;
      if (typeof element.styles.padding === 'string') styles.padding = element.styles.padding;
      if (typeof element.styles.margin === 'string') styles.margin = element.styles.margin;
      if (element.styles.borderRadius) styles.borderRadius = element.styles.borderRadius;

      if (element.styles.typography) {
        const typo = element.styles.typography;
        if (typo.fontFamily) styles.fontFamily = typo.fontFamily;
        if (typo.fontSize) styles.fontSize = typo.fontSize;
        if (typo.fontWeight) styles.fontWeight = typo.fontWeight;
        if (typo.lineHeight) styles.lineHeight = typo.lineHeight;
        if (typo.textAlign) styles.textAlign = typo.textAlign;
        if (typo.letterSpacing) styles.letterSpacing = typo.letterSpacing;
      }
    }

    return styles;
  };

  const baseWrapperStyles = cn(
    'relative transition-all group/element',
    !isPreviewMode && 'cursor-pointer',
    isSelected && !isPreviewMode && 'ring-2 ring-primary ring-offset-2',
    isHovered && !isSelected && !isPreviewMode && 'ring-1 ring-primary/50',
    isDragged && 'opacity-50',
    isDropTarget && showDropIndicator === 'inside' && 'ring-2 ring-blue-500'
  );

  const renderChildren = () =>
    element.children?.map((child, i) => (
      <RenderElement
        key={child.id}
        element={child}
        selectedId={selectedId}
        hoveredId={hoveredId}
        onSelect={onSelect}
        onHover={onHover}
        isPreviewMode={isPreviewMode}
        drag={drag}
        onDragStart={onDragStart}
        onDropTargetUpdate={onDropTargetUpdate}
        index={i}
        parentId={element.id}
      />
    ));

  // Element Actions Toolbar
  const ElementToolbar = () => {
    if (isPreviewMode || !isSelected) return null;

    return (
      <div className="absolute -top-10 left-0 flex items-center gap-1 bg-primary text-primary-foreground px-2 py-1 rounded-t-lg text-xs z-50 shadow-lg">
        <span className="font-medium capitalize mr-2">{element.type}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:bg-primary-foreground/20"
          onClick={(e) => {
            e.stopPropagation();
            duplicateElement(element.id);
          }}
        >
          <Copy className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:bg-primary-foreground/20"
          draggable
          onDragStart={handleDragStart}
        >
          <Move className="h-3 w-3" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-primary-foreground/20">
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => copyElement(element.id)}>
              Copy
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => duplicateElement(element.id)}>
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => removeElement(element.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:bg-destructive/80 text-destructive-foreground"
          onClick={(e) => {
            e.stopPropagation();
            removeElement(element.id);
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    );
  };

  // Drop indicators
  const DropIndicator = ({ position }: { position: 'before' | 'after' }) => {
    if (!showDropIndicator || showDropIndicator !== position || isPreviewMode) return null;

    return (
      <div
        className={cn(
          'absolute left-0 right-0 h-1 bg-blue-500 z-40',
          position === 'before' ? '-top-0.5' : '-bottom-0.5'
        )}
      />
    );
  };

  // Render based on element type
  switch (element.type) {
    case 'section':
      return (
        <section
          className={cn(baseWrapperStyles, 'py-12 px-6 relative')}
          style={getElementStyles()}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          draggable={!isPreviewMode}
          onDragStart={handleDragStart}
        >
          <DropIndicator position="before" />
          <ElementToolbar />
          {element.children && element.children.length > 0 ? (
            renderChildren()
          ) : (
            !isPreviewMode && (
              <div
                className="flex items-center justify-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddChild();
                }}
              >
                <Plus className="h-5 w-5 text-muted-foreground mr-2" />
                <span className="text-sm text-muted-foreground">Add Row</span>
              </div>
            )
          )}
          <DropIndicator position="after" />
        </section>
      );

    case 'row':
      return (
        <div
          className={cn(baseWrapperStyles, 'flex flex-wrap gap-4 relative')}
          style={getElementStyles()}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          draggable={!isPreviewMode}
          onDragStart={handleDragStart}
        >
          <DropIndicator position="before" />
          <ElementToolbar />
          {element.children && element.children.length > 0 ? (
            renderChildren()
          ) : (
            !isPreviewMode && (
              <div
                className="flex-1 flex items-center justify-center py-6 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  const col = createDefaultElement('column');
                  addElement(col, element.id);
                }}
              >
                <Plus className="h-4 w-4 text-muted-foreground mr-2" />
                <span className="text-sm text-muted-foreground">Add Column</span>
              </div>
            )
          )}
          <DropIndicator position="after" />
        </div>
      );

    case 'column':
      return (
        <div
          className={cn(baseWrapperStyles, 'flex-1 min-w-[200px] p-4 relative')}
          style={getElementStyles()}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          draggable={!isPreviewMode}
          onDragStart={handleDragStart}
        >
          <DropIndicator position="before" />
          <ElementToolbar />
          {element.children && element.children.length > 0 ? (
            <div className="space-y-4">
              {renderChildren()}
            </div>
          ) : (
            !isPreviewMode && (
              <div
                className="flex items-center justify-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  // Can add any element to column
                }}
              >
                <Plus className="h-4 w-4 text-muted-foreground mr-2" />
                <span className="text-sm text-muted-foreground">Add Element</span>
              </div>
            )
          )}
          <DropIndicator position="after" />
        </div>
      );

    case 'headline': {
      const HeadlineTag = ((element as unknown as Record<string, unknown>).htmlTag || 'h2') as keyof JSX.IntrinsicElements;
      return (
        <div className={cn(baseWrapperStyles, 'relative')}>
          <DropIndicator position="before" />
          <ElementToolbar />
          <HeadlineTag
            className="font-bold"
            style={getElementStyles()}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            draggable={!isPreviewMode}
            onDragStart={handleDragStart}
            contentEditable={!isPreviewMode && isSelected}
            suppressContentEditableWarning
          >
            {element.content || 'Headline'}
          </HeadlineTag>
          <DropIndicator position="after" />
        </div>
      );
    }

    case 'text':
      return (
        <div className={cn(baseWrapperStyles, 'relative')}>
          <DropIndicator position="before" />
          <ElementToolbar />
          <p
            style={getElementStyles()}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            draggable={!isPreviewMode}
            onDragStart={handleDragStart}
            contentEditable={!isPreviewMode && isSelected}
            suppressContentEditableWarning
          >
            {element.content || 'Text paragraph'}
          </p>
          <DropIndicator position="after" />
        </div>
      );

    case 'image': {
      const imgElement = element as unknown as Record<string, unknown>;
      return (
        <div
          className={cn(baseWrapperStyles, 'relative')}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          draggable={!isPreviewMode}
          onDragStart={handleDragStart}
        >
          <DropIndicator position="before" />
          <ElementToolbar />
          {(imgElement.source as Record<string, unknown>)?.url ? (
            <img
              src={(imgElement.source as Record<string, string>).url}
              alt={(imgElement.source as Record<string, string>)?.alt || ''}
              className="w-full h-auto rounded"
              style={getElementStyles()}
            />
          ) : (
            <div
              className="w-full aspect-video bg-muted flex items-center justify-center rounded"
              style={getElementStyles()}
            >
              <span className="text-muted-foreground">Click to add image</span>
            </div>
          )}
          <DropIndicator position="after" />
        </div>
      );
    }

    case 'video': {
      const vidElement = element as unknown as Record<string, unknown>;
      return (
        <div
          className={cn(baseWrapperStyles, 'relative')}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          draggable={!isPreviewMode}
          onDragStart={handleDragStart}
        >
          <DropIndicator position="before" />
          <ElementToolbar />
          {(vidElement.source as Record<string, unknown>)?.url ? (
            <div className="aspect-video">
              <iframe
                src={(vidElement.source as Record<string, string>).url}
                className="w-full h-full rounded"
                allowFullScreen
              />
            </div>
          ) : (
            <div
              className="w-full aspect-video bg-black flex items-center justify-center rounded"
              style={getElementStyles()}
            >
              <span className="text-white">Click to add video URL</span>
            </div>
          )}
          <DropIndicator position="after" />
        </div>
      );
    }

    case 'button':
      return (
        <div
          className={cn(baseWrapperStyles, 'relative')}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          draggable={!isPreviewMode}
          onDragStart={handleDragStart}
        >
          <DropIndicator position="before" />
          <ElementToolbar />
          <button
            className="px-6 py-3 rounded-lg font-medium transition-colors"
            style={getElementStyles()}
          >
            {element.content || 'Click Here'}
          </button>
          <DropIndicator position="after" />
        </div>
      );

    case 'divider': {
      const dividerElement = element as unknown as Record<string, unknown>;
      return (
        <div
          className={cn(baseWrapperStyles, 'py-4 relative')}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          draggable={!isPreviewMode}
          onDragStart={handleDragStart}
        >
          <DropIndicator position="before" />
          <ElementToolbar />
          <hr
            style={{
              borderStyle: (dividerElement.style as Record<string, string>)?.borderStyle || 'solid',
              borderWidth: (dividerElement.style as Record<string, string>)?.borderWidth || '1px',
              borderColor: (dividerElement.style as Record<string, string>)?.borderColor || '#e5e7eb',
              width: (dividerElement.style as Record<string, string>)?.width || '100%',
            }}
          />
          <DropIndicator position="after" />
        </div>
      );
    }

    case 'spacer': {
      const spacerElement = element as unknown as Record<string, unknown>;
      const spacerHeight = (spacerElement.height as Record<string, string>)?.desktop || '48px';
      return (
        <div
          className={cn(baseWrapperStyles, 'relative')}
          style={{ height: spacerHeight }}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          draggable={!isPreviewMode}
          onDragStart={handleDragStart}
        >
          <DropIndicator position="before" />
          <ElementToolbar />
          {!isPreviewMode && (
            <div className="h-full border-2 border-dashed border-muted-foreground/25 rounded flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Spacer ({spacerHeight})</span>
            </div>
          )}
          <DropIndicator position="after" />
        </div>
      );
    }

    case 'input': {
      const inputElement = element as unknown as Record<string, unknown>;
      return (
        <div
          className={cn(baseWrapperStyles, 'relative')}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          draggable={!isPreviewMode}
          onDragStart={handleDragStart}
        >
          <DropIndicator position="before" />
          <ElementToolbar />
          <div className="space-y-2">
            {(inputElement.field as Record<string, string>)?.label && (
              <label className="text-sm font-medium">{(inputElement.field as Record<string, string>).label}</label>
            )}
            <input
              type={(inputElement.field as Record<string, string>)?.inputType || 'text'}
              placeholder={(inputElement.field as Record<string, string>)?.placeholder || 'Enter value...'}
              className="w-full px-4 py-2 border rounded-lg"
              style={getElementStyles()}
              disabled={isPreviewMode}
            />
          </div>
          <DropIndicator position="after" />
        </div>
      );
    }

    case 'list': {
      const listElement = element as unknown as Record<string, unknown>;
      const ListTag = listElement.listType === 'ol' ? 'ol' : 'ul';
      return (
        <div
          className={cn(baseWrapperStyles, 'relative')}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          draggable={!isPreviewMode}
          onDragStart={handleDragStart}
        >
          <DropIndicator position="before" />
          <ElementToolbar />
          <ListTag
            className={cn(
              'space-y-2',
              listElement.listType === 'ul' ? 'list-disc' : 'list-decimal',
              'pl-6'
            )}
            style={getElementStyles()}
          >
            {((listElement.items as string[]) || []).map((item: string, i: number) => (
              <li key={i}>{item}</li>
            ))}
          </ListTag>
          <DropIndicator position="after" />
        </div>
      );
    }

    default:
      return (
        <div
          className={cn(baseWrapperStyles, 'p-4 bg-muted/50 rounded relative')}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          draggable={!isPreviewMode}
          onDragStart={handleDragStart}
        >
          <DropIndicator position="before" />
          <ElementToolbar />
          <span className="text-muted-foreground text-sm capitalize">{element.type} element</span>
          <DropIndicator position="after" />
        </div>
      );
  }
}
