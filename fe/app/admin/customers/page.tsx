'use client'

import { MOCK_CUSTOMERS, formatCompactPrice, formatDate } from '@/lib/admin-data'
import { Search } from 'lucide-react'
import { useState, useMemo } from 'react'

export default function CustomersPage() {
  const [search, setSearch] = useState('')

  const sorted = useMemo(() => {
    const list = [...MOCK_CUSTOMERS].sort((a, b) => b.totalSpent - a.totalSpent)
    if (!search) return list
    return list.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

  const top3 = MOCK_CUSTOMERS.sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 3)
  const rankStyles = ['gold', 'silver', 'bronze'] as const
  const rankEmojis = ['🥇', '🥈', '🥉']

  return (
    <>
      <div className="admin-page-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>Khách hàng</h1>
          <p>{MOCK_CUSTOMERS.length} khách hàng đã đăng ký</p>
        </div>
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)', width: 16, height: 16 }} />
          <input
            className="admin-input"
            style={{ paddingLeft: 40, borderRadius: 999, height: 38, width: 260 }}
            placeholder="Tìm kiếm khách hàng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Top VIP */}
      {!search && (
        <div className="vip-cards" style={{ marginBottom: 24 }}>
          {top3.map((c, i) => (
            <div key={c.id} className={`vip-card ${rankStyles[i]}`}>
              <div className="vip-rank">{rankEmojis[i]}</div>
              <div className="vip-name">{c.name}</div>
              <div className="vip-spent">{formatCompactPrice(c.totalSpent)}</div>
              <div style={{ fontSize: 12, color: 'var(--admin-text-muted)', marginTop: 4 }}>
                {c.totalOrders} đơn hàng
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tên</th>
                <th>Email</th>
                <th>Điện thoại</th>
                <th>Đơn hàng</th>
                <th>Tổng chi tiêu</th>
                <th>Tham gia</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((c, i) => (
                <tr key={c.id}>
                  <td>{i + 1}</td>
                  <td style={{ fontWeight: 500, color: 'var(--admin-text)' }}>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td style={{ textAlign: 'center' }}>{c.totalOrders}</td>
                  <td style={{ fontWeight: 500, color: 'var(--admin-gold)' }}>{formatCompactPrice(c.totalSpent)}</td>
                  <td>{formatDate(c.joinedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="admin-pagination">
          <span className="pagination-info">{sorted.length} khách hàng</span>
        </div>
      </div>
    </>
  )
}
