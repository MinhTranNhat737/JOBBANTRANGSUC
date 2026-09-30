'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Maximize2, Minus, MoveHorizontal, Plus, X, ZoomIn } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProductZoomProps {
  src: string
  alt: string
}

export function ProductZoom({ src, alt }: ProductZoomProps) {
  /* ── Lens Zoom on hover (inline) ── */
  const containerRef = useRef<HTMLDivElement>(null)
  const [lensActive, setLensActive] = useState(false)
  const [lensPos, setLensPos] = useState({ x: 50, y: 50 })

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setLensPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) })
  }, [])

  /* ── Fullscreen Lightbox ── */
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const posStart = useRef({ x: 0, y: 0 })

  const zoomIn = () => setScale((s) => Math.min(5, s + 0.5))
  const zoomOut = () => setScale((s) => Math.max(1, s - 0.5))
  const resetZoom = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  const openLightbox = () => {
    setLightboxOpen(true)
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  // Keyboard & scroll zoom controls
  useEffect(() => {
    if (!lightboxOpen) return
    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === '+' || e.key === '=') zoomIn()
      if (e.key === '-') zoomOut()
      if (e.key === '0') resetZoom()
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (e.deltaY < 0) setScale((s) => Math.min(5, s + 0.25))
      else setScale((s) => Math.max(1, s - 0.25))
    }

    window.addEventListener('keydown', onKey)
    window.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('wheel', onWheel)
    }
  }, [lightboxOpen])

  // Drag pan when zoomed
  const handleDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (scale <= 1) return
      setDragging(true)
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      dragStart.current = { x: clientX, y: clientY }
      posStart.current = { ...position }
    },
    [scale, position],
  )

  const handleDragMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!dragging) return
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      setPosition({
        x: posStart.current.x + (clientX - dragStart.current.x),
        y: posStart.current.y + (clientY - dragStart.current.y),
      })
    },
    [dragging],
  )

  const handleDragEnd = useCallback(() => setDragging(false), [])

  // Double-click toggle zoom
  const handleDoubleClick = () => {
    if (scale > 1) {
      resetZoom()
    } else {
      setScale(2.5)
    }
  }

  return (
    <>
      {/* ─── Inline Product Image with Lens Zoom on Hover ─── */}
      <div
        ref={containerRef}
        className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-sm border border-white/10 product-stage"
        onMouseEnter={() => setLensActive(true)}
        onMouseLeave={() => setLensActive(false)}
        onMouseMove={handleMouseMove}
        onClick={openLightbox}
        role="button"
        tabIndex={0}
        aria-label="Bấm để xem toàn màn hình"
        onKeyDown={(e) => e.key === 'Enter' && openLightbox()}
      >
        <Image
          src={src || '/placeholder.svg'}
          alt={alt}
          fill
          priority
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="object-cover transition-transform duration-300"
        />

        {/* Magnifier lens overlay */}
        {lensActive && (
          <div
            className="pointer-events-none absolute inset-0 z-10 hidden lg:block"
            style={{
              backgroundImage: `url(${src})`,
              backgroundSize: '250%',
              backgroundPosition: `${lensPos.x}% ${lensPos.y}%`,
              opacity: 1,
            }}
          >
            <div className="absolute inset-0 bg-black/10" />
          </div>
        )}

        {/* Crosshair cursor indicator */}
        {lensActive && (
          <div
            className="pointer-events-none absolute z-20 hidden size-20 rounded-full border-2 border-white/50 shadow-[0_0_15px_rgba(255,255,255,0.3)] lg:block"
            style={{
              left: `${lensPos.x}%`,
              top: `${lensPos.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}

        {/* Zoom hint badge */}
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-[11px] font-medium text-zinc-200 backdrop-blur-sm transition-opacity group-hover:opacity-100 opacity-70">
          <ZoomIn className="size-3.5" />
          <span className="hidden sm:inline">Click to zoom</span>
        </div>

        {/* Fullscreen icon */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            openLightbox()
          }}
          className="absolute top-4 right-4 z-20 flex size-9 items-center justify-center rounded-full bg-black/50 text-white/80 opacity-0 backdrop-blur-sm transition-all hover:bg-black/70 hover:text-white group-hover:opacity-100"
          aria-label="Xem toàn màn hình"
        >
          <Maximize2 className="size-4" />
        </button>
      </div>

      {/* ─── Fullscreen Lightbox Modal ─── */}
      <AnimatePresence>
        {lightboxOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-50 bg-black/95"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxOpen(false)}
            />

            {/* Lightbox content */}
            <motion.div
              className="fixed inset-0 z-50 flex flex-col"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Top toolbar */}
              <div className="flex items-center justify-between px-4 py-3 sm:px-6">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <MoveHorizontal className="size-4" />
                  <span className="hidden sm:inline">
                    {scale > 1 ? 'Kéo để xem chi tiết · Cuộn chuột để phóng to/thu nhỏ' : 'Cuộn chuột hoặc bấm + để phóng to'}
                  </span>
                  <span className="sm:hidden text-xs">Pinch / cuộn để zoom</span>
                </div>

                <div className="flex items-center gap-1">
                  {/* Zoom controls */}
                  <button
                    type="button"
                    onClick={zoomOut}
                    disabled={scale <= 1}
                    className="flex size-9 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                    aria-label="Thu nhỏ"
                  >
                    <Minus className="size-4" strokeWidth={2.5} />
                  </button>

                  <span className="mx-1 min-w-[3.5rem] text-center text-xs font-bold tabular-nums text-white">
                    {Math.round(scale * 100)}%
                  </span>

                  <button
                    type="button"
                    onClick={zoomIn}
                    disabled={scale >= 5}
                    className="flex size-9 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                    aria-label="Phóng to"
                  >
                    <Plus className="size-4" strokeWidth={2.5} />
                  </button>

                  <button
                    type="button"
                    onClick={resetZoom}
                    className="ml-2 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    Reset
                  </button>

                  {/* Close */}
                  <button
                    type="button"
                    onClick={() => setLightboxOpen(false)}
                    className="ml-3 flex size-10 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-white/15 hover:text-white"
                    aria-label="Đóng"
                  >
                    <X className="size-5" strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Image area */}
              <div
                className={cn(
                  'relative flex flex-1 items-center justify-center overflow-hidden',
                  scale > 1 ? 'cursor-grab' : 'cursor-zoom-in',
                  dragging && 'cursor-grabbing',
                )}
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={handleDragStart}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
                onDoubleClick={handleDoubleClick}
              >
                <div
                  className="relative transition-transform duration-150 ease-out"
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                    willChange: 'transform',
                  }}
                >
                  <img
                    src={src}
                    alt={alt}
                    className="max-h-[85vh] max-w-[90vw] select-none object-contain"
                    draggable={false}
                  />
                </div>
              </div>

              {/* Bottom product name */}
              <div className="flex justify-center px-4 py-3">
                <p className="text-sm font-medium text-zinc-400">{alt}</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
