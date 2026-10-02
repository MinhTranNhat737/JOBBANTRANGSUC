'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AuthUser = { id: number; email: string; username: string; full_name: string; role: string }
type AdminState = {
  token: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  sidebarCollapsed: boolean
  sidebarMobileOpen: boolean
  adminTheme: 'dark' | 'light'
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  toggleSidebar: () => void
  setSidebarMobileOpen: (open: boolean) => void
  toggleAdminTheme: () => void
  setAdminTheme: (theme: 'dark' | 'light') => void
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export const useAdmin = create<AdminState>()(persist((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  sidebarCollapsed: false,
  sidebarMobileOpen: false,
  adminTheme: 'dark',
  login: async (username, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await response.json()
      if (!response.ok || !data.token || data.user?.role !== 'admin') {
        return { success: false, error: data.error || 'Tài khoản không có quyền quản trị' }
      }
      set({ token: data.token, user: data.user, isAuthenticated: true })
      return { success: true }
    } catch {
      return { success: false, error: 'Không thể kết nối máy chủ' }
    }
  },
  logout: () => set({ token: null, user: null, isAuthenticated: false }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarMobileOpen: (open) => set({ sidebarMobileOpen: open }),
  toggleAdminTheme: () => set((s) => ({ adminTheme: s.adminTheme === 'dark' ? 'light' : 'dark' })),
  setAdminTheme: (adminTheme) => set({ adminTheme }),
}), {
  name: 'thuc-admin-auth',
  partialize: (s) => ({ token: s.token, user: s.user, isAuthenticated: s.isAuthenticated, adminTheme: s.adminTheme }),
}))
