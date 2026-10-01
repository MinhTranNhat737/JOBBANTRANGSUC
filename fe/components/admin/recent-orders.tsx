'use client'

import Link from 'next/link'
import { ORDER_STATUS_MAP, formatCompactPrice, formatDateTime } from '@/lib/admin-data'
import { useOrderStore } from '@/lib/order-store'

export function RecentOrders() {
  const { orders } = useOrderStore()
  const recent = orders.slice(0, 6)

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3>Đơn hàng gần đây ({orders.length})</h3>
        <Link href="/admin/orders">Xem tất cả →</Link>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã ĐH</th>
              <th>Khách hàng</th>
              <th>Sản phẩm</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Ngày</th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    textAlign: 'center',
                    padding: '36px 0',
                    color: 'var(--admin-text-secondary)',
                    fontSize: 13,
                  }}
                >
                  Chưa có đơn hàng nào trong hệ thống.
                </td>
              </tr>
            ) : (
              recent.map((order) => {
                const status = ORDER_STATUS_MAP[order.status] || ORDER_STATUS_MAP.pending
                return (
                  <tr key={order.id}>
                    <td>
                      <Link
                        href={`/admin/orders/${order.id.replace('#', '')}`}
                        style={{ fontWeight: 600, color: 'var(--admin-gold)', textDecoration: 'none' }}
                      >
                        {order.id}
                      </Link>
                    </td>
                    <td style={{ color: 'var(--admin-text)', fontWeight: 500 }}>{order.customerName}</td>
                    <td>{order.items.length} sản phẩm</td>
                    <td style={{ fontWeight: 600, color: 'var(--admin-gold)' }}>
                      {formatCompactPrice(order.total)}
                    </td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ background: status.bg, color: status.color }}
                      >
                        <span className="status-dot" style={{ background: status.color }} />
                        {status.label}
                      </span>
                    </td>
                    <td style={{ fontSize: 12 }}>{formatDateTime(order.createdAt)}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
