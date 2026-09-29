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
      <section className="mx-auto max-w-2xl px-4 py-20 md:py-28">
        <Reveal>
          <h1 className="text-center font-display text-4xl tracking-wider md:text-6xl">About Legend</h1>
          <p className="mt-8 text-center text-sm font-medium text-accent">
            When we decided to build Legend, we wanted every piece to carry a story — a reminder that courage
            is forged, not given.
          </p>
        </Reveal>
        <Reveal delay={0.1} className="mt-12 space-y-6 text-sm leading-loose text-muted-foreground">
          <p>
            Born in a small Hanoi workshop, LEGEND began with a single silver ring and a belief that men&apos;s
            jewelry could be more than an accessory. Each piece is sculpted by hand, cast in 925 sterling silver
            and oxidized to reveal the depth of its carving.
          </p>
          <p>
            Our designs draw from the guardians of Eastern mythology — the Vermilion Bird, the Azure Dragon,
            the Lotus Warrior — reinterpreted for the modern man who wears his story openly.
          </p>
          <p>
            Every order is inspected, polished and packaged by the same artisans who made it. And because
            silver is meant to last, every LEGEND piece comes with lifetime cleaning and polishing.
          </p>
          <p className="font-display text-foreground">— The Legend Atelier</p>
        </Reveal>
      </section>
      <Reveal className="relative aspect-[21/9] w-full overflow-hidden">
        <Image src="/images/ed-new.png" alt="Couple walking a horse on a misty beach" fill sizes="100vw" className="object-cover grayscale" />
      </Reveal>
    </main>
  )
}
