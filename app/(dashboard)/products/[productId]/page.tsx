'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ProductPrice {
  id: string;
  name: string | null;
  type: string;
  amount: number;
  currency: string;
  interval: string | null;
  intervalCount: number | null;
  trialDays: number | null;
  installments: number | null;
  isDefault: boolean;
}

interface ProductVariant {
  id: string;
  name: string;
  sku: string | null;
  price: number | null;
  compareAtPrice: number | null;
  inventoryCount: number;
  options: Record<string, string> | null;
  imageUrl: string | null;
  sortOrder: number;
}

interface Product {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  imageUrl: string | null;
  type: string;
  status: string;
  sku: string | null;
  barcode: string | null;
  trackInventory: boolean;
  inventoryCount: number;
  weight: number | null;
  weightUnit: string | null;
  taxable: boolean;
  createdAt: string;
  updatedAt: string;
  prices: ProductPrice[];
  variants: ProductVariant[];
  _count: {
    orderItems: number;
  };
}

const productTypes = [
  { value: 'DIGITAL', label: 'Digital' },
  { value: 'PHYSICAL', label: 'Physical' },
  { value: 'SERVICE', label: 'Service' },
  { value: 'SUBSCRIPTION', label: 'Subscription' },
  { value: 'COURSE', label: 'Course' },
  { value: 'BUNDLE', label: 'Bundle' },
];

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = use(params);
  const _router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [type, setType] = useState('DIGITAL');
  const [status, setStatus] = useState('DRAFT');
  const [imageUrl, setImageUrl] = useState('');
  const [sku, setSku] = useState('');
  const [trackInventory, setTrackInventory] = useState(false);
  const [inventoryCount, setInventoryCount] = useState(0);
  const [taxable, setTaxable] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products/' + productId);
      const data = await res.json();

      if (res.ok) {
        setProduct(data.product);
        setName(data.product.name);
        setDescription(data.product.description || '');
        setShortDescription(data.product.shortDescription || '');
        setType(data.product.type);
        setStatus(data.product.status);
        setImageUrl(data.product.imageUrl || '');
        setSku(data.product.sku || '');
        setTrackInventory(data.product.trackInventory);
        setInventoryCount(data.product.inventoryCount);
        setTaxable(data.product.taxable);
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/products/' + productId, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          shortDescription,
          type,
          status,
          imageUrl: imageUrl || null,
          sku: sku || null,
          trackInventory,
          inventoryCount,
          taxable,
        }),
      });

      if (res.ok) {
        fetchProduct();
      }
    } catch (error) {
      console.error('Failed to save product:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePrice = async (priceId: string) => {
    if (!confirm('Are you sure you want to delete this price?')) return;

    try {
      const res = await fetch(
        '/api/products/' + productId + '/prices?priceId=' + priceId,
        { method: 'DELETE' }
      );
      if (res.ok) {
        fetchProduct();
      }
    } catch (error) {
      console.error('Failed to delete price:', error);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm('Are you sure you want to delete this variant?')) return;

    try {
      const res = await fetch(
        '/api/products/' + productId + '/variants?variantId=' + variantId,
        { method: 'DELETE' }
      );
      if (res.ok) {
        fetchProduct();
      }
    } catch (error) {
      console.error('Failed to delete variant:', error);
    }
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency,
    }).format(amount / 100);
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">Loading product...</div>
    );
  }

  if (!product) {
    return (
      <div className="p-6 text-center text-gray-500">Product not found</div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/products" className="text-gray-500 hover:text-gray-700">
            &larr; Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-500">Product ID: {product.id}</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {['details', 'prices', 'variants'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={
                'pb-3 text-sm font-medium border-b-2 ' +
                (activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700')
              }
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'prices' && (
                <span className="ml-1 text-gray-400">
                  ({product.prices.length})
                </span>
              )}
              {tab === 'variants' && (
                <span className="ml-1 text-gray-400">
                  ({product.variants.length})
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Details Tab */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Short Description
                  </label>
                  <input
                    type="text"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Brief description for product cards"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Inventory</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="trackInventory"
                    checked={trackInventory}
                    onChange={(e) => setTrackInventory(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="trackInventory" className="text-sm text-gray-700">
                    Track inventory
                  </label>
                </div>
                {trackInventory && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Count
                    </label>
                    <input
                      type="number"
                      value={inventoryCount}
                      onChange={(e) =>
                        setInventoryCount(parseInt(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Product Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="ACTIVE">Active</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {productTypes.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="taxable"
                    checked={taxable}
                    onChange={(e) => setTaxable(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="taxable" className="text-sm text-gray-700">
                    Taxable
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Stats</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Sales</span>
                  <span className="font-medium">{product._count.orderItems}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Prices</span>
                  <span className="font-medium">{product.prices.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Variants</span>
                  <span className="font-medium">{product.variants.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prices Tab */}
      {activeTab === 'prices' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Prices</h2>
            <button
              onClick={() => setShowPriceModal(true)}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Price
            </button>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Default
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {product.prices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No prices configured. Add a price to start selling.
                  </td>
                </tr>
              ) : (
                product.prices.map((price) => (
                  <tr key={price.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {price.name || 'Default Price'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {price.type}
                      {price.type === 'RECURRING' &&
                        price.interval &&
                        ` / ${price.interval}`}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {formatPrice(price.amount, price.currency)}
                    </td>
                    <td className="px-6 py-4">
                      {price.isDefault && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">
                          Default
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeletePrice(price.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Variants Tab */}
      {activeTab === 'variants' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Variants</h2>
            <button
              onClick={() => setShowVariantModal(true)}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Variant
            </button>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Variant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Inventory
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {product.variants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No variants configured.
                  </td>
                </tr>
              ) : (
                product.variants.map((variant) => (
                  <tr key={variant.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {variant.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {variant.sku || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {variant.price
                        ? formatPrice(variant.price, 'JPY')
                        : 'Use default'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {variant.inventoryCount}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteVariant(variant.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Price Modal */}
      {showPriceModal && (
        <AddPriceModal
          productId={productId}
          onClose={() => setShowPriceModal(false)}
          onCreated={() => {
            setShowPriceModal(false);
            fetchProduct();
          }}
        />
      )}

      {/* Add Variant Modal */}
      {showVariantModal && (
        <AddVariantModal
          productId={productId}
          onClose={() => setShowVariantModal(false)}
          onCreated={() => {
            setShowVariantModal(false);
            fetchProduct();
          }}
        />
      )}
    </div>
  );
}

function AddPriceModal({
  productId,
  onClose,
  onCreated,
}: {
  productId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState('ONE_TIME');
  const [amount, setAmount] = useState('');
  const [interval, setInterval] = useState('month');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/products/' + productId + '/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || undefined,
          type,
          amount: Math.round(parseFloat(amount) * 100),
          currency: 'JPY',
          interval: type === 'RECURRING' ? interval : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create price');
        return;
      }

      onCreated();
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Add Price</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Monthly Plan"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price Type *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="ONE_TIME">One-time Payment</option>
              <option value="RECURRING">Subscription</option>
              <option value="PAYMENT_PLAN">Payment Plan</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (JPY) *
            </label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="9800"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {type === 'RECURRING' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Billing Interval
              </label>
              <select
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !amount}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Price'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddVariantModal({
  productId,
  onClose,
  onCreated,
}: {
  productId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [inventoryCount, setInventoryCount] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/products/' + productId + '/variants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          sku: sku || undefined,
          price: price ? Math.round(parseFloat(price) * 100) : undefined,
          inventoryCount: parseInt(inventoryCount) || 0,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create variant');
        return;
      }

      onCreated();
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Add Variant</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Variant Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Size: Large"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SKU
            </label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="e.g., PROD-001-L"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price Override (JPY)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Leave empty to use default"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inventory Count
            </label>
            <input
              type="number"
              value={inventoryCount}
              onChange={(e) => setInventoryCount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Variant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
