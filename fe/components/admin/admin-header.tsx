'use client'

import { useAdmin } from '@/lib/admin-store'
import { Search, Bell, Menu, Sun, Moon } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { useOrderNotifications } from '@/lib/use-order-notifications'

export function AdminHeader() {
  const { setSidebarMobileOpen, adminTheme, toggleAdminTheme } = useAdmin()
  const { orders, pendingCount, refresh } = useOrderNotifications()
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const toggleNotifications = () => {
    const next = !notificationsOpen
    setNotificationsOpen(next)
    if (next) {
      void refresh()
      if ('Notification' in window && Notification.permission === 'default') void Notification.requestPermission()
    }
  }

  return (
    <header className="admin-header">
      <button className="hamburger-btn" onClick={() => setSidebarMobileOpen(true)}>
        <Menu size={20} />
      </button>

      <div className="header-search">
        <Search className="search-icon" />
        <input type="text" placeholder="Tìm kiếm sản phẩm, đơn hàng..." />
      </div>

      <div className="header-actions">
        {/* Nút chuyển đổi Giao diện Sáng / Tối */}
        <button
          type="button"
          className="header-btn"
          onClick={toggleAdminTheme}
          title={adminTheme === 'light' ? 'Chuyển sang Giao diện Tối' : 'Chuyển sang Giao diện Sáng'}
          aria-label="Chuyển đổi giao diện sáng tối"
        >
          {adminTheme === 'light' ? (
            <Moon size={18} />
          ) : (
            <Sun size={18} style={{ color: '#fbbf24' }} />
          )}
        </button>

        <div style={{ position: 'relative' }}>
          <button className="header-btn" title="Thông báo đơn hàng" onClick={toggleNotifications} aria-expanded={notificationsOpen}>
            <Bell size={18} />
            {pendingCount > 0 && <span className="nav-badge" style={{ position: 'absolute', right: -5, top: -6 }}>{pendingCount}</span>}
          </button>
          {notificationsOpen && <div className="admin-card" style={{ position: 'absolute', right: 0, top: 46, zIndex: 80, width: 340, padding: 0, boxShadow: '0 18px 50px rgba(0,0,0,.45)' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--admin-border)', fontWeight: 700 }}>Thông báo đơn hàng</div>
            {orders.length === 0 ? <div style={{ padding: 24, textAlign: 'center', color: 'var(--admin-text-secondary)', fontSize: 13 }}>Chưa có đơn hàng mới.</div> : orders.slice(0, 5).map((order) => <Link key={order.id} href={`/admin/orders/${encodeURIComponent(order.id.replace('#', ''))}`} onClick={() => setNotificationsOpen(false)} style={{ display: 'block', padding: '12px 16px', borderBottom: '1px solid var(--admin-border)', textDecoration: 'none', color: 'var(--admin-text)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><strong>{order.id}</strong><span style={{ color: 'var(--admin-gold)', fontSize: 12 }}>{Number(order.total || 0).toLocaleString('vi-VN')}₫</span></div>
              <div style={{ marginTop: 4, fontSize: 12, color: 'var(--admin-text-secondary)' }}>{order.customerName || 'Khách hàng'} · {order.status === 'pending' ? 'Chờ xử lý' : order.status}</div>
            </Link>)}
            <Link href="/admin/orders" onClick={() => setNotificationsOpen(false)} style={{ display: 'block', padding: 12, textAlign: 'center', color: 'var(--admin-gold)', fontSize: 12, textDecoration: 'none' }}>Xem tất cả đơn hàng</Link>
          </div>}
        </div>
        <div className="header-avatar" title="Tài khoản Quản trị">A</div>
      </div>
    </header>
  )
}
