'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  ArrowLeft,
  Save,
  Send,
  TestTube,
  Loader2,
  Users,
  Mail,
  Eye,
} from 'lucide-react';

interface Broadcast {
  id: string;
  name: string;
  subject: string;
  preheader: string;
  fromName: string;
  fromEmail: string;
  replyTo: string | null;
  content: { blocks: ContentBlock[] };
  contentText: string;
  status: string;
  audienceRules: AudienceRules | null;
  scheduledAt: string | null;
  sentAt: string | null;
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
}

interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'button';
  content?: string;
  url?: string;
  alt?: string;
  buttonText?: string;
  buttonUrl?: string;
}

interface AudienceRules {
  type: 'all' | 'segment';
  segmentId?: string;
}

const MERGE_TAGS = [
  { tag: '{{first_name}}', label: '名' },
  { tag: '{{last_name}}', label: '姓' },
  { tag: '{{email}}', label: 'メールアドレス' },
  { tag: '{{company}}', label: '会社名' },
];

export default function BroadcastEditPage() {
  const params = useParams();
  const router = useRouter();
  const _t = useTranslations('email');
  const broadcastId = params.broadcastId as string;

  const [broadcast, setBroadcast] = useState<Broadcast | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isTestSending, setIsTestSending] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [preheader, setPreheader] = useState('');
  const [fromName, setFromName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [contentText, setContentText] = useState('');
  const [audienceType, setAudienceType] = useState<'all' | 'segment'>('all');

  // Dialogs
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  const fetchBroadcast = useCallback(async () => {
    try {
      const response = await fetch(`/api/broadcasts/${broadcastId}`);
      if (!response.ok) throw new Error('Failed to fetch broadcast');
      const data = await response.json();
      const b = data.broadcast;
      setBroadcast(b);
      setName(b.name || '');
      setSubject(b.subject || '');
      setPreheader(b.preheader || '');
      setFromName(b.fromName || '');
      setFromEmail(b.fromEmail || '');
      setReplyTo(b.replyTo || '');
      setContentText(b.contentText || '');
      setAudienceType(b.audienceRules?.type || 'all');
    } catch (error) {
      console.error('Fetch broadcast error:', error);
    }
  }, [broadcastId]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchBroadcast();
      setIsLoading(false);
    };
    loadData();
  }, [fetchBroadcast]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/broadcasts/${broadcastId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          subject,
          preheader,
          fromName,
          fromEmail,
          replyTo: replyTo || null,
          contentText,
          audienceRules: { type: audienceType },
        }),
      });

      if (!response.ok) throw new Error('Failed to save broadcast');
      await fetchBroadcast();
    } catch (error) {
      console.error('Save broadcast error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestSend = async () => {
    if (!testEmail.trim()) return;
    setIsTestSending(true);
    try {
      const response = await fetch(`/api/broadcasts/${broadcastId}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail }),
      });

      if (!response.ok) throw new Error('Failed to send test email');
      setShowTestDialog(false);
      setTestEmail('');
    } catch (error) {
      console.error('Test send error:', error);
    } finally {
      setIsTestSending(false);
    }
  };

  const handleSend = async () => {
    setIsSending(true);
    try {
      const response = await fetch(`/api/broadcasts/${broadcastId}/send`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to send broadcast');
      setShowSendConfirm(false);
      router.push('/email');
    } catch (error) {
      console.error('Send broadcast error:', error);
    } finally {
      setIsSending(false);
    }
  };

  const insertMergeTag = (tag: string) => {
    setContentText((prev) => prev + tag);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!broadcast) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-muted-foreground">Broadcast not found</p>
        <Button variant="outline" onClick={() => router.push('/email')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Email
        </Button>
      </div>
    );
  }

  const isSent = broadcast.status === 'SENT';
  const isSending_status = broadcast.status === 'SENDING';
  const isEditable = !isSent && !isSending_status;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/email')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{name || 'Untitled Broadcast'}</h1>
            <p className="text-sm text-muted-foreground">
              Status: <StatusBadge status={broadcast.status} />
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditable && (
            <>
              <Button variant="outline" onClick={() => setShowTestDialog(true)}>
                <TestTube className="h-4 w-4 mr-2" />
                Test Send
              </Button>
              <Button variant="outline" onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button onClick={() => setShowSendConfirm(true)}>
                <Send className="h-4 w-4 mr-2" />
                Send Now
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content">
            <Mail className="h-4 w-4 mr-2" />
            Content
          </TabsTrigger>
          <TabsTrigger value="audience">
            <Users className="h-4 w-4 mr-2" />
            Audience
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Email Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Campaign Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditable}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject Line</Label>
                  <Input
                    id="subject"
                    placeholder="Enter email subject..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    disabled={!isEditable}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preheader">Preheader Text</Label>
                  <Input
                    id="preheader"
                    placeholder="Preview text shown in inbox..."
                    value={preheader}
                    onChange={(e) => setPreheader(e.target.value)}
                    disabled={!isEditable}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fromName">From Name</Label>
                    <Input
                      id="fromName"
                      value={fromName}
                      onChange={(e) => setFromName(e.target.value)}
                      disabled={!isEditable}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fromEmail">From Email</Label>
                    <Input
                      id="fromEmail"
                      type="email"
                      value={fromEmail}
                      onChange={(e) => setFromEmail(e.target.value)}
                      disabled={!isEditable}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="replyTo">Reply-To Email (Optional)</Label>
                  <Input
                    id="replyTo"
                    type="email"
                    placeholder="reply@example.com"
                    value={replyTo}
                    onChange={(e) => setReplyTo(e.target.value)}
                    disabled={!isEditable}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Merge Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Merge Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Click to insert personalization tags into your email content.
                </p>
                <div className="flex flex-wrap gap-2">
                  {MERGE_TAGS.map((tag) => (
                    <Button
                      key={tag.tag}
                      variant="outline"
                      size="sm"
                      onClick={() => insertMergeTag(tag.tag)}
                      disabled={!isEditable}
                    >
                      {tag.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Email Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Email Content</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Write your email content here...

You can use merge tags like {{first_name}} to personalize your emails."
                className="min-h-[300px] font-mono"
                value={contentText}
                onChange={(e) => setContentText(e.target.value)}
                disabled={!isEditable}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Target Audience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Send To</Label>
                <Select
                  value={audienceType}
                  onValueChange={(v) => setAudienceType(v as 'all' | 'segment')}
                  disabled={!isEditable}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Contacts</SelectItem>
                    <SelectItem value="segment">Specific Segment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {audienceType === 'segment' && (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    Segment selection will be available in a future update.
                    For now, the email will be sent to all contacts.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Email Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 bg-white">
                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <p className="text-sm text-muted-foreground">From: {fromName} &lt;{fromEmail}&gt;</p>
                    <p className="text-sm text-muted-foreground">Subject: {subject || '(No subject)'}</p>
                  </div>
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm">
                      {contentText || '(No content)'}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Test Send Dialog */}
      <AlertDialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Test Email</AlertDialogTitle>
            <AlertDialogDescription>
              Send a test email to verify your content before sending to your audience.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="test-email">Test Email Address</Label>
            <Input
              id="test-email"
              type="email"
              placeholder="your@email.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTestSend}
              disabled={!testEmail.trim() || isTestSending}
            >
              {isTestSending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send Test
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Send Confirmation Dialog */}
      <AlertDialog open={showSendConfirm} onOpenChange={setShowSendConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Broadcast</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to send this broadcast? This action cannot be undone.
              The email will be sent to {audienceType === 'all' ? 'all contacts' : 'selected segment'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSend} disabled={isSending}>
              {isSending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send Broadcast
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
