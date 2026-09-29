import Link from 'next/link'

const COLUMNS = [
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
      { label: 'Câu chuyện LEGEND', href: '/about' },
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
      { label: 'Cách chọn trang sức trung niên', href: '/about' },
      { label: 'Cam kết chất lượng bạc', href: '/about' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#0a0a0c]">
      <div className="mx-auto grid max-w-screen-2xl gap-10 px-4 py-16 md:grid-cols-2 md:px-8 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="max-w-sm">
          <span className="font-display text-2xl font-bold tracking-[0.25em] text-white">LEGEND</span>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400">
            Thương hiệu trang sức bạc thủ công cao cấp. Từng tác phẩm được đúc và chạm khắc tỉ mỉ bởi nghệ nhân kim hoàn Việt Nam, mang tinh thần uy nghiêm và chiều sâu truyền thống.
          </p>
          <address className="mt-6 space-y-1.5 text-sm not-italic text-zinc-300">
            <p className="font-medium text-white">Hotline tư vấn: 1900 1234 (8:00 - 21:00)</p>
            <p>Hà Nội: 18 Phố Cổ, Hoàn Kiếm</p>
            <p>TP. Hồ Chí Minh: 88 Đồng Khởi, Quận 1</p>
            <p className="text-zinc-500">Email: lienhe@legend.vn</p>
          </address>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white">{col.title}</h2>
            <ul className="mt-4 space-y-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-zinc-400 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-between gap-4 px-4 py-6 text-xs text-zinc-500 sm:flex-row md:px-8">
          <p>© {new Date().getFullYear()} LEGEND — Trang sức Bạc Việt Nam. Tất cả quyền được bảo lưu.</p>
          <p className="text-zinc-400">Chất lượng bạc 925 chuẩn kiểm định toàn quốc</p>
        </div>
      </div>
    </footer>
  )
}
