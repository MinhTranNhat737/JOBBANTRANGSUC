'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { ORDER_STATUS_MAP, formatCompactPrice, formatDateTime } from '@/lib/admin-data'
import type { OrderStatus } from '@/lib/admin-data'
import { useOrderStore } from '@/lib/order-store'

const TABS: { key: OrderStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ xử lý' },
  { key: 'confirmed', label: 'Đã xác nhận' },
  { key: 'shipping', label: 'Đang giao' },
  { key: 'delivered', label: 'Đã giao' },
  { key: 'cancelled', label: 'Đã hủy' },
]

export default function OrdersPage() {
  const { orders, syncOrders } = useOrderStore()
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('all')

  useEffect(() => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data?.orders && Array.isArray(data.orders)) {
          syncOrders(data.orders)
        }
      })
      .catch((err) => console.error('Failed to sync server orders:', err))
  }, [syncOrders])

  const filtered = useMemo(() => {
    if (activeTab === 'all') return orders
    return orders.filter(o => o.status === activeTab)
  }, [orders, activeTab])

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length }
    for (const o of orders) {
      counts[o.status] = (counts[o.status] || 0) + 1
    }
    return counts
  }, [orders])

  return (
    <>
      <div className="admin-page-heading">
        <h1>Đơn hàng</h1>
        <p>Quản lý {orders.length} đơn hàng từ khách hàng & khách vãng lai</p>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`admin-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            {tabCounts[tab.key] !== undefined && (
              <span className="tab-count">{tabCounts[tab.key] || 0}</span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã ĐH</th>
                <th>Khách hàng</th>
                <th>Điện thoại / Địa chỉ</th>
                <th>Sản phẩm</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Ngày đặt</th>
                <th style={{ textAlign: 'right' }}>Hóa đơn</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => {
                const status = ORDER_STATUS_MAP[order.status] || ORDER_STATUS_MAP.pending
                return (
                  <tr key={order.id}>
                    <td>
                      <Link href={`/admin/orders/${order.id.replace('#', '')}`} style={{ fontWeight: 600, color: '#ffffff', textDecoration: 'none' }}>
                        {order.id}
                      </Link>
                    </td>
                    <td style={{ color: 'var(--admin-text)', fontWeight: 500 }}>
                      <div>{order.customerName}</div>
                      <div style={{ fontSize: 11, color: 'var(--admin-text-secondary)' }}>{order.customerEmail}</div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--admin-text-secondary)', maxWidth: 220 }}>
                      <div style={{ fontWeight: 500, color: 'var(--admin-text)' }}>{order.customerPhone}</div>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.customerAddress}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {order.items.slice(0, 2).map((item, idx) => (
                            <div key={idx} style={{ width: 36, height: 36, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--admin-border)', background: '#18181b' }}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          ))}
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--admin-text-secondary)' }}>{order.items.length} món</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: '#ffffff' }}>{formatCompactPrice(order.total)}</td>
                    <td>
                      <span className="status-badge" style={{ background: status.bg, color: status.color }}>
                        <span className="status-dot" style={{ background: status.color }} />
                        {status.label}
                      </span>
                    </td>
                    <td style={{ fontSize: 12 }}>{formatDateTime(order.createdAt)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <a
                        href={`/invoice?id=${encodeURIComponent(order.id)}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: 11,
                          padding: '4px 10px',
                          borderRadius: 6,
                          border: '1px solid var(--admin-border)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: '#ffffff',
                          textDecoration: 'none',
                          fontWeight: 500,
                        }}
                      >
                        Xem HĐ ↗
                      </a>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="admin-pagination">
          <span className="pagination-info">Hiển thị {filtered.length} đơn hàng</span>
        </div>
      </div>
    </>
  )
}
