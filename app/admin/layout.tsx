'use client'

import { useAdmin } from '@/lib/admin-store'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'
import { AdminLogin } from '@/components/admin/admin-login'
import './admin.css'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, sidebarCollapsed } = useAdmin()

  if (!isAuthenticated) {
    return (
      <div data-admin>
        <AdminLogin />
      </div>
    )
  }

  return (
    <div data-admin>
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
