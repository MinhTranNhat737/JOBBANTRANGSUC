'use client'

import { motion } from 'framer-motion'

const EASE = [0.22, 1, 0.36, 1] as const

export function SectionHeading({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      {eyebrow && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
          {eyebrow}
        </p>
      )}
      <h2 className="font-calligraphy text-balance text-3xl font-medium tracking-wide text-white md:text-4xl">
        {title}
      </h2>
      <div className="mt-3 flex items-center gap-3" aria-hidden="true">
        <span className="h-px w-12 bg-zinc-700" />
        <span className="size-1 rotate-45 bg-zinc-400" />
        <span className="h-px w-12 bg-zinc-700" />
      </div>
    </div>
  )
}

