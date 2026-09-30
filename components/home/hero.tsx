'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative flex min-h-[75vh] sm:min-h-[85vh] items-center justify-center overflow-hidden border-b border-[var(--border-subtle)]">
      {/* Background with deep obsidian tone */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero.png"
          alt="Trang sức bạc thủ công LEGEND"
          fill
          priority
          sizes="100vw"
          className="object-cover brightness-50 contrast-125 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/70 to-black/40" />
      </div>

      {/* Subtle Trống Đồng watermark */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 size-[600px] -translate-x-1/2 -translate-y-1/2 opacity-10 mix-blend-screen md:size-[800px]"
      >
        <Image src="/images/trong-dong.png" alt="" fill sizes="800px" className="object-contain" />
      </div>

      {/* Spacious, Minimalist Hero Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-20 text-center">
        <span className="inline-block text-xs uppercase tracking-[0.35em] text-zinc-400 font-medium mb-4">
          Bạc 925 Chế tác Thủ công
        </span>

        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-[0.15em] text-[var(--text-primary)] uppercase leading-tight sm:leading-tight">
          LEGEND
        </h1>

        <p className="mt-4 text-sm sm:text-base tracking-[0.2em] uppercase text-[var(--text-secondary)] font-light max-w-lg mx-auto">
          Khí chất uy nghiêm • Biểu tượng hộ mệnh
        </p>

        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/collections"
            className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.25em] text-white backdrop-blur-md transition-all hover:bg-white hover:text-black active:scale-95"
          >
            <span>Khám phá bộ sưu tập</span>
            <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  )
}
