'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useWorkspace } from '@/components/providers/dashboard-providers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  MoreVertical,
  Package,
  CreditCard,
  Archive,
  Loader2,
  Trash,
  Search,
  LayoutGrid,
  List,
  DollarSign,
  ShoppingCart,
  Box,
  Zap,
  BookOpen,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  imageUrl: string | null;
  type: string;
  status: string;
  sku: string | null;
  trackInventory: boolean;
  inventoryCount: number;
  taxable: boolean;
  prices: ProductPrice[];
  _count: {
    orderItems: number;
  };
  createdAt: string;
}

interface ProductPrice {
  id: string;
  name: string | null;
  type: string;
  amount: number;
  currency: string;
  interval: string | null;
  isDefault: boolean;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  email: string;
  total: number;
  currency: string;
  createdAt: string;
  items: { name: string; quantity: number }[];
}

const productTypes = [
  { value: 'DIGITAL', label: 'Digital Product', icon: Zap, description: 'Downloads, videos, PDFs' },
  { value: 'PHYSICAL', label: 'Physical Product', icon: Box, description: 'Shipped products' },
  { value: 'SUBSCRIPTION', label: 'Subscription', icon: CreditCard, description: 'Recurring billing' },
  { value: 'SERVICE', label: 'Service', icon: ShoppingCart, description: 'Consulting, coaching' },
  { value: 'COURSE', label: 'Course', icon: BookOpen, description: 'Online courses' },
  { value: 'BUNDLE', label: 'Bundle', icon: Layers, description: 'Product bundles' },
];

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  ACTIVE: 'bg-green-100 text-green-700',
  ARCHIVED: 'bg-red-100 text-red-700',
};

const orderStatusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELED: 'bg-gray-100 text-gray-700',
  REFUNDED: 'bg-red-100 text-red-700',
  FAILED: 'bg-red-100 text-red-700',
};

