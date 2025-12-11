'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  DropdownMenuSeparator,
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
import { EditorSidebar } from '@/components/editor/editor-sidebar';
import { EditorCanvas } from '@/components/editor/editor-canvas';
import { EditorProperties } from '@/components/editor/editor-properties';
import { useEditorStore } from '@/lib/stores/editor-store';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Plus,
  MoreVertical,
  Trash,
  Copy,
  GripVertical,
  ChevronRight,
  Eye,
  Settings,
  Loader2,
  Globe,
  FileText,
  ShoppingCart,
  CreditCard,
  Gift,
  Video,
  Users,
  PanelLeftClose,
  PanelLeft,
  Save,
} from 'lucide-react';

interface FunnelStep {
  id: string;
  name: string;
  slug: string;
  type: string;
  sortOrder: number;
  isPublished: boolean;
  pageContent: object | null;
  settings: object | null;
}

interface Funnel {
  id: string;
  name: string;
  slug: string;
  type: string;
  status: string;
  description: string | null;
  steps: FunnelStep[];
}

const stepTypes = [
  { value: 'OPTIN', label: 'Opt-in Page', icon: FileText, description: 'Capture leads with a form' },
  { value: 'SALES', label: 'Sales Page', icon: ShoppingCart, description: 'Present your offer' },
  { value: 'UPSELL', label: 'Upsell Page', icon: Gift, description: 'Offer additional products' },
  { value: 'DOWNSELL', label: 'Downsell Page', icon: Gift, description: 'Alternative lower-priced offer' },
  { value: 'ORDER_FORM', label: 'Order Form', icon: CreditCard, description: 'Collect payment details' },
  { value: 'CHECKOUT', label: 'Checkout', icon: CreditCard, description: 'Complete purchase' },
  { value: 'THANK_YOU', label: 'Thank You Page', icon: FileText, description: 'Post-purchase confirmation' },
  { value: 'WEBINAR', label: 'Webinar Page', icon: Video, description: 'Live or recorded presentation' },
  { value: 'MEMBER', label: 'Member Area', icon: Users, description: 'Members-only content' },
  { value: 'CUSTOM', label: 'Custom Page', icon: FileText, description: 'Fully custom page' },
];

