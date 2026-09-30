import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Catalog } from '@/components/catalog/catalog'
import { getProducts } from '@/lib/products'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Discover Craftsmanship — All Products',
  description:
    'Khám phá bộ sưu tập nhẫn, mặt dây chuyền, khuyên tai, vòng tay và phụ kiện xa xỉ chế tác thủ công tinh xảo bởi THUC LUXURY.',
  alternates: { canonical: '/collections' },
}


export default async function CollectionsPage() {
  const products = await getProducts()

  return (
    <main className="pb-24 pt-2">
      <Suspense fallback={<div className="h-96" />}>
        <Catalog products={products} />
      </Suspense>
    </main>
  )
}
