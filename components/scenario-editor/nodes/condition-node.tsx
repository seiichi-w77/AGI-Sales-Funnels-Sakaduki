'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitBranch, Tag, Mail, MousePointer, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConditionNodeProps {
  data: {
    name: string;
    conditionType: 'tag' | 'email_opened' | 'email_clicked' | 'purchased' | 'custom';
    operator: 'equals' | 'not_equals' | 'contains' | 'not_contains';
    value?: string;
  };
  selected?: boolean;
}

function ConditionNodeComponent({ data, selected }: ConditionNodeProps) {
  const getConditionIcon = () => {
    switch (data.conditionType) {
      case 'tag':
        return <Tag className="h-4 w-4" />;
      case 'email_opened':
        return <Mail className="h-4 w-4" />;
      case 'email_clicked':
        return <MousePointer className="h-4 w-4" />;
      case 'purchased':
        return <ShoppingCart className="h-4 w-4" />;
      default:
        return <GitBranch className="h-4 w-4" />;
    }
  };

  const getConditionLabel = () => {
    switch (data.conditionType) {
      case 'tag':
        return 'Has Tag';
      case 'email_opened':
        return 'Email Opened';
      case 'email_clicked':
        return 'Link Clicked';
      case 'purchased':
        return 'Purchased';
      default:
        return 'Condition';
    }
  };

  return (
    <div
      className={cn(
        'px-4 py-3 shadow-lg rounded-lg border-2 bg-card min-w-[180px]',
        'border-purple-500',
        selected && 'ring-2 ring-purple-500 ring-offset-2 ring-offset-background'
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-purple-500 !w-3 !h-3 !border-2 !border-background"
      />

      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">{getConditionIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-purple-600 uppercase tracking-wider">
            Condition
          </div>
          <div className="font-semibold text-sm truncate">{data.name || getConditionLabel()}</div>
        </div>
      </div>

      {data.value && (
        <div className="mt-2 pt-2 border-t border-border">
          <div className="text-xs text-muted-foreground truncate">{data.value}</div>
        </div>
      )}

      {/* Yes/No branches */}
      <div className="flex justify-between mt-3 text-xs">
        <div className="flex items-center gap-1 text-green-600">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          Yes
        </div>
        <div className="flex items-center gap-1 text-red-600">
          No
          <div className="w-2 h-2 rounded-full bg-red-500" />
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="yes"
        style={{ left: '25%' }}
        className="!bg-green-500 !w-3 !h-3 !border-2 !border-background"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="no"
        style={{ left: '75%' }}
        className="!bg-red-500 !w-3 !h-3 !border-2 !border-background"
      />
    </div>
  );
}

export const ConditionNode = memo(ConditionNodeComponent);
