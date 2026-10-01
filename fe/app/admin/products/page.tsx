'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Search, LayoutGrid, LayoutList, Pencil, Trash2, RefreshCw } from 'lucide-react'
import { formatPrice, getProducts, API_BASE_URL } from '@/lib/products'
import type { Product, Category } from '@/lib/products'

const CATEGORY_LABELS: Record<string, string> = {
  all: 'Tất cả danh mục',
  rings: 'Nhẫn bạc',
  pendants: 'Mặt dây chuyền',
  bracelets: 'Vòng & Lắc tay',
  earrings: 'Khuyên tai',
  accessories: 'Phụ kiện',
}

function getBadgeClass(badge?: string) {
  if (!badge) return ''
  const map: Record<string, string> = {
    'New': 'badge-new',
    'Best seller': 'badge-bestseller',
    'Limited': 'badge-limited',
    'Độc bản': 'badge-unique',
  }
  return map[badge] || 'badge-default'
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | string | null>(null)

  // Combobox Filters
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState<string>('all')
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all')
  const [badgeFilter, setBadgeFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name_asc' | 'price_desc' | 'price_asc' | 'stock_asc' | 'stock_desc'>('name_asc')
  const [pageSize, setPageSize] = useState<number>(15)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getProducts()
      setProducts(data)
    } catch (err) {
      console.error('Failed to load products:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const handleDelete = async (p: Product) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${p.name}"?`)) return
    if (p.id) {
      setDeletingId(p.id)
      try {
        const res = await fetch(`${API_BASE_URL}/products/${p.id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('Không thể xóa trên server')
        setProducts((prev) => prev.filter((item) => item.id !== p.id))
      } catch (err: any) {
        alert('Lỗi xóa sản phẩm: ' + err.message)
      } finally {
        setDeletingId(null)
      }
    } else {
      setProducts((prev) => prev.filter((item) => item.slug !== p.slug))
    }
  }

  // Filter & Sort
  const filtered = useMemo(() => {
    const list = products.filter((p) => {
      const matchCat = catFilter === 'all' || p.category === catFilter
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.slug && p.slug.toLowerCase().includes(search.toLowerCase()))
      if (!matchCat || !matchSearch) return false

      if (stockFilter === 'out_of_stock' && p.stock > 0) return false
      if (stockFilter === 'in_stock' && p.stock <= 0) return false

      if (badgeFilter !== 'all') {
        if (badgeFilter === 'has_badge' && (!p.badge || p.badge === 'none')) return false
        if (badgeFilter === 'no_badge' && p.badge && p.badge !== 'none') return false
        if (badgeFilter !== 'has_badge' && badgeFilter !== 'no_badge' && p.badge !== badgeFilter) return false
      }

      return true
    })

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'price_desc') return b.price - a.price
      if (sortBy === 'price_asc') return a.price - b.price
      if (sortBy === 'stock_asc') return a.stock - b.stock
      if (sortBy === 'stock_desc') return b.stock - a.stock
      return a.name.localeCompare(b.name)
    })

    return list
  }, [products, search, catFilter, stockFilter, badgeFilter, sortBy])

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize) || 1
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, currentPage, pageSize])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, catFilter, stockFilter, badgeFilter, sortBy, pageSize])

  return (
    <>
      <div className="admin-page-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>Sản phẩm</h1>
          <p>
            {loading ? 'Đang tải dữ liệu từ database...' : `Quản lý ${products.length} sản phẩm trong cửa hàng`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={loadProducts}
            className="admin-btn admin-btn-secondary"
            title="Làm mới dữ liệu từ Database"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Tải lại
          </button>
          <Link href="/admin/products/new" className="admin-btn admin-btn-primary">
            <Plus size={16} /> Thêm sản phẩm
          </Link>
        </div>
      </div>

      {/* COMBOBOX FILTERS */}
      <div className="admin-combobox-bar">
        {/* Search */}
        <div style={{ flex: '1 1 220px', minWidth: 200, position: 'relative' }}>
          <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)', width: 16, height: 16 }} />
          <input
            className="admin-input"
            style={{ paddingLeft: 36, height: 38 }}
            placeholder="Tìm kiếm sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Combobox 1: Danh mục */}
        <div className="admin-combobox-item">
          <span className="admin-combobox-label">Danh mục:</span>
          <select
            className="admin-combobox-select"
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
          >
            {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        {/* Combobox 2: Tồn kho */}
        <div className="admin-combobox-item">
          <span className="admin-combobox-label">Tồn kho:</span>
          <select
            className="admin-combobox-select"
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
          >
            <option value="all">Tất cả kho</option>
            <option value="in_stock">Còn hàng (&gt; 0)</option>
            <option value="out_of_stock">Hết hàng (0)</option>
          </select>
        </div>

        {/* Combobox: Huy hiệu */}
        <div className="admin-combobox-item">
          <span className="admin-combobox-label">Huy hiệu:</span>
          <select
            className="admin-combobox-select"
            value={badgeFilter}
            onChange={(e) => setBadgeFilter(e.target.value)}
          >
            <option value="all">Tất cả huy hiệu</option>
            <option value="has_badge">Có gắn huy hiệu</option>
            <option value="Best seller">Best seller</option>
            <option value="New">New</option>
            <option value="Limited">Limited</option>
            <option value="Độc bản">Độc bản</option>
            <option value="no_badge">Không có</option>
          </select>
        </div>

        {/* Combobox 3: Sắp xếp */}
        <div className="admin-combobox-item">
          <span className="admin-combobox-label">Sắp xếp:</span>
          <select
            className="admin-combobox-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="name_asc">Tên (A-Z)</option>
            <option value="price_desc">Giá: Cao ➜ Thấp</option>
            <option value="price_asc">Giá: Thấp ➜ Cao</option>
            <option value="stock_asc">Tồn kho: Ít ➜ Nhiều</option>
            <option value="stock_desc">Tồn kho: Nhiều ➜ Ít</option>
          </select>
        </div>

        {/* Combobox 4: Dòng / trang */}
        <div className="admin-combobox-item">
          <span className="admin-combobox-label">Hiển thị:</span>
          <select
            className="admin-combobox-select"
            value={pageSize}
            onChange={(e) => setPageSize(parseInt(e.target.value))}
          >
            <option value={10}>10 món / trang</option>
            <option value={15}>15 món / trang</option>
            <option value={30}>30 món / trang</option>
            <option value={50}>50 món / trang</option>
            <option value={100}>Tất cả</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          <button
            className="admin-btn-icon"
            onClick={() => setViewMode('table')}
            style={{ color: viewMode === 'table' ? 'var(--admin-gold)' : undefined }}
            title="Dạng bảng"
          >
            <LayoutList size={18} />
          </button>
          <button
            className="admin-btn-icon"
            onClick={() => setViewMode('grid')}
            style={{ color: viewMode === 'grid' ? 'var(--admin-gold)' : undefined }}
            title="Dạng lưới"
          >
            <LayoutGrid size={18} />
          </button>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="admin-card">
          <div className="admin-table-wrap">
            <table className="admin-table" style={{ width: '100%', minWidth: 760 }}>
              <thead>
                <tr>
                  <th style={{ width: 56, textAlign: 'center' }}>Ảnh</th>
                  <th style={{ minWidth: 180 }}>Sản phẩm</th>
                  <th style={{ width: 120 }}>Danh mục</th>
                  <th style={{ width: 115 }}>Giá bán</th>
                  <th style={{ textAlign: 'center', width: 85 }}>Tồn kho</th>
                  <th style={{ width: 140 }}>Huy hiệu nổi bật</th>
                  <th style={{ width: 115 }}>Trạng thái</th>
                  <th style={{ width: 85, textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '36px 0', color: 'var(--admin-text-secondary)' }}>
                      Không có sản phẩm nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((p) => (
                    <tr key={p.slug}>
                      <td style={{ textAlign: 'center', width: 56 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 8, background: 'var(--admin-surface-elevated)', overflow: 'hidden', border: '1px solid var(--admin-border)', margin: '0 auto' }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      </td>
                      <td className="cell-name">
                        <div style={{ fontWeight: 600, color: 'var(--admin-text)', fontSize: 13.5, lineHeight: 1.4 }}>
                          {p.name}
                        </div>
                        {p.slug && (
                          <div style={{ fontSize: 11, color: 'var(--admin-text-muted)', fontFamily: 'monospace', marginTop: 2 }}>
                            {p.slug}
                          </div>
                        )}
                      </td>
                      <td style={{ color: 'var(--admin-text-secondary)', fontSize: 13 }}>
                        {CATEGORY_LABELS[p.category] || p.category}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--admin-text)', whiteSpace: 'nowrap', fontSize: 13.5 }}>
                        {formatPrice(p.price)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            padding: '3px 9px',
                            borderRadius: 6,
                            background: p.stock === 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.12)',
                            color: p.stock === 0 ? '#f87171' : '#4ade80',
                            display: 'inline-block',
                          }}
                        >
                          {p.stock === 0 ? '0' : p.stock}
                        </span>
                      </td>
                      {/* Cột: Huy hiệu nổi bật */}
                      <td>
                        {p.badge && p.badge !== 'none' ? (
                          <span className={`product-badge ${getBadgeClass(p.badge)}`}>
                            {p.badge}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--admin-text-muted)', fontSize: 13 }}>—</span>
                        )}
                      </td>
                      {/* Cột: Trạng thái kinh doanh */}
                      <td>
                        {(p as any).is_active === false || (p as any).status === 'inactive' ? (
                          <span className="status-badge" style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#a1a1aa' }}>
                            <span className="status-dot" style={{ background: '#a1a1aa' }} />
                            Tạm ẩn
                          </span>
                        ) : p.stock === 0 ? (
                          <span className="status-badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
                            <span className="status-dot" style={{ background: '#f87171' }} />
                            Hết hàng
                          </span>
                        ) : (
                          <span style={{ color: '#4ade80', fontSize: 13, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            ✓ Còn hàng
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6, justifyContent: 'flex-end' }}>
                          <Link href={`/admin/products/${p.slug}`} className="admin-btn-icon" title="Chỉnh sửa sản phẩm">
                            <Pencil size={15} />
                          </Link>
                          <button
                            className="admin-btn-icon"
                            style={{ color: 'var(--admin-danger)' }}
                            onClick={() => handleDelete(p)}
                            disabled={deletingId === p.id}
                            title="Xóa sản phẩm"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          <div className="admin-pagination-bar">
            <div>
              Hiển thị{' '}
              <strong style={{ color: '#fff' }}>
                {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} –{' '}
                {Math.min(currentPage * pageSize, filtered.length)}
              </strong>{' '}
              trên tổng số <strong style={{ color: '#fff' }}>{filtered.length}</strong> sản phẩm
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
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <>
          <div className="product-grid" style={{ marginBottom: 20 }}>
            {paginatedProducts.map((p) => (
              <div key={p.slug} className="admin-product-card">
                <div className="product-card-image">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt={p.name} />
                  {p.badge && p.badge !== 'none' && (
                    <span className={`product-badge ${getBadgeClass(p.badge)}`}>
                      {p.badge}
                    </span>
                  )}
                </div>
                <div className="product-card-body">
                  <span className="product-card-cat">{CATEGORY_LABELS[p.category] || p.category}</span>
                  <div className="product-card-name">{p.name}</div>
                  <div className="product-card-footer">
                    <span className="product-card-price">{formatPrice(p.price)}</span>
                    <span className={p.stock === 0 ? 'stock-out' : 'stock-ok'}>
                      Kho: {p.stock === 0 ? 'Hết hàng' : p.stock}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12, borderTop: '1px solid var(--admin-border)', paddingTop: 10 }}>
                    <Link href={`/admin/products/${p.slug}`} className="admin-btn admin-btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                      <Pencil size={13} /> Sửa
                    </Link>
                    <button
                      className="admin-btn admin-btn-danger"
                      onClick={() => handleDelete(p)}
                      disabled={deletingId === p.id}
                      style={{ padding: '6px 12px' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="admin-card">
            <div className="admin-pagination-bar">
              <div>
                Hiển thị{' '}
                <strong style={{ color: '#fff' }}>
                  {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} –{' '}
                  {Math.min(currentPage * pageSize, filtered.length)}
                </strong>{' '}
                trên tổng số <strong style={{ color: '#fff' }}>{filtered.length}</strong> sản phẩm
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
      )}
    </>
  )
}
