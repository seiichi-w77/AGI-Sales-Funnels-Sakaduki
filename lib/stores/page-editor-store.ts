import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';

// ============================================
// Type Definitions (from requirements doc)
// ============================================

export type ElementType =
  | 'section'
  | 'row'
  | 'column'
  | 'headline'
  | 'text'
  | 'image'
  | 'video'
  | 'button'
  | 'form'
  | 'input'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'divider'
  | 'spacer'
  | 'list'
  | 'accordion'
  | 'tabs'
  | 'carousel'
  | 'countdown'
  | 'icon'
  | 'embed'
  | 'custom';

export type DeviceType = 'desktop' | 'tablet' | 'mobile';

export interface ResponsiveValue<T> {
  desktop: T;
  tablet: T;
  mobile: T;
}

export interface Spacing {
  top: string;
  right: string;
  bottom: string;
  left: string;
}

export interface Border {
  width: string;
  style: 'solid' | 'dashed' | 'dotted' | 'none';
  color: string;
}

export interface BoxShadow {
  enabled: boolean;
  horizontal: string;
  vertical: string;
  blur: string;
  spread: string;
  color: string;
  inset?: boolean;
}

export interface Typography {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: number;
  lineHeight?: string;
  letterSpacing?: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textDecoration?: 'none' | 'underline' | 'line-through';
}

export interface Background {
  type: 'color' | 'gradient' | 'image' | 'video' | 'none';
  color?: string;
  gradient?: {
    type: 'linear' | 'radial';
    angle?: number;
    stops: Array<{ color: string; position: number }>;
  };
  image?: {
    url: string;
    position: { x: string; y: string };
    size: 'cover' | 'contain' | 'auto' | string;
    repeat: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
    attachment: 'scroll' | 'fixed';
    overlay?: { color: string; opacity: number };
  };
  video?: {
    url: string;
    autoplay: boolean;
    loop: boolean;
    muted: boolean;
    overlay?: { color: string; opacity: number };
  };
}

export interface DeviceVisibility {
  desktop: boolean;
  tablet: boolean;
  mobile: boolean;
}

export interface ElementAction {
  type: 'link' | 'popup' | 'scroll' | 'submit' | 'javascript' | 'none';
  value: string;
  target?: '_self' | '_blank';
  nofollow?: boolean;
}

// Base Element Interface
export interface BaseElement {
  id: string;
  type: ElementType;
  name: string;
  content?: string;
  props?: Record<string, unknown>;
  styles?: {
    padding?: ResponsiveValue<Spacing> | Spacing | string;
    margin?: ResponsiveValue<Spacing> | Spacing | string;
    background?: Background;
    border?: Border;
    borderRadius?: string | Spacing;
    shadow?: BoxShadow;
    typography?: Typography;
    color?: string;
    backgroundColor?: string;
    width?: string;
    height?: string;
    minHeight?: string;
    maxWidth?: string;
    [key: string]: unknown;
  };
  advanced?: {
    id?: string;
    className?: string;
    zIndex?: number;
    visibility?: DeviceVisibility;
    customAttributes?: Record<string, string>;
  };
  animation?: {
    type: 'none' | 'fade' | 'slide' | 'zoom' | 'bounce';
    duration: string;
    delay: string;
    easing: string;
  };
  action?: ElementAction;
  children?: PageElement[];
}

// Specific Element Types
export interface SectionElement extends BaseElement {
  type: 'section';
  layout?: {
    width: { type: 'boxed' | 'full' | 'custom'; value?: string; maxWidth?: string };
    height: { type: 'auto' | 'viewport' | 'custom'; value?: string };
  };
  children: PageElement[];
}

export interface RowElement extends BaseElement {
  type: 'row';
  layout?: {
    columns: number;
    columnRatios: number[];
    gap: { horizontal: string; vertical: string };
    justifyContent: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
    alignItems: 'flex-start' | 'center' | 'flex-end' | 'stretch';
    wrap: boolean;
    responsive?: ResponsiveValue<{ columns: number }>;
  };
  children: PageElement[];
}

export interface ColumnElement extends BaseElement {
  type: 'column';
  layout?: {
    width: ResponsiveValue<string>;
    order?: ResponsiveValue<number>;
    alignSelf?: 'auto' | 'flex-start' | 'center' | 'flex-end' | 'stretch';
  };
  children: PageElement[];
}

