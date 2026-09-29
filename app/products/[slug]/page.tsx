import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ProductPurchase } from '@/components/product/product-purchase'
import { ProductCard } from '@/components/site/product-card'
import { Reveal } from '@/components/site/reveal'
import { formatPrice, getProductBySlug, getProducts, getRelatedProducts, getSiteUrl } from '@/lib/products'

export const revalidate = 60

export async function generateStaticParams() {
  const products = await getProducts()
  return products.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: 'Product not found' }
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { title: product.name, description: product.description, images: [product.image] },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const related = await getRelatedProducts(product)
  const siteUrl = getSiteUrl()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: [`${siteUrl}${product.image}`],
    description: product.description,
    sku: product.slug,
    material: product.material,
    brand: { '@type': 'Brand', name: 'LEGEND' },
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/products/${product.slug}`,
      priceCurrency: 'VND',
      price: product.price,
      availability:
        product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  }

  return (
    <main className="mx-auto max-w-screen-2xl px-4 pb-24 pt-8 md:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <nav aria-label="Breadcrumb" className="mb-8 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        <ol className="flex gap-2">
          <li><Link href="/" className="hover:text-foreground">Home</Link></li>
          <li aria-hidden>/</li>
          <li><Link href={`/collections?c=${product.category}`} className="capitalize hover:text-foreground">{product.category}</Link></li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-foreground">{product.name}</li>
        </ol>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
        <div className="product-stage relative aspect-square overflow-hidden">
          <Image
            src={product.image || '/placeholder.svg'}
            alt={product.name}
            fill
            priority
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          {product.badge && (
            <p className="text-[11px] uppercase tracking-[0.3em] text-accent">{product.badge}</p>
          )}
          <h1 className="mt-2 font-display text-3xl leading-tight tracking-wide md:text-5xl">{product.name}</h1>
          <p className="mt-4 text-lg tabular-nums">
            {formatPrice(product.price)}
            {product.compareAtPrice && (
              <s className="ml-3 text-sm text-muted-foreground">{formatPrice(product.compareAtPrice)}</s>
            )}
          </p>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
          <ProductPurchase product={product} />
          <dl className="mt-10 divide-y divide-border border-y border-border text-sm">
            <div className="flex justify-between py-4">
              <dt className="text-muted-foreground">Material</dt>
              <dd>{product.material}</dd>
            </div>
            <div className="flex justify-between py-4">
              <dt className="text-muted-foreground">Warranty</dt>
              <dd>Lifetime cleaning &amp; polishing</dd>
            </div>
            <div className="flex justify-between py-4">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd>2–4 business days</dd>
            </div>
          </dl>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <Reveal>
            <h2 className="mb-8 font-display text-2xl tracking-wider md:text-3xl">You May Also Like</h2>
          </Reveal>
          <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-x-4">
            {related.map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.08}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
