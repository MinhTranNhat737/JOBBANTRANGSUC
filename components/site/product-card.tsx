'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useShop } from '@/lib/store'
import { formatPrice, type Product } from '@/lib/products'
import { cn } from '@/lib/utils'

const EASE = [0.22, 1, 0.36, 1] as const
const CORNERS = [
  'left-2 top-2 border-l border-t',
  'right-2 top-2 border-r border-t',
  'left-2 bottom-2 border-l border-b',
  'right-2 bottom-2 border-r border-b',
]

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const [mounted, setMounted] = useState(false)
  const wished = useShop((s) => s.wishlist.includes(product.slug))
  const toggleWishlist = useShop((s) => s.toggleWishlist)
  const soldOut = product.stock === 0

  useEffect(() => setMounted(true), [])

  return (
    <article className="group relative rounded-sm border border-white/10 bg-[#141417] p-3 transition-colors hover:border-zinc-500">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="product-stage relative aspect-[4/5] overflow-hidden rounded-sm">
          <Image
            src={product.image || '/placeholder.svg'}
            alt={product.name}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
            className={cn(
              'object-cover transition-transform duration-300 group-hover:scale-105',
              soldOut && 'opacity-40 grayscale',
            )}
          />

          {(product.badge || soldOut) && (
            <span
              className={cn(
                'absolute left-2.5 top-2.5 rounded-sm px-2.5 py-1 text-[11px] font-semibold tracking-wider',
                soldOut
                  ? 'bg-black/80 text-zinc-400 backdrop-blur'
                  : 'bg-white text-black shadow-sm',
              )}
            >
              {soldOut ? 'Hết hàng' : product.badge}
            </span>
          )}
        </div>
      </Link>
      <div className="mt-3.5 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="line-clamp-1 text-sm font-semibold text-white transition-colors group-hover:text-zinc-300">
            <Link href={`/products/${product.slug}`}>{product.name}</Link>
          </h3>
          <p className="mt-1 text-sm font-medium tabular-nums text-zinc-300">
            {product.sizes ? 'Từ ' : ''}
            {formatPrice(product.price)}
            {product.compareAtPrice && (
              <s className="ml-2 text-xs text-zinc-500">{formatPrice(product.compareAtPrice)}</s>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => toggleWishlist(product.slug)}
          aria-pressed={mounted && wished}
          aria-label={mounted && wished ? `Bỏ ${product.name} khỏi yêu thích` : `Thêm ${product.name} vào yêu thích`}
          className="shrink-0 p-1.5 text-zinc-400 transition-colors hover:text-white"
        >
          <Heart className={cn('size-4', mounted && wished && 'fill-white text-white')} />
        </button>
      </div>
    </article>
  )
}

