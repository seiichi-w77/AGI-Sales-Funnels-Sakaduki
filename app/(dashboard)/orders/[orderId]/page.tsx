'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';

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
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELED', label: 'Canceled' },
  { value: 'REFUNDED', label: 'Refunded' },
  { value: 'PARTIALLY_REFUNDED', label: 'Partially Refunded' },
  { value: 'FAILED', label: 'Failed' },
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
      address.address1,
      address.address2,
      address.city,
      address.state,
      address.postalCode,
      address.country,
    ].filter(Boolean);
    return parts.join(', ');
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

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading order...</div>;
  }

  if (!order) {
    return <div className="p-6 text-center text-gray-500">Order not found</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <Link href="/orders" className="text-gray-500 hover:text-gray-700">
            &larr; Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Order {order.orderNumber}
            </h1>
            <p className="text-gray-500">
              Created {new Date(order.createdAt).toLocaleString()}
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
            {order.status}
          </span>
          <select
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={updating}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Order Items</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {order.items.map((item) => (
                <div key={item.id} className="px-6 py-4 flex gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0">
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
                    <div className="font-medium text-gray-900">{item.name}</div>
                    {item.variant && (
                      <div className="text-sm text-gray-500">
                        {item.variant.name}
                      </div>
                    )}
                    {item.price?.type === 'RECURRING' && item.price.interval && (
                      <div className="text-sm text-blue-600">
                        Subscription ({item.price.interval})
                      </div>
                    )}
                    <div className="text-sm text-gray-500">
                      Qty: {item.quantity}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      {formatPrice(item.totalPrice, order.currency)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatPrice(item.unitPrice, order.currency)} each
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 bg-gray-50 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatPrice(order.subtotal, order.currency)}</span>
              </div>
              {order.discountTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Discount</span>
                  <span className="text-green-600">
                    -{formatPrice(order.discountTotal, order.currency)}
                  </span>
                </div>
              )}
              {order.taxTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span>{formatPrice(order.taxTotal, order.currency)}</span>
                </div>
              )}
              {order.shippingTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span>{formatPrice(order.shippingTotal, order.currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>{formatPrice(order.total, order.currency)}</span>
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Transactions</h2>
            </div>
            {order.transactions.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No transactions yet
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {order.transactions.map((tx) => (
                  <div key={tx.id} className="px-6 py-4 flex justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{tx.type}</div>
                      <div className="text-sm text-gray-500">
                        {tx.gateway} - {tx.gatewayTransactionId || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(tx.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
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
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fulfillments */}
          {order.fulfillments.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Fulfillments</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {order.fulfillments.map((f) => (
                  <div key={f.id} className="px-6 py-4">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {f.carrier || 'Fulfillment'}
                        </div>
                        {f.trackingNumber && (
                          <div className="text-sm text-gray-500">
                            Tracking: {f.trackingNumber}
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
                        {f.status}
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
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Customer</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Email</div>
                <div className="font-medium">{order.email}</div>
              </div>
              {order.phone && (
                <div>
                  <div className="text-sm text-gray-500">Phone</div>
                  <div className="font-medium">{order.phone}</div>
                </div>
              )}
              {order.contact && (
                <div>
                  <div className="text-sm text-gray-500">Contact</div>
                  <Link
                    href={'/contacts/' + order.contact.id}
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
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Billing Address</h2>
              <div className="text-sm text-gray-700">
                {order.billingAddress.firstName} {order.billingAddress.lastName}
              </div>
              <div className="text-sm text-gray-700">
                {formatAddress(order.billingAddress)}
              </div>
            </div>
          )}

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
              <div className="text-sm text-gray-700">
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              </div>
              <div className="text-sm text-gray-700">
                {formatAddress(order.shippingAddress)}
              </div>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Notes</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {order.notes}
              </p>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Timeline</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Created</span>
                <span>{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              {order.paidAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Paid</span>
                  <span>{new Date(order.paidAt).toLocaleString()}</span>
                </div>
              )}
              {order.fulfilledAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Fulfilled</span>
                  <span>{new Date(order.fulfilledAt).toLocaleString()}</span>
                </div>
              )}
              {order.canceledAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Canceled</span>
                  <span>{new Date(order.canceledAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
