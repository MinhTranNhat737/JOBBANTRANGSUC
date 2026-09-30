'use client'

import { useEffect } from 'react'
import { useTheme } from '@/lib/theme'

/**
 * Syncs the Zustand theme state to a `data-theme` attribute on <html>
 * and updates `color-scheme` so browser UI matches.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useTheme((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    root.style.colorScheme = theme
  }, [theme])

  return <>{children}</>
}
