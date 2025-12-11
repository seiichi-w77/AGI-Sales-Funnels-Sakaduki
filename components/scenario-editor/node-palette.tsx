'use client';

import { DragEvent } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Mail, MessageSquare, Clock, GitBranch, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NodeType {
  type: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const nodeTypes: NodeType[] = [
  {
    type: 'trigger',
    label: 'Trigger',
    description: 'Start the scenario',
    icon: <Play className="h-5 w-5" />,
    color: 'bg-green-500/10 text-green-600 border-green-500',
  },
  {
    type: 'email',
    label: 'Email',
    description: 'Send an email',
    icon: <Mail className="h-5 w-5" />,
    color: 'bg-blue-500/10 text-blue-600 border-blue-500',
  },
  {
    type: 'line',
    label: 'LINE',
    description: 'Send LINE message',
    icon: <MessageSquare className="h-5 w-5" />,
    color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500',
  },
  {
    type: 'delay',
    label: 'Delay',
    description: 'Wait before next step',
    icon: <Clock className="h-5 w-5" />,
    color: 'bg-orange-500/10 text-orange-600 border-orange-500',
  },
  {
    type: 'condition',
    label: 'Condition',
    description: 'Branch based on rules',
    icon: <GitBranch className="h-5 w-5" />,
    color: 'bg-purple-500/10 text-purple-600 border-purple-500',
  },
  {
    type: 'action',
    label: 'Action',
    description: 'Perform an action',
    icon: <Zap className="h-5 w-5" />,
    color: 'bg-pink-500/10 text-pink-600 border-pink-500',
  },
];

interface NodePaletteItemProps {
  nodeType: NodeType;
}

function NodePaletteItem({ nodeType }: NodePaletteItemProps) {
  const onDragStart = (event: DragEvent, type: string) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border-2 cursor-grab active:cursor-grabbing transition-all',
        'hover:shadow-md hover:scale-[1.02]',
        nodeType.color
      )}
      draggable
      onDragStart={(e) => onDragStart(e, nodeType.type)}
    >
      <div className="p-2 rounded-lg bg-background/50">{nodeType.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm">{nodeType.label}</div>
        <div className="text-xs text-muted-foreground truncate">{nodeType.description}</div>
      </div>
    </div>
  );
}

export function NodePalette() {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Node Palette</h3>
        <p className="text-xs text-muted-foreground mt-1">Drag nodes to the canvas</p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Start
          </div>
          <NodePaletteItem nodeType={nodeTypes[0]} />

          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-4 mb-2">
            Messages
          </div>
          <NodePaletteItem nodeType={nodeTypes[1]} />
          <NodePaletteItem nodeType={nodeTypes[2]} />

          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-4 mb-2">
            Flow Control
          </div>
          <NodePaletteItem nodeType={nodeTypes[3]} />
          <NodePaletteItem nodeType={nodeTypes[4]} />

          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-4 mb-2">
            Actions
          </div>
          <NodePaletteItem nodeType={nodeTypes[5]} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-muted/50">
        <div className="text-xs text-muted-foreground">
          <strong>Tips:</strong>
          <ul className="mt-1 space-y-1 list-disc list-inside">
            <li>Drag nodes to add</li>
            <li>Connect outputs to inputs</li>
            <li>Click node to configure</li>
            <li>Press Delete to remove</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
