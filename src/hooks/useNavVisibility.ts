import { useState, useEffect, useRef } from 'react'

const SCROLL_THRESHOLD = 8
const TOP_ZONE = 80

/**
 * Controls the mobile bottom nav visibility.
 *
 * The nav hides while scrolling down to free vertical space and reappears when
 * scrolling up. Desktop ignores this hook because the sidebar is fixed.
 */
export function useNavVisibility(resetSignal?: unknown): boolean {
  const [visible, setVisible] = useState(true)

  // Refs avoid re-rendering on every scroll event. React state changes only
  // when the visible/hidden result actually needs to update.
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  // Reset to visible on page change so navigation never remains hidden after
  // the user moves to a new screen.
  useEffect(() => {
    // This effect intentionally synchronizes React state with an external
    // navigation event: a page change should always reveal the mobile nav.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(true)
    lastScrollY.current = window.scrollY
  }, [resetSignal])

  useEffect(() => {
    function handleScroll() {
      if (ticking.current) return
      ticking.current = true

      // requestAnimationFrame batches the scroll math to the browser paint
      // cycle, which keeps mobile scrolling smooth.
      requestAnimationFrame(() => {
        const current = window.scrollY
        const delta = current - lastScrollY.current

        if (current < TOP_ZONE) {
          // Near the top, prioritize discoverability over scroll direction.
          setVisible(true)
        } else if (Math.abs(delta) >= SCROLL_THRESHOLD) {
          // Positive delta means scrolling down; negative means scrolling up.
          setVisible(delta < 0)
        }

        lastScrollY.current = current
        ticking.current = false
      })
    }

    // Passive listeners tell Safari/Chrome this handler will not block scroll.
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return visible
}