export default function ProductsPage() {
  const t = useTranslations('products');
  const { currentWorkspace, isLoading: workspaceLoading } = useWorkspace();

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Create product dialog
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createStep, setCreateStep] = useState<'type' | 'details'>('type');
  const [selectedType, setSelectedType] = useState('DIGITAL');
  const [newProductName, setNewProductName] = useState('');
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Delete
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // WorkspaceContextからworkspaceIdを取得
  const workspaceId = currentWorkspace?.id;

  const fetchProducts = useCallback(async () => {
    if (!workspaceId) return;
    try {
      const response = await fetch(`/api/products?workspaceId=${workspaceId}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Fetch products error:', error);
    }
  }, [workspaceId]);

  const fetchOrders = useCallback(async () => {
    if (!workspaceId) return;
    try {
      const response = await fetch(`/api/orders?workspaceId=${workspaceId}&limit=10`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Fetch orders error:', error);
    }
  }, [workspaceId]);

  useEffect(() => {
    if (!workspaceId) return;
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchProducts(), fetchOrders()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchProducts, fetchOrders, workspaceId]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const handleCreateProduct = async () => {
    if (!newProductName.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          name: newProductName,
          type: selectedType,
          description: newProductDescription || undefined,
          price: newProductPrice ? parseInt(newProductPrice) : 0,
          currency: 'JPY',
        }),
      });

      if (!response.ok) throw new Error('Failed to create product');

      const product = await response.json();

      // Add default price if price was provided
      if (newProductPrice && parseInt(newProductPrice) > 0) {
        await fetch(`/api/products/${product.id}/prices`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: selectedType === 'SUBSCRIPTION' ? 'RECURRING' : 'ONE_TIME',
            amount: parseInt(newProductPrice),
            currency: 'JPY',
            interval: selectedType === 'SUBSCRIPTION' ? 'month' : undefined,
            isDefault: true,
          }),
        });
      }

      resetCreateModal();
      await fetchProducts();
    } catch (error) {
      console.error('Create product error:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/products/${deleteConfirm.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete product');

      setDeleteConfirm(null);
      await fetchProducts();
    } catch (error) {
      console.error('Delete product error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const resetCreateModal = () => {
    setIsCreateOpen(false);
    setCreateStep('type');
    setSelectedType('DIGITAL');
    setNewProductName('');
    setNewProductDescription('');
    setNewProductPrice('');
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || product.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate statistics
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === 'ACTIVE').length;
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter((o) => o.status === 'COMPLETED')
    .reduce((sum, o) => sum + o.total, 0);

  if (isLoading || workspaceLoading || !workspaceId) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">
            Manage your products, subscriptions, and orders
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">{activeProducts} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue, 'JPY')}</div>
            <p className="text-xs text-muted-foreground">From completed orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalOrders > 0 ? formatCurrency(totalRevenue / totalOrders, 'JPY') : '¥0'}
            </div>
            <p className="text-xs text-muted-foreground">Per order</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {productTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center border rounded-lg">
              <Button
                variant={view === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setView('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={view === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setView('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Empty State */}
          {products.length === 0 && (
            <Card className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-full bg-primary/10">
                  <Package className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">No products yet</h3>
                  <p className="text-muted-foreground">
                    Create your first product to start selling
                  </p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Product
                </Button>
              </div>
            </Card>
          )}

          {/* Products List */}
          {products.length > 0 && view === 'list' && (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const defaultPrice = product.prices?.find((p) => p.isDefault) || product.prices?.[0];
                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-10 h-10 rounded object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                                <Package className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{product.name}</p>
                              {product.sku && (
                                <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{product.type}</Badge>
                        </TableCell>
                        <TableCell>
                          {defaultPrice ? (
                            <div>
                              <p>{formatCurrency(defaultPrice.amount, defaultPrice.currency)}</p>
                              {defaultPrice.type === 'RECURRING' && defaultPrice.interval && (
                                <p className="text-xs text-muted-foreground">
                                  / {defaultPrice.interval}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No price</span>
                          )}
                        </TableCell>
                        <TableCell>{product._count.orderItems}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[product.status]}>
                            {product.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <ProductMenu
                            onDelete={() => setDeleteConfirm(product)}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}

          {/* Products Grid */}
          {products.length > 0 && view === 'grid' && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => {
                const defaultPrice = product.prices?.find((p) => p.isDefault) || product.prices?.[0];
                return (
                  <Card key={product.id} className="overflow-hidden">
                    <div className="aspect-video bg-muted relative">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <Badge className={cn('absolute top-2 right-2', statusColors[product.status])}>
                        {product.status}
                      </Badge>
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{product.name}</CardTitle>
                          <Badge variant="secondary" className="mt-1">
                            {product.type}
                          </Badge>
                        </div>
                        <ProductMenu
                          onDelete={() => setDeleteConfirm(product)}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          {defaultPrice ? (
                            <p className="text-lg font-bold">
                              {formatCurrency(defaultPrice.amount, defaultPrice.currency)}
                              {defaultPrice.type === 'RECURRING' && defaultPrice.interval && (
                                <span className="text-sm font-normal text-muted-foreground">
                                  /{defaultPrice.interval}
                                </span>
                              )}
                            </p>
                          ) : (
                            <p className="text-muted-foreground">No price set</p>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {product._count.orderItems} sales
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {filteredProducts.length === 0 && products.length > 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products match your filters</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          {orders.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>View and manage customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No orders yet</p>
                  <p className="text-sm">Orders will appear here when customers make purchases</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>View and manage customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell>{order.email}</TableCell>
                        <TableCell>
                          {order.items.length} item{order.items.length > 1 ? 's' : ''}
                        </TableCell>
                        <TableCell>{formatCurrency(order.total, order.currency)}</TableCell>
                        <TableCell>
                          <Badge className={orderStatusColors[order.status]}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Product Modal */}
      <Dialog open={isCreateOpen} onOpenChange={(open) => !open && resetCreateModal()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {createStep === 'type' ? 'Choose Product Type' : 'Create New Product'}
            </DialogTitle>
            <DialogDescription>
              {createStep === 'type'
                ? 'Select the type of product you want to create'
                : 'Enter the details for your new product'}
            </DialogDescription>
          </DialogHeader>

          {createStep === 'type' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
              {productTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Card
                    key={type.value}
                    className={cn(
                      'cursor-pointer transition-all hover:shadow-md',
                      selectedType === type.value && 'ring-2 ring-primary'
                    )}
                    onClick={() => setSelectedType(type.value)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h4 className="font-medium">{type.label}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                {(() => {
                  const typeInfo = productTypes.find((t) => t.value === selectedType);
                  const Icon = typeInfo?.icon || Package;
                  return (
                    <>
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{typeInfo?.label || selectedType}</p>
                        <p className="text-sm text-muted-foreground">{typeInfo?.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto"
                        onClick={() => setCreateStep('type')}
                      >
                        Change
                      </Button>
                    </>
                  );
                })()}
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-name">Product Name *</Label>
                <Input
                  id="product-name"
                  placeholder="e.g., Ultimate Marketing Course"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-price">
                  Price (JPY) {selectedType === 'SUBSCRIPTION' && '/ month'}
                </Label>
                <Input
                  id="product-price"
                  type="number"
                  placeholder="0"
                  value={newProductPrice}
                  onChange={(e) => setNewProductPrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-description">Description (optional)</Label>
                <Textarea
                  id="product-description"
                  placeholder="Describe your product..."
                  value={newProductDescription}
                  onChange={(e) => setNewProductDescription(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={resetCreateModal}>
              Cancel
            </Button>
            {createStep === 'type' ? (
              <Button onClick={() => setCreateStep('details')}>
                Continue
              </Button>
            ) : (
              <Button
                onClick={handleCreateProduct}
                disabled={!newProductName.trim() || isCreating}
              >
                {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Product
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirm?.name}"?
              {deleteConfirm?._count.orderItems && deleteConfirm._count.orderItems > 0 && (
                <span className="block mt-2 text-amber-600">
                  This product has {deleteConfirm._count.orderItems} orders and will be archived instead of deleted.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ProductMenu({
  onDelete,
}: {
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="text-destructive" onClick={onDelete}>
          <Trash className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
