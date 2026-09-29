'use client'

import Image from 'next/image'
import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative flex min-h-[620px] items-center justify-center overflow-hidden border-b border-white/10 md:min-h-[780px]">
      {/* Background with black & white monochrome tone */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero.png"
          alt="Hình ảnh nghệ thuật trang sức bạc chế tác"
          fill
          priority
          sizes="100vw"
          className="object-cover brightness-50 contrast-125 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-[#0c0c0e]/70 to-[#0c0c0e]/50" />
      </div>

      {/* Static dignified Trống Đồng watermark - no rotation */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 size-[650px] -translate-x-1/2 -translate-y-1/2 opacity-15 mix-blend-screen md:size-[850px]"
      >
        <Image src="/images/trong-dong.png" alt="" fill sizes="850px" className="object-contain" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-4 py-20 text-center md:py-28">
        <h1 className="font-calligraphy text-balance text-4xl font-medium leading-[1.2] text-white sm:text-5xl md:text-6xl">
          Rèn từ huyền thoại
        </h1>

        <p className="mt-4 text-balance text-base font-normal text-zinc-300 md:text-lg">
          Trang sức bạc 925 chế tác thủ công tinh xảo.
        </p>

        <div className="mt-8">
          <Link
            href="/collections"
            className="inline-flex items-center justify-center bg-white px-9 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-black transition-colors hover:bg-zinc-200 md:px-10 md:py-4 md:text-sm"
          >
            Khám phá bộ sưu tập
          </Link>
        </div>
      </div>
    </section>
  )
}

