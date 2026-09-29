'use client'

import { motion } from 'framer-motion'

const EASE = [0.22, 1, 0.36, 1] as const

export function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-[11px] uppercase tracking-[0.35em] text-accent">{eyebrow}</p>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: EASE }}
        className="font-calligraphy text-silver-metal mt-3 text-balance text-3xl font-semibold tracking-wide md:text-5xl lg:text-6xl"
      >
        {title}
      </motion.h2>
      <div className="mt-5 flex items-center gap-3" aria-hidden="true">
        <motion.span
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2, ease: EASE }}
          className="h-px w-16 origin-right bg-gradient-to-l from-accent to-transparent"
        />
        <motion.span
          initial={{ rotate: 0, scale: 0 }}
          whileInView={{ rotate: 45, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
          className="size-2 border border-accent"
        />
        <motion.span
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2, ease: EASE }}
          className="h-px w-16 origin-left bg-gradient-to-r from-accent to-transparent"
        />
      </div>
    </div>
  )
}
