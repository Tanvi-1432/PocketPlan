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

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')
  useSettingsStore() // subscribe so formatters re-run when settings change

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
