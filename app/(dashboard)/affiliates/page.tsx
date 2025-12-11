'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';


interface AffiliateProgram {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  commissionType: 'PERCENTAGE' | 'FIXED';
  commissionRate: number;
  tier2Rate: number | null;
  cookieDays: number;
  minPayout: number;
  autoApprove: boolean;
  status: 'ACTIVE' | 'PAUSED' | 'CLOSED';
  createdAt: string;
  _count: {
    affiliates: number;
    products: number;
  };
}

interface Affiliate {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  affiliateCode: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  createdAt: string;
  totalEarnings: number;
  _count: {
    clicks: number;
    conversions: number;
    referrals: number;
  };
}

export default function AffiliatesPage() {
  const searchParams = useSearchParams();
  const workspaceId = searchParams.get('workspaceId') || 'default';

  const [activeTab, setActiveTab] = useState<'programs' | 'affiliates'>('programs');
  const [programs, setPrograms] = useState<AffiliateProgram[]>([]);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProgramModal, setShowProgramModal] = useState(false);

  const fetchPrograms = useCallback(async () => {
    try {
      const res = await fetch(`/api/affiliates/programs?workspaceId=${workspaceId}`);
      const data = await res.json();
      if (data.programs) {
        setPrograms(data.programs);
        if (data.programs.length > 0 && !selectedProgramId) {
          setSelectedProgramId(data.programs[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  }, [workspaceId, selectedProgramId]);

  const fetchAffiliates = useCallback(async () => {
    if (!selectedProgramId) return;
    try {
      const res = await fetch(`/api/affiliates?programId=${selectedProgramId}`);
      const data = await res.json();
      if (data.affiliates) {
        setAffiliates(data.affiliates);
      }
    } catch (error) {
      console.error('Error fetching affiliates:', error);
    }
  }, [selectedProgramId]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchPrograms();
      setLoading(false);
    };
    fetchData();
  }, [fetchPrograms]);

  useEffect(() => {
    if (selectedProgramId) {
      fetchAffiliates();
    }
  }, [selectedProgramId, fetchAffiliates]);

  const handleCreateProgram = async (formData: FormData) => {
    try {
      const res = await fetch('/api/affiliates/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          name: formData.get('name'),
          description: formData.get('description') || null,
          commissionType: formData.get('commissionType'),
          commissionRate: parseInt(formData.get('commissionRate') as string),
          tier2Rate: formData.get('tier2Rate') ? parseInt(formData.get('tier2Rate') as string) : null,
          cookieDays: parseInt(formData.get('cookieDays') as string) || 45,
          minPayout: parseInt(formData.get('minPayout') as string) || 5000,
          autoApprove: formData.get('autoApprove') === 'true',
        }),
      });

      if (res.ok) {
        setShowProgramModal(false);
        fetchPrograms();
      }
    } catch (error) {
      console.error('Error creating program:', error);
    }
  };

  const handleApproveAffiliate = async (affiliateId: string) => {
    try {
      await fetch(`/api/affiliates/${affiliateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' }),
      });
      fetchAffiliates();
    } catch (error) {
      console.error('Error approving affiliate:', error);
    }
  };

  const handleRejectAffiliate = async (affiliateId: string) => {
    try {
      await fetch(`/api/affiliates/${affiliateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED', rejectionReason: 'Application rejected' }),
      });
      fetchAffiliates();
    } catch (error) {
      console.error('Error rejecting affiliate:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      PAUSED: 'bg-yellow-100 text-yellow-800',
      CLOSED: 'bg-red-100 text-red-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      SUSPENDED: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">アフィリエイト</h1>
        <button
          onClick={() => setShowProgramModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          プログラム作成
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('programs')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'programs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            プログラム
          </button>
          <button
            onClick={() => setActiveTab('affiliates')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'affiliates'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            アフィリエイター
          </button>
        </nav>
      </div>

      {/* Programs Tab */}
      {activeTab === 'programs' && (
        <div className="grid gap-4">
          {programs.length === 0 ? (
            <div className="bg-white rounded-lg border p-8 text-center text-gray-500">
              プログラムがありません。新しいプログラムを作成してください。
            </div>
          ) : (
            programs.map((program) => (
              <div
                key={program.id}
                className={`bg-white rounded-lg border p-6 cursor-pointer transition-shadow hover:shadow-md ${
                  selectedProgramId === program.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedProgramId(program.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{program.name}</h3>
                      {getStatusBadge(program.status)}
                    </div>
                    <p className="text-sm text-gray-500 mb-4">{program.description}</p>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">コミッション</span>
                        <div className="font-medium">
                          {program.commissionType === 'PERCENTAGE'
                            ? `${program.commissionRate}%`
                            : formatCurrency(program.commissionRate)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Cookie期間</span>
                        <div className="font-medium">{program.cookieDays}日</div>
                      </div>
                      <div>
                        <span className="text-gray-500">アフィリエイター</span>
                        <div className="font-medium">{program._count.affiliates}人</div>
                      </div>
                      <div>
                        <span className="text-gray-500">対象商品</span>
                        <div className="font-medium">{program._count.products}件</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Affiliates Tab */}
      {activeTab === 'affiliates' && (
        <div>
          {/* Program Selector */}
          <div className="mb-4">
            <select
              value={selectedProgramId || ''}
              onChange={(e) => setSelectedProgramId(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">アフィリエイター</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">コード</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ステータス</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">クリック</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">コンバージョン</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">収益</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">アクション</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {affiliates.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      アフィリエイターがいません
                    </td>
                  </tr>
                ) : (
                  affiliates.map((affiliate) => (
                    <tr key={affiliate.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium">
                          {affiliate.firstName || ''} {affiliate.lastName || ''}
                        </div>
                        <div className="text-sm text-gray-500">{affiliate.email}</div>
                        {affiliate.company && (
                          <div className="text-sm text-gray-400">{affiliate.company}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {affiliate.affiliateCode}
                        </code>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(affiliate.status)}</td>
                      <td className="px-6 py-4 text-right">{affiliate._count.clicks}</td>
                      <td className="px-6 py-4 text-right">{affiliate._count.conversions}</td>
                      <td className="px-6 py-4 text-right font-medium text-green-600">
                        {formatCurrency(affiliate.totalEarnings)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {affiliate.status === 'PENDING' && (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleApproveAffiliate(affiliate.id)}
                              className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              承認
                            </button>
                            <button
                              onClick={() => handleRejectAffiliate(affiliate.id)}
                              className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              却下
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Program Modal */}
      {showProgramModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">プログラム作成</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateProgram(new FormData(e.currentTarget));
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  プログラム名 *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    コミッションタイプ
                  </label>
                  <select name="commissionType" className="w-full px-3 py-2 border rounded-md">
                    <option value="PERCENTAGE">パーセント</option>
                    <option value="FIXED">固定額</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    コミッション率/額
                  </label>
                  <input
                    type="number"
                    name="commissionRate"
                    defaultValue="10"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cookie期間（日）
                  </label>
                  <input
                    type="number"
                    name="cookieDays"
                    defaultValue="45"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    最低支払額（円）
                  </label>
                  <input
                    type="number"
                    name="minPayout"
                    defaultValue="5000"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="autoApprove" value="true" />
                  <span className="text-sm">自動承認</span>
                </label>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowProgramModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  作成
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
