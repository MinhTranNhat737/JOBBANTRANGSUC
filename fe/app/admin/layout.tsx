'use client'

import { useAdmin } from '@/lib/admin-store'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'
import { AdminLogin } from '@/components/admin/admin-login'
import './admin.css'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, sidebarCollapsed, adminTheme } = useAdmin()

  if (!isAuthenticated) {
    return (
      <div data-admin data-admin-theme={adminTheme || 'dark'} className={adminTheme || 'dark'}>
        <AdminLogin />
      </div>
    )
  }

  return (
    <div data-admin data-admin-theme={adminTheme || 'dark'} className={adminTheme || 'dark'}>
      <AdminSidebar />
      <main className={`admin-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <AdminHeader />
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  )
}
