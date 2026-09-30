'use client'

import Link from 'next/link'
import { Suspense, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ChevronDown, Heart, Menu, Moon, Search, ShoppingBag, Sun, User, X, Package, LogOut } from 'lucide-react'
import { selectCartCount, useShop } from '@/lib/store'
import { TRANSLATIONS, useLanguage } from '@/lib/i18n'
import { useTheme } from '@/lib/theme'
import { useCustomer } from '@/lib/customer-store'
import { UserNav } from '@/components/site/user-nav'
import { cn } from '@/lib/utils'

function isItemActive(href: string, pathname: string) {
  if (href === '/') {
    return pathname === '/'
  }
  if (href === '/about') {
    return pathname === '/about'
  }
  if (href === '/collections') {
    return pathname.startsWith('/collections')
  }
  return false
}

function LanguageSelector({ className }: { className?: string }) {
  const { lang, setLang } = useLanguage()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentLang = mounted ? lang : 'vi'

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setDropdownOpen((v) => !v)}
        className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs uppercase tracking-wider text-[var(--text-secondary)] transition-colors hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)]"
        aria-label="Chọn ngôn ngữ / Select language"
      >
        <span className="font-semibold">{currentLang === 'vi' ? 'Tiếng Việt' : 'English'}</span>
        <ChevronDown
          className={cn(
            'size-3.5 transition-transform duration-200',
            dropdownOpen ? 'rotate-180 text-[var(--text-primary)]' : 'text-[var(--text-muted)]',
          )}
          strokeWidth={2.4}
        />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-36 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-1.5 shadow-2xl backdrop-blur-xl z-50">
          <button
            type="button"
            onClick={() => {
              setLang('vi')
              setDropdownOpen(false)
            }}
            className={cn(
              'flex w-full items-center justify-between rounded px-3 py-2 text-xs uppercase tracking-wider transition-colors',
              currentLang === 'vi'
                ? 'bg-[var(--hover-bg)] font-bold text-[var(--text-primary)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)]',
            )}
          >
            <span>Tiếng Việt</span>
            {currentLang === 'vi' && <span className="text-[11px] text-[var(--text-primary)] font-bold">✓</span>}
          </button>
          <button
            type="button"
            onClick={() => {
              setLang('en')
              setDropdownOpen(false)
            }}
            className={cn(
              'flex w-full items-center justify-between rounded px-3 py-2 text-xs uppercase tracking-wider transition-colors',
              currentLang === 'en'
                ? 'bg-[var(--hover-bg)] font-bold text-[var(--text-primary)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)]',
            )}
          >
            <span>English</span>
            {currentLang === 'en' && <span className="text-[11px] text-[var(--text-primary)] font-bold">✓</span>}
          </button>
        </div>
      )}
    </div>
  )
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const isDark = !mounted || theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="group relative flex size-10 sm:size-11 items-center justify-center rounded-full text-[var(--text-primary)] transition-all duration-200 hover:bg-[var(--hover-bg)] active:scale-95"
      aria-label={isDark ? 'Chuyển sang sáng' : 'Chuyển sang tối'}
    >
      <Sun
        className={cn(
          'absolute size-5 transition-all duration-300',
          isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100',
        )}
        strokeWidth={2.5}
      />
      <Moon
        className={cn(
          'absolute size-5 transition-all duration-300',
          isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0',
        )}
        strokeWidth={2.5}
      />
    </button>
  )
}

function NavLinks({
  onMenuEnter,
  onMenuLeave,
  megaOpen,
}: {
  onMenuEnter: () => void
  onMenuLeave: () => void
  megaOpen: boolean
}) {
  const pathname = usePathname()
  const { lang } = useLanguage()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const t = TRANSLATIONS[mounted ? lang : 'vi']

  // Thứ tự bắt buộc: MENU -> HÀNG MỚI (NEW IN) -> ABOUT
  const navItems = [
    { href: '/', label: t.nav.menu, hasMegaMenu: true },
    { href: '/collections', label: t.nav.newIn, hasMegaMenu: false },
    { href: '/about', label: t.nav.about, hasMegaMenu: false },
  ]

  return (
    <nav aria-label="Main" className="hidden items-center gap-6 lg:flex xl:gap-8">
      {navItems.map((item) => {
        const active = isItemActive(item.href, pathname)
        const isMenuTrigger = item.hasMegaMenu
        const isCurrentOpen = isMenuTrigger && megaOpen

        return (
          <div
            key={item.label}
            className="relative py-2"
            onMouseEnter={isMenuTrigger ? onMenuEnter : undefined}
            onMouseLeave={isMenuTrigger ? onMenuLeave : undefined}
          >
            <Link
              href={item.href}
              className={cn(
                'group relative block whitespace-nowrap py-1 text-xs uppercase tracking-[0.18em] transition-colors',
                active || isCurrentOpen
                  ? 'font-bold text-[var(--text-primary)]'
                  : 'font-normal text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
              )}
            >
              <span>{item.label}</span>
              {/* Cả 3 nút đều có gạch dưới khi hold / hover vào */}
              <span
                className={cn(
                  'absolute inset-x-0 -bottom-1 h-[2px] bg-[var(--text-primary)] transition-all duration-200 origin-left',
                  active || isCurrentOpen
                    ? 'scale-x-100 opacity-100'
                    : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100',
                )}
              />
            </Link>
          </div>
        )
      })}
    </nav>
  )
}

