'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useScenarioStore } from '@/lib/stores/scenario-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  MoreVertical,
  Play,
  Pause,
  Users,
  Settings,
  UserPlus,
  StopCircle,
  PlayCircle,
  Loader2,
  Trash2,
  Workflow,
} from 'lucide-react';
import type { ScenarioNode, ScenarioEdge } from '@/components/scenario-editor';

// Dynamically import the flow editor to avoid SSR issues
const ScenarioFlowEditor = dynamic(
  () => import('@/components/scenario-editor/scenario-flow-editor').then((mod) => mod.ScenarioFlowEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    ),
  }
);

export default function ScenarioDetailPage() {
  const params = useParams();
  const locale = params.locale as string;
  const scenarioId = params.scenarioId as string;

  const {
    getScenarioById,
    getStepsByScenario,
    getReadersByScenario,
    updateScenario,
    activateScenario,
    deactivateScenario,
    addReader,
    stopReader,
    resumeReader,
    removeReader,
  } = useScenarioStore();

  const scenario = getScenarioById(scenarioId);
  const scenarioSteps = getStepsByScenario(scenarioId);
  const scenarioReaders = getReadersByScenario(scenarioId);

  const [activeTab, setActiveTab] = useState('editor');

  // Flow editor state
  const [flowNodes, setFlowNodes] = useState<ScenarioNode[]>([]);
  const [flowEdges, setFlowEdges] = useState<ScenarioEdge[]>([]);

  // Reader dialog
  const [isReaderDialogOpen, setIsReaderDialogOpen] = useState(false);
  const [readerForm, setReaderForm] = useState({
    contactName: '',
    contactEmail: '',
  });

  // Settings
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    name: '',
    description: '',
    excludeUnsubscribed: true,
    excludeBlocked: true,
    excludeActiveScenarios: false,
  });

  // Initialize flow nodes from existing steps
  useEffect(() => {
    if (scenario) {
      setSettingsForm({
        name: scenario.name,
        description: scenario.description || '',
        excludeUnsubscribed: scenario.excludeUnsubscribed,
        excludeBlocked: scenario.excludeBlocked,
        excludeActiveScenarios: scenario.excludeActiveScenarios,
      });

      // Convert existing steps to flow nodes if any
      if (scenarioSteps.length > 0) {
        const nodes: ScenarioNode[] = scenarioSteps.map((step, index) => ({
          id: step.id,
          type: step.type as ScenarioNode['type'],
          position: { x: 250, y: 100 + index * 150 },
          data: {
            name: step.name,
            ...(step.type === 'email' && step.email ? {
              subject: step.email.subject,
              fromName: step.email.fromName,
              fromEmail: step.email.fromEmail,
              htmlContent: step.email.htmlContent,
            } : {}),
          },
        }));

        // Create edges between consecutive nodes
        const edges: ScenarioEdge[] = [];
        for (let i = 0; i < nodes.length - 1; i++) {
          edges.push({
            id: `edge-${nodes[i].id}-${nodes[i + 1].id}`,
            source: nodes[i].id,
            target: nodes[i + 1].id,
          });
        }

        setFlowNodes(nodes);
        setFlowEdges(edges);
      } else {
        // Add default trigger node for new scenarios
        setFlowNodes([
          {
            id: 'trigger-1',
            type: 'trigger',
            position: { x: 250, y: 50 },
            data: { name: 'Start', triggerType: 'manual' },
          },
        ]);
        setFlowEdges([]);
      }
    }
  }, [scenario, scenarioSteps]);

  if (!scenario) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading scenario...</p>
        </div>
      </div>
    );
  }

  const handleReaderSubmit = () => {
    if (!readerForm.contactEmail.trim()) return;

    addReader(scenarioId, {
      scenarioId,
      contactId: crypto.randomUUID(),
      contactName: readerForm.contactName,
      contactEmail: readerForm.contactEmail,
      status: 'active',
    });

    setIsReaderDialogOpen(false);
    setReaderForm({ contactName: '', contactEmail: '' });
  };

  const handleSettingsSave = () => {
    updateScenario(scenarioId, {
      name: settingsForm.name,
      description: settingsForm.description || undefined,
      excludeUnsubscribed: settingsForm.excludeUnsubscribed,
      excludeBlocked: settingsForm.excludeBlocked,
      excludeActiveScenarios: settingsForm.excludeActiveScenarios,
    });
    setIsSettingsOpen(false);
  };

  const handleNodesChange = (nodes: ScenarioNode[]) => {
    setFlowNodes(nodes);
    // TODO: Persist nodes to store/API
  };

  const handleEdgesChange = (edges: ScenarioEdge[]) => {
    setFlowEdges(edges);
    // TODO: Persist edges to store/API
  };

  const getReaderStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'stopped':
        return <Badge variant="secondary">Stopped</Badge>;
      case 'unsubscribed':
        return <Badge variant="outline">Unsubscribed</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="p-4 border-b bg-card">
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/scenarios`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold">{scenario.name}</h1>
              {scenario.status === 'active' ? (
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              ) : scenario.status === 'inactive' ? (
                <Badge variant="secondary">Inactive</Badge>
              ) : (
                <Badge variant="outline">Draft</Badge>
              )}
            </div>
            {scenario.description && (
              <p className="text-sm text-muted-foreground mt-1">{scenario.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Stats */}
            <div className="flex items-center gap-4 mr-4 text-sm">
              <div className="text-center">
                <div className="font-semibold">{flowNodes.length}</div>
                <div className="text-xs text-muted-foreground">Nodes</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-600">{scenario.activeReaders}</div>
                <div className="text-xs text-muted-foreground">Active</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-blue-600">{scenario.completedReaders}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
            </div>

            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Scenario Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Scenario Name</Label>
                    <Input
                      value={settingsForm.name}
                      onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={settingsForm.description}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, description: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-4">
                    <Label>Exclusion Settings</Label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Exclude unsubscribed readers</span>
                        <Switch
                          checked={settingsForm.excludeUnsubscribed}
                          onCheckedChange={(checked) =>
                            setSettingsForm({ ...settingsForm, excludeUnsubscribed: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Exclude blocked readers</span>
                        <Switch
                          checked={settingsForm.excludeBlocked}
                          onCheckedChange={(checked) =>
                            setSettingsForm({ ...settingsForm, excludeBlocked: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Exclude readers in active scenarios</span>
                        <Switch
                          checked={settingsForm.excludeActiveScenarios}
                          onCheckedChange={(checked) =>
                            setSettingsForm({ ...settingsForm, excludeActiveScenarios: checked })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSettingsSave}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {scenario.status === 'active' ? (
              <Button variant="outline" onClick={() => deactivateScenario(scenarioId)}>
                <Pause className="h-4 w-4 mr-2" />
                Deactivate
              </Button>
            ) : (
              <Button onClick={() => activateScenario(scenarioId)}>
                <Play className="h-4 w-4 mr-2" />
                Activate
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b px-4 bg-card">
          <TabsList className="h-12">
            <TabsTrigger value="editor" className="gap-2">
              <Workflow className="h-4 w-4" />
              Flow Editor
            </TabsTrigger>
            <TabsTrigger value="readers" className="gap-2">
              <Users className="h-4 w-4" />
              Readers ({scenarioReaders.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="editor" className="flex-1 m-0 overflow-hidden">
          <div className="h-full">
            <ScenarioFlowEditor
              initialNodes={flowNodes}
              initialEdges={flowEdges}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
            />
          </div>
        </TabsContent>

        <TabsContent value="readers" className="flex-1 overflow-hidden m-0">
          <ScrollArea className="h-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Scenario Readers</h2>
                <Dialog open={isReaderDialogOpen} onOpenChange={setIsReaderDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Reader
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Reader</DialogTitle>
                      <DialogDescription>
                        Add a new reader to this scenario manually.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          value={readerForm.contactName}
                          onChange={(e) =>
                            setReaderForm({ ...readerForm, contactName: e.target.value })
                          }
                          placeholder="Reader name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={readerForm.contactEmail}
                          onChange={(e) =>
                            setReaderForm({ ...readerForm, contactEmail: e.target.value })
                          }
                          placeholder="reader@example.com"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsReaderDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleReaderSubmit}
                        disabled={!readerForm.contactEmail.trim()}
                      >
                        Add
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {scenarioReaders.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No readers yet</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Add readers manually or set up automatic triggers
                    </p>
                    <Button onClick={() => setIsReaderDialogOpen(true)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Reader
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reader</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Current Step</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Next Delivery</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scenarioReaders.map((reader) => (
                      <TableRow key={reader.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{reader.contactName || 'Unknown'}</div>
                            <div className="text-sm text-muted-foreground">
                              {reader.contactEmail}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getReaderStatusBadge(reader.status)}</TableCell>
                        <TableCell>
                          Step {reader.currentStepOrder + 1} / {flowNodes.length}
                        </TableCell>
                        <TableCell>
                          {new Date(reader.startedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {reader.nextDeliveryAt
                            ? new Date(reader.nextDeliveryAt).toLocaleString()
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {reader.status === 'active' ? (
                                <DropdownMenuItem
                                  onClick={() => stopReader(scenarioId, reader.id)}
                                >
                                  <StopCircle className="h-4 w-4 mr-2" />
                                  Stop
                                </DropdownMenuItem>
                              ) : reader.status === 'stopped' ? (
                                <DropdownMenuItem
                                  onClick={() => resumeReader(scenarioId, reader.id)}
                                >
                                  <PlayCircle className="h-4 w-4 mr-2" />
                                  Resume
                                </DropdownMenuItem>
                              ) : null}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  if (confirm('Are you sure you want to remove this reader?')) {
                                    removeReader(scenarioId, reader.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
