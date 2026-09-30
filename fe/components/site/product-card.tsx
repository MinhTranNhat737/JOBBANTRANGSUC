'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { useShop } from '@/lib/store'
import { formatPrice, type Product } from '@/lib/products'
import { cn } from '@/lib/utils'

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const [mounted, setMounted] = useState(false)
  const wished = useShop((s) => s.wishlist.includes(product.slug))
  const toggleWishlist = useShop((s) => s.toggleWishlist)
  const soldOut = product.stock === 0

  useEffect(() => setMounted(true), [])

  return (
    <article className="group relative overflow-hidden rounded-sm border border-[var(--border-subtle)] bg-[var(--surface-secondary)] transition-colors">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src={product.image || '/placeholder.svg'}
            alt={product.name}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
            className={cn(
              'object-cover transition-all duration-500 group-hover:scale-[1.04]',
              soldOut && 'opacity-40 grayscale',
            )}
          />

          {/* Badge */}
          {(product.badge || soldOut) && (
            <span
              className={cn(
                'absolute left-3 top-3 z-10 rounded-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider',
                soldOut
                  ? 'bg-black/70 text-zinc-400 backdrop-blur-sm'
                  : 'bg-[var(--badge-bg)] text-[var(--badge-text)] shadow-sm',
              )}
            >
              {soldOut ? 'Hết hàng' : product.badge}
            </span>
          )}

          {/* Hover overlay – name + price fading up from bottom */}
          <div className="absolute inset-0 z-10 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-400 group-hover:opacity-100">
            <div className="translate-y-3 px-4 pb-4 transition-transform duration-400 group-hover:translate-y-0 md:px-5 md:pb-5">
              <h3 className="line-clamp-1 text-sm font-semibold tracking-wide text-white md:text-[15px]">
                {product.name}
              </h3>
              <p className="mt-1.5 flex items-baseline gap-2 text-sm font-medium tabular-nums text-zinc-200">
                <span>
                  {product.sizes ? 'Từ ' : ''}
                  {formatPrice(product.price)}
                </span>
                {product.compareAtPrice && (
                  <s className="text-xs text-zinc-500">{formatPrice(product.compareAtPrice)}</s>
                )}
              </p>
            </div>
          </div>
        </div>
      </Link>

      {/* Wishlist heart — always visible top-right */}
      <button
        type="button"
        onClick={() => toggleWishlist(product.slug)}
        aria-pressed={mounted && wished}
        aria-label={mounted && wished ? `Bỏ ${product.name} khỏi yêu thích` : `Thêm ${product.name} vào yêu thích`}
        className="absolute right-3 top-3 z-20 flex size-8 items-center justify-center rounded-full bg-black/40 text-white/70 opacity-0 backdrop-blur-sm transition-all duration-300 hover:bg-black/60 hover:text-white group-hover:opacity-100"
      >
        <Heart className={cn('size-4', mounted && wished && 'fill-white text-white')} />
      </button>
    </article>
  )
}
