import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const SCROLL_THRESHOLD = 8
const TOP_ZONE = 80

export function useNavVisibility(): boolean {
  const [visible, setVisible] = useState(true)
  const location = useLocation()

  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  // Reset to visible on route change so nav never stays hidden after navigation.
  useEffect(() => {
    setVisible(true)
    lastScrollY.current = window.scrollY
  }, [location.pathname])

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
