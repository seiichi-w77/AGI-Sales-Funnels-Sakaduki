'use client';

import { useEditorStore, EditorElement } from '@/lib/stores/editor-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2, Copy } from 'lucide-react';

export function EditorProperties() {
  const { elements, selectedId, updateElement, removeElement, duplicateElement } =
    useEditorStore();

  const findElement = (els: EditorElement[], id: string): EditorElement | null => {
    for (const el of els) {
      if (el.id === id) return el;
      if (el.children) {
        const found = findElement(el.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedElement = selectedId ? findElement(elements, selectedId) : null;

  if (!selectedElement) {
    return (
      <div className="w-72 border-l bg-card overflow-y-auto">
        <div className="p-4 text-center text-muted-foreground">
          <p>Select an element to edit its properties</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 border-l bg-card overflow-y-auto">
      <div className="p-4 border-b">
        <h3 className="font-semibold capitalize">{selectedElement.type}</h3>
        <p className="text-xs text-muted-foreground mt-1">
          ID: {selectedElement.id.slice(0, 8)}
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Content */}
        {['headline', 'text', 'button'].includes(selectedElement.type) && (
          <div className="space-y-2">
            <Label>Content</Label>
            <Input
              value={selectedElement.content || ''}
              onChange={(e) =>
                updateElement(selectedElement.id, { content: e.target.value })
              }
            />
          </div>
        )}

        {/* Styles */}
        <div className="space-y-2">
          <Label>Styles</Label>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Padding</Label>
              <Input
                placeholder="16px"
                value={selectedElement.styles?.padding || ''}
                onChange={(e) =>
                  updateElement(selectedElement.id, {
                    styles: { ...selectedElement.styles, padding: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <Label className="text-xs">Margin</Label>
              <Input
                placeholder="0px"
                value={selectedElement.styles?.margin || ''}
                onChange={(e) =>
                  updateElement(selectedElement.id, {
                    styles: { ...selectedElement.styles, margin: e.target.value },
                  })
                }
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">Background</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                className="w-12 h-10 p-1"
                value={selectedElement.styles?.backgroundColor || '#ffffff'}
                onChange={(e) =>
                  updateElement(selectedElement.id, {
                    styles: {
                      ...selectedElement.styles,
                      backgroundColor: e.target.value,
                    },
                  })
                }
              />
              <Input
                placeholder="#ffffff"
                value={selectedElement.styles?.backgroundColor || ''}
                onChange={(e) =>
                  updateElement(selectedElement.id, {
                    styles: {
                      ...selectedElement.styles,
                      backgroundColor: e.target.value,
                    },
                  })
                }
              />
            </div>
          </div>

          {['headline', 'text', 'button'].includes(selectedElement.type) && (
            <>
              <div>
                <Label className="text-xs">Font Size</Label>
                <Input
                  placeholder="16px"
                  value={selectedElement.styles?.fontSize || ''}
                  onChange={(e) =>
                    updateElement(selectedElement.id, {
                      styles: { ...selectedElement.styles, fontSize: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label className="text-xs">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    className="w-12 h-10 p-1"
                    value={selectedElement.styles?.color || '#000000'}
                    onChange={(e) =>
                      updateElement(selectedElement.id, {
                        styles: { ...selectedElement.styles, color: e.target.value },
                      })
                    }
                  />
                  <Input
                    placeholder="#000000"
                    value={selectedElement.styles?.color || ''}
                    onChange={(e) =>
                      updateElement(selectedElement.id, {
                        styles: { ...selectedElement.styles, color: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="pt-4 border-t space-y-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => duplicateElement(selectedElement.id)}
          >
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </Button>
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => removeElement(selectedElement.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
