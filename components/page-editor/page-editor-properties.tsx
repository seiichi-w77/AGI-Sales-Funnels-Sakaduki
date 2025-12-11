'use client';

import { usePageEditorStore, PageElement } from '@/lib/stores/page-editor-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';
import { Trash2, Copy, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { useState } from 'react';

export function PageEditorProperties() {
  const {
    selectedId,
    updateElement,
    removeElement,
    duplicateElement,
    rightPanelTab,
    setRightPanelTab,
    findElementById,
  } = usePageEditorStore();

  const selectedElement = selectedId ? findElementById(selectedId) : null;

  if (!selectedElement) {
    return (
      <div className="w-80 border-l bg-card overflow-hidden flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Properties</h3>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground p-4 text-center">
          <p>Select an element to edit its properties</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 border-l bg-card overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold capitalize">{selectedElement.type}</h3>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => duplicateElement(selectedElement.id)}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => removeElement(selectedElement.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          ID: {selectedElement.id.slice(0, 8)}...
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={rightPanelTab} onValueChange={(v) => setRightPanelTab(v as 'style' | 'settings' | 'advanced')}>
        <TabsList className="w-full justify-start px-4 py-6 h-auto border-b rounded-none bg-transparent">
          <TabsTrigger value="style">Style</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="style" className="p-4 space-y-4 m-0">
            <StyleProperties element={selectedElement} onUpdate={updateElement} />
          </TabsContent>

          <TabsContent value="settings" className="p-4 space-y-4 m-0">
            <SettingsProperties element={selectedElement} onUpdate={updateElement} />
          </TabsContent>

          <TabsContent value="advanced" className="p-4 space-y-4 m-0">
            <AdvancedProperties element={selectedElement} onUpdate={updateElement} />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}

interface PropertiesProps {
  element: PageElement;
  onUpdate: (id: string, updates: Partial<PageElement>) => void;
}

function StyleProperties({ element, onUpdate }: PropertiesProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['typography', 'spacing', 'background']);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const updateStyle = (key: string, value: unknown) => {
    onUpdate(element.id, {
      styles: {
        ...element.styles,
        [key]: value,
      },
    });
  };

  const updateTypography = (key: string, value: unknown) => {
    onUpdate(element.id, {
      styles: {
        ...element.styles,
        typography: {
          ...(element.styles?.typography || {}),
          [key]: value,
        },
      },
    });
  };

  // Content-based elements
  const hasContent = ['headline', 'text', 'button'].includes(element.type);
  const hasTypography = ['headline', 'text', 'button', 'input', 'list'].includes(element.type);

  return (
    <div className="space-y-4">
      {/* Content */}
      {hasContent && (
        <PropertySection
          title="Content"
          expanded={expandedSections.includes('content')}
          onToggle={() => toggleSection('content')}
        >
          {element.type === 'text' ? (
            <Textarea
              value={element.content || ''}
              onChange={(e) => onUpdate(element.id, { content: e.target.value })}
              rows={4}
            />
          ) : (
            <Input
              value={element.content || ''}
              onChange={(e) => onUpdate(element.id, { content: e.target.value })}
            />
          )}
        </PropertySection>
      )}

      {/* Typography */}
      {hasTypography && (
        <PropertySection
          title="Typography"
          expanded={expandedSections.includes('typography')}
          onToggle={() => toggleSection('typography')}
        >
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Font Size</Label>
              <Input
                placeholder="16px"
                value={element.styles?.typography?.fontSize || ''}
                onChange={(e) => updateTypography('fontSize', e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">Font Weight</Label>
              <Select
                value={String(element.styles?.typography?.fontWeight || '400')}
                onValueChange={(v) => updateTypography('fontWeight', parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="300">Light (300)</SelectItem>
                  <SelectItem value="400">Normal (400)</SelectItem>
                  <SelectItem value="500">Medium (500)</SelectItem>
                  <SelectItem value="600">Semibold (600)</SelectItem>
                  <SelectItem value="700">Bold (700)</SelectItem>
                  <SelectItem value="800">Extrabold (800)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Line Height</Label>
              <Input
                placeholder="1.5"
                value={element.styles?.typography?.lineHeight || ''}
                onChange={(e) => updateTypography('lineHeight', e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">Text Align</Label>
              <Select
                value={element.styles?.typography?.textAlign || 'left'}
                onValueChange={(v) => updateTypography('textAlign', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                  <SelectItem value="justify">Justify</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Text Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  className="w-12 h-10 p-1 cursor-pointer"
                  value={element.styles?.color || '#000000'}
                  onChange={(e) => updateStyle('color', e.target.value)}
                />
                <Input
                  placeholder="#000000"
                  value={element.styles?.color || ''}
                  onChange={(e) => updateStyle('color', e.target.value)}
                />
              </div>
            </div>
          </div>
        </PropertySection>
      )}

      {/* Spacing */}
      <PropertySection
        title="Spacing"
        expanded={expandedSections.includes('spacing')}
        onToggle={() => toggleSection('spacing')}
      >
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Padding</Label>
            <Input
              placeholder="16px"
              value={typeof element.styles?.padding === 'string' ? element.styles.padding : ''}
              onChange={(e) => updateStyle('padding', e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs">Margin</Label>
            <Input
              placeholder="0px"
              value={typeof element.styles?.margin === 'string' ? element.styles.margin : ''}
              onChange={(e) => updateStyle('margin', e.target.value)}
            />
          </div>
        </div>
      </PropertySection>

      {/* Background */}
      <PropertySection
        title="Background"
        expanded={expandedSections.includes('background')}
        onToggle={() => toggleSection('background')}
      >
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Background Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                className="w-12 h-10 p-1 cursor-pointer"
                value={element.styles?.backgroundColor || '#ffffff'}
                onChange={(e) => updateStyle('backgroundColor', e.target.value)}
              />
              <Input
                placeholder="#ffffff"
                value={element.styles?.backgroundColor || ''}
                onChange={(e) => updateStyle('backgroundColor', e.target.value)}
              />
            </div>
          </div>
        </div>
      </PropertySection>

      {/* Border */}
      <PropertySection
        title="Border"
        expanded={expandedSections.includes('border')}
        onToggle={() => toggleSection('border')}
      >
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Border Radius</Label>
            <Input
              placeholder="8px"
              value={typeof element.styles?.borderRadius === 'string' ? element.styles.borderRadius : ''}
              onChange={(e) => updateStyle('borderRadius', e.target.value)}
            />
          </div>
        </div>
      </PropertySection>

      {/* Sizing */}
      <PropertySection
        title="Sizing"
        expanded={expandedSections.includes('sizing')}
        onToggle={() => toggleSection('sizing')}
      >
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Width</Label>
            <Input
              placeholder="auto"
              value={element.styles?.width || ''}
              onChange={(e) => updateStyle('width', e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs">Height</Label>
            <Input
              placeholder="auto"
              value={element.styles?.height || ''}
              onChange={(e) => updateStyle('height', e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs">Min Height</Label>
            <Input
              placeholder="0"
              value={element.styles?.minHeight || ''}
              onChange={(e) => updateStyle('minHeight', e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs">Max Width</Label>
            <Input
              placeholder="none"
              value={element.styles?.maxWidth || ''}
              onChange={(e) => updateStyle('maxWidth', e.target.value)}
            />
          </div>
        </div>
      </PropertySection>
    </div>
  );
}

function SettingsProperties({ element, onUpdate }: PropertiesProps) {
  const updateAction = (key: string, value: unknown) => {
    onUpdate(element.id, {
      action: {
        ...(element.action || { type: 'none', value: '' }),
        [key]: value,
      },
    });
  };

  // Element-specific settings
  const isHeadline = element.type === 'headline';
  const isButton = element.type === 'button';
  const isImage = element.type === 'image';
  const isVideo = element.type === 'video';
  const isInput = ['input', 'textarea', 'select', 'checkbox', 'radio'].includes(element.type);

  return (
    <div className="space-y-4">
      {/* Headline Settings */}
      {isHeadline && (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">HTML Tag</Label>
            <Select
              value={(element as any).htmlTag || 'h2'}
              onValueChange={(v) => onUpdate(element.id, { htmlTag: v } as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="h1">H1 - Main Title</SelectItem>
                <SelectItem value="h2">H2 - Section Title</SelectItem>
                <SelectItem value="h3">H3 - Subsection</SelectItem>
                <SelectItem value="h4">H4 - Small Title</SelectItem>
                <SelectItem value="h5">H5 - Minor Title</SelectItem>
                <SelectItem value="h6">H6 - Smallest Title</SelectItem>
                <SelectItem value="p">P - Paragraph</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Button Settings */}
      {isButton && (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Action Type</Label>
            <Select
              value={element.action?.type || 'link'}
              onValueChange={(v) => updateAction('type', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="link">Open URL</SelectItem>
                <SelectItem value="scroll">Scroll to Section</SelectItem>
                <SelectItem value="popup">Open Popup</SelectItem>
                <SelectItem value="submit">Submit Form</SelectItem>
                <SelectItem value="javascript">Run JavaScript</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {element.action?.type === 'link' && (
            <>
              <div>
                <Label className="text-xs">URL</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://..."
                    value={element.action?.value || ''}
                    onChange={(e) => updateAction('value', e.target.value)}
                  />
                  <Button variant="outline" size="icon" asChild>
                    <a
                      href={element.action?.value || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Open in New Tab</Label>
                <Switch
                  checked={element.action?.target === '_blank'}
                  onCheckedChange={(v) => updateAction('target', v ? '_blank' : '_self')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">No Follow</Label>
                <Switch
                  checked={element.action?.nofollow || false}
                  onCheckedChange={(v) => updateAction('nofollow', v)}
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Image Settings */}
      {isImage && (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Image URL</Label>
            <Input
              placeholder="https://..."
              value={(element as any).source?.url || ''}
              onChange={(e) =>
                onUpdate(element.id, {
                  source: { ...(element as any).source, url: e.target.value },
                } as any)
              }
            />
          </div>
          <div>
            <Label className="text-xs">Alt Text</Label>
            <Input
              placeholder="Image description"
              value={(element as any).source?.alt || ''}
              onChange={(e) =>
                onUpdate(element.id, {
                  source: { ...(element as any).source, alt: e.target.value },
                } as any)
              }
            />
          </div>
          <div>
            <Label className="text-xs">Object Fit</Label>
            <Select
              value={(element as any).dimensions?.objectFit || 'cover'}
              onValueChange={(v) =>
                onUpdate(element.id, {
                  dimensions: { ...(element as any).dimensions, objectFit: v },
                } as any)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cover">Cover</SelectItem>
                <SelectItem value="contain">Contain</SelectItem>
                <SelectItem value="fill">Fill</SelectItem>
                <SelectItem value="scale-down">Scale Down</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Video Settings */}
      {isVideo && (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Video URL</Label>
            <Input
              placeholder="YouTube or Vimeo URL"
              value={(element as any).source?.url || ''}
              onChange={(e) =>
                onUpdate(element.id, {
                  source: { ...(element as any).source, url: e.target.value },
                } as any)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Autoplay</Label>
            <Switch
              checked={(element as any).playback?.autoplay || false}
              onCheckedChange={(v) =>
                onUpdate(element.id, {
                  playback: { ...(element as any).playback, autoplay: v },
                } as any)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Loop</Label>
            <Switch
              checked={(element as any).playback?.loop || false}
              onCheckedChange={(v) =>
                onUpdate(element.id, {
                  playback: { ...(element as any).playback, loop: v },
                } as any)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Muted</Label>
            <Switch
              checked={(element as any).playback?.muted || false}
              onCheckedChange={(v) =>
                onUpdate(element.id, {
                  playback: { ...(element as any).playback, muted: v },
                } as any)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Show Controls</Label>
            <Switch
              checked={(element as any).playback?.controls !== false}
              onCheckedChange={(v) =>
                onUpdate(element.id, {
                  playback: { ...(element as any).playback, controls: v },
                } as any)
              }
            />
          </div>
        </div>
      )}

      {/* Input Settings */}
      {isInput && (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Field Name</Label>
            <Input
              placeholder="field_name"
              value={(element as any).field?.name || ''}
              onChange={(e) =>
                onUpdate(element.id, {
                  field: { ...(element as any).field, name: e.target.value },
                } as any)
              }
            />
          </div>
          <div>
            <Label className="text-xs">Label</Label>
            <Input
              placeholder="Field Label"
              value={(element as any).field?.label || ''}
              onChange={(e) =>
                onUpdate(element.id, {
                  field: { ...(element as any).field, label: e.target.value },
                } as any)
              }
            />
          </div>
          <div>
            <Label className="text-xs">Placeholder</Label>
            <Input
              placeholder="Enter value..."
              value={(element as any).field?.placeholder || ''}
              onChange={(e) =>
                onUpdate(element.id, {
                  field: { ...(element as any).field, placeholder: e.target.value },
                } as any)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Required</Label>
            <Switch
              checked={(element as any).field?.required || false}
              onCheckedChange={(v) =>
                onUpdate(element.id, {
                  field: { ...(element as any).field, required: v },
                } as any)
              }
            />
          </div>
        </div>
      )}

      {/* Element Name */}
      <div className="pt-4 border-t">
        <Label className="text-xs">Element Name</Label>
        <Input
          placeholder="Element name"
          value={element.name || ''}
          onChange={(e) => onUpdate(element.id, { name: e.target.value })}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Used for identification in the layers panel
        </p>
      </div>
    </div>
  );
}

function AdvancedProperties({ element, onUpdate }: PropertiesProps) {
  const updateAdvanced = (key: string, value: unknown) => {
    onUpdate(element.id, {
      advanced: {
        ...element.advanced,
        [key]: value,
      },
    });
  };

  const updateVisibility = (device: string, value: boolean) => {
    onUpdate(element.id, {
      advanced: {
        ...element.advanced,
        visibility: {
          ...(element.advanced?.visibility || { desktop: true, tablet: true, mobile: true }),
          [device]: value,
        },
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Custom ID */}
      <div>
        <Label className="text-xs">Custom ID</Label>
        <Input
          placeholder="my-element"
          value={element.advanced?.id || ''}
          onChange={(e) => updateAdvanced('id', e.target.value)}
        />
        <p className="text-xs text-muted-foreground mt-1">
          HTML ID attribute for CSS/JS targeting
        </p>
      </div>

      {/* Custom Class */}
      <div>
        <Label className="text-xs">Custom Classes</Label>
        <Input
          placeholder="class1 class2"
          value={element.advanced?.className || ''}
          onChange={(e) => updateAdvanced('className', e.target.value)}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Space-separated CSS class names
        </p>
      </div>

      {/* Z-Index */}
      <div>
        <Label className="text-xs">Z-Index</Label>
        <Input
          type="number"
          placeholder="auto"
          value={element.advanced?.zIndex || ''}
          onChange={(e) => updateAdvanced('zIndex', parseInt(e.target.value) || undefined)}
        />
      </div>

      {/* Device Visibility */}
      <div className="space-y-3">
        <Label className="text-xs">Device Visibility</Label>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Desktop</span>
            <Switch
              checked={element.advanced?.visibility?.desktop !== false}
              onCheckedChange={(v) => updateVisibility('desktop', v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Tablet</span>
            <Switch
              checked={element.advanced?.visibility?.tablet !== false}
              onCheckedChange={(v) => updateVisibility('tablet', v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Mobile</span>
            <Switch
              checked={element.advanced?.visibility?.mobile !== false}
              onCheckedChange={(v) => updateVisibility('mobile', v)}
            />
          </div>
        </div>
      </div>

      {/* Animation */}
      <div className="space-y-3 pt-4 border-t">
        <Label className="text-xs">Animation</Label>
        <Select
          value={element.animation?.type || 'none'}
          onValueChange={(v) =>
            onUpdate(element.id, {
              animation: {
                ...(element.animation || { duration: '0.3s', delay: '0s', easing: 'ease' }),
                type: v as any,
              },
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="fade">Fade In</SelectItem>
            <SelectItem value="slide">Slide In</SelectItem>
            <SelectItem value="zoom">Zoom In</SelectItem>
            <SelectItem value="bounce">Bounce</SelectItem>
          </SelectContent>
        </Select>

        {element.animation?.type && element.animation.type !== 'none' && (
          <>
            <div>
              <Label className="text-xs">Duration</Label>
              <Input
                placeholder="0.3s"
                value={element.animation?.duration || '0.3s'}
                onChange={(e) =>
                  onUpdate(element.id, {
                    animation: { ...element.animation!, duration: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <Label className="text-xs">Delay</Label>
              <Input
                placeholder="0s"
                value={element.animation?.delay || '0s'}
                onChange={(e) =>
                  onUpdate(element.id, {
                    animation: { ...element.animation!, delay: e.target.value },
                  })
                }
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PropertySection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <Collapsible open={expanded} onOpenChange={onToggle}>
      <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium hover:bg-accent p-2 rounded-lg -mx-2">
        <span>{title}</span>
        {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
