import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initTheme } from './store/theme'

/**
 * Browser entry point.
 *
 * This file handles one-time boot concerns that must happen before React
 * renders: restoring the theme class and migrating stale localStorage shapes.
 */

// Apply persisted theme before first render to avoid a light/dark flash.
initTheme()

// ====================
// localStorage Migration
// ====================
// Zustand persists each store under its own key. Demo data now relies on
// stable, month-scoped IDs so reloading the demo can upsert instead of
// duplicating rows. Older saved data can break that assumption, so this tiny
// migration wipes only known stale shapes and then records that it ran.
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

      // v1: random UUID-era records cannot be safely reconciled with the
      // deterministic demo seed, so remove the old persisted collection.
      const hasNonDemo = items.some((item) => item?.id && !item.id.startsWith('demo-'))
      if (hasNonDemo) { localStorage.removeItem(key); continue }

      // v2: old demo transactions used one ID per merchant. New demo history
      // uses one ID per merchant/month so subscription detection can see a
      // realistic timeline without producing duplicate keys.
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
