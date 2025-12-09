'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Mail,
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Copy,
  Trash2,
  Send,
  Clock,
  BarChart3,
  Users,
  MousePointer,
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
const mockCampaigns = [
  {
    id: '1',
    name: 'Welcome Series - Day 1',
    subject: 'Welcome to Our Community!',
    type: 'AUTOMATION',
    status: 'SENT',
    totalSent: 1250,
    totalOpened: 625,
    totalClicked: 187,
    sentAt: '2024-12-08T10:00:00',
    updatedAt: '2024-12-08',
  },
  {
    id: '2',
    name: 'Weekly Newsletter',
    subject: 'This Week in Marketing',
    type: 'BROADCAST',
    status: 'SENT',
    totalSent: 3420,
    totalOpened: 1368,
    totalClicked: 342,
    sentAt: '2024-12-07T14:00:00',
    updatedAt: '2024-12-07',
  },
  {
    id: '3',
    name: 'Black Friday Promo',
    subject: '🔥 50% OFF Everything!',
    type: 'BROADCAST',
    status: 'SCHEDULED',
    totalSent: 0,
    totalOpened: 0,
    totalClicked: 0,
    scheduledAt: '2024-12-15T09:00:00',
    updatedAt: '2024-12-05',
  },
  {
    id: '4',
    name: 'Product Launch Announcement',
    subject: 'Introducing Our New Feature',
    type: 'BROADCAST',
    status: 'DRAFT',
    totalSent: 0,
    totalOpened: 0,
    totalClicked: 0,
    updatedAt: '2024-12-04',
  },
]

const statusColors: Record<string, string> = {
  DRAFT: 'bg-slate-500/10 text-slate-400',
  SCHEDULED: 'bg-blue-500/10 text-blue-400',
  SENDING: 'bg-yellow-500/10 text-yellow-400',
  SENT: 'bg-green-500/10 text-green-400',
  CANCELED: 'bg-red-500/10 text-red-400',
}

const typeLabels: Record<string, string> = {
  BROADCAST: 'Broadcast',
  AUTOMATION: 'Automation',
  TRANSACTIONAL: 'Transactional',
}

export default function EmailPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  const filteredCampaigns = mockCampaigns.filter((campaign) => {
    const matchesSearch =
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.subject.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'sent' && campaign.status === 'SENT') ||
      (activeTab === 'scheduled' && campaign.status === 'SCHEDULED') ||
      (activeTab === 'draft' && campaign.status === 'DRAFT')
    return matchesSearch && matchesTab
  })

  const totalSent = mockCampaigns.reduce((acc, c) => acc + c.totalSent, 0)
  const totalOpened = mockCampaigns.reduce((acc, c) => acc + c.totalOpened, 0)
  const totalClicked = mockCampaigns.reduce((acc, c) => acc + c.totalClicked, 0)
  const avgOpenRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : 0
  const avgClickRate = totalOpened > 0 ? ((totalClicked / totalOpened) * 100).toFixed(1) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Email Marketing</h1>
          <p className="text-slate-400">Create and send email campaigns</p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link href="/dashboard/email/new">
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Emails Sent</CardTitle>
            <Send className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalSent.toLocaleString()}</div>
            <p className="text-xs text-slate-400">Last 30 days</p>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Open Rate</CardTitle>
            <Mail className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{avgOpenRate}%</div>
            <p className="text-xs text-green-500">+2.1% from last month</p>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Click Rate</CardTitle>
            <MousePointer className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{avgClickRate}%</div>
            <p className="text-xs text-green-500">+0.8% from last month</p>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Subscribers</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">4,892</div>
            <p className="text-xs text-green-500">+156 this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search campaigns..."
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
            <TabsTrigger value="sent" className="data-[state=active]:bg-slate-700">
              Sent
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="data-[state=active]:bg-slate-700">
              Scheduled
            </TabsTrigger>
            <TabsTrigger value="draft" className="data-[state=active]:bg-slate-700">
              Drafts
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {filteredCampaigns.map((campaign) => (
          <Card key={campaign.id} className="border-slate-800 bg-slate-900">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-blue-500/10 p-3">
                    <Mail className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-white">{campaign.name}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[campaign.status]}`}>
                        {campaign.status}
                      </span>
                      <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs font-medium text-slate-300">
                        {typeLabels[campaign.type]}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">{campaign.subject}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {campaign.status === 'SENT' && (
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="text-white font-medium">{campaign.totalSent.toLocaleString()}</p>
                        <p className="text-xs text-slate-400">Sent</p>
                      </div>
                      <div className="text-center">
                        <p className="text-white font-medium">
                          {((campaign.totalOpened / campaign.totalSent) * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-slate-400">Opened</p>
                      </div>
                      <div className="text-center">
                        <p className="text-white font-medium">
                          {campaign.totalOpened > 0
                            ? ((campaign.totalClicked / campaign.totalOpened) * 100).toFixed(1)
                            : 0}%
                        </p>
                        <p className="text-xs text-slate-400">Clicked</p>
                      </div>
                    </div>
                  )}

                  {campaign.status === 'SCHEDULED' && campaign.scheduledAt && (
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Clock className="h-4 w-4" />
                      <span>
                        Scheduled for {new Date(campaign.scheduledAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                      {campaign.status === 'SENT' && (
                        <DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-700">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          View Analytics
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-700">
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </DropdownMenuItem>
                      {campaign.status === 'DRAFT' && (
                        <DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-700">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      )}
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
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty State */}
        {filteredCampaigns.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Mail className="h-12 w-12 text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No campaigns found</h3>
            <p className="text-slate-400 mb-4">
              {searchQuery
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first email campaign'}
            </p>
            {!searchQuery && (
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/dashboard/email/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Campaign
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
