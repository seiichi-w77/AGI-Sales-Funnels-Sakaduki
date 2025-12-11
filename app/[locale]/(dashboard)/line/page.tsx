'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useWorkspace } from '@/components/providers/dashboard-providers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  MoreVertical,
  MessageCircle,
  Users,
  Send,
  Zap,
  Bot,
  Image,
  Video,
  FileText,
  Sparkles,
  Loader2,
  RefreshCw,
  Settings,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

// Types
interface LineOfficialAccount {
  id: string;
  name: string;
  providerName: string;
  basicId: string | null;
  pictureUrl: string | null;
  friendCount: number;
  monthlyMessageLimit: number;
  monthlyMessageUsed: number;
  status: 'PENDING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  webhookEnabled: boolean;
  webhookVerified: boolean;
  connectedAt: string | null;
  lastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface LineBroadcast {
  id: string;
  name: string;
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'FAILED' | 'CANCELLED';
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  scheduledAt: string | null;
  sentAt: string | null;
}

export default function LINEPage() {
  const t = useTranslations('line');
  const { currentWorkspace, isLoading: workspaceLoading } = useWorkspace();
  const workspaceId = currentWorkspace?.id;

  // State
  const [accounts, setAccounts] = useState<LineOfficialAccount[]>([]);
  const [broadcasts, setBroadcasts] = useState<LineBroadcast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [isConnectingAccount, setIsConnectingAccount] = useState(false);
  const [isCreatingBroadcast, setIsCreatingBroadcast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state for new account
  const [newAccount, setNewAccount] = useState({
    name: '',
    providerName: '',
    messagingChannelId: '',
    messagingChannelSecret: '',
    messagingAccessToken: '',
    loginChannelId: '',
    loginChannelSecret: '',
  });

  // Fetch accounts
  const fetchAccounts = useCallback(async () => {
    if (!workspaceId) return;

    try {
      const res = await fetch(`/api/line/official-accounts?workspaceId=${workspaceId}`);
      if (!res.ok) throw new Error('Failed to fetch accounts');
      const data = await res.json();
      setAccounts(data.accounts || []);
    } catch (err) {
      console.error('Fetch accounts error:', err);
      setError('アカウント情報の取得に失敗しました');
    }
  }, [workspaceId]);

  // Fetch broadcasts
  const fetchBroadcasts = useCallback(async () => {
    if (!workspaceId) return;

    try {
      const res = await fetch(`/api/line/broadcasts?workspaceId=${workspaceId}`);
      if (!res.ok) throw new Error('Failed to fetch broadcasts');
      const data = await res.json();
      setBroadcasts(data.broadcasts || []);
    } catch (err) {
      console.error('Fetch broadcasts error:', err);
      // エラーは無視（broadcastsが空の場合もある）
    }
  }, [workspaceId]);

  // Initial fetch
  useEffect(() => {
    if (workspaceId) {
      setIsLoading(true);
      Promise.all([fetchAccounts(), fetchBroadcasts()])
        .finally(() => setIsLoading(false));
    }
  }, [workspaceId, fetchAccounts, fetchBroadcasts]);

  // Create new account
  const handleCreateAccount = async () => {
    if (!workspaceId) return;

    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/line/official-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          ...newAccount,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '作成に失敗しました');
      }

      // リセットして再取得
      setNewAccount({
        name: '',
        providerName: '',
        messagingChannelId: '',
        messagingChannelSecret: '',
        messagingAccessToken: '',
        loginChannelId: '',
        loginChannelSecret: '',
      });
      setIsConnectingAccount(false);
      await fetchAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : '作成に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  // Stats calculation
  const totalFriends = accounts.reduce((acc, a) => acc + a.friendCount, 0);
  const totalMessagesSent = accounts.reduce((acc, a) => acc + a.monthlyMessageUsed, 0);

  // Loading state
  if (workspaceLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!workspaceId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">ワークスペースを読み込んでいます...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">
            LINE公式アカウントの管理と一斉送信
          </p>
        </div>
        <Dialog open={isConnectingAccount} onOpenChange={setIsConnectingAccount}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              アカウント連携
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>LINE公式アカウント連携設定</DialogTitle>
              <DialogDescription>
                LINE Developers Consoleから認証情報を取得して入力してください
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
              {error && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">アカウント名 *</Label>
                  <Input
                    id="name"
                    placeholder="マーケティングアカウント"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="providerName">プロバイダー名 *</Label>
                  <Input
                    id="providerName"
                    placeholder="My Company"
                    value={newAccount.providerName}
                    onChange={(e) => setNewAccount({ ...newAccount, providerName: e.target.value })}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Messaging API設定</h4>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="messagingChannelId">Channel ID *</Label>
                    <Input
                      id="messagingChannelId"
                      placeholder="1234567890"
                      value={newAccount.messagingChannelId}
                      onChange={(e) => setNewAccount({ ...newAccount, messagingChannelId: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="messagingChannelSecret">Channel Secret *</Label>
                    <Input
                      id="messagingChannelSecret"
                      type="password"
                      placeholder="Channel Secret"
                      value={newAccount.messagingChannelSecret}
                      onChange={(e) => setNewAccount({ ...newAccount, messagingChannelSecret: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="messagingAccessToken">Channel Access Token（任意）</Label>
                    <Textarea
                      id="messagingAccessToken"
                      placeholder="長期有効アクセストークン"
                      value={newAccount.messagingAccessToken}
                      onChange={(e) => setNewAccount({ ...newAccount, messagingAccessToken: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">LINEログイン認証設定（推奨）</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  LINEログインを使用する場合は、Messaging APIとは別のChannel ID/Secretが必要です
                </p>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="loginChannelId">Channel ID（認証用）</Label>
                    <Input
                      id="loginChannelId"
                      placeholder="0987654321"
                      value={newAccount.loginChannelId}
                      onChange={(e) => setNewAccount({ ...newAccount, loginChannelId: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="loginChannelSecret">Channel Secret（認証用）</Label>
                    <Input
                      id="loginChannelSecret"
                      type="password"
                      placeholder="Login Channel Secret"
                      value={newAccount.loginChannelSecret}
                      onChange={(e) => setNewAccount({ ...newAccount, loginChannelSecret: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConnectingAccount(false)}>
                キャンセル
              </Button>
              <Button
                onClick={handleCreateAccount}
                disabled={isSaving || !newAccount.name || !newAccount.messagingChannelId || !newAccount.messagingChannelSecret}
              >
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                連携する
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">友だち総数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFriends.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今月の送信数</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMessagesSent.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均開封率</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {broadcasts.length > 0
                ? `${(broadcasts.reduce((acc, b) => acc + (b.deliveredCount > 0 ? (b.openedCount / b.deliveredCount) * 100 : 0), 0) / broadcasts.length).toFixed(1)}%`
                : '-'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">クリック率</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {broadcasts.length > 0
                ? `${(broadcasts.reduce((acc, b) => acc + (b.openedCount > 0 ? (b.clickedCount / b.openedCount) * 100 : 0), 0) / broadcasts.length).toFixed(1)}%`
                : '-'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="accounts">アカウント</TabsTrigger>
          <TabsTrigger value="broadcasts">一斉送信</TabsTrigger>
          <TabsTrigger value="richmenus">リッチメニュー</TabsTrigger>
          <TabsTrigger value="chatbot">チャットボット</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          {accounts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">LINE公式アカウントを連携</h3>
                <p className="text-muted-foreground text-center mb-4">
                  LINE公式アカウントを連携して、メッセージ配信を始めましょう
                </p>
                <Button onClick={() => setIsConnectingAccount(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  アカウント連携
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {accounts.map((account) => (
                <Card key={account.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center">
                          <MessageCircle className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle>{account.name}</CardTitle>
                          <CardDescription>{account.basicId || account.providerName}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={account.status === 'CONNECTED' ? 'success' : account.status === 'PENDING' ? 'secondary' : 'destructive'}>
                        {account.status === 'CONNECTED' ? '連携済み' : account.status === 'PENDING' ? '認証待ち' : 'エラー'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">友だち数</p>
                        <p className="font-medium text-lg">{account.friendCount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">今月のメッセージ</p>
                        <p className="font-medium text-lg">
                          {account.monthlyMessageUsed} / {account.monthlyMessageLimit}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                      {account.webhookVerified ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                      )}
                      Webhook: {account.webhookEnabled ? '有効' : '無効'}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="h-4 w-4 mr-2" />
                        設定
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        同期
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="broadcasts" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isCreatingBroadcast} onOpenChange={setIsCreatingBroadcast}>
              <DialogTrigger asChild>
                <Button disabled={accounts.length === 0}>
                  <Plus className="h-4 w-4 mr-2" />
                  一斉送信作成
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>一斉送信メッセージ作成</DialogTitle>
                  <DialogDescription>
                    友だちにメッセージを送信します
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="broadcastName">配信名</Label>
                    <Input id="broadcastName" placeholder="1月のお知らせ" />
                  </div>
                  <div className="grid gap-2">
                    <Label>メッセージタイプ</Label>
                    <div className="grid grid-cols-4 gap-2">
                      <Button variant="outline" className="h-20 flex-col gap-2">
                        <FileText className="h-5 w-5" />
                        <span className="text-xs">テキスト</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex-col gap-2">
                        <Image className="h-5 w-5" />
                        <span className="text-xs">画像</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex-col gap-2">
                        <Video className="h-5 w-5" />
                        <span className="text-xs">動画</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex-col gap-2">
                        <Sparkles className="h-5 w-5" />
                        <span className="text-xs">ボタン</span>
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="message">メッセージ</Label>
                    <Textarea id="message" placeholder="メッセージを入力..." rows={4} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>配信アカウント</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="アカウントを選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>配信対象</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="すべての友だち" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">すべての友だち</SelectItem>
                          <SelectItem value="new">新規（30日以内）</SelectItem>
                          <SelectItem value="active">アクティブユーザー</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreatingBroadcast(false)}>
                    下書き保存
                  </Button>
                  <Button onClick={() => setIsCreatingBroadcast(false)}>
                    <Send className="h-4 w-4 mr-2" />
                    今すぐ送信
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {broadcasts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Send className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">配信履歴がありません</h3>
                <p className="text-muted-foreground text-center mb-4">
                  一斉送信を作成して、友だちにメッセージを届けましょう
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>配信名</TableHead>
                    <TableHead>対象者数</TableHead>
                    <TableHead>送信数</TableHead>
                    <TableHead>開封率</TableHead>
                    <TableHead>クリック率</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {broadcasts.map((broadcast) => (
                    <TableRow key={broadcast.id}>
                      <TableCell className="font-medium">{broadcast.name}</TableCell>
                      <TableCell>{broadcast.totalRecipients.toLocaleString()}</TableCell>
                      <TableCell>{broadcast.sentCount.toLocaleString()}</TableCell>
                      <TableCell>
                        {broadcast.deliveredCount > 0
                          ? `${((broadcast.openedCount / broadcast.deliveredCount) * 100).toFixed(1)}%`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {broadcast.openedCount > 0
                          ? `${((broadcast.clickedCount / broadcast.openedCount) * 100).toFixed(1)}%`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            broadcast.status === 'SENT'
                              ? 'success'
                              : broadcast.status === 'SCHEDULED'
                              ? 'default'
                              : broadcast.status === 'FAILED'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {broadcast.status === 'SENT' ? '送信済み' :
                           broadcast.status === 'SCHEDULED' ? '予約中' :
                           broadcast.status === 'SENDING' ? '送信中' :
                           broadcast.status === 'FAILED' ? '失敗' :
                           broadcast.status === 'DRAFT' ? '下書き' : 'キャンセル'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>詳細を見る</DropdownMenuItem>
                            <DropdownMenuItem>複製する</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              削除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="richmenus" className="space-y-4">
          <div className="flex justify-end">
            <Button disabled={accounts.length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              リッチメニュー作成
            </Button>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Settings className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">リッチメニューを作成</h3>
              <p className="text-muted-foreground text-center mb-4">
                タップできるメニューを作成して、ユーザー体験を向上させましょう
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chatbot" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>AIチャットボット</CardTitle>
                  <CardDescription>
                    AIを使用して自動応答を設定
                  </CardDescription>
                </div>
                <Switch disabled={accounts.length === 0} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <Bot className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <p className="font-medium">GPT-4連携</p>
                  <p className="text-sm text-muted-foreground">
                    AIを使って顧客からの問い合わせに自動応答
                  </p>
                </div>
                <Button disabled={accounts.length === 0}>設定</Button>
              </div>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>システムプロンプト</Label>
                  <Textarea
                    placeholder="あなたは親切なカスタマーサポートエージェントです..."
                    rows={4}
                    disabled={accounts.length === 0}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>応答言語</Label>
                    <Select disabled={accounts.length === 0}>
                      <SelectTrigger>
                        <SelectValue placeholder="日本語" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ja">日本語</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="auto">自動検出</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>フォールバック</Label>
                    <Select disabled={accounts.length === 0}>
                      <SelectTrigger>
                        <SelectValue placeholder="オペレーターに転送" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="handoff">オペレーターに転送</SelectItem>
                        <SelectItem value="ticket">チケット作成</SelectItem>
                        <SelectItem value="message">定型文送信</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
