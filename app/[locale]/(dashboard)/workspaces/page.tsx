'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Settings, MoreVertical, Crown, UserPlus, Users, Loader2, Trash2, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  members: number;
  funnels: number;
  contacts: number;
  createdAt: string;
}

interface Member {
  id: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'REMOVED';
  invitedAt: string;
  joinedAt: string | null;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
    lastLoginAt: string | null;
  };
}

const roleColors: Record<string, string> = {
  OWNER: 'bg-yellow-100 text-yellow-800',
  ADMIN: 'bg-blue-100 text-blue-800',
  MEMBER: 'bg-green-100 text-green-800',
  VIEWER: 'bg-gray-100 text-gray-800',
};

export default function WorkspacesPage() {
  const t = useTranslations('workspace');
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [isMembersLoading, setIsMembersLoading] = useState(false);
  const [deleteConfirmWorkspace, setDeleteConfirmWorkspace] = useState<Workspace | null>(null);
  const [leaveConfirmWorkspace, setLeaveConfirmWorkspace] = useState<Workspace | null>(null);

  // Create form state
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState('');

  // Settings form state
  const [settingsName, setSettingsName] = useState('');
  const [settingsDescription, setSettingsDescription] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MEMBER' | 'VIEWER'>('MEMBER');
  const [isInviting, setIsInviting] = useState(false);

  const fetchWorkspaces = useCallback(async () => {
    try {
      const response = await fetch('/api/workspaces');
      if (!response.ok) throw new Error('Failed to fetch workspaces');
      const data = await response.json();
      setWorkspaces(data.workspaces);
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      toast.error('Failed to load workspaces');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMembers = useCallback(async (workspaceId: string) => {
    setIsMembersLoading(true);
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/members`);
      if (!response.ok) throw new Error('Failed to fetch members');
      const data = await response.json();
      setMembers(data.members);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to load team members');
    } finally {
      setIsMembersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) {
      toast.error('Workspace name is required');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newWorkspaceName,
          description: newWorkspaceDescription || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create workspace');
      }

      const data = await response.json();
      setWorkspaces([data.workspace, ...workspaces]);
      setIsCreateDialogOpen(false);
      setNewWorkspaceName('');
      setNewWorkspaceDescription('');
      toast.success('Workspace created successfully');
    } catch (error) {
      console.error('Error creating workspace:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create workspace');
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenSettings = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setSettingsName(workspace.name);
    setSettingsDescription(workspace.description || '');
    setIsSettingsOpen(true);
    fetchMembers(workspace.id);
  };

  const handleSaveSettings = async () => {
    if (!selectedWorkspace) return;

    setIsSavingSettings(true);
    try {
      const response = await fetch(`/api/workspaces/${selectedWorkspace.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: settingsName,
          description: settingsDescription || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update workspace');
      }

      setWorkspaces(workspaces.map(w =>
        w.id === selectedWorkspace.id
          ? { ...w, name: settingsName, description: settingsDescription }
          : w
      ));
      toast.success('Workspace updated successfully');
    } catch (error) {
      console.error('Error updating workspace:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update workspace');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleInviteMember = async () => {
    if (!selectedWorkspace || !inviteEmail.trim()) {
      toast.error('Email is required');
      return;
    }

    setIsInviting(true);
    try {
      const response = await fetch(`/api/workspaces/${selectedWorkspace.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to invite member');
      }

      const data = await response.json();
      setMembers([...members, data.member]);
      setInviteEmail('');
      setInviteRole('MEMBER');
      toast.success('Invitation sent successfully');
    } catch (error) {
      console.error('Error inviting member:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (member: Member) => {
    if (!selectedWorkspace) return;

    try {
      const response = await fetch(
        `/api/workspaces/${selectedWorkspace.id}/members/${member.id}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove member');
      }

      setMembers(members.filter(m => m.id !== member.id));
      toast.success('Member removed successfully');
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to remove member');
    }
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: 'ADMIN' | 'MEMBER' | 'VIEWER') => {
    if (!selectedWorkspace) return;

    try {
      const response = await fetch(
        `/api/workspaces/${selectedWorkspace.id}/members/${memberId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update role');
      }

      setMembers(members.map(m =>
        m.id === memberId ? { ...m, role: newRole } : m
      ));
      toast.success('Role updated successfully');
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update role');
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!deleteConfirmWorkspace) return;

    try {
      const response = await fetch(`/api/workspaces/${deleteConfirmWorkspace.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete workspace');
      }

      setWorkspaces(workspaces.filter(w => w.id !== deleteConfirmWorkspace.id));
      setDeleteConfirmWorkspace(null);
      setIsSettingsOpen(false);
      toast.success('Workspace deleted successfully');
    } catch (error) {
      console.error('Error deleting workspace:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete workspace');
    }
  };

  const handleLeaveWorkspace = async () => {
    if (!leaveConfirmWorkspace) return;

    try {
      // Find current user's membership
      const currentMember = members.find(m => m.status === 'ACTIVE');
      if (!currentMember) throw new Error('Membership not found');

      const response = await fetch(
        `/api/workspaces/${leaveConfirmWorkspace.id}/members/${currentMember.id}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to leave workspace');
      }

      setWorkspaces(workspaces.filter(w => w.id !== leaveConfirmWorkspace.id));
      setLeaveConfirmWorkspace(null);
      toast.success('You have left the workspace');
    } catch (error) {
      console.error('Error leaving workspace:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to leave workspace');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">
            Manage your workspaces and team members
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('create')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('create')}</DialogTitle>
              <DialogDescription>
                Create a new workspace to organize your funnels and team
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('name')}</Label>
                <Input
                  id="name"
                  placeholder="My Workspace"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t('description')}</Label>
                <Textarea
                  id="description"
                  placeholder="Optional description"
                  value={newWorkspaceDescription}
                  onChange={(e) => setNewWorkspaceDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateWorkspace} disabled={isCreating}>
                {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {workspaces.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <Users className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">No workspaces yet</h3>
              <p className="text-muted-foreground">
                Create your first workspace to get started
              </p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Workspace
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((workspace) => (
            <Card key={workspace.id} className="relative">
              {workspace.role === 'OWNER' && (
                <div className="absolute top-4 right-4">
                  <Crown className="h-4 w-4 text-yellow-500" />
                </div>
              )}
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    {workspace.logoUrl && <AvatarImage src={workspace.logoUrl} />}
                    <AvatarFallback className="text-lg">
                      {workspace.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{workspace.name}</CardTitle>
                    <CardDescription>/{workspace.slug}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {workspace.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {workspace.description}
                  </p>
                )}
                <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-muted-foreground">{t('members')}</p>
                    <p className="font-medium">{workspace.members}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Funnels</p>
                    <p className="font-medium">{workspace.funnels}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Contacts</p>
                    <p className="font-medium">{workspace.contacts.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleOpenSettings(workspace)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {t('settings')}
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <UserPlus className="h-4 w-4 mr-2" />
                    {t('invite')}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenSettings(workspace)}>
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {workspace.role === 'OWNER' ? (
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteConfirmWorkspace(workspace)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete workspace
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setLeaveConfirmWorkspace(workspace)}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Leave workspace
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Workspace Settings</DialogTitle>
            <DialogDescription>
              Manage workspace settings and team members
            </DialogDescription>
          </DialogHeader>
          {selectedWorkspace && (
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="team">Team Members</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="settings-name">Workspace Name</Label>
                  <Input
                    id="settings-name"
                    value={settingsName}
                    onChange={(e) => setSettingsName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settings-description">Description</Label>
                  <Textarea
                    id="settings-description"
                    value={settingsDescription}
                    onChange={(e) => setSettingsDescription(e.target.value)}
                  />
                </div>
                <div className="flex justify-between pt-4">
                  {selectedWorkspace.role === 'OWNER' && (
                    <Button
                      variant="destructive"
                      onClick={() => setDeleteConfirmWorkspace(selectedWorkspace)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Workspace
                    </Button>
                  )}
                  <div className="ml-auto">
                    <Button onClick={handleSaveSettings} disabled={isSavingSettings}>
                      {isSavingSettings && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Save Changes
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="team" className="space-y-4 pt-4">
                {/* Invite Form */}
                {(selectedWorkspace.role === 'OWNER' || selectedWorkspace.role === 'ADMIN') && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Invite Team Member</CardTitle>
                    </CardHeader>
                    <CardContent className="flex gap-2">
                      <Input
                        placeholder="email@example.com"
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="flex-1"
                      />
                      <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as typeof inviteRole)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="MEMBER">Member</SelectItem>
                          <SelectItem value="VIEWER">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={handleInviteMember} disabled={isInviting}>
                        {isInviting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserPlus className="h-4 w-4" />
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Members List */}
                {isMembersLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            {member.user.profileImageUrl && (
                              <AvatarImage src={member.user.profileImageUrl} />
                            )}
                            <AvatarFallback>
                              {member.user.firstName?.[0] || member.user.email[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {member.user.firstName && member.user.lastName
                                ? `${member.user.firstName} ${member.user.lastName}`
                                : member.user.email}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {member.user.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {member.status === 'PENDING' && (
                            <Badge variant="outline">Pending</Badge>
                          )}
                          <Badge className={roleColors[member.role]}>
                            {member.role}
                          </Badge>
                          {member.role !== 'OWNER' &&
                            (selectedWorkspace.role === 'OWNER' ||
                              (selectedWorkspace.role === 'ADMIN' && member.role !== 'ADMIN')) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {member.role !== 'ADMIN' && (
                                  <DropdownMenuItem
                                    onClick={() => handleUpdateMemberRole(member.id, 'ADMIN')}
                                  >
                                    Make Admin
                                  </DropdownMenuItem>
                                )}
                                {member.role !== 'MEMBER' && (
                                  <DropdownMenuItem
                                    onClick={() => handleUpdateMemberRole(member.id, 'MEMBER')}
                                  >
                                    Make Member
                                  </DropdownMenuItem>
                                )}
                                {member.role !== 'VIEWER' && (
                                  <DropdownMenuItem
                                    onClick={() => handleUpdateMemberRole(member.id, 'VIEWER')}
                                  >
                                    Make Viewer
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleRemoveMember(member)}
                                >
                                  Remove from workspace
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteConfirmWorkspace}
        onOpenChange={() => setDeleteConfirmWorkspace(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workspace</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteConfirmWorkspace?.name}&quot;? This action
              cannot be undone. All funnels, contacts, and data associated with this
              workspace will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteWorkspace}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Workspace
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Leave Confirmation Dialog */}
      <AlertDialog
        open={!!leaveConfirmWorkspace}
        onOpenChange={() => setLeaveConfirmWorkspace(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Workspace</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave &quot;{leaveConfirmWorkspace?.name}&quot;? You will
              lose access to all funnels and data in this workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeaveWorkspace}>
              Leave Workspace
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
