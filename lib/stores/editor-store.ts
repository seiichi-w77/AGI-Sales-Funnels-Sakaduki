import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

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
  | 'divider';

export interface EditorElement {
  id: string;
  type: ElementType;
  content?: string;
  props?: Record<string, unknown>;
  styles?: Record<string, string>;
  children?: EditorElement[];
}

interface EditorState {
  elements: EditorElement[];
  selectedId: string | null;
  hoveredId: string | null;
  history: EditorElement[][];
  historyIndex: number;
  isDragging: boolean;
  device: 'desktop' | 'tablet' | 'mobile';

  // Actions
  setElements: (elements: EditorElement[]) => void;
  addElement: (element: EditorElement, parentId?: string) => void;
  updateElement: (id: string, updates: Partial<EditorElement>) => void;
  removeElement: (id: string) => void;
  moveElement: (id: string, newParentId: string, index: number) => void;
  duplicateElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  hoverElement: (id: string | null) => void;
  setDevice: (device: 'desktop' | 'tablet' | 'mobile') => void;
  setDragging: (isDragging: boolean) => void;
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
}

const findElementById = (
  elements: EditorElement[],
  id: string
): EditorElement | null => {
  for (const element of elements) {
    if (element.id === id) return element;
    if (element.children) {
      const found = findElementById(element.children, id);
      if (found) return found;
    }
  }
  return null;
};

const removeElementById = (
  elements: EditorElement[],
  id: string
): EditorElement[] => {
  return elements
    .filter((el) => el.id !== id)
    .map((el) => ({
      ...el,
      children: el.children ? removeElementById(el.children, id) : undefined,
    }));
};

const addElementToParent = (
  elements: EditorElement[],
  element: EditorElement,
  parentId: string
): EditorElement[] => {
  return elements.map((el) => {
    if (el.id === parentId) {
      return {
        ...el,
        children: [...(el.children || []), element],
      };
    }
    if (el.children) {
      return {
        ...el,
        children: addElementToParent(el.children, element, parentId),
      };
    }
    return el;
  });
};

const updateElementById = (
  elements: EditorElement[],
  id: string,
  updates: Partial<EditorElement>
): EditorElement[] => {
  return elements.map((el) => {
    if (el.id === id) {
      return { ...el, ...updates };
    }
    if (el.children) {
      return {
        ...el,
        children: updateElementById(el.children, id, updates),
      };
    }
    return el;
  });
};

export const useEditorStore = create<EditorState>()(
  immer((set, _get) => ({
    elements: [],
    selectedId: null,
    hoveredId: null,
    history: [[]],
    historyIndex: 0,
    isDragging: false,
    device: 'desktop',

    setElements: (elements) =>
      set((state) => {
        state.elements = elements;
      }),

    addElement: (element, parentId) =>
      set((state) => {
        if (parentId) {
          state.elements = addElementToParent(state.elements, element, parentId);
        } else {
          state.elements.push(element);
        }
        state.selectedId = element.id;
      }),

    updateElement: (id, updates) =>
      set((state) => {
        state.elements = updateElementById(state.elements, id, updates);
      }),

    removeElement: (id) =>
      set((state) => {
        state.elements = removeElementById(state.elements, id);
        if (state.selectedId === id) {
          state.selectedId = null;
        }
      }),

    moveElement: (id, newParentId, _index) =>
      set((state) => {
        const element = findElementById(state.elements, id);
        if (!element) return;

        state.elements = removeElementById(state.elements, id);
        state.elements = addElementToParent(state.elements, element, newParentId);
      }),

    duplicateElement: (id) =>
      set((state) => {
        const element = findElementById(state.elements, id);
        if (!element) return;

        const newElement = JSON.parse(JSON.stringify(element));
        newElement.id = crypto.randomUUID();

        // Find parent and add after original
        const parent = state.elements.find((el) =>
          el.children?.some((child) => child.id === id)
        );
        if (parent && parent.children) {
          const index = parent.children.findIndex((child) => child.id === id);
          parent.children.splice(index + 1, 0, newElement);
        } else {
          const index = state.elements.findIndex((el) => el.id === id);
          state.elements.splice(index + 1, 0, newElement);
        }
      }),

    selectElement: (id) =>
      set((state) => {
        state.selectedId = id;
      }),

    hoverElement: (id) =>
      set((state) => {
        state.hoveredId = id;
      }),

    setDevice: (device) =>
      set((state) => {
        state.device = device;
      }),

    setDragging: (isDragging) =>
      set((state) => {
        state.isDragging = isDragging;
      }),

    saveToHistory: () =>
      set((state) => {
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(JSON.parse(JSON.stringify(state.elements)));
        state.history = newHistory;
        state.historyIndex = newHistory.length - 1;
      }),

    undo: () =>
      set((state) => {
        if (state.historyIndex > 0) {
          state.historyIndex--;
          state.elements = JSON.parse(
            JSON.stringify(state.history[state.historyIndex])
          );
        }
      }),

    redo: () =>
      set((state) => {
        if (state.historyIndex < state.history.length - 1) {
          state.historyIndex++;
          state.elements = JSON.parse(
            JSON.stringify(state.history[state.historyIndex])
          );
        }
      }),
  }))
);
