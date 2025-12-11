'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';

interface FunnelStep {
  id: string;
  name: string;
  slug: string;
  type: string;
  content: PageContent | null;
  sortOrder: number;
}

interface PageContent {
  sections: Section[];
  settings?: {
    backgroundColor?: string;
    fontFamily?: string;
  };
}

interface Section {
  id: string;
  type: 'section';
  settings: {
    backgroundColor?: string;
    paddingTop?: number;
    paddingBottom?: number;
  };
  rows: Row[];
}

interface Row {
  id: string;
  type: 'row';
  columns: Column[];
}

interface Column {
  id: string;
  type: 'column';
  width: number;
  elements: Element[];
}

interface Element {
  id: string;
  type: 'heading' | 'text' | 'image' | 'video' | 'button' | 'form' | 'countdown';
  content: Record<string, unknown>;
  settings: Record<string, unknown>;
}

const ELEMENT_TYPES = [
  { type: 'heading', label: '見出し', icon: 'H' },
  { type: 'text', label: 'テキスト', icon: 'T' },
  { type: 'image', label: '画像', icon: '🖼' },
  { type: 'video', label: '動画', icon: '▶' },
  { type: 'button', label: 'ボタン', icon: '□' },
  { type: 'form', label: 'フォーム', icon: '📋' },
  { type: 'countdown', label: 'タイマー', icon: '⏱' },
];

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export default function FunnelEditorPage() {
  const params = useParams();
  const funnelId = params.funnelId as string;

  const [steps, setSteps] = useState<FunnelStep[]>([]);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [content, setContent] = useState<PageContent>({ sections: [] });
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const fetchSteps = useCallback(async () => {
    try {
      const res = await fetch(`/api/funnels/${funnelId}`);
      const data = await res.json();
      if (data.funnel?.steps) {
        setSteps(data.funnel.steps);
        if (data.funnel.steps.length > 0 && !selectedStepId) {
          setSelectedStepId(data.funnel.steps[0].id);
          setContent((data.funnel.steps[0].content as PageContent) || { sections: [] });
        }
      }
    } catch (error) {
      console.error('Error fetching steps:', error);
    } finally {
      setLoading(false);
    }
  }, [funnelId, selectedStepId]);

  useEffect(() => {
    fetchSteps();
  }, [fetchSteps]);

  useEffect(() => {
    if (selectedStepId) {
      const step = steps.find((s) => s.id === selectedStepId);
      if (step) {
        setContent((step.content as PageContent) || { sections: [] });
      }
    }
  }, [selectedStepId, steps]);

  const handleSave = async () => {
    if (!selectedStepId) return;
    setSaving(true);
    try {
      await fetch(`/api/funnels/${funnelId}/steps/${selectedStepId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setSaving(false);
    }
  };

  const addSection = () => {
    const newSection: Section = {
      id: generateId(),
      type: 'section',
      settings: {
        backgroundColor: '#ffffff',
        paddingTop: 40,
        paddingBottom: 40,
      },
      rows: [
        {
          id: generateId(),
          type: 'row',
          columns: [
            {
              id: generateId(),
              type: 'column',
              width: 100,
              elements: [],
            },
          ],
        },
      ],
    };
    setContent((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
  };

  const addRow = (sectionId: string) => {
    const newRow: Row = {
      id: generateId(),
      type: 'row',
      columns: [
        {
          id: generateId(),
          type: 'column',
          width: 100,
          elements: [],
        },
      ],
    };
    setContent((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId ? { ...s, rows: [...s.rows, newRow] } : s
      ),
    }));
  };

  const addElement = (columnId: string, elementType: string) => {
    const defaultContent: Record<string, unknown> = {};
    const defaultSettings: Record<string, unknown> = {};

    switch (elementType) {
      case 'heading':
        defaultContent.text = '見出しテキスト';
        defaultContent.level = 'h2';
        defaultSettings.fontSize = 32;
        defaultSettings.color = '#000000';
        defaultSettings.textAlign = 'center';
        break;
      case 'text':
        defaultContent.text = 'ここにテキストを入力してください。';
        defaultSettings.fontSize = 16;
        defaultSettings.color = '#333333';
        defaultSettings.lineHeight = 1.6;
        break;
      case 'image':
        defaultContent.src = '';
        defaultContent.alt = '';
        defaultSettings.width = '100%';
        defaultSettings.borderRadius = 0;
        break;
      case 'video':
        defaultContent.url = '';
        defaultContent.provider = 'youtube';
        defaultSettings.aspectRatio = '16:9';
        break;
      case 'button':
        defaultContent.text = 'ボタンテキスト';
        defaultContent.url = '#';
        defaultSettings.backgroundColor = '#3b82f6';
        defaultSettings.textColor = '#ffffff';
        defaultSettings.padding = '12px 24px';
        defaultSettings.borderRadius = 8;
        break;
      case 'form':
        defaultContent.fields = [
          { type: 'email', label: 'メールアドレス', required: true },
        ];
        defaultContent.submitText = '送信';
        defaultSettings.buttonColor = '#3b82f6';
        break;
      case 'countdown':
        defaultContent.endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        defaultSettings.style = 'flip';
        break;
    }

    const newElement: Element = {
      id: generateId(),
      type: elementType as Element['type'],
      content: defaultContent,
      settings: defaultSettings,
    };

    setContent((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => ({
        ...section,
        rows: section.rows.map((row) => ({
          ...row,
          columns: row.columns.map((col) =>
            col.id === columnId
              ? { ...col, elements: [...col.elements, newElement] }
              : col
          ),
        })),
      })),
    }));

    setSelectedElementId(newElement.id);
  };

  const deleteElement = (elementId: string) => {
    setContent((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => ({
        ...section,
        rows: section.rows.map((row) => ({
          ...row,
          columns: row.columns.map((col) => ({
            ...col,
            elements: col.elements.filter((el) => el.id !== elementId),
          })),
        })),
      })),
    }));
    setSelectedElementId(null);
  };

  const updateElement = (elementId: string, updates: Partial<Element>) => {
    setContent((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => ({
        ...section,
        rows: section.rows.map((row) => ({
          ...row,
          columns: row.columns.map((col) => ({
            ...col,
            elements: col.elements.map((el) =>
              el.id === elementId ? { ...el, ...updates } : el
            ),
          })),
        })),
      })),
    }));
  };

  const findElement = (elementId: string): Element | null => {
    for (const section of content.sections) {
      for (const row of section.rows) {
        for (const col of row.columns) {
          const element = col.elements.find((el) => el.id === elementId);
          if (element) return element;
        }
      }
    }
    return null;
  };

  const selectedElement = selectedElementId ? findElement(selectedElementId) : null;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="h-14 bg-white border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <a href={`/funnels/${funnelId}`} className="text-gray-500 hover:text-gray-700">
            ← 戻る
          </a>
          <select
            value={selectedStepId || ''}
            onChange={(e) => setSelectedStepId(e.target.value)}
            className="px-3 py-1 border rounded"
          >
            {steps.map((step) => (
              <option key={step.id} value={step.id}>
                {step.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`px-3 py-1 rounded ${
              previewMode ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {previewMode ? 'エディット' : 'プレビュー'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Elements */}
        {!previewMode && (
          <div className="w-64 bg-gray-50 border-r p-4 overflow-y-auto">
            <h3 className="font-semibold mb-4">要素</h3>
            <div className="grid grid-cols-2 gap-2">
              {ELEMENT_TYPES.map((el) => (
                <button
                  key={el.type}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('elementType', el.type);
                  }}
                  className="p-3 bg-white border rounded hover:border-blue-500 text-center"
                >
                  <div className="text-2xl mb-1">{el.icon}</div>
                  <div className="text-xs">{el.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Canvas */}
        <div className="flex-1 bg-gray-200 overflow-y-auto p-4">
          <div
            className={`mx-auto bg-white shadow-lg ${previewMode ? 'max-w-4xl' : 'max-w-3xl'}`}
            style={{ minHeight: '600px' }}
          >
            {content.sections.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="mb-4">セクションがありません</p>
                {!previewMode && (
                  <button
                    onClick={addSection}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    セクションを追加
                  </button>
                )}
              </div>
            ) : (
              content.sections.map((section) => (
                <div
                  key={section.id}
                  className="relative group"
                  style={{
                    backgroundColor: section.settings.backgroundColor,
                    paddingTop: section.settings.paddingTop,
                    paddingBottom: section.settings.paddingBottom,
                  }}
                >
                  {!previewMode && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1">
                      <button
                        onClick={() => addRow(section.id)}
                        className="px-2 py-1 bg-blue-600 text-white text-xs rounded"
                      >
                        + 行
                      </button>
                    </div>
                  )}
                  {section.rows.map((row) => (
                    <div key={row.id} className="flex">
                      {row.columns.map((col) => (
                        <div
                          key={col.id}
                          className={`p-2 ${!previewMode ? 'border border-dashed border-gray-300 min-h-[100px]' : ''}`}
                          style={{ width: `${col.width}%` }}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const type = e.dataTransfer.getData('elementType');
                            if (type) addElement(col.id, type);
                          }}
                        >
                          {col.elements.map((el) => (
                            <div
                              key={el.id}
                              onClick={() => !previewMode && setSelectedElementId(el.id)}
                              className={`relative group ${
                                !previewMode && selectedElementId === el.id
                                  ? 'ring-2 ring-blue-500'
                                  : ''
                              }`}
                            >
                              {renderElement(el, previewMode)}
                              {!previewMode && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteElement(el.id);
                                  }}
                                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 w-6 h-6 bg-red-500 text-white rounded text-xs"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          ))}
                          {!previewMode && col.elements.length === 0 && (
                            <div className="text-center text-gray-400 py-8">
                              要素をドロップ
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))
            )}
            {!previewMode && content.sections.length > 0 && (
              <div className="p-4 text-center">
                <button
                  onClick={addSection}
                  className="px-4 py-2 border border-dashed border-gray-400 text-gray-600 rounded hover:border-blue-500 hover:text-blue-500"
                >
                  + セクションを追加
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Properties */}
        {!previewMode && (
          <div className="w-72 bg-white border-l p-4 overflow-y-auto">
            <h3 className="font-semibold mb-4">プロパティ</h3>
            {selectedElement ? (
              <ElementProperties
                element={selectedElement}
                onChange={(updates) => updateElement(selectedElement.id, updates)}
              />
            ) : (
              <p className="text-gray-500 text-sm">要素を選択してください</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function renderElement(element: Element, preview: boolean): React.ReactNode {
  const { type, content, settings } = element;

  switch (type) {
    case 'heading': {
      const HeadingTag = (content.level as keyof JSX.IntrinsicElements) || 'h2';
      return (
        <HeadingTag
          style={{
            fontSize: settings.fontSize as number,
            color: settings.color as string,
            textAlign: settings.textAlign as 'left' | 'center' | 'right',
            margin: '0.5em 0',
          }}
        >
          {content.text as string}
        </HeadingTag>
      );
    }

    case 'text':
      return (
        <p
          style={{
            fontSize: settings.fontSize as number,
            color: settings.color as string,
            lineHeight: settings.lineHeight as number,
            margin: '0.5em 0',
          }}
        >
          {content.text as string}
        </p>
      );

    case 'image':
      return content.src ? (
        <img
          src={content.src as string}
          alt={content.alt as string}
          style={{
            width: settings.width as string,
            borderRadius: settings.borderRadius as number,
          }}
        />
      ) : (
        <div className="bg-gray-200 h-40 flex items-center justify-center text-gray-500">
          画像を設定してください
        </div>
      );

    case 'video':
      return content.url ? (
        <div className="relative" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={content.url as string}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="bg-gray-200 h-40 flex items-center justify-center text-gray-500">
          動画URLを設定してください
        </div>
      );

    case 'button':
      return (
        <div style={{ textAlign: 'center', padding: '1em 0' }}>
          <a
            href={preview ? (content.url as string) : '#'}
            onClick={(e) => !preview && e.preventDefault()}
            style={{
              display: 'inline-block',
              backgroundColor: settings.backgroundColor as string,
              color: settings.textColor as string,
              padding: settings.padding as string,
              borderRadius: settings.borderRadius as number,
              textDecoration: 'none',
            }}
          >
            {content.text as string}
          </a>
        </div>
      );

    case 'form': {
      const fields = (content.fields as Array<{ type: string; label: string; required: boolean }>) || [];
      return (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (preview) alert('フォーム送信');
          }}
          className="space-y-4 p-4"
        >
          {fields.map((field, i) => (
            <div key={i}>
              <label className="block text-sm font-medium mb-1">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              <input
                type={field.type}
                required={field.required}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          ))}
          <button
            type="submit"
            style={{ backgroundColor: settings.buttonColor as string }}
            className="w-full py-2 text-white rounded"
          >
            {content.submitText as string}
          </button>
        </form>
      );
    }

    case 'countdown': {
      const endDate = new Date(content.endDate as string);
      const now = new Date();
      const diff = Math.max(0, endDate.getTime() - now.getTime());
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return (
        <div className="flex justify-center gap-4 py-4">
          {[
            { value: days, label: '日' },
            { value: hours, label: '時間' },
            { value: minutes, label: '分' },
            { value: seconds, label: '秒' },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-bold bg-gray-900 text-white px-4 py-2 rounded">
                {item.value.toString().padStart(2, '0')}
              </div>
              <div className="text-sm mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      );
    }

    default:
      return <div>Unknown element type: {type}</div>;
  }
}

function ElementProperties({
  element,
  onChange,
}: {
  element: Element;
  onChange: (updates: Partial<Element>) => void;
}) {
  const updateContent = (key: string, value: unknown) => {
    onChange({ content: { ...element.content, [key]: value } });
  };

  const updateSettings = (key: string, value: unknown) => {
    onChange({ settings: { ...element.settings, [key]: value } });
  };

  switch (element.type) {
    case 'heading':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">テキスト</label>
            <textarea
              value={element.content.text as string}
              onChange={(e) => updateContent('text', e.target.value)}
              className="w-full px-2 py-1 border rounded text-sm"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">見出しレベル</label>
            <select
              value={element.content.level as string}
              onChange={(e) => updateContent('level', e.target.value)}
              className="w-full px-2 py-1 border rounded text-sm"
            >
              <option value="h1">H1</option>
              <option value="h2">H2</option>
              <option value="h3">H3</option>
              <option value="h4">H4</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">フォントサイズ</label>
            <input
              type="number"
              value={element.settings.fontSize as number}
              onChange={(e) => updateSettings('fontSize', parseInt(e.target.value))}
              className="w-full px-2 py-1 border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">色</label>
            <input
              type="color"
              value={element.settings.color as string}
              onChange={(e) => updateSettings('color', e.target.value)}
              className="w-full h-8"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">配置</label>
            <select
              value={element.settings.textAlign as string}
              onChange={(e) => updateSettings('textAlign', e.target.value)}
              className="w-full px-2 py-1 border rounded text-sm"
            >
              <option value="left">左</option>
              <option value="center">中央</option>
              <option value="right">右</option>
            </select>
          </div>
        </div>
      );

    case 'text':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">テキスト</label>
            <textarea
              value={element.content.text as string}
              onChange={(e) => updateContent('text', e.target.value)}
              className="w-full px-2 py-1 border rounded text-sm"
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">フォントサイズ</label>
            <input
              type="number"
              value={element.settings.fontSize as number}
              onChange={(e) => updateSettings('fontSize', parseInt(e.target.value))}
              className="w-full px-2 py-1 border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">色</label>
            <input
              type="color"
              value={element.settings.color as string}
              onChange={(e) => updateSettings('color', e.target.value)}
              className="w-full h-8"
            />
          </div>
        </div>
      );

    case 'image':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">画像URL</label>
            <input
              type="url"
              value={element.content.src as string}
              onChange={(e) => updateContent('src', e.target.value)}
              className="w-full px-2 py-1 border rounded text-sm"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">代替テキスト</label>
            <input
              type="text"
              value={element.content.alt as string}
              onChange={(e) => updateContent('alt', e.target.value)}
              className="w-full px-2 py-1 border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">角丸</label>
            <input
              type="number"
              value={element.settings.borderRadius as number}
              onChange={(e) => updateSettings('borderRadius', parseInt(e.target.value))}
              className="w-full px-2 py-1 border rounded text-sm"
            />
          </div>
        </div>
      );

    case 'button':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">ボタンテキスト</label>
            <input
              type="text"
              value={element.content.text as string}
              onChange={(e) => updateContent('text', e.target.value)}
              className="w-full px-2 py-1 border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">リンクURL</label>
            <input
              type="url"
              value={element.content.url as string}
              onChange={(e) => updateContent('url', e.target.value)}
              className="w-full px-2 py-1 border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">背景色</label>
            <input
              type="color"
              value={element.settings.backgroundColor as string}
              onChange={(e) => updateSettings('backgroundColor', e.target.value)}
              className="w-full h-8"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">テキスト色</label>
            <input
              type="color"
              value={element.settings.textColor as string}
              onChange={(e) => updateSettings('textColor', e.target.value)}
              className="w-full h-8"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">角丸</label>
            <input
              type="number"
              value={element.settings.borderRadius as number}
              onChange={(e) => updateSettings('borderRadius', parseInt(e.target.value))}
              className="w-full px-2 py-1 border rounded text-sm"
            />
          </div>
        </div>
      );

    case 'video':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">動画URL (YouTube/Vimeo埋め込み)</label>
            <input
              type="url"
              value={element.content.url as string}
              onChange={(e) => updateContent('url', e.target.value)}
              className="w-full px-2 py-1 border rounded text-sm"
              placeholder="https://www.youtube.com/embed/..."
            />
          </div>
        </div>
      );

    case 'countdown':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">終了日時</label>
            <input
              type="datetime-local"
              value={(element.content.endDate as string)?.slice(0, 16)}
              onChange={(e) => updateContent('endDate', new Date(e.target.value).toISOString())}
              className="w-full px-2 py-1 border rounded text-sm"
            />
          </div>
        </div>
      );

    default:
      return <p className="text-gray-500 text-sm">この要素の設定はありません</p>;
  }
}
