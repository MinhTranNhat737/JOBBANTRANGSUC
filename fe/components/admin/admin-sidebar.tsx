'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAdmin } from '@/lib/admin-store'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  ExternalLink,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Sản phẩm', icon: Package },
  { href: '/admin/orders', label: 'Đơn hàng', icon: ShoppingCart, badge: 2 },
  { href: '/admin/customers', label: 'Khách hàng', icon: Users },
  { href: '/admin/analytics', label: 'Phân tích', icon: BarChart3 },
  { href: '/admin/settings', label: 'Cài đặt', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, sidebarMobileOpen, toggleSidebar, setSidebarMobileOpen, logout } = useAdmin()

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  const sidebarClass = [
    'admin-sidebar',
    sidebarCollapsed ? 'collapsed' : '',
    sidebarMobileOpen ? 'mobile-open' : '',
  ].filter(Boolean).join(' ')

  return (
    <>
      <aside className={sidebarClass}>
        {/* Logo */}
        <div className="sidebar-logo">
          <h1 style={{ fontSize: 16 }}>THUC LUXURY</h1>
          <span>Admin</span>
        </div>


        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Menu</div>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-nav-item ${isActive(item.href, item.exact) ? 'active' : ''}`}
              onClick={() => setSidebarMobileOpen(false)}
            >
              <item.icon className="nav-icon" />
              <span>{item.label}</span>
              {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <a href="/" target="_blank" rel="noopener noreferrer" className="sidebar-store-link">
            <ExternalLink size={16} />
            <span>Xem cửa hàng</span>
          </a>
          <div className="sidebar-user">
            <div className="user-avatar">A</div>
            <div className="user-info">
              <div className="user-name">Admin</div>
              <div className="user-email">admin@legend.vn</div>
            </div>
          </div>
          <button className="sidebar-logout-btn" onClick={logout}>
            <LogOut size={16} />
            <span>Đăng xuất</span>
          </button>

          {/* Collapse toggle — only show on desktop */}
          <button
            className="sidebar-nav-item"
            onClick={toggleSidebar}
            style={{ marginTop: 4 }}
          >
            {sidebarCollapsed ? <ChevronRight className="nav-icon" /> : <ChevronLeft className="nav-icon" />}
            <span>{sidebarCollapsed ? 'Mở rộng' : 'Thu gọn'}</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarMobileOpen && (
        <div className="sidebar-overlay" style={{ display: 'block' }} onClick={() => setSidebarMobileOpen(false)} />
      )}
    </>
  )
}
