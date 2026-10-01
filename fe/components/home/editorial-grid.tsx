'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Reveal } from '@/components/site/reveal'
import { TRANSLATIONS, useLanguage } from '@/lib/i18n'

export function EditorialGrid() {
  const { lang } = useLanguage()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const t = TRANSLATIONS[mounted ? lang : 'vi'].home.tiles

  const tiles = [
    { label: t.newIn, href: '/collections?badge=New', image: '/images/ed-new.png', alt: t.newIn },
    { label: t.earrings, href: '/collections?c=earrings', image: '/images/ed-earrings.png', alt: t.earrings },
    { label: t.rings, href: '/collections?c=rings', image: '/images/p-ring-signet.png', alt: t.rings },
    { label: t.pendants, href: '/collections?c=pendants', image: '/images/p-pendant-ruby.png', alt: t.pendants },
    { label: t.bracelets, href: '/collections?c=bracelets', image: '/images/ed-bracelet.png', alt: t.bracelets },
    { label: t.all, href: '/collections', image: '/images/ed-all.png', alt: t.all },
  ]

  return (
    <section aria-label="Mua theo bộ sưu tập" className="grid grid-cols-1 sm:grid-cols-2">
      {tiles.map((tile, i) => (
        <Reveal key={tile.label} delay={(i % 2) * 0.08}>
          <Link href={tile.href} className="group relative block aspect-square overflow-hidden border border-white/5 bg-[#121215]">
            <Image
              src={tile.image || '/placeholder.svg'}
              alt={tile.alt}
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover grayscale transition-all duration-500 ease-out group-hover:scale-105 group-hover:brightness-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="absolute inset-4 border border-white/0 transition-colors duration-300 group-hover:border-white/30" />
            <div className="absolute inset-x-0 bottom-10 flex flex-col items-center gap-2.5 px-4 text-center">
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-white md:text-base">
                {tile.label}
              </span>
              <span className="h-0.5 w-8 bg-white/70 transition-all duration-300 group-hover:w-20" />
            </div>
          </Link>
        </Reveal>
      ))}
    </section>
  )
}
