export type Category = 'pendants' | 'rings' | 'earrings' | 'bracelets' | 'accessories' | string

export type Product = {
  id?: number | string
  slug: string
  name: string
  category: Category
  price: number
  compareAtPrice?: number
  image: string
  images?: { id?: number; url: string; is_primary?: boolean }[]
  badge?: 'New' | 'Best seller' | 'Limited' | string
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

const RING_SIZES = ['8', '9', '10', '11', '12', '13']

const PRODUCTS: Product[] = [
  {
    slug: 'libra-lotus-pendant',
    name: 'Libra Lotus Pendant',
    category: 'pendants',
    price: 2450000,
    image: '/images/p-pendant-lotus.png',
    badge: 'New',
    stock: 12,
    material: '925 Sterling Silver, oxidized finish',
    description:
      'A balanced lotus bloom framed by hand-engraved scrollwork. Cast in 925 sterling silver and darkened by hand to bring every line of the carving forward.',
  },
  {
    slug: 'vermilion-bird-ring',
    name: 'Vermilion Bird Ring',
    category: 'rings',
    price: 3890000,
    image: '/images/p-ring-sapphire.png',
    badge: 'Best seller',
    stock: 5,
    sizes: RING_SIZES,
    material: '925 Sterling Silver, lab sapphire',
    description:
      'Feathered scales wrap a deep blue stone, inspired by the guardian bird of the south. Heavy, comfortable band finished for daily wear.',
  },
  {
    slug: 'vermilion-bird-pendant',
    name: 'Vermilion Bird Pendant',
    category: 'pendants',
    price: 2190000,
    image: '/images/p-pendant-dagger.png',
    stock: 9,
    material: '925 Sterling Silver',
    description:
      'A slender blade pendant with a carved guard and pommel. Sold with a 60cm rolo chain.',
  },
  {
    slug: 'red-dragon-tag-pendant',
    name: 'Red Dragon Tag Pendant',
    category: 'pendants',
    price: 2690000,
    image: '/images/p-pendant-ruby.png',
    badge: 'Limited',
    stock: 3,
    material: '925 Sterling Silver, cold enamel',
    description:
      'A rectangular tag with a coiled dragon inlaid in hand-filled red enamel. Numbered limited run.',
  },
  {
    slug: 'chimaera-lock-cuff',
    name: 'Chimaera Lock Cuff',
    category: 'earrings',
    price: 1450000,
    image: '/images/p-cuff-horseshoe.png',
    stock: 18,
    material: '925 Sterling Silver',
    description:
      'An open horseshoe cuff with ball terminals and engraved shoulders. Sold individually.',
  },
  {
    slug: 'gothic-cross-signet',
    name: 'Gothic Cross Signet Ring',
    category: 'rings',
    price: 3250000,
    image: '/images/p-ring-signet.png',
    badge: 'New',
    stock: 7,
    sizes: RING_SIZES,
    material: '925 Sterling Silver',
    description:
      'A weighty signet crowned with a fleur cross, flanked by hand-chased wordmark shoulders.',
  },
  {
    slug: 'fleur-link-bracelet',
    name: 'Fleur Link Bracelet',
    category: 'bracelets',
    price: 5790000,
    image: '/images/p-chain-bracelet.png',
    stock: 4,
    sizes: ['17cm', '19cm', '21cm'],
    material: '925 Sterling Silver',
    description:
      'Solid oval links punctuated by fleur cross stations. Closes with a hidden box clasp.',
  },
  {
    slug: 'lotus-warrior-keychain',
    name: 'Lotus Warrior Keychain',
    category: 'accessories',
    price: 1890000,
    image: '/images/p-keychain.png',
    stock: 0,
    material: '925 Sterling Silver, steel clip',
    description:
      'A carved lotus warrior charm on a heavy lobster clip. Built to ride on your belt loop.',
  },
  {
    slug: 'mythic-dagger-earring',
    name: 'Mythic Dagger Earring',
    category: 'earrings',
    price: 1290000,
    image: '/images/p-pendant-dagger.png',
    stock: 22,
    material: '925 Sterling Silver',
    description: 'A miniature carved blade on a fine hoop. Sold individually.',
  },
  {
    slug: 'azure-scale-band',
    name: 'Azure Scale Band',
    category: 'rings',
    price: 2990000,
    compareAtPrice: 3490000,
    image: '/images/p-ring-sapphire.png',
    stock: 10,
    sizes: RING_SIZES,
    material: '925 Sterling Silver',
    description: 'Overlapping scales carved around the full band, finished with a blue accent.',
  },
  {
    slug: 'sunflower-chain-bracelet',
    name: 'Sunflower Chain Bracelet',
    category: 'bracelets',
    price: 4590000,
    image: '/images/p-chain-bracelet.png',
    badge: 'Best seller',
    stock: 6,
    sizes: ['17cm', '19cm', '21cm'],
    material: '925 Sterling Silver',
    description: 'Rolled links interrupted by sunflower medallions. A statement you can stack.',
  },
  {
    slug: 'twin-lotus-pendant',
    name: 'Twin Lotus Pendant',
    category: 'pendants',
    price: 2350000,
    image: '/images/p-pendant-lotus.png',
    stock: 14,
    material: '925 Sterling Silver',
    description: 'Two lotus blooms mirrored on a shield-shaped frame.',
  },
  {
    slug: 'horseshoe-hoop',
    name: 'Horseshoe Hoop Earring',
    category: 'earrings',
    price: 1190000,
    image: '/images/p-cuff-horseshoe.png',
    stock: 25,
    material: '925 Sterling Silver',
    description: 'A compact engraved horseshoe hoop for everyday wear.',
  },
  {
    slug: 'crest-signet-heavy',
    name: 'Crest Signet Heavy',
    category: 'rings',
    price: 4290000,
    image: '/images/p-ring-signet.png',
    badge: 'Limited',
    stock: 2,
    sizes: RING_SIZES,
    material: '925 Sterling Silver',
    description: 'Our heaviest signet, with a deeply relieved crest and textured sides.',
  },
  {
    slug: 'warrior-clip-charm',
    name: 'Warrior Clip Charm',
    category: 'accessories',
    price: 1590000,
    image: '/images/p-keychain.png',
    stock: 11,
    material: '925 Sterling Silver',
    description: 'A smaller warrior charm on a slim clip, sized for bags and keys.',
  },
  {
    slug: 'dragon-tag-mini',
    name: 'Dragon Tag Mini',
    category: 'pendants',
    price: 1790000,
    image: '/images/p-pendant-ruby.png',
    stock: 8,
    material: '925 Sterling Silver, cold enamel',
    description: 'A half-size take on our Red Dragon Tag, on a 50cm chain.',
  },
]

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3001/api'

export function normalizeCategory(cat?: string): Category {
  if (!cat) return 'accessories'
  const c = cat.toLowerCase().trim()
  if (c === 'nhan' || c === 'rings') return 'rings'
  if (c === 'mat-day-chuyen' || c === 'day-chuyen' || c === 'pendants') return 'pendants'
  if (c === 'vong-tay-lac' || c === 'bracelets') return 'bracelets'
  if (c === 'khuyen-tai' || c === 'earrings') return 'earrings'
  return 'accessories'
}

function resolveProductImage(dbImages: any[], category: string, id: number): string {
  if (Array.isArray(dbImages) && dbImages.length > 0) {
    const primary = dbImages.find((img) => img.is_primary) || dbImages[0]
    let url = primary?.url
    if (url) {
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url
      }
      if (url.startsWith('images/')) {
        return '/' + url
      }
      if (!url.startsWith('/')) {
        return '/' + url
      }
      return url
    }
  }


  // Graceful fallback to high quality jewelry imagery
  const ringImages = ['/images/p-ring-sapphire.png', '/images/p-ring-signet.png']
  const pendantImages = ['/images/p-pendant-lotus.png', '/images/p-pendant-ruby.png', '/images/p-pendant-dagger.png']
  const braceletImages = ['/images/p-chain-bracelet.png']
  const earringImages = ['/images/p-cuff-horseshoe.png']
  const accessoryImages = ['/images/p-keychain.png']

  const safeId = Math.abs(id || 1)
  switch (category) {
    case 'rings':
      return ringImages[safeId % ringImages.length]
    case 'pendants':
      return pendantImages[safeId % pendantImages.length]
    case 'bracelets':
      return braceletImages[safeId % braceletImages.length]
    case 'earrings':
      return earringImages[safeId % earringImages.length]
    case 'accessories':
    default:
      return accessoryImages[safeId % accessoryImages.length]
  }
}

