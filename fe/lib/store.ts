'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useCustomer } from './customer-store'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export type CartItem = {
  slug: string
  name: string
  price: number
  image: string
  size?: string
  quantity: number
}

const MAX_QTY = 10

const lineKey = (slug: string, size?: string) => `${slug}::${size ?? ''}`

type ShopState = {
  cart: CartItem[]
  wishlist: string[]
  isCartOpen: boolean
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  updateQuantity: (slug: string, size: string | undefined, quantity: number) => void
  removeFromCart: (slug: string, size?: string) => void
  toggleWishlist: (slug: string) => void
  syncWishlist: () => Promise<void>
  setCartOpen: (open: boolean) => void
  clearCart: () => void
}

export const useShop = create<ShopState>()(
  persist(
    (set) => ({
      cart: [],
      wishlist: [],
      isCartOpen: false,
      addToCart: (item, quantity = 1) =>
        set((state) => {
          const key = lineKey(item.slug, item.size)
          const existing = state.cart.find((c) => lineKey(c.slug, c.size) === key)
          const cart = existing
            ? state.cart.map((c) =>
                lineKey(c.slug, c.size) === key
                  ? { ...c, quantity: Math.min(MAX_QTY, c.quantity + quantity) }
                  : c,
              )
            : [...state.cart, { ...item, quantity: Math.min(MAX_QTY, quantity) }]
          return { cart, isCartOpen: true }
        }),
      updateQuantity: (slug, size, quantity) =>
        set((state) => ({
          cart:
            quantity <= 0
              ? state.cart.filter((c) => lineKey(c.slug, c.size) !== lineKey(slug, size))
              : state.cart.map((c) =>
                  lineKey(c.slug, c.size) === lineKey(slug, size)
                    ? { ...c, quantity: Math.min(MAX_QTY, quantity) }
                    : c,
                ),
        })),
      removeFromCart: (slug, size) =>
        set((state) => ({
          cart: state.cart.filter((c) => lineKey(c.slug, c.size) !== lineKey(slug, size)),
        })),
      clearCart: () => set({ cart: [] }),
      toggleWishlist: (slug) => {
        const removing = useShop.getState().wishlist.includes(slug)
        set((state) => ({ wishlist: removing ? state.wishlist.filter((s) => s !== slug) : [...state.wishlist, slug] }))
        const token = useCustomer.getState().token
        if (token) fetch(`${API_URL}/wishlist${removing ? `/${encodeURIComponent(slug)}` : ''}`, {
          method: removing ? 'DELETE' : 'POST',
          headers: { Authorization: `Bearer ${token}`, ...(removing ? {} : { 'Content-Type': 'application/json' }) },
          body: removing ? undefined : JSON.stringify({ slug }),
        }).catch(() => {})
      },
      syncWishlist: async () => {
        const token = useCustomer.getState().token
        if (!token) return
        const response = await fetch(`${API_URL}/wishlist`, { headers: { Authorization: `Bearer ${token}` } })
        if (response.ok) {
          const items = await response.json()
          set({ wishlist: items.map((item: { slug: string }) => item.slug) })
        }
      },
      setCartOpen: (open) => set({ isCartOpen: open }),
    }),
    {
      name: 'legend-shop',
      partialize: (state) => ({ cart: state.cart, wishlist: state.wishlist }),
    },
  ),
)

export const selectCartCount = (s: ShopState) => s.cart.reduce((n, i) => n + i.quantity, 0)
export const selectCartTotal = (s: ShopState) =>
  s.cart.reduce((n, i) => n + i.quantity * i.price, 0)
