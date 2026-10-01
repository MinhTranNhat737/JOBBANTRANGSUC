'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle,
  Truck,
  Package,
  XCircle,
  FileText,
  Send,
  CreditCard,
  Loader2,
  ExternalLink,
  Printer,
} from 'lucide-react'
import { ORDER_STATUS_MAP, formatCompactPrice, formatDateTime } from '@/lib/admin-data'
import type { OrderStatus, Order } from '@/lib/admin-data'
import { formatPrice, API_BASE_URL } from '@/lib/products'
import { useOrderStore } from '@/lib/order-store'

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const cleanId = decodeURIComponent(id)
  const normalized = cleanId.startsWith('#') ? cleanId : `#${cleanId}`

  const { orders, updateOrderStatus, markOrderAsPaid, syncOrders } = useOrderStore()
  const initialOrder = orders.find(
    (o) => o.id === normalized || o.id.replace('#', '') === cleanId.replace('#', '')
  )

  const [directOrder, setDirectOrder] = useState<Order | undefined>(initialOrder)
  const [loading, setLoading] = useState(!initialOrder)
  const [statusNote, setStatusNote] = useState('')
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [isResending, setIsResending] = useState(false)
  const [isDispatching, setIsDispatching] = useState(false)

  const order = directOrder || orders.find(
    (o) => o.id === normalized || o.id.replace('#', '') === cleanId.replace('#', '')
  )

  useEffect(() => {
    fetch(`/api/orders/${encodeURIComponent(cleanId)}`)
      .then((res) => {
        if (res.ok) return res.json()
        return fetch(`/api/orders?id=${encodeURIComponent(cleanId)}`).then((r) => r.json())
      })
      .then((data) => {
        if (data?.order) {
          setDirectOrder(data.order)
          syncOrders([data.order, ...useOrderStore.getState().orders.filter((o) => o.id !== data.order.id)])
        }
      })
      .catch((err) => console.error('Failed to sync order detail:', err))
      .finally(() => setLoading(false))
  }, [cleanId, syncOrders])

  const handleDispatchOrder = async () => {
    if (!order) return
    setIsDispatching(true)
    try {
      const res = await fetch('/api/inventory/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          items: order.items,
          note: `Xuất kho giao cho đơn hàng ${order.id}`,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        updateOrderStatus(
          order.id,
          'shipping',
          'Đã xuất kho thành công. Sản phẩm đã trừ tồn kho và bắt đầu chuyển giao cho bưu tá vận chuyển.'
        )

        let outOfStockMsg = ''
        if (data.dispatchedProducts && Array.isArray(data.dispatchedProducts)) {
          const outList = data.dispatchedProducts.filter((p: any) => p.isOutOfStock)
          if (outList.length > 0) {
            outOfStockMsg = ` (Lưu ý: ${outList.map((p: any) => p.name).join(', ')} đã hết hàng trên web)`
          }
        }

        setSuccessMsg(`✓ Đã xuất kho thành công & chuyển đơn sang "Đang giao"!${outOfStockMsg}`)
      } else {
        setSuccessMsg(`Lỗi khi xuất kho: ${data.error || 'Vui lòng thử lại'}`)
      }
    } catch (err: any) {
      setSuccessMsg(`Lỗi kết nối khi xuất kho: ${err.message}`)
    } finally {
      setIsDispatching(false)
      setTimeout(() => setSuccessMsg(null), 5000)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 12 }}>
        <Loader2 className="animate-spin text-amber-400" size={32} />
        <p style={{ color: 'var(--admin-text-secondary)', fontSize: 13, letterSpacing: '0.05em' }}>
          Đang tải thông tin đơn hàng {normalized}...
        </p>
      </div>
    )
  }

  if (!order) {
    return (
      <div>
        <Link
          href="/admin/orders"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            color: 'var(--admin-text-secondary)',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} /> Quay lại danh sách đơn hàng
        </Link>
        <h1
          style={{
            fontFamily: 'var(--font-cinzel)',
            fontSize: 26,
            fontWeight: 700,
            color: 'var(--admin-text)',
            marginTop: 16,
          }}
        >
          Không tìm thấy đơn hàng {normalized}
        </h1>
        <p style={{ color: 'var(--admin-text-secondary)', marginTop: 8, fontSize: 14 }}>
          Đơn hàng không tồn tại trên hệ thống hoặc đã bị xóa.
        </p>
      </div>
    )
  }

  const status = (ORDER_STATUS_MAP as any)[order.status] || ORDER_STATUS_MAP.pending

  const handleStatusChange = (newStatus: OrderStatus) => {
    updateOrderStatus(order.id, newStatus, statusNote.trim() || undefined)
    // Sync lên Backend Heroku
    try {
      const code = order.id.startsWith('#') ? order.id : `#${order.id}`
      fetch(`${API_BASE_URL}/orders/${encodeURIComponent(code)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      }).catch(e => console.warn('Backend sync:', e))
    } catch(e) {}
    setStatusNote('')
    setSuccessMsg(`Đã cập nhật đơn hàng ${order.id} sang trạng thái "${ORDER_STATUS_MAP[newStatus]?.label}"`)
    setTimeout(() => setSuccessMsg(null), 3000)
  }

  // Resend Telegram and Email notifications
  const handleResendNotifications = async () => {
    setIsResending(true)
    try {
      const res = await fetch('/api/orders/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order,
          paymentNote: order.paymentMethod,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccessMsg('Đã bắn thông báo Telegram Bot & gửi lại Email hóa đơn thành công!')
      } else {
        setSuccessMsg('Có phản hồi từ hệ thống thông báo.')
      }
    } catch (e: any) {
      setSuccessMsg('Lỗi kết nối khi gửi thông báo.')
    } finally {
      setIsResending(false)
      setTimeout(() => setSuccessMsg(null), 3500)
    }
  }

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <Link
          href="/admin/orders"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            color: 'var(--admin-text-secondary)',
            textDecoration: 'none',
            marginBottom: 12,
          }}
        >
          <ArrowLeft size={16} /> Quay lại danh sách đơn
        </Link>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-cinzel)',
                fontSize: 26,
                fontWeight: 700,
                color: 'var(--admin-text)',
                letterSpacing: '0.04em',
              }}
            >
              Đơn hàng {order.id}
            </h1>
            <p style={{ fontSize: 12, color: 'var(--admin-text-secondary)', marginTop: 4 }}>
              Đặt lúc: {formatDateTime(order.createdAt)} • Hình thức: {order.paymentMethod || 'COD'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Hóa đơn PDF Link */}
            <a
              href={`/invoice?id=${encodeURIComponent(order.id)}&print=1`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: 8,
                background: 'rgba(217, 119, 6, 0.15)',
                border: '1px solid rgba(217, 119, 6, 0.4)',
                color: 'var(--admin-gold)',
                fontSize: 12,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <Printer size={14} /> Xuất / In Hóa đơn PDF <ExternalLink size={12} />
            </a>

            {/* Bắn lại Telegram / Email */}
            <button
              type="button"
              onClick={handleResendNotifications}
              disabled={isResending}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: 8,
                background: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                color: '#60a5fa',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {isResending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              <span>Gửi Telegram & Email</span>
            </button>

            <span
              className="status-badge"
              style={{
                background: status.bg,
                color: status.color,
                fontSize: 14,
                padding: '6px 14px',
              }}
            >
              <span className="status-dot" style={{ background: status.color }} />
              {status.label}
            </span>
          </div>
        </div>
      </div>

      {successMsg && (
        <div
          style={{
            padding: '12px 16px',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: 8,
            color: '#4ade80',
            fontSize: 13,
            marginBottom: 20,
          }}
        >
          ✓ {successMsg}
        </div>
      )}

      {/* Admin Action Bar: Quy trình xử lý đơn hàng & Kho hàng */}
      <div className="admin-card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
          <h3
            style={{
              fontSize: 13,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--admin-gold)',
              margin: 0,
            }}
          >
            Quy trình Xử lý Đơn hàng &amp; Xuất kho
          </h3>
          <span style={{ fontSize: 12, color: 'var(--admin-text-secondary)' }}>
            Tiến trình: <strong style={{ color: status.color }}>{status.label}</strong>
          </span>
        </div>

        {/* Workflow Action Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          {/* BƯỚC 1: XÁC NHẬN ĐƠN (Nếu đang chờ xử lý) */}
          {order.status === 'pending' && (
            <button
              type="button"
              onClick={() => handleStatusChange('confirmed')}
              style={{
                padding: '10px 18px',
                borderRadius: 8,
                background: 'rgba(59, 130, 246, 0.25)',
                border: '1px solid #3b82f6',
                color: '#60a5fa',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
              }}
            >
              <CheckCircle size={16} /> 1. Xác nhận đơn hàng
            </button>
          )}

          {/* BƯỚC 2: XUẤT KHO (Khi đơn đã xác nhận hoặc cần xuất kho) */}
          {(order.status === 'confirmed' || order.status === 'pending') && (
            <button
              type="button"
              onClick={handleDispatchOrder}
              disabled={isDispatching}
              style={{
                padding: '10px 18px',
                borderRadius: 8,
                background: order.status === 'confirmed' ? 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' : 'rgba(139, 92, 246, 0.2)',
                border: order.status === 'confirmed' ? '1px solid #a78bfa' : '1px solid rgba(139, 92, 246, 0.4)',
                color: '#ffffff',
                fontSize: 13,
                fontWeight: 700,
                cursor: isDispatching ? 'wait' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: order.status === 'confirmed' ? '0 4px 16px rgba(124, 58, 237, 0.4)' : 'none',
              }}
            >
              {isDispatching ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Package size={16} />
              )}
              <span>2. 📦 Bấm Xuất kho (Trừ tồn kho &amp; Chuyển sang Đang giao)</span>
            </button>
          )}

          {/* BƯỚC 3: ĐÃ GIAO HÀNG (Admin tự check với bưu tá / khách rồi bấm hoàn tất) */}
          {order.status === 'shipping' && (
            <button
              type="button"
              onClick={() => handleStatusChange('delivered')}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                border: '1px solid #4ade80',
                color: '#ffffff',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 16px rgba(22, 163, 74, 0.35)',
              }}
            >
              <CheckCircle size={16} /> 3. ✓ Admin check: Xác nhận ĐÃ GIAO HÀNG
            </button>
          )}

          {order.status === 'delivered' && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 8,
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.4)',
                color: '#4ade80',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <CheckCircle size={15} /> Đơn hàng đã hoàn tất giao hàng thành công
            </div>
          )}

          {/* Các nút phụ */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <Link
              href="/admin/inventory"
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--admin-border)',
                color: 'var(--admin-text-secondary)',
                fontSize: 12,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              Xem Kho hàng ↗
            </Link>

            {order.status !== 'cancelled' && order.status !== 'delivered' && (
              <button
                type="button"
                onClick={() => handleStatusChange('cancelled')}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <XCircle size={13} /> Hủy đơn
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="form-grid">
        {/* Customer Info */}
        <div className="form-section">
          <h3>Thông tin khách hàng & Giao nhận</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 16 }}>👤</span>
              <span style={{ color: 'var(--admin-text)', fontWeight: 600, fontSize: 15 }}>
                {order.customerName}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 16 }}>📧</span>
              <span style={{ color: 'var(--admin-text-secondary)', fontSize: 14 }}>
                {order.customerEmail}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 16 }}>📱</span>
              <span style={{ color: 'var(--admin-text)', fontSize: 14, fontWeight: 500 }}>
                {order.customerPhone}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 16 }}>📍</span>
              <span style={{ color: 'var(--admin-text)', fontSize: 14 }}>
                {order.customerAddress}
              </span>
            </div>
            {order.notes && (
              <div
                style={{
                  marginTop: 8,
                  padding: 10,
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 6,
                  border: '1px solid var(--admin-border)',
                  fontSize: 13,
                  color: 'var(--admin-text-secondary)',
                }}
              >
                <strong>Ghi chú từ khách:</strong> &ldquo;{order.notes}&rdquo;
              </div>
            )}
          </div>

          {/* Payment Details Section */}
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--admin-border)' }}>
            <h4
              style={{
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--admin-gold)',
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <CreditCard size={14} /> Chi tiết thanh toán
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--admin-text-secondary)' }}>Cổng thanh toán:</span>
                <span style={{ fontWeight: 600, color: 'var(--admin-text)' }}>
                  {order.paymentMethod || 'Chuyển khoản SePay'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--admin-text-secondary)' }}>Trạng thái thanh toán:</span>
                <span
                  style={{
                    fontWeight: 600,
                    color:
                      order.paymentStatus === 'paid' || order.status === 'confirmed'
                        ? '#4ade80'
                        : '#e4e4e7',
                  }}
                >
                  {order.paymentStatus === 'paid' || order.status === 'confirmed'
                    ? '✓ Đã thanh toán thành công'
                    : '⏳ Chờ thanh toán'}
                </span>
              </div>
              {order.transactionId && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--admin-text-secondary)' }}>Mã GD:</span>
                  <span style={{ fontFamily: 'monospace', color: 'var(--admin-gold)' }}>
                    {order.transactionId}
                  </span>
                </div>
              )}
              {order.paidAt && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--admin-text-secondary)' }}>Thời gian TT:</span>
                  <span>{formatDateTime(order.paidAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="form-section">
          <h3>Lịch sử & Hành trình đơn hàng</h3>
          <div className="order-timeline">
            {(order.timeline || []).map((t: any, i: number) => (
              <div className="timeline-item" key={i}>
                <div className="timeline-date">{formatDateTime(t.date)}</div>
                <div
                  className="timeline-status"
                  style={{ fontWeight: 600, color: i === 0 ? 'var(--admin-gold)' : 'var(--admin-text)' }}
                >
                  {t.status}
                </div>
                {t.note && <div className="timeline-note">{t.note}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="admin-card" style={{ marginTop: 20 }}>
        <div className="admin-card-header">
          <h3>Sản phẩm trong đơn ({order.items.length})</h3>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 90 }}>Ảnh</th>
                <th>Sản phẩm</th>
                <th>Size</th>
                <th>SL</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item: any, i: number) => (
                <tr key={i}>
                  <td>
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: 12,
                        background: 'var(--admin-surface-elevated)',
                        overflow: 'hidden',
                        border: '1px solid var(--admin-border)',
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  </td>
                  <td style={{ fontWeight: 500, color: 'var(--admin-text)' }}>{item.name}</td>
                  <td>{item.size || '—'}</td>
                  <td>×{item.quantity}</td>
                  <td>{formatPrice(item.price)}</td>
                  <td style={{ fontWeight: 500, color: 'var(--admin-text)' }}>
                    {formatPrice(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--admin-border)', textAlign: 'right' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
            <div style={{ fontSize: 14, color: 'var(--admin-text-secondary)' }}>
              Tạm tính:{' '}
              <span style={{ fontWeight: 500, color: 'var(--admin-text)', marginLeft: 8 }}>
                {formatPrice(order.total - order.shippingFee)}
              </span>
            </div>
            <div style={{ fontSize: 14, color: 'var(--admin-text-secondary)' }}>
              Phí ship:{' '}
              <span style={{ fontWeight: 500, color: 'var(--admin-text)', marginLeft: 8 }}>
                {order.shippingFee === 0 ? 'Miễn phí' : formatPrice(order.shippingFee)}
              </span>
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--admin-gold)',
                fontFamily: 'var(--font-cinzel)',
                marginTop: 4,
              }}
            >
              Tổng cộng: {formatPrice(order.total)}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
