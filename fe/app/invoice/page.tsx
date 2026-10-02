'use client'

import { Suspense, useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Printer,
  ArrowLeft,
  Download,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react'
import { useOrderStore } from '@/lib/order-store'
import { formatPrice } from '@/lib/products'
import type { Order } from '@/lib/admin-data'

function InvoiceDocument() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('id') || ''
  const shouldAutoPrint = searchParams.get('print') === 'true' || searchParams.get('print') === '1'
  const { getOrderById, syncOrders } = useOrderStore()

  const [order, setOrder] = useState<Order | undefined>(getOrderById(orderId))
  const [loading, setLoading] = useState(!order)
  const hasAutoPrinted = useRef(false)

  useEffect(() => {
    if (!orderId) {
      setLoading(false)
      return
    }

    const cleanId = orderId.trim()
    const normalized = cleanId.startsWith('#') ? cleanId : `#${cleanId}`

    // Check if in local store
    const local = getOrderById(cleanId)
    if (local) {
      setOrder(local)
      setLoading(false)
    }

    // Luôn fetch trực tiếp từ server để lấy dữ liệu mới nhất
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
      .catch((err) => console.error('Lỗi tải hóa đơn:', err))
      .finally(() => setLoading(false))
  }, [orderId, getOrderById, syncOrders])

  // Tự động kích hoạt hộp thoại in / xuất PDF nếu có param ?print=true
  useEffect(() => {
    if (!loading && order && shouldAutoPrint && !hasAutoPrinted.current) {
      hasAutoPrinted.current = true
      const timer = setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.print()
        }
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [loading, order, shouldAutoPrint])

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  const handleBack = () => {
    if (typeof window !== 'undefined') {
      if (window.history.length > 1) {
        window.history.back()
      } else {
        router.push('/admin/orders')
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121214] flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4" />
        <p className="text-xs uppercase tracking-widest text-zinc-400">Đang tạo hóa đơn PDF...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#0f0f11] flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="max-w-md w-full bg-[#18181b] border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4">
            ✕
          </div>
          <h1 className="text-xl font-bold uppercase tracking-wider mb-2 font-display">
            Không tìm thấy hóa đơn
          </h1>
          <p className="text-sm text-zinc-400 mb-6">
            Mã đơn hàng &ldquo;<span className="text-white font-mono">{orderId}</span>&rdquo; không tồn tại hoặc chưa được lưu trên hệ thống.
          </p>
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black font-semibold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-colors"
          >
            <ArrowLeft className="size-4" /> Quay lại
          </button>
        </div>
      </div>
    )
  }

  const isPaid = order.paymentStatus === 'paid'

  const formattedDate = new Date(order.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  const formattedTime = new Date(order.createdAt).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="min-h-screen bg-[#0e0e11] text-zinc-900 font-sans antialiased py-0 sm:py-8 print:p-0 print:bg-white print:min-h-0">
      {/* Top Document Bar (Ẩn khi in) */}
      <header className="fixed top-0 inset-x-0 z-50 h-14 bg-[#18181c]/95 backdrop-blur border-b border-zinc-800 px-4 sm:px-8 flex items-center justify-between text-white print:hidden">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Đóng / Quay lại"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Quay lại</span>
          </button>

          <div className="h-4 w-[1px] bg-zinc-700 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs sm:text-sm tracking-wide text-zinc-100">
              Hóa đơn điện tử <span className="font-mono text-zinc-100 font-bold">{order.id}</span>
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-none border border-zinc-700">
              <ShieldCheck className="size-3 text-emerald-400" /> Bản in chuẩn A4
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-none bg-white text-black font-semibold text-xs tracking-wider uppercase hover:bg-zinc-200 transition-colors shadow-sm cursor-pointer"
          >
            <Printer className="size-3.5" />
            <span>In hóa đơn / Lưu file PDF</span>
          </button>
        </div>
      </header>

      {/* Spacing for fixed topbar (Ẩn khi in) */}
      <div className="h-16 print:hidden" />

      {/* Main A4 Document Sheet */}
      <div className="max-w-[794px] mx-auto bg-white p-8 sm:p-12 shadow-2xl rounded-none sm:rounded-lg border sm:border-zinc-200/80 text-[#18181b] relative print:border-none print:shadow-none print:p-0 print:max-w-none print:rounded-none">
        
        {/* Header: Brand & Document Title */}
        <div className="flex justify-between items-start pb-6 border-b-2 border-zinc-900">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-[0.22em] text-zinc-900 uppercase font-[family-name:var(--font-cinzel)]">
              THUC LUXURY
            </h1>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-600 mt-1">
              FINE JEWELRY &amp; HANDCRAFTED SILVER
            </p>
            <p className="text-[11px] text-zinc-500 mt-2">
              Website: <strong className="text-zinc-700 font-normal">thucluxury.vn</strong> • Hotline: <strong className="text-zinc-700 font-normal">1900 1234</strong>
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-800 block">
              HÓA ĐƠN BÁN HÀNG
            </span>
            <div className="font-mono text-xl sm:text-2xl font-black text-zinc-900 mt-1">
              {order.id}
            </div>
            <div className="text-xs text-zinc-500 mt-1 flex items-center justify-end gap-1.5">
              <Clock className="size-3 text-zinc-400" />
              <span>{formattedTime} • {formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Payment Status Banner */}
        <div className="my-5 p-3 rounded-none bg-zinc-50 border border-zinc-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            {isPaid ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-none">
                <CheckCircle2 className="size-3.5" /> ĐÃ THANH TOÁN THÀNH CÔNG
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-800 bg-zinc-200 px-2.5 py-1 rounded-none">
                <Clock className="size-3.5" /> CHỜ THANH TOÁN (COD)
              </span>
            )}
          </div>
          <div className="text-zinc-600">
            <span>Phương thức:</span>{' '}
            <strong className="text-zinc-900 font-semibold">{order.paymentMethod || 'Tiền mặt khi nhận hàng (COD)'}</strong>
            {order.transactionId && (
              <span className="ml-2 font-mono text-[11px] text-zinc-500">
                (Mã GD: {order.transactionId})
              </span>
            )}
          </div>
        </div>

        {/* 2-Column: Customer & Shipping Info */}
        <div className="grid grid-cols-2 gap-8 py-4 border-b border-zinc-200 text-xs">
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2">
              THÔNG TIN KHÁCH HÀNG
            </h3>
            <p className="text-sm font-bold text-zinc-900 mb-1">
              {order.customerName}
            </p>
            <p className="text-zinc-600 leading-relaxed">
              <span className="font-semibold text-zinc-700">Điện thoại:</span> <span className="font-mono">{order.customerPhone}</span>
            </p>
            <p className="text-zinc-600 leading-relaxed">
              <span className="font-semibold text-zinc-700">Email:</span> {order.customerEmail}
            </p>
          </div>

          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2">
              ĐỊA CHỈ GIAO HÀNG
            </h3>
            <p className="text-xs text-zinc-800 font-medium leading-relaxed">
              {order.customerAddress}
            </p>
            {order.notes && (
              <p className="text-[11px] text-zinc-500 italic mt-2 bg-zinc-50 p-2 rounded border border-zinc-150">
                Ghi chú: &ldquo;{order.notes}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="py-5">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-zinc-900 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                <th className="py-2.5 w-10 text-center">STT</th>
                <th className="py-2.5">Sản phẩm trang sức</th>
                <th className="py-2.5 text-center w-16">SL</th>
                <th className="py-2.5 text-right w-28">Đơn giá</th>
                <th className="py-2.5 text-right w-32">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {order.items.map((item, idx) => (
                <tr key={idx} className="align-middle">
                  <td className="py-3 text-center font-mono text-zinc-500">
                    {idx + 1}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <div className="relative size-10 shrink-0 overflow-hidden rounded border border-zinc-200 bg-zinc-100">
                          <Image
                            src={
                              item.image.startsWith('http') || item.image.startsWith('/')
                                ? item.image
                                : `/${item.image}`
                            }
                            alt=""
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-zinc-900">{item.name}</div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">
                          {item.size ? `Size: ${item.size} • ` : ''}Chất liệu: Bạc Thái 925 Thủ công cao cấp
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-center font-mono font-medium text-zinc-800">
                    {item.quantity}
                  </td>
                  <td className="py-3 text-right font-mono text-zinc-600">
                    {formatPrice(item.price)}
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-zinc-900">
                    {formatPrice(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation Totals */}
        <div className="border-t-2 border-zinc-900 pt-4 flex justify-end">
          <div className="w-64 space-y-2 text-xs">
            <div className="flex justify-between text-zinc-600">
              <span>Tạm tính tiền hàng:</span>
              <span className="font-mono text-zinc-800 font-medium">
                {formatPrice(order.total - order.shippingFee)}
              </span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Phí vận chuyển bảo hiểm:</span>
              <span className="font-mono text-zinc-800 font-medium">
                {order.shippingFee === 0 ? 'Miễn phí' : formatPrice(order.shippingFee)}
              </span>
            </div>
            <div className="border-t border-zinc-300 pt-2 flex justify-between items-baseline font-bold">
              <span className="uppercase text-[11px] tracking-wider text-zinc-900">TỔNG THANH TOÁN:</span>
              <span className="text-base sm:text-lg font-black text-zinc-900 font-[family-name:var(--font-cinzel)]">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Signatures & Seal Section */}
        <div className="mt-8 pt-6 border-t border-zinc-200 grid grid-cols-2 text-center text-xs">
          <div>
            <p className="font-bold uppercase tracking-wider text-[11px] text-zinc-700">NGƯỜI MUA HÀNG</p>
            <p className="text-[10px] text-zinc-400 italic mt-0.5">(Ký, ghi rõ họ tên)</p>
            <div className="h-16 flex items-end justify-center font-medium text-zinc-700">
              {order.customerName}
            </div>
          </div>

          <div>
            <p className="font-bold uppercase tracking-wider text-[11px] text-zinc-700">ĐẠI DIỆN THUC LUXURY</p>
            <p className="text-[10px] text-zinc-400 italic mt-0.5">(Người lập hóa đơn &amp; Đóng dấu)</p>
            <div className="h-16 flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold text-zinc-900 border border-zinc-900 px-3 py-1 rounded-none tracking-widest uppercase bg-zinc-100">
                THUC LUXURY CERTIFIED
              </span>
            </div>
          </div>
        </div>

        {/* Warranty Notice Footer */}
        <div className="mt-8 pt-4 border-t border-zinc-200 text-center text-[10px] text-zinc-500 space-y-1">
          <p className="font-semibold uppercase tracking-widest text-zinc-700">
            CHÍNH SÁCH BẢO HÀNH &amp; CHĂM SÓC BẠC 925 TRỌN ĐỜI
          </p>
          <p>
            Miễn phí làm sáng, đánh bóng trọn đời tại mọi showroom THUC LUXURY trên toàn quốc.
          </p>
          <p className="font-mono text-zinc-400">
            Hotline hỗ trợ: 1900 1234 • Email: support@thucluxury.vn • Cảm ơn quý khách đã tin dùng sản phẩm!
          </p>
        </div>

      </div>

      {/* Global Print Style for clean 1-page A4 PDF output */}
      <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 10mm;
        }
        @media print {
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden,
          header,
          footer,
          nav {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}

export default function InvoicePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0e0e11] flex items-center justify-center text-xs tracking-widest text-zinc-400 uppercase">
          Đang tải hóa đơn điện tử...
        </div>
      }
    >
      <InvoiceDocument />
    </Suspense>
  )
}
