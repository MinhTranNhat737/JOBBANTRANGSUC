'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Package, FileText, ExternalLink } from 'lucide-react'
import { useCustomer } from '@/lib/customer-store'
import { useOrderStore } from '@/lib/order-store'
import { ORDER_STATUS_MAP, formatDateTime } from '@/lib/admin-data'
import { formatPrice } from '@/lib/products'

export default function AccountOrdersPage() {
  const { customer } = useCustomer()
  const { orders, syncOrders, getOrdersForCustomer } = useOrderStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data?.orders && Array.isArray(data.orders)) {
          syncOrders(data.orders)
        }
      })
      .catch((err) => console.error(err))
  }, [syncOrders])

  if (!mounted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-xs text-[var(--text-muted)]">
        Đang tải...
      </div>
    )
  }

  const customerOrders = customer
    ? getOrdersForCustomer(customer.id, customer.email, customer.phone)
    : orders.slice(0, 5) // Fallback for guest testing

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 sm:px-10 sm:py-16">
      {/* Header */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.25em] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-2"
          >
            <ArrowLeft className="size-3.5" />
            <span>Quay lại tài khoản</span>
          </Link>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-[0.15em] text-[var(--text-primary)] uppercase">
            LỊCH SỬ ĐƠN HÀNG
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Danh sách tất cả phụ kiện trang sức bạn đã đặt mua tại LEGEND
          </p>
        </div>

        <Link
          href="/collections"
          className="inline-flex self-start sm:self-auto rounded-full bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-black hover:bg-zinc-200 transition-colors shadow"
        >
          Mua sắm thêm
        </Link>
      </div>

      {customerOrders.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-12 text-center space-y-4">
          <Package className="mx-auto size-12 text-[var(--text-muted)] opacity-50" />
          <h3 className="font-display text-lg font-semibold uppercase tracking-wider text-[var(--text-primary)]">
            Chưa có đơn hàng nào
          </h3>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
            Quý khách chưa thực hiện đơn đặt hàng nào với tài khoản này.
          </p>
          <Link
            href="/collections"
            className="inline-block rounded-full bg-white px-8 py-3 text-xs font-bold uppercase tracking-widest text-black hover:bg-zinc-200 transition-colors shadow mt-2"
          >
            Khám phá bộ sưu tập
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {customerOrders.map((order) => {
            const statusConfig = ORDER_STATUS_MAP[order.status] || ORDER_STATUS_MAP.pending

            return (
              <div
                key={order.id}
                className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6 sm:p-8 space-y-6 shadow-xl"
              >
                {/* Header order card */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
                  <div>
                    <span className="font-mono text-base font-bold text-white">{order.id}</span>
                    <span className="text-xs text-[var(--text-muted)] ml-3">
                      {formatDateTime(order.createdAt)}
                    </span>
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

                {/* Danh sách sản phẩm với ảnh TO ĐẸP */}
                <div className="divide-y divide-[var(--border-subtle)]">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-5 py-4 first:pt-0 last:pb-0">
                      {/* Ảnh sản phẩm TO ĐẸP */}
                      <div className="relative size-20 sm:size-24 shrink-0 overflow-hidden rounded-xl bg-zinc-900 border border-[var(--border-subtle)]">
                        <Image
                          src={item.image || '/placeholder.svg'}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm sm:text-base font-medium text-[var(--text-primary)] truncate">
                          {item.name}
                        </h4>
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                          {item.size ? `Size ${item.size} • ` : ''}Số lượng: {item.quantity}
                        </p>
                      </div>
                      <span className="text-sm sm:text-base font-semibold text-[var(--text-primary)]">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer card */}
                <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
                  <div className="text-xs text-[var(--text-muted)]">
                    Phương thức: <strong className="text-[var(--text-primary)]">{order.paymentMethod || 'COD'}</strong>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Tổng thanh toán:</span>
                    <span className="font-display text-lg text-white font-bold">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
