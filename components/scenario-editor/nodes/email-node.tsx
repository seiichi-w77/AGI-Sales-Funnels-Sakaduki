'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmailNodeProps {
  data: {
    name: string;
    subject?: string;
    fromName?: string;
    fromEmail?: string;
    htmlContent?: string;
  };
  selected?: boolean;
}

function EmailNodeComponent({ data, selected }: EmailNodeProps) {
  return (
    <div
      className={cn(
        'px-4 py-3 shadow-lg rounded-lg border-2 bg-card min-w-[180px]',
        'border-blue-500',
        selected && 'ring-2 ring-blue-500 ring-offset-2 ring-offset-background'
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-blue-500 !w-3 !h-3 !border-2 !border-background"
      />

      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
          <Mail className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-blue-600 uppercase tracking-wider">Email</div>
          <div className="font-semibold text-sm truncate">{data.name || 'Send Email'}</div>
        </div>
      </div>

      {data.subject && (
        <div className="mt-2 pt-2 border-t border-border">
          <div className="text-xs text-muted-foreground truncate">Subject: {data.subject}</div>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-blue-500 !w-3 !h-3 !border-2 !border-background"
      />
    </div>
  );
}

export const EmailNode = memo(EmailNodeComponent);
