'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ShoppingCart,
  Search,
  MoreHorizontal,
  Eye,
  RefreshCcw,
  XCircle,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Package,
  Filter,
  Download,
  Mail,
} from 'lucide-react'

interface OrderItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED'
  total: number
  currency: string
  items: OrderItem[]
  createdAt: string
  paidAt?: string
}

// Mock data
const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    customerName: '山田太郎',
    customerEmail: 'yamada@example.com',
    status: 'COMPLETED',
    total: 49800,
    currency: 'JPY',
    items: [
      { id: '1', name: 'セールスファネル構築マスター講座', quantity: 1, unitPrice: 49800, totalPrice: 49800 },
    ],
    createdAt: '2024-03-15T10:30:00Z',
    paidAt: '2024-03-15T10:31:00Z',
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    customerName: '佐藤花子',
    customerEmail: 'sato@example.com',
    status: 'PROCESSING',
    total: 9800,
    currency: 'JPY',
    items: [
      { id: '2', name: 'プレミアムメンバーシップ', quantity: 1, unitPrice: 9800, totalPrice: 9800 },
    ],
    createdAt: '2024-03-15T14:20:00Z',
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    customerName: '鈴木一郎',
    customerEmail: 'suzuki@example.com',
    status: 'PENDING',
    total: 30000,
    currency: 'JPY',
    items: [
      { id: '3', name: 'コンサルティングセッション', quantity: 1, unitPrice: 30000, totalPrice: 30000 },
    ],
    createdAt: '2024-03-15T16:45:00Z',
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-004',
    customerName: '田中美咲',
    customerEmail: 'tanaka@example.com',
    status: 'REFUNDED',
    total: 49800,
    currency: 'JPY',
    items: [
      { id: '4', name: 'セールスファネル構築マスター講座', quantity: 1, unitPrice: 49800, totalPrice: 49800 },
    ],
    createdAt: '2024-03-14T09:15:00Z',
    paidAt: '2024-03-14T09:16:00Z',
  },
  {
    id: '5',
    orderNumber: 'ORD-2024-005',
    customerName: '高橋健太',
    customerEmail: 'takahashi@example.com',
    status: 'FAILED',
    total: 59600,
    currency: 'JPY',
    items: [
      { id: '5', name: 'セールスファネル構築マスター講座', quantity: 1, unitPrice: 49800, totalPrice: 49800 },
      { id: '6', name: 'プレミアムメンバーシップ', quantity: 1, unitPrice: 9800, totalPrice: 9800 },
    ],
    createdAt: '2024-03-13T11:00:00Z',
  },
]

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: { label: '保留中', color: 'bg-amber-500/20 text-amber-400', icon: <Clock className="h-3 w-3" /> },
  PROCESSING: { label: '処理中', color: 'bg-blue-500/20 text-blue-400', icon: <RefreshCcw className="h-3 w-3" /> },
  COMPLETED: { label: '完了', color: 'bg-emerald-500/20 text-emerald-400', icon: <CheckCircle className="h-3 w-3" /> },
  FAILED: { label: '失敗', color: 'bg-red-500/20 text-red-400', icon: <AlertCircle className="h-3 w-3" /> },
  REFUNDED: { label: '返金済', color: 'bg-purple-500/20 text-purple-400', icon: <RefreshCcw className="h-3 w-3" /> },
  CANCELLED: { label: 'キャンセル', color: 'bg-slate-500/20 text-slate-400', icon: <XCircle className="h-3 w-3" /> },
}

