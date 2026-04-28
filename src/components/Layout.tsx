import { useState } from 'react'
import type { ReactNode } from 'react'

type Page = 'dashboard' | 'transactions' | 'budgets' | 'goals' | 'accounts' | 'investments'

interface NavItem {
  id: Page
  label: string
  icon: ReactNode
}

function Icon({ d }: { d: string }) {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',    label: 'Dashboard',    icon: <Icon d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10" /> },
  { id: 'transactions', label: 'Transactions', icon: <Icon d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" /> },
  { id: 'budgets',      label: 'Budgets',      icon: <Icon d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 0v10l6 3" /> },
  { id: 'goals',        label: 'Goals',        icon: <Icon d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /> },
  { id: 'accounts',     label: 'Accounts',     icon: <Icon d="M3 9a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zm0 0V7a2 2 0 012-2h2M16 5H8a2 2 0 00-2 2" /> },
  { id: 'investments',  label: 'Investments',  icon: <Icon d="M3 17l4-8 4 4 4-6 4 3" /> },
]

interface LayoutProps {
  currentPage: Page
  onNavigate: (page: Page) => void
  children: ReactNode
}

export default function Layout({ currentPage, onNavigate, children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navButtonClass = (id: Page) =>
    `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      currentPage === id
        ? 'bg-indigo-50 text-indigo-700'
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
    }`

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-200 fixed inset-y-0 z-10">
        <div className="px-6 py-5 border-b border-gray-100">
          <span className="text-xl font-bold text-indigo-600 tracking-tight">PocketPlan</span>
          <p className="text-xs text-gray-400 mt-0.5">Personal Finance Dashboard</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button key={item.id} onClick={() => onNavigate(item.id)} className={navButtonClass(item.id)}>
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-gray-100">
          <div className="flex items-center gap-2 bg-amber-50 rounded-lg px-3 py-2">
            <span className="text-amber-500 text-xs">●</span>
            <p className="text-xs text-amber-700 font-medium">Demo Mode</p>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 inset-x-0 z-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 h-14">
        <span className="text-lg font-bold text-indigo-600">PocketPlan</span>
        <button
          onClick={() => setMobileMenuOpen((o) => !o)}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            {mobileMenuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-14 inset-x-0 z-10 bg-white border-b border-gray-200 px-3 py-2 space-y-0.5 shadow-lg">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); setMobileMenuOpen(false) }}
              className={navButtonClass(item.id)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-60 pt-14 md:pt-0 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}

export type { Page }
