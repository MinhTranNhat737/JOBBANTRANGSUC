'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useCustomer } from '@/lib/customer-store'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/account'

  const { register } = useCustomer()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim() || !phone.trim() || !email.trim() || !address.trim() || !password) {
      setError('Vui lòng điền đầy đủ các thông tin.')
      return
    }

    setLoading(true)
    setTimeout(() => {
      const res = register({ name, email, phone, address, password })
      setLoading(false)
      if (res.success) {
        router.push(redirect)
      } else {
        setError(res.error || 'Đăng ký không thành công.')
      }
    }, 300)
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6 py-20 sm:py-28">
      <div className="w-full max-w-lg space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.25em] text-[var(--text-muted)] hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="size-3.5" />
            <span>Trang chủ</span>
          </Link>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-[0.2em] text-[var(--text-primary)] uppercase">
            ĐĂNG KÝ
          </h1>
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--text-muted)]">
            Thành viên mới LEGEND
          </p>
        </div>

        {error && (
          <p className="text-center text-xs tracking-wider text-rose-400 bg-rose-500/10 py-3 px-4 rounded-full">
            {error}
          </p>
        )}

        {/* Minimal Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--text-muted)] block">
              Họ và tên
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              required
              className="w-full rounded-none border-b border-[var(--border-strong)] bg-transparent py-3 text-lg font-medium text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-white focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--text-muted)] block">
                Số điện thoại
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0901 234 567"
                required
                className="w-full rounded-none border-b border-[var(--border-strong)] bg-transparent py-3 text-lg font-medium text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-white focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--text-muted)] block">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nhap@email.com"
                required
                className="w-full rounded-none border-b border-[var(--border-strong)] bg-transparent py-3 text-lg font-medium text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--text-muted)] block">
              Địa chỉ nhận hàng
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Số nhà, đường, quận/huyện, thành phố"
              required
              className="w-full rounded-none border-b border-[var(--border-strong)] bg-transparent py-3 text-base sm:text-lg font-medium text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-white focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--text-muted)] block">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              required
              className="w-full rounded-none border-b border-[var(--border-strong)] bg-transparent py-3 text-lg font-medium text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-white focus:outline-none transition-colors"
            />
          </div>

          {/* Các nút hành động: To, Rõ ràng, Tối giản */}
          <div className="pt-6 space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-white py-4 sm:py-5 text-xs sm:text-[13px] font-bold uppercase tracking-[0.25em] text-black transition-all hover:bg-zinc-200 active:scale-[0.99] disabled:opacity-50 shadow-lg"
            >
              {loading ? 'ĐANG TẠO TÀI KHOẢN...' : 'HOÀN TẤT ĐĂNG KÝ'}
            </button>

            <Link
              href={`/login${redirect !== '/account' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
              className="block w-full text-center rounded-full border border-[var(--border-strong)] py-4 sm:py-5 text-xs sm:text-[13px] font-semibold uppercase tracking-[0.25em] text-[var(--text-primary)] transition-all hover:border-white hover:bg-white/5 active:scale-[0.99]"
            >
              ĐÃ CÓ TÀI KHOẢN • ĐĂNG NHẬP
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center text-xs text-[var(--text-muted)]">Đang tải...</div>}>
      <RegisterForm />
    </Suspense>
  )
}
