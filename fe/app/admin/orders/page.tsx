'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import {
  Search,
  ShoppingCart,
  CheckCircle,
  Truck,
  Package,
  Boxes,
  FileText,
  Filter,
  Printer,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import { ORDER_STATUS_MAP, formatCompactPrice, formatDateTime } from '@/lib/admin-data'
import type { OrderStatus } from '@/lib/admin-data'
import { useOrderStore } from '@/lib/order-store'

export default function OrdersPage() {
  const { orders, syncOrders, updateOrderStatus } = useOrderStore()

  // Combobox Filters State
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'total_desc' | 'total_asc'>('newest')
  const [pageSize, setPageSize] = useState<number>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)

  const [actionMsg, setActionMsg] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(orders.length === 0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders', { cache: 'no-store' })
      const data = await res.json()
      if (data?.orders && Array.isArray(data.orders)) {
        syncOrders(data.orders)
      }
    } catch (err) {
      console.error('Failed to sync server orders:', err)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    const timer = setInterval(() => {
      fetchOrders()
    }, 15000)
    return () => clearInterval(timer)
  }, [])

  const handleManualRefresh = () => {
    setIsRefreshing(true)
    fetchOrders()
  }

  // Sync trạng thái đơn hàng lên Backend Heroku PostgreSQL
  const syncStatusToBackend = async (orderId: string, status: string) => {
    try {
      const code = orderId.startsWith('#') ? orderId : `#${orderId}`
      await fetch(`/api/orders/${encodeURIComponent(code)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
    } catch (e) {
      console.warn('Backend status sync warning:', e)
    }
  }

  const handleQuickConfirm = (orderId: string) => {
    updateOrderStatus(orderId, 'confirmed', 'Admin đã bấm xác nhận đơn hàng')
    syncStatusToBackend(orderId, 'confirmed')
    setActionMsg(`✓ Đã xác nhận đơn hàng ${orderId}`)
    setTimeout(() => setActionMsg(null), 3500)
  }

  const handleQuickDispatch = async (order: any) => {
    setProcessingId(order.id)
    try {
      const res = await fetch('/api/inventory/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          items: order.items,
          note: `Xuất kho đơn hàng ${order.id} từ danh sách`,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        updateOrderStatus(
          order.id,
          'shipping',
          'Đã xuất kho thành công. Sản phẩm đã trừ tồn kho và bắt đầu giao hàng.'
        )
        syncStatusToBackend(order.id, 'shipping')

        let outMsg = ''
        if (data.dispatchedProducts && Array.isArray(data.dispatchedProducts)) {
          const outList = data.dispatchedProducts.filter((p: any) => p.isOutOfStock)
          if (outList.length > 0) {
            outMsg = ` (Lưu ý: ${outList.map((p: any) => p.name).join(', ')} đã hết hàng trên web)`
          }
        }
        setActionMsg(`✓ Đã xuất kho đơn ${order.id} và trừ tồn kho! Chuyển sang "Đang giao"${outMsg}`)
      } else {
        setActionMsg(`Lỗi xuất kho: ${data.error || 'Vui lòng thử lại'}`)
      }
    } catch (err: any) {
      setActionMsg(`Lỗi kết nối: ${err.message}`)
    } finally {
      setProcessingId(null)
      setTimeout(() => setActionMsg(null), 5000)
    }
  }

  const handleQuickDelivered = (orderId: string) => {
    updateOrderStatus(orderId, 'delivered', 'Admin đã kiểm tra và bấm xác nhận giao hàng thành công')
    syncStatusToBackend(orderId, 'delivered')
    setActionMsg(`✓ Đã xác nhận đơn hàng ${orderId} đã giao thành công!`)
    setTimeout(() => setActionMsg(null), 3500)
  }

  // Filter & Sort
  const filtered = useMemo(() => {
    const list = orders.filter((o) => {
      // Search
      const q = search.toLowerCase().trim()
      const matchSearch =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        o.customerEmail.toLowerCase().includes(q)

      if (!matchSearch) return false

      // Status
      if (statusFilter !== 'all' && o.status !== statusFilter) return false

      // Payment
      if (paymentFilter !== 'all') {
        const pMethod = (o.paymentMethod || '').toLowerCase()
        if (paymentFilter === 'sepay' && !pMethod.includes('sepay') && !pMethod.includes('vietqr')) return false
        if (paymentFilter === 'momo' && !pMethod.includes('momo')) return false
        if (paymentFilter === 'cod' && !pMethod.includes('cod') && !pMethod.includes('tiền mặt')) return false
      }

      return true
    })

    // Sort
    list.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      if (sortBy === 'newest') return dateB - dateA
      if (sortBy === 'oldest') return dateA - dateB
      if (sortBy === 'total_desc') return b.total - a.total
      if (sortBy === 'total_asc') return a.total - b.total
      return 0
    })

    return list
  }, [orders, search, statusFilter, paymentFilter, sortBy])

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize) || 1
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, currentPage, pageSize])

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [search, statusFilter, paymentFilter, sortBy, pageSize])

  return (
    <>
      <div className="admin-page-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>Đơn hàng</h1>
          <p>Quản lý và xử lý tiến trình {orders.length} đơn hàng</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="admin-btn admin-btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
            title="Làm mới danh sách từ máy chủ"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'Đang tải...' : 'Làm mới'}</span>
          </button>
          <Link
            href="/admin/inventory"
            className="admin-btn admin-btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
          >
            <Boxes size={15} /> Kiểm tra tồn kho ↗
          </Link>
        </div>
      </div>

      {actionMsg && (
        <div
          style={{
            padding: '12px 18px',
            background: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid rgba(34, 197, 94, 0.4)',
            borderRadius: 10,
            color: '#4ade80',
            fontSize: 13,
            fontWeight: 500,
            marginBottom: 20,
          }}
        >
          {actionMsg}
        </div>
      )}

      {/* COMBOBOX FILTER CONTROLS */}
      <div className="admin-combobox-bar">
        {/* Search */}
        <div style={{ flex: '1 1 240px', minWidth: 200, position: 'relative' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--admin-text-muted)',
            }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã ĐH, tên khách, số điện thoại..."
            className="admin-input"
            style={{ paddingLeft: 36, height: 38 }}
          />
        </div>

        {/* Combobox 1: Trạng thái */}
        <div className="admin-combobox-item">
          <span className="admin-combobox-label">Trạng thái:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="admin-combobox-select"
          >
            <option value="all">Tất cả đơn ({orders.length})</option>
            <option value="pending">Chờ xử lý ({orders.filter((o) => o.status === 'pending').length})</option>
            <option value="confirmed">Đã xác nhận ({orders.filter((o) => o.status === 'confirmed').length})</option>
            <option value="shipping">Đang giao ({orders.filter((o) => o.status === 'shipping').length})</option>
            <option value="delivered">Đã giao ({orders.filter((o) => o.status === 'delivered').length})</option>
            <option value="cancelled">Đã hủy ({orders.filter((o) => o.status === 'cancelled').length})</option>
          </select>
        </div>

        {/* Combobox 2: Cổng thanh toán */}
        <div className="admin-combobox-item">
          <span className="admin-combobox-label">Thanh toán:</span>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="admin-combobox-select"
          >
            <option value="all">Tất cả cổng</option>
            <option value="sepay">Chuyển khoản SePay (VietQR)</option>
            <option value="momo">Ví MoMo</option>
            <option value="cod">COD (Tiền mặt)</option>
          </select>
        </div>

        {/* Combobox 3: Sắp xếp */}
        <div className="admin-combobox-item">
          <span className="admin-combobox-label">Sắp xếp:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="admin-combobox-select"
          >
            <option value="newest">Ngày đặt: Mới nhất trước</option>
            <option value="oldest">Ngày đặt: Cũ nhất trước</option>
            <option value="total_desc">Giá trị: Cao ➜ Thấp</option>
            <option value="total_asc">Giá trị: Thấp ➜ Cao</option>
          </select>
        </div>

        {/* Combobox 4: Dòng / trang */}
        <div className="admin-combobox-item">
          <span className="admin-combobox-label">Hiển thị:</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(parseInt(e.target.value))}
            className="admin-combobox-select"
          >
            <option value={10}>10 đơn / trang</option>
            <option value={25}>25 đơn / trang</option>
            <option value={50}>50 đơn / trang</option>
            <option value={100}>Tất cả</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table" style={{ minWidth: 1000 }}>
            <thead>
              <tr>
                <th style={{ width: 90 }}>Mã ĐH</th>
                <th style={{ width: 140 }}>Thời gian</th>
                <th>Khách hàng</th>
                <th>Điện thoại / Địa chỉ</th>
                <th>Sản phẩm</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'center', width: 200 }}>Thao tác kho &amp; Vận chuyển</th>
                <th style={{ textAlign: 'right', width: 110 }}>Hóa đơn</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '48px 0', color: 'var(--admin-text-secondary)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                      <Loader2 className="animate-spin text-amber-400" size={28} />
                      <span style={{ fontSize: 13 }}>Đang đồng bộ đơn hàng từ máy chủ...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '36px 0', color: 'var(--admin-text-secondary)' }}>
                    Không có đơn hàng nào khớp với bộ lọc.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => {
                  const status = ORDER_STATUS_MAP[order.status] || ORDER_STATUS_MAP.pending
                  const isProcessing = processingId === order.id

                  return (
                    <tr key={order.id}>
                      <td>
                        <Link
                          href={`/admin/orders/${order.id.replace('#', '')}`}
                          style={{
                            fontWeight: 700,
                            color: '#ffffff',
                            textDecoration: 'none',
                            fontFamily: 'monospace',
                            fontSize: 14,
                          }}
                        >
                          {order.id}
                        </Link>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--admin-text-secondary)', whiteSpace: 'nowrap' }}>
                        <div style={{ color: 'var(--admin-text)', fontWeight: 600 }}>
                          {order.createdAt ? new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--admin-text-muted)', marginTop: 2 }}>
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}
                        </div>
                      </td>
                      <td style={{ color: 'var(--admin-text)', fontWeight: 600 }}>
                        <div>{order.customerName}</div>
                        <div style={{ fontSize: 11, color: 'var(--admin-text-secondary)', fontWeight: 400 }}>
                          {order.customerEmail}
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--admin-text-secondary)', maxWidth: 220 }}>
                        <div style={{ fontWeight: 600, color: 'var(--admin-text)' }}>{order.customerPhone}</div>
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {order.customerAddress}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ display: 'flex', gap: 4 }}>
                            {order.items.slice(0, 2).map((item, idx) => (
                              <div
                                key={idx}
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 8,
                                  overflow: 'hidden',
                                  border: '1px solid var(--admin-border)',
                                  background: '#18181b',
                                }}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={
                                    item.image
                                      ? (item.image.startsWith('http') || item.image.startsWith('/')
                                          ? item.image
                                          : `/${item.image}`)
                                      : '/placeholder.svg'
                                  }
                                  alt=""
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder.svg'
                                  }}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              </div>
                            ))}
                          </div>
                          <span style={{ fontSize: 12, color: 'var(--admin-text-secondary)' }}>
                            {order.items.length} món
                          </span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 700, color: '#ffffff' }}>
                        {formatCompactPrice(order.total)}
                      </td>
                      <td>
                        <span className="status-badge" style={{ background: status.bg, color: status.color, fontWeight: 600 }}>
                          <span className="status-dot" style={{ background: status.color }} />
                          {status.label}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {order.status === 'pending' ? (
                          <button
                            type="button"
                            onClick={() => handleQuickConfirm(order.id)}
                            className="btn-action-confirm"
                            title="Xác nhận đơn hàng"
                          >
                            <CheckCircle size={13} /> Xác nhận
                          </button>
                        ) : order.status === 'confirmed' ? (
                          <button
                            type="button"
                            onClick={() => handleQuickDispatch(order)}
                            disabled={isProcessing}
                            className="btn-action-dispatch"
                            title="Xuất kho & chuyển sang trạng thái đang giao"
                          >
                            {isProcessing ? 'Đang trừ kho...' : '📦 Xuất kho'}
                          </button>
                        ) : order.status === 'shipping' ? (
                          <button
                            type="button"
                            onClick={() => handleQuickDelivered(order.id)}
                            className="btn-action-deliver"
                            title="Admin xác nhận đã giao hàng thành công"
                          >
                            <Truck size={13} /> ✓ Bấm Đã giao
                          </button>
                        ) : order.status === 'delivered' ? (
                          <span style={{ fontSize: 12, color: '#4ade80', fontWeight: 600 }}>
                            ✓ Đã giao xong
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--admin-text-secondary)' }}>—</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <a
                          href={`/invoice?id=${encodeURIComponent(order.id)}&print=1`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-action-invoice"
                          title="Xem hóa đơn & In / Xuất PDF"
                        >
                          <Printer size={12} /> HĐ PDF ↗
                        </a>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        <div className="admin-pagination-bar">
          <div>
            Đang hiển thị{' '}
            <strong style={{ color: '#fff' }}>
              {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} –{' '}
              {Math.min(currentPage * pageSize, filtered.length)}
            </strong>{' '}
            trên tổng số <strong style={{ color: '#fff' }}>{filtered.length}</strong> đơn hàng
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="admin-pagination-btn"
            >
              ← Trang trước
            </button>
            <span style={{ fontSize: 12, color: 'var(--admin-gold)' }}>
              Trang {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="admin-pagination-btn"
            >
              Trang sau →
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
