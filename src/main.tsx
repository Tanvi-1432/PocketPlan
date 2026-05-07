import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initTheme } from './store/theme'

// Apply persisted theme before first render to avoid flash
initTheme()

// One-time migration: wipe localStorage stores that contain pre-stable-ID data
// (entries whose IDs don't start with 'demo-' are from the old random-UUID era).
// After this runs once the data is clean and subsequent loads are fine.
;(function migrateStaleData() {
  const storeKeys = ['pocketplan-transactions', 'pocketplan-budgets', 'pocketplan-goals']
  for (const key of storeKeys) {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const parsed = JSON.parse(raw)
      const items: { id: string }[] = Object.values(parsed?.state ?? {})[0] as { id: string }[]
      if (!Array.isArray(items)) continue
      const hasStale = items.some((item) => item?.id && !item.id.startsWith('demo-'))
      if (hasStale) localStorage.removeItem(key)
    } catch {
      // ignore parse errors
    }
  }
})()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
