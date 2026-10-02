'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, Package, LogOut, Loader2 } from 'lucide-react'
import { useCustomer } from '@/lib/customer-store'
import { useOrderStore } from '@/lib/order-store'

export default function AccountPage() {
  const router = useRouter()
  const { customer, token, updateProfile, refreshProfile, logout } = useCustomer()
  const { orders, syncOrders } = useOrderStore()

  const [name, setName] = useState(customer?.name || '')
  const [phone, setPhone] = useState(customer?.phone || '')
  const [address, setAddress] = useState(customer?.address || '')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  // Đồng bộ lại form khi customer được hydrate từ localStorage hoặc sau khi đăng nhập
  useEffect(() => {
    if (customer) {
      setName(customer.name || '')
      setPhone(customer.phone || '')
      setAddress(customer.address || '')
    }
  }, [customer?.name, customer?.phone, customer?.address])

  // Tự động tải lại thông tin mới nhất từ cơ sở dữ liệu khi mở trang
  useEffect(() => {
    void refreshProfile()
  }, [])

  useEffect(() => {
    if (!token) return
    fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error(`Không thể tải đơn hàng (${response.status})`)))
      .then((data) => { if (Array.isArray(data.orders)) syncOrders(data.orders) })
      .catch((error) => console.warn('Order history sync error:', error))
  }, [token, syncOrders])

  if (!customer) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-6 py-20 text-center">
        <div className="max-w-md space-y-6">
          <h1 className="font-display text-3xl font-bold tracking-[0.15em] text-[var(--text-primary)] uppercase">
            TÀI KHOẢN
          </h1>
          <p className="text-xs tracking-wider text-[var(--text-muted)]">
            Vui lòng đăng nhập để xem thông tin cá nhân và quản lý đơn hàng.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/login"
              className="rounded-none bg-white text-black px-8 py-3 text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors shadow"
            >
              Đăng nhập
            </Link>
            <Link
              href="/register"
              className="rounded-none border border-white/20 px-8 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:border-white transition-colors"
            >
              Đăng ký
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const customerOrders = orders.filter(
    (o) =>
      o.customerId === customer.id ||
      o.customerEmail.toLowerCase() === customer.email.toLowerCase() ||
      o.customerPhone.replace(/\s+/g, '') === customer.phone.replace(/\s+/g, ''),
  )

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await updateProfile({ name, phone, address })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 sm:px-10 sm:py-16">
      {/* Header Hồ Sơ */}
      <div className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-400 block mb-1">
            Thành viên
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-[0.15em] text-[var(--text-primary)] uppercase">
            {customer.name}
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">{customer.email}</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/account/orders"
            className="flex items-center gap-2 rounded-none border border-white/20 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] hover:border-white hover:bg-white/5 transition-all"
          >
            <Package className="size-3.5 text-white" />
            <span>Đơn hàng ({customerOrders.length})</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              logout()
              router.push('/')
            }}
            className="rounded-none px-4 py-2.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </div>

      {saved && (
        <div className="mb-8 flex items-center justify-center gap-2 rounded-none bg-emerald-500/10 border border-emerald-500/20 py-3 px-4 text-xs font-semibold text-emerald-400">
          <Check className="size-4" />
          <span>Đã lưu cập nhật thông tin thành công!</span>
        </div>
      )}

      {/* Form Thông tin nhận hàng */}
      <form onSubmit={handleSave} className="max-w-2xl space-y-8">
        <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--text-muted)] pb-3 border-b border-[var(--border-subtle)]">
          Thông tin nhận hàng
        </h2>

        <div className="space-y-2">
          <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)] block">
            Họ và tên
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-none border-b border-[var(--border-strong)] bg-transparent py-2.5 text-base sm:text-lg font-medium text-[var(--text-primary)] focus:border-white focus:outline-none transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)] block">
            Số điện thoại
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full rounded-none border-b border-[var(--border-strong)] bg-transparent py-2.5 text-base sm:text-lg font-medium text-[var(--text-primary)] focus:border-white focus:outline-none transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)] block">
            Địa chỉ mặc định
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            className="w-full rounded-none border-b border-[var(--border-strong)] bg-transparent py-2.5 text-base sm:text-lg font-medium text-[var(--text-primary)] focus:border-white focus:outline-none transition-colors"
          />
        </div>

        {/* Nút LƯU THAY ĐỔI: Chữ đen nền trắng hình chữ nhật sắc cạnh */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-none bg-white text-black px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-zinc-200 active:scale-[0.98] transition-all shadow-lg cursor-pointer disabled:opacity-50"
          >
            {saving && <Loader2 className="size-3.5 animate-spin text-black" />}
            <span>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
