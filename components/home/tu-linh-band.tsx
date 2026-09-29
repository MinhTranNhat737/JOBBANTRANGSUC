const MOTIFS = ['Long', 'Lân', 'Quy', 'Phụng', 'Bạch Liên', 'Trống Đồng']

export function TuLinhBand() {
  return (
    <section
      aria-label="Biểu tượng truyền thống"
      className="border-y border-white/10 bg-[#101013] py-7"
    >
      <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-around gap-6 px-4 text-center">
        {MOTIFS.map((name) => (
          <span
            key={name}
            className="font-calligraphy text-xl font-normal tracking-widest text-zinc-300 transition-colors hover:text-white sm:text-2xl md:text-3xl"
          >
            {name}
          </span>
        ))}
      </div>
    </section>
  )
}

