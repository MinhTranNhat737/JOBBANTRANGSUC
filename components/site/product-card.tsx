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
    <motion.article className="group relative" initial="rest" whileHover="hover" animate="rest">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="product-stage relative aspect-[4/5] overflow-hidden">
          <motion.div
            className="absolute inset-0"
            variants={{ rest: { scale: 1 }, hover: { scale: 1.07 } }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <Image
              src={product.image || '/placeholder.svg'}
              alt={product.name}
              fill
              priority={priority}
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
              className={cn('object-cover', soldOut && 'opacity-50 grayscale')}
            />
          </motion.div>

          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-accent/20 to-transparent"
            variants={{ rest: { x: '0%' }, hover: { x: '400%' } }}
            transition={{ duration: 1.1, ease: EASE }}
          />

          {CORNERS.map((pos, i) => (
            <motion.span
              key={i}
              aria-hidden="true"
              className={cn('pointer-events-none absolute size-5 border-accent', pos)}
              variants={{ rest: { opacity: 0, scale: 0.6 }, hover: { opacity: 1, scale: 1 } }}
              transition={{ duration: 0.4, ease: EASE }}
            />
          ))}

          {(product.badge || soldOut) && (
            <span
              className={cn(
                'absolute left-3 top-3 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.2em]',
                soldOut ? 'bg-background/80 backdrop-blur' : 'bg-lacquer text-lacquer-foreground',
              )}
            >
              {soldOut ? 'Hết hàng' : product.badge}
            </span>
          )}
          <motion.span
            className="pointer-events-none absolute inset-x-0 bottom-4 text-center font-display text-[10px] tracking-[0.4em] text-foreground/70"
            variants={{ rest: { letterSpacing: '0.4em', color: 'var(--foreground)' }, hover: { letterSpacing: '0.6em', color: 'var(--accent)' } }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            LEGEND
          </motion.span>
        </div>
      </Link>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[11px] font-medium uppercase tracking-wider transition-colors group-hover:text-accent">
            <Link href={`/products/${product.slug}`}>{product.name}</Link>
          </h3>
          <p className="mt-1 text-xs tabular-nums text-muted-foreground">
            {product.sizes ? 'Từ ' : ''}
            {formatPrice(product.price)}
            {product.compareAtPrice && <s className="ml-2 opacity-60">{formatPrice(product.compareAtPrice)}</s>}
          </p>
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.8 }}
          onClick={() => toggleWishlist(product.slug)}
          aria-pressed={mounted && wished}
          aria-label={mounted && wished ? `Bỏ ${product.name} khỏi yêu thích` : `Thêm ${product.name} vào yêu thích`}
          className="shrink-0 p-1 text-muted-foreground transition-colors hover:text-accent"
        >
          <Heart className={cn('size-4', mounted && wished && 'fill-lacquer text-accent')} />
        </motion.button>
      </div>
    </motion.article>
  )
}
