import { useState } from 'react'
import type { ReactNode } from 'react'

type Page = 'dashboard' | 'transactions' | 'budgets' | 'goals' | 'accounts' | 'investments'

interface NavItem {
  id: Page
  label: string
  icon: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',    label: 'Dashboard',    icon: '▦' },
  { id: 'transactions', label: 'Transactions', icon: '↕' },
  { id: 'budgets',      label: 'Budgets',      icon: '◎' },
  { id: 'goals',        label: 'Goals',        icon: '◈' },
  { id: 'accounts',     label: 'Accounts',     icon: '🏦' },
  { id: 'investments',  label: 'Investments',  icon: '📈' },
]

interface LayoutProps {
  currentPage: Page
  onNavigate: (page: Page) => void
  children: ReactNode
}

export default function Layout({ currentPage, onNavigate, children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-200 fixed inset-y-0">
        <div className="px-6 py-5 border-b border-gray-200">
          <span className="text-xl font-bold text-indigo-600 tracking-tight">PocketPlan</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                currentPage === item.id
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">Demo Mode · Simulated data only</p>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 inset-x-0 z-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 h-14">
        <span className="text-lg font-bold text-indigo-600">PocketPlan</span>
        <button
          onClick={() => setMobileMenuOpen((o) => !o)}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-14 inset-x-0 z-10 bg-white border-b border-gray-200 px-3 py-2 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); setMobileMenuOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                currentPage === item.id
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-60 pt-14 md:pt-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}

export type { Page }
