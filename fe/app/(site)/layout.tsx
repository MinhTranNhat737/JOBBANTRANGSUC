import { AnnouncementBar } from '@/components/site/announcement-bar'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { CartDrawer } from '@/components/site/cart-drawer'
import { ThemeProvider } from '@/components/site/theme-provider'

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ThemeProvider>
      <div className="print:hidden">
        <AnnouncementBar />
        <SiteHeader />
      </div>
      {children}
      <div className="print:hidden">
        <SiteFooter />
        <CartDrawer />
      </div>
    </ThemeProvider>
  )
}
