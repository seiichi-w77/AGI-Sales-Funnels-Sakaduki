'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useWorkspace } from '@/components/providers/dashboard-providers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Copy,
  Trash,
  LayoutGrid,
  List,
  Filter,
  Loader2,
  Globe,
  FileText,
  ShoppingCart,
  Video,
  Users,
  Store,
  Sparkles,
  BarChart3,
  ExternalLink,
  Settings,
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { toast } from 'sonner';

interface Funnel {
  id: string;
  name: string;
  slug: string;
  type: string;
  status: string;
  description: string | null;
  thumbnail: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  steps: { id: string; name: string; type: string }[];
  _count: {
    analytics: number;
  };
}

const funnelTypes = [
  {
    value: 'LEAD_MAGNET',
    label: 'Lead Magnet',
    description: 'Collect leads with a free offer',
    icon: FileText,
    color: 'bg-blue-500',
  },
  {
    value: 'BOOK',
    label: 'Book Funnel',
    description: 'Sell books with upsells',
    icon: FileText,
    color: 'bg-purple-500',
  },
  {
    value: 'CART',
    label: 'Cart Funnel',
    description: 'E-commerce shopping cart',
    icon: ShoppingCart,
    color: 'bg-green-500',
  },
  {
    value: 'WEBINAR',
    label: 'Webinar Funnel',
    description: 'Register and host webinars',
    icon: Users,
    color: 'bg-orange-500',
  },
  {
    value: 'VSL',
    label: 'VSL Funnel',
    description: 'Video sales letter funnel',
    icon: Video,
    color: 'bg-red-500',
  },
  {
    value: 'STOREFRONT',
    label: 'Storefront',
    description: 'Build an online store',
    icon: Store,
    color: 'bg-indigo-500',
  },
  {
    value: 'CUSTOM',
    label: 'Custom Funnel',
    description: 'Build from scratch',
    icon: Sparkles,
    color: 'bg-gray-500',
  },
];

const funnelTypeLabels: Record<string, string> = {
  LEAD_MAGNET: 'Lead Magnet',
  BOOK: 'Book',
  CART: 'Cart',
  WEBINAR: 'Webinar',
  VSL: 'VSL',
  STOREFRONT: 'Storefront',
  CUSTOM: 'Custom',
};

const statusColors: Record<string, string> = {
  DRAFT: 'bg-yellow-100 text-yellow-800',
  PUBLISHED: 'bg-green-100 text-green-800',
  ARCHIVED: 'bg-gray-100 text-gray-800',
};

