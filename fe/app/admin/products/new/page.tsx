'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Upload, Loader2, Tag, Check, Plus, X, Sparkles, Info } from 'lucide-react'
import { API_BASE_URL } from '@/lib/products'
import { fetchWithAuth } from '@/lib/api'
import { CATEGORIES, BRANDS, CATEGORY_SIZE_PRESETS } from '../[slug]/page'

type ImageItem = {
  url: string
  is_primary: boolean
}

export default function NewProductPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState<number>(1)
  const [brandId, setBrandId] = useState<number>(1)
  const [price, setPrice] = useState('')
  const [comparePrice, setComparePrice] = useState('')
  const [stock, setStock] = useState('1')
  const [material, setMaterial] = useState('')
  const [description, setDescription] = useState('')
  const [badge, setBadge] = useState('none')
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['7', '8', '9', '10', '11'])
  const [customSizeInput, setCustomSizeInput] = useState('')
  const [images, setImages] = useState<ImageItem[]>([])
  const [newImageUrl, setNewImageUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentPreset = CATEGORY_SIZE_PRESETS[categoryId] || CATEGORY_SIZE_PRESETS[14]

  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

  const handleCategoryChange = (newCatId: number) => {
    setCategoryId(newCatId)
    const preset = CATEGORY_SIZE_PRESETS[newCatId]
    if (preset) {
      if (newCatId === 7) {
        setSelectedSizes(['S', 'M', 'L', 'XL'])
      } else if (newCatId === 1) {
        setSelectedSizes(['7', '8', '9', '10', '11', '12'])
      } else if (newCatId === 4) {
        setSelectedSizes(['16cm', '18cm', '20cm'])
      } else {
        setSelectedSizes(preset.sizes.slice(0, 4))
      }
    }
  }

  const toggleSize = (s: string) => {
    setSelectedSizes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    )
  }

  const handleAddCustomSize = () => {
    if (!customSizeInput.trim()) return
    const s = customSizeInput.trim()
    if (!selectedSizes.includes(s)) {
      setSelectedSizes((prev) => [...prev, s])
    }
    setCustomSizeInput('')
  }

  // File Upload & Drag-and-Drop Processing
  const processFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return
    setIsUploading(true)

    try {
      const formData = new FormData()
      Array.from(files).forEach((f) => formData.append('files', f))

      const res = await fetchWithAuth('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        if (data.urls && Array.isArray(data.urls) && data.urls.length > 0) {
          setImages((prev) => {
            const added = data.urls.map((u: string, idx: number) => ({
              url: u,
              is_primary: prev.length === 0 && idx === 0,
            }))
            return [...prev, ...added]
          })
          setIsUploading(false)
          return
        }
      }
    } catch (err) {
      console.warn('Upload API error, falling back to base64 reader:', err)
    }

    // Fallback to FileReader base64
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result as string
        if (base64) {
          setImages((prev) => [
            ...prev,
            { url: base64, is_primary: prev.length === 0 },
          ])
        }
      }
      reader.readAsDataURL(file)
    })
    setIsUploading(false)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files)
    }
  }

  const handleAddImageUrl = () => {
    const url = newImageUrl.trim()
    if (!url) return
    setImages((prev) => [
      ...prev,
      { url, is_primary: prev.length === 0 },
    ])
    setNewImageUrl('')
  }

  const handleSetPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, idx) => ({
        ...img,
        is_primary: idx === index,
      })),
    )
  }

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, idx) => idx !== index)
      if (updated.length > 0 && !updated.some((img) => img.is_primary)) {
        updated[0].is_primary = true
      }
      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      alert('Vui lòng nhập tên sản phẩm')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const primaryUrl = images.find((i) => i.is_primary)?.url || images[0]?.url || undefined

      const payload = {
        name: name.trim(),
        slug: slug || `sp-${Date.now()}`,
        description: description.trim() || undefined,
        category_id: categoryId,
        brand_id: brandId,
        sale_price: price ? parseFloat(price) : null,
        import_price: comparePrice ? parseFloat(comparePrice) : null,
        quantity: stock ? parseInt(stock) : 1,
        status: 'active',
        qc_status: 'passed',
        note: material ? `Chất liệu: ${material}` : undefined,
        badge: badge !== 'none' ? badge : null,
        sizes: selectedSizes,
        image: primaryUrl,
        images: images.map((img, idx) => ({
          url: img.url,
          is_primary: img.is_primary || (idx === 0 && !images.some((i) => i.is_primary)),
          sort_order: idx,
        })),
      }

      const res = await fetchWithAuth(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Lỗi khi lưu sản phẩm')
      }

      alert('Tạo sản phẩm mới thành công!')
      router.push('/admin/products')
      router.refresh()
    } catch (err: any) {
      console.error('Submit product error:', err)
      setError(err.message || 'Lỗi lưu sản phẩm')
      alert('Lỗi: ' + (err.message || 'Không thể lưu'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <Link
          href="/admin/products"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            color: 'var(--admin-text-secondary)',
            textDecoration: 'none',
            marginBottom: 12,
          }}
        >
          <ArrowLeft size={16} /> Quay lại danh sách
        </Link>
        <h1
          style={{
            fontFamily: 'var(--font-cinzel)',
            fontSize: 26,
            fontWeight: 700,
            color: 'var(--admin-text)',
            letterSpacing: '0.04em',
            margin: 0,
          }}
        >
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
              <input
                className="admin-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Áo thun Chrome Hearts / Nhẫn Bạc 925..."
              />
            </div>
            <div className="form-group">
              <label className="admin-label">Slug (URL tự động)</label>
              <input
                className="admin-input"
                value={slug}
                readOnly
                style={{ color: 'var(--admin-text-muted)', fontFamily: 'monospace' }}
              />
            </div>
            <div className="form-group">
              <label className="admin-label">Mô tả sản phẩm</label>
              <textarea
                className="admin-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả kỹ thuật chế tác, câu chuyện thiết kế..."
                rows={4}
              />
            </div>
          </div>

          <div className="form-section" style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>Hình ảnh sản phẩm ({images.length})</h3>
              {images.length > 0 && (
                <span style={{ fontSize: 12, color: 'var(--admin-gold)' }}>
                  ★ Ảnh có viền vàng là ảnh đại diện chính
                </span>
              )}
            </div>

            {/* Lưu ý kích thước & độ phân giải lý tưởng */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 0,
                padding: '12px 14px',
                marginBottom: 16,
                fontSize: 12,
                lineHeight: 1.6,
                color: 'var(--admin-text-secondary)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  marginBottom: 6,
                  color: 'var(--admin-gold)',
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                <Sparkles size={15} />
                <span>Tiêu chuẩn hình ảnh tối ưu cho Luxury &amp; Trang sức:</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <li>
                  <strong style={{ color: '#ffffff' }}>Tỉ lệ chuẩn nhất:</strong>{' '}
                  <span style={{ color: 'var(--admin-gold)', fontWeight: 600 }}>1:1 (Ảnh vuông)</span>{' '}
                  — Giúp danh mục &amp; trang chủ xếp lưới đều tăm tắp, chuẩn giao diện sang trọng.
                </li>
                <li>
                  <strong style={{ color: '#ffffff' }}>Độ phân giải lý tưởng:</strong>{' '}
                  <span style={{ color: 'var(--admin-gold)', fontWeight: 600 }}>1000 × 1000 px</span> đến{' '}
                  <span style={{ color: 'var(--admin-gold)', fontWeight: 600 }}>1200 × 1200 px</span> (Tối thiểu{' '}
                  <span style={{ color: '#ffffff' }}>800 × 800 px</span>) — Khách hàng phóng to (zoom) xem sắc nét từng giác cắt đá, hoa văn bạc.
                </li>
                <li>
                  <strong style={{ color: '#ffffff' }}>Định dạng &amp; Dung lượng:</strong> Ưu tiên{' '}
                  <span style={{ color: '#ffffff' }}>WebP</span> hoặc <span style={{ color: '#ffffff' }}>JPG</span> chất lượng cao, dung lượng{' '}
                  <strong style={{ color: '#10b981' }}>&lt; 1.5 MB</strong> mỗi ảnh để tốc độ mở trang nhanh nhất.
                </li>
                <li>
                  <strong style={{ color: '#ffffff' }}>Phông nền:</strong> Khuyên dùng nền đơn sắc (trắng tinh, xám nhạt hoặc đen sang trọng) để tôn vinh ánh kim sản phẩm.
                </li>
              </ul>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={handleDragOver}
              onDragEnter={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('new-product-file-input')?.click()}
              style={{
                border: isDragging ? '2px dashed var(--admin-gold)' : '2px dashed var(--admin-border)',
                background: isDragging ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                borderRadius: 0,
                padding: '28px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                position: 'relative',
              }}
            >
              <input
                id="new-product-file-input"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />

              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: isDragging ? 'var(--admin-gold)' : 'var(--admin-surface-elevated)',
                  color: isDragging ? '#000000' : 'var(--admin-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  border: '1px solid var(--admin-border)',
                }}
              >
                {isUploading ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <Upload size={24} />
                )}
              </div>

              <div>
                <p style={{ fontWeight: 600, color: 'var(--admin-text)', fontSize: 14, margin: 0 }}>
                  {isDragging ? 'Thả ảnh vào đây ngay...' : 'Kéo thả ảnh vào đây hoặc bấm để chọn từ máy tính'}
                </p>
                <p style={{ fontSize: 12, color: 'var(--admin-text-muted)', margin: '4px 0 0' }}>
                  Hỗ trợ tải lên cùng lúc nhiều ảnh: PNG, JPG, JPEG, WebP, GIF
                </p>
              </div>

              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                style={{ fontSize: 12, padding: '6px 14px', marginTop: 4, pointerEvents: 'none' }}
              >
                <Upload size={14} /> Chọn ảnh từ máy tính
              </button>
            </div>

            {/* Gallery of Uploaded Images */}
            {images.length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                  gap: 12,
                  marginTop: 16,
                }}
              >
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: 'relative',
                      aspectRatio: '1',
                      borderRadius: 0,
                      overflow: 'hidden',
                      border: img.is_primary ? '2px solid var(--admin-gold)' : '1px solid var(--admin-border)',
                      background: 'var(--admin-surface-elevated)',
                      boxShadow: img.is_primary ? '0 0 12px rgba(255, 255, 255, 0.2)' : 'none',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={`Ảnh ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />

                    {/* Primary Badge */}
                    {img.is_primary ? (
                      <span
                        style={{
                          position: 'absolute',
                          top: 6,
                          left: 6,
                          background: 'var(--admin-gold)',
                          color: '#000000',
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 4,
                          letterSpacing: '0.02em',
                        }}
                      >
                        ★ Ảnh chính
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSetPrimaryImage(idx)
                        }}
                        title="Đặt làm ảnh đại diện chính"
                        style={{
                          position: 'absolute',
                          top: 6,
                          left: 6,
                          background: 'rgba(0, 0, 0, 0.7)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 4,
                          fontSize: 10,
                          padding: '2px 6px',
                          cursor: 'pointer',
                        }}
                      >
                        Đặt ảnh chính
                      </button>
                    )}

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveImage(idx)
                      }}
                      title="Xóa ảnh này"
                      style={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: 'rgba(239, 68, 68, 0.9)',
                        color: '#ffffff',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input URL fallback */}
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--admin-border)' }}>
              <label className="admin-label" style={{ fontSize: 12 }}>
                Hoặc nhập nhanh đường dẫn hình ảnh (URL / Link web)
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="admin-input"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddImageUrl()
                    }
                  }}
                  placeholder="/images/SP0001-1.jpg hoặc https://..."
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="admin-btn admin-btn-secondary"
                  style={{ flexShrink: 0 }}
                >
                  <Plus size={15} /> Thêm link
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div>
          <div className="form-section">
            <h3>Giá &amp; Kho hàng</h3>
            <div className="form-group">
              <label className="admin-label">Giá bán * (VNĐ)</label>
              <input
                className="admin-input"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="4660000"
              />
            </div>
            <div className="form-group">
              <label className="admin-label">Giá so sánh (VNĐ)</label>
              <input
                className="admin-input"
                type="number"
                value={comparePrice}
                onChange={(e) => setComparePrice(e.target.value)}
                placeholder="Để trống nếu không hiển thị giảm giá"
              />
            </div>
            <div className="form-group">
              <label className="admin-label">Số lượng tồn kho (Độc bản có thể = 1) *</label>
              <input
                className="admin-input"
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="1"
              />
            </div>
            <div className="form-group">
              <label className="admin-label">Chất liệu chế tác</label>
              <input
                className="admin-input"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="VD: Bạc 925 Sterling Silver, Cotton cao cấp..."
              />
            </div>
          </div>

          <div className="form-section" style={{ marginTop: 20 }}>
            <h3>Phân loại &amp; Kích thước chuẩn</h3>
            <div className="form-group">
              <label className="admin-label">Danh mục sản phẩm *</label>
              <select
                className="admin-select"
                style={{ width: '100%' }}
                value={categoryId}
                onChange={(e) => handleCategoryChange(parseInt(e.target.value))}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="admin-label">Thương hiệu</label>
              <select
                className="admin-select"
                style={{ width: '100%' }}
                value={brandId}
                onChange={(e) => setBrandId(parseInt(e.target.value))}
              >
                {BRANDS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="admin-label">Huy hiệu (Badge)</label>
              <select
                className="admin-select"
                style={{ width: '100%' }}
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
              >
                <option value="none">Không có</option>
                <option value="Độc bản">Độc bản (1 chiếc duy nhất)</option>
                <option value="New">Mới ra mắt (New)</option>
                <option value="Best seller">Bán chạy nhất (Best seller)</option>
                <option value="Limited">Phiên bản giới hạn (Limited)</option>
              </select>
            </div>

            {/* Category Sizes */}
            <div className="form-group" style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label className="admin-label" style={{ margin: 0 }}>
                  {currentPreset.label}
                </label>
                <button
                  type="button"
                  onClick={() => setSelectedSizes(currentPreset.sizes)}
                  style={{ background: 'none', border: 'none', color: 'var(--admin-gold)', fontSize: 11, cursor: 'pointer' }}
                >
                  Chọn hết
                </button>
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                {currentPreset.sizes.map((s) => {
                  const isSelected = selectedSizes.includes(s)
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSize(s)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 0,
                        border: `1px solid ${isSelected ? 'var(--admin-gold)' : 'var(--admin-border)'}`,
                        background: isSelected ? 'rgba(255, 255, 255, 0.16)' : 'var(--admin-surface-elevated)',
                        color: isSelected ? 'var(--admin-gold)' : 'var(--admin-text-secondary)',
                        fontSize: 12.5,
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      {isSelected && <Check size={11} />}
                      {s}
                    </button>
                  )
                })}
              </div>

              {/* Custom Size Input */}
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  className="admin-input"
                  placeholder="Thêm size tùy biến..."
                  value={customSizeInput}
                  onChange={(e) => setCustomSizeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddCustomSize()
                    }
                  }}
                  style={{ height: 34, fontSize: 12 }}
                />
                <button
                  type="button"
                  onClick={handleAddCustomSize}
                  className="admin-btn admin-btn-secondary"
                  style={{ height: 34, padding: '0 10px', fontSize: 12 }}
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="form-actions" style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <Link href="/admin/products" className="admin-btn admin-btn-secondary">
          Hủy
        </Link>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="admin-btn admin-btn-primary"
          style={{ minWidth: 140 }}
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Đang lưu...' : 'Lưu sản phẩm'}
        </button>
      </div>
    </>
  )
}
