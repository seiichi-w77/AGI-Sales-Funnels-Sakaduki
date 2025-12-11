'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';


interface DashboardMetrics {
  traffic: {
    visitors: number;
    uniqueVisitors: number;
    pageViews: number;
  };
  conversions: {
    optins: number;
    sales: number;
    conversionRate: number;
  };
  revenue: {
    total: number;
    orders: number;
    averageOrderValue: number;
  };
  contacts: {
    newContacts: number;
  };
  email: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
  };
  courses: {
    enrollments: number;
  };
}

interface FunnelAnalytics {
  funnel: {
    id: string;
    name: string;
    slug: string;
    status: string;
  };
  metrics: {
    visitors: number;
    uniqueVisitors: number;
    pageViews: number;
    optins: number;
    sales: number;
    revenue: number;
    conversionRate: number;
  };
}

interface LiveData {
  timestamp: string;
  activeUsers: number;
  today: {
    visitors: number;
    sales: number;
    revenue: number;
  };
  activityFeed: Array<{
    type: string;
    id: string;
    message: string;
    timestamp: string;
    amount?: number;
    source?: string;
  }>;
}

export default function AnalyticsPage() {
  const searchParams = useSearchParams();
  const workspaceId = searchParams.get('workspaceId') || 'default';

  const [period, setPeriod] = useState('7d');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'funnels' | 'live' | 'reports'>('dashboard');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [funnelAnalytics, setFunnelAnalytics] = useState<FunnelAnalytics[]>([]);
  const [liveData, setLiveData] = useState<LiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('sales');

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch(`/api/analytics/dashboard?workspaceId=${workspaceId}&period=${period}`);
      const data = await res.json();
      if (data.dashboard) {
        setMetrics(data.dashboard.metrics);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
  }, [workspaceId, period]);

  const fetchFunnels = useCallback(async () => {
    try {
      const res = await fetch(`/api/analytics/funnels?workspaceId=${workspaceId}&period=${period}`);
      const data = await res.json();
      if (data.analytics) {
        setFunnelAnalytics(data.analytics.funnels);
      }
    } catch (error) {
      console.error('Error fetching funnel analytics:', error);
    }
  }, [workspaceId, period]);

  const fetchLive = useCallback(async () => {
    try {
      const res = await fetch(`/api/analytics/live?workspaceId=${workspaceId}`);
      const data = await res.json();
      if (data.live) {
        setLiveData(data.live);
      }
    } catch (error) {
      console.error('Error fetching live data:', error);
    }
  }, [workspaceId]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchDashboard(), fetchFunnels()]);
      setLoading(false);
    };
    fetchData();
  }, [fetchDashboard, fetchFunnels]);

  useEffect(() => {
    if (activeTab === 'live') {
      fetchLive();
      const interval = setInterval(fetchLive, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [activeTab, fetchLive]);

  const handleExportReport = async () => {
    window.open(`/api/analytics/reports?workspaceId=${workspaceId}&type=${reportType}&period=${period}&format=csv`, '_blank');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ja-JP').format(num);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">アナリティクス</h1>
        <div className="flex gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="today">今日</option>
            <option value="7d">過去7日</option>
            <option value="30d">過去30日</option>
            <option value="90d">過去90日</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <nav className="flex gap-4">
          {[
            { id: 'dashboard', label: 'ダッシュボード' },
            { id: 'funnels', label: 'ファネル' },
            { id: 'live', label: 'ライブビュー' },
            { id: 'reports', label: 'レポート' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && metrics && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="text-sm text-gray-500 mb-1">売上</div>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(metrics.revenue.total)}</div>
              <div className="text-sm text-gray-400">{metrics.revenue.orders} 件の注文</div>
            </div>
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="text-sm text-gray-500 mb-1">訪問者</div>
              <div className="text-2xl font-bold">{formatNumber(metrics.traffic.uniqueVisitors)}</div>
              <div className="text-sm text-gray-400">{formatNumber(metrics.traffic.pageViews)} PV</div>
            </div>
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="text-sm text-gray-500 mb-1">コンバージョン率</div>
              <div className="text-2xl font-bold text-blue-600">{metrics.conversions.conversionRate}%</div>
              <div className="text-sm text-gray-400">{metrics.conversions.sales} 件の販売</div>
            </div>
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="text-sm text-gray-500 mb-1">新規コンタクト</div>
              <div className="text-2xl font-bold">{formatNumber(metrics.contacts.newContacts)}</div>
              <div className="text-sm text-gray-400">{metrics.conversions.optins} オプトイン</div>
            </div>
          </div>

          {/* Email Stats */}
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold mb-4">メール統計</h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-500">送信</div>
                <div className="text-xl font-bold">{formatNumber(metrics.email.sent)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">配信</div>
                <div className="text-xl font-bold">{formatNumber(metrics.email.delivered)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">開封</div>
                <div className="text-xl font-bold">{formatNumber(metrics.email.opened)}</div>
                {metrics.email.delivered > 0 && (
                  <div className="text-sm text-gray-400">
                    {((metrics.email.opened / metrics.email.delivered) * 100).toFixed(1)}%
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm text-gray-500">クリック</div>
                <div className="text-xl font-bold">{formatNumber(metrics.email.clicked)}</div>
                {metrics.email.opened > 0 && (
                  <div className="text-sm text-gray-400">
                    {((metrics.email.clicked / metrics.email.opened) * 100).toFixed(1)}%
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Course Stats */}
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold mb-4">コース統計</h3>
            <div>
              <div className="text-sm text-gray-500">新規受講者</div>
              <div className="text-xl font-bold">{formatNumber(metrics.courses.enrollments)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Funnels Tab */}
      {activeTab === 'funnels' && (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ファネル</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">訪問者</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">オプトイン</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">販売</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">売上</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">CV率</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {funnelAnalytics.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    データがありません
                  </td>
                </tr>
              ) : (
                funnelAnalytics.map((fa) => (
                  <tr key={fa.funnel.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium">{fa.funnel.name}</div>
                      <div className="text-sm text-gray-500">/{fa.funnel.slug}</div>
                    </td>
                    <td className="px-6 py-4 text-right">{formatNumber(fa.metrics.uniqueVisitors)}</td>
                    <td className="px-6 py-4 text-right">{formatNumber(fa.metrics.optins)}</td>
                    <td className="px-6 py-4 text-right">{formatNumber(fa.metrics.sales)}</td>
                    <td className="px-6 py-4 text-right">{formatCurrency(fa.metrics.revenue)}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={fa.metrics.conversionRate > 5 ? 'text-green-600' : ''}>
                        {fa.metrics.conversionRate}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Live Tab */}
      {activeTab === 'live' && liveData && (
        <div className="space-y-6">
          {/* Live Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-sm text-green-700">アクティブ</span>
              </div>
              <div className="text-3xl font-bold text-green-700">{liveData.activeUsers}</div>
              <div className="text-sm text-green-600">過去5分間</div>
            </div>
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="text-sm text-gray-500 mb-1">今日の訪問者</div>
              <div className="text-2xl font-bold">{formatNumber(liveData.today.visitors)}</div>
            </div>
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="text-sm text-gray-500 mb-1">今日の販売</div>
              <div className="text-2xl font-bold">{formatNumber(liveData.today.sales)}</div>
            </div>
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="text-sm text-gray-500 mb-1">今日の売上</div>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(liveData.today.revenue)}</div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">アクティビティフィード</h3>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {liveData.activityFeed.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  最近のアクティビティはありません
                </div>
              ) : (
                liveData.activityFeed.map((activity) => (
                  <div key={activity.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          activity.type === 'order'
                            ? 'bg-green-500'
                            : activity.type === 'contact'
                            ? 'bg-blue-500'
                            : 'bg-purple-500'
                        }`}
                      ></span>
                      <div>
                        <div className="text-sm">{activity.message}</div>
                        {activity.amount && (
                          <div className="text-sm text-green-600">{formatCurrency(activity.amount)}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">{formatTime(activity.timestamp)}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold mb-4">レポート生成</h3>
            <div className="flex gap-4 items-end">
              <div>
                <label className="block text-sm text-gray-600 mb-1">レポートタイプ</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="sales">売上レポート</option>
                  <option value="conversion">コンバージョンレポート</option>
                  <option value="traffic">トラフィックレポート</option>
                  <option value="contacts">コンタクトレポート</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">期間</label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="7d">過去7日</option>
                  <option value="30d">過去30日</option>
                  <option value="90d">過去90日</option>
                  <option value="365d">過去1年</option>
                </select>
              </div>
              <button
                onClick={handleExportReport}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                CSVエクスポート
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { type: 'sales', title: '売上レポート', description: '注文と売上の詳細' },
              { type: 'conversion', title: 'コンバージョンレポート', description: 'ファネルのコンバージョン分析' },
              { type: 'traffic', title: 'トラフィックレポート', description: '訪問者とページビュー' },
              { type: 'contacts', title: 'コンタクトレポート', description: '新規コンタクトの獲得' },
            ].map((report) => (
              <div
                key={report.type}
                className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setReportType(report.type)}
              >
                <h4 className="font-semibold">{report.title}</h4>
                <p className="text-sm text-gray-500 mt-1">{report.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