function MobileNavLinks({ onClose }: { onClose: () => void }) {
  const pathname = usePathname()
  const { lang } = useLanguage()
  const { customer, logout } = useCustomer()
  const [mounted, setMounted] = useState(false)
  const [shopExpanded, setShopExpanded] = useState(true)

  useEffect(() => setMounted(true), [])
  const t = TRANSLATIONS[mounted ? lang : 'vi']

  return (
    <div className="flex flex-col space-y-4">
      {/* Bộ chọn ngôn ngữ trên mobile */}
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
        <span className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">Language / Ngôn ngữ:</span>
        <LanguageSelector />
      </div>

      {/* Auth / Khách hàng trên mobile: To, Rõ ràng, Thoáng đãng */}
      {mounted && (
        <div className="border-b border-[var(--border-subtle)] pb-5 pt-2">
          {customer ? (
            <div className="space-y-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Tài khoản</p>
                <p className="text-lg font-bold uppercase tracking-wider text-[var(--text-primary)]">{customer.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{customer.email}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <Link
                  href="/account"
                  onClick={onClose}
                  className="flex items-center justify-center rounded-full border border-white/20 py-3 text-xs font-bold uppercase tracking-wider text-white hover:border-white transition-colors"
                >
                  Hồ sơ
                </Link>
                <Link
                  href="/account/orders"
                  onClick={onClose}
                  className="flex items-center justify-center rounded-full border border-white/20 py-3 text-xs font-bold uppercase tracking-wider text-white hover:border-white transition-colors"
                >
                  Đơn hàng
                </Link>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout()
                  onClose()
                }}
                className="w-full text-center text-xs uppercase tracking-wider text-rose-400 py-1"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <Link
                href="/login"
                onClick={onClose}
                className="flex w-full items-center justify-center rounded-full bg-white py-3.5 text-xs font-bold uppercase tracking-[0.25em] text-black shadow hover:bg-zinc-200 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                onClick={onClose}
                className="flex w-full items-center justify-center rounded-full border border-[var(--border-strong)] py-3.5 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--text-secondary)] hover:text-white hover:border-white"
              >
                Tạo tài khoản mới
              </Link>
            </div>
          )}
        </div>
      )}

      <ul className="flex flex-col space-y-1">
        {/* 1. MENU (về Trang chủ) */}
        <li>
          <Link
            href="/"
            onClick={onClose}
            className={cn(
              'block py-2.5 text-sm uppercase tracking-[0.15em] transition-colors',
              pathname === '/'
                ? 'font-bold text-[var(--text-primary)] border-l-2 border-[var(--text-primary)] pl-3'
                : 'font-normal text-[var(--text-secondary)] hover:text-[var(--text-primary)] pl-3',
            )}
          >
            {t.nav.menu}
          </Link>
        </li>

        {/* 2. HÀNG MỚI (NEW IN) kèm danh mục accordion */}
        <li className="border-b border-[var(--border-subtle)] pb-2">
          <div className="flex items-center justify-between">
            <Link
              href="/collections"
              onClick={onClose}
              className={cn(
                'block py-2.5 text-sm uppercase tracking-[0.15em] transition-colors',
                pathname.startsWith('/collections')
                  ? 'font-bold text-[var(--text-primary)] border-l-2 border-[var(--text-primary)] pl-3'
                  : 'font-normal text-[var(--text-secondary)] hover:text-[var(--text-primary)] pl-3',
              )}
            >
              {t.nav.newIn}
            </Link>
            <button
              type="button"
              onClick={() => setShopExpanded((v) => !v)}
              className="p-2 text-zinc-400 hover:text-white"
              aria-label="Thu/mở danh mục"
            >
              <ChevronDown
                className={cn(
                  'size-4 transition-transform duration-200',
                  shopExpanded ? 'rotate-180 text-white' : '',
                )}
              />
            </button>
          </div>

          {shopExpanded && (
            <ul className="ml-4 mt-1 space-y-2 border-l border-white/10 pl-3 pb-1 text-xs uppercase tracking-[0.14em] text-zinc-400">
              {t.megaMenu.jewelry.items.map((sub) => (
                <li key={sub.label}>
                  <Link
                    href={sub.href}
                    onClick={onClose}
                    className="block py-1 hover:text-white transition-colors"
                  >
                    {sub.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/collections"
                  onClick={onClose}
                  className="block py-1 text-zinc-300 font-semibold hover:text-white transition-colors"
                >
                  {t.megaMenu.highlights.items[0]?.label} →
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* 3. ABOUT */}
        <li>
          <Link
            href="/about"
            onClick={onClose}
            className={cn(
              'block py-2.5 text-sm uppercase tracking-[0.15em] transition-colors',
              pathname === '/about'
                ? 'font-bold text-white border-l-2 border-white pl-3'
                : 'font-normal text-zinc-400 hover:text-white pl-3',
            )}
          >
            {t.nav.about}
          </Link>
        </li>
      </ul>
    </div>
  )
}

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const count = useShop(selectCartCount)
  const wishCount = useShop((s) => s.wishlist.length)
  const setCartOpen = useShop((s) => s.setCartOpen)
  const pathname = usePathname()
  const { lang } = useLanguage()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const currentLang = mounted ? lang : 'vi'
  const t = TRANSLATIONS[currentLang]

  const handleMenuEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setMegaOpen(true)
  }

  const handleMenuLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setMegaOpen(false)
    }, 180)
  }

  useEffect(() => {
    setMegaOpen(false)
  }, [pathname])

  useEffect(() => {
    setMounted(true)
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setOpen(false)
      }
    }
    const handleScroll = () => {
      setMegaOpen(false)
    }
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border-subtle)] bg-[var(--header-bg)] backdrop-blur-md transition-colors duration-300">
      <div className="relative flex items-center justify-between px-6 py-4 sm:px-10 sm:py-5 lg:px-16">
        {/* Cánh trái: nút menu trên mobile (<lg), menu [MENU - BỘ SƯU TẬP - VỀ LEGEND] trên desktop (>=lg) */}
        <div className="flex flex-1 items-center justify-start min-w-0">
          <button
            type="button"
            className="-ml-2 group flex size-10 items-center justify-center rounded-full text-[var(--text-primary)] transition-all duration-200 hover:bg-[var(--hover-bg)] active:scale-95 lg:hidden"
            aria-label={open ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <X className="size-5 text-[var(--text-primary)] transition-transform duration-200" strokeWidth={2} />
            ) : (
              <Menu className="size-5 text-[var(--text-primary)] transition-transform duration-200" strokeWidth={2} />
            )}
          </button>

          <Suspense
            fallback={
              <nav className="hidden items-center gap-8 lg:flex">
                <span className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">BỘ SƯU TẬP</span>
                <span className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">VỀ THUC LUXURY</span>
              </nav>
            }
          >
            <NavLinks
              onMenuEnter={handleMenuEnter}
              onMenuLeave={handleMenuLeave}
              megaOpen={megaOpen}
            />
          </Suspense>
        </div>

        {/* Logo chính giữa: To, rõ ràng, sang trọng */}
        <Link
          href="/"
          aria-label="THUC LUXURY trang chủ"
          className="flex shrink-0 flex-col items-center px-4 text-center transition-opacity hover:opacity-90"
        >
          <span className="font-display text-2xl font-bold tracking-[0.25em] text-[var(--text-primary)] sm:text-3xl lg:text-4xl">
            THUC LUXURY
          </span>
          <span
            className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.35em] text-[var(--text-muted)]"
            aria-hidden="true"
          >
            FINE JEWELRY &amp; ACCESSORIES
          </span>
        </Link>


        {/* Cánh phải: Theme sáng/tối, Ngôn ngữ, Tra cứu đơn hàng, Tìm kiếm, Tài khoản, Giỏ hàng */}
        <div className="flex flex-1 items-center justify-end gap-1.5 sm:gap-2.5">
          {/* Theme Sáng / Tối */}
          <ThemeToggle />

          {/* Ngôn ngữ Tiếng Việt / English */}
          <LanguageSelector className="inline-flex" />

          {/* Nút Tra cứu đơn hàng */}
          <Link
            href="/tracking"
            title="Tra cứu đơn hàng"
            aria-label="Tra cứu đơn hàng"
            className="group relative flex size-10 items-center justify-center rounded-full text-[var(--text-primary)] transition-all duration-200 hover:bg-[var(--hover-bg)] active:scale-95"
          >
            <Package className="size-5 text-[var(--text-primary)] transition-transform duration-200 group-hover:scale-110" strokeWidth={2} />
          </Link>

          {/* Tìm kiếm */}
          <IconButton label={t.header.search}>
            <Search className="size-5 text-[var(--text-primary)] transition-transform duration-200 group-hover:scale-110" strokeWidth={2} />
          </IconButton>

          {/* User Nav: Nút Đăng nhập cho khách / Avatar + Tên khi đã đăng nhập */}
          <UserNav />

          {/* Giỏ hàng */}
          <button
            type="button"
            className="group relative flex size-10 items-center justify-center rounded-full text-[var(--text-primary)] transition-all duration-200 hover:bg-[var(--hover-bg)] active:scale-95"
            aria-label={`${t.header.cart}, ${mounted ? count : 0}`}
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBag className="size-5 text-[var(--text-primary)] transition-transform duration-200 group-hover:scale-110" strokeWidth={2} />
            {mounted && count > 0 && <Badge>{count}</Badge>}
          </button>
        </div>
      </div>

      {/* MEGA MENU: Hiển thị khi hold (hover) vào nút MENU phong cách Helios */}
      <div
        onMouseEnter={handleMenuEnter}
        onMouseLeave={handleMenuLeave}
        className={cn(
          'absolute inset-x-0 top-full z-50 border-t border-b border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-2xl backdrop-blur-2xl transition-all duration-300 ease-out',
          megaOpen
            ? 'opacity-100 visible translate-y-0'
            : 'opacity-0 invisible -translate-y-2 pointer-events-none',
        )}
      >
        <div className="mx-auto max-w-screen-2xl px-6 py-9 lg:px-10">
          <div className="grid grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Cột 1: Khám phá */}
            <div className="col-span-12 md:col-span-3 lg:col-span-2 space-y-4">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)] pb-2 border-b border-[var(--border-subtle)]">
                {t.megaMenu.highlights.title}
              </h3>
              <ul className="space-y-2.5">
                {t.megaMenu.highlights.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={() => setMegaOpen(false)}
                      className="group flex items-center py-1 text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)] transition-all hover:text-[var(--text-primary)] hover:translate-x-1"
                    >
                      <span className="relative">
                        {item.label}
                        <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-[var(--text-primary)] transition-all duration-200 group-hover:w-full" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cột 2: Trang sức bạc */}
            <div className="col-span-12 md:col-span-3 lg:col-span-2.5 space-y-4">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)] pb-2 border-b border-[var(--border-subtle)]">
                {t.megaMenu.jewelry.title}
              </h3>
              <ul className="space-y-2.5">
                {t.megaMenu.jewelry.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={() => setMegaOpen(false)}
                      className="group flex items-center py-1 text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)] transition-all hover:text-[var(--text-primary)] hover:translate-x-1"
                    >
                      <span className="relative">
                        {item.label}
                        <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-[var(--text-primary)] transition-all duration-200 group-hover:w-full" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cột 3: Dịch vụ & Chế tác */}
            <div className="col-span-12 md:col-span-3 lg:col-span-2.5 space-y-4">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)] pb-2 border-b border-[var(--border-subtle)]">
                {t.megaMenu.services.title}
              </h3>
              <ul className="space-y-2.5">
                {t.megaMenu.services.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={() => setMegaOpen(false)}
                      className="group flex items-center py-1 text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)] transition-all hover:text-[var(--text-primary)] hover:translate-x-1"
                    >
                      <span className="relative">
                        {item.label}
                        <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-[var(--text-primary)] transition-all duration-200 group-hover:w-full" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cột 4 & 5: 2 Promo Banner Cards như phong cách Helios */}
            <div className="col-span-12 lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {t.megaMenu.cards.map((card) => (
                <Link
                  key={card.title}
                  href={card.href}
                  onClick={() => setMegaOpen(false)}
                  className="group relative flex aspect-[16/11] flex-col justify-end overflow-hidden rounded border border-[var(--border-subtle)] p-5 transition-all hover:border-[var(--border-strong)] hover:shadow-2xl"
                >
                  <img
                    src={card.image}
                    alt={card.title}
                    className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20 transition-opacity group-hover:from-black/90" />

                  <div className="relative z-10 flex flex-col items-center text-center">
                    <h4 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-white">
                      {card.title}
                    </h4>
                    <p className="mt-1 text-[11px] text-zinc-300 font-light">
                      {card.subtitle}
                    </p>
                    <span className="mt-3.5 inline-flex items-center justify-center rounded-sm bg-white px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-black transition-all group-hover:bg-zinc-200 group-hover:shadow-lg">
                      {card.btnText}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Menu trên Mobile */}
      {open && (
        <nav
          aria-label="Mobile"
          className="border-t border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-6 py-4 lg:hidden"
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
      className={cn(
        'group flex size-10 sm:size-11 items-center justify-center rounded-full text-[var(--text-primary)] transition-all duration-200 hover:bg-[var(--hover-bg)] active:scale-95',
        className,
      )}
    >
      {children}
    </button>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-[var(--badge-bg)] text-[9px] font-black text-[var(--badge-text)] shadow-md ring-1 ring-[var(--border-subtle)]">
      {children}
    </span>
  )
}
