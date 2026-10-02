'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut, ChevronDown } from 'lucide-react'
import { useCustomer } from '@/lib/customer-store'
import { cn } from '@/lib/utils'

export function UserNav() {
  const router = useRouter()
  const { customer, logout } = useCustomer()
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!mounted) {
    return <div className="h-10 w-24 animate-pulse rounded-none bg-zinc-800/20" />
  }

  // ── GUEST STATE (Chưa đăng nhập) ───────────────────────────────────
  // Nút ĐĂNG NHẬP: To, rõ ràng, thoáng đãng, sang trọng tối giản
  if (!customer) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-none border border-white/20 bg-transparent px-5 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-[13px] font-semibold uppercase tracking-[0.2em] text-[var(--text-primary)] transition-all duration-300 hover:border-white hover:bg-white hover:text-black active:scale-95 shadow-sm"
        >
          Đăng nhập
        </Link>
      </div>
    )
  }

  // ── LOGGED IN STATE (Đã đăng nhập) ──────────────────────────────────
  // Hiển thị tên người dùng to, rõ nét, menu thoáng đãng
  const initials = customer.name
    ? customer.name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .slice(-2)
        .join('')
        .toUpperCase()
    : 'U'

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        className={cn(
          'flex items-center gap-2.5 rounded-none border border-white/15 px-3 py-1.5 sm:px-4 sm:py-2 transition-all duration-200 hover:border-white hover:bg-white/5 active:scale-95',
          menuOpen && 'border-white bg-white/10',
        )}
        aria-label="Tài khoản cá nhân"
        aria-expanded={menuOpen}
      >
        <div className="flex size-7 sm:size-8 items-center justify-center rounded-none bg-white font-display text-xs font-bold text-black shadow">
          {initials}
        </div>
        <span className="text-xs sm:text-sm font-semibold tracking-wider text-[var(--text-primary)] uppercase">
          {customer.name.split(' ').slice(-1)[0]}
        </span>
        <ChevronDown
          className={cn('size-3.5 text-[var(--text-muted)] transition-transform duration-200', menuOpen && 'rotate-180 text-white')}
          strokeWidth={2}
        />
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full mt-3 w-64 rounded-none border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-3 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2.5 border-b border-[var(--border-subtle)] mb-1">
            <p className="font-semibold text-sm text-[var(--text-primary)] truncate">{customer.name}</p>
            <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">{customer.email}</p>
          </div>

          <div className="py-1 space-y-1">
            <Link
              href="/account"
              onClick={() => setMenuOpen(false)}
              className="flex w-full items-center rounded-none px-3 py-2.5 text-xs sm:text-[13px] font-medium tracking-wide text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-white transition-colors"
            >
              Hồ sơ cá nhân
            </Link>
            <Link
              href="/account/orders"
              onClick={() => setMenuOpen(false)}
              className="flex w-full items-center rounded-none px-3 py-2.5 text-xs sm:text-[13px] font-medium tracking-wide text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-white transition-colors"
            >
              Đơn hàng của tôi
            </Link>
            <Link
              href="/tracking"
              onClick={() => setMenuOpen(false)}
              className="flex w-full items-center rounded-none px-3 py-2.5 text-xs sm:text-[13px] font-medium tracking-wide text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-white transition-colors"
            >
              Tra cứu đơn hàng
            </Link>
          </div>

          <div className="border-t border-[var(--border-subtle)] pt-1 mt-1">
            <button
              type="button"
              onClick={() => {
                logout()
                setMenuOpen(false)
                router.push('/')
              }}
              className="flex w-full items-center gap-2 rounded-none px-3 py-2 text-xs sm:text-[13px] font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="size-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
