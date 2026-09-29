'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus, X } from 'lucide-react'
import { selectCartTotal, useShop } from '@/lib/store'
import { formatPrice } from '@/lib/products'

export function CartDrawer() {
  const { cart, isCartOpen, setCartOpen, updateQuantity, removeFromCart } = useShop()
  const total = useShop(selectCartTotal)

  useEffect(() => {
    if (!isCartOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setCartOpen(false)
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isCartOpen, setCartOpen])

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            aria-hidden
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-popover"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
              <h2 className="font-display text-lg font-semibold tracking-wider text-white">Giỏ hàng của bạn</h2>
              <button type="button" onClick={() => setCartOpen(false)} aria-label="Đóng giỏ hàng" className="p-1 text-zinc-400 hover:text-white">
                <X className="size-5" />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <p className="text-base text-zinc-400">Giỏ hàng của bạn hiện đang trống.</p>
                <Link
                  href="/collections"
                  onClick={() => setCartOpen(false)}
                  className="rounded-sm border border-white bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-black transition-colors hover:bg-zinc-200"
                >
                  Khám phá tác phẩm
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-zinc-800 overflow-y-auto px-6">
                  {cart.map((item) => (
                    <li key={`${item.slug}-${item.size}`} className="flex gap-4 py-5">
                      <div className="product-stage relative size-20 shrink-0 overflow-hidden rounded-sm border border-zinc-800">
                        <Image src={item.image || '/placeholder.svg'} alt={item.name} fill sizes="80px" className="object-cover" />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between gap-2">
                          <Link
                            href={`/products/${item.slug}`}
                            onClick={() => setCartOpen(false)}
                            className="text-sm font-medium text-white hover:text-zinc-300"
                          >
                            {item.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.slug, item.size)}
                            aria-label={`Xoá ${item.name}`}
                            className="text-zinc-500 hover:text-white"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                        {item.size && <p className="mt-1 text-xs text-zinc-400">Kích thước: {item.size}</p>}
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <div className="flex items-center rounded-sm border border-zinc-700 bg-zinc-900">
                            <button
                              type="button"
                              className="p-1.5 text-zinc-400 hover:text-white"
                              aria-label="Giảm"
                              onClick={() => updateQuantity(item.slug, item.size, item.quantity - 1)}
                            >
                              <Minus className="size-3.5" />
                            </button>
                            <span className="w-8 text-center text-xs font-semibold tabular-nums text-white">{item.quantity}</span>
                            <button
                              type="button"
                              className="p-1.5 text-zinc-400 hover:text-white"
                              aria-label="Tăng"
                              onClick={() => updateQuantity(item.slug, item.size, item.quantity + 1)}
                            >
                              <Plus className="size-3.5" />
                            </button>
                          </div>
                          <p className="text-sm font-semibold tabular-nums text-white">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-zinc-800 px-6 py-6">
                  <div className="flex justify-between text-base font-medium">
                    <span className="text-zinc-300">Tạm tính</span>
                    <span className="font-bold tabular-nums text-white">{formatPrice(total)}</span>
                  </div>
                  <p className="mt-2 text-xs text-zinc-400">Đã bao gồm VAT. Miễn phí vận chuyển toàn quốc.</p>
                  <button
                    type="button"
                    className="mt-5 w-full rounded-sm bg-white py-4 text-xs font-bold uppercase tracking-[0.2em] text-black transition-colors hover:bg-zinc-200"
                  >
                    Tiến hành thanh toán
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
