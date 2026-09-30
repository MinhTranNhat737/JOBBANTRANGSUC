import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Be_Vietnam_Pro, Cinzel, Cormorant_Upright } from 'next/font/google'
import { getSiteUrl } from '@/lib/products'
import './globals.css'

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
})

const cormorantUpright = Cormorant_Upright({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-calligraphy',
})

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  weight: ['500', '700'],
})

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: 'THUC LUXURY — Trang Sức & Phụ Kiện Cao Cấp',
    template: '%s | THUC LUXURY',
  },
  description:
    'THUC LUXURY - Thương hiệu trang sức bạc 925 và phụ kiện cao cấp, chế tác thủ công tinh xảo, nhẫn, mặt dây chuyền, vòng tay, phong cách sang trọng và đẳng cấp.',
  keywords: ['THUC LUXURY', 'trang sức cao cấp', 'bạc 925', 'phụ kiện nam', 'luxury jewelry', 'trang sức thủ công'],
  openGraph: {
    type: 'website',
    siteName: 'THUC LUXURY',
    images: ['/images/hero.png'],
  },
  twitter: { card: 'summary_large_image' },
  generator: 'v0.app',
}


export const viewport: Viewport = {
  colorScheme: 'dark light',
  themeColor: '#0f0f0f',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" data-theme="dark" suppressHydrationWarning className={`${beVietnamPro.variable} ${cormorantUpright.variable} ${cinzel.variable}`}>
      <body className="antialiased bg-[var(--surface-primary)] text-[var(--text-primary)] transition-colors duration-300">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
