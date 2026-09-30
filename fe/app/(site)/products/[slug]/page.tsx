import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ProductPurchase } from '@/components/product/product-purchase'
import { ProductZoom } from '@/components/product/product-zoom'
import { ProductCard } from '@/components/site/product-card'
import { Reveal } from '@/components/site/reveal'
import { formatPrice, getProductBySlug, getProducts, getRelatedProducts, getSiteUrl } from '@/lib/products'

export const revalidate = 60
export const dynamicParams = true

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
    brand: { '@type': 'Brand', name: 'THUC LUXURY' },
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
      <nav aria-label="Breadcrumb" className="mb-8 text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-[var(--text-primary)]">Trang chủ</Link></li>
          <li aria-hidden className="text-[var(--text-muted)]">/</li>
          <li><Link href={`/collections?c=${product.category}`} className="capitalize hover:text-[var(--text-primary)]">{product.category}</Link></li>
          <li aria-hidden className="text-[var(--text-muted)]">/</li>
          <li aria-current="page" className="text-[var(--text-primary)]">{product.name}</li>
        </ol>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
        {/* Ảnh sản phẩm với Zoom Lens + Lightbox toàn màn hình */}
        <ProductZoom src={product.image} alt={product.name} />

        <div className="lg:sticky lg:top-28 lg:self-start">
          {product.badge && (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">{product.badge}</p>
          )}
          <h1 className="mt-2 font-display text-3xl font-medium leading-tight tracking-wide text-[var(--text-primary)] md:text-4xl">{product.name}</h1>
          <p className="mt-4 text-2xl font-bold tabular-nums text-[var(--text-primary)]">
            {formatPrice(product.price)}
            {product.compareAtPrice && (
              <s className="ml-3 text-base font-normal text-[var(--text-muted)]">{formatPrice(product.compareAtPrice)}</s>
            )}
          </p>
          <p className="mt-6 text-base leading-relaxed text-[var(--text-secondary)]">{product.description}</p>
          <ProductPurchase product={product} />
          <dl className="mt-10 divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)] text-sm">
            <div className="flex justify-between py-4">
              <dt className="text-[var(--text-secondary)]">Chất liệu chế tác</dt>
              <dd className="font-medium text-[var(--text-primary)]">{product.material}</dd>
            </div>
            <div className="flex justify-between py-4">
              <dt className="text-[var(--text-secondary)]">Chính sách bảo hành</dt>
              <dd className="font-medium text-[var(--text-primary)]">Làm sáng &amp; đánh bóng trọn đời</dd>
            </div>
            <div className="flex justify-between py-4">
              <dt className="text-[var(--text-secondary)]">Thời gian giao nhận</dt>
              <dd className="font-medium text-[var(--text-primary)]">2–4 ngày, kiểm tra trước khi nhận</dd>
            </div>
          </dl>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <Reveal>
            <h2 className="mb-8 font-display text-2xl font-medium tracking-wider text-[var(--text-primary)] md:text-3xl">Gợi ý dành cho bạn</h2>
          </Reveal>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
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
