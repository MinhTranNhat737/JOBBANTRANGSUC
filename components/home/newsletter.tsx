'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ArrowRight } from 'lucide-react'

export function Newsletter() {
  const [submitted, setSubmitted] = useState(false)

  return (
    <section className="relative overflow-hidden">
      <Image
        src="/images/ed-bracelet.png"
        alt=""
        fill
        sizes="100vw"
        className="object-cover opacity-30 grayscale"
      />
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 size-[520px] -translate-x-1/2 -translate-y-1/2 opacity-25 mix-blend-screen md:size-[720px]">
        <Image src="/images/trong-dong.png" alt="" fill sizes="720px" className="spin-slow object-contain" />
      </div>
      <div className="relative mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center md:py-32">
        <h2 className="font-calligraphy text-balance text-3xl font-normal tracking-wide md:text-5xl">Đăng ký nhận bản tin</h2>
        <p className="mt-4 text-sm text-muted-foreground">
          Là người đầu tiên biết về bộ sưu tập mới và ưu đãi dành riêng.
        </p>
        {submitted ? (
          <p className="mt-8 text-sm text-accent" role="status">
            Cảm ơn bạn đã đăng ký.
          </p>
        ) : (
          <form
            className="mt-8 flex w-full max-w-sm border-b border-foreground/60"
            onSubmit={(e) => {
              e.preventDefault()
              setSubmitted(true)
            }}
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              placeholder="Email"
              className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button type="submit" aria-label="Subscribe" className="p-2">
              <ArrowRight className="size-4" />
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
