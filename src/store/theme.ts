import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ThemePreference = 'light' | 'dark' | 'system'

interface ThemeState {
  preference: ThemePreference
  setPreference: (p: ThemePreference) => void
  toggleTheme: () => void
}

function applyTheme(preference: ThemePreference) {
  const isDark =
    preference === 'dark' ||
    (preference === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', isDark)
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

// Call once on app boot to restore persisted theme
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
