import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';

interface TriggerConfig {
  type: string;
  config?: Record<string, unknown>;
}

interface TriggerEvent {
  type: 'OPTIN' | 'PURCHASE' | 'PAGE_VIEW' | 'TAG_ADDED' | 'TAG_REMOVED' | 'FORM_SUBMIT';
  contactId: string;
  workspaceId: string;
  data?: Record<string, unknown>;
}

/**
 * トリガーイベントを処理し、該当するワークフローを実行開始
 */
export async function handleTriggerEvent(event: TriggerEvent): Promise<void> {
  try {
    // イベントタイプに一致するアクティブなワークフローを検索
    const workflows = await prisma.workflow.findMany({
      where: {
        workspaceId: event.workspaceId,
        isActive: true,
        status: 'ACTIVE',
      },
      include: {
        steps: {
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
      },
    });

    // トリガーが一致するワークフローをフィルタリング
    const matchingWorkflows = workflows.filter((workflow) => {
      const trigger = workflow.trigger as unknown as TriggerConfig;
      if (trigger.type !== event.type) return false;

      // 追加の条件チェック
      if (trigger.config) {
        return checkTriggerConditions(trigger.config, event.data || {});
      }

      return true;
    });

    // 一致するワークフローの実行を開始
    for (const workflow of matchingWorkflows) {
      const firstStep = workflow.steps[0];

      // 同じコンタクトで同じワークフローが既に実行中でないかチェック
      const existingExecution = await prisma.workflowExecution.findFirst({
        where: {
          workflowId: workflow.id,
          contactId: event.contactId,
          status: { in: ['RUNNING', 'WAITING'] },
        },
      });

      if (existingExecution) {
        console.log(`[Workflow] Skipping duplicate execution for workflow ${workflow.id} and contact ${event.contactId}`);
        continue;
      }

      // 新しい実行を作成
      const execution = await prisma.workflowExecution.create({
        data: {
          workflowId: workflow.id,
          contactId: event.contactId,
          status: 'RUNNING',
          currentStep: firstStep?.id,
          data: (event.data || {}) as Prisma.InputJsonValue,
        },
      });

      console.log(`[Workflow] Started execution ${execution.id} for workflow ${workflow.name}`);

      // アクティビティログを記録
      await prisma.contactActivity.create({
        data: {
          contactId: event.contactId,
          type: 'workflow_started',
          description: `Started workflow: ${workflow.name}`,
          metadata: {
            workflowId: workflow.id,
            executionId: execution.id,
            triggerType: event.type,
          },
        },
      });
    }
  } catch (error) {
    console.error('[Workflow] Trigger event handling error:', error);
    throw error;
  }
}

/**
 * トリガー条件をチェック
 */
function checkTriggerConditions(
  config: Record<string, unknown>,
  eventData: Record<string, unknown>
): boolean {
  // フォームID一致チェック
  if (config.formId && eventData.formId !== config.formId) {
    return false;
  }

  // ページURL一致チェック
  if (config.pageUrl && eventData.pageUrl !== config.pageUrl) {
    return false;
  }

  // プロダクトID一致チェック
  if (config.productId && eventData.productId !== config.productId) {
    return false;
  }

  // タグ一致チェック
  if (config.tag && eventData.tag !== config.tag) {
    return false;
  }

  return true;
}

/**
 * オプトイントリガー
 */
export async function triggerOptin(
  workspaceId: string,
  contactId: string,
  data?: Record<string, unknown>
): Promise<void> {
  await handleTriggerEvent({
    type: 'OPTIN',
    workspaceId,
    contactId,
    data,
  });
}

/**
 * 購入トリガー
 */
export async function triggerPurchase(
  workspaceId: string,
  contactId: string,
  data?: Record<string, unknown>
): Promise<void> {
  await handleTriggerEvent({
    type: 'PURCHASE',
    workspaceId,
    contactId,
    data,
  });
}

/**
 * ページビュートリガー
 */
export async function triggerPageView(
  workspaceId: string,
  contactId: string,
  data?: Record<string, unknown>
): Promise<void> {
  await handleTriggerEvent({
    type: 'PAGE_VIEW',
    workspaceId,
    contactId,
    data,
  });
}

/**
 * タグ追加トリガー
 */
export async function triggerTagAdded(
  workspaceId: string,
  contactId: string,
  tag: string,
  data?: Record<string, unknown>
): Promise<void> {
  await handleTriggerEvent({
    type: 'TAG_ADDED',
    workspaceId,
    contactId,
    data: { ...data, tag },
  });
}

/**
 * タグ削除トリガー
 */
export async function triggerTagRemoved(
  workspaceId: string,
  contactId: string,
  tag: string,
  data?: Record<string, unknown>
): Promise<void> {
  await handleTriggerEvent({
    type: 'TAG_REMOVED',
    workspaceId,
    contactId,
    data: { ...data, tag },
  });
}

/**
 * フォーム送信トリガー
 */
export async function triggerFormSubmit(
  workspaceId: string,
  contactId: string,
  formId: string,
  data?: Record<string, unknown>
): Promise<void> {
  await handleTriggerEvent({
    type: 'FORM_SUBMIT',
    workspaceId,
    contactId,
    data: { ...data, formId },
  });
}
