'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Zap, Tag, UserPlus, UserMinus, Bell, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionNodeProps {
  data: {
    name: string;
    actionType: 'addTag' | 'removeTag' | 'addToScenario' | 'removeFromScenario' | 'notify' | 'webhook';
    value?: string;
  };
  selected?: boolean;
}

function ActionNodeComponent({ data, selected }: ActionNodeProps) {
  const getActionIcon = () => {
    switch (data.actionType) {
      case 'addTag':
        return <Tag className="h-4 w-4" />;
      case 'removeTag':
        return <Tag className="h-4 w-4" />;
      case 'addToScenario':
        return <UserPlus className="h-4 w-4" />;
      case 'removeFromScenario':
        return <UserMinus className="h-4 w-4" />;
      case 'notify':
        return <Bell className="h-4 w-4" />;
      case 'webhook':
        return <ExternalLink className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getActionLabel = () => {
    switch (data.actionType) {
      case 'addTag':
        return 'Add Tag';
      case 'removeTag':
        return 'Remove Tag';
      case 'addToScenario':
        return 'Add to Scenario';
      case 'removeFromScenario':
        return 'Remove from Scenario';
      case 'notify':
        return 'Send Notification';
      case 'webhook':
        return 'Call Webhook';
      default:
        return 'Action';
    }
  };

  return (
    <div
      className={cn(
        'px-4 py-3 shadow-lg rounded-lg border-2 bg-card min-w-[180px]',
        'border-pink-500',
        selected && 'ring-2 ring-pink-500 ring-offset-2 ring-offset-background'
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-pink-500 !w-3 !h-3 !border-2 !border-background"
      />

      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-pink-500/10 text-pink-600">{getActionIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-pink-600 uppercase tracking-wider">Action</div>
          <div className="font-semibold text-sm truncate">{data.name || getActionLabel()}</div>
        </div>
      </div>

      {data.value && (
        <div className="mt-2 pt-2 border-t border-border">
          <div className="text-xs text-muted-foreground truncate">{data.value}</div>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-pink-500 !w-3 !h-3 !border-2 !border-background"
      />
    </div>
  );
}

export const ActionNode = memo(ActionNodeComponent);
