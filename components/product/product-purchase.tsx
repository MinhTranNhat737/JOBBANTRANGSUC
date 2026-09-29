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
      {product.sizes && (
        <fieldset>
          <legend className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Size</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={size === s}
                onClick={() => setSize(s)}
                className={cn(
                  'min-w-12 border px-3 py-2 text-xs transition-colors',
                  size === s ? 'border-foreground bg-foreground text-background' : 'border-border hover:border-foreground',
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <p className="text-xs text-muted-foreground" aria-live="polite">
        {soldOut ? 'Sold out' : product.stock <= 5 ? `Only ${product.stock} left in stock` : 'In stock, ready to ship'}
      </p>

      <div className="flex gap-3">
        <div className="flex items-center border border-border">
          <button
            type="button"
            className="p-3 disabled:opacity-30"
            aria-label="Decrease quantity"
            disabled={qty <= 1 || soldOut}
            onClick={() => setQty((q) => Math.max(1, q - 1))}
          >
            <Minus className="size-3.5" />
          </button>
          <span className="w-8 text-center text-sm tabular-nums" aria-label="Quantity">
            {qty}
          </span>
          <button
            type="button"
            className="p-3 disabled:opacity-30"
            aria-label="Increase quantity"
            disabled={qty >= maxQty || soldOut}
            onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
          >
            <Plus className="size-3.5" />
          </button>
        </div>
        <button
          type="button"
          disabled={soldOut}
          onClick={() =>
            addToCart({ slug: product.slug, name: product.name, price: product.price, image: product.image, size }, qty)
          }
          className="flex-1 bg-foreground py-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {soldOut ? 'Sold out' : 'Add to cart'}
        </button>
        <button
          type="button"
          onClick={() => toggleWishlist(product.slug)}
          aria-pressed={mounted && wished}
          aria-label="Toggle wishlist"
          className="border border-border px-4 transition-colors hover:border-foreground"
        >
          <Heart className={cn('size-4', mounted && wished && 'fill-accent text-accent')} />
        </button>
      </div>
    </div>
  )
}
