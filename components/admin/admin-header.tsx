'use client'

import { useAdmin } from '@/lib/admin-store'
import { Search, Bell, Menu } from 'lucide-react'

export function AdminHeader() {
  const { setSidebarMobileOpen } = useAdmin()

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
        <button className="header-btn">
          <Bell size={18} />
          <span className="notif-dot" />
        </button>
        <div className="header-avatar">A</div>
      </div>
    </header>
  )
}
