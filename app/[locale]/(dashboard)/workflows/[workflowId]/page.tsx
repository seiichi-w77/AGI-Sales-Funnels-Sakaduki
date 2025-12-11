'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
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
  Mail,
  Clock,
  Tag,
  Users,
  ArrowLeft,
  Loader2,
  Trash,
  GitBranch,
  Globe,
  Play,
  Square,
} from 'lucide-react';

interface WorkflowStep {
  id: string;
  type: string;
  config: Record<string, unknown>;
  sortOrder: number;
  nextStepId: string | null;
}

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
  steps: WorkflowStep[];
}

const stepTypes = [
  { value: 'SEND_EMAIL', label: 'Send Email', icon: Mail, description: 'Send an email to the contact' },
  { value: 'DELAY', label: 'Delay', icon: Clock, description: 'Wait for a specified time' },
  { value: 'ADD_TAG', label: 'Add Tag', icon: Tag, description: 'Add a tag to the contact' },
  { value: 'REMOVE_TAG', label: 'Remove Tag', icon: Tag, description: 'Remove a tag from the contact' },
  { value: 'UPDATE_CONTACT', label: 'Update Contact', icon: Users, description: 'Update contact fields' },
  { value: 'WEBHOOK', label: 'Webhook', icon: Globe, description: 'Send data to an external URL' },
  { value: 'CONDITION', label: 'Condition', icon: GitBranch, description: 'Branch based on conditions' },
  { value: 'START_WORKFLOW', label: 'Start Workflow', icon: Play, description: 'Start another workflow' },
  { value: 'END', label: 'End', icon: Square, description: 'End the workflow' },
];

const triggerLabels: Record<string, string> = {
  OPTIN: 'Opt-In',
  PURCHASE: 'Purchase',
  PAGE_VIEW: 'Page View',
  TAG_ADDED: 'Tag Added',
  TAG_REMOVED: 'Tag Removed',
  FORM_SUBMIT: 'Form Submit',
};

