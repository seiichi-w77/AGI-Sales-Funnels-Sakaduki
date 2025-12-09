'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Package,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Eye,
  DollarSign,
  ShoppingBag,
  Archive,
  Filter,
  ArrowUpDown,
  ImagePlus,
} from 'lucide-react'

interface Product {
  id: string
  name: string
  slug: string
  description?: string
  imageUrl?: string
  type: 'DIGITAL' | 'PHYSICAL' | 'SERVICE' | 'SUBSCRIPTION' | 'BUNDLE'
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED'
  defaultPrice?: number
  currency: string
  sales: number
  inventory?: number
  createdAt: string
}

// Mock data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'セールスファネル構築マスター講座',
    slug: 'sales-funnel-master',
    description: 'ファネル構築の基礎から応用まで学べる包括的なコース',
    imageUrl: '/placeholder-course.jpg',
    type: 'DIGITAL',
    status: 'ACTIVE',
    defaultPrice: 49800,
    currency: 'JPY',
    sales: 127,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'プレミアムメンバーシップ',
    slug: 'premium-membership',
    description: '月額制のプレミアムコンテンツへのアクセス',
    type: 'SUBSCRIPTION',
    status: 'ACTIVE',
    defaultPrice: 9800,
    currency: 'JPY',
    sales: 89,
    createdAt: '2024-02-01',
  },
  {
    id: '3',
    name: 'コンサルティングセッション',
    slug: 'consulting-session',
    description: '1対1のコンサルティング（60分）',
    type: 'SERVICE',
    status: 'ACTIVE',
    defaultPrice: 30000,
    currency: 'JPY',
    sales: 45,
    createdAt: '2024-02-15',
  },
  {
    id: '4',
    name: '新商品（準備中）',
    slug: 'new-product-draft',
    description: '開発中の新商品',
    type: 'DIGITAL',
    status: 'DRAFT',
    createdAt: '2024-03-01',
    currency: 'JPY',
    sales: 0,
  },
]

const productTypeLabels: Record<string, string> = {
  DIGITAL: 'デジタル',
  PHYSICAL: '物理商品',
  SERVICE: 'サービス',
  SUBSCRIPTION: 'サブスク',
  BUNDLE: 'バンドル',
}

const productTypeColors: Record<string, string> = {
  DIGITAL: 'bg-blue-500/20 text-blue-400',
  PHYSICAL: 'bg-orange-500/20 text-orange-400',
  SERVICE: 'bg-purple-500/20 text-purple-400',
  SUBSCRIPTION: 'bg-green-500/20 text-green-400',
  BUNDLE: 'bg-pink-500/20 text-pink-400',
}

const statusLabels: Record<string, string> = {
  DRAFT: '下書き',
  ACTIVE: '公開中',
  ARCHIVED: 'アーカイブ',
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-slate-500/20 text-slate-400',
  ACTIVE: 'bg-emerald-500/20 text-emerald-400',
  ARCHIVED: 'bg-red-500/20 text-red-400',
}

