'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Clock, Calendar, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DelayNodeProps {
  data: {
    name: string;
    delayType: 'relative' | 'absolute' | 'day_of_week';
    days?: number;
    hours?: number;
    minutes?: number;
    absoluteDate?: string;
    dayOfWeek?: number;
    timeOfDay?: string;
  };
  selected?: boolean;
}

function DelayNodeComponent({ data, selected }: DelayNodeProps) {
  const getDelayIcon = () => {
    switch (data.delayType) {
      case 'relative':
        return <Timer className="h-4 w-4" />;
      case 'absolute':
        return <Calendar className="h-4 w-4" />;
      case 'day_of_week':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getDelayDescription = () => {
    switch (data.delayType) {
      case 'relative': {
        const parts = [];
        if (data.days) parts.push(`${data.days}d`);
        if (data.hours) parts.push(`${data.hours}h`);
        if (data.minutes) parts.push(`${data.minutes}m`);
        return parts.length > 0 ? `Wait ${parts.join(' ')}` : 'Wait';
      }
      case 'absolute':
        return data.absoluteDate
          ? `Until ${new Date(data.absoluteDate).toLocaleDateString()}`
          : 'Specific date';
      case 'day_of_week': {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return data.dayOfWeek !== undefined
          ? `Every ${days[data.dayOfWeek]} at ${data.timeOfDay || '09:00'}`
          : 'Day of week';
      }
      default:
        return 'Wait';
    }
  };

  return (
    <div
      className={cn(
        'px-4 py-3 shadow-lg rounded-lg border-2 bg-card min-w-[180px]',
        'border-orange-500',
        selected && 'ring-2 ring-orange-500 ring-offset-2 ring-offset-background'
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-orange-500 !w-3 !h-3 !border-2 !border-background"
      />

      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600">{getDelayIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-orange-600 uppercase tracking-wider">Delay</div>
          <div className="font-semibold text-sm truncate">{data.name || 'Wait'}</div>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-border">
        <div className="text-xs text-muted-foreground">{getDelayDescription()}</div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-orange-500 !w-3 !h-3 !border-2 !border-background"
      />
    </div>
  );
}

export const DelayNode = memo(DelayNodeComponent);
