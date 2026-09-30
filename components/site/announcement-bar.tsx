'use client'

import { useEffect, useState } from 'react'
import { TRANSLATIONS, useLanguage } from '@/lib/i18n'

export function AnnouncementBar() {
  const { lang } = useLanguage()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const currentLang = mounted ? lang : 'vi'
  const items = TRANSLATIONS[currentLang].announcement

  return (
    <div className="relative overflow-hidden border-b border-[var(--border-subtle)] bg-[var(--surface-secondary)] py-2 text-[11px] transition-colors">
      {/* Vệt mờ hai bên mép tạo hiệu ứng chuyển động vô tận sang trọng */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[var(--surface-secondary)] to-transparent sm:w-20" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-r from-transparent to-[var(--surface-secondary)] sm:w-20" />

      <div className="flex select-none">
        <div className="animate-marquee flex items-center whitespace-nowrap">
          {/* Lặp lại 2 lần để animation chạy vô tận không bị khựng */}
          {[...items, ...items].map((text, idx) => (
            <div key={idx} className="flex items-center">
              <span className="mx-5 font-light uppercase tracking-[0.22em] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] sm:mx-8">
                {text}
              </span>
              <span className="text-[8px] text-[var(--text-muted)]" aria-hidden="true">
                ✦
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
