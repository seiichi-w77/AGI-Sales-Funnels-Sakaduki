'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FunnelStepVariant {
  id: string;
  name: string;
  weight: number;
  isControl: boolean;
  isActive: boolean;
}

interface FunnelStep {
  id: string;
  name: string;
  slug: string;
  type: string;
  sortOrder: number;
  isPublished: boolean;
  variants: FunnelStepVariant[];
}

interface Funnel {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  type: string;
  status: string;
  description: string | null;
  settings: Record<string, unknown> | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  steps: FunnelStep[];
}

const stepTypes = [
  { value: 'OPTIN', label: 'Opt-in Page', icon: '📧' },
  { value: 'SALES', label: 'Sales Page', icon: '💰' },
  { value: 'UPSELL', label: 'Upsell', icon: '📈' },
  { value: 'DOWNSELL', label: 'Downsell', icon: '📉' },
  { value: 'ORDER_FORM', label: 'Order Form', icon: '📝' },
  { value: 'CHECKOUT', label: 'Checkout', icon: '🛒' },
  { value: 'THANK_YOU', label: 'Thank You', icon: '🎉' },
  { value: 'WEBINAR', label: 'Webinar', icon: '🎥' },
  { value: 'MEMBER', label: 'Member Area', icon: '👤' },
  { value: 'CUSTOM', label: 'Custom', icon: '✨' },
];

export default function FunnelDetailPage({
  params,
}: {
  params: Promise<{ funnelId: string }>;
}) {
  const { funnelId } = use(params);
  const router = useRouter();
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('steps');
  const [showStepModal, setShowStepModal] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('DRAFT');

  useEffect(() => {
    fetchFunnel();
  }, [funnelId]);

  const fetchFunnel = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/funnels/' + funnelId);
      const data = await res.json();

      if (res.ok) {
        setFunnel(data.funnel);
        setName(data.funnel.name);
        setDescription(data.funnel.description || '');
        setStatus(data.funnel.status);
      }
    } catch (error) {
      console.error('Failed to fetch funnel:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/funnels/' + funnelId, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: description || null,
          status,
        }),
      });

      if (res.ok) {
        fetchFunnel();
      }
    } catch (error) {
      console.error('Failed to save funnel:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    if (!confirm('Are you sure you want to delete this step?')) return;

    try {
      const res = await fetch(
        '/api/funnels/' + funnelId + '/steps/' + stepId,
        { method: 'DELETE' }
      );
      if (res.ok) {
        fetchFunnel();
      }
    } catch (error) {
      console.error('Failed to delete step:', error);
    }
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/funnels/' + funnelId + '/publish', {
        method: 'POST',
      });

      if (res.ok) {
        fetchFunnel();
      }
    } catch (error) {
      console.error('Failed to publish funnel:', error);
    } finally {
      setSaving(false);
    }
  };

  const getStepTypeInfo = (type: string) => {
    return stepTypes.find((t) => t.value === type) || { value: type, label: type, icon: '📄' };
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading funnel...</div>;
  }

  if (!funnel) {
    return <div className="p-6 text-center text-gray-500">Funnel not found</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/funnels" className="text-gray-500 hover:text-gray-700">
            &larr; Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{funnel.name}</h1>
            <p className="text-gray-500">Funnel ID: {funnel.id}</p>
          </div>
          <span
            className={
              'px-2 py-1 text-sm font-medium rounded ' +
              (funnel.status === 'PUBLISHED'
                ? 'bg-green-100 text-green-800'
                : funnel.status === 'ARCHIVED'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800')
            }
          >
            {funnel.status}
          </span>
        </div>
        <div className="flex gap-2">
          {funnel.status !== 'PUBLISHED' && (
            <button
              onClick={handlePublish}
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Publish
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {['steps', 'settings', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={
                'pb-3 text-sm font-medium border-b-2 ' +
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

      {/* Steps Tab */}
      {activeTab === 'steps' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Funnel Steps</h2>
            <button
              onClick={() => setShowStepModal(true)}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Step
            </button>
          </div>

          {/* Steps Flow */}
          <div className="bg-white rounded-lg shadow p-6">
            {funnel.steps.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No steps yet. Add your first step to get started!
              </div>
            ) : (
              <div className="space-y-4">
                {funnel.steps.map((step, index) => {
                  const typeInfo = getStepTypeInfo(step.type);
                  return (
                    <div key={step.id}>
                      <div className="flex items-center gap-4 p-4 border rounded-lg hover:border-blue-300 transition-colors">
                        <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                          {typeInfo.icon}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {step.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {typeInfo.label} • /{funnel.slug}/{step.slug}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {step.isPublished ? (
                            <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded">
                              Published
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-800 rounded">
                              Draft
                            </span>
                          )}
                          {step.variants.length > 1 && (
                            <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded">
                              A/B Test
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => router.push('/funnels/' + funnelId + '/steps/' + step.id)}
                            className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteStep(step.id)}
                            className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      {index < funnel.steps.length - 1 && (
                        <div className="flex justify-center py-2">
                          <div className="w-0.5 h-6 bg-gray-300"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">General Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Funnel Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Funnel URL</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-500">
                    /f/
                  </span>
                  <input
                    type="text"
                    value={funnel.slug}
                    disabled
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg bg-gray-50"
                  />
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Full URL</div>
                <div className="font-mono text-sm break-all">
                  https://yourdomain.com/f/{funnel.slug}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Funnel Info</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Type</span>
                <span className="font-medium">{funnel.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Steps</span>
                <span className="font-medium">{funnel.steps.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="font-medium">
                  {new Date(funnel.createdAt).toLocaleDateString()}
                </span>
              </div>
              {funnel.publishedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Published</span>
                  <span className="font-medium">
                    {new Date(funnel.publishedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Analytics</h2>
          <div className="text-center py-12 text-gray-500">
            Analytics data will be displayed here once the funnel receives traffic.
          </div>
        </div>
      )}

      {/* Add Step Modal */}
      {showStepModal && (
        <AddStepModal
          funnelId={funnelId}
          onClose={() => setShowStepModal(false)}
          onCreated={() => {
            setShowStepModal(false);
            fetchFunnel();
          }}
        />
      )}
    </div>
  );
}

function AddStepModal({
  funnelId,
  onClose,
  onCreated,
}: {
  funnelId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState('OPTIN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/funnels/' + funnelId + '/steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          type,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create step');
        return;
      }

      onCreated();
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Add Funnel Step</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Step Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Opt-in Page"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step Type *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {stepTypes.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={
                    'p-3 text-left border rounded-lg ' +
                    (type === t.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400')
                  }
                >
                  <span className="text-lg mr-2">{t.icon}</span>
                  <span className="text-sm">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Step'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