export function mapDbProductToProduct(db: any): Product {
  const cat = normalizeCategory(db.category_slug || db.category || '')
  const id = Number(db.id) || 1
  const price =
    Number(db.sale_price) ||
    Number(db.price) ||
    Number(db.import_price) ||
    1850000 + (id % 9) * 350000
  const compareAtPrice = db.compare_at_price
    ? Number(db.compare_at_price)
    : id % 3 === 0
      ? price + 500000
      : undefined
  const image = resolveProductImage(db.images, cat, id)
  const stock =
    db.quantity !== undefined
      ? Number(db.quantity)
      : db.stock !== undefined
        ? Number(db.stock)
        : 10

  let badge: string | undefined = db.badge
  if (!badge) {
    if (id % 5 === 0) badge = 'New'
    else if (id % 7 === 0) badge = 'Best seller'
    else if (id % 11 === 0) badge = 'Limited'
  }

  let sizes: string[] | undefined = undefined
  if (Array.isArray(db.sizes) && db.sizes.length > 0) {
    sizes = db.sizes
  } else if (typeof db.sizes === 'string' && db.sizes.trim()) {
    try {
      sizes = JSON.parse(db.sizes)
    } catch {
      sizes = db.sizes.split(',').map((s: string) => s.trim()).filter(Boolean)
    }
  } else {
    const rawCat = String(db.category_slug || db.category_name || db.category || '').toLowerCase()
    if (rawCat.includes('quan-ao') || rawCat.includes('áo') || rawCat.includes('quần')) {
      sizes = ['S', 'M', 'L', 'XL']
    } else if (rawCat.includes('nhan') || cat === 'rings') {
      sizes = RING_SIZES
    } else if (rawCat.includes('vong') || rawCat.includes('lac') || cat === 'bracelets') {
      sizes = ['16cm', '18cm', '20cm']
    } else if (rawCat.includes('day-chuyen') || rawCat.includes('mat-day-chuyen')) {
      sizes = ['50cm', '55cm', '60cm']
    } else if (rawCat.includes('dep') || rawCat.includes('giay')) {
      sizes = ['39', '40', '41', '42', '43']
    }
  }

  return {
    id: db.id,
    slug: db.slug || `sp-${db.id}`,
    name: db.name || 'Trang sức & Phụ kiện THUC LUXURY',
    category: cat,
    price,
    compareAtPrice,
    image,
    images: db.images,
    badge: badge as any,
    stock,
    sizes,
    material:
      db.material ||
      (db.brand_name ? `${db.brand_name}, Bạc 925 cao cấp` : 'Bạc 925 chế tác thủ công'),
    description:
      db.description ||
      `${db.name} - Tác phẩm chế tác thủ công tinh xảo, chất liệu bạc 925 cao cấp từ bộ sưu tập THUC LUXURY.`,
  }
}


