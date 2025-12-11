'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Play, Zap, Calendar, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TriggerNodeProps {
  data: {
    name: string;
    triggerType: 'manual' | 'form_submit' | 'tag_added' | 'schedule' | 'webhook';
  };
  selected?: boolean;
}

function TriggerNodeComponent({ data, selected }: TriggerNodeProps) {
  const getTriggerIcon = () => {
    switch (data.triggerType) {
      case 'manual':
        return <Play className="h-4 w-4" />;
      case 'form_submit':
        return <Zap className="h-4 w-4" />;
      case 'schedule':
        return <Calendar className="h-4 w-4" />;
      case 'webhook':
        return <Link2 className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getTriggerLabel = () => {
    switch (data.triggerType) {
      case 'manual':
        return 'Manual Start';
      case 'form_submit':
        return 'Form Submit';
      case 'tag_added':
        return 'Tag Added';
      case 'schedule':
        return 'Schedule';
      case 'webhook':
        return 'Webhook';
      default:
        return 'Trigger';
    }
  };

  return (
    <div
      className={cn(
        'px-4 py-3 shadow-lg rounded-lg border-2 bg-card min-w-[180px]',
        'border-green-500',
        selected && 'ring-2 ring-green-500 ring-offset-2 ring-offset-background'
      )}
    >
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-green-500/10 text-green-600">{getTriggerIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-green-600 uppercase tracking-wider">
            Trigger
          </div>
          <div className="font-semibold text-sm truncate">{data.name || getTriggerLabel()}</div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-green-500 !w-3 !h-3 !border-2 !border-background"
      />
    </div>
  );
}

export const TriggerNode = memo(TriggerNodeComponent);
