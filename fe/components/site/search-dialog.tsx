'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, X, Loader2, ArrowRight, Sparkles, Tag } from 'lucide-react'
import { formatPrice, type Product } from '@/lib/products'
import { useLanguage } from '@/lib/i18n'

interface SearchDialogProps {
  isOpen: boolean
  onClose: () => void
}

const POPULAR_SEARCHES = [
  'Chrome Hearts',
  'Nhẫn bạc',
  'Mặt dây chuyền',
  'Vòng & Lắc tay',
  'BE@RBRICK',
  'Zippo',
]

export function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const router = useRouter()
  const { lang } = useLanguage()
  const isEn = lang === 'en'

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setTimeout(() => inputRef.current?.focus(), 80)
    } else {
      document.body.style.overflow = ''
      setQuery('')
      setResults([])
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Debounced search query
  useEffect(() => {
    if (!isOpen) return

    const trimmed = query.trim()
    setIsLoading(true)

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(trimmed)}`)
        if (res.ok) {
          const data = await res.json()
          setResults(data.products || [])
        }
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        setIsLoading(false)
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [query, isOpen])

  const handleGoToCollections = (searchWord?: string) => {
    const term = (searchWord !== undefined ? searchWord : query).trim()
    onClose()
    if (term) {
      router.push(`/collections?q=${encodeURIComponent(term)}`)
    } else {
      router.push('/collections')
    }
  }

  const handleSelectProduct = (slug: string) => {
    onClose()
    router.push(`/products/${slug}`)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-16 md:pt-20 px-3 sm:px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Dialog Container - Dạng Hộp Chữ Nhật Sang Trọng */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -18 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-label="Tìm kiếm sản phẩm"
            className="relative z-10 w-full max-w-2xl sm:max-w-3xl overflow-hidden rounded-md border-2 border-[var(--admin-gold)]/40 bg-[var(--surface-primary)] shadow-[0_0_35px_rgba(212,175,55,0.15)]"
          >
            {/* Search Input Bar - Dạng Hộp Chữ Nhật To Bản */}
            <div className="relative flex items-center border-b border-[var(--border-subtle)] bg-[var(--surface-secondary)]/60 px-4 py-3 sm:px-6 sm:py-4">
              <Search className="size-6 shrink-0 text-[var(--admin-gold)]" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleGoToCollections()
                  }
                }}
                placeholder={
                  isEn
                    ? 'Search rings, pendants, Chrome Hearts, silver 925 by name or material...'
                    : 'Tìm kiếm nhẫn, mặt dây chuyền, Chrome Hearts, bạc 925 theo tên, chất liệu...'
                }
                className="ml-3.5 flex-1 bg-transparent text-sm sm:text-base md:text-lg font-medium text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
              />

              <div className="flex items-center gap-2 shrink-0">
                {isLoading && (
                  <Loader2 className="size-4 animate-spin text-[var(--admin-gold)]" />
                )}
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('')
                      inputRef.current?.focus()
                    }}
                    className="flex size-8 items-center justify-center rounded text-[var(--text-muted)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)] transition-colors"
                    title="Xóa tìm kiếm"
                  >
                    <X className="size-4" />
                  </button>
                )}
                {/* Nút Hộp Chữ Nhật "TÌM KIẾM" */}
                <button
                  type="button"
                  onClick={() => handleGoToCollections()}
                  className="hidden sm:flex h-9 items-center justify-center px-4 rounded-sm font-bold text-xs uppercase tracking-[0.16em] bg-[var(--admin-gold)] text-black hover:opacity-90 active:scale-95 transition-all shadow-sm"
                >
                  {isEn ? 'Search' : 'Tìm Kiếm'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded px-2 py-1 text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)] transition-colors border border-[var(--border-subtle)]"
                  title="Đóng (ESC)"
                >
                  ESC
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="max-h-[62vh] overflow-y-auto p-4 sm:p-6 space-y-5">
              {/* Popular tags suggestion when query is short */}
              {!query.trim() && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                    <Tag className="size-3.5 text-[var(--admin-gold)]" />
                    <span>{isEn ? 'Popular Searches' : 'Tìm kiếm phổ biến'}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SEARCHES.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setQuery(tag)
                          inputRef.current?.focus()
                        }}
                        className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-3 py-1.5 text-xs text-[var(--text-secondary)] transition-all hover:border-[var(--admin-gold)] hover:text-[var(--text-primary)]"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matching Products */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-[var(--admin-gold)]" />
                    {query.trim()
                      ? isEn
                        ? `Matching Products (${results.length})`
                        : `Sản phẩm phù hợp (${results.length})`
                      : isEn
                        ? 'Suggested Items'
                        : 'Sản phẩm gợi ý cho bạn'}
                  </span>
                  {query.trim() && results.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleGoToCollections()}
                      className="text-[11px] text-[var(--admin-gold)] hover:underline inline-flex items-center gap-1 lowercase"
                    >
                      {isEn ? 'view all' : 'xem tất cả'}
                      <ArrowRight className="size-3" />
                    </button>
                  )}
                </div>

                {results.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {results.slice(0, 8).map((product) => (
                      <div
                        key={product.slug}
                        onClick={() => handleSelectProduct(product.slug)}
                        className="group flex items-center gap-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-2.5 cursor-pointer transition-all hover:border-[var(--admin-gold)] hover:bg-[var(--hover-bg)]"
                      >
                        <div className="relative size-14 shrink-0 overflow-hidden rounded bg-[var(--surface-primary)] border border-[var(--border-subtle)]">
                          <Image
                            src={product.image || '/placeholder.svg'}
                            alt={product.name}
                            fill
                            sizes="56px"
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h4 className="truncate text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--admin-gold)] transition-colors">
                              {product.name}
                            </h4>
                          </div>
                          <p className="mt-0.5 text-xs font-bold text-[var(--text-primary)] tabular-nums">
                            {formatPrice(product.price)}
                          </p>
                          {product.badge && (
                            <span className="mt-1 inline-block text-[9px] font-bold uppercase tracking-wider text-[var(--admin-gold)]">
                              ★ {product.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  query.trim() &&
                  !isLoading && (
                    <div className="py-8 text-center">
                      <p className="text-sm text-[var(--text-secondary)]">
                        {isEn
                          ? `No products found matching "${query}"`
                          : `Không tìm thấy sản phẩm nào với từ khóa "${query}"`}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleGoToCollections('')}
                        className="mt-3 text-xs text-[var(--admin-gold)] underline hover:opacity-80"
                      >
                        {isEn ? 'Browse all collections' : 'Khám phá tất cả bộ sưu tập →'}
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Bottom bar */}
            {query.trim() && results.length > 0 && (
              <div className="border-t border-[var(--border-subtle)] bg-[var(--surface-secondary)]/50 px-4 py-2.5 sm:px-6 flex items-center justify-between">
                <span className="text-xs text-[var(--text-muted)]">
                  {isEn ? 'Press Enter to search' : 'Nhấn Enter để xem toàn bộ kết quả'}
                </span>
                <button
                  type="button"
                  onClick={() => handleGoToCollections()}
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--admin-gold)] hover:underline"
                >
                  <span>{isEn ? 'Search Collections' : 'Xem trong Bộ sưu tập'}</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
