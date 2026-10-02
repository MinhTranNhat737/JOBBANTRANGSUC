'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Save,
  Upload,
  Loader2,
  ExternalLink,
  Trash2,
  Plus,
  Star,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Sparkles,
  Check,
  X,
  Tag,
} from 'lucide-react'
import { API_BASE_URL } from '@/lib/products'
import { fetchWithAuth } from '@/lib/api'

export const CATEGORIES = [
  { id: 1, name: 'Nhẫn', slug: 'nhan' },
  { id: 2, name: 'Mặt dây chuyền', slug: 'mat-day-chuyen' },
  { id: 3, name: 'Dây chuyền', slug: 'day-chuyen' },
  { id: 4, name: 'Vòng tay & Lắc', slug: 'vong-tay-lac' },
  { id: 5, name: 'Khuyên tai', slug: 'khuyen-tai' },
  { id: 6, name: 'Kính mắt', slug: 'kinh-mat' },
  { id: 7, name: 'Quần áo', slug: 'quan-ao' },
  { id: 8, name: 'Túi & Ví', slug: 'tui-vi' },
  { id: 9, name: 'Mũ', slug: 'mu' },
  { id: 10, name: 'Dép', slug: 'dep' },
  { id: 11, name: 'Thắt lưng', slug: 'that-lung' },
  { id: 12, name: 'Đồng hồ', slug: 'dong-ho' },
  { id: 13, name: 'Decor & Lifestyle', slug: 'decor-lifestyle' },
  { id: 14, name: 'Khác', slug: 'khac' },
]

export const BRANDS = [
  { id: 1, name: 'Chrome Hearts', slug: 'chrome-hearts' },
  { id: 2, name: 'BE@RBRICK', slug: 'bearbrick' },
  { id: 3, name: 'Zippo', slug: 'zippo' },
]

// Bộ thiết lập kích thước chuẩn theo từng danh mục sản phẩm
export const CATEGORY_SIZE_PRESETS: Record<number, { label: string; desc: string; sizes: string[] }> = {
  // 1: Nhẫn (Rings)
  1: {
    label: 'Kích cỡ Nhẫn (US Ring Size)',
    desc: 'Bảng size nhẫn bạc tiêu chuẩn quốc tế',
    sizes: ['6', '7', '8', '9', '10', '11', '12', '13', '14'],
  },
  // 2: Mặt dây chuyền
  2: {
    label: 'Chiều dài dây đeo mặt dây chuyền',
    desc: 'Độ dài chuỗi dây đi kèm mặt',
    sizes: ['45cm', '50cm', '55cm', '60cm', '65cm', '70cm'],
  },
  // 3: Dây chuyền
  3: {
    label: 'Chiều dài Dây chuyền (Necklaces)',
    desc: 'Độ dài chuỗi mắt xích hoặc hạt',
    sizes: ['45cm', '50cm', '55cm', '60cm', '65cm', '70cm'],
  },
  // 4: Vòng tay & Lắc
  4: {
    label: 'Chu vi Vòng tay & Lắc (Bracelets)',
    desc: 'Đo theo chu vi cổ tay',
    sizes: ['15cm', '16cm', '17cm', '18cm', '19cm', '20cm', '21cm'],
  },
  // 5: Khuyên tai
  5: {
    label: 'Quy cách Khuyên tai (Earrings)',
    desc: 'Đặc thù trang sức tai Chrome Hearts',
    sizes: ['Bên trái (Left)', 'Bên phải (Right)', 'Cặp (Pair)', 'Freesize'],
  },
  // 6: Kính mắt
  6: {
    label: 'Kích thước Gọng kính (Eyewear)',
    desc: 'Độ rộng cầu kính và gọng',
    sizes: ['Tiêu chuẩn (Standard)', 'Bản rộng (Wide)', 'One Size'],
  },
  // 7: Quần áo (Clothing / Apparel) -> S M L XL theo yêu cầu!
  7: {
    label: 'Size Quần áo (Apparel / Clothing)',
    desc: 'Bảng size thời trang quốc tế chuẩn cho Áo / Quần',
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', 'Freesize (Oversize)'],
  },
  // 8: Túi & Ví
  8: {
    label: 'Kích cỡ Túi & Ví (Bags & Wallets)',
    desc: 'Kích cỡ phom túi ví',
    sizes: ['Mini', 'Small', 'Medium', 'Large', 'One Size'],
  },
  // 9: Mũ
  9: {
    label: 'Kích cỡ Mũ (Caps & Hats)',
    desc: 'Vòng đầu hoặc nấc khóa',
    sizes: ['Freesize (Nấc điều chỉnh)', 'Size S/M', 'Size L/XL'],
  },
  // 10: Dép & Giày
  10: {
    label: 'Size Dép & Giày (Footwear EU)',
    desc: 'Size giày dép chuẩn EU',
    sizes: ['38', '39', '40', '41', '42', '43', '44', '45'],
  },
  // 11: Thắt lưng
  11: {
    label: 'Chiều dài Thắt lưng (Belts)',
    desc: 'Đo vòng eo',
    sizes: ['80cm', '85cm', '90cm', '95cm', '100cm', '105cm'],
  },
  // 12: Đồng hồ
  12: {
    label: 'Đường kính Mặt đồng hồ (Case size)',
    desc: 'Kích thước dial',
    sizes: ['36mm', '38mm', '39mm', '40mm', '41mm', '42mm'],
  },
  // 13: Decor & Lifestyle
  13: {
    label: 'Quy cách Decor & Phong cách sống',
    desc: 'Bật lửa, gạt tàn, đồ trang trí',
    sizes: ['Tiêu chuẩn', 'Bản lớn (Large)', 'One Size', 'Độc bản 1 chiếc'],
  },
  // 14: Khác
  14: {
    label: 'Kích cỡ chung',
    desc: 'Quy cách tự chọn',
    sizes: ['One Size', 'Freesize', 'Độc bản 1 chiếc'],
  },
}