export interface HeadlineElement extends BaseElement {
  type: 'headline';
  content: string;
  htmlTag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  icons?: {
    before?: { icon: string; size: string; color: string; spacing: string };
    after?: { icon: string; size: string; color: string; spacing: string };
  };
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  html?: string;
}

export interface ButtonElement extends BaseElement {
  type: 'button';
  content: string;
  icon?: { icon: string; position: 'before' | 'after'; size: string; spacing: string };
  action: ElementAction;
  hover?: {
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    transform?: string;
  };
}

export interface ImageElement extends BaseElement {
  type: 'image';
  source: {
    type: 'upload' | 'url' | 'library';
    url: string;
    alt?: string;
    title?: string;
  };
  dimensions?: {
    aspectRatio?: string;
    width?: ResponsiveValue<string>;
    height?: ResponsiveValue<string>;
    objectFit?: 'fill' | 'contain' | 'cover' | 'scale-down';
  };
  optimization?: {
    lazyLoad?: boolean;
    quality?: number;
  };
  filters?: {
    brightness?: number;
    contrast?: number;
    saturate?: number;
    grayscale?: number;
    blur?: string;
  };
}

export interface VideoElement extends BaseElement {
  type: 'video';
  source: {
    type: 'youtube' | 'vimeo' | 'upload' | 'url';
    url: string;
    thumbnailUrl?: string;
  };
  playback?: {
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
    controls?: boolean;
  };
  dimensions?: {
    aspectRatio?: string;
    width?: ResponsiveValue<string>;
    height?: ResponsiveValue<string>;
  };
}

export interface InputElement extends BaseElement {
  type: 'input' | 'textarea' | 'select' | 'checkbox' | 'radio';
  field: {
    inputType: 'text' | 'email' | 'tel' | 'number' | 'password' | 'url' | 'date' | 'time';
    label?: string;
    placeholder?: string;
    defaultValue?: string;
    name: string;
    required?: boolean;
    disabled?: boolean;
    options?: Array<{ value: string; label: string }>;
  };
  validation?: {
    required?: boolean;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    errorMessages?: Record<string, string>;
  };
  labelStyle?: {
    position: 'top' | 'left' | 'placeholder';
    typography?: Typography;
    color?: string;
  };
}

export interface SpacerElement extends BaseElement {
  type: 'spacer';
  height: ResponsiveValue<string>;
}

export interface DividerElement extends BaseElement {
  type: 'divider';
  style?: {
    borderStyle: 'solid' | 'dashed' | 'dotted';
    borderWidth: string;
    borderColor: string;
    width: string;
  };
}

export interface ListElement extends BaseElement {
  type: 'list';
  listType: 'ul' | 'ol';
  items: string[];
  listStyle?: 'disc' | 'circle' | 'square' | 'decimal' | 'lower-alpha' | 'lower-roman' | 'none';
}

export interface AccordionElement extends BaseElement {
  type: 'accordion';
  items: Array<{ id: string; title: string; content: string }>;
  behavior?: {
    multipleOpen?: boolean;
    defaultOpen?: number[];
  };
}

// Union type for all elements
export type PageElement =
  | SectionElement
  | RowElement
  | ColumnElement
  | HeadlineElement
  | TextElement
  | ButtonElement
  | ImageElement
  | VideoElement
  | InputElement
  | SpacerElement
  | DividerElement
  | ListElement
  | AccordionElement
  | BaseElement;

// ============================================
// Page Structure
// ============================================

export interface PageSEO {
  title: string;
  metaDescription: string;
  metaKeywords?: string[];
  metaImage?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  nofollow?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

export interface PageSettings {
  customCSS?: string;
  customJS?: string;
  bodyAttributes?: Record<string, string>;
}

export interface Page {
  id: string;
  name: string;
  slug: string;
  type: 'standard' | 'landing-page' | 'blog-post' | 'blog-index';
  sections: PageElement[];
  seo?: PageSEO;
  settings?: PageSettings;
  status: 'draft' | 'published' | 'scheduled';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Editor State
// ============================================

interface DragState {
  isDragging: boolean;
  draggedId: string | null;
  dropTargetId: string | null;
  dropPosition: 'before' | 'after' | 'inside' | null;
}

interface EditorState {
  // Page data
  page: Page | null;

  // UI state
  device: DeviceType;
  selectedId: string | null;
  hoveredId: string | null;
  copiedElement: PageElement | null;

  // Drag & Drop
  drag: DragState;

