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

export async function getProducts(category?: Category | 'all') {
  if (!category || category === 'all') return PRODUCTS
  return PRODUCTS.filter((p) => p.category === category)
}

export async function getProductBySlug(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug) ?? null
}

export async function getRelatedProducts(product: Product, limit = 4) {
  return PRODUCTS.filter((p) => p.category === product.category && p.slug !== product.slug).slice(
    0,
    limit,
  )
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

export function getSiteUrl() {
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL
  return host ? `https://${host}` : 'http://localhost:3000'
}
