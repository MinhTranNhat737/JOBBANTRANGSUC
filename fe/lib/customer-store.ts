'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export type CustomerUser = {
  id: string
  name: string
  email: string
  phone: string
  address: string
  role?: string
  joinedAt: string
}

type CustomerState = {
  customer: CustomerUser | null
  token: string | null
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: {
    name: string
    email: string
    phone: string
    address: string
    password: string
  }) => Promise<{ success: boolean; error?: string }>
  updateProfile: (data: Partial<Pick<CustomerUser, 'name' | 'phone' | 'address'>>) => Promise<void>
  refreshProfile: () => Promise<void>
  logout: () => void
}

export const useCustomer = create<CustomerState>()(
  persist(
    (set, get) => ({
      customer: null,
      token: null,

      login: async (identifier: string, password: string) => {
        try {
          const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: identifier.trim(),
              password,
            }),
          })

          const data = await res.json()
          if (!res.ok) {
            return {
              success: false,
              error: data.error || 'Email, số điện thoại hoặc mật khẩu không chính xác.',
            }
          }

          const u = data.user
          const loggedUser: CustomerUser = {
            id: String(u.id),
            name: u.full_name || u.name || u.username || 'Khách hàng',
            email: u.email || '',
            phone: u.phone || '',
            address: u.address || '',
            role: u.role || 'customer',
            joinedAt: u.created_at || new Date().toISOString(),
          }

          set({ customer: loggedUser, token: data.token || null })
          return { success: true }
        } catch (err: any) {
          console.error('Login error:', err)
          return {
            success: false,
            error: 'Không thể kết nối máy chủ. Vui lòng kiểm tra lại kết nối.',
          }
        }
      },

      register: async (data) => {
        try {
          const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: data.email.split('@')[0] || `user_${Date.now()}`,
              email: data.email.trim(),
              password: data.password,
              full_name: data.name.trim(),
              phone: data.phone.trim(),
              address: data.address.trim(),
              role: 'customer',
            }),
          })

          const result = await res.json()
          if (!res.ok) {
            return {
              success: false,
              error: result.error || 'Đăng ký không thành công. Vui lòng thử lại.',
            }
          }

          const u = result.user
          const newUser: CustomerUser = {
            id: String(u.id),
            name: u.full_name || data.name.trim(),
            email: u.email || data.email.trim(),
            phone: u.phone || data.phone.trim(),
            address: u.address || data.address.trim(),
            role: u.role || 'customer',
            joinedAt: u.created_at || new Date().toISOString(),
          }

          set({ customer: newUser, token: result.token || null })
          return { success: true }
        } catch (err: any) {
          console.error('Register error:', err)
          return {
            success: false,
            error: 'Không thể kết nối máy chủ. Vui lòng kiểm tra lại backend.',
          }
        }
      },

      refreshProfile: async () => {
        const token = get().token
        const current = get().customer
        if (!token && !current) return

        try {
          const res = await fetch(`${API_URL}/auth/me`, {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          })
          if (res.ok) {
            const data = await res.json()
            if (data && data.id) {
              set({
                customer: {
                  id: String(data.id),
                  name: data.full_name || data.name || current?.name || 'Khách hàng',
                  email: data.email || current?.email || '',
                  phone: data.phone || current?.phone || '',
                  address: data.address || current?.address || '',
                  role: data.role || current?.role || 'customer',
                  joinedAt: data.created_at || current?.joinedAt || new Date().toISOString(),
                },
              })
            }
          }
        } catch (e) {
          console.warn('refreshProfile error:', e)
        }
      },

      updateProfile: async (data) => {
        const current = get().customer
        if (!current) return

        const updated: CustomerUser = {
          ...current,
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.phone !== undefined ? { phone: data.phone } : {}),
          ...(data.address !== undefined ? { address: data.address } : {}),
        }
        set({ customer: updated })

        // Đồng bộ lên backend qua endpoint /api/auth/profile
        try {
          const token = get().token
          const res = await fetch(`${API_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              userId: current.id,
              email: current.email,
              name: data.name !== undefined ? data.name : current.name,
              phone: data.phone !== undefined ? data.phone : current.phone,
              address: data.address !== undefined ? data.address : current.address,
            }),
          })
          if (res.ok) {
            const result = await res.json()
            if (result?.user) {
              set({
                customer: {
                  ...updated,
                  name: result.user.name || updated.name,
                  phone: result.user.phone || updated.phone,
                  address: result.user.address || updated.address,
                },
              })
            }
          }
        } catch (e) {
          console.warn('Update customer profile backend sync warning:', e)
        }
      },

      logout: () => set({ customer: null, token: null }),
    }),
    {
      name: 'thuc-luxury-customer-auth',
      partialize: (state) => ({
        customer: state.customer,
        token: state.token,
      }),
    },
  ),
)
