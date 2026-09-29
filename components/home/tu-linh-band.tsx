const WORDS = ['Long', 'Lân', 'Quy', 'Phụng', 'Chu Tước', 'Sen vàng', 'Trống đồng']

export function TuLinhBand() {
  const items = [...WORDS, ...WORDS]
  return (
    <section
      aria-label="Tứ Linh: Long, Lân, Quy, Phụng"
      className="relative overflow-hidden border-y border-border bg-lacquer/25 py-6"
    >
      <div
        aria-hidden="true"
        className="pattern-long-phuong pointer-events-none absolute inset-0 opacity-10 [animation-direction:reverse]"
      />
      <div className="marquee-track relative flex w-max items-center" aria-hidden="true">
        {items.map((w, i) => (
          <span key={i} className="flex items-center gap-10 px-10">
            <span
              className={
                i % 2 === 0
                  ? 'font-calligraphy text-3xl font-normal tracking-wider text-foreground md:text-5xl'
                  : 'font-calligraphy text-3xl font-light tracking-wider text-transparent [-webkit-text-stroke:1px_var(--accent)] md:text-5xl'
              }
            >
              {w}
            </span>
            <span className="size-2 rotate-45 bg-accent" />
          </span>
        ))}
      </div>
    </section>
  )
}
