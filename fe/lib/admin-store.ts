'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type AdminState = {
  isAuthenticated: boolean
  sidebarCollapsed: boolean
  sidebarMobileOpen: boolean
  login: (email: string, password: string) => boolean
  logout: () => void
  toggleSidebar: () => void
  setSidebarMobileOpen: (open: boolean) => void
}

const ADMIN_EMAIL = 'admin@legend.vn'
const ADMIN_PASSWORD = 'legend2024'

export const useAdmin = create<AdminState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      sidebarCollapsed: false,
      sidebarMobileOpen: false,
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
    }),
    {
      name: 'legend-admin',
      partialize: (state) => ({ isAuthenticated: state.isAuthenticated }),
    },
  ),
)
