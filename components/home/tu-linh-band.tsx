'use client'

import { useEffect, useState } from 'react'
import { TRANSLATIONS, useLanguage } from '@/lib/i18n'

export function TuLinhBand() {
  const { lang } = useLanguage()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const motifs = TRANSLATIONS[mounted ? lang : 'vi'].home.motifs

  return (
    <section
      aria-label="Biểu tượng truyền thống"
      className="border-y border-white/10 bg-[#101013] py-7"
    >
      <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-around gap-6 px-4 text-center">
        {motifs.map((name) => (
          <span
            key={name}
            className="font-calligraphy text-xl font-normal tracking-widest text-zinc-300 transition-colors hover:text-white sm:text-2xl md:text-3xl"
          >
            {name}
          </span>
        ))}
      </div>
    </section>
  )
}
