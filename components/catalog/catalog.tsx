'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ProductCard } from '@/components/site/product-card'
import { CATEGORIES, type Category, type Product } from '@/lib/products'
import { cn } from '@/lib/utils'

type Sort = 'featured' | 'price-asc' | 'price-desc'

export function Catalog({ products }: { products: Product[] }) {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const category = (params.get('c') as Category | null) ?? 'all'
  const sort = (params.get('sort') as Sort | null) ?? 'featured'

  const setParam = (key: string, value: string, fallback: string) => {
    const next = new URLSearchParams(params.toString())
    if (value === fallback) next.delete(key)
    else next.set(key, value)
    const qs = next.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const visible = useMemo(() => {
    const filtered = category === 'all' ? products : products.filter((p) => p.category === category)
    if (sort === 'price-asc') return [...filtered].sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') return [...filtered].sort((a, b) => b.price - a.price)
    return filtered
  }, [products, category, sort])

  return (
    <>
      <div className="sticky top-[57px] z-30 -mx-4 mb-8 flex flex-wrap items-center justify-between gap-4 border-y border-white/10 bg-[#0c0c0e]/95 px-4 py-3 backdrop-blur md:top-[65px] md:-mx-8 md:px-8">
        <div role="tablist" aria-label="Filter by category" className="flex gap-2 overflow-x-auto">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              role="tab"
              aria-selected={category === c.value}
              onClick={() => setParam('c', c.value, 'all')}
              className={cn(
                'relative whitespace-nowrap rounded-sm px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] transition-colors',
                category === c.value
                  ? 'bg-white text-black'
                  : 'text-zinc-400 hover:text-white',
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-zinc-400 tabular-nums">{visible.length} sản phẩm</span>
          <label htmlFor="sort" className="sr-only">
            Sắp xếp theo
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setParam('sort', e.target.value, 'featured')}
            className="rounded-sm border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-white"
          >
            <option value="featured">Nổi bật</option>
            <option value="price-asc">Giá: Thấp đến cao</option>
            <option value="price-desc">Giá: Cao đến thấp</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
        {visible.map((p, i) => (
          <ProductCard key={p.slug} product={p} priority={i < 4} />
        ))}
      </div>
    </>
  )
}
