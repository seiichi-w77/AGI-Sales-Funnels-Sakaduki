'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Broadcast {
  id: string;
  name: string;
  subject: string;
  status: string;
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  openRate: number;
  clickRate: number;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
}

export default function BroadcastsPage() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // TODO: Get workspaceId from context/session
  const workspaceId = 'demo-workspace';

  useEffect(() => {
    fetchBroadcasts();
  }, [statusFilter, pagination.page]);

  const fetchBroadcasts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        workspaceId,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('search', search);

      const res = await fetch('/api/broadcasts?' + params.toString());
      const data = await res.json();

      if (res.ok) {
        setBroadcasts(data.broadcasts);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch broadcasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this broadcast?')) return;

    try {
      const res = await fetch('/api/broadcasts/' + id, { method: 'DELETE' });
      if (res.ok) {
        fetchBroadcasts();
      }
    } catch (error) {
      console.error('Failed to delete broadcast:', error);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch('/api/broadcasts/' + id + '/duplicate', {
        method: 'POST',
      });
      if (res.ok) {
        fetchBroadcasts();
      }
    } catch (error) {
      console.error('Failed to duplicate broadcast:', error);
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Broadcasts</h1>
          <p className="text-gray-500">Send one-time emails to your audience</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Broadcast
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search broadcasts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchBroadcasts()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="SENDING">Sending</option>
            <option value="SENT">Sent</option>
            <option value="CANCELED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Broadcasts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Broadcast
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Recipients
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Performance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : broadcasts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No broadcasts found. Create your first broadcast!
                </td>
              </tr>
            ) : (
              broadcasts.map((broadcast) => (
                <tr key={broadcast.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link href={'/broadcasts/' + broadcast.id} className="block">
                      <div className="text-sm font-medium text-gray-900">
                        {broadcast.name}
                      </div>
                      <div className="text-sm text-gray-500">{broadcast.subject}</div>
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className={'px-2 py-1 text-xs font-medium rounded-full ' + getStatusBadgeClass(broadcast.status)}>
                      {broadcast.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {broadcast.totalSent > 0 ? broadcast.totalSent.toLocaleString() : '-'}
                  </td>
                  <td className="px-6 py-4">
                    {broadcast.status === 'SENT' ? (
                      <div className="text-sm">
                        <div className="text-gray-900">
                          {broadcast.openRate}% opens
                        </div>
                        <div className="text-gray-500">
                          {broadcast.clickRate}% clicks
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {broadcast.sentAt
                      ? new Date(broadcast.sentAt).toLocaleDateString()
                      : broadcast.scheduledAt
                      ? 'Scheduled: ' + new Date(broadcast.scheduledAt).toLocaleDateString()
                      : new Date(broadcast.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={'/broadcasts/' + broadcast.id}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {broadcast.status === 'SENT' ? 'Analytics' : 'Edit'}
                      </Link>
                      <button
                        onClick={() => handleDuplicate(broadcast.id)}
                        className="text-gray-600 hover:text-gray-800 text-sm"
                      >
                        Duplicate
                      </button>
                      {['DRAFT', 'CANCELED'].includes(broadcast.status) && (
                        <button
                          onClick={() => handleDelete(broadcast.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} broadcasts
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Broadcast Modal */}
      {showCreateModal && (
        <CreateBroadcastModal
          workspaceId={workspaceId}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            fetchBroadcasts();
          }}
        />
      )}
    </div>
  );
}

function CreateBroadcastModal({
  workspaceId,
  onClose,
  onCreated,
}: {
  workspaceId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/broadcasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          name,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create broadcast');
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
          <h2 className="text-lg font-semibold">Create New Broadcast</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Broadcast Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., June Newsletter"
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
              {loading ? 'Creating...' : 'Create Broadcast'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