export async function getProducts(category?: Category | 'all'): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/products?limit=100`, {
      cache: 'no-store',
    })
    if (res.ok) {
      const data = await res.json()
      const list = data.products || (Array.isArray(data) ? data : [])
      if (list.length > 0) {
        const mapped = list.map(mapDbProductToProduct)
        if (!category || category === 'all') return mapped
        const targetCat = normalizeCategory(category)
        return mapped.filter((p: Product) => normalizeCategory(p.category) === targetCat)
      }
    }
  } catch (err) {
    console.warn('API error when fetching products from backend, using fallback:', err)
  }

  // Fallback to static PRODUCTS
  if (!category || category === 'all') return PRODUCTS
  return PRODUCTS.filter((p) => p.category === category)
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(slug)}`, {
      cache: 'no-store',
    })
    if (res.ok) {
      const dbProduct = await res.json()
      if (dbProduct && dbProduct.name) {
        return mapDbProductToProduct(dbProduct)
      }
    }
  } catch (err) {
    console.warn(`API error for slug ${slug}, using fallback:`, err)
  }

  return PRODUCTS.find((p) => p.slug === slug) ?? null
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  try {
    const all = await getProducts()
    const sameCat = all.filter((p) => p.category === product.category && p.slug !== product.slug)
    if (sameCat.length >= limit) return sameCat.slice(0, limit)
    return all.filter((p) => p.slug !== product.slug).slice(0, limit)
  } catch {
    return PRODUCTS.filter((p) => p.category === product.category && p.slug !== product.slug).slice(
      0,
      limit,
    )
  }
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

export function getSiteUrl() {
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL
  return host ? `https://${host}` : 'http://localhost:3000'
}

