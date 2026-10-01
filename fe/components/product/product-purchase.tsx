'use client'

import { useEffect, useState } from 'react'
import { Heart, Minus, Plus } from 'lucide-react'
import { useShop } from '@/lib/store'
import type { Product } from '@/lib/products'
import { cn } from '@/lib/utils'

export function ProductPurchase({ product }: { product: Product }) {
  const [size, setSize] = useState<string | undefined>(product.sizes?.[0])
  const [qty, setQty] = useState(1)
  const [mounted, setMounted] = useState(false)
  const addToCart = useShop((s) => s.addToCart)
  const toggleWishlist = useShop((s) => s.toggleWishlist)
  const wished = useShop((s) => s.wishlist.includes(product.slug))
  const soldOut = product.stock === 0
  const maxQty = Math.min(10, product.stock)

  useEffect(() => setMounted(true), [])

  return (
    <div className="mt-8 space-y-6">
      {product.sizes && product.sizes.length > 0 && (
        <fieldset>
          <legend className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Kích thước (Size)
          </legend>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={size === s}
                onClick={() => setSize(s)}
                className={cn(
                  'min-w-12 rounded-sm border px-4 py-2.5 text-sm font-semibold transition-colors',
                  size === s
                    ? 'border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--surface-primary)]'
                    : 'border-[var(--border-subtle)] bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]',
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <p className="text-sm font-medium text-[var(--text-secondary)]" aria-live="polite">
        {soldOut
          ? 'Tạm hết hàng'
          : '✓ Còn hàng, sẵn sàng đóng gói giao ngay'}
      </p>

      <div className="flex gap-3">
        <div className="flex items-center rounded-sm border border-[var(--border-subtle)] bg-[var(--surface-secondary)]">
          <button
            type="button"
            className="p-3.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30"
            aria-label="Giảm số lượng"
            disabled={qty <= 1 || soldOut}
            onClick={() => setQty((q) => Math.max(1, q - 1))}
          >
            <Minus className="size-4" />
          </button>
          <span className="w-10 text-center text-sm font-semibold tabular-nums text-[var(--text-primary)]" aria-label="Số lượng">
            {qty}
          </span>
          <button
            type="button"
            className="p-3.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30"
            aria-label="Tăng số lượng"
            disabled={qty >= maxQty || soldOut}
            onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
          >
            <Plus className="size-4" />
          </button>
        </div>
        <button
          type="button"
          disabled={soldOut}
          onClick={() =>
            addToCart({ slug: product.slug, name: product.name, price: product.price, image: product.image, size }, qty)
          }
          className="flex-1 rounded-sm bg-[var(--text-primary)] py-4 text-xs font-bold uppercase tracking-[0.2em] text-[var(--surface-primary)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 md:text-sm"
        >
          {soldOut ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
        </button>
        <button
          type="button"
          onClick={() => toggleWishlist(product.slug)}
          aria-pressed={mounted && wished}
          aria-label="Yêu thích"
          className="rounded-sm border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-4 transition-colors hover:border-[var(--text-primary)]"
        >
          <Heart className={cn('size-5', mounted && wished ? 'fill-[var(--text-primary)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)]')} />
        </button>
      </div>
    </div>
  )
}
