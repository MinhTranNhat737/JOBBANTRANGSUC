'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CustomerUser = {
  id: string
  name: string
  email: string
  phone: string
  address: string
  joinedAt: string
}

type CustomerState = {
  customer: CustomerUser | null
  registeredUsers: { user: CustomerUser; passwordHash: string }[]
  login: (identifier: string, password: string) => { success: boolean; error?: string }
  register: (data: { name: string; email: string; phone: string; address: string; password: string }) => { success: boolean; error?: string }
  updateProfile: (data: Partial<Pick<CustomerUser, 'name' | 'phone' | 'address'>>) => void
  logout: () => void
}

const DEFAULT_DEMO_USER: CustomerUser = {
  id: 'cust-demo-1',
  name: 'Nguyễn Minh Tuấn',
  email: 'khachhang@legend.vn',
  phone: '0901 234 567',
  address: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
  joinedAt: '2026-01-15T08:30:00Z',
}

const DEFAULT_USERS = [
  {
    user: DEFAULT_DEMO_USER,
    passwordHash: '123456',
  },
  {
    user: {
      id: 'cust-demo-2',
      name: 'Trần Thu Hà',
      email: 'thuha@email.com',
      phone: '0912 345 678',
      address: '45 Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
      joinedAt: '2026-02-10T14:20:00Z',
    },
    passwordHash: '123456',
  },
]

export const useCustomer = create<CustomerState>()(
  persist(
    (set, get) => ({
      customer: null,
      registeredUsers: DEFAULT_USERS,
      login: (identifier, password) => {
        const users = get().registeredUsers
        const normalized = identifier.trim().toLowerCase()
        const found = users.find(
          (u) =>
            (u.user.email.toLowerCase() === normalized || u.user.phone.replace(/\s+/g, '') === normalized.replace(/\s+/g, '')) &&
            u.passwordHash === password,
        )

        if (found) {
          set({ customer: found.user })
          return { success: true }
        }
        return { success: false, error: 'Email/Số điện thoại hoặc mật khẩu không chính xác.' }
      },
      register: (data) => {
        const users = get().registeredUsers
        const emailNorm = data.email.trim().toLowerCase()
        const phoneNorm = data.phone.trim().replace(/\s+/g, '')

        if (users.some((u) => u.user.email.toLowerCase() === emailNorm)) {
          return { success: false, error: 'Email này đã được đăng ký tài khoản.' }
        }
        if (users.some((u) => u.user.phone.replace(/\s+/g, '') === phoneNorm)) {
          return { success: false, error: 'Số điện thoại này đã được sử dụng.' }
        }

        const newUser: CustomerUser = {
          id: `cust-${Date.now()}`,
          name: data.name.trim(),
          email: data.email.trim(),
          phone: data.phone.trim(),
          address: data.address.trim(),
          joinedAt: new Date().toISOString(),
        }

        set((state) => ({
          registeredUsers: [...state.registeredUsers, { user: newUser, passwordHash: data.password }],
          customer: newUser,
        }))

        return { success: true }
      },
      updateProfile: (data) => {
        set((state) => {
          if (!state.customer) return state
          const updated = { ...state.customer, ...data }
          const updatedList = state.registeredUsers.map((u) =>
            u.user.id === updated.id ? { ...u, user: updated } : u,
          )
          return {
            customer: updated,
            registeredUsers: updatedList,
          }
        })
      },
      logout: () => set({ customer: null }),
    }),
    {
      name: 'legend-customer-auth',
      partialize: (state) => ({
        customer: state.customer,
        registeredUsers: state.registeredUsers,
      }),
    },
  ),
)
