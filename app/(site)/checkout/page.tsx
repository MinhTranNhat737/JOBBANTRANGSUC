'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  QrCode,
  ShieldCheck,
  Wallet,
  Landmark,
  Truck,
  X,
} from 'lucide-react'
import { useCustomer } from '@/lib/customer-store'
import { useShop, selectCartTotal } from '@/lib/store'
import { useOrderStore } from '@/lib/order-store'
import { formatPrice } from '@/lib/products'
import type { Order } from '@/lib/admin-data'

type PaymentMethodType = 'SEPAY' | 'MOMO' | 'COD'

export default function CheckoutPage() {
  const router = useRouter()
  const { customer } = useCustomer()
  const { cart, clearCart } = useShop()
  const cartTotal = useShop(selectCartTotal)
  const { createOrder, markOrderAsPaid } = useOrderStore()

  const [mounted, setMounted] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('SEPAY')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Payment Modal States
  const [activeModal, setActiveModal] = useState<'SEPAY' | 'MOMO' | null>(null)
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [momoPayData, setMomoPayData] = useState<{
    qrCodeUrl?: string
    payUrl?: string
    deeplink?: string
  } | null>(null)
  const [isCopiedAcc, setIsCopiedAcc] = useState(false)
  const [isCopiedDes, setIsCopiedDes] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
  const [simulatingPayment, setSimulatingPayment] = useState(false)

  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setMounted(true)
    if (customer) {
      setName(customer.name || '')
      setPhone(customer.phone || '')
      setEmail(customer.email || '')
      setAddress(customer.address || '')
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [customer])

  if (!mounted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-xs text-[var(--text-muted)]">
        Đang tải...
      </div>
    )
  }

  if (cart.length === 0 && !activeModal) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-6 py-20 text-center">
        <div className="max-w-md space-y-6">
          <h1 className="font-display text-3xl font-bold tracking-[0.15em] text-[var(--text-primary)] uppercase">
            GIỎ HÀNG TRỐNG
          </h1>
          <p className="text-xs tracking-wider text-[var(--text-muted)]">
            Quý khách chưa có sản phẩm nào để tiến hành thanh toán.
          </p>
          <Link
            href="/collections"
            className="inline-block rounded-full bg-white text-black px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-zinc-200 transition-colors shadow"
          >
            Khám phá bộ sưu tập
          </Link>
        </div>
      </div>
    )
  }

  const shippingFee = cartTotal >= 2000000 ? 0 : 30000
  const grandTotal = cartTotal + shippingFee

  // Dispatch order to server repository + telegram + email notifications
  const dispatchOrderNotifications = async (order: Order, paymentNote?: string) => {
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order, paymentNote }),
      })
    } catch (err) {
      console.warn('Failed to send order notification:', err)
    }
  }

  // Handle Order Submit
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim() || !phone.trim() || !address.trim() || !email.trim()) {
      setError('Vui lòng điền đầy đủ Họ tên, SĐT, Email và Địa chỉ giao hàng.')
      return
    }

    setSubmitting(true)

    try {
      // 1. COD Flow
      if (paymentMethod === 'COD') {
        const order = createOrder({
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          customerAddress: address,
          notes: notes.trim() || undefined,
          paymentMethod: 'Thanh toán khi nhận hàng (COD)',
          paymentGateway: 'cod',
          paymentStatus: 'pending',
          customerId: customer?.id,
          shippingFee,
          total: grandTotal,
          items: cart.map((i) => ({
            slug: i.slug,
            name: i.name,
            image: i.image,
            size: i.size,
            quantity: i.quantity,
            price: i.price,
          })),
        })

        // Dispatch notifications (Telegram + Email + Server Save)
        await dispatchOrderNotifications(order, 'COD - Đặt hàng thành công')
        clearCart()
        router.push(`/order-success?id=${encodeURIComponent(order.id)}&method=cod`)
        return
      }

      // 2. SePay VietQR Flow
      if (paymentMethod === 'SEPAY') {
        const order = createOrder({
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          customerAddress: address,
          notes: notes.trim() || undefined,
          paymentMethod: 'Chuyển khoản SePay (VietQR)',
          paymentGateway: 'sepay',
          paymentStatus: 'pending',
          customerId: customer?.id,
          shippingFee,
          total: grandTotal,
          items: cart.map((i) => ({
            slug: i.slug,
            name: i.name,
            image: i.image,
            size: i.size,
            quantity: i.quantity,
            price: i.price,
          })),
        })

        setCurrentOrder(order)
        // Also save initial pending order to server
        await dispatchOrderNotifications(order, 'Chuyển khoản VietQR SePay - Đang chờ quét mã')
        setActiveModal('SEPAY')
        setSubmitting(false)
        startSepayPolling(order.id)
        return
      }

      // 3. MoMo Wallet Flow
      if (paymentMethod === 'MOMO') {
        const order = createOrder({
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          customerAddress: address,
          notes: notes.trim() || undefined,
          paymentMethod: 'Ví MoMo',
          paymentGateway: 'momo',
          paymentStatus: 'pending',
          customerId: customer?.id,
          shippingFee,
          total: grandTotal,
          items: cart.map((i) => ({
            slug: i.slug,
            name: i.name,
            image: i.image,
            size: i.size,
            quantity: i.quantity,
            price: i.price,
          })),
        })

        setCurrentOrder(order)
        // Also save initial pending order to server
        await dispatchOrderNotifications(order, 'Ví điện tử MoMo - Đang chờ quét mã')

        // Request MoMo payment transaction
        const res = await fetch('/api/payment/momo/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order }),
        })
        const data = await res.json()

        setMomoPayData({
          qrCodeUrl: data.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=momo_order_${order.id}`,
          payUrl: data.payUrl,
          deeplink: data.deeplink,
        })

        setActiveModal('MOMO')
        setSubmitting(false)
        return
      }
    } catch (err: any) {
      setSubmitting(false)
      setError(err?.message || 'Có lỗi khi xử lý đơn hàng. Vui lòng thử lại.')
    }
  }

  // Start checking SePay status
  const startSepayPolling = (orderId: string) => {
    setIsPolling(true)
    if (pollingRef.current) clearInterval(pollingRef.current)

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment/sepay/check?orderId=${encodeURIComponent(orderId)}`)
        const data = await res.json()
        if (data.isPaid) {
          if (pollingRef.current) clearInterval(pollingRef.current)
          handlePaymentSuccess('sepay', data.transaction?.referenceNumber || `SEP-${Date.now()}`)
        }
      } catch (e) {
        console.error('Polling error:', e)
      }
    }, 3000)
  }

  // Handle successful payment transition
  const handlePaymentSuccess = async (gateway: 'sepay' | 'momo', transactionId?: string) => {
    if (!currentOrder) return
    setIsPolling(false)
    if (pollingRef.current) clearInterval(pollingRef.current)

    // Mark as paid in local state
    markOrderAsPaid(currentOrder.id, gateway, transactionId)

    const updatedOrder: Order = {
      ...currentOrder,
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentGateway: gateway,
      transactionId: transactionId || `TX-${Date.now()}`,
      paidAt: new Date().toISOString(),
    }

    // Fire telegram alert & email invoices
    await dispatchOrderNotifications(
      updatedOrder,
      gateway === 'sepay' ? 'SePay VietQR (Tự động)' : 'Ví MoMo API (Tự động)',
    )

    clearCart()
    setActiveModal(null)
    router.push(`/order-success?id=${encodeURIComponent(currentOrder.id)}&payment=${gateway}`)
  }

  // Simulate payment (instant test button)
  const handleSimulatePayment = async (gateway: 'sepay' | 'momo') => {
    if (!currentOrder) return
    setSimulatingPayment(true)

    try {
      if (gateway === 'sepay') {
        const res = await fetch('/api/payment/sepay/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: currentOrder.id,
            amount: currentOrder.total,
          }),
        })
        const data = await res.json()
        await handlePaymentSuccess('sepay', data.transaction?.referenceNumber || `SIM-SEP-${Date.now()}`)
      } else {
        await fetch(`/api/payment/momo/ipn?simulate=true&orderId=${encodeURIComponent(currentOrder.id)}&amount=${currentOrder.total}`)
        await handlePaymentSuccess('momo', `SIM-MOMO-${Date.now()}`)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSimulatingPayment(false)
    }
  }

  // Copy to clipboard helpers
  const copyToClipboard = (text: string, type: 'acc' | 'des') => {
    navigator.clipboard.writeText(text)
    if (type === 'acc') {
      setIsCopiedAcc(true)
      setTimeout(() => setIsCopiedAcc(false), 2000)
    } else {
      setIsCopiedDes(true)
      setTimeout(() => setIsCopiedDes(false), 2000)
    }
  }

  // SePay QR parameters
  const sepayDescription = currentOrder ? `LEGEND${currentOrder.id.replace(/\D/g, '')}` : 'LEGEND1090'
  const sepayQrUrl = currentOrder
    ? `https://qr.sepay.vn/img?acc=102873892837&bank=VietinBank&amount=${currentOrder.total}&des=${encodeURIComponent(
        sepayDescription,
      )}&template=compact`
    : ''

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 sm:px-10 lg:px-12">
      {/* Header */}
      <div className="mb-10 text-center space-y-2">
        <Link
          href="/collections"
          className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.25em] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-2"
        >
          <ArrowLeft className="size-3.5" />
          <span>Tiếp tục mua hàng</span>
        </Link>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-[0.2em] text-[var(--text-primary)] uppercase">
          THANH TOÁN
        </h1>
        {customer ? (
          <p className="text-xs text-[var(--text-muted)]">
            Thành viên: <strong className="text-[var(--text-primary)]">{customer.name}</strong> ({customer.email})
          </p>
        ) : (
          <p className="text-xs text-[var(--text-muted)]">
            Khách hàng vãng lai •{' '}
            <Link href="/login?redirect=/checkout" className="underline hover:text-white">
              Đăng nhập
            </Link>
          </p>
        )}
      </div>

      {error && (
        <p className="mb-8 text-center text-xs text-rose-400 bg-rose-500/10 py-3 px-4 rounded-lg">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 items-start">
          {/* Cột trái: Thông tin nhận hàng & Cổng thanh toán (7 cột) */}
          <div className="lg:col-span-7 space-y-10">
            {/* Địa chỉ */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--text-muted)] pb-3 border-b border-[var(--border-subtle)] mb-6">
                Địa chỉ nhận hàng
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)] block mb-1">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    required
                    className="w-full rounded-none border-b border-[var(--border-strong)] bg-transparent py-2.5 text-base text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-white focus:outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)] block mb-1">
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0901 234 567"
                      required
                      className="w-full rounded-none border-b border-[var(--border-strong)] bg-transparent py-2.5 text-base text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-white focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)] block mb-1">
                      Email nhận hóa đơn *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nhap@email.com"
                      required
                      className="w-full rounded-none border-b border-[var(--border-strong)] bg-transparent py-2.5 text-base text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-white focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)] block mb-1">
                    Địa chỉ chi tiết *
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, thành phố"
                    required
                    className="w-full rounded-none border-b border-[var(--border-strong)] bg-transparent py-2.5 text-base text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-white focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)] block mb-1">
                    Ghi chú (tuỳ chọn)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Yêu cầu riêng về kích cỡ hoặc giờ giao"
                    className="w-full rounded-none border-b border-[var(--border-strong)] bg-transparent py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-white focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Cổng thanh toán */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--text-muted)] pb-3 border-b border-[var(--border-subtle)] mb-4">
                Phương thức thanh toán
              </h2>

              <div className="space-y-3">
                {/* SePay VietQR Option */}
                <label
                  className={`flex items-start justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                    paymentMethod === 'SEPAY'
                      ? 'border-white bg-white/[0.04] shadow-sm'
                      : 'border-[var(--border-subtle)] hover:border-white/40'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'SEPAY'}
                      onChange={() => setPaymentMethod('SEPAY')}
                      className="accent-white size-4 mt-0.5"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <Landmark className="size-4 text-emerald-400" />
                        <span className="text-sm font-semibold text-[var(--text-primary)]">
                          Chuyển khoản VietQR (Tự động SePay)
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Khuyên dùng
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        Quét mã QR bằng bất kỳ ứng dụng ngân hàng nào. Tự động xác nhận giao dịch trong 3 giây.
                      </p>
                    </div>
                  </div>
                </label>

                {/* MoMo Option */}
                <label
                  className={`flex items-start justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                    paymentMethod === 'MOMO'
                      ? 'border-white bg-white/[0.04] shadow-sm'
                      : 'border-[var(--border-subtle)] hover:border-white/40'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'MOMO'}
                      onChange={() => setPaymentMethod('MOMO')}
                      className="accent-white size-4 mt-0.5"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <Wallet className="size-4 text-pink-400" />
                        <span className="text-sm font-semibold text-[var(--text-primary)]">
                          Ví điện tử MoMo
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
                          MoMo API
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        Thanh toán bảo mật tức thì qua ứng dụng MoMo trên điện thoại hoặc mã QR MoMo.
                      </p>
                    </div>
                  </div>
                </label>

                {/* COD Option */}
                <label
                  className={`flex items-start justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                    paymentMethod === 'COD'
                      ? 'border-white bg-white/[0.04] shadow-sm'
                      : 'border-[var(--border-subtle)] hover:border-white/40'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="accent-white size-4 mt-0.5"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <Truck className="size-4 text-zinc-300" />
                        <span className="text-sm font-semibold text-[var(--text-primary)]">
                          Thanh toán khi nhận hàng (COD)
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        Kiểm tra phụ kiện trang sức trước khi thanh toán tiền mặt cho nhân viên chuyển phát.
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Cột phải: Tóm tắt đơn hàng (5 cột) */}
          <div className="lg:col-span-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6 sm:p-8 space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--text-muted)] pb-3 border-b border-[var(--border-subtle)]">
              Đơn hàng ({cart.length})
            </h2>

            {/* Danh sách sản phẩm */}
            <div className="divide-y divide-[var(--border-subtle)] max-h-96 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={`${item.slug}-${item.size}`} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-zinc-900 border border-[var(--border-subtle)]">
                    <Image
                      src={item.image || '/placeholder.svg'}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)]">
                      {item.size ? `Size ${item.size} • ` : ''}SL: {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Tổng tính */}
            <div className="pt-4 border-t border-[var(--border-subtle)] space-y-2 text-xs">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Tạm tính</span>
                <span className="text-[var(--text-primary)] font-medium">{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Vận chuyển</span>
                <span>{shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}</span>
              </div>
              <div className="pt-4 border-t border-[var(--border-subtle)] flex justify-between text-base font-bold text-[var(--text-primary)]">
                <span className="uppercase tracking-wider">Tổng cộng</span>
                <span className="font-display text-xl text-white font-bold">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            {/* Nút đặt hàng: To, rõ ràng, 1 nút duy nhất */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-white py-4 text-xs font-bold uppercase tracking-[0.25em] text-black transition-all hover:bg-zinc-200 active:scale-[0.99] disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <span>
                  {paymentMethod === 'SEPAY'
                    ? 'QUÉT MÃ VIETQR SEPAY'
                    : paymentMethod === 'MOMO'
                    ? 'THANH TOÁN QUA MOMO'
                    : 'XÁC NHẬN ĐẶT HÀNG COD'}
                </span>
              )}
            </button>

            <div className="pt-2 text-center flex items-center justify-center gap-2 text-[11px] text-[var(--text-muted)]">
              <ShieldCheck className="size-3.5 text-emerald-400" />
              <span>Bảo mật giao dịch 256-bit SSL • Thông báo Telegram & Email tức thì</span>
            </div>
          </div>
        </div>
      </form>

      {/* ── MODAL SEPAY VIETQR ─────────────────────────────────── */}
      {activeModal === 'SEPAY' && currentOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl border border-[var(--border-strong)] bg-[#121215] p-6 sm:p-8 text-center shadow-2xl space-y-5">
            <button
              onClick={() => {
                setActiveModal(null)
                if (pollingRef.current) clearInterval(pollingRef.current)
              }}
              className="absolute top-4 right-4 p-2 text-[var(--text-muted)] hover:text-white"
            >
              <X className="size-5" />
            </button>

            {/* Header modal */}
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
                <Landmark className="size-3" /> Cổng thanh toán SePay
              </span>
              <h3 className="font-display text-2xl font-bold uppercase tracking-wider text-white">
                QUÉT MÃ VIETQR
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Mở ứng dụng ngân hàng bất kỳ để quét mã và thanh toán tự động
              </p>
            </div>

            {/* QR Code Frame */}
            <div className="mx-auto max-w-[240px] rounded-xl bg-white p-3 shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sepayQrUrl}
                alt="SePay VietQR Code"
                className="w-full h-auto aspect-square object-contain rounded"
              />
            </div>

            {/* Thông tin chuyển khoản */}
            <div className="rounded-xl border border-white/10 bg-zinc-900/80 p-4 text-left space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-muted)]">Ngân hàng:</span>
                <span className="font-bold text-white">VietinBank (ICB)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-muted)]">Số tài khoản:</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('102873892837', 'acc')}
                  className="font-mono font-bold text-white flex items-center gap-1.5 hover:text-zinc-300"
                >
                  <span>102873892837</span>
                  {isCopiedAcc ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-muted)]">Chủ tài khoản:</span>
                <span className="font-bold text-white uppercase">CONG TY CP TRANG SUC LEGEND</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-muted)]">Số tiền:</span>
                <span className="font-bold text-white text-sm">{formatPrice(currentOrder.total)}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-white/10">
                <span className="text-[var(--text-muted)]">Nội dung CK:</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(sepayDescription, 'des')}
                  className="font-mono font-bold text-emerald-400 flex items-center gap-1.5 hover:underline"
                >
                  <span>{sepayDescription}</span>
                  {isCopiedDes ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                </button>
              </div>
            </div>

            {/* Polling indicator */}
            <div className="flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
              <Loader2 className="size-3.5 animate-spin text-white" />
              <span>Hệ thống đang tự động lắng nghe giao dịch SePay...</span>
            </div>

            {/* Simulation Dev Test Button */}
            <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
              <button
                type="button"
                disabled={simulatingPayment}
                onClick={() => handleSimulatePayment('sepay')}
                className="w-full rounded-xl bg-emerald-500/20 border border-emerald-500/40 py-2.5 text-xs font-bold uppercase tracking-wider text-emerald-300 hover:bg-emerald-500/30 transition-colors flex items-center justify-center gap-2"
              >
                {simulatingPayment ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Check className="size-3.5" />
                )}
                <span>MÔ PHỎNG THANH TOÁN THÀNH CÔNG (DEV TEST)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL MOMO API ─────────────────────────────────────── */}
      {activeModal === 'MOMO' && currentOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl border border-[var(--border-strong)] bg-[#121215] p-6 sm:p-8 text-center shadow-2xl space-y-5">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 text-[var(--text-muted)] hover:text-white"
            >
              <X className="size-5" />
            </button>

            {/* Header modal */}
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-pink-500/10 text-pink-400 border border-pink-500/20 mb-2">
                <Wallet className="size-3" /> Cổng thanh toán MoMo V2
              </span>
              <h3 className="font-display text-2xl font-bold uppercase tracking-wider text-white">
                QUÉT MÃ VÍ MOMO
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Mở ứng dụng MoMo trên điện thoại để quét mã hoặc ấn nút mở app
              </p>
            </div>

            {/* QR Code MoMo Frame */}
            <div className="mx-auto max-w-[240px] rounded-xl bg-white p-3 shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={momoPayData?.qrCodeUrl || '/placeholder.svg'}
                alt="MoMo QR Code"
                className="w-full h-auto aspect-square object-contain rounded"
              />
            </div>

            {/* Thông tin đơn MoMo */}
            <div className="rounded-xl border border-white/10 bg-zinc-900/80 p-4 text-left space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-muted)]">Đơn hàng:</span>
                <span className="font-mono font-bold text-white">{currentOrder.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-muted)]">Số tiền thanh toán:</span>
                <span className="font-bold text-pink-400 text-sm">{formatPrice(currentOrder.total)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-muted)]">Tài khoản nhận:</span>
                <span className="font-bold text-white">LEGEND FINE JEWELRY</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5">
              {momoPayData?.deeplink && (
                <a
                  href={momoPayData.deeplink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 text-xs uppercase tracking-wider transition-colors shadow-lg"
                >
                  <ExternalLink className="size-3.5" />
                  <span>MỞ TRỰC TIẾP APP MOMO</span>
                </a>
              )}

              {/* Simulation Dev Test Button */}
              <button
                type="button"
                disabled={simulatingPayment}
                onClick={() => handleSimulatePayment('momo')}
                className="w-full rounded-xl bg-pink-500/20 border border-pink-500/40 py-2.5 text-xs font-bold uppercase tracking-wider text-pink-300 hover:bg-pink-500/30 transition-colors flex items-center justify-center gap-2"
              >
                {simulatingPayment ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Check className="size-3.5" />
                )}
                <span>MÔ PHỎNG QUÉT MOMO THÀNH CÔNG (DEV TEST)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
