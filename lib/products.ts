export type Category = 'pendants' | 'rings' | 'earrings' | 'bracelets' | 'accessories'

export type Product = {
  slug: string
  name: string
  category: Category
  price: number
  compareAtPrice?: number
  image: string
  badge?: 'New' | 'Best seller' | 'Limited'
  stock: number
  sizes?: string[]
  material: string
  description: string
}

export const CATEGORIES: { value: Category | 'all'; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'rings', label: 'Nhẫn bạc' },
  { value: 'pendants', label: 'Mặt dây chuyền' },
  { value: 'bracelets', label: 'Vòng & Lắc tay' },
  { value: 'earrings', label: 'Khuyên tai' },
  { value: 'accessories', label: 'Phụ kiện' },
]

const API_BASE_URL =
  process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000'

async function fetchApi<T>(path: string) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    next: { revalidate: 60 },
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    if (response.status === 404) return null
    throw new Error(`Backend request failed: ${response.status}`)
  }

  return (await response.json()) as T
}

export async function getProducts(category?: Category | 'all') {
  const query = category && category !== 'all' ? `?category=${category}` : ''
  const products = await fetchApi<Product[]>(`/api/products${query}`)
  return products ?? []
}

export async function getProductBySlug(slug: string) {
  return await fetchApi<Product>(`/api/products/${encodeURIComponent(slug)}`)
}

export async function getRelatedProducts(product: Product, limit = 4) {
  const related = await fetchApi<Product[]>(
    `/api/products/${encodeURIComponent(product.slug)}/related?limit=${limit}`,
  )
  return related ?? []
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

export function getSiteUrl() {
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL
  return host ? `https://${host}` : 'http://localhost:3000'
}
