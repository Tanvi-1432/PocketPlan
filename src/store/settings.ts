import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppSettings } from '../types'

/**
 * User preference store.
 *
 * These values drive display-only formatting: currency symbols, date format,
 * cents visibility, and compact number notation. The store is persisted so the
 * app hydrates with the same preferences after refresh.
 */
interface SettingsState {
  settings: AppSettings
  updateSettings: (patch: Partial<AppSettings>) => void
  resetSettings: () => void
}

const DEFAULTS: AppSettings = {
  theme: 'system',
  currency: 'USD',
  dateFormat: 'MMM D, YYYY',
  showCents: true,
  compactNumbers: false,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULTS,
      // Merge patches so each control can update one preference without
      // needing to know the full settings object.
      updateSettings: (patch) =>
        set((state) => ({ settings: { ...state.settings, ...patch } })),
      resetSettings: () => set({ settings: DEFAULTS }),
    }),
    { name: 'pocketplan-settings' }
  )
)
