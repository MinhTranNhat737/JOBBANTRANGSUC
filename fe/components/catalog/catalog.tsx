'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Search, SlidersHorizontal, X } from 'lucide-react'
import { ProductCard } from '@/components/site/product-card'
import { type Category, type Product } from '@/lib/products'
import { useLanguage } from '@/lib/i18n'
import { cn } from '@/lib/utils'

type Sort = 'featured' | 'price-asc' | 'price-desc'
type PriceRange = 'all' | 'under-1500' | '1500-2500' | 'above-2500'
type Availability = 'all' | 'in-stock'
type BadgeFilter = 'all' | 'New' | 'Best seller' | 'Limited'

export function Catalog({ products }: { products: Product[] }) {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const category = (params.get('c') as Category | null) ?? 'all'
  const sort = (params.get('sort') as Sort | null) ?? 'featured'
  const priceParam = (params.get('price') as PriceRange | null) ?? 'all'
  const availParam = (params.get('avail') as Availability | null) ?? 'all'

  // Tự động nhận diện New In qua param badge=New, tag=new, filter=new, new=true, v.v.
  const rawBadge = (params.get('badge') || params.get('tag') || params.get('filter') || '').trim()
  const isNewInRequested =
    params.get('new') === 'true' ||
    params.get('newIn') === 'true' ||
    rawBadge.toLowerCase() === 'new' ||
    rawBadge.toLowerCase() === 'new-in' ||
    rawBadge.toLowerCase() === 'newin' ||
    rawBadge.toLowerCase() === 'moi'

  const badgeParam: BadgeFilter = isNewInRequested
    ? 'New'
    : rawBadge.toLowerCase() === 'best seller' || rawBadge.toLowerCase() === 'bestseller'
      ? 'Best seller'
      : rawBadge.toLowerCase() === 'limited'
        ? 'Limited'
        : 'all'
  const searchParam = (params.get('q') as string | null) ?? ''

  // Bộ lọc mặc định ẩn, chỉ mở khi người dùng bấm vào nút Filter
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchParam)
  const { lang } = useLanguage()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Đồng bộ ô tìm kiếm khi URL thay đổi (ví dụ bấm từ Navbar Search)
  useEffect(() => {
    setSearchQuery(searchParam)
  }, [searchParam])

  const isEn = mounted && lang === 'en'

  const categories = [
    { value: 'all', label: isEn ? 'All' : 'TẤT CẢ' },
    { value: 'rings', label: isEn ? 'Silver Rings' : 'NHẪN BẠC' },
    { value: 'pendants', label: isEn ? 'Pendants' : 'MẶT DÂY CHUYỀN' },
    { value: 'bracelets', label: isEn ? 'Bracelets' : 'VÒNG & LẮC TAY' },
    { value: 'earrings', label: isEn ? 'Earrings' : 'KHUYÊN TAI' },
    { value: 'accessories', label: isEn ? 'Accessories' : 'PHỤ KIỆN' },
  ]

  const priceRanges: { value: PriceRange; label: string }[] = [
    { value: 'all', label: isEn ? 'All Prices' : 'Tất cả mức giá' },
    { value: 'under-1500', label: isEn ? 'Under 1,500,000₫' : 'Dưới 1.500.000₫' },
    { value: '1500-2500', label: '1.500.000₫ – 2.500.000₫' },
    { value: 'above-2500', label: isEn ? 'Over 2,500,000₫' : 'Trên 2.500.000₫' },
  ]

  const badgeOptions: { value: BadgeFilter; label: string }[] = [
    { value: 'all', label: isEn ? 'All Collections' : 'Tất cả' },
    { value: 'New', label: isEn ? 'New Arrivals' : 'Hàng mới (New)' },
    { value: 'Best seller', label: isEn ? 'Best Seller' : 'Bán chạy nhất' },
    { value: 'Limited', label: isEn ? 'Limited Edition' : 'Bản giới hạn' },
  ]

  const setParam = (key: string, value: string, fallback: string) => {
    const next = new URLSearchParams(params.toString())
    if (value === fallback) next.delete(key)
    else next.set(key, value)
    const qs = next.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const handleSearchSubmit = (value?: string) => {
    const term = (value !== undefined ? value : searchQuery).trim()
    setParam('q', term, '')
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setParam('q', '', '')
  }

  const resetAllFilters = () => {
    setSearchQuery('')
    const next = new URLSearchParams()
    if (category !== 'all') next.set('c', category)
    if (sort !== 'featured') next.set('sort', sort)
    const qs = next.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  // Đếm các bộ lọc đang được kích hoạt (ngoại trừ category và sort)
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (searchParam.trim()) count++
    if (priceParam !== 'all') count++
    if (availParam !== 'all') count++
    if (badgeParam !== 'all') count++
    return count
  }, [searchParam, priceParam, availParam, badgeParam])

  const visible = useMemo(() => {
    let filtered = products

    // Lọc theo từ khóa tìm kiếm
    if (searchParam.trim()) {
      const q = searchParam.trim().toLowerCase()
      filtered = filtered.filter((p) => {
        const nameMatch = p.name?.toLowerCase().includes(q)
        const descMatch = p.description?.toLowerCase().includes(q)
        const matMatch = p.material?.toLowerCase().includes(q)
        const slugMatch = p.slug?.toLowerCase().includes(q)
        const catMatch = p.category?.toLowerCase().includes(q)
        const badgeMatch = p.badge?.toLowerCase().includes(q)
        return nameMatch || descMatch || matMatch || slugMatch || catMatch || badgeMatch
      })
    }

    if (category !== 'all') {
      filtered = filtered.filter((p) => p.category === category)
    }

    if (priceParam === 'under-1500') {
      filtered = filtered.filter((p) => p.price < 1500000)
    } else if (priceParam === '1500-2500') {
      filtered = filtered.filter((p) => p.price >= 1500000 && p.price <= 2500000)
    } else if (priceParam === 'above-2500') {
      filtered = filtered.filter((p) => p.price > 2500000)
    }

    if (availParam === 'in-stock') {
      filtered = filtered.filter((p) => p.stock > 0)
    }

    if (badgeParam !== 'all') {
      filtered = filtered.filter((p) => {
        if (badgeParam === 'New') {
          const b = (p.badge || '').toLowerCase().trim()
          return b === 'new' || b.includes('new') || b.includes('mới')
        }
        return (p.badge || '').toLowerCase() === badgeParam.toLowerCase()
      })
    }

    if (sort === 'price-asc') return [...filtered].sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') return [...filtered].sort((a, b) => b.price - a.price)
    return filtered
  }, [products, searchParam, category, sort, priceParam, availParam, badgeParam])

  // Khóa scroll khi mở drawer bên trái
  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isFilterOpen])

  return (
    <>
      {/* ── DÒNG DANH MỤC SẢN PHẨM Ở TRÊN ĐẦU TRANG – RÕ RÀNG VÀ BORDERLESS ── */}
      <div
        style={{ top: 'var(--site-header-height, 86px)' }}
        className="sticky z-30 mb-6 border-b border-[var(--border-subtle)] bg-[var(--header-bg)]/95 px-3 py-3 shadow-sm backdrop-blur-md sm:px-5 md:px-6 lg:px-8 transition-all"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Dòng các danh mục sản phẩm kèm ô tìm kiếm chữ nhật ngay cạnh nút Phụ kiện */}
          <div
            role="tablist"
            aria-label="Danh mục sản phẩm"
            className="flex items-center gap-4 sm:gap-6 md:gap-7 overflow-x-auto pb-1"
          >
            {categories.map((c) => {
              const active = category === c.value
              return (
                <button
                  key={c.value}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setParam('c', c.value, 'all')}
                  className={cn(
                    'group relative whitespace-nowrap py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition-all',
                    active
                      ? 'text-[var(--text-primary)] font-bold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
                  )}
                >
                  <span>{c.label}</span>
                  {/* Vạch chỉ báo dưới danh mục đang chọn */}
                  <span
                    className={cn(
                      'absolute inset-x-0 -bottom-1 h-[2px] bg-[var(--text-primary)] transition-all duration-200',
                      active ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 group-hover:opacity-50 group-hover:scale-x-50',
                    )}
                  />
                </button>
              )
            })}

            {/* Hộp tìm kiếm chữ nhật ngay bên cạnh nút Phụ kiện */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSearchSubmit()
              }}
              className="group relative flex items-center h-8 sm:h-8.5 w-44 sm:w-56 md:w-64 rounded-sm border border-[var(--border-subtle)] bg-[var(--surface-secondary)] transition-all duration-200 hover:border-[var(--admin-gold)] focus-within:border-[var(--admin-gold)] focus-within:ring-1 focus-within:ring-[var(--admin-gold)]/30 shrink-0 ml-1 sm:ml-2"
            >
              <Search className="size-3.5 ml-2.5 text-[var(--admin-gold)] shrink-0 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  if (e.target.value === '') {
                    handleClearSearch()
                  }
                }}
                placeholder={isEn ? 'Search...' : 'Tìm sản phẩm...'}
                className="h-full flex-1 bg-transparent px-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="flex size-5 items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] mr-1"
                  title="Xóa tìm kiếm"
                >
                  <X className="size-3" />
                </button>
              )}
              <button
                type="submit"
                className="h-full px-2.5 sm:px-3 bg-[var(--text-primary)] text-[var(--surface-primary)] hover:opacity-90 font-bold text-[10px] uppercase tracking-wider rounded-r-sm shrink-0"
              >
                {isEn ? 'Find' : 'Tìm'}
              </button>
            </form>
          </div>

          {/* Phía bên phải: Nút BỘ LỌC + Sắp xếp + Số lượng sản phẩm */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <span className="hidden text-xs font-semibold text-[var(--text-secondary)] tabular-nums sm:inline-block">
              {badgeParam === 'New'
                ? isEn
                  ? `${visible.length} new items found`
                  : `Tìm thấy ${visible.length} sản phẩm mới`
                : `${visible.length} ${isEn ? 'items' : 'sản phẩm'}`}
            </span>

            {/* Nút bấm mở Bộ lọc bên tay trái */}
            <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              className={cn(
                'flex items-center gap-2 rounded-sm border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all',
                activeFilterCount > 0
                  ? 'border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--surface-primary)]'
                  : 'border-[var(--border-subtle)] bg-[var(--surface-secondary)] text-[var(--text-primary)] hover:border-[var(--border-strong)]',
              )}
              aria-label="Mở bộ lọc"
            >
              <SlidersHorizontal className="size-3.5" />
              <span>{isEn ? 'Filter' : 'Bộ Lọc'}</span>
              {activeFilterCount > 0 && (
                <span className="flex size-4 items-center justify-center rounded-full bg-[var(--surface-primary)] text-[9px] font-bold text-[var(--text-primary)]">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sắp xếp */}
            <label htmlFor="sort" className="sr-only">
              {isEn ? 'Sort by' : 'Sắp xếp theo'}
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setParam('sort', e.target.value, 'featured')}
              className="rounded-sm border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-[var(--text-primary)] transition-colors focus:outline-none cursor-pointer"
            >
              <option value="featured">{isEn ? 'Featured' : 'Nổi bật'}</option>
              <option value="price-asc">{isEn ? 'Price: Low to High' : 'Giá: Thấp đến cao'}</option>
              <option value="price-desc">{isEn ? 'Price: High to Low' : 'Giá: Cao đến thấp'}</option>
            </select>
          </div>
        </div>

        {/* Thanh nhỏ hiển thị các tag đang lọc & từ khóa đang tìm kiếm */}
        {activeFilterCount > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
              {isEn ? 'Filtering:' : 'Đang lọc:'}
            </span>

            {/* Tag từ khóa tìm kiếm */}
            {searchParam.trim() && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--admin-gold)] bg-[var(--admin-gold)]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--admin-gold)]/20"
                title="Bấm để xóa từ khóa tìm kiếm"
              >
                <Search className="size-3 text-[var(--admin-gold)]" />
                <span>&quot;{searchParam}&quot;</span>
                <X className="size-3" />
              </button>
            )}

            {priceParam !== 'all' && (
              <button
                type="button"
                onClick={() => setParam('price', 'all', 'all')}
                className="inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-2.5 py-0.5 text-[11px] text-[var(--text-primary)] transition-colors hover:border-[var(--text-primary)]"
              >
                <span>{priceRanges.find((p) => p.value === priceParam)?.label}</span>
                <X className="size-3" />
              </button>
            )}
            {availParam !== 'all' && (
              <button
                type="button"
                onClick={() => setParam('avail', 'all', 'all')}
                className="inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-2.5 py-0.5 text-[11px] text-[var(--text-primary)] transition-colors hover:border-[var(--text-primary)]"
              >
                <span>{isEn ? 'In Stock' : 'Còn hàng'}</span>
                <X className="size-3" />
              </button>
            )}
            {badgeParam !== 'all' && (
              <button
                type="button"
                onClick={() => {
                  const next = new URLSearchParams(params.toString())
                  next.delete('badge')
                  next.delete('tag')
                  next.delete('filter')
                  next.delete('new')
                  next.delete('newIn')
                  const qs = next.toString()
                  router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
                }}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] transition-colors',
                  badgeParam === 'New'
                    ? 'border border-amber-500/50 bg-amber-500/15 text-amber-300 font-semibold hover:bg-amber-500/25'
                    : 'border border-[var(--border-subtle)] bg-[var(--surface-secondary)] text-[var(--text-primary)] hover:border-[var(--text-primary)]'
                )}
                title="Bấm để xóa lọc"
              >
                <span>
                  {badgeParam === 'New'
                    ? (isEn ? '✨ New Arrivals (NEW IN)' : '✨ Hàng mới (NEW IN)')
                    : badgeOptions.find((b) => b.value === badgeParam)?.label}
                </span>
                <X className="size-3" />
              </button>
            )}
            <button
              type="button"
              onClick={resetAllFilters}
              className="text-[11px] text-[var(--text-muted)] underline underline-offset-4 hover:text-[var(--text-primary)] transition-colors ml-1"
            >
              {isEn ? 'Clear all' : 'Xóa tất cả'}
            </button>
          </div>
        )}
      </div>

      {/* ── BỘ LỌC TRƯỢT TỪ BÊN TAY TRÁI (CHỈ HIỂN THỊ KHI BẤM NÚT FILTER) ── */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            {/* Lớp overlay mờ nền phía sau */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Panel bộ lọc tối giản trượt từ mép bên trái */}
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Bộ lọc sản phẩm"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.28, ease: 'easeOut' }}
              className="fixed inset-y-0 left-0 z-50 flex w-full max-w-xs flex-col bg-[var(--surface-primary)] shadow-2xl sm:max-w-sm"
            >
              {/* Header của panel bộ lọc */}
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-6 py-5">
                <div className="flex items-center gap-2.5">
                  <SlidersHorizontal className="size-4 text-[var(--text-primary)]" />
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-primary)]">
                    {isEn ? 'Filter' : 'Bộ Lọc'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={resetAllFilters}
                      className="text-xs text-[var(--text-muted)] underline underline-offset-4 hover:text-[var(--text-primary)] transition-colors"
                    >
                      {isEn ? 'Reset' : 'Đặt lại'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen(false)}
                    className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    aria-label="Đóng bộ lọc"
                  >
                    <X className="size-5" />
                  </button>
                </div>
              </div>

              {/* Nội dung các tùy chọn lọc: Tối giản, không nút bấm rườm rà */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 text-xs">
                {/* 1. Khoảng giá */}
                <div>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                    {isEn ? 'Price Range' : 'Mức Giá'}
                  </p>
                  <ul className="space-y-1">
                    {priceRanges.map((p) => {
                      const active = priceParam === p.value
                      return (
                        <li key={p.value}>
                          <button
                            type="button"
                            onClick={() => setParam('price', p.value, 'all')}
                            className={cn(
                              'group flex w-full items-center justify-between py-2 text-left transition-colors',
                              active
                                ? 'font-bold text-[var(--text-primary)]'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                            )}
                          >
                            <span>{p.label}</span>
                            {active && <Check className="size-3.5 text-[var(--text-primary)]" />}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>

                {/* 2. Bộ sưu tập / Nhãn */}
                <div>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                    {isEn ? 'Collection' : 'Bộ Sưu Tập'}
                  </p>
                  <ul className="space-y-1">
                    {badgeOptions.map((b) => {
                      const active = badgeParam === b.value
                      return (
                        <li key={b.value}>
                          <button
                            type="button"
                            onClick={() => setParam('badge', b.value, 'all')}
                            className={cn(
                              'group flex w-full items-center justify-between py-2 text-left transition-colors',
                              active
                                ? 'font-bold text-[var(--text-primary)]'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                            )}
                          >
                            <span>{b.label}</span>
                            {active && <Check className="size-3.5 text-[var(--text-primary)]" />}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>

                {/* 3. Tình trạng hàng */}
                <div>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                    {isEn ? 'Availability' : 'Tình Trạng Hàng'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setParam('avail', availParam === 'in-stock' ? 'all' : 'in-stock', 'all')}
                    className={cn(
                      'group flex w-full items-center justify-between py-2 text-left transition-colors',
                      availParam === 'in-stock'
                        ? 'font-bold text-[var(--text-primary)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                    )}
                  >
                    <span>{isEn ? 'In Stock Only' : 'Chỉ hiện sản phẩm còn hàng'}</span>
                    {availParam === 'in-stock' && <Check className="size-3.5 text-[var(--text-primary)]" />}
                  </button>
                </div>
              </div>

              {/* Nút hành động xem kết quả dưới đáy panel */}
              <div className="border-t border-[var(--border-subtle)] p-6">
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full rounded-sm bg-[var(--text-primary)] py-3 text-xs font-bold uppercase tracking-[0.18em] text-[var(--surface-primary)] transition-opacity hover:opacity-90"
                >
                  {isEn ? `Show ${visible.length} Products` : `Xem ${visible.length} Sản Phẩm`}
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── LƯỚI SẢN PHẨM RỘNG RÃI (CÓ LỀ CÂN ĐỐI 2 BÊN) ── */}
      <div className="px-3 sm:px-5 md:px-6 lg:px-8">
        {visible.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 xl:grid-cols-4">
            {visible.map((p, i) => (
              <ProductCard key={p.slug} product={p} priority={i < 4} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            {searchParam.trim() ? (
              <Search className="size-10 text-[var(--text-muted)] opacity-50" />
            ) : (
              <SlidersHorizontal className="size-10 text-[var(--text-muted)] opacity-50" />
            )}
            <h3 className="mt-4 text-base font-semibold text-[var(--text-primary)]">
              {searchParam.trim()
                ? isEn
                  ? `No products found matching "${searchParam}"`
                  : `Không tìm thấy sản phẩm nào với từ khóa "${searchParam}"`
                : isEn
                  ? 'No products match your criteria'
                  : 'Không có tác phẩm nào phù hợp với bộ lọc'}
            </h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)] max-w-md">
              {searchParam.trim()
                ? isEn
                  ? 'Try searching with another keyword or clear the search to view all.'
                  : 'Hãy thử tìm kiếm với từ khóa khác như nhẫn, dây chuyền, Chrome Hearts hoặc bấm nút bên dưới.'
                : isEn
                  ? 'Try removing some filters or changing your selection.'
                  : 'Hãy thử xóa bớt các điều kiện lọc hoặc chọn mức giá khác.'}
            </p>
            <button
              type="button"
              onClick={resetAllFilters}
              className="mt-6 rounded-sm border border-[var(--border-strong)] bg-[var(--surface-secondary)] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] transition-all hover:bg-[var(--text-primary)] hover:text-[var(--surface-primary)]"
            >
              {searchParam.trim()
                ? isEn
                  ? 'Clear Search & Show All'
                  : 'Xóa Tìm Kiếm & Xem Tất Cả'
                : isEn
                  ? 'Reset All Filters'
                  : 'Đặt Lại Bộ Lọc'}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
