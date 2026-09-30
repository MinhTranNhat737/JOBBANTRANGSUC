'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { TRANSLATIONS, useLanguage } from '@/lib/i18n'

export function Newsletter() {
  const [submitted, setSubmitted] = useState(false)
  const { lang } = useLanguage()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const t = TRANSLATIONS[mounted ? lang : 'vi'].newsletter

  return (
    <section className="relative overflow-hidden">
      <Image
        src="/images/ed-bracelet.png"
        alt=""
        fill
        sizes="100vw"
        className="object-cover opacity-30 grayscale"
      />
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 size-[520px] -translate-x-1/2 -translate-y-1/2 opacity-10 mix-blend-screen md:size-[680px]">
        <Image src="/images/trong-dong.png" alt="" fill sizes="680px" className="object-contain" />
      </div>
      <div className="relative mx-auto flex max-w-xl flex-col items-center px-4 py-16 text-center md:py-24">
        <h2 className="font-calligraphy text-balance text-3xl font-medium tracking-wide text-white">
          {t.title}
        </h2>
        <p className="mt-2 text-sm text-zinc-300">
          {t.subtitle}
        </p>
        {submitted ? (
          <p className="mt-6 rounded-sm bg-white/10 px-6 py-2.5 text-sm font-medium text-white" role="status">
            ✓ {t.success}
          </p>
        ) : (
          <form
            className="mt-6 flex w-full max-w-md flex-col gap-2.5 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault()
              setSubmitted(true)
            }}
          >
            <label htmlFor="newsletter-email" className="sr-only">
              {t.placeholder}
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              placeholder={t.placeholder}
              className="flex-1 rounded-sm border border-zinc-700 bg-zinc-900/90 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-white focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-zinc-200"
            >
              {t.btn}
              <ArrowRight className="size-4" />
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
