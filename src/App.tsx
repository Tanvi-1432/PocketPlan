import { useState } from 'react'
import Layout, { type Page } from './components/Layout'
import { ToastContainer } from './components/ui'
import { useSettingsStore } from './store/settings'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Budgets from './pages/Budgets'
import Goals from './pages/Goals'
import Accounts from './pages/Accounts'
import Investments from './pages/Investments'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import './index.css'

/**
 * Root shell for PocketPlan.
 *
 * Responsibilities:
 * - Owns the current page state for this small SPA.
 * - Wires the shared layout around every page.
 * - Keeps global UI, such as toast notifications, mounted once.
 */
export default function App() {
  // PocketPlan uses a lightweight page switch instead of React Router because
  // every screen lives inside the same persisted local app state.
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')

  // Subscribe at the root so settings changes cause formatters that read the
  // store imperatively (currency/date helpers) to refresh across the app.
  useSettingsStore() // subscribe so formatters re-run when settings change

  /**
   * Converts the active page id into the page component.
   * `setCurrentPage` is passed only where child pages need cross-page navigation.
   */
  function renderPage() {
    switch (currentPage) {
      case 'dashboard':    return <Dashboard onNavigate={setCurrentPage} />
      case 'transactions': return <Transactions />
      case 'budgets':      return <Budgets />
      case 'goals':        return <Goals />
      case 'accounts':     return <Accounts />
      case 'investments':  return <Investments />
      case 'analytics':   return <Analytics />
      case 'settings':    return <Settings />
    }
  }

  return (
    <>
      <div className="app-bg" aria-hidden="true" />
      <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPage()}
        <ToastContainer />
      </Layout>
    </>
  )
}