export default function WorkflowDetailPage() {
  const params = useParams();
  const workflowId = params.workflowId as string;
  useTranslations('workflows');
  const router = useRouter();

  // State
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Add step dialog
  const [isAddStepOpen, setIsAddStepOpen] = useState(false);
  const [newStepType, setNewStepType] = useState('');
  const [stepConfig, setStepConfig] = useState<Record<string, unknown>>({});
  const [isAddingStep, setIsAddingStep] = useState(false);

  // Edit step dialog
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);
  const [editConfig, setEditConfig] = useState<Record<string, unknown>>({});

  // Delete step dialog
  const [deleteStep, setDeleteStep] = useState<WorkflowStep | null>(null);
  const [isDeletingStep, setIsDeletingStep] = useState(false);

  const fetchWorkflow = useCallback(async () => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}`);
      if (!response.ok) throw new Error('Failed to fetch workflow');
      const data = await response.json();
      setWorkflow(data.workflow);
    } catch (error) {
      console.error('Fetch workflow error:', error);
    }
  }, [workflowId]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchWorkflow();
      setIsLoading(false);
    };
    loadData();
  }, [fetchWorkflow]);

  const handleSave = async () => {
    if (!workflow) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/workflows/${workflow.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: workflow.name,
          description: workflow.description,
        }),
      });

      if (!response.ok) throw new Error('Failed to save workflow');
      await fetchWorkflow();
    } catch (error) {
      console.error('Save workflow error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async () => {
    if (!workflow) return;

    try {
      const response = await fetch(`/api/workflows/${workflow.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: !workflow.isActive,
        }),
      });

      if (!response.ok) throw new Error('Failed to update workflow');
      await fetchWorkflow();
    } catch (error) {
      console.error('Toggle workflow error:', error);
    }
  };

  const handleAddStep = async () => {
    if (!workflow || !newStepType) return;

    setIsAddingStep(true);
    try {
      const response = await fetch(`/api/workflows/${workflow.id}/steps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: newStepType,
          config: stepConfig,
        }),
      });

      if (!response.ok) throw new Error('Failed to add step');

      setIsAddStepOpen(false);
      setNewStepType('');
      setStepConfig({});
      await fetchWorkflow();
    } catch (error) {
      console.error('Add step error:', error);
    } finally {
      setIsAddingStep(false);
    }
  };

  const handleUpdateStep = async () => {
    if (!workflow || !editingStep) return;

    try {
      const response = await fetch(`/api/workflows/${workflow.id}/steps/${editingStep.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: editConfig,
        }),
      });

      if (!response.ok) throw new Error('Failed to update step');

      setEditingStep(null);
      setEditConfig({});
      await fetchWorkflow();
    } catch (error) {
      console.error('Update step error:', error);
    }
  };

  const handleDeleteStep = async () => {
    if (!workflow || !deleteStep) return;

    setIsDeletingStep(true);
    try {
      const response = await fetch(`/api/workflows/${workflow.id}/steps/${deleteStep.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete step');

      setDeleteStep(null);
      await fetchWorkflow();
    } catch (error) {
      console.error('Delete step error:', error);
    } finally {
      setIsDeletingStep(false);
    }
  };

  const getStepIcon = (type: string) => {
    const stepType = stepTypes.find((s) => s.value === type);
    const Icon = stepType?.icon || Square;
    return <Icon className="h-5 w-5" />;
  };

  const getStepLabel = (type: string) => {
    const stepType = stepTypes.find((s) => s.value === type);
    return stepType?.label || type;
  };

  const renderStepConfigForm = (config: Record<string, unknown>, setConfig: (config: Record<string, unknown>) => void, type: string) => {
    switch (type) {
      case 'SEND_EMAIL':
        return (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Email Subject</Label>
              <Input
                value={(config.emailSubject as string) || ''}
                onChange={(e) => setConfig({ ...config, emailSubject: e.target.value })}
                placeholder="e.g., Welcome to our community!"
              />
            </div>
          </div>
        );
      case 'DELAY':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Duration</Label>
                <Input
                  type="number"
                  min={1}
                  value={(config.delayValue as number) || 1}
                  onChange={(e) => setConfig({ ...config, delayValue: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Unit</Label>
                <Select
                  value={(config.delayUnit as string) || 'hours'}
                  onValueChange={(v) => setConfig({ ...config, delayUnit: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutes">Minutes</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      case 'ADD_TAG':
      case 'REMOVE_TAG':
        return (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Tag Name</Label>
              <Input
                value={(config.tag as string) || ''}
                onChange={(e) => setConfig({ ...config, tag: e.target.value })}
                placeholder="e.g., subscriber"
              />
            </div>
          </div>
        );
      case 'UPDATE_CONTACT':
        return (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Fields to Update (JSON)</Label>
              <Textarea
                value={JSON.stringify(config.fields || {}, null, 2)}
                onChange={(e) => {
                  try {
                    setConfig({ ...config, fields: JSON.parse(e.target.value) });
                  } catch {
                    // Invalid JSON, ignore
                  }
                }}
                placeholder='{"firstName": "John"}'
                rows={4}
              />
            </div>
          </div>
        );
      case 'WEBHOOK':
        return (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Webhook URL</Label>
              <Input
                value={(config.webhookUrl as string) || ''}
                onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
                placeholder="https://example.com/webhook"
              />
            </div>
            <div className="grid gap-2">
              <Label>Method</Label>
              <Select
                value={(config.webhookMethod as string) || 'POST'}
                onValueChange={(v) => setConfig({ ...config, webhookMethod: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 'START_WORKFLOW':
        return (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Target Workflow ID</Label>
              <Input
                value={(config.targetWorkflowId as string) || ''}
                onChange={(e) => setConfig({ ...config, targetWorkflowId: e.target.value })}
                placeholder="workflow-id"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-muted-foreground">Workflow not found</p>
        <Button variant="outline" onClick={() => router.push('/workflows')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Workflows
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/workflows')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <Input
              value={workflow.name}
              onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
              className="text-2xl font-bold border-none bg-transparent p-0 h-auto focus-visible:ring-0"
            />
            <p className="text-sm text-muted-foreground">
              Trigger: {triggerLabels[workflow.trigger.type] || workflow.trigger.type}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {workflow.isActive ? 'Active' : 'Inactive'}
            </span>
            <Switch checked={workflow.isActive} onCheckedChange={handleToggleActive} />
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save
          </Button>
        </div>
      </div>

      {/* Steps */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Workflow Steps</CardTitle>
          <Button size="sm" onClick={() => setIsAddStepOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Step
          </Button>
        </CardHeader>
        <CardContent>
          {workflow.steps.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No steps yet. Add your first step to build your workflow.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {workflow.steps
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((step, index) => (
                  <div key={step.id} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                        {index + 1}
                      </div>
                      {index < workflow.steps.length - 1 && (
                        <div className="w-0.5 h-8 bg-border mt-2" />
                      )}
                    </div>
                    <Card className="flex-1">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-muted">
                              {getStepIcon(step.type)}
                            </div>
                            <div>
                              <p className="font-medium">{getStepLabel(step.type)}</p>
                              <p className="text-sm text-muted-foreground">
                                {step.type === 'DELAY'
                                  ? `Wait ${step.config.delayValue || 1} ${step.config.delayUnit || 'hours'}`
                                  : step.type === 'ADD_TAG' || step.type === 'REMOVE_TAG'
                                  ? `Tag: ${step.config.tag || '(not set)'}`
                                  : step.type === 'SEND_EMAIL'
                                  ? `Subject: ${step.config.emailSubject || '(not set)'}`
                                  : step.type === 'WEBHOOK'
                                  ? `URL: ${step.config.webhookUrl || '(not set)'}`
                                  : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingStep(step);
                                setEditConfig(step.config);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => setDeleteStep(step)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Step Dialog */}
      <Dialog open={isAddStepOpen} onOpenChange={setIsAddStepOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Step</DialogTitle>
            <DialogDescription>Choose a step type and configure it</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label>Step Type</Label>
              <Select value={newStepType} onValueChange={setNewStepType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select step type" />
                </SelectTrigger>
                <SelectContent>
                  {stepTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {newStepType && renderStepConfigForm(stepConfig, setStepConfig, newStepType)}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddStepOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStep} disabled={!newStepType || isAddingStep}>
              {isAddingStep && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Step
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Step Dialog */}
      <Dialog open={!!editingStep} onOpenChange={(open) => !open && setEditingStep(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Step</DialogTitle>
            <DialogDescription>
              {editingStep && getStepLabel(editingStep.type)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {editingStep && renderStepConfigForm(editConfig, setEditConfig, editingStep.type)}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingStep(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStep}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Step Confirmation */}
      <AlertDialog open={!!deleteStep} onOpenChange={(open) => !open && setDeleteStep(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Step</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this step? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStep}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingStep && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
