import Image from 'next/image'
import Link from 'next/link'
import { Reveal } from '@/components/site/reveal'

const TILES = [
  { label: 'Sản phẩm mới', href: '/collections', image: '/images/ed-new.png', alt: 'Đôi tình nhân dắt ngựa trên bãi biển sương mù' },
  { label: 'Khuyên tai bạc', href: '/collections?c=earrings', image: '/images/ed-earrings.png', alt: 'Người phụ nữ đeo khuyên tai bạc hình dao găm' },
  { label: 'Nhẫn Signet', href: '/collections?c=rings', image: '/images/p-ring-signet.png', alt: 'Nhẫn bạc signet khắc thập tự' },
  { label: 'Mặt dây chuyền', href: '/collections?c=pendants', image: '/images/p-pendant-ruby.png', alt: 'Mặt dây bạc chạm rồng' },
  { label: 'Tất cả sản phẩm', href: '/collections', image: '/images/ed-all.png', alt: 'Người đàn ông đeo kính râm và nhẫn bạc' },
  { label: 'Vòng tay bạc', href: '/collections?c=bracelets', image: '/images/ed-bracelet.png', alt: 'Vòng tay bạc mắt xích trên nền đất tối' },
]

export function EditorialGrid() {
  return (
    <section aria-label="Mua theo bộ sưu tập" className="grid grid-cols-1 sm:grid-cols-2">
      {TILES.map((tile, i) => (
        <Reveal key={tile.label} delay={(i % 2) * 0.12}>
          <Link href={tile.href} className="group relative block aspect-square overflow-hidden">
            <Image
              src={tile.image || '/placeholder.svg'}
              alt={tile.alt}
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover grayscale transition-[transform,filter] duration-[1400ms] ease-out group-hover:scale-105 group-hover:grayscale-0 group-hover:sepia-[.35]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute inset-4 border border-accent/0 transition-colors duration-700 group-hover:border-accent/50" />
            <div className="absolute inset-x-0 bottom-10 flex flex-col items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.35em] md:text-sm">{tile.label}</span>
              <span className="h-px w-6 bg-accent transition-all duration-700 group-hover:w-24" />
            </div>
          </Link>
        </Reveal>
      ))}
    </section>
  )
}
