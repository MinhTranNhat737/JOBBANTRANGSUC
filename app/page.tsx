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
        <SectionHeading eyebrow="Hàng mới về" title="Tác phẩm nổi bật" />
        <div className="mt-14 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-x-4">
          {products.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 4) * 0.1}>
              <ProductCard product={p} priority={i < 4} />
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-14 flex justify-center">
          <Link
            href="/collections"
            className="group inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-accent"
          >
            <span className="h-px w-8 bg-current transition-all duration-500 group-hover:w-14" />
            Xem tất cả
            <span className="h-px w-8 bg-current transition-all duration-500 group-hover:w-14" />
          </Link>
        </Reveal>
      </section>
      <EditorialGrid />
      <Newsletter />
    </main>
  )
}
