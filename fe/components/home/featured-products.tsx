'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ProductCard } from '@/components/site/product-card'
import { Reveal } from '@/components/site/reveal'
import { Product } from '@/lib/products'
import { TRANSLATIONS, useLanguage } from '@/lib/i18n'

export function FeaturedProducts({ products }: { products: Product[] }) {
  const { lang } = useLanguage()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const t = TRANSLATIONS[mounted ? lang : 'vi'].home

  return (
    <section className="px-3 sm:px-5 md:px-6 lg:px-8 py-6 md:py-8">
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4 md:gap-4">
        {products.map((p, i) => (
          <Reveal key={p.slug} delay={(i % 4) * 0.1}>
            <ProductCard product={p} priority={i < 4} />
          </Reveal>
        ))}
      </div>
      <div className="flex justify-center py-12 md:py-16">
        <Link
          href="/collections"
          className="inline-flex items-center justify-center border border-[var(--border-strong)] bg-[var(--surface-secondary)] px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-primary)] transition-all hover:bg-[var(--text-primary)] hover:text-[var(--surface-primary)] md:text-sm"
        >
          {t.viewAll}
        </Link>
      </div>
    </section>
  )
}
