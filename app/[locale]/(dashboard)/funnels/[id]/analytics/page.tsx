'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Users,
  MousePointerClick,
  Clock,
  TrendingUp,
  Loader2,
  Edit,
  BarChart3,
  ChevronRight,
} from 'lucide-react';

interface StepAnalytics {
  stepId: string;
  stepName: string;
  stepType: string;
  sortOrder: number;
  views: number;
  uniqueVisitors: number;
  avgTimeOnPage: number;
  bounceRate: number;
}

interface DailyTrend {
  date: string;
  views: number;
  conversions: number;
}

interface Analytics {
  funnel: {
    id: string;
    name: string;
    status: string;
  };
  period: string;
  summary: {
    totalViews: number;
    totalUniqueVisitors: number;
    totalConversions: number;
    overallConversionRate: number;
    avgTimeOnFunnel: number;
  };
  steps: StepAnalytics[];
  dailyTrend: DailyTrend[];
  comparison: {
    viewsChange: number;
    conversionsChange: number;
    visitorsChange: number;
  };
}

export default function FunnelAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const funnelId = params.id as string;

  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/funnels/${funnelId}/analytics?period=${period}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Fetch analytics error:', error);
    } finally {
      setLoading(false);
    }
  }, [funnelId, period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    if (change < 0) return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    return null;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-muted-foreground';
  };

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Analytics not available</p>
          <Button onClick={() => router.push('/funnels')}>
            Back to Funnels
          </Button>
        </div>
      </div>
    );
  }

  // Calculate step-to-step conversion rates
  const stepConversions = analytics.steps.map((step, index) => {
    if (index === 0) return 100;
    const prevViews = analytics.steps[index - 1].views;
    return prevViews > 0 ? Math.round((step.views / prevViews) * 100) : 0;
  });

  // Find max views for chart scaling
  const maxViews = Math.max(...analytics.dailyTrend.map(d => d.views));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/funnels')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{analytics.funnel.name}</h1>
              <Badge variant={analytics.funnel.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                {analytics.funnel.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Analytics & Performance</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => router.push(`/funnels/${funnelId}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Funnel
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.summary.totalViews)}</div>
            <div className={cn('flex items-center text-xs', getChangeColor(analytics.comparison.viewsChange))}>
              {getChangeIcon(analytics.comparison.viewsChange)}
              <span>{Math.abs(analytics.comparison.viewsChange)}% from previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.summary.totalUniqueVisitors)}</div>
            <div className={cn('flex items-center text-xs', getChangeColor(analytics.comparison.visitorsChange))}>
              {getChangeIcon(analytics.comparison.visitorsChange)}
              <span>{Math.abs(analytics.comparison.visitorsChange)}% from previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.summary.totalConversions)}</div>
            <div className={cn('flex items-center text-xs', getChangeColor(analytics.comparison.conversionsChange))}>
              {getChangeIcon(analytics.comparison.conversionsChange)}
              <span>{Math.abs(analytics.comparison.conversionsChange)}% from previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.summary.overallConversionRate}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              <span>Avg. time: {formatTime(analytics.summary.avgTimeOnFunnel)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Steps Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Funnel Flow
          </CardTitle>
          <CardDescription>
            Conversion rates between each step of your funnel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.steps.map((step, index) => {
              const widthPercent = analytics.steps[0].views > 0
                ? (step.views / analytics.steps[0].views) * 100
                : 0;
              const conversionRate = stepConversions[index];

              return (
                <div key={step.stepId} className="relative">
                  {/* Connector */}
                  {index > 0 && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                      <ChevronRight className="h-4 w-4 rotate-90 text-muted-foreground" />
                      <span className={cn(
                        'text-xs font-medium px-2 py-0.5 rounded',
                        conversionRate >= 70 ? 'bg-green-100 text-green-700' :
                        conversionRate >= 40 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      )}>
                        {conversionRate}%
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{step.stepName}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatNumber(step.views)} views
                        </span>
                      </div>

                      <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
                        <div
                          className={cn(
                            'absolute inset-y-0 left-0 rounded-lg transition-all',
                            index === 0 ? 'bg-primary' :
                            conversionRate >= 70 ? 'bg-green-500' :
                            conversionRate >= 40 ? 'bg-yellow-500' :
                            'bg-red-500'
                          )}
                          style={{ width: `${widthPercent}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-between px-3">
                          <Badge variant="secondary" className="text-xs">
                            {step.stepType}
                          </Badge>
                          <span className="text-xs font-medium">
                            {Math.round(widthPercent)}%
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                        <span>{step.uniqueVisitors} unique</span>
                        <span>{step.bounceRate}% bounce</span>
                        <span>{formatTime(step.avgTimeOnPage)} avg time</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Daily Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Daily Trend
          </CardTitle>
          <CardDescription>
            Views and conversions over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end gap-1">
            {analytics.dailyTrend.slice(-30).map((day, index) => (
              <div
                key={day.date}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div
                  className="w-full bg-primary/20 rounded-t relative group"
                  style={{ height: `${(day.views / maxViews) * 200}px` }}
                >
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-primary rounded-t"
                    style={{ height: `${(day.conversions / day.views) * 100}%` }}
                  />
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <div className="bg-popover text-popover-foreground text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                      <div>{day.date}</div>
                      <div>Views: {day.views}</div>
                      <div>Conversions: {day.conversions}</div>
                    </div>
                  </div>
                </div>
                {index % 5 === 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(day.date).getDate()}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary/20" />
              <span>Views</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary" />
              <span>Conversions</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Step Performance</CardTitle>
          <CardDescription>
            Detailed metrics for each funnel step
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Step</th>
                  <th className="text-right py-3 px-2">Views</th>
                  <th className="text-right py-3 px-2">Unique</th>
                  <th className="text-right py-3 px-2">Bounce Rate</th>
                  <th className="text-right py-3 px-2">Avg. Time</th>
                  <th className="text-right py-3 px-2">Conversion</th>
                </tr>
              </thead>
              <tbody>
                {analytics.steps.map((step, index) => (
                  <tr key={step.stepId} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{index + 1}.</span>
                        <span className="font-medium">{step.stepName}</span>
                        <Badge variant="outline" className="text-xs">
                          {step.stepType}
                        </Badge>
                      </div>
                    </td>
                    <td className="text-right py-3 px-2">{formatNumber(step.views)}</td>
                    <td className="text-right py-3 px-2">{formatNumber(step.uniqueVisitors)}</td>
                    <td className="text-right py-3 px-2">
                      <span className={cn(
                        step.bounceRate > 50 ? 'text-red-500' :
                        step.bounceRate > 30 ? 'text-yellow-500' :
                        'text-green-500'
                      )}>
                        {step.bounceRate}%
                      </span>
                    </td>
                    <td className="text-right py-3 px-2">{formatTime(step.avgTimeOnPage)}</td>
                    <td className="text-right py-3 px-2">
                      <span className={cn(
                        'font-medium',
                        stepConversions[index] >= 70 ? 'text-green-500' :
                        stepConversions[index] >= 40 ? 'text-yellow-500' :
                        'text-red-500'
                      )}>
                        {index === 0 ? '—' : `${stepConversions[index]}%`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
