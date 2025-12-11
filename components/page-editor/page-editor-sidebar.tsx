'use client';

import { useState } from 'react';
import { usePageEditorStore, createDefaultElement, ElementType, PageElement } from '@/lib/stores/page-editor-store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
  List,
  ChevronRight,
  ChevronDown,
  Search,
  Layers,
  FileText,
  Plus,
  GripVertical,
  Trash2,
  Space,
  AlignJustify,
  Timer,
  Code,
  ToggleLeft,
  CircleDot,
  ChevronUp,
} from 'lucide-react';

// Element definitions with categories
const elementCategories = [
  {
    id: 'layout',
    name: 'Layout',
    elements: [
      { type: 'section' as const, label: 'Section', icon: LayoutGrid, description: 'Full-width container' },
      { type: 'row' as const, label: 'Row', icon: Columns, description: 'Horizontal container' },
      { type: 'column' as const, label: 'Column', icon: Square, description: 'Vertical container' },
    ],
  },
  {
    id: 'content',
    name: 'Content',
    elements: [
      { type: 'headline' as const, label: 'Headline', icon: Heading, description: 'Title text' },
      { type: 'text' as const, label: 'Text', icon: Type, description: 'Paragraph text' },
      { type: 'image' as const, label: 'Image', icon: Image, description: 'Image element' },
      { type: 'video' as const, label: 'Video', icon: Video, description: 'Video player' },
      { type: 'button' as const, label: 'Button', icon: MousePointer2, description: 'Call-to-action button' },
      { type: 'list' as const, label: 'List', icon: List, description: 'Bulleted/numbered list' },
    ],
  },
  {
    id: 'form',
    name: 'Form',
    elements: [
      { type: 'input' as const, label: 'Input', icon: FormInput, description: 'Text input field' },
      { type: 'textarea' as const, label: 'Textarea', icon: AlignJustify, description: 'Multi-line text' },
      { type: 'select' as const, label: 'Select', icon: ChevronDown, description: 'Dropdown select' },
      { type: 'checkbox' as const, label: 'Checkbox', icon: ToggleLeft, description: 'Checkbox input' },
      { type: 'radio' as const, label: 'Radio', icon: CircleDot, description: 'Radio button' },
    ],
  },
  {
    id: 'advanced',
    name: 'Advanced',
    elements: [
      { type: 'divider' as const, label: 'Divider', icon: Minus, description: 'Horizontal line' },
      { type: 'spacer' as const, label: 'Spacer', icon: Space, description: 'Vertical spacing' },
      { type: 'accordion' as const, label: 'Accordion', icon: ChevronUp, description: 'Collapsible sections' },
      { type: 'countdown' as const, label: 'Countdown', icon: Timer, description: 'Countdown timer' },
      { type: 'embed' as const, label: 'Embed', icon: Code, description: 'Custom HTML/embed' },
    ],
  },
];

