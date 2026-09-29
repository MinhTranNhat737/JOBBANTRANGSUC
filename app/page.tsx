import Link from 'next/link'
import { Hero } from '@/components/home/hero'
import { EditorialGrid } from '@/components/home/editorial-grid'
import { Newsletter } from '@/components/home/newsletter'
import { TuLinhBand } from '@/components/home/tu-linh-band'
import { ProductCard } from '@/components/site/product-card'
import { Reveal } from '@/components/site/reveal'
import { SectionHeading } from '@/components/site/section-heading'
import { getProducts } from '@/lib/products'

export const revalidate = 60

export default async function HomePage() {
  const products = (await getProducts()).slice(0, 8)

  return (
    <main>
      <Hero />
      <TuLinhBand />
      <section className="mx-auto max-w-screen-2xl px-4 py-20 md:px-8 md:py-28">
        <SectionHeading title="Tác phẩm nổi bật" />
        <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {products.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 4) * 0.1}>
              <ProductCard product={p} priority={i < 4} />
            </Reveal>
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <Link
            href="/collections"
            className="inline-flex items-center justify-center border border-zinc-700 bg-zinc-900/80 px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] text-zinc-200 transition-colors hover:border-white hover:bg-white hover:text-black md:text-sm"
          >
            Xem tất cả
          </Link>
        </div>
      </section>
      <EditorialGrid />
      <Newsletter />
    </main>
  )
}