export default function ProductsPage() {
  const [products] = useState<Product[]>(mockProducts)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    type: 'DIGITAL' as const,
  })

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.slug.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus
    const matchesType = filterType === 'all' || product.type === filterType
    return matchesSearch && matchesStatus && matchesType
  })

  const formatPrice = (amount?: number, currency: string = 'JPY') => {
    if (amount === undefined) return '価格未設定'
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleCreateProduct = () => {
    // API call would go here
    console.log('Creating product:', newProduct)
    setIsCreateOpen(false)
    setNewProduct({ name: '', description: '', type: 'DIGITAL' })
  }

  const totalRevenue = products.reduce((sum, p) => sum + (p.defaultPrice || 0) * p.sales, 0)
  const totalSales = products.reduce((sum, p) => sum + p.sales, 0)
  const activeProducts = products.filter(p => p.status === 'ACTIVE').length

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">商品管理</h1>
            <p className="text-slate-400 mt-1">商品の作成、編集、価格設定を管理します</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                新規商品
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800">
              <DialogHeader>
                <DialogTitle className="text-white">新規商品を作成</DialogTitle>
                <DialogDescription className="text-slate-400">
                  商品の基本情報を入力してください
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-300">商品名</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="例: セールスファネル構築講座"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-slate-300">商品タイプ</Label>
                  <Select
                    value={newProduct.type}
                    onValueChange={(value) => setNewProduct({ ...newProduct, type: value as typeof newProduct.type })}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="DIGITAL">デジタル商品</SelectItem>
                      <SelectItem value="PHYSICAL">物理商品</SelectItem>
                      <SelectItem value="SERVICE">サービス</SelectItem>
                      <SelectItem value="SUBSCRIPTION">サブスクリプション</SelectItem>
                      <SelectItem value="BUNDLE">バンドル</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-300">説明</Label>
                  <Textarea
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    placeholder="商品の説明を入力..."
                    className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>
                  キャンセル
                </Button>
                <Button
                  onClick={handleCreateProduct}
                  disabled={!newProduct.name}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  作成
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Package className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">総商品数</p>
                <p className="text-2xl font-bold text-white">{products.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/20 rounded-lg">
                <Eye className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">公開中</p>
                <p className="text-2xl font-bold text-white">{activeProducts}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">総販売数</p>
                <p className="text-2xl font-bold text-white">{totalSales}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/20 rounded-lg">
                <DollarSign className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">総売上</p>
                <p className="text-2xl font-bold text-white">{formatPrice(totalRevenue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 mb-6">
          <div className="p-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="商品を検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px] bg-slate-800 border-slate-700 text-white">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="ステータス" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="ACTIVE">公開中</SelectItem>
                  <SelectItem value="DRAFT">下書き</SelectItem>
                  <SelectItem value="ARCHIVED">アーカイブ</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[140px] bg-slate-800 border-slate-700 text-white">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="タイプ" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="DIGITAL">デジタル</SelectItem>
                  <SelectItem value="PHYSICAL">物理商品</SelectItem>
                  <SelectItem value="SERVICE">サービス</SelectItem>
                  <SelectItem value="SUBSCRIPTION">サブスク</SelectItem>
                  <SelectItem value="BUNDLE">バンドル</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden hover:border-slate-700 transition-colors"
            >
              {/* Product Image */}
              <div className="aspect-video bg-slate-800 relative">
                {product.imageUrl ? (
                  <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                    <Package className="h-12 w-12 text-slate-600" />
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                    <ImagePlus className="h-12 w-12 text-slate-600" />
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge className={statusColors[product.status]}>
                    {statusLabels[product.status]}
                  </Badge>
                </div>
                <div className="absolute top-3 right-3">
                  <Badge className={productTypeColors[product.type]}>
                    {productTypeLabels[product.type]}
                  </Badge>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{product.name}</h3>
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                      {product.description || '説明なし'}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                      <DropdownMenuLabel className="text-slate-400">アクション</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-slate-700" />
                      <DropdownMenuItem className="text-slate-300 focus:bg-slate-700">
                        <Edit className="h-4 w-4 mr-2" />
                        編集
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-slate-300 focus:bg-slate-700">
                        <Copy className="h-4 w-4 mr-2" />
                        複製
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-slate-300 focus:bg-slate-700">
                        <Eye className="h-4 w-4 mr-2" />
                        プレビュー
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-slate-300 focus:bg-slate-700">
                        <Archive className="h-4 w-4 mr-2" />
                        アーカイブ
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-slate-700" />
                      <DropdownMenuItem className="text-red-400 focus:bg-slate-700">
                        <Trash2 className="h-4 w-4 mr-2" />
                        削除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-white">
                      {formatPrice(product.defaultPrice, product.currency)}
                    </p>
                    {product.type === 'SUBSCRIPTION' && (
                      <p className="text-xs text-slate-400">/月</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-300">{product.sales} 販売</p>
                    <p className="text-xs text-slate-500">
                      {formatPrice((product.defaultPrice || 0) * product.sales, product.currency)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">商品が見つかりません</h3>
            <p className="text-slate-400 mb-6">
              検索条件に一致する商品がありません
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('')
                setFilterStatus('all')
                setFilterType('all')
              }}
            >
              フィルターをクリア
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