  // History for undo/redo
  history: Page[];
  historyIndex: number;

  // Auto-save
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: string | null;
  autoSaveEnabled: boolean;

  // Panel visibility
  showLeftPanel: boolean;
  showRightPanel: boolean;
  leftPanelTab: 'elements' | 'layers' | 'pages';
  rightPanelTab: 'style' | 'settings' | 'advanced';

  // Preview
  isPreviewMode: boolean;
  previewUrl: string | null;
}

interface EditorActions {
  // Page actions
  setPage: (page: Page) => void;
  savePage: () => Promise<void>;
  publishPage: () => Promise<void>;

  // Element actions
  addElement: (element: PageElement, parentId?: string, index?: number) => void;
  updateElement: (id: string, updates: Partial<PageElement>) => void;
  removeElement: (id: string) => void;
  moveElement: (id: string, newParentId: string | null, index: number) => void;
  duplicateElement: (id: string) => void;
  copyElement: (id: string) => void;
  pasteElement: (targetId?: string) => void;

  // Selection
  selectElement: (id: string | null) => void;
  hoverElement: (id: string | null) => void;

  // Device
  setDevice: (device: DeviceType) => void;

  // Drag & Drop
  startDrag: (elementId: string) => void;
  updateDropTarget: (targetId: string | null, position: 'before' | 'after' | 'inside' | null) => void;
  endDrag: () => void;

  // History
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;

  // Panels
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setLeftPanelTab: (tab: 'elements' | 'layers' | 'pages') => void;
  setRightPanelTab: (tab: 'style' | 'settings' | 'advanced') => void;

  // Preview
  togglePreviewMode: () => void;
  setPreviewUrl: (url: string | null) => void;

