import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Types
export type ScenarioStatus = 'active' | 'inactive' | 'draft';
export type ReaderStatus = 'active' | 'completed' | 'stopped' | 'unsubscribed' | 'error';
export type DeliveryTimingType = 'immediate' | 'relative' | 'absolute' | 'day_of_week';
export type StepType = 'email' | 'line';
export type LineMessageType = 'text' | 'image' | 'video' | 'audio' | 'sticker' | 'template';

export interface ScenarioGroup {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  color?: string;
  parentGroupId?: string;
  order: number;
  scenarioCount: number;
  totalReaders: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ScenarioTrigger {
  type: 'manual' | 'form_submit' | 'purchase' | 'action' | 'scenario_complete';
  formId?: string;
  productId?: string;
  actionId?: string;
  scenarioId?: string;
}

export interface ScenarioNotifications {
  onReaderRegistration: boolean;
  onDeliveryError: boolean;
  onCompletion: boolean;
  emails: string[];
}

export interface Scenario {
  id: string;
  workspaceId: string;
  scenarioGroupId?: string;
  name: string;
  description?: string;
  status: ScenarioStatus;
  channels: ('email' | 'line')[];
  startTriggers: ScenarioTrigger[];
  excludeUnsubscribed: boolean;
  excludeBlocked: boolean;
  excludeActiveScenarios: boolean;
  notifications: ScenarioNotifications;
  totalReaders: number;
  activeReaders: number;
  completedReaders: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface DeliveryTiming {
  type: DeliveryTimingType;
  relativeDays?: number;
  relativeHours?: number;
  relativeMinutes?: number;
  absoluteDate?: string;
  dayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  timeOfDay?: string;
  recurring?: boolean;
  sameDay: 'skip' | 'next_day';
}

export interface EmailContent {
  subject: string;
  fromName: string;
  fromEmail: string;
  replyToEmail?: string;
  htmlContent: string;
  plainTextContent?: string;
}

export interface LineAction {
  type: 'uri' | 'postback' | 'message' | 'datetimepicker';
  label: string;
  uri?: string;
  data?: string;
  displayText?: string;
  text?: string;
}

export interface LineMessage {
  type: LineMessageType;
  text?: string;
  imageUrl?: string;
  previewImageUrl?: string;
  videoUrl?: string;
  previewVideoUrl?: string;
  audioUrl?: string;
  audioDuration?: number;
  sticker?: {
    packageId: string;
    stickerId: string;
  };
  template?: {
    type: 'buttons' | 'confirm' | 'carousel';
    buttons?: {
      thumbnailImageUrl?: string;
      title?: string;
      text: string;
      actions: LineAction[];
    };
    carousel?: {
      columns: {
        thumbnailImageUrl?: string;
        title?: string;
        text: string;
        actions: LineAction[];
      }[];
    };
  };
}

export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'exists'
  | 'not_exists'
  | 'greater_than'
  | 'less_than'
  | 'greater_than_or_equal'
  | 'less_than_or_equal'
  | 'in'
  | 'not_in'
  | 'has_tag'
  | 'not_has_tag'
  | 'purchased'
  | 'not_purchased'
  | 'opened'
  | 'not_opened'
  | 'clicked'
  | 'not_clicked';

export interface ConditionRule {
  id: string;
  field: string;
  operator: ConditionOperator;
  value: unknown;
  logicalOperator?: 'AND' | 'OR';
}

export interface ConditionGroup {
  id: string;
  rules: ConditionRule[];
  groups?: ConditionGroup[];
  logicalOperator: 'AND' | 'OR';
}

export interface StepCondition {
  id: string;
  stepId: string;
  rules: ConditionRule[];
  groups?: ConditionGroup[];
  logicalOperator: 'AND' | 'OR';
}

export interface ScenarioStep {
  id: string;
  scenarioId: string;
  stepOrder: number;
  name: string;
  type: StepType;
  deliveryTiming: DeliveryTiming;
  email?: EmailContent;
  lineMessage?: LineMessage;
  conditions?: StepCondition[];
  createdAt: string;
  updatedAt: string;
}

export interface ScenarioReader {
  id: string;
  scenarioId: string;
  contactId: string;
  contactName?: string;
  contactEmail?: string;
  status: ReaderStatus;
  currentStepId?: string;
  currentStepOrder: number;
  completedSteps: string[];
  nextDeliveryAt?: string;
  startedAt: string;
  completedAt?: string;
  stoppedAt?: string;
  lastError?: {
    stepId: string;
    message: string;
    occurredAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ScenarioDeliveryLog {
  id: string;
  scenarioId: string;
  readerId: string;
  stepId: string;
  channel: 'email' | 'line';
  status: 'success' | 'failed' | 'pending' | 'skipped';
  deliveredAt?: string;
  emailId?: string;
  opened?: boolean;
  openedAt?: string;
  clicked?: boolean;
  clickedAt?: string;
  errorMessage?: string;
  skipReason?: string;
  createdAt: string;
}

// Store state interface
interface ScenarioState {
  // Data
  groups: ScenarioGroup[];
  scenarios: Scenario[];
  steps: Record<string, ScenarioStep[]>; // scenarioId -> steps
  readers: Record<string, ScenarioReader[]>; // scenarioId -> readers
  deliveryLogs: Record<string, ScenarioDeliveryLog[]>; // scenarioId -> logs

  // UI State
  selectedGroupId: string | null;
  selectedScenarioId: string | null;
  selectedStepId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions - Groups
  addGroup: (group: Omit<ScenarioGroup, 'id' | 'createdAt' | 'updatedAt' | 'scenarioCount' | 'totalReaders'>) => void;
  updateGroup: (id: string, updates: Partial<ScenarioGroup>) => void;
  deleteGroup: (id: string) => void;
  selectGroup: (id: string | null) => void;

  // Actions - Scenarios
  addScenario: (scenario: Omit<Scenario, 'id' | 'createdAt' | 'updatedAt' | 'totalReaders' | 'activeReaders' | 'completedReaders'>) => string;
  updateScenario: (id: string, updates: Partial<Scenario>) => void;
  deleteScenario: (id: string) => void;
  selectScenario: (id: string | null) => void;
  activateScenario: (id: string) => void;
  deactivateScenario: (id: string) => void;
  duplicateScenario: (id: string) => string;

  // Actions - Steps
  addStep: (scenarioId: string, step: Omit<ScenarioStep, 'id' | 'scenarioId' | 'createdAt' | 'updatedAt'>) => void;
  updateStep: (scenarioId: string, stepId: string, updates: Partial<ScenarioStep>) => void;
  deleteStep: (scenarioId: string, stepId: string) => void;
  reorderSteps: (scenarioId: string, stepIds: string[]) => void;
  selectStep: (id: string | null) => void;

  // Actions - Readers
  addReader: (scenarioId: string, reader: Omit<ScenarioReader, 'id' | 'createdAt' | 'updatedAt' | 'currentStepOrder' | 'completedSteps' | 'startedAt'>) => void;
  updateReader: (scenarioId: string, readerId: string, updates: Partial<ScenarioReader>) => void;
  removeReader: (scenarioId: string, readerId: string) => void;
  stopReader: (scenarioId: string, readerId: string) => void;
  resumeReader: (scenarioId: string, readerId: string) => void;

  // Actions - Delivery Logs
  addDeliveryLog: (scenarioId: string, log: Omit<ScenarioDeliveryLog, 'id' | 'createdAt'>) => void;

  // Getters
  getScenariosByGroup: (groupId: string | null) => Scenario[];
  getStepsByScenario: (scenarioId: string) => ScenarioStep[];
  getReadersByScenario: (scenarioId: string) => ScenarioReader[];
  getScenarioById: (id: string) => Scenario | undefined;
  getGroupById: (id: string) => ScenarioGroup | undefined;
}

// Helper functions
const generateId = () => crypto.randomUUID();
const now = () => new Date().toISOString();

// Create store
export const useScenarioStore = create<ScenarioState>()(
  persist(
    immer((set, get) => ({
      // Initial state
      groups: [],
      scenarios: [],
      steps: {},
      readers: {},
      deliveryLogs: {},
      selectedGroupId: null,
      selectedScenarioId: null,
      selectedStepId: null,
      isLoading: false,
      error: null,

      // Group actions
      addGroup: (group) => set((state) => {
        const newGroup: ScenarioGroup = {
          ...group,
          id: generateId(),
          scenarioCount: 0,
          totalReaders: 0,
          createdAt: now(),
          updatedAt: now(),
        };
        state.groups.push(newGroup);
      }),

      updateGroup: (id, updates) => set((state) => {
        const index = state.groups.findIndex((g) => g.id === id);
        if (index !== -1) {
          state.groups[index] = {
            ...state.groups[index],
            ...updates,
            updatedAt: now(),
          };
        }
      }),

      deleteGroup: (id) => set((state) => {
        state.groups = state.groups.filter((g) => g.id !== id);
        if (state.selectedGroupId === id) {
          state.selectedGroupId = null;
        }
      }),

      selectGroup: (id) => set((state) => {
        state.selectedGroupId = id;
      }),

      // Scenario actions
      addScenario: (scenario) => {
        const id = generateId();
        set((state) => {
          const newScenario: Scenario = {
            ...scenario,
            id,
            totalReaders: 0,
            activeReaders: 0,
            completedReaders: 0,
            createdAt: now(),
            updatedAt: now(),
          };
          state.scenarios.push(newScenario);
          state.steps[id] = [];
          state.readers[id] = [];
          state.deliveryLogs[id] = [];

          // Update group count
          if (scenario.scenarioGroupId) {
            const groupIndex = state.groups.findIndex((g) => g.id === scenario.scenarioGroupId);
            if (groupIndex !== -1) {
              state.groups[groupIndex].scenarioCount += 1;
            }
          }
        });
        return id;
      },

      updateScenario: (id, updates) => set((state) => {
        const index = state.scenarios.findIndex((s) => s.id === id);
        if (index !== -1) {
          state.scenarios[index] = {
            ...state.scenarios[index],
            ...updates,
            updatedAt: now(),
          };
        }
      }),

      deleteScenario: (id) => set((state) => {
        const scenario = state.scenarios.find((s) => s.id === id);
        if (scenario?.scenarioGroupId) {
          const groupIndex = state.groups.findIndex((g) => g.id === scenario.scenarioGroupId);
          if (groupIndex !== -1) {
            state.groups[groupIndex].scenarioCount -= 1;
          }
        }
        state.scenarios = state.scenarios.filter((s) => s.id !== id);
        delete state.steps[id];
        delete state.readers[id];
        delete state.deliveryLogs[id];
        if (state.selectedScenarioId === id) {
          state.selectedScenarioId = null;
        }
      }),

      selectScenario: (id) => set((state) => {
        state.selectedScenarioId = id;
        state.selectedStepId = null;
      }),

      activateScenario: (id) => set((state) => {
        const index = state.scenarios.findIndex((s) => s.id === id);
        if (index !== -1) {
          state.scenarios[index].status = 'active';
          state.scenarios[index].updatedAt = now();
        }
      }),

      deactivateScenario: (id) => set((state) => {
        const index = state.scenarios.findIndex((s) => s.id === id);
        if (index !== -1) {
          state.scenarios[index].status = 'inactive';
          state.scenarios[index].updatedAt = now();
        }
      }),

      duplicateScenario: (id) => {
        const state = get();
        const original = state.scenarios.find((s) => s.id === id);
        if (!original) return '';

        const newId = state.addScenario({
          ...original,
          name: `${original.name} (Copy)`,
          status: 'draft',
          workspaceId: original.workspaceId,
          scenarioGroupId: original.scenarioGroupId,
          channels: [...original.channels],
          startTriggers: [...original.startTriggers],
          notifications: { ...original.notifications },
          createdBy: original.createdBy,
        });

        // Copy steps
        const originalSteps = state.steps[id] || [];
        originalSteps.forEach((step) => {
          state.addStep(newId, {
            stepOrder: step.stepOrder,
            name: step.name,
            type: step.type,
            deliveryTiming: { ...step.deliveryTiming },
            email: step.email ? { ...step.email } : undefined,
            lineMessage: step.lineMessage ? { ...step.lineMessage } : undefined,
            conditions: step.conditions,
          });
        });

        return newId;
      },

      // Step actions
      addStep: (scenarioId, step) => set((state) => {
        if (!state.steps[scenarioId]) {
          state.steps[scenarioId] = [];
        }
        const newStep: ScenarioStep = {
          ...step,
          id: generateId(),
          scenarioId,
          createdAt: now(),
          updatedAt: now(),
        };
        state.steps[scenarioId].push(newStep);
        // Re-sort by stepOrder
        state.steps[scenarioId].sort((a, b) => a.stepOrder - b.stepOrder);
      }),

      updateStep: (scenarioId, stepId, updates) => set((state) => {
        const steps = state.steps[scenarioId];
        if (steps) {
          const index = steps.findIndex((s) => s.id === stepId);
          if (index !== -1) {
            steps[index] = {
              ...steps[index],
              ...updates,
              updatedAt: now(),
            };
          }
        }
      }),

      deleteStep: (scenarioId, stepId) => set((state) => {
        if (state.steps[scenarioId]) {
          state.steps[scenarioId] = state.steps[scenarioId].filter((s) => s.id !== stepId);
          // Re-order remaining steps
          state.steps[scenarioId].forEach((step, index) => {
            step.stepOrder = index + 1;
          });
        }
        if (state.selectedStepId === stepId) {
          state.selectedStepId = null;
        }
      }),

      reorderSteps: (scenarioId, stepIds) => set((state) => {
        const steps = state.steps[scenarioId];
        if (steps) {
          const reordered = stepIds.map((id, index) => {
            const step = steps.find((s) => s.id === id);
            if (step) {
              return { ...step, stepOrder: index + 1, updatedAt: now() };
            }
            return null;
          }).filter(Boolean) as ScenarioStep[];
          state.steps[scenarioId] = reordered;
        }
      }),

      selectStep: (id) => set((state) => {
        state.selectedStepId = id;
      }),

      // Reader actions
      addReader: (scenarioId, reader) => set((state) => {
        if (!state.readers[scenarioId]) {
          state.readers[scenarioId] = [];
        }
        const newReader: ScenarioReader = {
          ...reader,
          id: generateId(),
          currentStepOrder: 0,
          completedSteps: [],
          startedAt: now(),
          createdAt: now(),
          updatedAt: now(),
        };
        state.readers[scenarioId].push(newReader);

        // Update scenario counts
        const scenarioIndex = state.scenarios.findIndex((s) => s.id === scenarioId);
        if (scenarioIndex !== -1) {
          state.scenarios[scenarioIndex].totalReaders += 1;
          state.scenarios[scenarioIndex].activeReaders += 1;
        }
      }),

      updateReader: (scenarioId, readerId, updates) => set((state) => {
        const readers = state.readers[scenarioId];
        if (readers) {
          const index = readers.findIndex((r) => r.id === readerId);
          if (index !== -1) {
            readers[index] = {
              ...readers[index],
              ...updates,
              updatedAt: now(),
            };
          }
        }
      }),

      removeReader: (scenarioId, readerId) => set((state) => {
        const readers = state.readers[scenarioId];
        if (readers) {
          const reader = readers.find((r) => r.id === readerId);
          if (reader) {
            state.readers[scenarioId] = readers.filter((r) => r.id !== readerId);

            // Update scenario counts
            const scenarioIndex = state.scenarios.findIndex((s) => s.id === scenarioId);
            if (scenarioIndex !== -1) {
              state.scenarios[scenarioIndex].totalReaders -= 1;
              if (reader.status === 'active') {
                state.scenarios[scenarioIndex].activeReaders -= 1;
              } else if (reader.status === 'completed') {
                state.scenarios[scenarioIndex].completedReaders -= 1;
              }
            }
          }
        }
      }),

      stopReader: (scenarioId, readerId) => set((state) => {
        const readers = state.readers[scenarioId];
        if (readers) {
          const index = readers.findIndex((r) => r.id === readerId);
          if (index !== -1 && readers[index].status === 'active') {
            readers[index].status = 'stopped';
            readers[index].stoppedAt = now();
            readers[index].updatedAt = now();

            // Update scenario counts
            const scenarioIndex = state.scenarios.findIndex((s) => s.id === scenarioId);
            if (scenarioIndex !== -1) {
              state.scenarios[scenarioIndex].activeReaders -= 1;
            }
          }
        }
      }),

      resumeReader: (scenarioId, readerId) => set((state) => {
        const readers = state.readers[scenarioId];
        if (readers) {
          const index = readers.findIndex((r) => r.id === readerId);
          if (index !== -1 && readers[index].status === 'stopped') {
            readers[index].status = 'active';
            readers[index].stoppedAt = undefined;
            readers[index].updatedAt = now();

            // Update scenario counts
            const scenarioIndex = state.scenarios.findIndex((s) => s.id === scenarioId);
            if (scenarioIndex !== -1) {
              state.scenarios[scenarioIndex].activeReaders += 1;
            }
          }
        }
      }),

      // Delivery log actions
      addDeliveryLog: (scenarioId, log) => set((state) => {
        if (!state.deliveryLogs[scenarioId]) {
          state.deliveryLogs[scenarioId] = [];
        }
        const newLog: ScenarioDeliveryLog = {
          ...log,
          id: generateId(),
          createdAt: now(),
        };
        state.deliveryLogs[scenarioId].push(newLog);
      }),

      // Getters
      getScenariosByGroup: (groupId) => {
        const state = get();
        if (groupId === null) {
          return state.scenarios.filter((s) => !s.scenarioGroupId);
        }
        return state.scenarios.filter((s) => s.scenarioGroupId === groupId);
      },

      getStepsByScenario: (scenarioId) => {
        const state = get();
        return state.steps[scenarioId] || [];
      },

      getReadersByScenario: (scenarioId) => {
        const state = get();
        return state.readers[scenarioId] || [];
      },

      getScenarioById: (id) => {
        const state = get();
        return state.scenarios.find((s) => s.id === id);
      },

      getGroupById: (id) => {
        const state = get();
        return state.groups.find((g) => g.id === id);
      },
    })),
    {
      name: 'scenario-store',
      partialize: (state) => ({
        groups: state.groups,
        scenarios: state.scenarios,
        steps: state.steps,
        readers: state.readers,
        deliveryLogs: state.deliveryLogs,
      }),
    }
  )
);

// Default delivery timing
export const createDefaultDeliveryTiming = (): DeliveryTiming => ({
  type: 'immediate',
  sameDay: 'skip',
});

// Default email content
export const createDefaultEmailContent = (): EmailContent => ({
  subject: '',
  fromName: '',
  fromEmail: '',
  htmlContent: '',
});

// Default LINE message
export const createDefaultLineMessage = (): LineMessage => ({
  type: 'text',
  text: '',
});

// Create default step
export const createDefaultStep = (type: StepType, stepOrder: number): Omit<ScenarioStep, 'id' | 'scenarioId' | 'createdAt' | 'updatedAt'> => ({
  stepOrder,
  name: type === 'email' ? `Email Step ${stepOrder}` : `LINE Step ${stepOrder}`,
  type,
  deliveryTiming: createDefaultDeliveryTiming(),
  email: type === 'email' ? createDefaultEmailContent() : undefined,
  lineMessage: type === 'line' ? createDefaultLineMessage() : undefined,
});
