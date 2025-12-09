'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Funnel,
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Copy,
  Trash2,
  TrendingUp,
  Users,
  DollarSign,
} from 'lucide-react'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Mock data - will be replaced with real API calls
const mockFunnels = [
  {
    id: '1',
    name: 'Free Ebook Lead Magnet',
    slug: 'free-ebook',
    type: 'LEAD_MAGNET',
    status: 'PUBLISHED',
    steps: 3,
    visitors: 1250,
    conversions: 312,
    revenue: 0,
    updatedAt: '2024-12-08',
  },
  {
    id: '2',
    name: 'Premium Course Launch',
    slug: 'premium-course',
    type: 'VSL',
    status: 'PUBLISHED',
    steps: 5,
    visitors: 3420,
    conversions: 156,
    revenue: 46488,
    updatedAt: '2024-12-07',
  },
  {
    id: '3',
    name: 'Black Friday Sale',
    slug: 'black-friday',
    type: 'CART',
    status: 'DRAFT',
    steps: 4,
    visitors: 0,
    conversions: 0,
    revenue: 0,
    updatedAt: '2024-12-05',
  },
  {
    id: '4',
    name: 'Webinar Registration',
    slug: 'webinar-reg',
    type: 'WEBINAR',
    status: 'PUBLISHED',
    steps: 2,
    visitors: 890,
    conversions: 234,
    revenue: 0,
    updatedAt: '2024-12-04',
  },
]

const funnelTypeLabels: Record<string, string> = {
  LEAD_MAGNET: 'Lead Magnet',
  BOOK: 'Book',
  CART: 'Cart',
  WEBINAR: 'Webinar',
  VSL: 'VSL',
  STOREFRONT: 'Storefront',
  CUSTOM: 'Custom',
}

const funnelTypeColors: Record<string, string> = {
  LEAD_MAGNET: 'bg-blue-500/10 text-blue-500',
  BOOK: 'bg-purple-500/10 text-purple-500',
  CART: 'bg-green-500/10 text-green-500',
  WEBINAR: 'bg-orange-500/10 text-orange-500',
  VSL: 'bg-pink-500/10 text-pink-500',
  STOREFRONT: 'bg-cyan-500/10 text-cyan-500',
  CUSTOM: 'bg-slate-500/10 text-slate-500',
}

export default function FunnelsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  const filteredFunnels = mockFunnels.filter((funnel) => {
    const matchesSearch = funnel.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'published' && funnel.status === 'PUBLISHED') ||
      (activeTab === 'draft' && funnel.status === 'DRAFT')
    return matchesSearch && matchesTab
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Funnels</h1>
          <p className="text-slate-400">Create and manage your sales funnels</p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link href="/dashboard/funnels/new">
            <Plus className="mr-2 h-4 w-4" />
            New Funnel
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Visitors</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">5,560</div>
            <p className="text-xs text-green-500">+12% from last week</p>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">12.6%</div>
            <p className="text-xs text-green-500">+2.3% from last week</p>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">$46,488</div>
            <p className="text-xs text-green-500">+18% from last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search funnels..."
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

      {/* Funnels Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredFunnels.map((funnel) => (
          <Card key={funnel.id} className="border-slate-800 bg-slate-900 hover:border-slate-700 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-white">{funnel.name}</CardTitle>
                  <CardDescription className="text-slate-400">
                    /{funnel.slug}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                    <DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-700">
                      <Eye className="mr-2 h-4 w-4" />
                      View Live
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
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${funnelTypeColors[funnel.type]}`}
                >
                  {funnelTypeLabels[funnel.type]}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    funnel.status === 'PUBLISHED'
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-slate-500/10 text-slate-500'
                  }`}
                >
                  {funnel.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-semibold text-white">{funnel.visitors.toLocaleString()}</p>
                  <p className="text-xs text-slate-400">Visitors</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">{funnel.conversions.toLocaleString()}</p>
                  <p className="text-xs text-slate-400">Conversions</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">
                    {funnel.revenue > 0 ? `$${funnel.revenue.toLocaleString()}` : '-'}
                  </p>
                  <p className="text-xs text-slate-400">Revenue</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{funnel.steps} steps</span>
                <span>Updated {funnel.updatedAt}</span>
              </div>

              <Button asChild variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800">
                <Link href={`/dashboard/funnels/${funnel.id}`}>
                  <Funnel className="mr-2 h-4 w-4" />
                  Open Funnel
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}

        {/* Empty State */}
        {filteredFunnels.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <Funnel className="h-12 w-12 text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No funnels found</h3>
            <p className="text-slate-400 mb-4">
              {searchQuery
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first funnel'}
            </p>
            {!searchQuery && (
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/dashboard/funnels/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Funnel
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
