'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useWorkspace } from '@/components/providers/dashboard-providers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  MoreVertical,
  Zap,
  Mail,
  Clock,
  Users,
  Play,
  GitBranch,
  Search,
  Loader2,
  Edit,
  Trash,
  Eye,
} from 'lucide-react';

interface Workflow {
  id: string;
  name: string;
  description: string | null;
  trigger: {
    type: string;
    config?: Record<string, unknown>;
  };
  status: string;
  isActive: boolean;
  stepCount: number;
  executionCount: number;
  stats: {
    running: number;
    completed: number;
    failed: number;
  };
  createdAt: string;
}

const triggerOptions = [
  { value: 'OPTIN', label: 'Opt-In', icon: Users, description: 'When a contact opts in' },
  { value: 'PURCHASE', label: 'Purchase', icon: Zap, description: 'When a purchase is made' },
  { value: 'PAGE_VIEW', label: 'Page View', icon: Eye, description: 'When a page is viewed' },
  { value: 'TAG_ADDED', label: 'Tag Added', icon: Users, description: 'When a tag is added' },
  { value: 'TAG_REMOVED', label: 'Tag Removed', icon: Users, description: 'When a tag is removed' },
  { value: 'FORM_SUBMIT', label: 'Form Submit', icon: GitBranch, description: 'When a form is submitted' },
];

export default function WorkflowsPage() {
  const t = useTranslations('workflows');
  const router = useRouter();
  const { currentWorkspace, isLoading: workspaceLoading } = useWorkspace();

  // WorkspaceContextからworkspaceIdを取得
  const workspaceId = currentWorkspace?.id;

  // State
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Create dialog
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTriggerType, setNewTriggerType] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Delete dialog
  const [deleteConfirm, setDeleteConfirm] = useState<Workflow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchWorkflows = useCallback(async () => {
    if (!workspaceId) return;
    try {
      const params = new URLSearchParams({ workspaceId });
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (search) params.append('search', search);

      const response = await fetch(`/api/workflows?${params}`);
      if (!response.ok) throw new Error('Failed to fetch workflows');
      const data = await response.json();
      setWorkflows(data.workflows || []);
    } catch (error) {
      console.error('Fetch workflows error:', error);
    }
  }, [workspaceId, statusFilter, search]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchWorkflows();
      setIsLoading(false);
    };
    loadData();
  }, [fetchWorkflows]);

  const handleCreate = async () => {
    if (!newName.trim() || !newTriggerType || !workspaceId) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          name: newName,
          description: newDescription || undefined,
          trigger: {
            type: newTriggerType,
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to create workflow');

      const data = await response.json();
      setIsCreateOpen(false);
      setNewName('');
      setNewDescription('');
      setNewTriggerType('');
      router.push(`/workflows/${data.workflow.id}`);
    } catch (error) {
      console.error('Create workflow error:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleActive = async (workflow: Workflow) => {
    try {
      const response = await fetch(`/api/workflows/${workflow.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: !workflow.isActive,
        }),
      });

      if (!response.ok) throw new Error('Failed to update workflow');
      await fetchWorkflows();
    } catch (error) {
      console.error('Toggle workflow error:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/workflows/${deleteConfirm.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Failed to delete workflow');
        return;
      }

      setDeleteConfirm(null);
      await fetchWorkflows();
    } catch (error) {
      console.error('Delete workflow error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getTriggerLabel = (trigger: Workflow['trigger']) => {
    const option = triggerOptions.find((o) => o.value === trigger.type);
    return option?.label || trigger.type;
  };

  // Stats
  const activeWorkflows = workflows.filter((w) => w.isActive).length;
  const totalExecutions = workflows.reduce((sum, w) => sum + w.executionCount, 0);
  const completedExecutions = workflows.reduce((sum, w) => sum + w.stats.completed, 0);
  const runningExecutions = workflows.reduce((sum, w) => sum + w.stats.running, 0);

  if (isLoading || workspaceLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!workspaceId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-muted-foreground">ワークスペースを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">
            Create automated workflows to engage your audience
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('create')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeWorkflows}</div>
            <p className="text-xs text-muted-foreground">{workflows.length} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExecutions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{runningExecutions} running</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedExecutions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalExecutions > 0 ? Math.round((completedExecutions / totalExecutions) * 100) : 0}% completion rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workflows.reduce((sum, w) => sum + w.stats.failed, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search workflows..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="PAUSED">Paused</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Empty State */}
      {workflows.length === 0 && (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-primary/10">
              <GitBranch className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No workflows yet</h3>
              <p className="text-muted-foreground">
                Create your first workflow to automate your marketing
              </p>
            </div>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Workflow
            </Button>
          </div>
        </Card>
      )}

      {/* Workflows List */}
      <div className="grid gap-4">
        {workflows.map((workflow) => (
          <Card key={workflow.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`p-2 rounded-lg ${
                    workflow.isActive ? 'bg-green-100' : 'bg-gray-100'
                  }`}
                >
                  <GitBranch
                    className={`h-5 w-5 ${
                      workflow.isActive ? 'text-green-600' : 'text-gray-500'
                    }`}
                  />
                </div>
                <div>
                  <CardTitle className="text-lg">{workflow.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Zap className="h-3 w-3" />
                    Trigger: {getTriggerLabel(workflow.trigger)}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {workflow.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <Switch
                    checked={workflow.isActive}
                    onCheckedChange={() => handleToggleActive(workflow)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/workflows/${workflow.id}`)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Workflow
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/workflows/${workflow.id}/executions`)}>
                      <Users className="h-4 w-4 mr-2" />
                      View Executions
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/workflows/${workflow.id}/emails`)}>
                      <Mail className="h-4 w-4 mr-2" />
                      View Emails
                    </DropdownMenuItem>
                    {workflow.stats.running === 0 && (
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteConfirm(workflow)}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Steps</p>
                  <p className="font-medium">{workflow.stepCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Executions</p>
                  <p className="font-medium">{workflow.executionCount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Completed</p>
                  <p className="font-medium">{workflow.stats.completed.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Success Rate</p>
                  <p className="font-medium">
                    {workflow.executionCount > 0
                      ? ((workflow.stats.completed / workflow.executionCount) * 100).toFixed(1)
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Workflow</DialogTitle>
            <DialogDescription>
              Set up an automated workflow triggered by user actions
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="workflow-name">Workflow Name *</Label>
              <Input
                id="workflow-name"
                placeholder="e.g., Welcome Sequence"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="workflow-description">Description</Label>
              <Input
                id="workflow-description"
                placeholder="Brief description of the workflow"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="trigger">Trigger *</Label>
              <Select value={newTriggerType} onValueChange={setNewTriggerType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a trigger" />
                </SelectTrigger>
                <SelectContent>
                  {triggerOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="h-4 w-4" />
                        <span>{option.label}</span>
                        <span className="text-xs text-muted-foreground">
                          - {option.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!newName.trim() || !newTriggerType || isCreating}
            >
              {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create & Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workflow</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteConfirm?.name}&quot;? This will also delete all steps and execution history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
