import { useState, useEffect, useRef } from 'react'

const SCROLL_THRESHOLD = 8
const TOP_ZONE = 80

export function useNavVisibility(resetSignal?: unknown): boolean {
  const [visible, setVisible] = useState(true)
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  // Reset to visible on page change
  useEffect(() => {
    setVisible(true)
    lastScrollY.current = window.scrollY
  }, [resetSignal])

  useEffect(() => {
    function handleScroll() {
      if (ticking.current) return
      ticking.current = true
      requestAnimationFrame(() => {
        const current = window.scrollY
        const delta = current - lastScrollY.current

        if (current < TOP_ZONE) {
          setVisible(true)
        } else if (Math.abs(delta) >= SCROLL_THRESHOLD) {
          setVisible(delta < 0)
        }

        lastScrollY.current = current
        ticking.current = false
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return visible
}
