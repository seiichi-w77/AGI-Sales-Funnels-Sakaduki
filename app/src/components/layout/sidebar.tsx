'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Funnel,
  Package,
  Users,
  Mail,
  BarChart3,
  Settings,
  GraduationCap,
  Workflow,
  MessageSquare,
  Users2,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Funnels', href: '/dashboard/funnels', icon: Funnel },
  { name: 'Products', href: '/dashboard/products', icon: Package },
  { name: 'Contacts', href: '/dashboard/contacts', icon: Users },
  { name: 'Email', href: '/dashboard/email', icon: Mail },
  { name: 'Workflows', href: '/dashboard/workflows', icon: Workflow },
  { name: 'Courses', href: '/dashboard/courses', icon: GraduationCap },
  { name: 'LINE', href: '/dashboard/line', icon: MessageSquare },
  { name: 'Affiliates', href: '/dashboard/affiliates', icon: Users2 },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 border-r border-slate-800">
      <div className="flex h-16 items-center px-6 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600" />
          <span className="text-xl font-bold text-white">Sakaduki</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <div className="rounded-lg bg-slate-800/50 p-4">
          <p className="text-xs text-slate-400">Current Plan</p>
          <p className="text-sm font-medium text-white">Pro Plan</p>
          <Link
            href="/dashboard/settings/billing"
            className="mt-2 block text-xs text-blue-400 hover:text-blue-300"
          >
            Upgrade Plan
          </Link>
        </div>
      </div>
    </div>
  )
}
