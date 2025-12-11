import { prisma } from '@/lib/db/prisma';
import { WorkflowStep, WorkflowExecution, Contact, Prisma } from '@prisma/client';

interface StepConfig {
  // SEND_EMAIL
  emailCampaignId?: string;
  emailSubject?: string;
  emailContent?: unknown;
  // DELAY
  delayValue?: number;
  delayUnit?: 'minutes' | 'hours' | 'days';
  // ADD_TAG / REMOVE_TAG
  tag?: string;
  tags?: string[];
  // UPDATE_CONTACT
  fields?: Record<string, unknown>;
  // WEBHOOK
  webhookUrl?: string;
  webhookMethod?: 'GET' | 'POST' | 'PUT' | 'PATCH';
  webhookHeaders?: Record<string, string>;
  webhookBody?: unknown;
  // START_WORKFLOW
  targetWorkflowId?: string;
  // CONDITION
  conditions?: Array<{
    field: string;
    operator: string;
    value: unknown;
  }>;
  conditionLogic?: 'and' | 'or';
}

interface ExecutionContext {
  execution: WorkflowExecution;
  contact: Contact | null;
  data: Record<string, unknown>;
}

export class WorkflowEngine {
  /**
   * ワークフローステップを実行
   */
  async executeStep(step: WorkflowStep, context: ExecutionContext): Promise<{
    success: boolean;
    nextStepId: string | null;
    data?: Record<string, unknown>;
    error?: string;
    shouldWait?: boolean;
    waitUntil?: Date;
  }> {
    const config = step.config as StepConfig;

    try {
      switch (step.type) {
        case 'SEND_EMAIL':
          return await this.executeSendEmail(step, config, context);
        case 'DELAY':
          return await this.executeDelay(step, config, context);
        case 'ADD_TAG':
          return await this.executeAddTag(step, config, context);
        case 'REMOVE_TAG':
          return await this.executeRemoveTag(step, config, context);
        case 'UPDATE_CONTACT':
          return await this.executeUpdateContact(step, config, context);
        case 'WEBHOOK':
          return await this.executeWebhook(step, config, context);
        case 'CONDITION':
          return await this.executeCondition(step, config, context);
        case 'START_WORKFLOW':
          return await this.executeStartWorkflow(step, config, context);
        case 'END':
          return { success: true, nextStepId: null };
        default:
          return { success: false, nextStepId: null, error: `Unknown step type: ${step.type}` };
      }
    } catch (error) {
      console.error(`Step execution error:`, error);
      return {
        success: false,
        nextStepId: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * メール送信ステップ
   */
  private async executeSendEmail(
    step: WorkflowStep,
    config: StepConfig,
    context: ExecutionContext
  ): Promise<{ success: boolean; nextStepId: string | null; error?: string }> {
    if (!context.contact) {
      return { success: false, nextStepId: null, error: 'No contact associated with execution' };
    }

    // 実際のメール送信ロジックはここに実装
    // 現時点ではログを記録して次に進む
    console.log(`[Workflow] Send email to ${context.contact.email}`, {
      subject: config.emailSubject,
      campaignId: config.emailCampaignId,
    });

    // アクティビティログを記録
    await prisma.contactActivity.create({
      data: {
        contactId: context.contact.id,
        type: 'workflow_email_sent',
        description: `Workflow email sent: ${config.emailSubject || 'No subject'}`,
        metadata: {
          workflowId: step.workflowId,
          stepId: step.id,
          emailCampaignId: config.emailCampaignId,
        },
      },
    });

    return { success: true, nextStepId: step.nextStepId };
  }

  /**
   * 遅延ステップ
   */
  private async executeDelay(
    step: WorkflowStep,
    config: StepConfig,
    _context: ExecutionContext
  ): Promise<{ success: boolean; nextStepId: string | null; shouldWait: boolean; waitUntil: Date }> {
    const delayValue = config.delayValue || 1;
    const delayUnit = config.delayUnit || 'hours';

    let delayMs = 0;
    switch (delayUnit) {
      case 'minutes':
        delayMs = delayValue * 60 * 1000;
        break;
      case 'hours':
        delayMs = delayValue * 60 * 60 * 1000;
        break;
      case 'days':
        delayMs = delayValue * 24 * 60 * 60 * 1000;
        break;
    }

    const waitUntil = new Date(Date.now() + delayMs);

    return {
      success: true,
      nextStepId: step.nextStepId,
      shouldWait: true,
      waitUntil,
    };
  }

  /**
   * タグ追加ステップ
   */
  private async executeAddTag(
    step: WorkflowStep,
    config: StepConfig,
    context: ExecutionContext
  ): Promise<{ success: boolean; nextStepId: string | null; error?: string }> {
    if (!context.contact) {
      return { success: false, nextStepId: null, error: 'No contact associated with execution' };
    }

    const tagsToAdd = config.tags || (config.tag ? [config.tag] : []);
    if (tagsToAdd.length === 0) {
      return { success: true, nextStepId: step.nextStepId };
    }

    const currentTags = context.contact.tags || [];
    const newTags = Array.from(new Set([...currentTags, ...tagsToAdd]));

    await prisma.contact.update({
      where: { id: context.contact.id },
      data: { tags: newTags },
    });

    // アクティビティログを記録
    await prisma.contactActivity.create({
      data: {
        contactId: context.contact.id,
        type: 'workflow_tag_added',
        description: `Tags added: ${tagsToAdd.join(', ')}`,
        metadata: {
          workflowId: step.workflowId,
          stepId: step.id,
          tags: tagsToAdd,
        },
      },
    });

    return { success: true, nextStepId: step.nextStepId };
  }

  /**
   * タグ削除ステップ
   */
  private async executeRemoveTag(
    step: WorkflowStep,
    config: StepConfig,
    context: ExecutionContext
  ): Promise<{ success: boolean; nextStepId: string | null; error?: string }> {
    if (!context.contact) {
      return { success: false, nextStepId: null, error: 'No contact associated with execution' };
    }

    const tagsToRemove = config.tags || (config.tag ? [config.tag] : []);
    if (tagsToRemove.length === 0) {
      return { success: true, nextStepId: step.nextStepId };
    }

    const currentTags = context.contact.tags || [];
    const newTags = currentTags.filter((tag) => !tagsToRemove.includes(tag));

    await prisma.contact.update({
      where: { id: context.contact.id },
      data: { tags: newTags },
    });

    // アクティビティログを記録
    await prisma.contactActivity.create({
      data: {
        contactId: context.contact.id,
        type: 'workflow_tag_removed',
        description: `Tags removed: ${tagsToRemove.join(', ')}`,
        metadata: {
          workflowId: step.workflowId,
          stepId: step.id,
          tags: tagsToRemove,
        },
      },
    });

    return { success: true, nextStepId: step.nextStepId };
  }

  /**
   * コンタクト更新ステップ
   */
  private async executeUpdateContact(
    step: WorkflowStep,
    config: StepConfig,
    context: ExecutionContext
  ): Promise<{ success: boolean; nextStepId: string | null; error?: string }> {
    if (!context.contact) {
      return { success: false, nextStepId: null, error: 'No contact associated with execution' };
    }

    const fields = config.fields || {};
    if (Object.keys(fields).length === 0) {
      return { success: true, nextStepId: step.nextStepId };
    }

    // 許可されたフィールドのみ更新
    const allowedFields = ['firstName', 'lastName', 'phone', 'company', 'jobTitle', 'source'];
    const updateData: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(fields)) {
      if (allowedFields.includes(key)) {
        updateData[key] = value;
      }
    }

    // customFieldsの更新
    if (fields.customFields && typeof fields.customFields === 'object') {
      const existingCustomFields = (context.contact.customFields as Record<string, unknown>) || {};
      updateData.customFields = {
        ...existingCustomFields,
        ...(fields.customFields as Record<string, unknown>),
      };
    }

    await prisma.contact.update({
      where: { id: context.contact.id },
      data: updateData,
    });

    // アクティビティログを記録
    await prisma.contactActivity.create({
      data: {
        contactId: context.contact.id,
        type: 'workflow_contact_updated',
        description: `Contact fields updated`,
        metadata: {
          workflowId: step.workflowId,
          stepId: step.id,
          fields: Object.keys(updateData),
        },
      },
    });

    return { success: true, nextStepId: step.nextStepId };
  }

  /**
   * Webhookステップ
   */
  private async executeWebhook(
    step: WorkflowStep,
    config: StepConfig,
    context: ExecutionContext
  ): Promise<{ success: boolean; nextStepId: string | null; data?: Record<string, unknown>; error?: string }> {
    if (!config.webhookUrl) {
      return { success: false, nextStepId: null, error: 'Webhook URL is required' };
    }

    try {
      const response = await fetch(config.webhookUrl, {
        method: config.webhookMethod || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...config.webhookHeaders,
        },
        body: config.webhookMethod !== 'GET' ? JSON.stringify({
          contact: context.contact,
          data: context.data,
          workflow: {
            id: step.workflowId,
            stepId: step.id,
          },
          ...(typeof config.webhookBody === 'object' && config.webhookBody !== null ? config.webhookBody : {}),
        }) : undefined,
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          success: false,
          nextStepId: null,
          error: `Webhook failed with status ${response.status}`,
        };
      }

      return {
        success: true,
        nextStepId: step.nextStepId,
        data: { webhookResponse: responseData },
      };
    } catch (error) {
      return {
        success: false,
        nextStepId: null,
        error: error instanceof Error ? error.message : 'Webhook request failed',
      };
    }
  }

  /**
   * 条件分岐ステップ
   */
  private async executeCondition(
    step: WorkflowStep,
    config: StepConfig,
    context: ExecutionContext
  ): Promise<{ success: boolean; nextStepId: string | null }> {
    const conditions = config.conditions || [];
    const logic = config.conditionLogic || 'and';
    const stepConditions = step.conditions as { trueStepId?: string; falseStepId?: string } | null;

    if (conditions.length === 0) {
      return { success: true, nextStepId: step.nextStepId };
    }

    const results = conditions.map((condition) => {
      const fieldValue = this.getFieldValue(condition.field, context);
      return this.evaluateCondition(fieldValue, condition.operator, condition.value);
    });

    const conditionMet = logic === 'and'
      ? results.every((r) => r)
      : results.some((r) => r);

    // 条件に応じて次のステップを決定
    const nextStepId = conditionMet
      ? stepConditions?.trueStepId || step.nextStepId
      : stepConditions?.falseStepId || step.nextStepId;

    return { success: true, nextStepId };
  }

  /**
   * 別ワークフロー開始ステップ
   */
  private async executeStartWorkflow(
    step: WorkflowStep,
    config: StepConfig,
    context: ExecutionContext
  ): Promise<{ success: boolean; nextStepId: string | null; error?: string }> {
    if (!config.targetWorkflowId) {
      return { success: false, nextStepId: null, error: 'Target workflow ID is required' };
    }

    const targetWorkflow = await prisma.workflow.findUnique({
      where: { id: config.targetWorkflowId },
      include: {
        steps: {
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
      },
    });

    if (!targetWorkflow) {
      return { success: false, nextStepId: null, error: 'Target workflow not found' };
    }

    if (!targetWorkflow.isActive) {
      return { success: false, nextStepId: null, error: 'Target workflow is not active' };
    }

    const firstStep = targetWorkflow.steps[0];

    // 新しい実行を作成
    await prisma.workflowExecution.create({
      data: {
        workflowId: config.targetWorkflowId,
        contactId: context.contact?.id,
        status: 'RUNNING',
        currentStep: firstStep?.id,
        data: context.data as Prisma.InputJsonValue,
      },
    });

    return { success: true, nextStepId: step.nextStepId };
  }

  /**
   * フィールド値を取得
   */
  private getFieldValue(field: string, context: ExecutionContext): unknown {
    const parts = field.split('.');
    let value: unknown = { contact: context.contact, data: context.data };

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = (value as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * 条件を評価
   */
  private evaluateCondition(fieldValue: unknown, operator: string, targetValue: unknown): boolean {
    switch (operator) {
      case 'equals':
        return fieldValue === targetValue;
      case 'not_equals':
        return fieldValue !== targetValue;
      case 'contains':
        return typeof fieldValue === 'string' && typeof targetValue === 'string'
          ? fieldValue.includes(targetValue)
          : false;
      case 'not_contains':
        return typeof fieldValue === 'string' && typeof targetValue === 'string'
          ? !fieldValue.includes(targetValue)
          : false;
      case 'greater_than':
        return typeof fieldValue === 'number' && typeof targetValue === 'number'
          ? fieldValue > targetValue
          : false;
      case 'less_than':
        return typeof fieldValue === 'number' && typeof targetValue === 'number'
          ? fieldValue < targetValue
          : false;
      case 'is_empty':
        return fieldValue === null || fieldValue === undefined || fieldValue === '';
      case 'is_not_empty':
        return fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
      default:
        return false;
    }
  }
}

export const workflowEngine = new WorkflowEngine();
