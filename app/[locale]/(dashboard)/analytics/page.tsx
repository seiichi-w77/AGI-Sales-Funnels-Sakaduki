'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  DollarSign,
  Eye,
  MousePointer,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

const funnelStats = [
  {
    name: 'Lead Magnet Funnel',
    visitors: 12456,
    optins: 3456,
    sales: 234,
    revenue: 6947800,
    conversionRate: 27.7,
    change: 12.3,
  },
  {
    name: 'Webinar Funnel',
    visitors: 8234,
    optins: 2345,
    sales: 156,
    revenue: 4603200,
    conversionRate: 28.5,
    change: -5.2,
  },
  {
    name: 'Product Launch',
    visitors: 5678,
    optins: 1234,
    sales: 89,
    revenue: 2634300,
    conversionRate: 21.7,
    change: 8.7,
  },
];

const topPages = [
  { name: '/funnel/lead-magnet', views: 8456, conversions: 2341, rate: 27.7 },
  { name: '/funnel/webinar-signup', views: 6234, conversions: 1567, rate: 25.1 },
  { name: '/products/course', views: 4567, conversions: 345, rate: 7.6 },
  { name: '/checkout', views: 3456, conversions: 234, rate: 6.8 },
  { name: '/thank-you', views: 2345, conversions: 2345, rate: 100 },
];

export default function AnalyticsPage() {
  const t = useTranslations('analytics');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">
            Track your funnel performance and revenue
          </p>
        </div>
        <Select defaultValue="7d">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="year">This year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">26,368</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +12.5% from last period
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opt-ins</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7,035</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +8.3% from last period
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Purchases</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">479</div>
            <div className="flex items-center text-xs text-red-600 mt-1">
              <ArrowDownRight className="h-3 w-3 mr-1" />
              -2.1% from last period
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(14185300)}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +15.7% from last period
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="funnels" className="space-y-4">
        <TabsList>
          <TabsTrigger value="funnels">Funnels</TabsTrigger>
          <TabsTrigger value="pages">Top Pages</TabsTrigger>
          <TabsTrigger value="sources">Traffic Sources</TabsTrigger>
        </TabsList>

        <TabsContent value="funnels" className="space-y-4">
          <div className="grid gap-4">
            {funnelStats.map((funnel) => (
              <Card key={funnel.name}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{funnel.name}</CardTitle>
                    <div
                      className={`flex items-center text-sm ${
                        funnel.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {funnel.change >= 0 ? (
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 mr-1" />
                      )}
                      {Math.abs(funnel.change)}%
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Visitors</p>
                      <p className="font-medium text-lg">{funnel.visitors.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Opt-ins</p>
                      <p className="font-medium text-lg">{funnel.optins.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Sales</p>
                      <p className="font-medium text-lg">{funnel.sales.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Revenue</p>
                      <p className="font-medium text-lg">{formatCurrency(funnel.revenue)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Conv. Rate</p>
                      <p className="font-medium text-lg">{funnel.conversionRate}%</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Funnel Progress</span>
                      <span>{funnel.conversionRate}%</span>
                    </div>
                    <Progress value={funnel.conversionRate} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Pages</CardTitle>
              <CardDescription>
                Pages with the highest traffic and conversion rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPages.map((page, index) => (
                  <div key={page.name} className="flex items-center gap-4">
                    <div className="w-6 text-center font-bold text-muted-foreground">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-mono text-sm">{page.name}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {page.views.toLocaleString()} views
                        </span>
                        <span className="flex items-center gap-1">
                          <MousePointer className="h-3 w-3" />
                          {page.conversions.toLocaleString()} conversions
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{page.rate}%</p>
                      <p className="text-xs text-muted-foreground">conversion</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
              <CardDescription>Where your visitors are coming from</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { source: 'Direct', visitors: 8456, percentage: 32 },
                  { source: 'Google Organic', visitors: 6789, percentage: 26 },
                  { source: 'Facebook Ads', visitors: 5234, percentage: 20 },
                  { source: 'Instagram', visitors: 3456, percentage: 13 },
                  { source: 'LINE', visitors: 2433, percentage: 9 },
                ].map((item) => (
                  <div key={item.source}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{item.source}</span>
                      <span className="text-muted-foreground">
                        {item.visitors.toLocaleString()} ({item.percentage}%)
                      </span>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
