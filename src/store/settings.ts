import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppSettings } from '../types'

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
      updateSettings: (patch) =>
        set((state) => ({ settings: { ...state.settings, ...patch } })),
      resetSettings: () => set({ settings: DEFAULTS }),
    }),
    { name: 'pocketplan-settings' }
  )
)