export default function FunnelEditorPage() {
  const params = useParams();
  const router = useRouter();
  const funnelId = params.id as string;

  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [showStepsPanel, setShowStepsPanel] = useState(true);
  const [showAddStepDialog, setShowAddStepDialog] = useState(false);
  const [showDeleteStepDialog, setShowDeleteStepDialog] = useState(false);
  const [stepToDelete, setStepToDelete] = useState<FunnelStep | null>(null);
  const [newStepName, setNewStepName] = useState('');
  const [newStepType, setNewStepType] = useState('OPTIN');
  const [draggedStepId, setDraggedStepId] = useState<string | null>(null);
  const [dragOverStepId, setDragOverStepId] = useState<string | null>(null);

  const { elements, setElements } = useEditorStore();

  const fetchFunnel = useCallback(async () => {
    try {
      const response = await fetch(`/api/funnels/${funnelId}`);
      if (!response.ok) throw new Error('Failed to fetch funnel');
      const data = await response.json();
      setFunnel(data.funnel);

      // Set first step as active if exists
      if (data.funnel.steps?.length > 0 && !activeStepId) {
        setActiveStepId(data.funnel.steps[0].id);
        // Load step content into editor
        const content = data.funnel.steps[0].pageContent;
        if (content && typeof content === 'object' && 'elements' in content) {
          setElements((content as { elements: typeof elements }).elements || []);
        } else {
          setElements([]);
        }
      }
    } catch (error) {
      console.error('Fetch funnel error:', error);
    } finally {
      setLoading(false);
    }
  }, [funnelId, activeStepId, setElements]);

  useEffect(() => {
    fetchFunnel();
  }, [fetchFunnel]);

  const handleStepSelect = (step: FunnelStep) => {
    // Save current step content before switching
    if (activeStepId) {
      saveStepContent(activeStepId, elements);
    }

    setActiveStepId(step.id);

    // Load selected step content
    const content = step.pageContent;
    if (content && typeof content === 'object' && 'elements' in content) {
      setElements((content as { elements: typeof elements }).elements || []);
    } else {
      setElements([]);
    }
  };

  const saveStepContent = async (stepId: string, content: typeof elements) => {
    try {
      await fetch(`/api/funnels/${funnelId}/steps/${stepId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageContent: { elements: content } }),
      });
    } catch (error) {
      console.error('Save step content error:', error);
    }
  };

  const handleAddStep = async () => {
    if (!newStepName.trim()) return;

    try {
      const response = await fetch(`/api/funnels/${funnelId}/steps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStepName,
          type: newStepType,
        }),
      });

      if (!response.ok) throw new Error('Failed to create step');

      setShowAddStepDialog(false);
      setNewStepName('');
      setNewStepType('OPTIN');
      await fetchFunnel();
    } catch (error) {
      console.error('Create step error:', error);
    }
  };

  const handleDeleteStep = async () => {
    if (!stepToDelete) return;

    try {
      const response = await fetch(`/api/funnels/${funnelId}/steps/${stepToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete step');

      setShowDeleteStepDialog(false);
      setStepToDelete(null);

      // If deleted step was active, switch to first step
      if (activeStepId === stepToDelete.id) {
        setActiveStepId(null);
        setElements([]);
      }

      await fetchFunnel();
    } catch (error) {
      console.error('Delete step error:', error);
    }
  };

  const handleDuplicateStep = async (step: FunnelStep) => {
    try {
      const response = await fetch(`/api/funnels/${funnelId}/steps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${step.name} (Copy)`,
          type: step.type,
          pageContent: step.pageContent,
          settings: step.settings,
          insertAfter: step.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to duplicate step');
      await fetchFunnel();
    } catch (error) {
      console.error('Duplicate step error:', error);
    }
  };

  const handleDragStart = (stepId: string) => {
    setDraggedStepId(stepId);
  };

  const handleDragOver = (e: React.DragEvent, stepId: string) => {
    e.preventDefault();
    if (draggedStepId !== stepId) {
      setDragOverStepId(stepId);
    }
  };

  const handleDragLeave = () => {
    setDragOverStepId(null);
  };

  const handleDrop = async (targetStepId: string) => {
    if (!draggedStepId || draggedStepId === targetStepId || !funnel) return;

    const steps = [...funnel.steps];
    const draggedIndex = steps.findIndex(s => s.id === draggedStepId);
    const targetIndex = steps.findIndex(s => s.id === targetStepId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Reorder locally
    const [draggedStep] = steps.splice(draggedIndex, 1);
    steps.splice(targetIndex, 0, draggedStep);

    // Update sort orders
    const stepOrders = steps.map((step, index) => ({
      stepId: step.id,
      order: index,
    }));

    try {
      const response = await fetch(`/api/funnels/${funnelId}/steps/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepOrders }),
      });

      if (!response.ok) throw new Error('Failed to reorder steps');
      await fetchFunnel();
    } catch (error) {
      console.error('Reorder steps error:', error);
    }

    setDraggedStepId(null);
    setDragOverStepId(null);
  };

  const handleSave = async () => {
    if (!activeStepId) return;

    setSaving(true);
    try {
      await saveStepContent(activeStepId, elements);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      // Save current step first
      if (activeStepId) {
        await saveStepContent(activeStepId, elements);
      }

      const response = await fetch(`/api/funnels/${funnelId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish' }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.details?.join('\n') || data.error);
        return;
      }

      await fetchFunnel();
    } catch (error) {
      console.error('Publish error:', error);
    } finally {
      setSaving(false);
    }
  };

  const getStepTypeIcon = (type: string) => {
    const stepType = stepTypes.find(t => t.value === type);
    return stepType?.icon || FileText;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!funnel) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Funnel not found</p>
          <Button onClick={() => router.push('/funnels')}>
            Back to Funnels
          </Button>
        </div>
      </div>
    );
  }

  const activeStep = funnel.steps.find(s => s.id === activeStepId);

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      {/* Top Bar */}
      <div className="h-14 border-b bg-card flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/funnels')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-semibold">{funnel.name}</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant={funnel.status === 'PUBLISHED' ? 'default' : 'secondary'} className="text-xs">
                {funnel.status}
              </Badge>
              {activeStep && (
                <>
                  <ChevronRight className="h-3 w-3" />
                  <span>{activeStep.name}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => window.open(`/preview/${funnel.slug}`, '_blank')}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" onClick={handleSave} disabled={saving || !activeStepId}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button onClick={handlePublish} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Globe className="h-4 w-4 mr-2" />
            )}
            {funnel.status === 'PUBLISHED' ? 'Update' : 'Publish'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Steps Panel */}
        {showStepsPanel && (
          <div className="w-64 border-r bg-card flex flex-col">
            <div className="p-3 border-b flex items-center justify-between">
              <h3 className="font-semibold text-sm">Steps</h3>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowAddStepDialog(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowStepsPanel(false)}>
                  <PanelLeftClose className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {funnel.steps.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <p>No steps yet</p>
                  <Button variant="link" size="sm" onClick={() => setShowAddStepDialog(true)}>
                    Add your first step
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  {funnel.steps.map((step, index) => {
                    const Icon = getStepTypeIcon(step.type);
                    return (
                      <div
                        key={step.id}
                        draggable
                        onDragStart={() => handleDragStart(step.id)}
                        onDragOver={(e) => handleDragOver(e, step.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={() => handleDrop(step.id)}
                        className={cn(
                          'group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors',
                          activeStepId === step.id
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-muted',
                          dragOverStepId === step.id && 'border-t-2 border-primary'
                        )}
                        onClick={() => handleStepSelect(step)}
                      >
                        <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-grab" />
                        <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1 text-sm truncate">{step.name}</span>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100"
                            >
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDuplicateStep(step)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setStepToDelete(step);
                                setShowDeleteStepDialog(true);
                              }}
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Toggle button when panel is hidden */}
        {!showStepsPanel && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-20 z-10"
            onClick={() => setShowStepsPanel(true)}
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Page Editor Area */}
        {activeStep ? (
          <>
            <EditorSidebar />
            <EditorCanvas />
            <EditorProperties />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-muted/50">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                {funnel.steps.length === 0
                  ? 'Add a step to start building your funnel'
                  : 'Select a step to edit'}
              </p>
              {funnel.steps.length === 0 && (
                <Button onClick={() => setShowAddStepDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Step Dialog */}
      <Dialog open={showAddStepDialog} onOpenChange={setShowAddStepDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Step</DialogTitle>
            <DialogDescription>
              Add a new page to your funnel
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Step Name</label>
              <Input
                value={newStepName}
                onChange={(e) => setNewStepName(e.target.value)}
                placeholder="Enter step name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Step Type</label>
              <Select value={newStepType} onValueChange={setNewStepType}>
                <SelectTrigger>
                  <SelectValue />
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddStepDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStep} disabled={!newStepName.trim()}>
              Add Step
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Step Confirmation */}
      <AlertDialog open={showDeleteStepDialog} onOpenChange={setShowDeleteStepDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Step</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{stepToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStep} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
