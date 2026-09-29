import Link from 'next/link'

const COLUMNS = [
  {
    title: 'Customer Care',
    links: ['Payment instructions', 'Delivery policy', 'Warranty policy', 'Return policy', 'Size guide', 'Privacy policy'],
  },
  {
    title: 'About Us',
    links: ['The story of Legend', 'Store system', 'Recruitment', 'Legend Membership', 'Collaborations'],
  },
  {
    title: 'For Customers',
    links: ['Blog', 'Product care instructions', 'Ring size measurement', 'Legend Partnership'],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-screen-2xl gap-12 px-4 py-16 md:grid-cols-2 md:px-8 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="max-w-sm">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em]">Connect with us</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            LEGEND is a handcrafted fine jewelry brand for men, creating works imbued with courage and
            the journey of growth. Each piece carries a unique spirit, meticulously handcrafted by
            Vietnamese artisans.
          </p>
          <address className="mt-6 space-y-1 text-sm not-italic text-muted-foreground">
            <p>Hanoi · 0987 654 321</p>
            <p>Ho Chi Minh City · 0912 345 678</p>
            <p>support@legend.vn</p>
          </address>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em]">{col.title}</h2>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l}>
                  <Link href="/about" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-screen-2xl px-4 py-6 text-xs text-muted-foreground md:px-8">
          © {new Date().getFullYear()} LEGEND. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
