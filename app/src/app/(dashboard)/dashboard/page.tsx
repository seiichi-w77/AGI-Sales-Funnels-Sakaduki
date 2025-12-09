import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Funnel,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  Plus,
} from 'lucide-react'
import Link from 'next/link'

const stats = [
  {
    name: 'Total Revenue',
    value: '$45,231.89',
    change: '+20.1%',
    changeType: 'positive',
    icon: DollarSign,
  },
  {
    name: 'Active Funnels',
    value: '12',
    change: '+3',
    changeType: 'positive',
    icon: Funnel,
  },
  {
    name: 'Total Contacts',
    value: '2,350',
    change: '+180',
    changeType: 'positive',
    icon: Users,
  },
  {
    name: 'Products Sold',
    value: '573',
    change: '+42',
    changeType: 'positive',
    icon: Package,
  },
]

const recentActivity = [
  { type: 'sale', message: 'New order for "Ultimate Course Bundle"', time: '2 minutes ago', amount: '$297' },
  { type: 'contact', message: 'New lead captured from "Free Ebook" funnel', time: '15 minutes ago' },
  { type: 'sale', message: 'New subscription to Pro Plan', time: '1 hour ago', amount: '$97/mo' },
  { type: 'contact', message: '12 new contacts imported', time: '2 hours ago' },
  { type: 'funnel', message: '"Black Friday Sale" funnel published', time: '3 hours ago' },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400">Welcome back! Here&apos;s what&apos;s happening.</p>
        </div>
        <div className="flex space-x-3">
          <Button asChild variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
            <Link href="/dashboard/funnels/new">
              <Plus className="mr-2 h-4 w-4" />
              New Funnel
            </Link>
          </Button>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/dashboard/products/new">
              <Plus className="mr-2 h-4 w-4" />
              New Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="border-slate-800 bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                {stat.name}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="flex items-center text-xs">
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                <span className="text-green-500">{stat.change}</span>
                <span className="ml-1 text-slate-400">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
            <CardDescription className="text-slate-400">
              Your latest sales and leads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        activity.type === 'sale'
                          ? 'bg-green-500'
                          : activity.type === 'contact'
                          ? 'bg-blue-500'
                          : 'bg-purple-500'
                      }`}
                    />
                    <div>
                      <p className="text-sm text-white">{activity.message}</p>
                      <p className="text-xs text-slate-400">{activity.time}</p>
                    </div>
                  </div>
                  {activity.amount && (
                    <span className="text-sm font-medium text-green-500">
                      {activity.amount}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
            <CardDescription className="text-slate-400">
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Link
                href="/dashboard/funnels/new"
                className="flex items-center justify-between rounded-lg border border-slate-800 p-4 hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-blue-500/10 p-2">
                    <Funnel className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Create New Funnel</p>
                    <p className="text-sm text-slate-400">Build a sales funnel</p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </Link>

              <Link
                href="/dashboard/products/new"
                className="flex items-center justify-between rounded-lg border border-slate-800 p-4 hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-green-500/10 p-2">
                    <Package className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Add New Product</p>
                    <p className="text-sm text-slate-400">Create a digital product</p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </Link>

              <Link
                href="/dashboard/contacts/import"
                className="flex items-center justify-between rounded-lg border border-slate-800 p-4 hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-purple-500/10 p-2">
                    <Users className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Import Contacts</p>
                    <p className="text-sm text-slate-400">Upload CSV or connect CRM</p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
