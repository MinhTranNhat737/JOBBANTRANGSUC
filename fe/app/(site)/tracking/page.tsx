'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Package, Clock, CheckCircle2, Truck, FileText } from 'lucide-react'
import { ORDER_STATUS_MAP, formatDateTime } from '@/lib/admin-data'
import { useOrderStore } from '@/lib/order-store'
import { formatPrice } from '@/lib/products'
import type { Order } from '@/lib/admin-data'

function TrackingContent() {
  const searchParams = useSearchParams()
  const initialId = searchParams.get('id') || ''

  const { orders, syncOrders } = useOrderStore()
  const [query, setQuery] = useState(initialId)
  const [searched, setSearched] = useState(false)
  const [foundOrders, setFoundOrders] = useState<Order[]>([])

  // Always sync with server orders
  useEffect(() => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data?.orders && Array.isArray(data.orders)) {
          syncOrders(data.orders)
        }
      })
      .catch((err) => console.error(err))
  }, [syncOrders])

  const doSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setFoundOrders([])
      setSearched(false)
      return
    }

    const clean = searchQuery.trim().toLowerCase()
    const cleanNum = clean.replace(/\D/g, '')

    const matches = orders.filter((o) => {
      const oId = o.id.toLowerCase()
      const oPhone = o.customerPhone.replace(/\s+/g, '')
      const oEmail = o.customerEmail.toLowerCase()

      if (oId === clean || oId.replace('#', '') === clean) return true
      if (cleanNum && oId.replace(/\D/g, '').includes(cleanNum)) return true
      if (cleanNum && oPhone.includes(cleanNum)) return true
      if (oEmail.includes(clean)) return true
      return false
    })

    setFoundOrders(matches)
    setSearched(true)
  }

  useEffect(() => {
    if (initialId) {
      setQuery(initialId)
      doSearch(initialId)
    }
  }, [initialId, orders])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    doSearch(query)
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8 sm:py-16">
      {/* Header */}
      <div className="mb-10 text-center space-y-2">
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-[0.2em] text-[var(--text-primary)] uppercase">
          TRA CỨU ĐƠN HÀNG
        </h1>
        <p className="text-xs tracking-wider text-[var(--text-muted)]">
          Nhập mã đơn hàng (#1090) hoặc số điện thoại để kiểm tra tiến trình giao nhận và hóa đơn
        </p>
      </div>

      {/* Thanh tìm kiếm */}
      <form onSubmit={handleSearchSubmit} className="relative mb-12 max-w-xl mx-auto">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Mã đơn hàng (ví dụ #1090) hoặc SĐT..."
          required
          className="w-full rounded-full border border-[var(--border-strong)] bg-[var(--surface-primary)] px-6 py-4 pl-12 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-white focus:outline-none transition-colors"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[var(--text-muted)]" />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white px-5 py-2 text-xs font-bold uppercase tracking-wider text-black hover:bg-zinc-200 transition-colors shadow"
        >
          Tra cứu
        </button>
      </form>

      {/* Kết quả */}
      {searched && (
        <div className="space-y-8">
          {foundOrders.length === 0 ? (
            <p className="text-center text-xs text-[var(--text-muted)] py-8">
              Không tìm thấy đơn hàng phù hợp. Vui lòng kiểm tra lại mã đơn hoặc số điện thoại.
            </p>
          ) : (
            foundOrders.map((order) => {
              const statusConfig = ORDER_STATUS_MAP[order.status] || ORDER_STATUS_MAP.pending

              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6 sm:p-8 space-y-6 shadow-xl"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
                    <div>
                      <span className="font-mono text-lg font-bold text-white">{order.id}</span>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        {order.customerName} • {order.customerPhone}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Link
                        href={`/invoice?id=${encodeURIComponent(order.id)}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-white hover:bg-white hover:text-black transition-all"
                      >
                        <FileText className="size-3" />
                        <span>Xem hóa đơn</span>
                      </Link>
                      <span
                        className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                        style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}
                      >
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>

                  {/* Địa chỉ & Sản phẩm với ảnh TO ĐẸP */}
                  <div className="space-y-4">
                    <p className="text-xs text-[var(--text-muted)]">
                      Địa chỉ nhận: <strong className="text-[var(--text-primary)]">{order.customerAddress}</strong>
                    </p>

                    <div className="divide-y divide-[var(--border-subtle)]">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                          {/* Ảnh sản phẩm TO ĐẸP */}
                          <div className="relative size-16 sm:size-20 shrink-0 overflow-hidden rounded-xl bg-zinc-900 border border-[var(--border-subtle)]">
                            <Image
                              src={item.image || '/placeholder.svg'}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-[var(--text-primary)] truncate">
                              {item.name}
                            </h4>
                            <p className="text-xs text-[var(--text-muted)] mt-0.5">
                              {item.size ? `Size ${item.size} • ` : ''}Số lượng: {item.quantity}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-[var(--text-primary)]">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between pt-3 border-t border-[var(--border-subtle)] text-sm font-bold text-[var(--text-primary)]">
                      <span>Tổng tiền:</span>
                      <span className="text-white font-display font-bold text-base">{formatPrice(order.total)}</span>
                    </div>
                  </div>

                  {/* Tiến trình đơn hàng */}
                  <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3">
                    <span className="text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)] block font-semibold">
                      Tiến trình đơn hàng
                    </span>
                    <div className="space-y-2.5">
                      {order.timeline.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-xs">
                          <span className="text-white mt-0.5 font-bold">●</span>
                          <div>
                            <span className="font-medium text-[var(--text-primary)]">{step.status}</span>
                            {step.note && <span className="text-[var(--text-muted)] ml-2">— {step.note}</span>}
                            <span className="text-[10px] text-[var(--text-muted)] block">{formatDateTime(step.date)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

export default function TrackingPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center text-xs text-[var(--text-muted)]">Đang tải...</div>}>
      <TrackingContent />
    </Suspense>
  )
}
