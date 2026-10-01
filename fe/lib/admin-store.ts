'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type AdminState = {
  isAuthenticated: boolean
  sidebarCollapsed: boolean
  sidebarMobileOpen: boolean
  adminTheme: 'dark' | 'light'
  login: (email: string, password: string) => boolean
  logout: () => void
  toggleSidebar: () => void
  setSidebarMobileOpen: (open: boolean) => void
  toggleAdminTheme: () => void
  setAdminTheme: (theme: 'dark' | 'light') => void
}

const ADMIN_EMAIL = 'admin@legend.vn'
const ADMIN_PASSWORD = 'legend2024'

export const useAdmin = create<AdminState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      sidebarCollapsed: false,
      sidebarMobileOpen: false,
      adminTheme: 'dark',
      login: (email, password) => {
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
          set({ isAuthenticated: true })
          return true
        }
        return false
      },
      logout: () => set({ isAuthenticated: false }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarMobileOpen: (open) => set({ sidebarMobileOpen: open }),
      toggleAdminTheme: () =>
        set((s) => ({ adminTheme: s.adminTheme === 'dark' ? 'light' : 'dark' })),
      setAdminTheme: (theme) => set({ adminTheme: theme }),
    }),
    {
      name: 'legend-admin',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        adminTheme: state.adminTheme,
      }),
    },
  ),
)
