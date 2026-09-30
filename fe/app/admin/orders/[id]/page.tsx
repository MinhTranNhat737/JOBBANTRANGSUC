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
} from 'lucide-react'
import { ORDER_STATUS_MAP, formatCompactPrice, formatDateTime } from '@/lib/admin-data'
import type { OrderStatus } from '@/lib/admin-data'
import { formatPrice } from '@/lib/products'
import { useOrderStore } from '@/lib/order-store'

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { orders, updateOrderStatus, markOrderAsPaid, syncOrders } = useOrderStore()
  const order = orders.find((o) => o.id === `#${id}` || o.id === id)

  const [statusNote, setStatusNote] = useState('')
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data?.orders && Array.isArray(data.orders)) {
          syncOrders(data.orders)
        }
      })
      .catch((err) => console.error('Failed to sync orders:', err))
  }, [syncOrders])

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
          Không tìm thấy đơn hàng #{id}
        </h1>
      </div>
    )
  }

  const status = ORDER_STATUS_MAP[order.status] || ORDER_STATUS_MAP.pending

  const handleStatusChange = (newStatus: OrderStatus) => {
    updateOrderStatus(order.id, newStatus, statusNote.trim() || undefined)
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
            {/* Hóa đơn HTML Link */}
            <a
              href={`/api/admin/invoice/preview?orderId=${encodeURIComponent(order.id)}&admin=true`}
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
              <FileText size={14} /> Xem Hóa đơn HTML <ExternalLink size={12} />
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

      {/* Admin Action Bar: Update Order Status */}
      <div className="admin-card" style={{ padding: 18, marginBottom: 20 }}>
        <h3
          style={{
            fontSize: 13,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--admin-gold)',
            marginBottom: 12,
          }}
        >
          Xử lý & Cập nhật trạng thái đơn hàng
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => handleStatusChange('confirmed')}
            disabled={order.status === 'confirmed'}
            style={{
              padding: '8px 14px',
              borderRadius: 6,
              background: order.status === 'confirmed' ? 'var(--admin-border)' : 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              color: order.status === 'confirmed' ? 'var(--admin-text-secondary)' : '#60a5fa',
              fontSize: 12,
              fontWeight: 600,
              cursor: order.status === 'confirmed' ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <CheckCircle size={14} /> Xác nhận đơn
          </button>
          <button
            type="button"
            onClick={() => handleStatusChange('shipping')}
            disabled={order.status === 'shipping'}
            style={{
              padding: '8px 14px',
              borderRadius: 6,
              background: order.status === 'shipping' ? 'var(--admin-border)' : 'rgba(139, 92, 246, 0.2)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              color: order.status === 'shipping' ? 'var(--admin-text-secondary)' : '#c084fc',
              fontSize: 12,
              fontWeight: 600,
              cursor: order.status === 'shipping' ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Truck size={14} /> Bắt đầu giao hàng
          </button>
          <button
            type="button"
            onClick={() => handleStatusChange('delivered')}
            disabled={order.status === 'delivered'}
            style={{
              padding: '8px 14px',
              borderRadius: 6,
              background: order.status === 'delivered' ? 'var(--admin-border)' : 'rgba(34, 197, 94, 0.2)',
              border: '1px solid rgba(34, 197, 94, 0.4)',
              color: order.status === 'delivered' ? 'var(--admin-text-secondary)' : '#4ade80',
              fontSize: 12,
              fontWeight: 600,
              cursor: order.status === 'delivered' ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Package size={14} /> Hoàn tất giao hàng
          </button>
          <button
            type="button"
            onClick={() => handleStatusChange('cancelled')}
            disabled={order.status === 'cancelled'}
            style={{
              padding: '8px 14px',
              borderRadius: 6,
              background: order.status === 'cancelled' ? 'var(--admin-border)' : 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: order.status === 'cancelled' ? 'var(--admin-text-secondary)' : '#f87171',
              fontSize: 12,
              fontWeight: 600,
              cursor: order.status === 'cancelled' ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <XCircle size={14} /> Hủy đơn hàng
          </button>
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
            {order.timeline.map((t, i) => (
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
              {order.items.map((item, i) => (
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