export default function EditProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: rawSlug } = use(params)
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Product fields
  const [productId, setProductId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState<number>(1)
  const [brandId, setBrandId] = useState<number>(1)
  const [price, setPrice] = useState<string>('')
  const [importPrice, setImportPrice] = useState<string>('')
  const [stock, setStock] = useState<string>('1')
  const [status, setStatus] = useState<'active' | 'inactive'>('active')
  const [note, setNote] = useState('')
  const [badge, setBadge] = useState('none')

  // Selected sizes state
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [customSizeInput, setCustomSizeInput] = useState('')

  // Image management
  const [images, setImages] = useState<{ id?: number; url: string; is_primary?: boolean }[]>([])
  const [newImageUrl, setNewImageUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // Current category size preset
  const currentSizePreset = CATEGORY_SIZE_PRESETS[categoryId] || CATEGORY_SIZE_PRESETS[14]

  // Load product data
  useEffect(() => {
    let isMounted = true
    async function fetchProduct() {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE_URL}/products/${rawSlug}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('Không tìm thấy sản phẩm')
        const data = await res.json()

        if (isMounted) {
          setProductId(data.id)
          setName(data.name || '')
          setSku(data.sku || '')
          setSlug(data.slug || rawSlug)
          setDescription(data.description || '')
          const loadedCatId = data.category_id || 1
          setCategoryId(loadedCatId)
          setBrandId(data.brand_id || 1)
          setPrice(data.sale_price !== null ? String(data.sale_price) : '')
          setImportPrice(data.import_price !== null ? String(data.import_price) : '')
          setStock(data.quantity !== null ? String(data.quantity) : '1')
          setStatus(data.status || 'active')
          setNote(data.note || '')

          // Parse images
          if (data.images && Array.isArray(data.images) && data.images.length > 0) {
            setImages(data.images)
          } else if (data.image) {
            setImages([{ url: data.image, is_primary: true }])
          } else {
            setImages([])
          }

          // Parse Sizes
          if (data.sizes && Array.isArray(data.sizes) && data.sizes.length > 0) {
            setSelectedSizes(data.sizes)
          } else if (typeof data.sizes === 'string' && data.sizes.trim()) {
            try {
              setSelectedSizes(JSON.parse(data.sizes))
            } catch {
              setSelectedSizes(data.sizes.split(',').map((s: string) => s.trim()).filter(Boolean))
            }
          } else {
            // Intelligent default sizes based on Category if none in DB
            const preset = CATEGORY_SIZE_PRESETS[loadedCatId]
            if (loadedCatId === 7) {
              // Quần áo: Default S, M, L, XL
              setSelectedSizes(['S', 'M', 'L', 'XL'])
            } else if (loadedCatId === 1) {
              // Nhẫn: Default 7, 8, 9, 10, 11, 12
              setSelectedSizes(['7', '8', '9', '10', '11', '12'])
            } else if (loadedCatId === 4) {
              // Vòng tay: Default 16cm, 18cm, 20cm
              setSelectedSizes(['16cm', '18cm', '20cm'])
            } else if (preset && preset.sizes.length > 0) {
              setSelectedSizes(preset.sizes.slice(0, 4))
            }
          }

          // Badge
          if (data.badge) {
            setBadge(data.badge)
          }
        }
      } catch (err: any) {
        console.error('Fetch product error:', err)
        if (isMounted) {
          setNotification({ type: 'error', message: err.message || 'Lỗi tải thông tin sản phẩm' })
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchProduct()
    return () => {
      isMounted = false
    }
  }, [rawSlug])

  // When user changes category, if sizes are empty or default, suggest matching sizes
  const handleCategoryChange = (newCatId: number) => {
    setCategoryId(newCatId)
    const preset = CATEGORY_SIZE_PRESETS[newCatId]
    if (preset) {
      // Auto-suggest category sizes if current list is empty
      if (selectedSizes.length === 0) {
        if (newCatId === 7) {
          setSelectedSizes(['S', 'M', 'L', 'XL'])
        } else if (newCatId === 1) {
          setSelectedSizes(['7', '8', '9', '10', '11', '12'])
        } else {
          setSelectedSizes(preset.sizes.slice(0, 4))
        }
      }
    }
  }

  // Size Handlers
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

  const handleSelectAllPresetSizes = () => {
    if (!currentSizePreset) return
    const set = new Set([...selectedSizes, ...currentSizePreset.sizes])
    setSelectedSizes(Array.from(set))
  }

  const handleClearAllSizes = () => {
    setSelectedSizes([])
  }

  // Image Handlers
  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return
    const url = newImageUrl.trim()
    setImages((prev) => [
      ...prev,
      { url, is_primary: prev.length === 0 },
    ])
    setNewImageUrl('')
  }

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

  const handleSetPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, idx) => ({
        ...img,
        is_primary: idx === index,
      }))
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

  // Save submit handler
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!name.trim()) {
      setNotification({ type: 'error', message: 'Tên sản phẩm không được để trống' })
      return
    }

    setSaving(true)
    setNotification(null)

    try {
      const payload = {
        name: name.trim(),
        sku: sku.trim(),
        slug: slug.trim() || rawSlug,
        description: description.trim() || null,
        category_id: categoryId,
        brand_id: brandId,
        sale_price: price ? parseFloat(price) : null,
        import_price: importPrice ? parseFloat(importPrice) : null,
        quantity: stock ? parseInt(stock) : 0,
        status,
        note: note.trim() || null,
        badge: badge !== 'none' ? badge : null,
        sizes: selectedSizes, // Array of sizes e.g. ['S', 'M', 'L', 'XL'] or ['8', '9', '10']
        images: images.map((img, idx) => ({
          url: img.url,
          is_primary: !!img.is_primary,
          sort_order: idx,
        })),
      }

      const targetId = productId || rawSlug
      const res = await fetchWithAuth(`${API_BASE_URL}/products/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Không thể lưu sản phẩm lên server')
      }

      const updated = await res.json()
      setNotification({
        type: 'success',
        message: `Đã lưu thành công! Cập nhật tên, ảnh và ${selectedSizes.length} kích thước (${selectedSizes.join(', ') || 'Freesize'}).`,
      })

      if (updated.slug && updated.slug !== rawSlug) {
        router.replace(`/admin/products/${updated.slug}`)
      }
    } catch (err: any) {
      console.error('Save product error:', err)
      setNotification({ type: 'error', message: err.message || 'Lỗi khi lưu sản phẩm' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center' }}>
        <Loader2 size={36} className="animate-spin" style={{ color: 'var(--admin-gold)', margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--admin-text-secondary)', fontSize: 14 }}>Đang tải thông tin sản phẩm...</p>
      </div>
    )
  }

  return (
    <>
      {/* Top Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <Link
            href="/admin/products"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              color: 'var(--admin-text-secondary)',
              textDecoration: 'none',
              marginBottom: 8,
              transition: 'color 0.2s',
            }}
          >
            <ArrowLeft size={16} /> Quay lại danh sách sản phẩm
          </Link>
          <h1
            style={{
              fontFamily: 'var(--font-cinzel)',
              fontSize: 24,
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '0.03em',
              margin: 0,
            }}
          >
            Chỉnh sửa sản phẩm
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--admin-gold)', background: 'var(--admin-surface-elevated)', padding: '2px 8px', borderRadius: 4 }}>
              SKU: {sku || 'SP---'}
            </span>
            <span style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>ID: {productId}</span>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 4,
                background: parseInt(stock) > 0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: parseInt(stock) > 0 ? '#4ade80' : '#f87171',
              }}
            >
              {parseInt(stock) > 0 ? `Còn hàng (${stock})` : 'Hết hàng (Web báo hết)'}
            </span>
            <span style={{ fontSize: 12, color: 'var(--admin-text-secondary)', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 4 }}>
              Phân loại: {CATEGORIES.find((c) => c.id === categoryId)?.name || 'Khác'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <a
            href={`/products/${slug || rawSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn admin-btn-secondary"
            title="Mở xem trên giao diện khách hàng"
          >
            <ExternalLink size={15} /> Xem trên Web
          </a>
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="admin-btn admin-btn-primary"
            style={{ minWidth: 140 }}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          style={{
            marginBottom: 20,
            padding: '12px 18px',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13.5,
            background: notification.type === 'success' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: `1px solid ${notification.type === 'success' ? '#22c55e' : '#ef4444'}`,
            color: notification.type === 'success' ? '#4ade80' : '#f87171',
          }}
        >
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Form Content Grid */}
      <div className="form-grid">
        {/* Left Column: Tên, Mô tả, Quản lý ảnh */}
        <div>
          {/* Card 1: Thông tin định danh */}
          <div className="form-section">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={16} style={{ color: 'var(--admin-gold)' }} />
              Tên &amp; Mô tả sản phẩm
            </h3>

            <div className="form-group">
              <label className="admin-label">Tên sản phẩm (Bắt buộc) *</label>
              <input
                className="admin-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên sản phẩm trang sức luxury..."
                style={{ fontSize: 14, fontWeight: 500 }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="admin-label">Mã SKU</label>
                <input
                  className="admin-input"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="VD: SP0058"
                  style={{ fontFamily: 'monospace' }}
                />
              </div>
              <div className="form-group">
                <label className="admin-label">Đường dẫn URL (Slug)</label>
                <input
                  className="admin-input"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="slug-san-pham"
                  style={{ fontFamily: 'monospace' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="admin-label">Mô tả sản phẩm</label>
              <textarea
                className="admin-textarea"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả kỹ thuật chế tác, nguồn cảm hứng thiết kế, ý nghĩa phong thủy hoặc hướng dẫn bảo quản..."
              />
            </div>
          </div>

          {/* Card 2: Quản lý hình ảnh */}
          <div className="form-section" style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <ImageIcon size={16} style={{ color: 'var(--admin-gold)' }} />
                Hình ảnh sản phẩm ({images.length} ảnh)
              </h3>
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
                  — Giúp danh mục &amp; trang chủ xếp lưới đều tăm tắp, sang trọng.
                </li>
                <li>
                  <strong style={{ color: '#ffffff' }}>Độ phân giải lý tưởng:</strong>{' '}
                  <span style={{ color: 'var(--admin-gold)', fontWeight: 600 }}>1000 × 1000 px</span> đến{' '}
                  <span style={{ color: 'var(--admin-gold)', fontWeight: 600 }}>1200 × 1200 px</span> (Tối thiểu{' '}
                  <span style={{ color: '#ffffff' }}>800 × 800 px</span>) — Zoom rõ nét từng giác cắt đá, hoa văn bạc.
                </li>
                <li>
                  <strong style={{ color: '#ffffff' }}>Định dạng &amp; Dung lượng:</strong> Ưu tiên{' '}
                  <span style={{ color: '#ffffff' }}>WebP</span> hoặc <span style={{ color: '#ffffff' }}>JPG</span> chất lượng cao, dung lượng{' '}
                  <strong style={{ color: '#10b981' }}>&lt; 1.5 MB</strong> mỗi ảnh để tối ưu tốc độ tải trang.
                </li>
                <li>
                  <strong style={{ color: '#ffffff' }}>Phông nền:</strong> Khuyên dùng nền đơn sắc (trắng, đen hoặc xám studio) để sản phẩm nổi bật ánh kim.
                </li>
              </ul>
            </div>

            {/* Gallery Grid */}
            {images.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: 14,
                  marginBottom: 18,
                }}
              >
                {images.map((img, idx) => {
                  const urlFormatted = img.url.startsWith('/') || img.url.startsWith('http') || img.url.startsWith('data:')
                    ? img.url
                    : `/${img.url}`

                  return (
                    <div
                      key={idx}
                      style={{
                        position: 'relative',
                        borderRadius: 10,
                        overflow: 'hidden',
                        border: img.is_primary ? '2px solid var(--admin-gold)' : '1px solid var(--admin-border)',
                        background: '#121215',
                        boxShadow: img.is_primary ? '0 0 12px rgba(255, 255, 255, 0.2)' : undefined,
                      }}
                    >
                      <div style={{ width: '100%', height: 120, overflow: 'hidden' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={urlFormatted}
                          alt={`Ảnh ${idx + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>

                      {img.is_primary && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 6,
                            left: 6,
                            background: 'var(--admin-gold)',
                            color: '#000',
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: 4,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                          }}
                        >
                          <Star size={10} /> Ảnh chính
                        </div>
                      )}

                      <div
                        style={{
                          padding: '6px 8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: 'rgba(0,0,0,0.6)',
                          backdropFilter: 'blur(4px)',
                        }}
                      >
                        {!img.is_primary ? (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(idx)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--admin-gold)',
                              fontSize: 11,
                              cursor: 'pointer',
                              padding: '2px 4px',
                            }}
                            title="Đặt làm ảnh đại diện chính"
                          >
                            Làm chính
                          </button>
                        ) : (
                          <span style={{ fontSize: 11, color: 'var(--admin-gold)' }}>Chính</span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: 2,
                          }}
                          title="Xóa ảnh này"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div
                style={{
                  padding: '30px 20px',
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 10,
                  border: '1px dashed var(--admin-border)',
                  marginBottom: 16,
                }}
              >
                <p style={{ color: 'var(--admin-text-secondary)', fontSize: 13, margin: 0 }}>
                  Chưa có hình ảnh nào cho sản phẩm này. Thêm ảnh từ URL hoặc tải tệp bên dưới.
                </p>
              </div>
            )}

            {/* Add Image Inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* URL Input */}
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="admin-input"
                  placeholder="Nhập đường dẫn ảnh: /images/SP0058-1.jpg hoặc link web..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddImageUrl()
                    }
                  }}
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

              {/* File Upload / Drag & Drop Box */}
              <div
                onDragOver={handleDragOver}
                onDragEnter={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('edit-product-file-input')?.click()}
                style={{
                  border: isDragging ? '2px dashed var(--admin-gold)' : '2px dashed var(--admin-border)',
                  background: isDragging ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 0,
                  padding: '24px 16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                }}
              >
                <input
                  id="edit-product-file-input"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />

                <div
                  style={{
                    width: 46,
                    height: 46,
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
                    <Loader2 size={22} className="animate-spin" />
                  ) : (
                    <Upload size={22} />
                  )}
                </div>

                <div>
                  <p style={{ fontWeight: 600, color: 'var(--admin-text)', fontSize: 13, margin: 0 }}>
                    {isDragging ? 'Thả ảnh vào đây ngay...' : 'Kéo thả ảnh vào đây hoặc bấm để chọn từ máy tính'}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--admin-text-muted)', margin: '4px 0 0' }}>
                    Hỗ trợ tải lên nhiều ảnh (PNG, JPG, WebP, GIF)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Giá, Tồn kho, Phân loại, Kích thước */}
        <div>
          {/* Card 3: Giá bán & Tồn kho */}
          <div className="form-section">
            <h3>Giá bán &amp; Tồn kho</h3>

            <div className="form-group">
              <label className="admin-label">Giá bán chính thức (VNĐ) *</label>
              <input
                className="admin-input"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="4660000"
                style={{ fontSize: 15, fontWeight: 700, color: '#ffffff' }}
              />
            </div>

            <div className="form-group">
              <label className="admin-label">Giá gốc / Giá so sánh (VNĐ)</label>
              <input
                className="admin-input"
                type="number"
                value={importPrice}
                onChange={(e) => setImportPrice(e.target.value)}
                placeholder="Để trống nếu không hiển thị giảm giá"
              />
            </div>

            <div className="form-group">
              <label className="admin-label">
                Số lượng tồn kho (Tác phẩm độc bản có thể = 1) *
              </label>
              <input
                className="admin-input"
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="1"
                style={{ fontSize: 15, fontWeight: 700, color: parseInt(stock) > 0 ? '#4ade80' : '#f87171' }}
              />
              <span style={{ fontSize: 11.5, color: 'var(--admin-text-secondary)', marginTop: 4, display: 'block' }}>
                {parseInt(stock) > 0
                  ? '✓ Sản phẩm hiển thị Còn hàng trên website'
                  : '⚠ Web sẽ hiển thị Tạm hết hàng và khóa nút mua'}
              </span>
            </div>

            <div className="form-group">
              <label className="admin-label">Chất liệu chế tác</label>
              <input
                className="admin-input"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="VD: Bạc 925 Sterling Silver, Vàng trắng 14K..."
              />
            </div>
          </div>

          {/* Card 4: Phân loại & Thương hiệu */}
          <div className="form-section" style={{ marginTop: 24 }}>
            <h3>Phân loại &amp; Trạng thái</h3>

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
              <label className="admin-label">Huy hiệu nổi bật (Badge)</label>
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

            <div className="form-group">
              <label className="admin-label">Trạng thái kinh doanh</label>
              <select
                className="admin-select"
                style={{ width: '100%' }}
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="active">Đang mở bán công khai</option>
                <option value="inactive">Tạm ẩn khỏi trang web</option>
              </select>
            </div>
          </div>

          {/* Card 5: Kích thước theo Danh mục (QUẦN ÁO: S, M, L, XL; NHẪN: 6-14; VÒNG TAY: 16-21cm...) */}
          <div className="form-section" style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              <div>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Tag size={16} style={{ color: 'var(--admin-gold)' }} />
                  {currentSizePreset.label}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--admin-text-secondary)' }}>
                  {currentSizePreset.desc} (Danh mục: <strong style={{ color: 'var(--admin-gold)' }}>{CATEGORIES.find((c) => c.id === categoryId)?.name}</strong>)
                </p>
              </div>

              {/* Quick actions */}
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  onClick={handleSelectAllPresetSizes}
                  className="admin-btn-icon"
                  style={{ fontSize: 11, padding: '4px 8px', width: 'auto', height: 26, borderRadius: 4, background: 'rgba(255,255,255,0.06)' }}
                  title="Chọn tất cả các size chuẩn"
                >
                  Chọn tất cả
                </button>
                <button
                  type="button"
                  onClick={handleClearAllSizes}
                  className="admin-btn-icon"
                  style={{ fontSize: 11, padding: '4px 8px', width: 'auto', height: 26, borderRadius: 4, background: 'rgba(255,255,255,0.06)', color: 'var(--admin-danger)' }}
                  title="Xóa danh sách size"
                >
                  Xóa hết
                </button>
              </div>
            </div>

            {/* Preset Toggle Buttons */}
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 11.5, color: 'var(--admin-text-muted)', display: 'block', marginBottom: 8 }}>
                Bấm vào các ô bên dưới để bật / tắt size cho sản phẩm này:
              </span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {currentSizePreset.sizes.map((s) => {
                  const isSelected = selectedSizes.includes(s)
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSize(s)}
                      style={{
                        padding: '7px 14px',
                        borderRadius: 0,
                        border: isSelected ? '1.5px solid var(--admin-gold)' : '1px solid var(--admin-border)',
                        background: isSelected
                          ? 'rgba(255, 255, 255, 0.16)'
                          : 'var(--admin-surface-elevated)',
                        color: isSelected ? 'var(--admin-gold)' : 'var(--admin-text-secondary)',
                        fontSize: 13,
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.18s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        boxShadow: 'none',
                      }}
                    >
                      {isSelected && <Check size={13} style={{ strokeWidth: 3 }} />}
                      {s}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Custom Size Adder */}
            <div style={{ marginBottom: 14 }}>
              <span style={{ fontSize: 11.5, color: 'var(--admin-text-muted)', display: 'block', marginBottom: 6 }}>
                Hoặc thêm size tùy biến riêng:
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="admin-input"
                  placeholder={
                    categoryId === 7
                      ? 'VD: 4XL, Oversize...'
                      : categoryId === 1
                        ? 'VD: 8.5, 9.5...'
                        : 'VD: Bản 18mm, Freesize...'
                  }
                  value={customSizeInput}
                  onChange={(e) => setCustomSizeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddCustomSize()
                    }
                  }}
                  style={{ height: 36, fontSize: 13 }}
                />
                <button
                  type="button"
                  onClick={handleAddCustomSize}
                  className="admin-btn admin-btn-secondary"
                  style={{ height: 36, padding: '0 14px', flexShrink: 0 }}
                >
                  <Plus size={14} /> Thêm size
                </button>
              </div>
            </div>

            {/* Active Selected Sizes summary */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 8,
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--admin-border)',
              }}
            >
              <span style={{ fontSize: 11.5, color: 'var(--admin-text-muted)', display: 'block', marginBottom: 8 }}>
                Size sẽ hiển thị ngoài web ({selectedSizes.length} kích thước):
              </span>

              {selectedSizes.length > 0 ? (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {selectedSizes.map((s) => (
                    <span
                      key={s}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '4px 10px',
                        borderRadius: 0,
                        background: 'rgba(255, 255, 255, 0.12)',
                        border: '1px solid var(--admin-border-strong)',
                        color: 'var(--admin-gold)',
                        fontSize: 12.5,
                        fontWeight: 600,
                      }}
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => toggleSize(s)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--admin-text-muted)',
                          cursor: 'pointer',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        title={`Bỏ size ${s}`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <span style={{ fontSize: 12, color: 'var(--admin-warning)', fontStyle: 'italic' }}>
                  Chưa chọn size nào (Sản phẩm sẽ hiển thị Không có size / Freesize).
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div className="form-actions" style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <Link href="/admin/products" className="admin-btn admin-btn-secondary">
          Hủy bỏ
        </Link>
        <button
          type="button"
          onClick={() => handleSave()}
          disabled={saving}
          className="admin-btn admin-btn-primary"
          style={{ minWidth: 150 }}
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Đang lưu...' : 'Lưu sản phẩm'}
        </button>
      </div>
    </>
  )
}
