'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const EASE = [0.22, 1, 0.36, 1] as const
const TITLE = ['Rèn', 'từ', 'huyền', 'thoại,', 'khoác', 'lên', 'bản', 'lĩnh']

const EMBERS = Array.from({ length: 18 }, (_, i) => ({
  left: `${(i * 53) % 100}%`,
  size: 2 + (i % 3),
  dur: `${8 + (i % 5) * 1.6}s`,
  delay: `${(i * 0.7) % 9}s`,
  drift: `${((i % 7) - 3) * 18}px`,
}))

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '22%'])
  const drumY = useTransform(scrollYProgress, [0, 1], ['0%', '-30%'])
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <section ref={ref} className="relative h-[78svh] min-h-[520px] overflow-hidden md:h-[92svh]">
      <motion.div
        className="absolute inset-0"
        style={{ y }}
        initial={{ scale: 1.18, clipPath: 'inset(12% 12% 12% 12%)' }}
        animate={{ scale: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
        transition={{ duration: 1.8, ease: EASE }}
      >
        <Image
          src="/images/hero.png"
          alt="Tranh vẽ tay chim phượng và rồng giữa lửa hổ phách"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,var(--background)_95%)]" />

      <motion.div
        aria-hidden="true"
        style={{ y: drumY }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.32, scale: 1 }}
        transition={{ delay: 0.6, duration: 2, ease: EASE }}
        className="pointer-events-none absolute left-1/2 top-1/2 size-[130vmin] -translate-x-1/2 -translate-y-1/2 mix-blend-screen md:size-[110vmin]"
      >
        <Image src="/images/trong-dong.png" alt="" fill sizes="110vmin" className="spin-slow object-contain" />
      </motion.div>

      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-full">
        {EMBERS.map((e, i) => (
          <span
            key={i}
            className="ember absolute bottom-0 rounded-full bg-accent shadow-[0_0_8px_2px_var(--accent)]"
            style={
              {
                left: e.left,
                width: e.size,
                height: e.size,
                '--dur': e.dur,
                '--delay': e.delay,
                '--drift': e.drift,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <motion.div
        style={{ opacity }}
        className="relative z-10 mx-auto flex h-full max-w-screen-2xl flex-col items-center justify-end px-4 pb-20 text-center md:pb-28"
      >
        <motion.div
          initial={{ opacity: 0, letterSpacing: '0.8em' }}
          animate={{ opacity: 1, letterSpacing: '0.4em' }}
          transition={{ delay: 0.5, duration: 1.4, ease: EASE }}
          className="flex items-center gap-3 text-[11px] uppercase text-accent"
        >
          <span className="h-px w-8 bg-accent/60" />
          Bộ sưu tập Chu Tước
          <span className="h-px w-8 bg-accent/60" />
        </motion.div>

        <h1 className="font-calligraphy mt-5 flex max-w-4xl flex-wrap justify-center gap-x-[0.28em] text-balance text-4xl font-medium leading-[1.2] tracking-wide md:text-7xl">
          {TITLE.map((word, i) => (
            <span key={i} className="overflow-hidden px-1 pb-3 pt-1">
              <motion.span
                className="text-silver-metal inline-block"
                initial={{ y: '110%', opacity: 0, filter: 'blur(8px)' }}
                animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
                transition={{ delay: 0.7 + i * 0.08, duration: 1, ease: EASE }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.9 }}
          className="mt-4 max-w-md text-pretty text-sm leading-relaxed text-foreground/70"
        >
          Trang sức bạc chế tác thủ công, lấy cảm hứng từ Tứ Linh và hoa văn trống đồng Đông Sơn.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7, duration: 0.8 }}
        >
          <Link
            href="/collections"
            className="group relative mt-8 inline-flex overflow-hidden border border-accent/70 px-9 py-3.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-foreground"
          >
            <span className="absolute inset-0 -translate-x-full bg-accent transition-transform duration-500 ease-out group-hover:translate-x-0" />
            <span className="relative transition-colors duration-500 group-hover:text-accent-foreground">
              Khám phá bộ sưu tập
            </span>
          </Link>
        </motion.div>

        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{ opacity: { delay: 2.2 }, y: { repeat: Infinity, duration: 2.2, ease: 'easeInOut' } }}
          className="mt-10 text-accent/70"
        >
          <ChevronDown className="size-5" />
        </motion.div>
      </motion.div>
    </section>
  )
}
