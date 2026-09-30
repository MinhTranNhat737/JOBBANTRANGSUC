'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { useLanguage, TRANSLATIONS } from '@/lib/i18n'

/* ── Quote decorator SVG ── */
function QuoteMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M14 24H6C6 16.268 12.268 10 20 10V14C14.477 14 10 18.477 10 24V38H24V24H14ZM38 24H30C30 16.268 36.268 10 44 10V14C38.477 14 34 18.477 34 24V38H48V24H38Z"
        fill="currentColor"
      />
    </svg>
  )
}

/* ── Animated line divider ── */
function AnimatedLine() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })

  return (
    <div ref={ref} className="relative my-6 h-px w-full overflow-hidden md:my-8">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
    </div>
  )
}

/* ── Main FounderStory Section ── */
export function FounderStory() {
  const { lang } = useLanguage()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const content = mounted ? FOUNDER_CONTENT[lang] : FOUNDER_CONTENT.vi

  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 })

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-t border-[var(--border-subtle)] bg-gradient-to-b from-[var(--surface-primary)] via-[var(--surface-secondary)] to-[var(--surface-primary)] transition-colors"
    >
      {/* Subtle ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/2 top-0 h-96 w-[60%] -translate-x-1/2 opacity-30"
          style={{ background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.08), transparent 70%)' }}
        />
      </div>

      <div className="relative mx-auto max-w-screen-xl px-4 py-20 sm:px-6 md:py-28 lg:px-8 lg:py-36">
        {/* ─── Section Title ─── */}
        <motion.div
          className="mb-16 text-center md:mb-20 lg:mb-24"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.35em] text-zinc-400">
            {content.label}
          </p>
          <h2 className="font-display text-3xl font-medium leading-tight tracking-wider text-[var(--text-primary)] sm:text-4xl md:text-5xl lg:text-[3.5rem]">
            {content.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base font-light leading-relaxed text-[var(--text-secondary)] md:text-lg">
            {content.subtitle}
          </p>
        </motion.div>

        {/* ─── Two Column: Photo + Story ─── */}
        <div className="grid items-start gap-10 lg:grid-cols-[5fr_6fr] lg:gap-16 xl:gap-20">
          {/* Left: Founder Portrait with fade effects */}
          <motion.div
            className="relative mx-auto w-full max-w-md lg:max-w-none"
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          >
            <div className="group relative overflow-hidden rounded-sm">
              {/* Gradient overlays for cinematic fade */}
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0c0c0e] via-transparent to-[#0c0c0e]/30" />
              <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#0c0c0e]/20 via-transparent to-[#0c0c0e]/50 lg:from-transparent lg:to-[#0c0c0e]/60" />

              {/* Ambient gold edge glow */}
              <div className="absolute -inset-px z-[11] rounded-sm border border-white/[0.06]" />

              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src="/images/founder.jpg"
                  alt={content.founderName}
                  fill
                  sizes="(min-width: 1024px) 42vw, (min-width: 640px) 60vw, 90vw"
                  className="object-cover grayscale transition-all duration-700 group-hover:grayscale-[60%] group-hover:scale-[1.02]"
                />
              </div>

              {/* Founder name plate */}
              <div className="absolute bottom-0 left-0 right-0 z-20 px-6 pb-6 pt-12 bg-gradient-to-t from-[#0c0c0e] via-[#0c0c0e]/80 to-transparent">
                <p className="font-display text-lg font-medium tracking-wider text-white sm:text-xl">
                  {content.founderName}
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-[0.25em] text-zinc-400">
                  {content.founderRole}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right: Story content */}
          <motion.div
            className="flex flex-col justify-center"
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
          >
            {/* Opening quote */}
            <div className="relative mb-8">
              <QuoteMark className="absolute -left-2 -top-4 size-10 text-white/10 md:-left-4 md:-top-6 md:size-14" />
              <blockquote className="relative pl-4 text-lg font-light italic leading-relaxed text-[var(--text-primary)] sm:text-xl md:pl-6 md:text-2xl lg:text-[1.65rem] lg:leading-[1.7]">
                {content.quote}
              </blockquote>
            </div>

            <AnimatedLine />

            {/* Story paragraphs */}
            <div className="space-y-5 text-[15px] leading-[1.85] text-[var(--text-secondary)] md:text-base md:leading-[1.9]">
              {content.paragraphs.map((p, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    duration: 0.7,
                    ease: 'easeOut',
                    delay: 0.6 + i * 0.15,
                  }}
                >
                  {p}
                </motion.p>
              ))}
            </div>

            <AnimatedLine />

            {/* Signature / closing */}
            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <div className="h-px flex-1 bg-gradient-to-r from-white/30 to-transparent" />
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">
                {content.signOff}
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* ─── Philosophy Cards ─── */}
        <motion.div
          className="mt-20 grid gap-4 sm:grid-cols-3 md:mt-28 md:gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1 }}
        >
          {content.values.map((v, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-sm border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-6 transition-all duration-500 hover:border-white/30 hover:shadow-lg md:p-8"
            >
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-400">
                {v.label}
              </p>
              <h3 className="font-display text-lg font-medium tracking-wide text-[var(--text-primary)]">
                {v.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                {v.desc}
              </p>
              {/* Subtle hover glow */}
              <div className="pointer-events-none absolute -bottom-12 -right-12 size-24 rounded-full bg-white/5 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ── Content ── */
const FOUNDER_CONTENT = {
  vi: {
    label: 'Người Sáng Lập',
    title: 'Nghệ Nhân & Tầm Nhìn',
    subtitle: 'Hành trình từ tình yêu kim hoàn truyền thống đến thương hiệu trang sức bản lĩnh.',
    founderName: 'Nguyễn Thanh Minh',
    founderRole: 'Nhà sáng lập & Nghệ nhân trưởng',
    quote:
      '"Mỗi món trang sức không chỉ là vật trang trí — đó là lời tuyên ngôn về bản lĩnh, về câu chuyện mà người đàn ông muốn kể cho thế giới."',
    paragraphs: [
      'Từ nhỏ, tôi đã bị cuốn hút bởi ánh bạc lung linh trong xưởng rèn của ông ngoại. Những chiếc búa nhỏ gõ đều trên bạc nóng, từng nét chạm khắc tinh xảo — đó là bài học đầu tiên về sự kiên nhẫn và tận tâm.',
      'Năm 2018, sau hơn mười năm miệt mài nghiên cứu kỹ thuật kim hoàn Đông Á và phương Tây, tôi thành lập LEGEND với một tầm nhìn đơn giản: tạo ra những tác phẩm bạc 925 mang hồn cốt văn hóa Việt, dành riêng cho người đàn ông có gu thẩm mỹ khác biệt.',
      'Mỗi sản phẩm của LEGEND đều được chế tác thủ công hoàn toàn, từ khâu phác thảo, đúc khuôn, chạm khắc đến đánh bóng cuối cùng. Không có hai món trang sức nào giống nhau — và đó chính là giá trị mà chúng tôi theo đuổi.',
      'Với LEGEND, tôi muốn chứng minh rằng trang sức nam không cần phải phô trương. Sức mạnh nằm ở sự tinh tế, ở câu chuyện ẩn sau từng đường nét, và ở chất liệu trường tồn cùng năm tháng.',
    ],
    signOff: 'LEGEND — Since 2018',
    values: [
      {
        label: '01',
        title: 'Chế Tác Thủ Công',
        desc: 'Mỗi sản phẩm được tạo hình hoàn toàn bằng tay bởi các nghệ nhân giàu kinh nghiệm, đảm bảo sự độc bản và tinh xảo trong từng chi tiết.',
      },
      {
        label: '02',
        title: 'Chất Liệu Chuẩn Mực',
        desc: 'Bạc 925 Sterling nguyên chất, kiểm định quốc tế. Không pha tạp, không thỏa hiệp — chỉ có chất lượng vượt chuẩn.',
      },
      {
        label: '03',
        title: 'Di Sản Văn Hóa',
        desc: 'Lấy cảm hứng từ tứ linh, hoa văn cung đình và huyền thoại phương Đông, mỗi thiết kế là một câu chuyện sống mãi.',
      },
    ],
  },
  en: {
    label: 'The Founder',
    title: 'The Artisan & The Vision',
    subtitle: 'A journey from traditional goldsmithing love to a bold jewelry brand.',
    founderName: 'Nguyễn Thanh Minh',
    founderRole: 'Founder & Master Artisan',
    quote:
      '"Every piece of jewelry is more than an accessory — it\'s a declaration of character, a story the man chooses to tell the world."',
    paragraphs: [
      'From a young age, I was captivated by the shimmering silver in my grandfather\'s forge. The rhythmic tap of small hammers on heated silver, each intricate engraving — those were my first lessons in patience and devotion.',
      'In 2018, after over a decade studying East Asian and Western goldsmithing techniques, I founded LEGEND with a simple vision: to create 925 sterling silver masterpieces imbued with Vietnamese cultural soul, crafted exclusively for men with distinctive taste.',
      'Every LEGEND piece is entirely handcrafted — from the initial sketch, mold casting, and engraving to the final polish. No two pieces are ever alike — and that is precisely the value we pursue.',
      'With LEGEND, I want to prove that men\'s jewelry need not be ostentatious. True power lies in refinement, in the story hidden behind every curve, and in materials that endure the passage of time.',
    ],
    signOff: 'LEGEND — Since 2018',
    values: [
      {
        label: '01',
        title: 'Handcrafted Excellence',
        desc: 'Each piece is shaped entirely by hand by experienced artisans, ensuring uniqueness and exquisite detail in every creation.',
      },
      {
        label: '02',
        title: 'Certified Materials',
        desc: 'Pure 925 Sterling Silver, internationally certified. No compromise, no shortcuts — only standards that exceed expectations.',
      },
      {
        label: '03',
        title: 'Cultural Heritage',
        desc: 'Inspired by the Four Sacred Beasts, imperial motifs, and Eastern legends, every design is a story that lives forever.',
      },
    ],
  },
} as const
