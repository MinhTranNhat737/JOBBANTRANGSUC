'use client'

import { useAdmin } from '@/lib/admin-store'
import { Search, Bell, Menu, Sun, Moon } from 'lucide-react'

export function AdminHeader() {
  const { setSidebarMobileOpen, adminTheme, toggleAdminTheme } = useAdmin()

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

        <button className="header-btn" title="Thông báo">
          <Bell size={18} />
          <span className="notif-dot" />
        </button>
        <div className="header-avatar" title="Tài khoản Quản trị">A</div>
      </div>
    </header>
  )
}
