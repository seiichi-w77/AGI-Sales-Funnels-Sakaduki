'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { MessageSquare, Image, FileText, Film } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LineNodeProps {
  data: {
    name: string;
    messageType: 'text' | 'image' | 'flex' | 'video' | 'rich';
    content?: string;
  };
  selected?: boolean;
}

function LineNodeComponent({ data, selected }: LineNodeProps) {
  const getMessageIcon = () => {
    switch (data.messageType) {
      case 'text':
        return <MessageSquare className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'flex':
        return <FileText className="h-4 w-4" />;
      case 'video':
        return <Film className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getMessageLabel = () => {
    switch (data.messageType) {
      case 'text':
        return 'Text Message';
      case 'image':
        return 'Image';
      case 'flex':
        return 'Flex Message';
      case 'video':
        return 'Video';
      case 'rich':
        return 'Rich Message';
      default:
        return 'LINE Message';
    }
  };

  return (
    <div
      className={cn(
        'px-4 py-3 shadow-lg rounded-lg border-2 bg-card min-w-[180px]',
        'border-cyan-500',
        selected && 'ring-2 ring-cyan-500 ring-offset-2 ring-offset-background'
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-cyan-500 !w-3 !h-3 !border-2 !border-background"
      />

      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600">{getMessageIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-cyan-600 uppercase tracking-wider">LINE</div>
          <div className="font-semibold text-sm truncate">{data.name || getMessageLabel()}</div>
        </div>
      </div>

      {data.content && (
        <div className="mt-2 pt-2 border-t border-border">
          <div className="text-xs text-muted-foreground truncate line-clamp-2">{data.content}</div>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-cyan-500 !w-3 !h-3 !border-2 !border-background"
      />
    </div>
  );
}

export const LineNode = memo(LineNodeComponent);
