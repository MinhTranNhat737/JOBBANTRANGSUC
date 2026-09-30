'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { useCustomer } from '@/lib/customer-store'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/account'

  const { login } = useCustomer()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    setTimeout(() => {
      const res = login(identifier, password)
      setLoading(false)
      if (res.success) {
        router.push(redirect)
      } else {
        setError(res.error || 'Thông tin đăng nhập không chính xác.')
      }
    }, 300)
  }

  const handleDemo = () => {
    setIdentifier('khachhang@legend.vn')
    setPassword('123456')
    setError(null)
    setLoading(true)
    setTimeout(() => {
      login('khachhang@legend.vn', '123456')
      setLoading(false)
      router.push(redirect)
    }, 300)
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6 py-20 sm:py-28">
      <div className="w-full max-w-md space-y-12">
        {/* Header: To, Rõ ràng, Thoáng đãng */}
        <div className="text-center space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.25em] text-[var(--text-muted)] hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="size-3.5" />
            <span>Trang chủ</span>
          </Link>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-[0.2em] text-[var(--text-primary)] uppercase">
            ĐĂNG NHẬP
          </h1>
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--text-muted)]">
            Tài khoản thành viên
          </p>
        </div>

        {error && (
          <p className="text-center text-xs tracking-wider text-rose-400 bg-rose-500/10 py-3 px-4 rounded-full">
            {error}
          </p>
        )}

        {/* Form: Trường nhập to, chữ to, thoáng đãng */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--text-muted)] block">
              Email / Số điện thoại
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="nhap@email.com"
              required
              className="w-full rounded-none border-b border-[var(--border-strong)] bg-transparent py-3 text-lg font-medium text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-white focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--text-muted)] block">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-none border-b border-[var(--border-strong)] bg-transparent py-3 pr-10 text-lg font-medium text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-white focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {/* Các nút: To, Rõ ràng, Tối giản, Dễ bấm */}
          <div className="pt-6 space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-white py-4 sm:py-5 text-xs sm:text-[13px] font-bold uppercase tracking-[0.25em] text-black transition-all hover:bg-zinc-200 active:scale-[0.99] disabled:opacity-50 shadow-lg"
            >
              {loading ? 'ĐANG XÁC THỰC...' : 'ĐĂNG NHẬP'}
            </button>

            <Link
              href={`/register${redirect !== '/account' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
              className="block w-full text-center rounded-full border border-[var(--border-strong)] py-4 sm:py-5 text-xs sm:text-[13px] font-semibold uppercase tracking-[0.25em] text-[var(--text-primary)] transition-all hover:border-white hover:bg-white/5 active:scale-[0.99]"
            >
              TẠO TÀI KHOẢN MỚI
            </Link>

            <button
              type="button"
              onClick={handleDemo}
              className="w-full text-center text-xs uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors py-2"
            >
              ✦ 1-Click Đăng nhập Demo (khachhang@legend.vn)
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center text-xs text-[var(--text-muted)]">Đang tải...</div>}>
      <LoginForm />
    </Suspense>
  )
}
