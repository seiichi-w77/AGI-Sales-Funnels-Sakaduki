'use client';

import { useCallback, useRef, useState, useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  ReactFlowInstance,
  BackgroundVariant,
  MarkerType,
  Panel,
} from '@xyflow/react';

import { TriggerNode } from './nodes/trigger-node';
import { EmailNode } from './nodes/email-node';
import { LineNode } from './nodes/line-node';
import { DelayNode } from './nodes/delay-node';
import { ConditionNode } from './nodes/condition-node';
import { ActionNode } from './nodes/action-node';
import { NodePalette } from './node-palette';
import { NodeConfigPanel } from './node-config-panel';
import { cn } from '@/lib/utils';

export interface ScenarioNode {
  id: string;
  type: 'trigger' | 'email' | 'line' | 'delay' | 'condition' | 'action';
  data: Record<string, unknown>;
  position: { x: number; y: number };
}

export interface ScenarioEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
}

interface ScenarioFlowEditorProps {
  initialNodes?: ScenarioNode[];
  initialEdges?: ScenarioEdge[];
  onNodesChange?: (nodes: ScenarioNode[]) => void;
  onEdgesChange?: (edges: ScenarioEdge[]) => void;
  onNodeSelect?: (node: ScenarioNode | null) => void;
  readOnly?: boolean;
}

const nodeTypes = {
  trigger: TriggerNode,
  email: EmailNode,
  line: LineNode,
  delay: DelayNode,
  condition: ConditionNode,
  action: ActionNode,
};

const defaultEdgeOptions = {
  type: 'smoothstep',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
  },
  style: {
    strokeWidth: 2,
  },
};

function ScenarioFlowEditorInner({
  initialNodes = [],
  initialEdges = [],
  onNodesChange: onNodesChangeCallback,
  onEdgesChange: onEdgesChangeCallback,
  onNodeSelect,
  readOnly = false,
}: ScenarioFlowEditorProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Convert initial nodes to ReactFlow format
  const convertedInitialNodes: Node[] = useMemo(
    () =>
      initialNodes.map((node) => ({
        id: node.id,
        type: node.type,
        data: { ...node.data, label: node.data.name || node.type },
        position: node.position,
      })),
    [initialNodes]
  );

  const convertedInitialEdges: Edge[] = useMemo(
    () =>
      initialEdges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        label: edge.label,
        ...defaultEdgeOptions,
      })),
    [initialEdges]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(convertedInitialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(convertedInitialEdges);

  const onConnect = useCallback(
    (params: Connection) => {
      if (readOnly) return;
      setEdges((eds) => addEdge({ ...params, ...defaultEdgeOptions }, eds));
    },
    [setEdges, readOnly]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (readOnly || !reactFlowInstance || !reactFlowWrapper.current) return;

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: getDefaultNodeData(type),
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes, readOnly]
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
      if (onNodeSelect) {
        onNodeSelect({
          id: node.id,
          type: node.type as ScenarioNode['type'],
          data: node.data,
          position: node.position,
        });
      }
    },
    [onNodeSelect]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    if (onNodeSelect) {
      onNodeSelect(null);
    }
  }, [onNodeSelect]);

  const updateNodeData = useCallback(
    (nodeId: string, data: Record<string, unknown>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: { ...node.data, ...data },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
      setSelectedNode(null);
    },
    [setNodes, setEdges]
  );

  // Notify parent of changes
  const handleNodesChange = useCallback(
    (changes: Parameters<typeof onNodesChange>[0]) => {
      onNodesChange(changes);
      if (onNodesChangeCallback) {
        const updatedNodes: ScenarioNode[] = nodes.map((node) => ({
          id: node.id,
          type: node.type as ScenarioNode['type'],
          data: node.data,
          position: node.position,
        }));
        onNodesChangeCallback(updatedNodes);
      }
    },
    [onNodesChange, onNodesChangeCallback, nodes]
  );

  const handleEdgesChange = useCallback(
    (changes: Parameters<typeof onEdgesChange>[0]) => {
      onEdgesChange(changes);
      if (onEdgesChangeCallback) {
        const updatedEdges: ScenarioEdge[] = edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle || undefined,
          targetHandle: edge.targetHandle || undefined,
          label: edge.label as string | undefined,
        }));
        onEdgesChangeCallback(updatedEdges);
      }
    },
    [onEdgesChange, onEdgesChangeCallback, edges]
  );

  return (
    <div className="flex h-full">
      {/* Node Palette */}
      {!readOnly && (
        <div className="w-64 border-r bg-card">
          <NodePalette />
        </div>
      )}

      {/* Flow Editor */}
      <div className="flex-1 relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          snapToGrid
          snapGrid={[15, 15]}
          deleteKeyCode={readOnly ? null : 'Delete'}
          className={cn('bg-white', readOnly && 'pointer-events-auto')}
        >
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              switch (node.type) {
                case 'trigger':
                  return '#22c55e';
                case 'email':
                  return '#3b82f6';
                case 'line':
                  return '#06b6d4';
                case 'delay':
                  return '#f97316';
                case 'condition':
                  return '#8b5cf6';
                case 'action':
                  return '#ec4899';
                default:
                  return '#6b7280';
              }
            }}
          />
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
          <Panel position="top-right" className="bg-card/80 backdrop-blur p-2 rounded-lg shadow">
            <div className="text-xs text-muted-foreground">
              Nodes: {nodes.length} | Connections: {edges.length}
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Config Panel */}
      {selectedNode && !readOnly && (
        <div className="w-80 border-l bg-card">
          <NodeConfigPanel
            node={{
              id: selectedNode.id,
              type: selectedNode.type as ScenarioNode['type'],
              data: selectedNode.data,
              position: selectedNode.position,
            }}
            onUpdate={(data) => updateNodeData(selectedNode.id, data)}
            onDelete={() => deleteNode(selectedNode.id)}
            onClose={() => {
              setSelectedNode(null);
              if (onNodeSelect) onNodeSelect(null);
            }}
          />
        </div>
      )}
    </div>
  );
}

function getDefaultNodeData(type: string): Record<string, unknown> {
  switch (type) {
    case 'trigger':
      return {
        name: 'Start Trigger',
        triggerType: 'manual',
      };
    case 'email':
      return {
        name: 'Send Email',
        subject: '',
        fromName: '',
        fromEmail: '',
        htmlContent: '',
      };
    case 'line':
      return {
        name: 'Send LINE',
        messageType: 'text',
        content: '',
      };
    case 'delay':
      return {
        name: 'Wait',
        delayType: 'relative',
        days: 0,
        hours: 0,
        minutes: 0,
      };
    case 'condition':
      return {
        name: 'Condition',
        conditionType: 'tag',
        operator: 'equals',
        value: '',
      };
    case 'action':
      return {
        name: 'Action',
        actionType: 'addTag',
        value: '',
      };
    default:
      return { name: type };
  }
}

export function ScenarioFlowEditor(props: ScenarioFlowEditorProps) {
  return (
    <ReactFlowProvider>
      <ScenarioFlowEditorInner {...props} />
    </ReactFlowProvider>
  );
}
