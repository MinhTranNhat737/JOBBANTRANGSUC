const MESSAGES = [
  'Bảo hành trọn đời cho mọi sản phẩm bạc',
  'Miễn phí vận chuyển đơn từ 2.000.000₫',
  'Chế tác thủ công bởi nghệ nhân Việt',
  'Hotline 1900 1234',
]

export function AnnouncementBar() {
  const items = [...MESSAGES, ...MESSAGES]
  return (
    <div className="overflow-hidden bg-lacquer text-lacquer-foreground">
      <div className="marquee-track flex w-max items-center py-2" aria-label={MESSAGES.join(' · ')}>
        {items.map((msg, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="flex items-center gap-6 px-6 text-[11px] font-medium uppercase tracking-[0.2em]"
          >
            {msg}
            <span className="size-1.5 rotate-45 bg-accent" />
          </span>
        ))}
      </div>
    </div>
  )
}
