'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useScenarioStore, ScenarioGroup, ScenarioStatus } from '@/lib/stores/scenario-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Search,
  MoreVertical,
  FolderPlus,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Edit,
  Trash2,
  Copy,
  Play,
  Pause,
  Users,
  Mail,
  MessageSquare,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Color options for groups
const colorOptions = [
  { value: '#ef4444', label: 'Red' },
  { value: '#f97316', label: 'Orange' },
  { value: '#eab308', label: 'Yellow' },
  { value: '#22c55e', label: 'Green' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
];

export default function ScenariosPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;

  const {
    groups,
    scenarios,
    selectedGroupId,
    addGroup,
    updateGroup,
    deleteGroup,
    selectGroup,
    addScenario,
    deleteScenario,
    activateScenario,
    deactivateScenario,
    duplicateScenario,
    getScenariosByGroup,
  } = useScenarioStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ScenarioStatus | 'all'>('all');

  // Group management
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ScenarioGroup | null>(null);
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    parentGroupId: '',
  });

  // Scenario management
  const [isScenarioDialogOpen, setIsScenarioDialogOpen] = useState(false);
  const [scenarioForm, setScenarioForm] = useState({
    name: '',
    description: '',
    scenarioGroupId: '',
  });

  // Expanded groups
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Filter scenarios
  const displayedScenarios = getScenariosByGroup(selectedGroupId).filter((scenario) => {
    const matchesSearch = scenario.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || scenario.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleGroupExpand = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const handleGroupSubmit = () => {
    if (!groupForm.name.trim()) return;

    if (editingGroup) {
      updateGroup(editingGroup.id, {
        name: groupForm.name,
        description: groupForm.description || undefined,
        color: groupForm.color,
        parentGroupId: groupForm.parentGroupId || undefined,
      });
    } else {
      addGroup({
        workspaceId: 'default',
        name: groupForm.name,
        description: groupForm.description || undefined,
        color: groupForm.color,
        parentGroupId: groupForm.parentGroupId || undefined,
        order: groups.length,
        createdBy: 'user',
      });
    }

    setIsGroupDialogOpen(false);
    setEditingGroup(null);
    setGroupForm({ name: '', description: '', color: '#3b82f6', parentGroupId: '' });
  };

  const handleScenarioSubmit = () => {
    if (!scenarioForm.name.trim()) return;

    const scenarioId = addScenario({
      workspaceId: 'default',
      name: scenarioForm.name,
      description: scenarioForm.description || undefined,
      scenarioGroupId: scenarioForm.scenarioGroupId || selectedGroupId || undefined,
      status: 'draft',
      channels: ['email'],
      startTriggers: [{ type: 'manual' }],
      excludeUnsubscribed: true,
      excludeBlocked: true,
      excludeActiveScenarios: false,
      notifications: {
        onReaderRegistration: false,
        onDeliveryError: true,
        onCompletion: false,
        emails: [],
      },
      createdBy: 'user',
    });

    setIsScenarioDialogOpen(false);
    setScenarioForm({ name: '', description: '', scenarioGroupId: '' });
    router.push(`/${locale}/scenarios/${scenarioId}`);
  };

  const openEditGroup = (group: ScenarioGroup) => {
    setEditingGroup(group);
    setGroupForm({
      name: group.name,
      description: group.description || '',
      color: group.color || '#3b82f6',
      parentGroupId: group.parentGroupId || '',
    });
    setIsGroupDialogOpen(true);
  };

  const handleDeleteGroup = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (group && group.scenarioCount > 0) {
      alert('Cannot delete group with scenarios. Please move scenarios first.');
      return;
    }
    if (confirm('Are you sure you want to delete this group?')) {
      deleteGroup(groupId);
    }
  };

  const getStatusBadge = (status: ScenarioStatus) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  // Render group tree
  const renderGroupTree = (parentId: string | null = null, depth = 0) => {
    const childGroups = groups.filter((g) => g.parentGroupId === parentId);

    return childGroups.map((group) => {
      const hasChildren = groups.some((g) => g.parentGroupId === group.id);
      const isExpanded = expandedGroups.has(group.id);
      const isSelected = selectedGroupId === group.id;

      return (
        <div key={group.id}>
          <div
            className={cn(
              'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-accent transition-colors',
              isSelected && 'bg-accent',
              depth > 0 && 'ml-4'
            )}
            onClick={() => selectGroup(group.id)}
          >
            {hasChildren ? (
              <button
                className="p-0.5 hover:bg-muted rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleGroupExpand(group.id);
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            ) : (
              <span className="w-5" />
            )}
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: group.color || '#3b82f6' }}
            />
            {isExpanded ? (
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Folder className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="flex-1 truncate text-sm">{group.name}</span>
            <span className="text-xs text-muted-foreground">{group.scenarioCount}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openEditGroup(group)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => handleDeleteGroup(group.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {hasChildren && isExpanded && renderGroupTree(group.id, depth + 1)}
        </div>
      );
    });
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar - Group Tree */}
      <div className="w-64 border-r bg-card flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">Scenario Groups</h2>
            <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    setEditingGroup(null);
                    setGroupForm({ name: '', description: '', color: '#3b82f6', parentGroupId: '' });
                  }}
                >
                  <FolderPlus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingGroup ? 'Edit Scenario Group' : 'Add Scenario Group'}
                  </DialogTitle>
                  <DialogDescription>
                    Organize your scenarios into groups for better management.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="groupName">Group Name</Label>
                    <Input
                      id="groupName"
                      value={groupForm.name}
                      onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                      placeholder="Enter group name"
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="groupDescription">Description (Optional)</Label>
                    <Textarea
                      id="groupDescription"
                      value={groupForm.description}
                      onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                      placeholder="Enter description"
                      maxLength={500}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="flex gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color.value}
                          className={cn(
                            'w-8 h-8 rounded-full border-2 transition-all',
                            groupForm.color === color.value
                              ? 'border-primary scale-110'
                              : 'border-transparent hover:scale-105'
                          )}
                          style={{ backgroundColor: color.value }}
                          onClick={() => setGroupForm({ ...groupForm, color: color.value })}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Parent Group (Optional)</Label>
                    <Select
                      value={groupForm.parentGroupId}
                      onValueChange={(value) =>
                        setGroupForm({ ...groupForm, parentGroupId: value === 'none' ? '' : value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {groups
                          .filter((g) => g.id !== editingGroup?.id)
                          .map((group) => (
                            <SelectItem key={group.id} value={group.id}>
                              {group.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsGroupDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleGroupSubmit}>
                    {editingGroup ? 'Save' : 'Add'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {/* All Scenarios */}
            <div
              className={cn(
                'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-accent transition-colors mb-2',
                selectedGroupId === null && 'bg-accent'
              )}
              onClick={() => selectGroup(null)}
            >
              <Layers className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 text-sm">All Scenarios</span>
              <span className="text-xs text-muted-foreground">
                {scenarios.filter((s) => !s.scenarioGroupId).length}
              </span>
            </div>

            {/* Group Tree */}
            {renderGroupTree(null)}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold">Scenarios</h1>
              <p className="text-muted-foreground">
                Create and manage automated message sequences
              </p>
            </div>
            <Dialog open={isScenarioDialogOpen} onOpenChange={setIsScenarioDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Scenario
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Scenario</DialogTitle>
                  <DialogDescription>
                    Set up an automated message sequence for your contacts.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="scenarioName">Scenario Name</Label>
                    <Input
                      id="scenarioName"
                      value={scenarioForm.name}
                      onChange={(e) => setScenarioForm({ ...scenarioForm, name: e.target.value })}
                      placeholder="Enter scenario name"
                      maxLength={255}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scenarioDescription">Description (Optional)</Label>
                    <Textarea
                      id="scenarioDescription"
                      value={scenarioForm.description}
                      onChange={(e) =>
                        setScenarioForm({ ...scenarioForm, description: e.target.value })
                      }
                      placeholder="Enter description"
                      maxLength={1000}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Group (Optional)</Label>
                    <Select
                      value={scenarioForm.scenarioGroupId || selectedGroupId || 'none'}
                      onValueChange={(value) =>
                        setScenarioForm({
                          ...scenarioForm,
                          scenarioGroupId: value === 'none' ? '' : value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {groups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsScenarioDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleScenarioSubmit} disabled={!scenarioForm.name.trim()}>
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search scenarios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as ScenarioStatus | 'all')}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Scenario List */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            {displayedScenarios.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No scenarios yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create your first scenario to start automating your message delivery
                  </p>
                  <Button onClick={() => setIsScenarioDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Scenario
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {displayedScenarios.map((scenario) => (
                  <Card key={scenario.id} className="group hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">
                            <Link
                              href={`/${locale}/scenarios/${scenario.id}`}
                              className="hover:underline"
                            >
                              {scenario.name}
                            </Link>
                          </CardTitle>
                          {scenario.description && (
                            <CardDescription className="line-clamp-2">
                              {scenario.description}
                            </CardDescription>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/${locale}/scenarios/${scenario.id}`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                const newId = duplicateScenario(scenario.id);
                                if (newId) {
                                  router.push(`/${locale}/scenarios/${newId}`);
                                }
                              }}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {scenario.status === 'active' ? (
                              <DropdownMenuItem onClick={() => deactivateScenario(scenario.id)}>
                                <Pause className="h-4 w-4 mr-2" />
                                Deactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => activateScenario(scenario.id)}>
                                <Play className="h-4 w-4 mr-2" />
                                Activate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this scenario?')) {
                                  deleteScenario(scenario.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-4">
                        {getStatusBadge(scenario.status)}
                        <div className="flex items-center gap-1">
                          {scenario.channels.includes('email') && (
                            <Badge variant="outline" className="text-xs">
                              <Mail className="h-3 w-3 mr-1" />
                              Email
                            </Badge>
                          )}
                          {scenario.channels.includes('line') && (
                            <Badge variant="outline" className="text-xs">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              LINE
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-semibold">{scenario.totalReaders}</div>
                          <div className="text-xs text-muted-foreground">Total</div>
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

                      <div className="mt-4 pt-4 border-t">
                        <Link href={`/${locale}/scenarios/${scenario.id}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            <Users className="h-4 w-4 mr-2" />
                            Manage Scenario
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
