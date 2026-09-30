import { Hero } from '@/components/home/hero'
import { EditorialGrid } from '@/components/home/editorial-grid'
import { Newsletter } from '@/components/home/newsletter'
import { FeaturedProducts } from '@/components/home/featured-products'
import { getProducts } from '@/lib/products'

export const revalidate = 60

export default async function HomePage() {
  const products = (await getProducts()).slice(0, 8)

  return (
    <main>
      <Hero />
      <FeaturedProducts products={products} />
      <EditorialGrid />
      <Newsletter />
    </main>
  )
}
