import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Be_Vietnam_Pro, Cinzel, Cormorant_Upright } from 'next/font/google'
import { AnnouncementBar } from '@/components/site/announcement-bar'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { CartDrawer } from '@/components/site/cart-drawer'
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
    default: 'LEGEND — Handcrafted Silver Jewelry',
    template: '%s | LEGEND',
  },
  description:
    'LEGEND is a handcrafted fine jewelry brand for men. Sterling silver rings, pendants, earrings and bracelets inspired by Eastern mythology.',
  keywords: ['silver jewelry', 'men jewelry', 'sterling silver rings', 'handcrafted', 'LEGEND'],
  openGraph: {
    type: 'website',
    siteName: 'LEGEND',
    images: ['/images/hero.png'],
  },
  twitter: { card: 'summary_large_image' },
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0f0f0f',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} ${cormorantUpright.variable} ${cinzel.variable}`}>
      <body className="antialiased">
        <AnnouncementBar />
        <SiteHeader />
        {children}
        <SiteFooter />
        <CartDrawer />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

