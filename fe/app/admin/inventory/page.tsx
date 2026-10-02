'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Boxes,
  Plus,
  Minus,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  History,
  ArrowDownLeft,
  ArrowUpRight,
  Truck,
  Filter,
  Package,
} from 'lucide-react'
import { formatPrice, API_BASE_URL } from '@/lib/products'
import { fetchWithAuth } from '@/lib/api'

type InventoryLog = {
  id: number
  product_id?: number
  product_name: string
  product_sku?: string
  order_id?: string
  type: string
  change_qty: number
  previous_qty?: number
  new_qty?: number
  note?: string
  created_at: string
}

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([])
  const [stats, setStats] = useState({
    total_products: 0,
    total_units: 0,
    out_of_stock_count: 0,
    low_stock_count: 0,
    in_stock_count: 0,
  })
  const [logs, setLogs] = useState<InventoryLog[]>([])
  const [loading, setLoading] = useState(true)

  // Combobox Filter States
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'qty_asc' | 'qty_desc' | 'name_asc' | 'price_desc' | 'price_asc'>('qty_asc')
  const [pageSize, setPageSize] = useState<number>(15)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [activeView, setActiveView] = useState<'inventory' | 'logs'>('inventory')

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
  const [adjustType, setAdjustType] = useState<'import' | 'export' | 'set'>('import')
  const [adjustAmount, setAdjustAmount] = useState<number>(1)
  const [adjustNote, setAdjustNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchWithAuth('/api/inventory', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        if (data.products && Array.isArray(data.products)) {
          setProducts(data.products)
        }
        if (data.stats) {
          setStats(data.stats)
        }
      } else {
        const pRes = await fetch(`${API_BASE_URL}/products?limit=100`)
        if (pRes.ok) {
          const pData = await pRes.json()
          const list = pData.products || pData
          setProducts(list)
        }
      }

      const logRes = await fetchWithAuth('/api/inventory/logs', { cache: 'no-store' })
      if (logRes.ok) {
        const logData = await logRes.json()
        if (logData.logs) {
          setLogs(logData.logs)
        }
      }
    } catch (err) {
      console.error('Inventory load error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Extract unique categories for combobox
  const categories = useMemo(() => {
    const set = new Set<string>()
    products.forEach((p) => {
      const cat = p.category_name || p.category
      if (cat) set.add(cat)
    })
    return Array.from(set)
  }, [products])

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    const list = products.filter((p) => {
      const matchSearch =
        search === '' ||
        (p.name && p.name.toLowerCase().includes(search.toLowerCase())) ||
        (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))

      if (!matchSearch) return false

      const qty = parseInt(p.quantity ?? p.stock ?? 0)
      if (statusFilter === 'out_of_stock' && qty > 0) return false
      if (statusFilter === 'in_stock' && qty <= 0) return false

      if (categoryFilter !== 'all') {
        const cat = p.category_name || p.category
        if (cat !== categoryFilter) return false
      }

      return true
    })

    // Sort
    list.sort((a, b) => {
      const qtyA = parseInt(a.quantity ?? a.stock ?? 0)
      const qtyB = parseInt(b.quantity ?? b.stock ?? 0)
      const priceA = parseFloat(a.sale_price ?? a.price ?? 0)
      const priceB = parseFloat(b.sale_price ?? b.price ?? 0)

      if (sortBy === 'qty_asc') return qtyA - qtyB
      if (sortBy === 'qty_desc') return qtyB - qtyA
      if (sortBy === 'price_desc') return priceB - priceA
      if (sortBy === 'price_asc') return priceA - priceB
      if (sortBy === 'name_asc') return (a.name || '').localeCompare(b.name || '')
      return 0
    })

    return list
  }, [products, search, statusFilter, categoryFilter, sortBy])

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredProducts.slice(start, start + pageSize)
  }, [filteredProducts, currentPage, pageSize])

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [search, statusFilter, categoryFilter, pageSize, sortBy])

  const openAdjustModal = (product: any, type: 'import' | 'export' | 'set') => {
    setSelectedProduct(product)
    setAdjustType(type)
    setAdjustAmount(type === 'set' ? product.quantity || 0 : 5)
    setAdjustNote(
      type === 'import'
        ? 'Nhập hàng bổ sung từ xưởng thủ công'
        : type === 'export'
          ? 'Xuất điều chỉnh / xuất trưng bày'
          : 'Cập nhật lại số lượng tồn thực tế',
    )
    setModalOpen(true)
  }

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct) return

    setSubmitting(true)
    try {
      let change = 0
      let newQuantity: number | undefined

      if (adjustType === 'import') {
        change = Math.abs(adjustAmount)
      } else if (adjustType === 'export') {
        change = -Math.abs(adjustAmount)
      } else {
        newQuantity = Math.max(0, adjustAmount)
      }

      const res = await fetchWithAuth('/api/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          change,
          newQuantity,
          type: adjustType,
          note: adjustNote.trim(),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setNotification(`✓ ${data.message || 'Đã cập nhật tồn kho thành công'}`)
        setModalOpen(false)
        loadData()
      } else {
        const data = await res.json().catch(() => ({}))
        setNotification(`Lỗi: ${data.error || 'Không thể cập nhật tồn kho'}`)
      }
    } catch (err: any) {
      setNotification(`Lỗi kết nối: ${err.message}`)
    } finally {
      setSubmitting(false)
      setTimeout(() => setNotification(null), 4000)
    }
  }

  return (
    <>
      {/* Page Heading */}
      <div className="admin-page-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>Kho hàng &amp; Tồn kho</h1>
          <p>Quản lý số lượng tồn, xuất kho theo đơn hàng và nhập hàng mới</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={loadData}
            className="admin-btn admin-btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Đồng bộ kho</span>
          </button>
          <Link
            href="/admin/orders"
            className="admin-btn admin-btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
          >
            <Truck size={14} />
            <span>Xử lý đơn hàng ↗</span>
          </Link>
        </div>
      </div>

      {notification && (
        <div
          style={{
            padding: '12px 18px',
            background: notification.startsWith('Lỗi') ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
            border: notification.startsWith('Lỗi') ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(34, 197, 94, 0.4)',
            borderRadius: 10,
            color: notification.startsWith('Lỗi') ? '#f87171' : '#4ade80',
            fontSize: 13,
            fontWeight: 500,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          {notification.startsWith('Lỗi') ? <XCircle size={18} /> : <CheckCircle2 size={18} />} {notification}
        </div>
      )}

      {/* 4 Gorgeous Stat Cards */}
      <div className="stat-cards-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Tổng số mặt hàng</span>
            <div className="stat-icon">
              <Boxes size={20} />
            </div>
          </div>
          <div className="stat-value">{stats.total_products || products.length}</div>
          <div className="stat-trend neutral">Mã trang sức &amp; phụ kiện</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Tổng sản phẩm tồn kho</span>
            <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>
              <Package size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#60a5fa' }}>
            {stats.total_units || products.reduce((acc, p) => acc + parseInt(p.quantity || 0), 0)}
          </div>
          <div className="stat-trend neutral">Số lượng có sẵn trong kho</div>
        </div>

        <div
          className="stat-card"
          style={{ cursor: 'pointer', borderColor: statusFilter === 'in_stock' ? '#4ade80' : undefined }}
          onClick={() => {
            setStatusFilter('in_stock')
            setActiveView('inventory')
          }}
        >
          <div className="stat-header">
            <span className="stat-label" style={{ color: '#4ade80' }}>
              Còn hàng sẵn sàng (&gt; 0)
            </span>
            <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#4ade80' }}>
            {products.filter((p) => parseInt(p.quantity ?? p.stock ?? 0) > 0).length}
          </div>
          <div className="stat-trend neutral" style={{ color: '#4ade80' }}>
            Bao gồm tác phẩm độc bản 1 chiếc
          </div>
        </div>

        <div
          className="stat-card"
          style={{ cursor: 'pointer', borderColor: statusFilter === 'out_of_stock' ? '#f87171' : undefined }}
          onClick={() => {
            setStatusFilter('out_of_stock')
            setActiveView('inventory')
          }}
        >
          <div className="stat-header">
            <span className="stat-label" style={{ color: '#f87171' }}>
              Đã hết hàng (0)
            </span>
            <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}>
              <XCircle size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#f87171' }}>
            {stats.out_of_stock_count}
          </div>
          <div className="stat-trend neutral" style={{ color: '#f87171' }}>
            Web đang báo Hết hàng
          </div>
        </div>
      </div>

      {/* Main Mode Toggle: Danh sách kho vs Lịch sử xuất nhập */}
      <div className="admin-tabs" style={{ marginBottom: 16 }}>
        <button
          type="button"
          className={`admin-tab ${activeView === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveView('inventory')}
        >
          <Boxes size={14} style={{ display: 'inline', marginRight: 6 }} />
          Bảng kiểm kê kho hàng
          <span className="tab-count">{filteredProducts.length}</span>
        </button>
        <button
          type="button"
          className={`admin-tab ${activeView === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveView('logs')}
        >
          <History size={14} style={{ display: 'inline', marginRight: 6 }} />
          Lịch sử xuất - nhập kho &amp; Trừ kho đơn hàng
          <span className="tab-count">{logs.length}</span>
        </button>
      </div>

      {activeView === 'inventory' ? (
        <>
          {/* COMBOBOX FILTER BAR */}
          <div className="admin-combobox-bar">
            {/* Search Input */}
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
                placeholder="Tìm tên hoặc mã SKU..."
                className="admin-input"
                style={{ paddingLeft: 36, height: 38 }}
              />
            </div>

            {/* Combobox 1: Trạng thái kho */}
            <div className="admin-combobox-item">
              <span className="admin-combobox-label">Tồn kho:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="admin-combobox-select"
              >
                <option value="all">Tất cả ({products.length})</option>
                <option value="in_stock">Còn hàng &gt; 0 ({products.filter((p) => parseInt(p.quantity ?? p.stock ?? 0) > 0).length})</option>
                <option value="out_of_stock">Đã hết hàng = 0 ({stats.out_of_stock_count})</option>
              </select>
            </div>

            {/* Combobox 2: Danh mục */}
            <div className="admin-combobox-item">
              <span className="admin-combobox-label">Danh mục:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="admin-combobox-select"
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
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
                <option value="qty_asc">Tồn kho: Thấp ➜ Cao (Hết hàng trước)</option>
                <option value="qty_desc">Tồn kho: Cao ➜ Thấp</option>
                <option value="name_asc">Tên sản phẩm (A-Z)</option>
                <option value="price_desc">Giá: Cao ➜ Thấp</option>
                <option value="price_asc">Giá: Thấp ➜ Cao</option>
              </select>
            </div>

            {/* Combobox 4: Số lượng dòng / trang */}
            <div className="admin-combobox-item">
              <span className="admin-combobox-label">Hiển thị:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(parseInt(e.target.value))}
                className="admin-combobox-select"
              >
                <option value={10}>10 dòng/trang</option>
                <option value={15}>15 dòng/trang</option>
                <option value={30}>30 dòng/trang</option>
                <option value={50}>50 dòng/trang</option>
                <option value={100}>Tất cả</option>
              </select>
            </div>
          </div>

          {/* TABLE SẢN PHẨM TRONG KHO */}
          <div className="admin-card">
            <div className="admin-table-wrap">
              <table className="admin-table" style={{ minWidth: 980 }}>
                <thead>
                  <tr>
                    <th style={{ width: 72 }}>Ảnh</th>
                    <th>Sản phẩm &amp; Mã SKU</th>
                    <th>Danh mục</th>
                    <th>Giá bán</th>
                    <th style={{ textAlign: 'center', width: 110 }}>Tồn kho</th>
                    <th style={{ width: 180 }}>Trạng thái web</th>
                    <th style={{ textAlign: 'right', width: 220 }}>Thao tác kho hàng</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '36px 0', color: 'var(--admin-text-secondary)' }}>
                        Không có sản phẩm nào phù hợp với bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    paginatedProducts.map((p) => {
                      const qty = parseInt(p.quantity ?? p.stock ?? 0)
                      const isOut = qty <= 0
                      const imgUrl =
                        p.images && p.images[0]?.url
                          ? p.images[0].url.startsWith('/')
                            ? p.images[0].url
                            : `/${p.images[0].url}`
                          : p.image || '/images/p-ring-sapphire.png'

                      return (
                        <tr key={p.id}>
                          <td>
                            <div
                              style={{
                                width: 50,
                                height: 50,
                                borderRadius: 8,
                                overflow: 'hidden',
                                border: '1px solid var(--admin-border)',
                                background: '#121215',
                              }}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={imgUrl}
                                alt={p.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </div>
                          </td>
                          <td className="cell-name">
                            <div style={{ fontWeight: 600, color: 'var(--admin-text)', fontSize: 13.5 }}>{p.name}</div>
                            <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--admin-gold)', marginTop: 2 }}>
                              {p.sku || `SP${p.id}`}
                            </div>
                          </td>
                          <td style={{ color: 'var(--admin-text-secondary)', fontSize: 12 }}>
                            {p.category_name || p.category || 'Phụ kiện'}
                          </td>
                          <td style={{ fontWeight: 600, color: 'var(--admin-text)' }}>
                            {formatPrice(parseFloat(p.sale_price || p.price || 0))}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span
                              style={{
                                fontFamily: 'monospace',
                                fontSize: 17,
                                fontWeight: 800,
                                padding: '4px 10px',
                                borderRadius: 6,
                                background: isOut
                                  ? 'rgba(239, 68, 68, 0.15)'
                                  : 'rgba(34, 197, 94, 0.12)',
                                color: isOut ? '#f87171' : '#4ade80',
                              }}
                            >
                              {qty}
                            </span>
                          </td>
                          <td>
                            {isOut ? (
                              <span
                                className="status-badge"
                                style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', fontWeight: 600 }}
                              >
                                <XCircle size={13} /> Hết hàng (Web báo hết)
                              </span>
                            ) : (
                              <span
                                className="status-badge"
                                style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', fontWeight: 600 }}
                              >
                                <CheckCircle2 size={13} /> Còn hàng sẵn sàng
                              </span>
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                              <button
                                type="button"
                                onClick={() => openAdjustModal(p, 'import')}
                                className="btn-action-import"
                                title="Nhập thêm hàng vào kho"
                              >
                                <Plus size={13} /> Nhập kho
                              </button>
                              <button
                                type="button"
                                onClick={() => openAdjustModal(p, 'export')}
                                disabled={qty <= 0}
                                className="btn-action-export"
                                title="Xuất bớt / trừ kho"
                              >
                                <Minus size={13} /> Xuất bớt
                              </button>
                              <button
                                type="button"
                                onClick={() => openAdjustModal(p, 'set')}
                                className="btn-action-edit"
                                title="Chỉnh sửa số tồn thực tế"
                              >
                                Sửa
                              </button>
                            </div>
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
                  {filteredProducts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} –{' '}
                  {Math.min(currentPage * pageSize, filteredProducts.length)}
                </strong>{' '}
                trên tổng số <strong style={{ color: '#fff' }}>{filteredProducts.length}</strong> sản phẩm
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
      ) : (
        /* LOGS TAB */
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Nhật ký Biến động &amp; Xuất kho đơn hàng ({logs.length})</h3>
            <span style={{ fontSize: 12, color: 'var(--admin-text-secondary)' }}>
              Tự động lưu vết khi Admin bấm Xuất kho hoặc Nhập hàng
            </span>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table" style={{ minWidth: 980 }}>
              <thead>
                <tr>
                  <th style={{ width: 160 }}>Thời gian</th>
                  <th style={{ width: 180 }}>Loại giao dịch</th>
                  <th>Sản phẩm</th>
                  <th style={{ width: 140 }}>Đơn hàng</th>
                  <th style={{ textAlign: 'center', width: 110 }}>Biến động</th>
                  <th style={{ textAlign: 'center', width: 90 }}>Tồn sau</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '36px 0', color: 'var(--admin-text-secondary)' }}>
                      Chưa có lịch sử xuất nhập kho.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const isDispatch = log.type === 'dispatch_order'
                    const isImport = log.change_qty > 0
                    return (
                      <tr key={log.id}>
                        <td style={{ fontSize: 12, color: 'var(--admin-text-secondary)' }}>
                          {new Date(log.created_at).toLocaleString('vi-VN')}
                        </td>
                        <td>
                          {isDispatch ? (
                            <span className="status-badge" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#c084fc', fontWeight: 600 }}>
                              <Truck size={12} /> Xuất kho theo đơn
                            </span>
                          ) : isImport ? (
                            <span className="status-badge" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', fontWeight: 600 }}>
                              <ArrowDownLeft size={12} /> Nhập thêm kho
                            </span>
                          ) : (
                            <span className="status-badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', fontWeight: 600 }}>
                              <ArrowUpRight size={12} /> Điều chỉnh kho
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--admin-text)' }}>{log.product_name}</div>
                          {log.product_sku && (
                            <div style={{ fontSize: 11, color: 'var(--admin-gold)', fontFamily: 'monospace' }}>
                              {log.product_sku}
                            </div>
                          )}
                        </td>
                        <td>
                          {log.order_id ? (
                            <Link
                              href={`/admin/orders/${log.order_id.replace('#', '')}`}
                              style={{ color: '#60a5fa', fontWeight: 700, textDecoration: 'none' }}
                            >
                              {log.order_id}
                            </Link>
                          ) : (
                            <span style={{ color: 'var(--admin-text-secondary)' }}>—</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center', fontFamily: 'monospace', fontWeight: 800, fontSize: 14 }}>
                          <span style={{ color: log.change_qty > 0 ? '#4ade80' : '#f87171' }}>
                            {log.change_qty > 0 ? `+${log.change_qty}` : log.change_qty}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', fontFamily: 'monospace', color: '#ffffff', fontWeight: 700 }}>
                          {log.new_qty !== undefined ? log.new_qty : '—'}
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--admin-text-secondary)' }}>
                          {log.note || '—'}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjust Inventory Modal */}
      {modalOpen && selectedProduct && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: 16,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 480,
              background: '#121215',
              border: '1px solid var(--admin-border-strong)',
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 20px 50px rgba(0,0,0,0.85)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', margin: 0 }}>
                {adjustType === 'import' ? '📦 Nhập thêm kho sản phẩm' : adjustType === 'export' ? '📤 Xuất bớt kho' : '⚙ Chỉnh sửa số tồn thực tế'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--admin-text-secondary)', cursor: 'pointer', fontSize: 20 }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '12px 16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 10, border: '1px solid var(--admin-border)', marginBottom: 20 }}>
              <div style={{ fontWeight: 600, color: '#ffffff', fontSize: 14 }}>{selectedProduct.name}</div>
              <div style={{ fontSize: 12, color: 'var(--admin-gold)', fontFamily: 'monospace', marginTop: 3 }}>
                Mã SKU: {selectedProduct.sku || `SP${selectedProduct.id}`} • Tồn kho hiện tại:{' '}
                <strong style={{ color: '#fff', fontSize: 14 }}>{selectedProduct.quantity || 0}</strong> cái
              </div>
            </div>

            <form onSubmit={handleAdjustSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--admin-text-secondary)', marginBottom: 6 }}>
                  {adjustType === 'set' ? 'Số lượng tồn mới' : 'Số lượng thay đổi'}
                </label>
                <input
                  type="number"
                  min={adjustType === 'set' ? 0 : 1}
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(parseInt(e.target.value) || 0)}
                  className="admin-input"
                  style={{ width: '100%', fontSize: 16, fontWeight: 700, fontFamily: 'monospace' }}
                  required
                />
                <div style={{ fontSize: 12, color: 'var(--admin-text-secondary)', marginTop: 6 }}>
                  Dự kiến tồn kho sau khi lưu:{' '}
                  <strong style={{ color: '#4ade80', fontSize: 13 }}>
                    {adjustType === 'import'
                      ? parseInt(selectedProduct.quantity || 0) + adjustAmount
                      : adjustType === 'export'
                        ? Math.max(0, parseInt(selectedProduct.quantity || 0) - adjustAmount)
                        : adjustAmount}
                  </strong>{' '}
                  cái
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--admin-text-secondary)', marginBottom: 6 }}>
                  Ghi chú phiếu kho
                </label>
                <textarea
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  className="admin-textarea"
                  style={{ width: '100%', height: 75 }}
                  placeholder="Lý do nhập kho / xuất kho..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="admin-btn admin-btn-secondary"
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={submitting}
                  style={{ fontWeight: 700 }}
                >
                  {submitting ? 'Đang cập nhật...' : 'Xác nhận lưu kho'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
