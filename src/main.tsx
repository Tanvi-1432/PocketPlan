import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { initTheme } from './store/theme'

// Apply persisted theme before first render to avoid a light/dark flash.
initTheme()

// ====================
// localStorage Migration
// ====================
;(function migrateStaleData() {
  const MIGRATION_KEY = 'pocketplan-migration-v2'
  if (localStorage.getItem(MIGRATION_KEY)) return

  const storeKeys = ['pocketplan-transactions', 'pocketplan-budgets', 'pocketplan-goals']
  for (const key of storeKeys) {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const parsed = JSON.parse(raw)
      const items: { id: string }[] = Object.values(parsed?.state ?? {})[0] as { id: string }[]
      if (!Array.isArray(items)) continue

      const hasNonDemo = items.some((item) => item?.id && !item.id.startsWith('demo-'))
      if (hasNonDemo) { localStorage.removeItem(key); continue }

      const OLD_TX_RE = /^demo-tx-[a-z]+$/
      const hasOldFormat = items.some((item) => item?.id && OLD_TX_RE.test(item.id))
      if (hasOldFormat) localStorage.removeItem(key)
    } catch {
      // ignore parse errors
    }
  }

  localStorage.setItem(MIGRATION_KEY, '1')
})()

;(function migrateDemoInvestmentBalances() {
  const MIGRATION_KEY = 'pocketplan-migration-v3-investment-balances'
  if (localStorage.getItem(MIGRATION_KEY)) return

  try {
    const key = 'pocketplan-accounts'
    const raw = localStorage.getItem(key)
    if (raw) {
      const parsed = JSON.parse(raw)
      const accounts = parsed?.state?.accounts
      if (Array.isArray(accounts)) {
        const nextAccounts = accounts.map((account: { id?: string; balance?: number }) => {
          if (account.id === 'demo-acc-fid-brok') return { ...account, balance: 22321.26 }
          if (account.id === 'demo-acc-rh-brok') return { ...account, balance: 16141.16 }
          return account
        })
        localStorage.setItem(key, JSON.stringify({
          ...parsed,
          state: { ...parsed.state, accounts: nextAccounts },
        }))
      }
    }
  } catch {
    // ignore
  }

  localStorage.setItem(MIGRATION_KEY, '1')
})()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
