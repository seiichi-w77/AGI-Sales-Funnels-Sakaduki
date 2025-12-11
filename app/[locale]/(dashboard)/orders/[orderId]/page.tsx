'use client';

import { useState, useEffect, use } from 'react';
import { Link } from '@/i18n/routing';

interface OrderItem {
  id: string;
  name: string;
  description: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: {
    id: string;
    name: string;
    imageUrl: string | null;
  } | null;
  price: {
    id: string;
    type: string;
    interval: string | null;
  } | null;
  variant: {
    id: string;
    name: string;
  } | null;
}

interface Transaction {
  id: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  gateway: string;
  gatewayTransactionId: string | null;
  createdAt: string;
}

interface Fulfillment {
  id: string;
  status: string;
  trackingNumber: string | null;
  trackingUrl: string | null;
  carrier: string | null;
  createdAt: string;
}

interface Order {
  id: string;
  workspaceId: string;
  orderNumber: string;
  status: string;
  email: string;
  phone: string | null;
  billingAddress: Record<string, string> | null;
  shippingAddress: Record<string, string> | null;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingTotal: number;
  total: number;
  currency: string;
  notes: string | null;
  paidAt: string | null;
  fulfilledAt: string | null;
  canceledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  contact: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
  transactions: Transaction[];
  fulfillments: Fulfillment[];
}

const orderStatuses = [
  { value: 'PENDING', label: '保留中' },
  { value: 'PROCESSING', label: '処理中' },
  { value: 'COMPLETED', label: '完了' },
  { value: 'CANCELED', label: 'キャンセル' },
  { value: 'REFUNDED', label: '返金済' },
  { value: 'PARTIALLY_REFUNDED', label: '一部返金' },
  { value: 'FAILED', label: '失敗' },
];

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders/' + orderId);
      const data = await res.json();

      if (res.ok) {
        setOrder(data.order);
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    setUpdating(true);

    try {
      const res = await fetch('/api/orders/' + orderId, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchOrder();
      }
    } catch (error) {
      console.error('Failed to update order:', error);
    } finally {
      setUpdating(false);
    }
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency,
    }).format(amount / 100);
  };

  const formatAddress = (address: Record<string, string> | null) => {
    if (!address) return null;
    const parts = [
      address.postalCode,
      address.country,
      address.state,
      address.city,
      address.address1,
      address.address2,
    ].filter(Boolean);
    return parts.join(' ');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELED':
      case 'FAILED':
        return 'bg-gray-100 text-gray-800';
      case 'REFUNDED':
      case 'PARTIALLY_REFUNDED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const found = orderStatuses.find((s) => s.value === status);
    return found?.label || status;
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500 dark:text-gray-400">読み込み中...</div>;
  }

  if (!order) {
    return <div className="p-6 text-center text-gray-500 dark:text-gray-400">注文が見つかりません</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <Link href="/orders" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            &larr; 戻る
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              注文 {order.orderNumber}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              作成日時: {new Date(order.createdAt).toLocaleString('ja-JP')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span
            className={
              'px-3 py-1 text-sm font-medium rounded-full ' +
              getStatusColor(order.status)
            }
          >
            {getStatusLabel(order.status)}
          </span>
          <select
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={updating}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            {orderStatuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">注文商品</h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {order.items.map((item) => (
                <div key={item.id} className="px-6 py-4 flex gap-4">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded flex-shrink-0">
                    {item.product?.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{item.name}</div>
                    {item.variant && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {item.variant.name}
                      </div>
                    )}
                    {item.price?.type === 'RECURRING' && item.price.interval && (
                      <div className="text-sm text-blue-600">
                        サブスクリプション ({item.price.interval})
                      </div>
                    )}
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      数量: {item.quantity}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {formatPrice(item.totalPrice, order.currency)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      単価: {formatPrice(item.unitPrice, order.currency)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">小計</span>
                <span className="text-gray-900 dark:text-gray-100">{formatPrice(order.subtotal, order.currency)}</span>
              </div>
              {order.discountTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">割引</span>
                  <span className="text-green-600">
                    -{formatPrice(order.discountTotal, order.currency)}
                  </span>
                </div>
              )}
              {order.taxTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">税金</span>
                  <span className="text-gray-900 dark:text-gray-100">{formatPrice(order.taxTotal, order.currency)}</span>
                </div>
              )}
              {order.shippingTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">配送料</span>
                  <span className="text-gray-900 dark:text-gray-100">{formatPrice(order.shippingTotal, order.currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-900 dark:text-gray-100">合計</span>
                <span className="text-gray-900 dark:text-gray-100">{formatPrice(order.total, order.currency)}</span>
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">取引履歴</h2>
            </div>
            {order.transactions.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                取引履歴がありません
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {order.transactions.map((tx) => (
                  <div key={tx.id} className="px-6 py-4 flex justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{tx.type}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {tx.gateway} - {tx.gatewayTransactionId || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(tx.createdAt).toLocaleString('ja-JP')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {formatPrice(tx.amount, tx.currency)}
                      </div>
                      <span
                        className={
                          'px-2 py-0.5 text-xs font-medium rounded ' +
                          (tx.status === 'SUCCEEDED'
                            ? 'bg-green-100 text-green-800'
                            : tx.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800')
                        }
                      >
                        {tx.status === 'SUCCEEDED' ? '成功' : tx.status === 'PENDING' ? '保留中' : '失敗'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fulfillments */}
          {order.fulfillments.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">配送情報</h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {order.fulfillments.map((f) => (
                  <div key={f.id} className="px-6 py-4">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {f.carrier || '配送'}
                        </div>
                        {f.trackingNumber && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            追跡番号: {f.trackingNumber}
                          </div>
                        )}
                      </div>
                      <span
                        className={
                          'px-2 py-0.5 text-xs font-medium rounded ' +
                          (f.status === 'DELIVERED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800')
                        }
                      >
                        {f.status === 'DELIVERED' ? '配達完了' : '配送中'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Customer Info */}
        <div className="space-y-6">
          {/* Customer */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">顧客情報</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">メールアドレス</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{order.email}</div>
              </div>
              {order.phone && (
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">電話番号</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{order.phone}</div>
                </div>
              )}
              {order.contact && (
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">連絡先</div>
                  <Link
                    href={`/contacts/${order.contact.id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {order.contact.firstName} {order.contact.lastName}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Billing Address */}
          {order.billingAddress && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">請求先住所</h2>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {order.billingAddress.firstName} {order.billingAddress.lastName}
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {formatAddress(order.billingAddress)}
              </div>
            </div>
          )}

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">配送先住所</h2>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {formatAddress(order.shippingAddress)}
              </div>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">メモ</h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {order.notes}
              </p>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">タイムライン</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">作成</span>
                <span className="text-gray-900 dark:text-gray-100">{new Date(order.createdAt).toLocaleString('ja-JP')}</span>
              </div>
              {order.paidAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">支払い</span>
                  <span className="text-gray-900 dark:text-gray-100">{new Date(order.paidAt).toLocaleString('ja-JP')}</span>
                </div>
              )}
              {order.fulfilledAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">発送</span>
                  <span className="text-gray-900 dark:text-gray-100">{new Date(order.fulfilledAt).toLocaleString('ja-JP')}</span>
                </div>
              )}
              {order.canceledAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">キャンセル</span>
                  <span className="text-gray-900 dark:text-gray-100">{new Date(order.canceledAt).toLocaleString('ja-JP')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
