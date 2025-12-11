'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface FunnelStep {
  id: string;
  name: string;
  type: string;
  sortOrder: number;
}

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
  steps: FunnelStep[];
  _count: {
    analytics: number;
  };
}

const funnelTypes = [
  { value: 'LEAD_MAGNET', label: 'Lead Magnet', icon: '📧' },
  { value: 'BOOK', label: 'Book Funnel', icon: '📚' },
  { value: 'CART', label: 'Cart Funnel', icon: '🛒' },
  { value: 'WEBINAR', label: 'Webinar', icon: '🎥' },
  { value: 'VSL', label: 'Video Sales Letter', icon: '📹' },
  { value: 'STOREFRONT', label: 'Storefront', icon: '🏪' },
  { value: 'CUSTOM', label: 'Custom', icon: '✨' },
];

export default function FunnelsPage() {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const workspaceId = 'demo-workspace';

  useEffect(() => {
    fetchFunnels();
  }, [statusFilter, typeFilter]);

  const fetchFunnels = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ workspaceId });
      if (statusFilter) params.set('status', statusFilter);
      if (typeFilter) params.set('type', typeFilter);

      const res = await fetch('/api/funnels?' + params.toString());
      const data = await res.json();

      if (res.ok) {
        setFunnels(data.funnels);
      }
    } catch (error) {
      console.error('Failed to fetch funnels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this funnel?')) return;

    try {
      const res = await fetch('/api/funnels/' + id, { method: 'DELETE' });
      if (res.ok) {
        fetchFunnels();
      }
    } catch (error) {
      console.error('Failed to delete funnel:', error);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch('/api/funnels/' + id + '/duplicate', {
        method: 'POST',
      });
      if (res.ok) {
        fetchFunnels();
      }
    } catch (error) {
      console.error('Failed to duplicate funnel:', error);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800';
      case 'ARCHIVED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeInfo = (type: string) => {
    return funnelTypes.find((t) => t.value === type) || { value: type, label: type, icon: '📄' };
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Funnels</h1>
          <p className="text-gray-500">Build and manage your sales funnels</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Funnel
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-4 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            {funnelTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Funnels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            Loading...
          </div>
        ) : funnels.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No funnels found. Create your first funnel!
          </div>
        ) : (
          funnels.map((funnel) => {
            const typeInfo = getTypeInfo(funnel.type);
            return (
              <div
                key={funnel.id}
                className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 relative flex items-center justify-center">
                  <span className="text-6xl">{typeInfo.icon}</span>
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span
                      className={
                        'px-2 py-0.5 text-xs font-medium rounded ' +
                        getStatusBadgeClass(funnel.status)
                      }
                    >
                      {funnel.status}
                    </span>
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <span className="px-2 py-0.5 text-xs font-medium bg-white/80 text-gray-700 rounded">
                      {funnel.steps.length} steps
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <Link href={'/funnels/' + funnel.id}>
                    <h3 className="font-semibold text-gray-900 hover:text-blue-600 truncate">
                      {funnel.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">
                    {typeInfo.label}
                  </p>
                  {funnel.description && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                      {funnel.description}
                    </p>
                  )}
                  <div className="mt-3 text-xs text-gray-400">
                    Updated {new Date(funnel.updatedAt).toLocaleDateString()}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link
                      href={'/funnels/' + funnel.id}
                      className="flex-1 px-3 py-1.5 text-sm text-center text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDuplicate(funnel.id)}
                      className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={() => handleDelete(funnel.id)}
                      className="px-3 py-1.5 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Funnel Modal */}
      {showCreateModal && (
        <CreateFunnelModal
          workspaceId={workspaceId}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            fetchFunnels();
          }}
        />
      )}
    </div>
  );
}

function CreateFunnelModal({
  workspaceId,
  onClose,
  onCreated,
}: {
  workspaceId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState('LEAD_MAGNET');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/funnels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          name,
          type,
          description: description || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create funnel');
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
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Create New Funnel</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Funnel Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Lead Capture Funnel"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Funnel Type *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {funnelTypes.map((t) => (
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Optional description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
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
              {loading ? 'Creating...' : 'Create Funnel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
