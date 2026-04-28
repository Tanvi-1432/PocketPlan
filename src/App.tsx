import { useState } from 'react'
import Layout, { type Page } from './components/Layout'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Budgets from './pages/Budgets'
import Goals from './pages/Goals'
import './index.css'

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')

  function renderPage() {
    switch (currentPage) {
      case 'dashboard':    return <Dashboard onNavigate={setCurrentPage} />
      case 'transactions': return <Transactions />
      case 'budgets':      return <Budgets />
      case 'goals':        return <Goals />
    }
  }

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  )
}
