'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, Search, LayoutGrid, LayoutList, Pencil, Trash2 } from 'lucide-react'
import { formatPrice } from '@/lib/products'
import type { Product, Category } from '@/lib/products'

// Import product data — in a real app this would be an API call
const ALL_PRODUCTS: Product[] = [
  { slug: 'libra-lotus-pendant', name: 'Libra Lotus Pendant', category: 'pendants', price: 2450000, image: '/images/p-pendant-lotus.png', badge: 'New', stock: 12, material: '925 Sterling Silver, oxidized finish', description: '' },
  { slug: 'vermilion-bird-ring', name: 'Vermilion Bird Ring', category: 'rings', price: 3890000, image: '/images/p-ring-sapphire.png', badge: 'Best seller', stock: 5, sizes: ['8','9','10','11','12','13'], material: '925 Sterling Silver, lab sapphire', description: '' },
  { slug: 'vermilion-bird-pendant', name: 'Vermilion Bird Pendant', category: 'pendants', price: 2190000, image: '/images/p-pendant-dagger.png', stock: 9, material: '925 Sterling Silver', description: '' },
  { slug: 'red-dragon-tag-pendant', name: 'Red Dragon Tag Pendant', category: 'pendants', price: 2690000, image: '/images/p-pendant-ruby.png', badge: 'Limited', stock: 3, material: '925 Sterling Silver, cold enamel', description: '' },
  { slug: 'chimaera-lock-cuff', name: 'Chimaera Lock Cuff', category: 'earrings', price: 1450000, image: '/images/p-cuff-horseshoe.png', stock: 18, material: '925 Sterling Silver', description: '' },
  { slug: 'gothic-cross-signet', name: 'Gothic Cross Signet Ring', category: 'rings', price: 3250000, image: '/images/p-ring-signet.png', badge: 'New', stock: 7, sizes: ['8','9','10','11','12','13'], material: '925 Sterling Silver', description: '' },
  { slug: 'fleur-link-bracelet', name: 'Fleur Link Bracelet', category: 'bracelets', price: 5790000, image: '/images/p-chain-bracelet.png', stock: 4, sizes: ['17cm','19cm','21cm'], material: '925 Sterling Silver', description: '' },
  { slug: 'lotus-warrior-keychain', name: 'Lotus Warrior Keychain', category: 'accessories', price: 1890000, image: '/images/p-keychain.png', stock: 0, material: '925 Sterling Silver, steel clip', description: '' },
  { slug: 'mythic-dagger-earring', name: 'Mythic Dagger Earring', category: 'earrings', price: 1290000, image: '/images/p-pendant-dagger.png', stock: 22, material: '925 Sterling Silver', description: '' },
  { slug: 'azure-scale-band', name: 'Azure Scale Band', category: 'rings', price: 2990000, compareAtPrice: 3490000, image: '/images/p-ring-sapphire.png', stock: 10, sizes: ['8','9','10','11','12','13'], material: '925 Sterling Silver', description: '' },
  { slug: 'sunflower-chain-bracelet', name: 'Sunflower Chain Bracelet', category: 'bracelets', price: 4590000, image: '/images/p-chain-bracelet.png', badge: 'Best seller', stock: 6, sizes: ['17cm','19cm','21cm'], material: '925 Sterling Silver', description: '' },
  { slug: 'twin-lotus-pendant', name: 'Twin Lotus Pendant', category: 'pendants', price: 2350000, image: '/images/p-pendant-lotus.png', stock: 14, material: '925 Sterling Silver', description: '' },
  { slug: 'horseshoe-hoop', name: 'Horseshoe Hoop Earring', category: 'earrings', price: 1190000, image: '/images/p-cuff-horseshoe.png', stock: 25, material: '925 Sterling Silver', description: '' },
  { slug: 'crest-signet-heavy', name: 'Crest Signet Heavy', category: 'rings', price: 4290000, image: '/images/p-ring-signet.png', badge: 'Limited', stock: 2, sizes: ['8','9','10','11','12','13'], material: '925 Sterling Silver', description: '' },
  { slug: 'warrior-clip-charm', name: 'Warrior Clip Charm', category: 'accessories', price: 1590000, image: '/images/p-keychain.png', stock: 11, material: '925 Sterling Silver', description: '' },
  { slug: 'dragon-tag-mini', name: 'Dragon Tag Mini', category: 'pendants', price: 1790000, image: '/images/p-pendant-ruby.png', stock: 8, material: '925 Sterling Silver, cold enamel', description: '' },
]

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
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState<Category | 'all'>('all')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')

  const filtered = useMemo(() => {
    return ALL_PRODUCTS.filter(p => {
      const matchCat = catFilter === 'all' || p.category === catFilter
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [search, catFilter])

  return (
    <>
      <div className="admin-page-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Sản phẩm</h1>
          <p>Quản lý {ALL_PRODUCTS.length} sản phẩm trong cửa hàng</p>
        </div>
        <Link href="/admin/products/new" className="admin-btn admin-btn-primary">
          <Plus size={16} /> Thêm sản phẩm
        </Link>
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
                        <button className="admin-btn-icon" style={{ color: 'var(--admin-danger)' }}>
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
            <span className="pagination-info">Hiển thị {filtered.length} / {ALL_PRODUCTS.length} sản phẩm</span>
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
                <button className="admin-btn admin-btn-danger" style={{ padding: '6px 10px', fontSize: 12 }}>
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
