import type { Metadata } from 'next'
import Image from 'next/image'
import { Reveal } from '@/components/site/reveal'

export const metadata: Metadata = {
  title: 'About Legend',
  description: 'The story of LEGEND — handcrafted silver jewelry for men, shaped by Eastern mythology.',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <main>
      <section className="mx-auto max-w-2xl px-4 py-16 text-center md:py-24">
        <h1 className="font-display text-3xl font-semibold tracking-wider text-white md:text-5xl">
          Câu Chuyện
        </h1>
        <p className="mt-4 text-base font-normal text-zinc-300 md:text-lg">
          Trang sức chế tác thủ công từ bạc 925 nguyên chất.
        </p>
        <div className="mt-8 space-y-4 text-sm leading-relaxed text-zinc-400 md:text-base">
          <p>
            LEGEND khởi nguồn từ niềm đam mê kim hoàn truyền thống. Mỗi tác phẩm đều mang dấu ấn văn hóa tinh xảo, tôn vinh nét đẹp điềm đạm và bản lĩnh trường tồn.
          </p>
          <p>
            Tất cả sản phẩm đều được kiểm định chuẩn bạc 925 và hỗ trợ bảo dưỡng, làm sáng trọn đời.
          </p>
        </div>
      </section>
      <div className="relative aspect-[21/9] w-full overflow-hidden border-y border-white/10">
        <Image
          src="/images/ed-new.png"
          alt="Không gian chế tác"
          fill
          sizes="100vw"
          className="object-cover grayscale brightness-90"
        />
      </div>
    </main>
  )
}