  // Utils
  findElementById: (id: string) => PageElement | null;
  getParentElement: (id: string) => PageElement | null;
}

// ============================================
// Helper Functions
// ============================================

const findElementRecursive = (
  elements: PageElement[],
  id: string
): PageElement | null => {
  for (const element of elements) {
    if (element.id === id) return element;
    if (element.children) {
      const found = findElementRecursive(element.children, id);
      if (found) return found;
    }
  }
  return null;
};

const findParentRecursive = (
  elements: PageElement[],
  id: string,
  parent: PageElement | null = null
): PageElement | null => {
  for (const element of elements) {
    if (element.id === id) return parent;
    if (element.children) {
      const found = findParentRecursive(element.children, id, element);
      if (found !== undefined) return found;
    }
  }
  return null;
};

const removeElementRecursive = (
  elements: PageElement[],
  id: string
): PageElement[] => {
  return elements
    .filter((el) => el.id !== id)
    .map((el) => ({
      ...el,
      children: el.children ? removeElementRecursive(el.children, id) : undefined,
    }));
};

const updateElementRecursive = (
  elements: PageElement[],
  id: string,
  updates: Partial<PageElement>
): PageElement[] => {
  return elements.map((el) => {
    if (el.id === id) {
      return { ...el, ...updates } as PageElement;
    }
    if (el.children) {
      return {
        ...el,
        children: updateElementRecursive(el.children, id, updates),
      };
    }
    return el;
  });
};

const addElementToParent = (
  elements: PageElement[],
  element: PageElement,
  parentId: string,
  index?: number
): PageElement[] => {
  return elements.map((el) => {
    if (el.id === parentId) {
      const children = el.children || [];
      const newChildren = [...children];
      if (index !== undefined && index >= 0) {
        newChildren.splice(index, 0, element);
      } else {
        newChildren.push(element);
      }
      return { ...el, children: newChildren };
    }
    if (el.children) {
      return {
        ...el,
        children: addElementToParent(el.children, element, parentId, index),
      };
    }
    return el;
  });
};

const deepCloneElement = (element: PageElement): PageElement => {
  const cloned = JSON.parse(JSON.stringify(element));
  cloned.id = crypto.randomUUID();
  if (cloned.children) {
    cloned.children = cloned.children.map((child: PageElement) => deepCloneElement(child));
  }
  return cloned;
};

// ============================================
// Store
// ============================================

export const usePageEditorStore = create<EditorState & EditorActions>()(
  persist(
    immer((set, get) => ({
      // Initial state
      page: null,
      device: 'desktop',
      selectedId: null,
      hoveredId: null,
      copiedElement: null,
      drag: {
        isDragging: false,
        draggedId: null,
        dropTargetId: null,
        dropPosition: null,
      },
      history: [],
      historyIndex: -1,
      isDirty: false,
      isSaving: false,
      lastSaved: null,
      autoSaveEnabled: true,
      showLeftPanel: true,
      showRightPanel: true,
      leftPanelTab: 'elements',
      rightPanelTab: 'style',
      isPreviewMode: false,
      previewUrl: null,

      // Page actions
      setPage: (page) =>
        set((state) => {
          state.page = page;
          state.history = [page];
          state.historyIndex = 0;
          state.isDirty = false;
        }),

      savePage: async () => {
        const { page } = get();
        if (!page) return;

        set((state) => {
          state.isSaving = true;
        });

        try {
          // API call to save page
          const response = await fetch(`/api/pages/${page.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(page),
          });

          if (response.ok) {
            set((state) => {
              state.isDirty = false;
              state.lastSaved = new Date().toISOString();
            });
          }
        } catch (error) {
          console.error('Failed to save page:', error);
        } finally {
          set((state) => {
            state.isSaving = false;
          });
        }
      },

      publishPage: async () => {
        const { page } = get();
        if (!page) return;

        try {
          const response = await fetch(`/api/pages/${page.id}/publish`, {
            method: 'POST',
          });

          if (response.ok) {
            set((state) => {
              if (state.page) {
                state.page.status = 'published';
                state.page.publishedAt = new Date().toISOString();
              }
            });
          }
        } catch (error) {
          console.error('Failed to publish page:', error);
        }
      },

      // Element actions
      addElement: (element, parentId, index) =>
        set((state) => {
          if (!state.page) return;

          if (parentId) {
            state.page.sections = addElementToParent(
              state.page.sections,
              element,
              parentId,
              index
            );
          } else if (index !== undefined) {
            state.page.sections.splice(index, 0, element);
          } else {
            state.page.sections.push(element);
          }
          state.selectedId = element.id;
          state.isDirty = true;
        }),

      updateElement: (id, updates) =>
        set((state) => {
          if (!state.page) return;
          state.page.sections = updateElementRecursive(state.page.sections, id, updates);
          state.isDirty = true;
        }),

      removeElement: (id) =>
        set((state) => {
          if (!state.page) return;
          state.page.sections = removeElementRecursive(state.page.sections, id);
          if (state.selectedId === id) {
            state.selectedId = null;
          }
          state.isDirty = true;
        }),

      moveElement: (id, newParentId, index) =>
        set((state) => {
          if (!state.page) return;

          const element = findElementRecursive(state.page.sections, id);
          if (!element) return;

          // Remove from current position
          state.page.sections = removeElementRecursive(state.page.sections, id);

          // Add to new position
          if (newParentId) {
            state.page.sections = addElementToParent(
              state.page.sections,
              element,
              newParentId,
              index
            );
          } else {
            state.page.sections.splice(index, 0, element);
          }
          state.isDirty = true;
        }),

      duplicateElement: (id) =>
        set((state) => {
          if (!state.page) return;

          const element = findElementRecursive(state.page.sections, id);
          if (!element) return;

          const cloned = deepCloneElement(element);
          const parent = findParentRecursive(state.page.sections, id);

          if (parent && parent.children) {
            const index = parent.children.findIndex((child) => child.id === id);
            state.page.sections = addElementToParent(
              state.page.sections,
              cloned,
              parent.id,
              index + 1
            );
          } else {
            const index = state.page.sections.findIndex((el) => el.id === id);
            state.page.sections.splice(index + 1, 0, cloned);
          }
          state.selectedId = cloned.id;
          state.isDirty = true;
        }),

      copyElement: (id) =>
        set((state) => {
          if (!state.page) return;
          const element = findElementRecursive(state.page.sections, id);
          if (element) {
            state.copiedElement = deepCloneElement(element);
          }
        }),

      pasteElement: (targetId) =>
        set((state) => {
          if (!state.page || !state.copiedElement) return;

          const element = deepCloneElement(state.copiedElement);

          if (targetId) {
            state.page.sections = addElementToParent(
              state.page.sections,
              element,
              targetId
            );
          } else {
            state.page.sections.push(element);
          }
          state.selectedId = element.id;
          state.isDirty = true;
        }),

      // Selection
      selectElement: (id) =>
        set((state) => {
          state.selectedId = id;
        }),

      hoverElement: (id) =>
        set((state) => {
          state.hoveredId = id;
        }),

      // Device
      setDevice: (device) =>
        set((state) => {
          state.device = device;
        }),

      // Drag & Drop
      startDrag: (elementId) =>
        set((state) => {
          state.drag.isDragging = true;
          state.drag.draggedId = elementId;
        }),

      updateDropTarget: (targetId, position) =>
        set((state) => {
          state.drag.dropTargetId = targetId;
          state.drag.dropPosition = position;
        }),

      endDrag: () =>
        set((state) => {
          const { draggedId, dropTargetId, dropPosition } = state.drag;

          if (state.page && draggedId && dropTargetId && dropPosition) {
            const element = findElementRecursive(state.page.sections, draggedId);
            if (element) {
              // Remove from current position
              state.page.sections = removeElementRecursive(state.page.sections, draggedId);

              // Add to new position based on dropPosition
              if (dropPosition === 'inside') {
                state.page.sections = addElementToParent(
                  state.page.sections,
                  element,
                  dropTargetId
                );
              } else {
                const parent = findParentRecursive(state.page.sections, dropTargetId);
                const siblings = parent ? parent.children || [] : state.page.sections;
                const targetIndex = siblings.findIndex((el) => el.id === dropTargetId);
                const insertIndex = dropPosition === 'after' ? targetIndex + 1 : targetIndex;

                if (parent) {
                  state.page.sections = addElementToParent(
                    state.page.sections,
                    element,
                    parent.id,
                    insertIndex
                  );
                } else {
                  state.page.sections.splice(insertIndex, 0, element);
                }
              }
              state.isDirty = true;
            }
          }

          state.drag = {
            isDragging: false,
            draggedId: null,
            dropTargetId: null,
            dropPosition: null,
          };
        }),

      // History
      undo: () =>
        set((state) => {
          if (state.historyIndex > 0) {
            state.historyIndex--;
            state.page = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
          }
        }),

      redo: () =>
        set((state) => {
          if (state.historyIndex < state.history.length - 1) {
            state.historyIndex++;
            state.page = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
          }
        }),

      saveToHistory: () =>
        set((state) => {
          if (!state.page) return;
          const newHistory = state.history.slice(0, state.historyIndex + 1);
          newHistory.push(JSON.parse(JSON.stringify(state.page)));
          state.history = newHistory.slice(-50); // Keep last 50 states
          state.historyIndex = state.history.length - 1;
        }),

      // Panels
      toggleLeftPanel: () =>
        set((state) => {
          state.showLeftPanel = !state.showLeftPanel;
        }),

      toggleRightPanel: () =>
        set((state) => {
          state.showRightPanel = !state.showRightPanel;
        }),

      setLeftPanelTab: (tab) =>
        set((state) => {
          state.leftPanelTab = tab;
        }),

      setRightPanelTab: (tab) =>
        set((state) => {
          state.rightPanelTab = tab;
        }),

      // Preview
      togglePreviewMode: () =>
        set((state) => {
          state.isPreviewMode = !state.isPreviewMode;
        }),

      setPreviewUrl: (url) =>
        set((state) => {
          state.previewUrl = url;
        }),

      // Utils
      findElementById: (id) => {
        const { page } = get();
        if (!page) return null;
        return findElementRecursive(page.sections, id);
      },

      getParentElement: (id) => {
        const { page } = get();
        if (!page) return null;
        return findParentRecursive(page.sections, id);
      },
    })),
    {
      name: 'page-editor-storage',
      partialize: (state) => ({
        showLeftPanel: state.showLeftPanel,
        showRightPanel: state.showRightPanel,
        autoSaveEnabled: state.autoSaveEnabled,
      }),
    }
  )
);

// ============================================
// Default Element Creators
// ============================================

export const createDefaultElement = (type: ElementType): PageElement => {
  const id = crypto.randomUUID();
  const base = { id, type, name: type.charAt(0).toUpperCase() + type.slice(1) };

  switch (type) {
    case 'section':
      return {
        ...base,
        type: 'section',
        layout: {
          width: { type: 'boxed', maxWidth: '1200px' },
          height: { type: 'auto' },
        },
        styles: {
          padding: { top: '60px', right: '24px', bottom: '60px', left: '24px' },
          background: { type: 'color', color: '#ffffff' },
        },
        children: [],
      } as SectionElement;

    case 'row':
      return {
        ...base,
        type: 'row',
        layout: {
          columns: 2,
          columnRatios: [1, 1],
          gap: { horizontal: '24px', vertical: '24px' },
          justifyContent: 'flex-start',
          alignItems: 'stretch',
          wrap: true,
        },
        children: [],
      } as RowElement;

    case 'column':
      return {
        ...base,
        type: 'column',
        layout: {
          width: { desktop: '50%', tablet: '100%', mobile: '100%' },
          alignSelf: 'auto',
        },
        styles: {
          padding: { top: '16px', right: '16px', bottom: '16px', left: '16px' },
        },
        children: [],
      } as ColumnElement;

    case 'headline':
      return {
        ...base,
        type: 'headline',
        content: 'Your Headline Here',
        htmlTag: 'h2',
        styles: {
          typography: {
            fontFamily: 'inherit',
            fontSize: '36px',
            fontWeight: 700,
            lineHeight: '1.2',
            textAlign: 'left',
          },
          color: '#1a1a1a',
          margin: { top: '0', right: '0', bottom: '16px', left: '0' },
        },
      } as HeadlineElement;

    case 'text':
      return {
        ...base,
        type: 'text',
        content: 'Enter your text content here. Click to edit this paragraph.',
        styles: {
          typography: {
            fontFamily: 'inherit',
            fontSize: '16px',
            fontWeight: 400,
            lineHeight: '1.6',
            textAlign: 'left',
          },
          color: '#4a4a4a',
        },
      } as TextElement;

    case 'button':
      return {
        ...base,
        type: 'button',
        content: 'Click Here',
        action: { type: 'link', value: '#', target: '_self' },
        styles: {
          padding: { top: '12px', right: '24px', bottom: '12px', left: '24px' },
          backgroundColor: '#3b82f6',
          color: '#ffffff',
          borderRadius: '8px',
          typography: {
            fontFamily: 'inherit',
            fontSize: '16px',
            fontWeight: 600,
            lineHeight: '1.5',
          },
        },
        hover: {
          backgroundColor: '#2563eb',
        },
      } as ButtonElement;

    case 'image':
      return {
        ...base,
        type: 'image',
        source: {
          type: 'url',
          url: '',
          alt: 'Image description',
        },
        dimensions: {
          aspectRatio: '16:9',
          objectFit: 'cover',
        },
        optimization: {
          lazyLoad: true,
          quality: 80,
        },
      } as ImageElement;

    case 'video':
      return {
        ...base,
        type: 'video',
        source: {
          type: 'youtube',
          url: '',
        },
        playback: {
          autoplay: false,
          loop: false,
          muted: false,
          controls: true,
        },
        dimensions: {
          aspectRatio: '16:9',
        },
      } as VideoElement;

    case 'divider':
      return {
        ...base,
        type: 'divider',
        style: {
          borderStyle: 'solid',
          borderWidth: '1px',
          borderColor: '#e5e7eb',
          width: '100%',
        },
        styles: {
          margin: { top: '24px', right: '0', bottom: '24px', left: '0' },
        },
      } as DividerElement;

    case 'spacer':
      return {
        ...base,
        type: 'spacer',
        height: { desktop: '48px', tablet: '32px', mobile: '24px' },
      } as SpacerElement;

    case 'input':
      return {
        ...base,
        type: 'input',
        field: {
          inputType: 'text',
          label: 'Input Label',
          placeholder: 'Enter value...',
          name: `field_${id.slice(0, 8)}`,
          required: false,
        },
        styles: {
          padding: { top: '12px', right: '16px', bottom: '12px', left: '16px' },
          borderRadius: '8px',
          border: { width: '1px', style: 'solid', color: '#d1d5db' },
        },
      } as InputElement;

    case 'list':
      return {
        ...base,
        type: 'list',
        listType: 'ul',
        items: ['List item 1', 'List item 2', 'List item 3'],
        listStyle: 'disc',
      } as ListElement;

    case 'accordion':
      return {
        ...base,
        type: 'accordion',
        items: [
          { id: crypto.randomUUID(), title: 'Accordion Item 1', content: 'Content for item 1' },
          { id: crypto.randomUUID(), title: 'Accordion Item 2', content: 'Content for item 2' },
        ],
        behavior: {
          multipleOpen: false,
          defaultOpen: [0],
        },
      } as AccordionElement;

    default:
      return {
        ...base,
        type,
        content: '',
      } as BaseElement;
  }
};
