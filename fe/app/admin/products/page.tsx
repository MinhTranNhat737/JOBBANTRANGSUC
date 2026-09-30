'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Search, LayoutGrid, LayoutList, Pencil, Trash2, RefreshCw } from 'lucide-react'
import { formatPrice, getProducts, API_BASE_URL } from '@/lib/products'
import type { Product, Category } from '@/lib/products'

const CATEGORY_LABELS: Record<string, string> = {
  all: 'Tất cả',
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
  }
  return map[badge] || ''
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | string | null>(null)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState<Category | 'all'>('all')
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

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCat = catFilter === 'all' || p.category === catFilter
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [products, search, catFilter])


  return (
    <>
      <div className="admin-page-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="header-search" style={{ flex: '1 1 240px', maxWidth: 320, position: 'relative' }}>
          <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)', width: 16, height: 16 }} />
          <input
            className="admin-input"
            style={{ paddingLeft: 40, borderRadius: 999, height: 38 }}
            placeholder="Tìm kiếm sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="admin-select"
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value as Category | 'all')}
        >
          {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          <button
            className={`admin-btn-icon ${viewMode === 'table' ? '' : ''}`}
            onClick={() => setViewMode('table')}
            style={{ color: viewMode === 'table' ? 'var(--admin-gold)' : undefined }}
          >
            <LayoutList size={18} />
          </button>
          <button
            className="admin-btn-icon"
            onClick={() => setViewMode('grid')}
            style={{ color: viewMode === 'grid' ? 'var(--admin-gold)' : undefined }}
          >
            <LayoutGrid size={18} />
          </button>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="admin-card">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>Ảnh</th>
                  <th>Sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Giá</th>
                  <th>Kho</th>
                  <th>Badge</th>
                  <th style={{ width: 90 }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.slug}>
                    <td>
                      <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--admin-surface-elevated)', overflow: 'hidden' }}>
                        <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    </td>
                    <td style={{ fontWeight: 500, color: 'var(--admin-text)' }}>{p.name}</td>
                    <td>{CATEGORY_LABELS[p.category]}</td>
                    <td style={{ fontWeight: 500 }}>{formatPrice(p.price)}</td>
                    <td>
                      <span className={p.stock === 0 ? 'stock-out' : p.stock <= 5 ? 'stock-low' : 'stock-ok'}>
                        {p.stock === 0 ? 'Hết hàng' : p.stock}
                        {p.stock > 0 && p.stock <= 5 && ' ⚠'}
                      </span>
                    </td>
                    <td>
                      {p.badge && (
                        <span className={`product-badge ${getBadgeClass(p.badge)}`}>
                          {p.badge}
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <Link href={`/admin/products/${p.slug}`} className="admin-btn-icon">
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
                ))}
              </tbody>
            </table>
          </div>
          <div className="admin-pagination">
            <span className="pagination-info">Hiển thị {filtered.length} / {products.length} sản phẩm</span>
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="product-grid">
          {filtered.map((p) => (
            <div key={p.slug} className="product-grid-card">
              <div className="product-img-wrap">
                <img src={p.image} alt={p.name} />
                {p.badge && (
                  <span
                    className={`product-badge ${getBadgeClass(p.badge)}`}
                    style={{ position: 'absolute', top: 10, right: 10 }}
                  >
                    {p.badge}
                  </span>
                )}
              </div>
              <div className="product-grid-info">
                <h4>{p.name}</h4>
                <div className="product-price">{formatPrice(p.price)}</div>
                <div style={{ marginTop: 6, fontSize: 12 }}>
                  <span className={p.stock === 0 ? 'stock-out' : p.stock <= 5 ? 'stock-low' : 'stock-ok'}>
                    Kho: {p.stock === 0 ? 'Hết hàng' : p.stock}
                    {p.stock > 0 && p.stock <= 5 && ' ⚠'}
                  </span>
                </div>
              </div>
              <div className="product-grid-actions">
                <Link href={`/admin/products/${p.slug}`} className="admin-btn admin-btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '6px 0', fontSize: 12 }}>
                  <Pencil size={13} /> Sửa
                </Link>
                <button
                  className="admin-btn admin-btn-danger"
                  style={{ padding: '6px 10px', fontSize: 12 }}
                  onClick={() => handleDelete(p)}
                  disabled={deletingId === p.id}
                  title="Xóa sản phẩm"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
