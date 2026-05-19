import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ThemePreference = 'light' | 'dark' | 'system'

/**
 * Theme store.
 *
 * Theme is intentionally separate from formatting settings because it must
 * update the `<html>` class before React paints. Components read this store for
 * controls; `initTheme` reads localStorage directly during boot.
 */
interface ThemeState {
  preference: ThemePreference
  setPreference: (p: ThemePreference) => void
  toggleTheme: () => void
}

function applyThemeColor(isDark: boolean) {
  const color = isDark ? '#0b1020' : '#f6f2ff'
  // Keep mobile browser chrome aligned with the active theme color.
  document.querySelectorAll('meta[name="theme-color"]').forEach((el) => {
    el.setAttribute('content', color)
  })
}

function applyTheme(preference: ThemePreference) {
  // `system` resolves at the moment the theme is applied. The app also calls
  // this during boot so Tailwind's `dark:` selectors are correct immediately.
  const isDark =
    preference === 'dark' ||
    (preference === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', isDark)
  applyThemeColor(isDark)
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      preference: 'system',

      setPreference: (preference) => {
        set({ preference })
        applyTheme(preference)
      },

      toggleTheme: () => {
        // Toggle from the resolved visual state, not merely the stored value,
        // so "system while currently dark" flips to explicit light mode.
        const current = get().preference
        const isDarkNow =
          current === 'dark' ||
          (current === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
        const next: ThemePreference = isDarkNow ? 'light' : 'dark'
        set({ preference: next })
        applyTheme(next)
      },
    }),
    { name: 'pocketplan-theme' }
  )
)

// Call once on app boot to restore persisted theme before React renders.
export function initTheme() {
  const stored = localStorage.getItem('pocketplan-theme')
  if (stored) {
    try {
      const { state } = JSON.parse(stored) as { state: { preference: ThemePreference } }
      applyTheme(state.preference)
      return
    } catch {
      // fall through to system
    }
  }
  applyTheme('system')
}
