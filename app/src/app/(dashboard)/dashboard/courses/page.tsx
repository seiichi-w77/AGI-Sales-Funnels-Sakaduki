'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  GraduationCap,
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Copy,
  Trash2,
  Users,
  BookOpen,
  Video,
  BarChart3,
} from 'lucide-react'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Mock data
const mockCourses = [
  {
    id: '1',
    name: 'Complete Marketing Masterclass',
    slug: 'marketing-masterclass',
    description: 'Learn everything about digital marketing',
    thumbnail: null,
    status: 'PUBLISHED',
    modules: 8,
    lessons: 42,
    enrollments: 1250,
    completionRate: 68,
    updatedAt: '2024-12-08',
  },
  {
    id: '2',
    name: 'Sales Funnel Secrets',
    slug: 'funnel-secrets',
    description: 'Master the art of sales funnels',
    thumbnail: null,
    status: 'PUBLISHED',
    modules: 6,
    lessons: 28,
    enrollments: 890,
    completionRate: 72,
    updatedAt: '2024-12-07',
  },
  {
    id: '3',
    name: 'Email Marketing Pro',
    slug: 'email-pro',
    description: 'Grow your business with email',
    thumbnail: null,
    status: 'DRAFT',
    modules: 4,
    lessons: 18,
    enrollments: 0,
    completionRate: 0,
    updatedAt: '2024-12-05',
  },
  {
    id: '4',
    name: 'Social Media Mastery',
    slug: 'social-media',
    description: 'Dominate every social platform',
    thumbnail: null,
    status: 'PUBLISHED',
    modules: 10,
    lessons: 55,
    enrollments: 2340,
    completionRate: 54,
    updatedAt: '2024-12-04',
  },
]

const statusColors: Record<string, string> = {
  DRAFT: 'bg-slate-500/10 text-slate-400',
  PUBLISHED: 'bg-green-500/10 text-green-400',
  ARCHIVED: 'bg-red-500/10 text-red-400',
}

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  const filteredCourses = mockCourses.filter((course) => {
    const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'published' && course.status === 'PUBLISHED') ||
      (activeTab === 'draft' && course.status === 'DRAFT')
    return matchesSearch && matchesTab
  })

  const totalEnrollments = mockCourses.reduce((acc, c) => acc + c.enrollments, 0)
  const totalLessons = mockCourses.reduce((acc, c) => acc + c.lessons, 0)
  const avgCompletionRate =
    mockCourses.filter((c) => c.status === 'PUBLISHED').length > 0
      ? (
          mockCourses
            .filter((c) => c.status === 'PUBLISHED')
            .reduce((acc, c) => acc + c.completionRate, 0) /
          mockCourses.filter((c) => c.status === 'PUBLISHED').length
        ).toFixed(0)
      : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Courses</h1>
          <p className="text-slate-400">Create and manage your online courses</p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link href="/dashboard/courses/new">
            <Plus className="mr-2 h-4 w-4" />
            New Course
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Courses</CardTitle>
            <GraduationCap className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{mockCourses.length}</div>
            <p className="text-xs text-slate-400">
              {mockCourses.filter((c) => c.status === 'PUBLISHED').length} published
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Enrollments</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalEnrollments.toLocaleString()}</div>
            <p className="text-xs text-green-500">+234 this week</p>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Lessons</CardTitle>
            <Video className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalLessons}</div>
            <p className="text-xs text-slate-400">Across all courses</p>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Avg Completion</CardTitle>
            <BarChart3 className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{avgCompletionRate}%</div>
            <p className="text-xs text-green-500">+5% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-900 border-slate-700 text-white placeholder:text-slate-400"
          />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800">
            <TabsTrigger value="all" className="data-[state=active]:bg-slate-700">
              All
            </TabsTrigger>
            <TabsTrigger value="published" className="data-[state=active]:bg-slate-700">
              Published
            </TabsTrigger>
            <TabsTrigger value="draft" className="data-[state=active]:bg-slate-700">
              Drafts
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Courses Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => (
          <Card
            key={course.id}
            className="border-slate-800 bg-slate-900 hover:border-slate-700 transition-colors"
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-white">{course.name}</CardTitle>
                  <CardDescription className="text-slate-400">
                    {course.description}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-white"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                    <DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-700">
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-700">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-700">
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-700" />
                    <DropdownMenuItem className="text-red-400 hover:text-red-300 hover:bg-slate-700">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusColors[course.status]}`}
                >
                  {course.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-semibold text-white">{course.modules}</p>
                  <p className="text-xs text-slate-400">Modules</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">{course.lessons}</p>
                  <p className="text-xs text-slate-400">Lessons</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">
                    {course.enrollments > 0 ? course.enrollments.toLocaleString() : '-'}
                  </p>
                  <p className="text-xs text-slate-400">Students</p>
                </div>
              </div>

              {course.status === 'PUBLISHED' && course.enrollments > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Completion Rate</span>
                    <span className="text-white">{course.completionRate}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${course.completionRate}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Updated {course.updatedAt}</span>
              </div>

              <Button
                asChild
                variant="outline"
                className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <Link href={`/dashboard/courses/${course.id}`}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Manage Course
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <GraduationCap className="h-12 w-12 text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No courses found</h3>
            <p className="text-slate-400 mb-4">
              {searchQuery
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first course'}
            </p>
            {!searchQuery && (
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/dashboard/courses/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Course
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
