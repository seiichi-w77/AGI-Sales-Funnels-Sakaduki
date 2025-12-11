'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Broadcast {
  id: string;
  name: string;
  subject: string;
  preheader: string | null;
  fromName: string;
  fromEmail: string;
  replyTo: string | null;
  content: any;
  status: string;
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  estimatedRecipients: number;
  openRate: number;
  clickRate: number;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
}

interface Analytics {
  summary: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
  };
  rates: {
    openRate: string;
    clickRate: string;
    bounceRate: string;
  };
  timeline: Array<{ hour: string; opens: number; clicks: number }>;
  linkClicks: Array<{ url: string; totalClicks: number; uniqueClicks: number }>;
}

export default function BroadcastDetailPage({ params }: { params: Promise<{ broadcastId: string }> }) {
  const resolvedParams = use(params);
  const _router = useRouter();
  const [broadcast, setBroadcast] = useState<Broadcast | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('edit');
  const [editData, setEditData] = useState({
    name: '',
    subject: '',
    preheader: '',
    fromName: '',
    fromEmail: '',
    replyTo: '',
  });
  const [saving, setSaving] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);

  useEffect(() => {
    fetchBroadcast();
  }, [resolvedParams.broadcastId]);

  const fetchBroadcast = async () => {
    try {
      const res = await fetch('/api/broadcasts/' + resolvedParams.broadcastId);
      const data = await res.json();
      if (res.ok) {
        setBroadcast(data.broadcast);
        setEditData({
          name: data.broadcast.name || '',
          subject: data.broadcast.subject || '',
          preheader: data.broadcast.preheader || '',
          fromName: data.broadcast.fromName || '',
          fromEmail: data.broadcast.fromEmail || '',
          replyTo: data.broadcast.replyTo || '',
        });
        if (data.broadcast.status === 'SENT') {
          setActiveTab('analytics');
          fetchAnalytics();
        }
      }
    } catch (err) {
      console.error('Failed to fetch broadcast:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/broadcasts/' + resolvedParams.broadcastId + '/analytics');
      const data = await res.json();
      if (res.ok) {
        setAnalytics(data.analytics);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/broadcasts/' + resolvedParams.broadcastId, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      if (res.ok) {
        fetchBroadcast();
      }
    } catch (err) {
      console.error('Failed to save broadcast:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async () => {
    try {
      const res = await fetch('/api/broadcasts/' + resolvedParams.broadcastId + '/send', {
        method: 'POST',
      });

      if (res.ok) {
        setShowSendModal(false);
        fetchBroadcast();
      }
    } catch (err) {
      console.error('Failed to send broadcast:', err);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'SENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'SENT':
        return 'bg-green-100 text-green-800';
      case 'CANCELED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!broadcast) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          Broadcast not found
        </div>
      </div>
    );
  }

  const canEdit = broadcast.status === 'DRAFT' || broadcast.status === 'SCHEDULED';
  const canSend = broadcast.status === 'DRAFT' && editData.subject;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/broadcasts" className="text-gray-500 hover:text-gray-700">
            ← Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{broadcast.name}</h1>
            <span className={'px-2 py-1 text-xs font-medium rounded-full ' + getStatusBadgeClass(broadcast.status)}>
              {broadcast.status}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <>
              <button
                onClick={() => setShowTestModal(true)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Send Test
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              {canSend && (
                <button
                  onClick={() => setShowSendModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Send Now
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          {['edit', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab === 'analytics') fetchAnalytics();
              }}
              className={
                'pb-4 text-sm font-medium border-b-2 -mb-px ' +
                (activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700')
              }
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'edit' && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            {/* Email Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Email Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Line *
                  </label>
                  <input
                    type="text"
                    value={editData.subject}
                    onChange={(e) => setEditData({ ...editData, subject: e.target.value })}
                    disabled={!canEdit}
                    placeholder="Enter your email subject"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preview Text
                  </label>
                  <input
                    type="text"
                    value={editData.preheader}
                    onChange={(e) => setEditData({ ...editData, preheader: e.target.value })}
                    disabled={!canEdit}
                    placeholder="Brief summary shown in inbox"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      From Name
                    </label>
                    <input
                      type="text"
                      value={editData.fromName}
                      onChange={(e) => setEditData({ ...editData, fromName: e.target.value })}
                      disabled={!canEdit}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      From Email
                    </label>
                    <input
                      type="email"
                      value={editData.fromEmail}
                      onChange={(e) => setEditData({ ...editData, fromEmail: e.target.value })}
                      disabled={!canEdit}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Email Content Placeholder */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Email Content</h2>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center text-gray-500">
                <p>Email editor will be integrated here</p>
                <p className="text-sm mt-2">Drag and drop blocks to design your email</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Audience */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Audience</h3>
              <div className="text-2xl font-bold text-gray-900">
                {broadcast.estimatedRecipients.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Estimated recipients</div>
              <button className="mt-4 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                Edit Audience
              </button>
            </div>

            {/* Schedule */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Schedule</h3>
              {broadcast.scheduledAt ? (
                <div>
                  <div className="text-lg font-semibold">
                    {new Date(broadcast.scheduledAt).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(broadcast.scheduledAt).toLocaleTimeString()}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">Not scheduled</div>
              )}
            </div>

            {/* Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Created</span>
                  <span>{new Date(broadcast.createdAt).toLocaleDateString()}</span>
                </div>
                {broadcast.sentAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Sent</span>
                    <span>{new Date(broadcast.sentAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-5 gap-4">
            {[
              { label: 'Sent', value: analytics.summary.sent },
              { label: 'Delivered', value: analytics.summary.delivered },
              { label: 'Opened', value: analytics.summary.opened, rate: analytics.rates.openRate },
              { label: 'Clicked', value: analytics.summary.clicked, rate: analytics.rates.clickRate },
              { label: 'Bounced', value: analytics.summary.bounced, rate: analytics.rates.bounceRate },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-500">{stat.label}</div>
                <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
                {stat.rate && (
                  <div className="text-sm text-gray-500">{stat.rate}%</div>
                )}
              </div>
            ))}
          </div>

          {/* Link Clicks */}
          {analytics.linkClicks.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Link Performance</h2>
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-sm font-medium text-gray-500">URL</th>
                    <th className="text-right py-2 text-sm font-medium text-gray-500">Total Clicks</th>
                    <th className="text-right py-2 text-sm font-medium text-gray-500">Unique Clicks</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.linkClicks.map((link, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 text-sm text-blue-600 truncate max-w-md">
                        {link.url}
                      </td>
                      <td className="py-2 text-sm text-right">{link.totalClicks}</td>
                      <td className="py-2 text-sm text-right">{link.uniqueClicks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Test Send Modal */}
      {showTestModal && (
        <TestSendModal
          broadcastId={resolvedParams.broadcastId}
          onClose={() => setShowTestModal(false)}
        />
      )}

      {/* Send Confirmation Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h2 className="text-lg font-semibold mb-4">Confirm Send</h2>
            <div className="space-y-2 mb-6">
              <p><strong>Subject:</strong> {editData.subject}</p>
              <p><strong>Recipients:</strong> {broadcast.estimatedRecipients.toLocaleString()}</p>
            </div>
            <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg mb-6 text-sm">
              This will send the broadcast to all selected recipients immediately.
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSendModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Confirm & Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TestSendModal({
  broadcastId,
  onClose,
}: {
  broadcastId: string;
  onClose: () => void;
}) {
  const [emails, setEmails] = useState('');
  const [useSampleData, setUseSampleData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSend = async () => {
    setLoading(true);
    try {
      const emailList = emails.split(',').map((e) => e.trim()).filter((e) => e);
      const res = await fetch('/api/broadcasts/' + broadcastId + '/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: emailList, useSampleData }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data.message);
      } else {
        setResult('Error: ' + data.error);
      }
    } catch {
      setResult('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h2 className="text-lg font-semibold mb-4">Send Test Email</h2>
        {result ? (
          <div className="space-y-4">
            <div className="p-3 bg-green-50 text-green-700 rounded-lg">
              {result}
            </div>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-100 rounded-lg"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Addresses
              </label>
              <input
                type="text"
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                placeholder="test@example.com, another@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate multiple addresses with commas (max 5)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="useSampleData"
                checked={useSampleData}
                onChange={(e) => setUseSampleData(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="useSampleData" className="text-sm text-gray-700">
                Use sample contact data for merge tags
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={loading || !emails}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Test'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
