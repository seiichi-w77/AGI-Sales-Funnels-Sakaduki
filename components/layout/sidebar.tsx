'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Layers,
  Users,
  Mail,
  GraduationCap,
  Settings,
  ChevronLeft,
  ShoppingBag,
  ShoppingCart,
  MessageCircle,
  BarChart3,
  Workflow,
  CreditCard,
  Menu,
} from 'lucide-react';

const navigation = [
  { name: 'dashboard.title', href: '/dashboard', icon: LayoutDashboard },
  { name: 'funnels.title', href: '/funnels', icon: Layers },
  { name: 'contacts.title', href: '/contacts', icon: Users },
  { name: 'email.title', href: '/email', icon: Mail },
  { name: 'courses.title', href: '/courses', icon: GraduationCap },
  { name: 'products.title', href: '/products', icon: ShoppingBag },
  { name: 'orders.title', href: '/orders', icon: ShoppingCart },
  { name: 'workflows.title', href: '/workflows', icon: Workflow },
  { name: 'line.title', href: '/line', icon: MessageCircle },
  { name: 'analytics.title', href: '/analytics', icon: BarChart3 },
  { name: 'billing.title', href: '/billing', icon: CreditCard },
  { name: 'settings.title', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-background border-r transition-all duration-200',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className="flex items-center justify-between h-14 px-4 border-b">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">A</span>
            </div>
            <span className="font-semibold text-sm">AGI Sales Funnels</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'size-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors',
            collapsed && 'mx-auto'
          )}
        >
          {collapsed ? (
            <Menu className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname.includes(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 h-9 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
                collapsed && 'justify-center px-0'
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {!collapsed && (
                <span className="truncate">
                  {item.name.includes('.') ? t(item.name) : item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
