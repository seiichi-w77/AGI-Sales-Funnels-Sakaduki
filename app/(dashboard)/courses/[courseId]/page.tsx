'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Lesson {
  id: string;
  name: string;
  description: string | null;
  type: string;
  videoUrl: string | null;
  duration: number | null;
  sortOrder: number;
  isPreview: boolean;
}

interface Module {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
  lessons: Lesson[];
}

interface Enrollment {
  id: string;
  status: string;
  progress: number;
  startedAt: string;
  completedAt: string | null;
  contact: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

interface Course {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  status: string;
  publishedAt: string | null;
  modules: Module[];
  enrollments: Enrollment[];
  stats: {
    totalModules: number;
    totalLessons: number;
    totalEnrollments: number;
    completedEnrollments: number;
    averageProgress: number;
  };
}

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content');
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');

  // Modals
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/courses/' + courseId);
      const data = await res.json();

      if (res.ok) {
        setCourse(data.course);
        setName(data.course.name);
        setDescription(data.course.description || '');
        setStatus(data.course.status);
      }
    } catch (error) {
      console.error('Failed to fetch course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/courses/' + courseId, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: description || null,
          status,
        }),
      });

      if (res.ok) {
        fetchCourse();
      }
    } catch (error) {
      console.error('Failed to save course:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Delete this module and all its lessons?')) return;

    try {
      const res = await fetch(
        '/api/courses/' + courseId + '/modules/' + moduleId,
        { method: 'DELETE' }
      );

      if (res.ok) {
        fetchCourse();
      }
    } catch (error) {
      console.error('Failed to delete module:', error);
    }
  };

  const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
    if (!confirm('Delete this lesson?')) return;

    try {
      const res = await fetch(
        '/api/courses/' + courseId + '/modules/' + moduleId + '/lessons/' + lessonId,
        { method: 'DELETE' }
      );

      if (res.ok) {
        fetchCourse();
      }
    } catch (error) {
      console.error('Failed to delete lesson:', error);
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

  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return '🎥';
      case 'TEXT':
        return '📝';
      case 'QUIZ':
        return '❓';
      case 'DOWNLOAD':
        return '📥';
      case 'ASSIGNMENT':
        return '📋';
      default:
        return '📄';
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading...</div>;
  }

  if (!course) {
    return <div className="p-6 text-center text-gray-500">Course not found</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/courses" className="text-gray-500 hover:text-gray-700">
          &larr; Back
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{course.name}</h1>
            <span
              className={
                'px-2 py-0.5 text-xs font-medium rounded ' +
                getStatusBadgeClass(course.status)
              }
            >
              {course.status}
            </span>
          </div>
          <p className="text-gray-500">{course.slug}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-gray-900">{course.stats.totalModules}</div>
          <div className="text-sm text-gray-500">Modules</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-gray-900">{course.stats.totalLessons}</div>
          <div className="text-sm text-gray-500">Lessons</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-gray-900">{course.stats.totalEnrollments}</div>
          <div className="text-sm text-gray-500">Students</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-gray-900">{course.stats.completedEnrollments}</div>
          <div className="text-sm text-gray-500">Completed</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-gray-900">{course.stats.averageProgress}%</div>
          <div className="text-sm text-gray-500">Avg Progress</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {['content', 'students', 'settings'].map((tab) => (
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

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Course Content</h2>
            <button
              onClick={() => {
                setEditingModule(null);
                setShowModuleModal(true);
              }}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Module
            </button>
          </div>

          {course.modules.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No modules yet. Add your first module!
            </div>
          ) : (
            <div className="space-y-4">
              {course.modules.map((module) => (
                <div key={module.id} className="bg-white rounded-lg shadow">
                  <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">☰</span>
                      <div>
                        <div className="font-medium text-gray-900">{module.name}</div>
                        {module.description && (
                          <div className="text-sm text-gray-500">{module.description}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{module.lessons.length} lessons</span>
                      <button
                        onClick={() => {
                          setSelectedModuleId(module.id);
                          setEditingLesson(null);
                          setShowLessonModal(true);
                        }}
                        className="px-2 py-1 text-xs text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                      >
                        Add Lesson
                      </button>
                      <button
                        onClick={() => {
                          setEditingModule(module);
                          setShowModuleModal(true);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteModule(module.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  {module.lessons.length > 0 && (
                    <div className="divide-y divide-gray-100">
                      {module.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{getLessonTypeIcon(lesson.type)}</span>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {lesson.name}
                                {lesson.isPreview && (
                                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                                    Preview
                                  </span>
                                )}
                              </div>
                              {lesson.duration && (
                                <div className="text-xs text-gray-500">
                                  {Math.floor(lesson.duration / 60)}m {lesson.duration % 60}s
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedModuleId(module.id);
                                setEditingLesson(lesson);
                                setShowLessonModal(true);
                              }}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteLesson(module.id, lesson.id)}
                              className="text-gray-400 hover:text-red-600"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Enrolled Students</h2>
          </div>
          {course.enrollments.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No students enrolled yet
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {course.enrollments.map((enrollment) => (
                <div key={enrollment.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-500">
                        {(enrollment.contact.firstName || enrollment.contact.email).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {enrollment.contact.firstName} {enrollment.contact.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{enrollment.contact.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{enrollment.progress}%</div>
                      <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: enrollment.progress + '%' }}
                        ></div>
                      </div>
                    </div>
                    <span
                      className={
                        'px-2 py-0.5 text-xs font-medium rounded ' +
                        (enrollment.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : enrollment.status === 'ACTIVE'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800')
                      }
                    >
                      {enrollment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Course Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Name *
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
            <div className="pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Module Modal */}
      {showModuleModal && (
        <ModuleModal
          courseId={courseId}
          module={editingModule}
          onClose={() => setShowModuleModal(false)}
          onSaved={() => {
            setShowModuleModal(false);
            fetchCourse();
          }}
        />
      )}

      {/* Lesson Modal */}
      {showLessonModal && selectedModuleId && (
        <LessonModal
          courseId={courseId}
          moduleId={selectedModuleId}
          lesson={editingLesson}
          onClose={() => setShowLessonModal(false)}
          onSaved={() => {
            setShowLessonModal(false);
            fetchCourse();
          }}
        />
      )}
    </div>
  );
}

function ModuleModal({
  courseId,
  module,
  onClose,
  onSaved,
}: {
  courseId: string;
  module: Module | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(module?.name || '');
  const [description, setDescription] = useState(module?.description || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = module
        ? '/api/courses/' + courseId + '/modules/' + module.id
        : '/api/courses/' + courseId + '/modules';

      const res = await fetch(url, {
        method: module ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: description || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to save module');
        return;
      }

      onSaved();
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
          <h2 className="text-lg font-semibold">{module ? 'Edit Module' : 'Add Module'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Module Name *
            </label>
            <input
              type="text"
              required
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
              rows={3}
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
              {loading ? 'Saving...' : module ? 'Save' : 'Add Module'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LessonModal({
  courseId,
  moduleId,
  lesson,
  onClose,
  onSaved,
}: {
  courseId: string;
  moduleId: string;
  lesson: Lesson | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(lesson?.name || '');
  const [description, setDescription] = useState(lesson?.description || '');
  const [type, setType] = useState(lesson?.type || 'VIDEO');
  const [videoUrl, setVideoUrl] = useState(lesson?.videoUrl || '');
  const [duration, setDuration] = useState(lesson?.duration?.toString() || '');
  const [isPreview, setIsPreview] = useState(lesson?.isPreview || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = lesson
        ? '/api/courses/' + courseId + '/modules/' + moduleId + '/lessons/' + lesson.id
        : '/api/courses/' + courseId + '/modules/' + moduleId + '/lessons';

      const res = await fetch(url, {
        method: lesson ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: description || null,
          type,
          videoUrl: videoUrl || null,
          duration: duration ? parseInt(duration) : null,
          isPreview,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to save lesson');
        return;
      }

      onSaved();
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">{lesson ? 'Edit Lesson' : 'Add Lesson'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lesson Name *
            </label>
            <input
              type="text"
              required
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
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="VIDEO">Video</option>
              <option value="TEXT">Text</option>
              <option value="QUIZ">Quiz</option>
              <option value="DOWNLOAD">Download</option>
              <option value="ASSIGNMENT">Assignment</option>
            </select>
          </div>
          {type === 'VIDEO' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video URL
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (seconds)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g., 300"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPreview"
              checked={isPreview}
              onChange={(e) => setIsPreview(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="isPreview" className="text-sm text-gray-700">
              Allow free preview
            </label>
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
              {loading ? 'Saving...' : lesson ? 'Save' : 'Add Lesson'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
