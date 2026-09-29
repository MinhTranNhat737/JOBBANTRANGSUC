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
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <h2 className="font-display text-lg tracking-widest">Your Cart</h2>
              <button type="button" onClick={() => setCartOpen(false)} aria-label="Close cart" className="p-1">
                <X className="size-5" />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <p className="text-sm text-muted-foreground">Your cart is empty.</p>
                <Link
                  href="/collections"
                  onClick={() => setCartOpen(false)}
                  className="border border-foreground px-6 py-3 text-[11px] uppercase tracking-[0.2em] transition-colors hover:bg-foreground hover:text-background"
                >
                  Shop the collection
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-border overflow-y-auto px-6">
                  {cart.map((item) => (
                    <li key={`${item.slug}-${item.size}`} className="flex gap-4 py-5">
                      <div className="product-stage relative size-24 shrink-0 overflow-hidden">
                        <Image src={item.image || '/placeholder.svg'} alt={item.name} fill sizes="96px" className="object-cover" />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between gap-2">
                          <Link
                            href={`/products/${item.slug}`}
                            onClick={() => setCartOpen(false)}
                            className="text-xs font-medium uppercase tracking-wider"
                          >
                            {item.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.slug, item.size)}
                            aria-label={`Remove ${item.name}`}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                        {item.size && <p className="mt-1 text-xs text-muted-foreground">Size {item.size}</p>}
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center border border-border">
                            <button
                              type="button"
                              className="p-2"
                              aria-label="Decrease quantity"
                              onClick={() => updateQuantity(item.slug, item.size, item.quantity - 1)}
                            >
                              <Minus className="size-3" />
                            </button>
                            <span className="w-6 text-center text-xs tabular-nums">{item.quantity}</span>
                            <button
                              type="button"
                              className="p-2"
                              aria-label="Increase quantity"
                              onClick={() => updateQuantity(item.slug, item.size, item.quantity + 1)}
                            >
                              <Plus className="size-3" />
                            </button>
                          </div>
                          <p className="text-sm tabular-nums">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-border px-6 py-6">
                  <div className="flex justify-between text-sm">
                    <span className="uppercase tracking-[0.2em] text-muted-foreground">Subtotal</span>
                    <span className="tabular-nums">{formatPrice(total)}</span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Shipping and taxes calculated at checkout.</p>
                  <button
                    type="button"
                    className="mt-5 w-full bg-foreground py-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-90"
                  >
                    Checkout
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
