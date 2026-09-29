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
      <header className="mb-8">
        <h1 className="font-display text-3xl tracking-wider md:text-5xl">Discover Craftsmanship</h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          Handcrafted fine jewelry for men. A mark of courage and the journey of growth — hand-finished
          by Vietnamese artisans.
        </p>
      </header>
      <Suspense fallback={<div className="h-96" />}>
        <Catalog products={products} />
      </Suspense>
    </main>
  )
}