export function PageEditorSidebar() {
  const { leftPanelTab, setLeftPanelTab } = usePageEditorStore();

  return (
    <div className="w-72 border-r bg-card flex flex-col">
      <Tabs value={leftPanelTab} onValueChange={(v) => setLeftPanelTab(v as 'elements' | 'layers' | 'pages')}>
        <TabsList className="w-full justify-start px-2 py-6 h-auto border-b rounded-none bg-transparent">
          <TabsTrigger value="elements" className="gap-2">
            <Plus className="h-4 w-4" />
            Elements
          </TabsTrigger>
          <TabsTrigger value="layers" className="gap-2">
            <Layers className="h-4 w-4" />
            Layers
          </TabsTrigger>
          <TabsTrigger value="pages" className="gap-2">
            <FileText className="h-4 w-4" />
            Pages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="elements" className="flex-1 m-0">
          <ElementsPanel />
        </TabsContent>

        <TabsContent value="layers" className="flex-1 m-0">
          <LayersPanel />
        </TabsContent>

        <TabsContent value="pages" className="flex-1 m-0">
          <PagesPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ElementsPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['layout', 'content']);
  const { addElement, selectedId } = usePageEditorStore();

  const handleAddElement = (type: ElementType) => {
    const newElement = createDefaultElement(type);
    addElement(newElement, selectedId || undefined);
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const filteredCategories = elementCategories.map((cat) => ({
    ...cat,
    elements: cat.elements.filter(
      (el) =>
        el.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        el.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => cat.elements.length > 0);

  return (
    <ScrollArea className="flex-1">
      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search elements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Element Categories */}
      <div className="p-2">
        {filteredCategories.map((category) => (
          <Collapsible
            key={category.id}
            open={expandedCategories.includes(category.id)}
            onOpenChange={() => toggleCategory(category.id)}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-2 text-sm font-medium hover:bg-accent rounded-lg">
              <span>{category.name}</span>
              {expandedCategories.includes(category.id) ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="px-2 pb-2">
              <div className="grid grid-cols-2 gap-2 mt-2">
                {category.elements.map((el) => (
                  <ElementButton
                    key={el.type}
                    label={el.label}
                    icon={el.icon}
                    description={el.description}
                    onClick={() => handleAddElement(el.type)}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('elementType', el.type);
                    }}
                  />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </ScrollArea>
  );
}

function ElementButton({
  label,
  icon: Icon,
  description,
  onClick,
  draggable,
  onDragStart,
}: {
  label: string;
  icon: React.ElementType;
  description?: string;
  onClick: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}) {
  return (
    <button
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      className={cn(
        'flex flex-col items-center justify-center p-3 rounded-lg border bg-background',
        'hover:bg-accent hover:border-primary transition-colors',
        'cursor-pointer group'
      )}
      title={description}
    >
      <Icon className="h-5 w-5 mb-1 text-muted-foreground group-hover:text-primary" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

function LayersPanel() {
  const { page, selectedId, selectElement, hoveredId, hoverElement, removeElement } = usePageEditorStore();

  if (!page || page.sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Layers className="h-8 w-8 mb-2" />
        <p className="text-sm">No elements yet</p>
        <p className="text-xs">Add elements to see them here</p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-2">
        {page.sections.map((element, index) => (
          <LayerItem
            key={element.id}
            element={element}
            depth={0}
            index={index}
            selectedId={selectedId}
            hoveredId={hoveredId}
            onSelect={selectElement}
            onHover={hoverElement}
            onRemove={removeElement}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

function LayerItem({
  element,
  depth,
  index: _index,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
  onRemove,
}: {
  element: PageElement;
  depth: number;
  index: number;
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
  onRemove: (id: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = element.children && element.children.length > 0;
  const isSelected = selectedId === element.id;
  const isHovered = hoveredId === element.id;

  const getIcon = () => {
    switch (element.type) {
      case 'section': return LayoutGrid;
      case 'row': return Columns;
      case 'column': return Square;
      case 'headline': return Heading;
      case 'text': return Type;
      case 'image': return Image;
      case 'video': return Video;
      case 'button': return MousePointer2;
      case 'input': return FormInput;
      case 'divider': return Minus;
      default: return Square;
    }
  };

  const Icon = getIcon();

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-1 px-2 py-1.5 rounded-lg cursor-pointer group',
          'hover:bg-accent',
          isSelected && 'bg-accent border border-primary',
          isHovered && !isSelected && 'bg-accent/50'
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => onSelect(element.id)}
        onMouseEnter={() => onHover(element.id)}
        onMouseLeave={() => onHover(null)}
      >
        {/* Expand/Collapse */}
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-0.5 hover:bg-muted rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
        ) : (
          <span className="w-4" />
        )}

        {/* Drag Handle */}
        <GripVertical className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-grab" />

        {/* Icon */}
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />

        {/* Name */}
        <span className="text-xs flex-1 truncate">{element.name || element.type}</span>

        {/* Actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(element.id);
            }}
            className="p-1 hover:bg-destructive/20 rounded text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {element.children!.map((child, i) => (
            <LayerItem
              key={child.id}
              element={child}
              depth={depth + 1}
              index={i}
              selectedId={selectedId}
              hoveredId={hoveredId}
              onSelect={onSelect}
              onHover={onHover}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PagesPanel() {
  // Placeholder for pages management
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-sm">Pages</h3>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-1" />
          New Page
        </Button>
      </div>
      <div className="text-sm text-muted-foreground text-center py-8">
        Page management coming soon
      </div>
    </div>
  );
}
