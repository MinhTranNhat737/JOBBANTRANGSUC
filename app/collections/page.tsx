import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Catalog } from '@/components/catalog/catalog'
import { getProducts } from '@/lib/products'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Discover Craftsmanship — All Products',
  description:
    'Browse handcrafted sterling silver rings, pendants, earrings, bracelets and accessories by LEGEND.',
  alternates: { canonical: '/collections' },
}

export default async function CollectionsPage() {
  const products = await getProducts()

  return (
    <main className="mx-auto max-w-screen-2xl px-4 pb-24 pt-12 md:px-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold tracking-wider text-white md:text-4xl">
          Cửa Hàng
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Trang sức bạc 925 chế tác thủ công.
        </p>
      </header>
      <Suspense fallback={<div className="h-96" />}>
        <Catalog products={products} />
      </Suspense>
    </main>
  )
}
