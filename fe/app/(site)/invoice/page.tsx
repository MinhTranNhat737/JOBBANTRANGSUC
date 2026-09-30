'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react'
import { useOrderStore } from '@/lib/order-store'
import { formatPrice } from '@/lib/products'
import type { Order } from '@/lib/admin-data'

function InvoiceContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('id') || ''
  const { getOrderById, syncOrders } = useOrderStore()

  const [order, setOrder] = useState<Order | undefined>(getOrderById(orderId))
  const [loading, setLoading] = useState(!order)

  useEffect(() => {
    // If not found in local store, fetch from server repo
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data?.orders && Array.isArray(data.orders)) {
          syncOrders(data.orders)
          const normalized = orderId.startsWith('#') ? orderId : `#${orderId}`
          const found = data.orders.find(
            (o: Order) => o.id === normalized || o.id.replace('#', '') === orderId.replace('#', ''),
          )
          if (found) setOrder(found)
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [orderId, syncOrders])

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-xs tracking-widest text-[var(--text-muted)] uppercase">
        Đang tải hóa đơn...
      </div>
    )
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-[var(--text-primary)]">
          Không tìm thấy hóa đơn
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-2">
          Mã đơn hàng &ldquo;{orderId}&rdquo; không tồn tại hoặc chưa được đồng bộ.
        </p>
        <Link
          href="/tracking"
          className="mt-6 inline-block rounded-full bg-white px-8 py-3 text-xs font-bold uppercase tracking-widest text-black hover:bg-zinc-200 transition-colors shadow"
        >
          Tra cứu đơn hàng khác
        </Link>
      </div>
    )
  }

  const isPaid =
    order.paymentStatus === 'paid' ||
    order.status === 'confirmed' ||
    order.status === 'shipping' ||
    order.status === 'delivered'

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8 sm:py-14 print:p-0 print:max-w-none">
      {/* Top Navigation & Print action (hidden when printing) */}
      <div className="mb-8 flex items-center justify-between print:hidden">
        <Link
          href={`/tracking?id=${encodeURIComponent(order.id)}`}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--text-muted)] hover:text-white transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Quay lại tra cứu</span>
        </Link>
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-white hover:text-black transition-all shadow"
        >
          <Printer className="size-3.5" />
          <span>In hóa đơn / Lưu PDF</span>
        </button>
      </div>

      {/* Main Luxury Invoice Card */}
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[#0d0d10] p-6 sm:p-10 shadow-2xl print:border-none print:bg-white print:text-black print:p-4">
        {/* Brand Header */}
        <div className="pb-8 border-b border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="font-display text-2xl sm:text-3xl font-bold tracking-[0.25em] text-white uppercase print:text-black">
              LEGEND
            </span>
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[var(--text-muted)] mt-1">
              FINE JEWELRY & HANDCRAFTED SILVER
            </p>
          </div>

          <div className="sm:text-right">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)] block">
              HÓA ĐƠN ĐIỆN TỬ
            </span>
            <span className="font-mono text-lg font-bold text-white print:text-black">
              {order.id}
            </span>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Payment Status Banner */}
        <div className="py-4 my-6 rounded-xl border border-white/10 bg-white/[0.02] flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 gap-3 print:border-gray-300">
          <div className="flex items-center gap-2.5">
            {isPaid ? (
              <CheckCircle2 className="size-4 text-emerald-400 print:text-green-600" />
            ) : (
              <Clock className="size-4 text-zinc-400" />
            )}
            <span className="text-xs font-bold uppercase tracking-wider text-white print:text-black">
              {isPaid ? 'ĐÃ THANH TOÁN THÀNH CÔNG' : 'CHỜ THANH TOÁN / XỬ LÝ (COD)'}
            </span>
          </div>
          <div className="text-xs text-[var(--text-muted)] print:text-gray-600">
            Phương thức: <strong className="text-white print:text-black">{order.paymentMethod || 'COD'}</strong>
            {order.transactionId && (
              <span className="ml-2 font-mono text-[11px] text-[var(--text-secondary)]">
                (Mã GD: {order.transactionId})
              </span>
            )}
          </div>
        </div>

        {/* Customer & Shipping info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-8 border-b border-[var(--border-subtle)] text-xs">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)] block mb-1">
              Khách hàng
            </span>
            <p className="text-sm font-semibold text-white print:text-black">{order.customerName}</p>
            <p className="text-[var(--text-secondary)] print:text-gray-700">📞 {order.customerPhone}</p>
            <p className="text-[var(--text-secondary)] print:text-gray-700">📧 {order.customerEmail}</p>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)] block mb-1">
              Địa chỉ nhận hàng
            </span>
            <p className="text-[var(--text-primary)] print:text-black font-medium leading-relaxed">
              📍 {order.customerAddress}
            </p>
            {order.notes && (
              <p className="text-[var(--text-muted)] italic mt-1">
                Ghi chú: &ldquo;{order.notes}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* Product Items Table with BIG beautiful images */}
        <div className="py-6">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)] block mb-4">
            Chi tiết trang sức ({order.items.length})
          </span>

          <div className="divide-y divide-[var(--border-subtle)]">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-5 py-4 first:pt-0 last:pb-0">
                {/* Big Beautiful Product Image */}
                <div className="relative size-20 sm:size-24 shrink-0 overflow-hidden rounded-xl bg-zinc-900 border border-white/10 print:border-gray-300">
                  <Image
                    src={item.image || '/placeholder.svg'}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-white print:text-black truncate">
                    {item.name}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] print:text-gray-600 mt-1">
                    {item.size ? `Size ${item.size} • ` : ''}Chất liệu: Bạc Thái 925 Thủ công
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Số lượng: <strong>{item.quantity}</strong> × {formatPrice(item.price)}
                  </p>
                </div>

                {/* Total per line */}
                <span className="text-sm sm:text-base font-semibold text-white print:text-black">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Calculation Totals */}
        <div className="pt-6 border-t border-[var(--border-subtle)] space-y-2.5 text-xs text-[var(--text-secondary)] print:text-gray-700">
          <div className="flex justify-between">
            <span>Tạm tính</span>
            <span className="text-white print:text-black font-medium">
              {formatPrice(order.total - order.shippingFee)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Phí vận chuyển bảo hiểm</span>
            <span className="text-white print:text-black font-medium">
              {order.shippingFee === 0 ? 'Miễn phí' : formatPrice(order.shippingFee)}
            </span>
          </div>
          <div className="pt-4 border-t border-[var(--border-subtle)] flex justify-between items-center text-base sm:text-lg font-bold text-white print:text-black">
            <span className="uppercase tracking-wider text-xs sm:text-sm">Tổng cộng thanh toán</span>
            <span className="font-display text-xl sm:text-2xl text-white print:text-black font-bold">
              {formatPrice(order.total)}
            </span>
          </div>
        </div>

        {/* Warranty and Store Notice */}
        <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white print:text-black">
            <ShieldCheck className="size-4 text-emerald-400" />
            <span>Chính sách bảo hành trọn đời</span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] print:text-gray-600 max-w-lg mx-auto leading-relaxed">
            Miễn phí làm sáng, đánh bóng và vệ sinh trang sức bạc 925 trọn đời tại mọi showroom LEGEND trên toàn quốc.
            Hotline hỗ trợ khách hàng: <strong>1900 1234</strong> (8:00 - 21:00 hàng ngày).
          </p>
        </div>
      </div>

      {/* Bottom Action CTAs (hidden when printing) */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 print:hidden">
        <Link
          href={`/tracking?id=${encodeURIComponent(order.id)}`}
          className="w-full sm:w-auto rounded-full bg-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-black hover:bg-zinc-200 transition-colors shadow text-center"
        >
          Theo dõi hành trình đơn hàng
        </Link>
        <Link
          href="/collections"
          className="w-full sm:w-auto rounded-full border border-white/20 px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)] hover:text-white hover:border-white transition-colors text-center"
        >
          Khám phá thêm trang sức
        </Link>
      </div>
    </div>
  )
}

export default function InvoicePage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center text-xs text-[var(--text-muted)]">Đang tải hóa đơn...</div>}>
      <InvoiceContent />
    </Suspense>
  )
}