export default function FunnelsPage() {
  const t = useTranslations('funnels');
  const { currentWorkspace, isLoading: workspaceLoading } = useWorkspace();
  const workspaceId = currentWorkspace?.id;

  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Create modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createStep, setCreateStep] = useState<'type' | 'details'>('type');
  const [selectedType, setSelectedType] = useState<string>('');
  const [newFunnelName, setNewFunnelName] = useState('');
  const [newFunnelDescription, setNewFunnelDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<Funnel | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Duplicate state
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);

  const fetchFunnels = useCallback(async () => {
    if (!workspaceId) return;
    try {
      const response = await fetch(`/api/funnels?workspaceId=${workspaceId}`);
      if (response.ok) {
        const data = await response.json();
        setFunnels(data.funnels || []);
      }
    } catch (error) {
      console.error('Error fetching funnels:', error);
      toast.error('Failed to load funnels');
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchFunnels();
  }, [fetchFunnels]);

  const handleCreateFunnel = async () => {
    if (!newFunnelName.trim() || !workspaceId) {
      toast.error('Funnel name is required');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/funnels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          name: newFunnelName,
          type: selectedType,
          description: newFunnelDescription || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create funnel');
      }

      const funnel = await response.json();
      setFunnels([{ ...funnel, steps: [], _count: { analytics: 0 } }, ...funnels]);
      resetCreateModal();
      toast.success('Funnel created successfully');

      // Navigate to funnel editor
      window.location.href = `/funnels/${funnel.id}/edit`;
    } catch (error) {
      console.error('Error creating funnel:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create funnel');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDuplicateFunnel = async (funnel: Funnel) => {
    setIsDuplicating(funnel.id);
    try {
      const response = await fetch(`/api/funnels/${funnel.id}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${funnel.name} (Copy)`,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to duplicate funnel');
      }

      const newFunnel = await response.json();
      setFunnels([{ ...newFunnel, steps: [], _count: { analytics: 0 } }, ...funnels]);
      toast.success('Funnel duplicated successfully');
    } catch (error) {
      console.error('Error duplicating funnel:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to duplicate funnel');
    } finally {
      setIsDuplicating(null);
    }
  };

  const handleDeleteFunnel = async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/funnels/${deleteConfirm.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete funnel');
      }

      setFunnels(funnels.filter((f) => f.id !== deleteConfirm.id));
      setDeleteConfirm(null);
      toast.success('Funnel deleted successfully');
    } catch (error) {
      console.error('Error deleting funnel:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete funnel');
    } finally {
      setIsDeleting(false);
    }
  };

  const resetCreateModal = () => {
    setIsCreateOpen(false);
    setCreateStep('type');
    setSelectedType('');
    setNewFunnelName('');
    setNewFunnelDescription('');
  };

  const filteredFunnels = funnels.filter((funnel) => {
    const matchesSearch = funnel.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || funnel.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || funnel.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

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
            Build and manage your sales funnels
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('create')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search funnels..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {funnelTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center border rounded-lg">
          <Button
            variant={view === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setView('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={view === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setView('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {funnels.length === 0 && (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-primary/10">
              <Sparkles className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No funnels yet</h3>
              <p className="text-muted-foreground">
                Create your first funnel to start converting visitors into customers
              </p>
            </div>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Funnel
            </Button>
          </div>
        </Card>
      )}

      {/* Funnels Grid/List */}
      {funnels.length > 0 && (
        <>
          {view === 'grid' ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredFunnels.map((funnel) => (
                <FunnelCard
                  key={funnel.id}
                  funnel={funnel}
                  onDuplicate={() => handleDuplicateFunnel(funnel)}
                  onDelete={() => setDeleteConfirm(funnel)}
                  isDuplicating={isDuplicating === funnel.id}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFunnels.map((funnel) => (
                <FunnelListItem
                  key={funnel.id}
                  funnel={funnel}
                  onDuplicate={() => handleDuplicateFunnel(funnel)}
                  onDelete={() => setDeleteConfirm(funnel)}
                  isDuplicating={isDuplicating === funnel.id}
                />
              ))}
            </div>
          )}

          {filteredFunnels.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No funnels match your filters</p>
            </div>
          )}
        </>
      )}

      {/* Create Funnel Modal */}
      <Dialog open={isCreateOpen} onOpenChange={(open) => !open && resetCreateModal()}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {createStep === 'type' ? 'Choose Funnel Type' : 'Create New Funnel'}
            </DialogTitle>
            <DialogDescription>
              {createStep === 'type'
                ? 'Select the type of funnel that best fits your goal'
                : 'Enter the details for your new funnel'}
            </DialogDescription>
          </DialogHeader>

          {createStep === 'type' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
              {funnelTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Card
                    key={type.value}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedType === type.value ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedType(type.value)}
                  >
                    <CardContent className="p-4 text-center">
                      <div
                        className={`w-12 h-12 rounded-full ${type.color} flex items-center justify-center mx-auto mb-3`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="font-medium">{type.label}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                {(() => {
                  const typeInfo = funnelTypes.find((t) => t.value === selectedType);
                  const Icon = typeInfo?.icon || Sparkles;
                  return (
                    <>
                      <div
                        className={`w-10 h-10 rounded-full ${typeInfo?.color || 'bg-gray-500'} flex items-center justify-center`}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{typeInfo?.label || 'Custom'}</p>
                        <p className="text-sm text-muted-foreground">{typeInfo?.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto"
                        onClick={() => setCreateStep('type')}
                      >
                        Change
                      </Button>
                    </>
                  );
                })()}
              </div>
              <div className="space-y-2">
                <Label htmlFor="funnel-name">Funnel Name *</Label>
                <Input
                  id="funnel-name"
                  placeholder="e.g., Product Launch Funnel"
                  value={newFunnelName}
                  onChange={(e) => setNewFunnelName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="funnel-description">Description (optional)</Label>
                <Textarea
                  id="funnel-description"
                  placeholder="Describe your funnel..."
                  value={newFunnelDescription}
                  onChange={(e) => setNewFunnelDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={resetCreateModal}>
              Cancel
            </Button>
            {createStep === 'type' ? (
              <Button
                onClick={() => setCreateStep('details')}
                disabled={!selectedType}
              >
                Continue
              </Button>
            ) : (
              <Button onClick={handleCreateFunnel} disabled={isCreating || !newFunnelName.trim()}>
                {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Funnel
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Funnel</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteConfirm?.name}&quot;? This action cannot
              be undone. All steps, pages, and analytics data will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFunnel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete Funnel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface FunnelCardProps {
  funnel: Funnel;
  onDuplicate: () => void;
  onDelete: () => void;
  isDuplicating: boolean;
}

function FunnelCard({ funnel, onDuplicate, onDelete, isDuplicating }: FunnelCardProps) {
  const conversionRate = funnel._count.analytics > 0 ? ((funnel.steps.length / funnel._count.analytics) * 100).toFixed(1) : '0';

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Thumbnail */}
      <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 relative">
        <div className="absolute top-2 right-2">
          <Badge className={statusColors[funnel.status]}>{funnel.status}</Badge>
        </div>
        <div className="absolute bottom-2 left-2">
          <Badge variant="outline" className="bg-background/80">
            {funnelTypeLabels[funnel.type] || funnel.type}
          </Badge>
        </div>
        {funnel.status === 'PUBLISHED' && (
          <div className="absolute bottom-2 right-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/80" asChild>
              <a href={`/f/${funnel.slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        )}
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-1">{funnel.name}</CardTitle>
          <FunnelMenu
            funnel={funnel}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            isDuplicating={isDuplicating}
          />
        </div>
        {funnel.description && (
          <CardDescription className="line-clamp-2">{funnel.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Steps</p>
            <p className="font-medium">{funnel.steps.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Visitors</p>
            <p className="font-medium">{funnel._count.analytics.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Conv.</p>
            <p className="font-medium">{conversionRate}%</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 gap-2">
        <Link href={`/funnels/${funnel.id}/edit`} className="flex-1">
          <Button variant="outline" className="w-full">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </Link>
        <Link href={`/funnels/${funnel.id}/analytics`}>
          <Button variant="ghost" size="icon">
            <BarChart3 className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

function FunnelListItem({ funnel, onDuplicate, onDelete, isDuplicating }: FunnelCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        <div className="w-24 h-16 rounded bg-gradient-to-br from-primary/10 to-primary/5 flex-shrink-0 relative">
          <Badge className={`${statusColors[funnel.status]} absolute -top-2 -right-2 text-[10px]`}>
            {funnel.status}
          </Badge>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium truncate">{funnel.name}</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {funnelTypeLabels[funnel.type] || funnel.type} • {funnel.steps.length} steps
          </p>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm">
          <div className="text-center">
            <p className="text-muted-foreground">Visitors</p>
            <p className="font-medium">{funnel._count.analytics.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Steps</p>
            <p className="font-medium">{funnel.steps.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/funnels/${funnel.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/funnels/${funnel.id}/analytics`}>
            <Button variant="ghost" size="sm">
              <BarChart3 className="h-4 w-4" />
            </Button>
          </Link>
          <FunnelMenu
            funnel={funnel}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            isDuplicating={isDuplicating}
          />
        </div>
      </div>
    </Card>
  );
}

interface FunnelMenuProps {
  funnel: Funnel;
  onDuplicate: () => void;
  onDelete: () => void;
  isDuplicating: boolean;
}

function FunnelMenu({ funnel, onDuplicate, onDelete, isDuplicating }: FunnelMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          {isDuplicating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MoreVertical className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {funnel.status === 'PUBLISHED' && (
          <DropdownMenuItem asChild>
            <a href={`/f/${funnel.slug}`} target="_blank" rel="noopener noreferrer">
              <Globe className="h-4 w-4 mr-2" />
              View Live
            </a>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href={`/funnels/${funnel.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/funnels/${funnel.id}/analytics`}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/funnels/${funnel.id}/settings`}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDuplicate} disabled={isDuplicating}>
          <Copy className="h-4 w-4 mr-2" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive" onClick={onDelete}>
          <Trash className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
