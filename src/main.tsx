import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initTheme } from './store/theme'

// Apply persisted theme before first render to avoid flash
initTheme()

// Migration: wipe stale localStorage data so the app always starts clean.
// v1: wiped non-demo-prefixed IDs (random UUID era).
// v2: wiped old single-occurrence demo transaction IDs (pre-12-month era).
//     Old IDs looked like "demo-tx-netflix"; new IDs look like "demo-tx-netflix-2026-04".
//     Detecting the old format: transaction IDs that match "demo-tx-<name>" with no trailing month.
;(function migrateStaleData() {
  const MIGRATION_KEY = 'pocketplan-migration-v2'
  if (localStorage.getItem(MIGRATION_KEY)) return  // already ran

  const storeKeys = ['pocketplan-transactions', 'pocketplan-budgets', 'pocketplan-goals']
  for (const key of storeKeys) {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const parsed = JSON.parse(raw)
      const items: { id: string }[] = Object.values(parsed?.state ?? {})[0] as { id: string }[]
      if (!Array.isArray(items)) continue

      // Wipe if any non-demo IDs exist (v1 migration)
      const hasNonDemo = items.some((item) => item?.id && !item.id.startsWith('demo-'))
      if (hasNonDemo) { localStorage.removeItem(key); continue }

      // Wipe if old short-form demo-tx IDs exist (v2 migration):
      // old pattern: "demo-tx-<name>" — no dash-separated year segment at the end
      // new pattern: "demo-tx-<name>-YYYY-MM" or "demo-tx-<name>-YYYY-MM-N"
      const OLD_TX_RE = /^demo-tx-[a-z]+$/
      const hasOldFormat = items.some((item) => item?.id && OLD_TX_RE.test(item.id))
      if (hasOldFormat) localStorage.removeItem(key)
    } catch {
      // ignore parse errors
    }
  }

  localStorage.setItem(MIGRATION_KEY, '1')
})()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
