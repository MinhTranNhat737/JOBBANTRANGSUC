'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Check, FileText, ArrowRight } from 'lucide-react'
import { useOrderStore } from '@/lib/order-store'
import { formatPrice } from '@/lib/products'
import type { Order } from '@/lib/admin-data'

function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('id') || ''
  const { getOrderById, syncOrders } = useOrderStore()

  const [order, setOrder] = useState<Order | undefined>(getOrderById(orderId))

  useEffect(() => {
    if (!orderId) return
    const cleanId = orderId.trim()
    const normalized = cleanId.startsWith('#') ? cleanId : `#${cleanId}`

    fetch(`/api/orders/${encodeURIComponent(cleanId)}`)
      .then((res) => {
        if (res.ok) return res.json()
        return fetch(`/api/orders?id=${encodeURIComponent(cleanId)}`).then((r) => r.json())
      })
      .then((data) => {
        if (data?.order) {
          setOrder(data.order)
        } else if (data?.orders && Array.isArray(data.orders)) {
          syncOrders(data.orders)
          const found = data.orders.find(
            (o: Order) => o.id === normalized || o.id.replace('#', '') === cleanId.replace('#', ''),
          )
          if (found) setOrder(found)
        }
      })
      .catch((err) => console.error(err))
  }, [orderId, syncOrders])

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 sm:py-24 text-center">
      {/* Icon check tinh tế */}
      <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full border border-white/20 text-white">
        <Check className="size-6" strokeWidth={1.5} />
      </div>

      <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-400 block mb-2">
        Hoàn tất đặt hàng
      </span>

      <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-[0.15em] text-[var(--text-primary)] uppercase">
        CẢM ƠN QUÝ KHÁCH
      </h1>

      <p className="mt-3 text-sm tracking-wider text-[var(--text-secondary)]">
        Mã đơn hàng của bạn:{' '}
        <strong className="text-white font-mono text-base">{order?.id || orderId}</strong>
      </p>

      {/* Thông tin đơn hàng tóm gọn với ảnh sản phẩm TO & ĐẸP */}
      {order && (
        <div className="mt-10 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6 sm:p-8 text-left space-y-6 shadow-xl">
          <div className="flex justify-between items-center pb-4 border-b border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
            <span>
              Người nhận: <strong className="text-[var(--text-primary)]">{order.customerName}</strong> ({order.customerPhone})
            </span>
            <span className="font-mono text-white font-bold">{order.id}</span>
          </div>

          {/* Danh sách sản phẩm với ảnh TO ĐẸP */}
          <div className="divide-y divide-[var(--border-subtle)]">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 sm:gap-5 py-4 first:pt-0 last:pb-0">
                <div className="relative size-20 sm:size-24 shrink-0 overflow-hidden rounded-xl bg-zinc-900 border border-[var(--border-subtle)]">
                  <Image
                    src={
                      item.image
                        ? (item.image.startsWith('http') || item.image.startsWith('/')
                            ? item.image
                            : `/${item.image}`)
                        : '/placeholder.svg'
                    }
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-medium text-[var(--text-primary)] truncate">
                    {item.name}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {item.size ? `Size ${item.size} • ` : ''}Số lượng: {item.quantity}
                  </p>
                </div>
                <span className="text-sm sm:text-base font-semibold text-[var(--text-primary)]">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[var(--border-subtle)] flex justify-between items-center text-sm font-bold text-[var(--text-primary)]">
            <span className="uppercase tracking-wider">Tổng thanh toán</span>
            <span className="font-display text-lg text-white font-bold">{formatPrice(order.total)}</span>
          </div>
        </div>
      )}

      {/* 3 Nút tối giản, rõ ràng kèm nút XEM HÓA ĐƠN ĐIỆN TỬ */}
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5">
        <Link
          href={`/invoice?id=${encodeURIComponent(order?.id || orderId)}`}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-zinc-200 transition-colors shadow"
        >
          <FileText className="size-4" />
          <span>Xem hóa đơn điện tử</span>
        </Link>
        <Link
          href={`/tracking?id=${encodeURIComponent(order?.id || orderId)}`}
          className="w-full sm:w-auto rounded-full border border-white/20 px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-primary)] hover:border-white hover:bg-white/5 transition-colors"
        >
          Theo dõi đơn hàng
        </Link>
        <Link
          href="/collections"
          className="w-full sm:w-auto rounded-full border border-[var(--border-subtle)] px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)] hover:text-white hover:border-white transition-colors"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center text-xs text-[var(--text-muted)]">Đang tải...</div>}>
      <OrderSuccessContent />
    </Suspense>
  )
}
