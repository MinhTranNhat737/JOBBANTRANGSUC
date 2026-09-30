'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/i18n'

export function SiteFooter() {
  const { lang } = useLanguage()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const isEn = mounted && lang === 'en'

  const columns = isEn
    ? [
        {
          title: 'Customer Care',
          links: [
            { label: 'Payment Guide', href: '/about' },
            { label: 'Shipping & Delivery', href: '/about' },
            { label: 'Lifetime Warranty Policy', href: '/about' },
            { label: 'Return & Exchange Policy', href: '/about' },
            { label: 'Ring Sizing Guide', href: '/about' },
            { label: 'Privacy Policy', href: '/about' },
          ],
        },
        {
          title: 'About the Brand',
          links: [
            { label: 'The THUC LUXURY Story', href: '/about' },
            { label: 'Artisan Workshop', href: '/about' },
            { label: 'Vietnamese Silversmiths', href: '/about' },
            { label: 'Member Privileges', href: '/about' },
            { label: 'Atelier & Flagships', href: '/about' },
          ],
        },
        {
          title: 'Craft & Heritage',
          links: [
            { label: 'Four Mythic Guardians', href: '/about' },
            { label: 'Caring for 925 Silver', href: '/about' },
            { label: 'Jewelry Styling Guide', href: '/about' },
            { label: 'Quality Certification', href: '/about' },
          ],
        },
      ]
    : [
        {
          title: 'Chăm sóc khách hàng',
          links: [
            { label: 'Hướng dẫn thanh toán', href: '/about' },
            { label: 'Chính sách giao nhận', href: '/about' },
            { label: 'Chính sách bảo hành trọn đời', href: '/about' },
            { label: 'Chính sách đổi trả', href: '/about' },
            { label: 'Hướng dẫn đo size nhẫn', href: '/about' },
            { label: 'Bảo mật thông tin', href: '/about' },
          ],
        },
        {
          title: 'Về thương hiệu',
          links: [
            { label: 'Câu chuyện THUC LUXURY', href: '/about' },
            { label: 'Không gian xưởng chế tác', href: '/about' },
            { label: 'Nghệ nhân Việt Nam', href: '/about' },
            { label: 'Đặc quyền thành viên', href: '/about' },
            { label: 'Hệ thống chi nhánh', href: '/about' },
          ],
        },
        {
          title: 'Cẩm nang chế tác',
          links: [
            { label: 'Ý nghĩa văn hóa Tứ Linh', href: '/about' },
            { label: 'Bí quyết bảo quản bạc 925', href: '/about' },
            { label: 'Cách chọn trang sức cao cấp', href: '/about' },
            { label: 'Cam kết chất lượng bạc', href: '/about' },
          ],
        },
      ]

  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--surface-secondary)] transition-colors">
      <div className="mx-auto grid max-w-screen-2xl gap-10 px-4 py-16 md:grid-cols-2 md:px-8 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="max-w-sm">
          <span className="font-display text-2xl font-bold tracking-[0.25em] text-[var(--text-primary)]">THUC LUXURY</span>
          <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">
            {isEn
              ? 'Premier handcrafted 925 sterling silver jewelry. Each piece is cast and hand-engraved with dedication by Vietnamese master silversmiths, imbued with ancient dignity and cultural depth.'
              : 'Thương hiệu trang sức bạc thủ công cao cấp. Từng tác phẩm được đúc và chạm khắc tỉ mỉ bởi nghệ nhân kim hoàn Việt Nam, mang tinh thần uy nghiêm và chiều sâu truyền thống.'}
          </p>
          <address className="mt-6 space-y-1.5 text-sm not-italic text-[var(--text-secondary)]">
            <p className="font-medium text-[var(--text-primary)]">
              {isEn ? 'Atelier Hotline: 1900 1234 (8:00 - 21:00)' : 'Hotline tư vấn: 1900 1234 (8:00 - 21:00)'}
            </p>
            <p>Hanoi: 18 Old Quarter, Hoan Kiem</p>
            <p>Ho Chi Minh City: 88 Dong Khoi, District 1</p>
            <p className="text-[var(--text-muted)]">Email: lienhe@thucluxury.vn</p>
          </address>
        </div>
        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-primary)]">{col.title}</h2>
            <ul className="mt-4 space-y-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-[var(--border-subtle)]">
        <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-between gap-4 px-4 py-6 text-xs text-[var(--text-muted)] sm:flex-row md:px-8">
          <p>
            © {new Date().getFullYear()} THUC LUXURY — {isEn ? 'Vietnamese Handcrafted Silver. All rights reserved.' : 'Trang sức Bạc Việt Nam. Tất cả quyền được bảo lưu.'}
          </p>

          <p className="text-[var(--text-secondary)]">
            {isEn ? 'Certified 925 Sterling Silver Laboratory Tested' : 'Chất lượng bạc 925 chuẩn kiểm định toàn quốc'}
          </p>
        </div>
      </div>
    </footer>
  )
}
