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
      <div className="sticky top-[65px] z-30 -mx-4 mb-8 flex flex-wrap items-center justify-between gap-4 border-y border-border bg-background/90 px-4 py-3 backdrop-blur md:top-[73px] md:-mx-8 md:px-8">
        <div role="tablist" aria-label="Filter by category" className="flex gap-1 overflow-x-auto">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              role="tab"
              aria-selected={category === c.value}
              onClick={() => setParam('c', c.value, 'all')}
              className={cn(
                'relative whitespace-nowrap px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground',
                category === c.value && 'text-foreground',
              )}
            >
              {c.label}
              {category === c.value && (
                <motion.span layoutId="cat-underline" className="absolute inset-x-3 -bottom-0.5 h-px bg-accent" />
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground tabular-nums">{visible.length} items</span>
          <label htmlFor="sort" className="sr-only">
            Sort by
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setParam('sort', e.target.value, 'featured')}
            className="border border-border bg-background px-3 py-2 text-[11px] uppercase tracking-[0.15em]"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to high</option>
            <option value="price-desc">Price: High to low</option>
          </select>
        </div>
      </div>

      <motion.div layout className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-4 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {visible.map((p, i) => (
            <motion.div
              key={p.slug}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4, delay: Math.min(i, 8) * 0.03 }}
            >
              <ProductCard product={p} priority={i < 4} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </>
  )
}
