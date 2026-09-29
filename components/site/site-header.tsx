'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react'
import { selectCartCount, useShop } from '@/lib/store'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/', label: 'Trang chủ' },
  { href: '/collections', label: 'Cửa hàng' },
  { href: '/collections?c=rings', label: 'Nhẫn' },
  { href: '/collections?c=pendants', label: 'Mặt dây' },
  { href: '/about', label: 'Câu chuyện' },
]

const LOGO = 'LEGEND'.split('')

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [compact, setCompact] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)
  const count = useShop(selectCartCount)
  const wishCount = useShop((s) => s.wishlist.length)
  const setCartOpen = useShop((s) => s.setCartOpen)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (v) => setCompact(v > 40))
  useEffect(() => setMounted(true), [])
  useEffect(() => setOpen(false), [pathname])

  return (
    <header className="sticky top-0 z-40 overflow-hidden border-b border-border bg-background/90 backdrop-blur-md">
      <div
        aria-hidden="true"
        className="pattern-long-phuong pointer-events-none absolute inset-0 opacity-[0.16] [mask-image:linear-gradient(90deg,transparent,black_20%,black_80%,transparent)]"
      />
      <div aria-hidden="true" className="gold-hairline pointer-events-none absolute inset-x-0 bottom-0 h-px" />

      <motion.div
        animate={{ paddingTop: compact ? 10 : 20, paddingBottom: compact ? 10 : 20 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto grid max-w-screen-2xl grid-cols-[1fr_auto_1fr] items-center px-4 md:px-8"
      >
        <nav aria-label="Main" className="hidden items-center gap-5 lg:flex xl:gap-7" onMouseLeave={() => setHovered(null)}>
          {NAV.map((item) => {
            const active = item.href === pathname
            const show = hovered ? hovered === item.label : active
            return (
              <Link
                key={item.label}
                href={item.href}
                onMouseEnter={() => setHovered(item.label)}
                className={cn(
                  'relative whitespace-nowrap py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground',
                  active && 'text-foreground',
                )}
              >
                {item.label}
                {show && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-0 -bottom-0.5 h-px bg-accent"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
              </Link>
            )
          })}
        </nav>
        <button
          type="button"
          className="-ml-2 p-2 lg:hidden"
          aria-label={open ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        <Link href="/" aria-label="LEGEND trang chủ" className="flex flex-col items-center">
          <span className="flex font-display text-2xl font-bold tracking-[0.3em] md:text-3xl" aria-hidden="true">
            {LOGO.map((ch, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: 0.1 + i * 0.07, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="text-gold-shimmer"
              >
                {ch}
              </motion.span>
            ))}
          </span>
          <AnimatePresence initial={false}>
            {!compact && (
              <motion.span
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-1 flex items-center gap-2 overflow-hidden text-[9px] uppercase tracking-[0.35em] text-accent/80"
                aria-hidden="true"
              >
                <span className="h-px w-5 bg-accent/50" />
                Bạc Việt thủ công
                <span className="h-px w-5 bg-accent/50" />
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        <div className="flex items-center justify-end gap-1 md:gap-3">
          <span className="hidden text-[11px] uppercase tracking-[0.2em] text-muted-foreground xl:inline">
            Tiếng Việt · VND
          </span>
          <IconButton label="Tìm kiếm">
            <Search className="size-5" />
          </IconButton>
          <IconButton label="Tài khoản" className="hidden md:inline-flex">
            <User className="size-5" />
          </IconButton>
          <Link
            href="/collections"
            className="relative p-2 transition-colors hover:text-accent"
            aria-label={`Yêu thích, ${mounted ? wishCount : 0} sản phẩm`}
          >
            <Heart className="size-5" />
            <AnimatePresence>{mounted && wishCount > 0 && <Badge key={wishCount}>{wishCount}</Badge>}</AnimatePresence>
          </Link>
          <button
            type="button"
            className="relative p-2 transition-colors hover:text-accent"
            aria-label={`Mở giỏ hàng, ${mounted ? count : 0} sản phẩm`}
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBag className="size-5" />
            <AnimatePresence>{mounted && count > 0 && <Badge key={count}>{count}</Badge>}</AnimatePresence>
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.nav
            aria-label="Mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="relative overflow-hidden border-t border-border lg:hidden"
          >
            <ul className="flex flex-col px-4 py-4">
              {NAV.map((item, i) => (
                <motion.li
                  key={item.label}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <Link href={item.href} className="block py-3 text-sm uppercase tracking-[0.2em]">
                    {item.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}

function IconButton({
  label,
  className,
  children,
}: {
  label: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <button type="button" aria-label={label} className={cn('p-2 transition-colors hover:text-accent', className)}>
      {children}
    </button>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 18 }}
      className="absolute right-0 top-0 flex size-4 items-center justify-center rounded-full bg-lacquer text-[9px] font-bold text-lacquer-foreground ring-1 ring-accent/60"
    >
      {children}
    </motion.span>
  )
}
