'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Upload } from 'lucide-react'

const CATEGORIES = [
  { value: 'rings', label: 'Nhẫn bạc' },
  { value: 'pendants', label: 'Mặt dây chuyền' },
  { value: 'bracelets', label: 'Vòng & Lắc tay' },
  { value: 'earrings', label: 'Khuyên tai' },
  { value: 'accessories', label: 'Phụ kiện' },
]

const RING_SIZES = ['8', '9', '10', '11', '12', '13']
const BRACELET_SIZES = ['17cm', '19cm', '21cm']

export default function NewProductPage() {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('rings')
  const [price, setPrice] = useState('')
  const [comparePrice, setComparePrice] = useState('')
  const [stock, setStock] = useState('')
  const [material, setMaterial] = useState('')
  const [description, setDescription] = useState('')
  const [badge, setBadge] = useState('none')
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

  const sizes = category === 'rings' ? RING_SIZES : category === 'bracelets' ? BRACELET_SIZES : []

  const toggleSize = (s: string) => {
    setSelectedSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin/products" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--admin-text-secondary)', textDecoration: 'none', marginBottom: 12 }}>
          <ArrowLeft size={16} /> Quay lại danh sách
        </Link>
        <h1 style={{ fontFamily: 'var(--font-cinzel)', fontSize: 26, fontWeight: 700, color: 'var(--admin-text)', letterSpacing: '0.04em' }}>
          Thêm sản phẩm mới
        </h1>
      </div>

      <div className="form-grid">
        {/* Left column */}
        <div>
          <div className="form-section">
            <h3>Thông tin cơ bản</h3>
            <div className="form-group">
              <label className="admin-label">Tên sản phẩm *</label>
              <input className="admin-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nhập tên sản phẩm" />
            </div>
            <div className="form-group">
              <label className="admin-label">Slug (URL)</label>
              <input className="admin-input" value={slug} readOnly style={{ color: 'var(--admin-text-muted)' }} />
            </div>
            <div className="form-group">
              <label className="admin-label">Mô tả *</label>
              <textarea className="admin-textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả chi tiết sản phẩm..." rows={4} />
            </div>
          </div>

          <div className="form-section" style={{ marginTop: 20 }}>
            <h3>Hình ảnh</h3>
            <div style={{
              border: '2px dashed var(--admin-border)',
              borderRadius: 12,
              padding: '40px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}>
              <Upload size={32} style={{ color: 'var(--admin-text-muted)', marginBottom: 8 }} />
              <p style={{ fontSize: 14, color: 'var(--admin-text-secondary)', margin: '0 0 4px' }}>
                Kéo thả hoặc click để upload
              </p>
              <p style={{ fontSize: 12, color: 'var(--admin-text-muted)', margin: 0 }}>
                PNG, JPG tối đa 5MB
              </p>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div>
          <div className="form-section">
            <h3>Giá & Kho hàng</h3>
            <div className="form-group">
              <label className="admin-label">Giá bán * (VNĐ)</label>
              <input className="admin-input" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
            </div>
            <div className="form-group">
              <label className="admin-label">Giá so sánh (VNĐ)</label>
              <input className="admin-input" type="number" value={comparePrice} onChange={(e) => setComparePrice(e.target.value)} placeholder="Để trống nếu không giảm giá" />
            </div>
            <div className="form-group">
              <label className="admin-label">Tồn kho *</label>
              <input className="admin-input" type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" />
            </div>
            <div className="form-group">
              <label className="admin-label">Chất liệu *</label>
              <input className="admin-input" value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="VD: 925 Sterling Silver" />
            </div>
          </div>

          <div className="form-section" style={{ marginTop: 20 }}>
            <h3>Phân loại</h3>
            <div className="form-group">
              <label className="admin-label">Danh mục *</label>
              <select className="admin-select" style={{ width: '100%' }} value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="admin-label">Badge</label>
              <select className="admin-select" style={{ width: '100%' }} value={badge} onChange={(e) => setBadge(e.target.value)}>
                <option value="none">Không có</option>
                <option value="New">New</option>
                <option value="Best seller">Best seller</option>
                <option value="Limited">Limited</option>
              </select>
            </div>
            {sizes.length > 0 && (
              <div className="form-group">
                <label className="admin-label">Kích cỡ</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {sizes.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSize(s)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 6,
                        border: `1px solid ${selectedSizes.includes(s) ? 'var(--admin-gold)' : 'var(--admin-border)'}`,
                        background: selectedSizes.includes(s) ? 'var(--admin-gold-muted)' : 'transparent',
                        color: selectedSizes.includes(s) ? 'var(--admin-gold)' : 'var(--admin-text-secondary)',
                        fontSize: 13,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="form-actions">
        <Link href="/admin/products" className="admin-btn admin-btn-secondary">
          Hủy
        </Link>
        <button className="admin-btn admin-btn-primary">
          <Save size={16} /> Lưu sản phẩm
        </button>
      </div>
    </>
  )
}
