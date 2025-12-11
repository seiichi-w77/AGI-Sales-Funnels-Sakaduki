import { auth } from '@/lib/auth/auth';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, Layers, Mail, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default async function DashboardPage() {
  const session = await auth();
  const t = await getTranslations('dashboard');

  const stats = [
    {
      title: t('revenue'),
      value: '¥1,234,567',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
    },
    {
      title: t('visitors'),
      value: '12,345',
      change: '+8.2%',
      trend: 'up',
      icon: TrendingUp,
    },
    {
      title: t('conversions'),
      value: '234',
      change: '-2.4%',
      trend: 'down',
      icon: Layers,
    },
    {
      title: t('contacts'),
      value: '5,678',
      change: '+15.3%',
      trend: 'up',
      icon: Users,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold">
          {t('welcome', { name: session?.user?.name || 'User' })}
        </h1>
        <p className="text-muted-foreground mt-1">{t('overview')}</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs mt-1">
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                  {stat.change}
                </span>
                <span className="text-muted-foreground ml-1">vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('quickActions')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <QuickActionButton icon={Layers} label="Create Funnel" href="/funnels/new" />
            <QuickActionButton icon={Mail} label="Send Broadcast" href="/email/new" />
            <QuickActionButton icon={Users} label="Add Contact" href="/contacts/new" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('recentActivity')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ActivityItem
                title="New order received"
                description="Order #1234 - ¥9,800"
                time="5 minutes ago"
              />
              <ActivityItem
                title="Contact subscribed"
                description="john@example.com joined your list"
                time="15 minutes ago"
              />
              <ActivityItem
                title="Funnel published"
                description="Lead Magnet Funnel is now live"
                time="1 hour ago"
              />
              <ActivityItem
                title="Email sent"
                description="Weekly newsletter sent to 1,234 contacts"
                time="2 hours ago"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function QuickActionButton({
  icon: Icon,
  label,
  href,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center p-3 rounded-lg border hover:bg-accent transition-colors"
    >
      <Icon className="h-5 w-5 mr-3 text-primary" />
      <span className="font-medium">{label}</span>
    </a>
  );
}

function ActivityItem({
  title,
  description,
  time,
}: {
  title: string;
  description: string;
  time: string;
}) {
  return (
    <div className="flex items-start space-x-3">
      <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground mt-1">{time}</p>
      </div>
    </div>
  );
}
