'use client'

import Link from 'next/link'
import { Suspense, useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
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

function isItemActive(href: string, pathname: string, searchParams: URLSearchParams | null) {
  if (href === '/') {
    return pathname === '/'
  }
  if (href === '/about') {
    return pathname === '/about'
  }
  if (pathname === '/collections') {
    const cat = searchParams?.get('c')
    if (href === '/collections?c=rings') {
      return cat === 'rings'
    }
    if (href === '/collections?c=pendants') {
      return cat === 'pendants'
    }
    if (href === '/collections') {
      return !cat || cat === 'all'
    }
  }
  return false
}

function NavLinks() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return (
    <nav aria-label="Main" className="hidden items-center gap-7 lg:flex xl:gap-9">
      {NAV.map((item) => {
        const active = isItemActive(item.href, pathname, searchParams)
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              'relative whitespace-nowrap py-1 text-xs uppercase tracking-[0.18em] transition-colors',
              active
                ? 'font-bold text-white'
                : 'font-normal text-zinc-400 hover:text-zinc-200',
            )}
          >
            {item.label}
            {active && (
              <span className="absolute inset-x-0 -bottom-1.5 h-[2px] bg-white" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}

function MobileNavLinks({ onClose }: { onClose: () => void }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return (
    <ul className="flex flex-col space-y-1">
      {NAV.map((item) => {
        const active = isItemActive(item.href, pathname, searchParams)
        return (
          <li key={item.label}>
            <Link
              href={item.href}
              onClick={onClose}
              className={cn(
                'block py-2.5 text-sm uppercase tracking-[0.15em] transition-colors',
                active
                  ? 'font-bold text-white border-l-2 border-white pl-3'
                  : 'font-normal text-zinc-400 hover:text-white pl-3',
              )}
            >
              {item.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const count = useShop(selectCartCount)
  const wishCount = useShop((s) => s.wishlist.length)
  const setCartOpen = useShop((s) => s.setCartOpen)

  useEffect(() => setMounted(true), [])

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0c0c0e]/95 backdrop-blur-md">
      <div className="relative mx-auto grid max-w-screen-2xl grid-cols-[1fr_auto_1fr] items-center px-4 py-4 md:px-8">
        <Suspense
          fallback={
            <nav className="hidden items-center gap-7 lg:flex">
              {NAV.map((item) => (
                <span key={item.label} className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                  {item.label}
                </span>
              ))}
            </nav>
          }
        >
          <NavLinks />
        </Suspense>

        <button
          type="button"
          className="-ml-2 p-2 text-zinc-300 hover:text-white lg:hidden"
          aria-label={open ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>

        <Link href="/" aria-label="LEGEND trang chủ" className="flex flex-col items-center">
          <span className="font-display text-2xl font-bold tracking-[0.3em] text-white md:text-3xl">
            LEGEND
          </span>
          <span
            className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.3em] text-zinc-400"
            aria-hidden="true"
          >
            Bạc thủ công
          </span>
        </Link>

        <div className="flex items-center justify-end gap-2 md:gap-3">
          <IconButton label="Tìm kiếm">
            <Search className="size-5" />
          </IconButton>
          <IconButton label="Tài khoản" className="hidden md:inline-flex">
            <User className="size-5" />
          </IconButton>
          <Link
            href="/collections"
            className="relative p-2 text-zinc-300 transition-colors hover:text-white"
            aria-label={`Yêu thích, ${mounted ? wishCount : 0} sản phẩm`}
          >
            <Heart className="size-5" />
            {mounted && wishCount > 0 && <Badge>{wishCount}</Badge>}
          </Link>
          <button
            type="button"
            className="relative p-2 text-zinc-300 transition-colors hover:text-white"
            aria-label={`Mở giỏ hàng, ${mounted ? count : 0} sản phẩm`}
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBag className="size-5" />
            {mounted && count > 0 && <Badge>{count}</Badge>}
          </button>
        </div>
      </div>

      {open && (
        <nav
          aria-label="Mobile"
          className="border-t border-white/10 bg-[#121214] px-6 py-4 lg:hidden"
        >
          <Suspense fallback={null}>
            <MobileNavLinks onClose={() => setOpen(false)} />
          </Suspense>
        </nav>
      )}
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
    <button
      type="button"
      aria-label={label}
      className={cn('p-2 text-zinc-300 transition-colors hover:text-white', className)}
    >
      {children}
    </button>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-white text-[9px] font-bold text-black ring-1 ring-black">
      {children}
    </span>
  )
}