export default function OrdersPage() {
  const [orders] = useState<Order[]>(mockOrders)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const formatPrice = (amount: number, currency: string = 'JPY') => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString))
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailOpen(true)
  }

  // Stats
  const completedOrders = orders.filter(o => o.status === 'COMPLETED')
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0)
  const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0
  const pendingOrders = orders.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING').length

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">注文管理</h1>
            <p className="text-slate-400 mt-1">注文の確認、処理、返金管理を行います</p>
          </div>
          <Button variant="outline" className="border-slate-700 text-slate-300">
            <Download className="h-4 w-4 mr-2" />
            エクスポート
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">総注文数</p>
                <p className="text-2xl font-bold text-white">{orders.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/20 rounded-lg">
                <DollarSign className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">総売上</p>
                <p className="text-2xl font-bold text-white">{formatPrice(totalRevenue)}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">平均注文額</p>
                <p className="text-2xl font-bold text-white">{formatPrice(avgOrderValue)}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/20 rounded-lg">
                <Package className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">処理待ち</p>
                <p className="text-2xl font-bold text-white">{pendingOrders}</p>
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
                placeholder="注文番号、顧客名、メールで検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-white">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="ステータス" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="PENDING">保留中</SelectItem>
                <SelectItem value="PROCESSING">処理中</SelectItem>
                <SelectItem value="COMPLETED">完了</SelectItem>
                <SelectItem value="FAILED">失敗</SelectItem>
                <SelectItem value="REFUNDED">返金済</SelectItem>
                <SelectItem value="CANCELLED">キャンセル</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-800/50">
                <TableHead className="text-slate-400">注文番号</TableHead>
                <TableHead className="text-slate-400">顧客</TableHead>
                <TableHead className="text-slate-400">ステータス</TableHead>
                <TableHead className="text-slate-400">金額</TableHead>
                <TableHead className="text-slate-400">日時</TableHead>
                <TableHead className="text-slate-400 w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const status = statusConfig[order.status]
                return (
                  <TableRow
                    key={order.id}
                    className="border-slate-800 hover:bg-slate-800/50 cursor-pointer"
                    onClick={() => handleViewOrder(order)}
                  >
                    <TableCell className="font-medium text-white">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-white">{order.customerName}</p>
                        <p className="text-sm text-slate-400">{order.customerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${status.color} gap-1`}>
                        {status.icon}
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white font-medium">
                      {formatPrice(order.total, order.currency)}
                    </TableCell>
                    <TableCell className="text-slate-400">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                          <DropdownMenuLabel className="text-slate-400">アクション</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-slate-700" />
                          <DropdownMenuItem
                            className="text-slate-300 focus:bg-slate-700"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewOrder(order)
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            詳細を表示
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-slate-300 focus:bg-slate-700">
                            <Mail className="h-4 w-4 mr-2" />
                            メール送信
                          </DropdownMenuItem>
                          {order.status === 'COMPLETED' && (
                            <DropdownMenuItem className="text-slate-300 focus:bg-slate-700">
                              <RefreshCcw className="h-4 w-4 mr-2" />
                              返金処理
                            </DropdownMenuItem>
                          )}
                          {(order.status === 'PENDING' || order.status === 'PROCESSING') && (
                            <DropdownMenuItem className="text-red-400 focus:bg-slate-700">
                              <XCircle className="h-4 w-4 mr-2" />
                              キャンセル
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {filteredOrders.length === 0 && (
            <div className="text-center py-16">
              <ShoppingCart className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">注文が見つかりません</h3>
              <p className="text-slate-400">
                検索条件に一致する注文がありません
              </p>
            </div>
          )}
        </div>

        {/* Order Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="bg-slate-900 border-slate-800 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">
                注文詳細 - {selectedOrder?.orderNumber}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                {selectedOrder && formatDate(selectedOrder.createdAt)}
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">ステータス</span>
                  <Badge className={statusConfig[selectedOrder.status].color}>
                    {statusConfig[selectedOrder.status].icon}
                    <span className="ml-1">{statusConfig[selectedOrder.status].label}</span>
                  </Badge>
                </div>

                {/* Customer Info */}
                <div className="bg-slate-800 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-slate-400 mb-2">顧客情報</h4>
                  <p className="text-white">{selectedOrder.customerName}</p>
                  <p className="text-slate-400">{selectedOrder.customerEmail}</p>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-3">注文商品</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between bg-slate-800 rounded-lg p-3"
                      >
                        <div>
                          <p className="text-white">{item.name}</p>
                          <p className="text-sm text-slate-400">
                            {formatPrice(item.unitPrice, selectedOrder.currency)} × {item.quantity}
                          </p>
                        </div>
                        <p className="text-white font-medium">
                          {formatPrice(item.totalPrice, selectedOrder.currency)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-slate-800 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-white">合計</span>
                    <span className="text-xl font-bold text-white">
                      {formatPrice(selectedOrder.total, selectedOrder.currency)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 justify-end">
                  {selectedOrder.status === 'COMPLETED' && (
                    <Button variant="outline" className="border-slate-700 text-slate-300">
                      <RefreshCcw className="h-4 w-4 mr-2" />
                      返金処理
                    </Button>
                  )}
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Mail className="h-4 w-4 mr-2" />
                    顧客にメール
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
