'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CourseModule {
  id: string;
  name: string;
  lessons: { id: string }[];
}

interface Course {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  modules: CourseModule[];
  _count: {
    enrollments: number;
    modules: number;
    lessons: number;
  };
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const workspaceId = 'demo-workspace';

  useEffect(() => {
    fetchCourses();
  }, [statusFilter]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ workspaceId });
      if (statusFilter) params.set('status', statusFilter);

      const res = await fetch('/api/courses?' + params.toString());
      const data = await res.json();

      if (res.ok) {
        setCourses(data.courses);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const res = await fetch('/api/courses/' + id, { method: 'DELETE' });
      if (res.ok) {
        fetchCourses();
      }
    } catch (error) {
      console.error('Failed to delete course:', error);
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-500">Create and manage your online courses</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Course
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
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            Loading...
          </div>
        ) : courses.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No courses found. Create your first course!
          </div>
        ) : (
          courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-video bg-gradient-to-br from-purple-500 to-blue-600 relative flex items-center justify-center">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-6xl">📚</span>
                )}
                <div className="absolute top-2 left-2 flex gap-1">
                  <span
                    className={
                      'px-2 py-0.5 text-xs font-medium rounded ' +
                      getStatusBadgeClass(course.status)
                    }
                  >
                    {course.status}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <Link href={'/courses/' + course.id}>
                  <h3 className="font-semibold text-gray-900 hover:text-blue-600 truncate">
                    {course.name}
                  </h3>
                </Link>
                {course.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {course.description}
                  </p>
                )}
                <div className="mt-3 flex gap-4 text-sm text-gray-500">
                  <span>{course._count.modules} modules</span>
                  <span>{course._count.lessons} lessons</span>
                  <span>{course._count.enrollments} students</span>
                </div>
                <div className="mt-3 text-xs text-gray-400">
                  Updated {new Date(course.updatedAt).toLocaleDateString()}
                </div>
                <div className="mt-4 flex gap-2">
                  <Link
                    href={'/courses/' + course.id}
                    className="flex-1 px-3 py-1.5 text-sm text-center text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(course.id)}
                    className="px-3 py-1.5 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Course Modal */}
      {showCreateModal && (
        <CreateCourseModal
          workspaceId={workspaceId}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            fetchCourses();
          }}
        />
      )}
    </div>
  );
}

function CreateCourseModal({
  workspaceId,
  onClose,
  onCreated,
}: {
  workspaceId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          name,
          description: description || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create course');
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
          <h2 className="text-lg font-semibold">Create New Course</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Complete Web Development"
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
              {loading ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
