'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useWorkspace } from '@/components/providers/dashboard-providers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Send,
  Trash,
  Mail,
  MousePointerClick,
  Users,
  Loader2,
  Calendar,
  Clock,
  Edit,
} from 'lucide-react';

interface Broadcast {
  id: string;
  name: string;
  subject: string;
  status: string;
  scheduledAt: string | null;
  sentAt: string | null;
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  createdAt: string;
}

interface Stats {
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  openRate: number;
  clickRate: number;
}

export default function EmailPage() {
  const t = useTranslations('email');
  const router = useRouter();
  const { currentWorkspace, isLoading: workspaceLoading } = useWorkspace();
  const workspaceId = currentWorkspace?.id;

  // State
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalSent: 0,
    totalOpened: 0,
    totalClicked: 0,
    openRate: 0,
    clickRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Create dialog
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Delete dialog
  const [deleteConfirm, setDeleteConfirm] = useState<Broadcast | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBroadcasts = useCallback(async () => {
    if (!workspaceId) return;
    try {
      const params = new URLSearchParams({ workspaceId });
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (search) params.append('search', search);

      const response = await fetch(`/api/broadcasts?${params}`);
      if (!response.ok) throw new Error('Failed to fetch broadcasts');
      const data = await response.json();
      setBroadcasts(data.broadcasts || []);
      setStats(data.stats || {
        totalSent: 0,
        totalOpened: 0,
        totalClicked: 0,
        openRate: 0,
        clickRate: 0,
      });
    } catch (error) {
      console.error('Fetch broadcasts error:', error);
    }
  }, [workspaceId, statusFilter, search]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchBroadcasts();
      setIsLoading(false);
    };
    loadData();
  }, [fetchBroadcasts]);

  const handleCreate = async () => {
    if (!newName.trim()) {
      setCreateError('ブロードキャスト名を入力してください');
      return;
    }
    if (!workspaceId) {
      setCreateError('ワークスペースが選択されていません。ページを再読み込みしてください。');
      return;
    }

    setIsCreating(true);
    setCreateError('');
    try {
      const response = await fetch('/api/broadcasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, name: newName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create broadcast');
      }

      const data = await response.json();
      setIsCreateOpen(false);
      setNewName('');
      // 作成後に詳細ページに遷移
      router.push(`/email/${data.broadcast.id}`);
    } catch (error) {
      console.error('Create broadcast error:', error);
      setCreateError(error instanceof Error ? error.message : '作成に失敗しました');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/broadcasts/${deleteConfirm.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete broadcast');

      setDeleteConfirm(null);
      await fetchBroadcasts();
    } catch (error) {
      console.error('Delete broadcast error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
            Manage your email campaigns and broadcasts
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
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.sent')}</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total emails sent</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.opened')}</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalOpened.toLocaleString()} opened
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.clicked')}</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.clickRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalClicked.toLocaleString()} clicked
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Broadcasts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{broadcasts.length}</div>
            <p className="text-xs text-muted-foreground">Total campaigns</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search broadcasts..."
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
            <SelectItem value="SCHEDULED">Scheduled</SelectItem>
            <SelectItem value="SENDING">Sending</SelectItem>
            <SelectItem value="SENT">Sent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Empty State */}
      {broadcasts.length === 0 && (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-primary/10">
              <Mail className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No broadcasts yet</h3>
              <p className="text-muted-foreground">
                Create your first email broadcast to start reaching your audience
              </p>
            </div>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Broadcast
            </Button>
          </div>
        </Card>
      )}

      {/* Broadcasts List */}
      {broadcasts.length > 0 && (
        <div className="space-y-4">
          {broadcasts.map((broadcast) => (
            <Card key={broadcast.id} className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{broadcast.name}</h3>
                    <StatusBadge status={broadcast.status} />
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {broadcast.subject || 'No subject'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    {broadcast.status === 'SENT' && (
                      <>
                        <Clock className="h-3 w-3" />
                        Sent: {formatDate(broadcast.sentAt)}
                      </>
                    )}
                    {broadcast.status === 'SCHEDULED' && (
                      <>
                        <Calendar className="h-3 w-3" />
                        Scheduled: {formatDate(broadcast.scheduledAt)}
                      </>
                    )}
                    {broadcast.status === 'DRAFT' && (
                      <>
                        Created: {formatDate(broadcast.createdAt)}
                      </>
                    )}
                  </p>
                </div>
                {broadcast.status === 'SENT' && broadcast.totalSent > 0 && (
                  <div className="hidden md:flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="text-muted-foreground">Sent</p>
                      <p className="font-medium">{broadcast.totalSent.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Opened</p>
                      <p className="font-medium">
                        {broadcast.totalOpened} (
                        {((broadcast.totalOpened / broadcast.totalSent) * 100).toFixed(1)}%)
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Clicked</p>
                      <p className="font-medium">
                        {broadcast.totalClicked} (
                        {((broadcast.totalClicked / broadcast.totalSent) * 100).toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => router.push(`/email/${broadcast.id}`)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      {['DRAFT', 'CANCELLED'].includes(broadcast.status) && (
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteConfirm(broadcast)}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Broadcast</DialogTitle>
            <DialogDescription>
              Give your broadcast a name to get started
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="broadcast-name">Broadcast Name *</Label>
              <Input
                id="broadcast-name"
                placeholder="e.g., Weekly Newsletter"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!newName.trim() || isCreating}
            >
              {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Broadcast
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Broadcast</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirm?.name}"? This action cannot be undone.
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

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    SENT: 'bg-green-100 text-green-700',
    SCHEDULED: 'bg-blue-100 text-blue-700',
    DRAFT: 'bg-gray-100 text-gray-700',
    SENDING: 'bg-yellow-100 text-yellow-700',
    PAUSED: 'bg-orange-100 text-orange-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`px-2 py-0.5 text-xs rounded-full ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}
