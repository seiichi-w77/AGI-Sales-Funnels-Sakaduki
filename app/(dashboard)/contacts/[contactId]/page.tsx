'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Contact {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  company: string | null;
  jobTitle: string | null;
  status: string;
  tags: string[];
  score: number;
  source: string | null;
  timezone: string | null;
  language: string | null;
  address: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  } | null;
  customFields: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string | null;
  subscribedAt: string | null;
  unsubscribedAt: string | null;
  stats: {
    orders: number;
    activities: number;
    emailEvents: number;
    courseEnrollments: number;
  };
  owner: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
  orders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    createdAt: string;
  }>;
  courseEnrollments: Array<{
    id: string;
    progress: number;
    status: string;
    course: {
      id: string;
      name: string;
      thumbnail: string | null;
    };
  }>;
}

interface Activity {
  id: string;
  type: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export default function ContactDetailPage({ params }: { params: Promise<{ contactId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [contact, setContact] = useState<Contact | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<Contact>>({});

  useEffect(() => {
    fetchContact();
    fetchActivities();
  }, [resolvedParams.contactId]);

  const fetchContact = async () => {
    try {
      const res = await fetch('/api/contacts/' + resolvedParams.contactId);
      const data = await res.json();
      if (res.ok) {
        setContact(data.contact);
        setEditData(data.contact);
      }
    } catch (error) {
      console.error('Failed to fetch contact:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await fetch('/api/contacts/' + resolvedParams.contactId + '/activities');
      const data = await res.json();
      if (res.ok) {
        setActivities(data.activities);
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/contacts/' + resolvedParams.contactId, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      if (res.ok) {
        const data = await res.json();
        setContact(data.contact);
        setEditMode(false);
      }
    } catch (error) {
      console.error('Failed to update contact:', error);
    }
  };

  const handleAddTag = async (tag: string) => {
    try {
      const res = await fetch('/api/contacts/' + resolvedParams.contactId + '/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: [tag] }),
      });

      if (res.ok) {
        fetchContact();
      }
    } catch (error) {
      console.error('Failed to add tag:', error);
    }
  };

  const handleRemoveTag = async (tag: string) => {
    try {
      const res = await fetch('/api/contacts/' + resolvedParams.contactId + '/tags', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: [tag] }),
      });

      if (res.ok) {
        fetchContact();
      }
    } catch (error) {
      console.error('Failed to remove tag:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to archive this contact?')) return;

    try {
      const res = await fetch('/api/contacts/' + resolvedParams.contactId, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/contacts');
      }
    } catch (error) {
      console.error('Failed to delete contact:', error);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'UNSUBSCRIBED':
        return 'bg-yellow-100 text-yellow-800';
      case 'BOUNCED':
        return 'bg-red-100 text-red-800';
      case 'COMPLAINED':
        return 'bg-orange-100 text-orange-800';
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'contact_created':
        return '🆕';
      case 'contact_updated':
        return '✏️';
      case 'tag_added':
        return '🏷️';
      case 'tag_removed':
        return '🗑️';
      case 'email_sent':
        return '📧';
      case 'email_opened':
        return '👁️';
      case 'email_clicked':
        return '🖱️';
      case 'workflow_started':
        return '⚙️';
      case 'order_placed':
        return '🛒';
      default:
        return '📝';
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          Contact not found
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/contacts"
            className="text-gray-500 hover:text-gray-700"
          >
            ← Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {contact.firstName || contact.lastName
                ? (contact.firstName || '') + ' ' + (contact.lastName || '')
                : contact.email}
            </h1>
            <p className="text-gray-500">{contact.email}</p>
          </div>
          <span className={'px-2 py-1 text-xs font-medium rounded-full ' + getStatusBadgeClass(contact.status)}>
            {contact.status}
          </span>
        </div>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <button
                onClick={() => setEditMode(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
              >
                Archive
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          {['overview', 'activity', 'orders', 'courses'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
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
      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Contact Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">First Name</label>
                    {editMode ? (
                      <input
                        type="text"
                        value={editData.firstName || ''}
                        onChange={(e) =>
                          setEditData({ ...editData, firstName: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    ) : (
                      <p className="text-gray-900">{contact.firstName || '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Last Name</label>
                    {editMode ? (
                      <input
                        type="text"
                        value={editData.lastName || ''}
                        onChange={(e) =>
                          setEditData({ ...editData, lastName: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    ) : (
                      <p className="text-gray-900">{contact.lastName || '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Phone</label>
                    {editMode ? (
                      <input
                        type="text"
                        value={editData.phone || ''}
                        onChange={(e) =>
                          setEditData({ ...editData, phone: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    ) : (
                      <p className="text-gray-900">{contact.phone || '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Company</label>
                    {editMode ? (
                      <input
                        type="text"
                        value={editData.company || ''}
                        onChange={(e) =>
                          setEditData({ ...editData, company: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    ) : (
                      <p className="text-gray-900">{contact.company || '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Job Title</label>
                    {editMode ? (
                      <input
                        type="text"
                        value={editData.jobTitle || ''}
                        onChange={(e) =>
                          setEditData({ ...editData, jobTitle: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    ) : (
                      <p className="text-gray-900">{contact.jobTitle || '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Source</label>
                    <p className="text-gray-900">{contact.source || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {contact.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full flex items-center gap-2"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <AddTagInput onAdd={handleAddTag} />
                </div>
              </div>
            </>
          )}

          {activeTab === 'activity' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Activity Timeline</h2>
              <div className="space-y-4">
                {activities.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No activities yet</p>
                ) : (
                  activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex gap-4 p-4 border border-gray-100 rounded-lg"
                    >
                      <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {activity.type.replace(/_/g, ' ')}
                        </p>
                        {activity.description && (
                          <p className="text-sm text-gray-500">{activity.description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(activity.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Orders</h2>
              {contact.orders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No orders yet</p>
              ) : (
                <div className="space-y-3">
                  {contact.orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border border-gray-100 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${(order.total / 100).toFixed(2)}</p>
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Course Enrollments</h2>
              {contact.courseEnrollments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No enrollments yet</p>
              ) : (
                <div className="space-y-3">
                  {contact.courseEnrollments.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg"
                    >
                      <div className="w-16 h-12 bg-gray-200 rounded" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {enrollment.course.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-2 bg-blue-600 rounded-full"
                              style={{ width: enrollment.progress + '%' }}
                            />
                          </div>
                          <span className="text-sm text-gray-500">
                            {enrollment.progress}%
                          </span>
                        </div>
                      </div>
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                        {enrollment.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Score</span>
                <span className="font-semibold">{contact.score}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Orders</span>
                <span className="font-semibold">{contact.stats.orders}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Courses</span>
                <span className="font-semibold">{contact.stats.courseEnrollments}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Activities</span>
                <span className="font-semibold">{contact.stats.activities}</span>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Key Dates</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Created</span>
                <span>{new Date(contact.createdAt).toLocaleDateString()}</span>
              </div>
              {contact.subscribedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Subscribed</span>
                  <span>{new Date(contact.subscribedAt).toLocaleDateString()}</span>
                </div>
              )}
              {contact.lastActivityAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Activity</span>
                  <span>{new Date(contact.lastActivityAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Owner */}
          {contact.owner && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Owner</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  {(contact.owner.firstName?.[0] || contact.owner.email[0]).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">
                    {contact.owner.firstName || ''} {contact.owner.lastName || ''}
                  </p>
                  <p className="text-sm text-gray-500">{contact.owner.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AddTagInput({ onAdd }: { onAdd: (tag: string) => void }) {
  const [isAdding, setIsAdding] = useState(false);
  const [tag, setTag] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tag.trim()) {
      onAdd(tag.trim());
      setTag('');
      setIsAdding(false);
    }
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="px-3 py-1 border border-dashed border-gray-300 text-gray-500 rounded-full hover:border-gray-400"
      >
        + Add Tag
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        placeholder="Enter tag"
        className="px-3 py-1 border border-gray-300 rounded-full text-sm"
        autoFocus
      />
      <button type="submit" className="text-blue-600 hover:text-blue-800">
        Add
      </button>
      <button
        type="button"
        onClick={() => {
          setIsAdding(false);
          setTag('');
        }}
        className="text-gray-400 hover:text-gray-600"
      >
        ×
      </button>
    </form>
  );
}
