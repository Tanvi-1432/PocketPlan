import { useState } from 'react'
import type { ReactNode } from 'react'
import { useThemeStore } from '../store/theme'

type Page = 'dashboard' | 'transactions' | 'budgets' | 'goals' | 'accounts' | 'investments'

interface NavItem {
  id: Page
  label: string
  d: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',    label: 'Dashboard',    d: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10' },
  { id: 'transactions', label: 'Transactions', d: 'M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4' },
  { id: 'budgets',      label: 'Budgets',      d: 'M12 2a10 10 0 100 20A10 10 0 0012 2zm0 0v10l6 3' },
  { id: 'goals',        label: 'Goals',        d: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  { id: 'accounts',     label: 'Accounts',     d: 'M3 9a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zm0 0V7a2 2 0 012-2h2M16 5H8a2 2 0 00-2 2' },
  { id: 'investments',  label: 'Investments',  d: 'M3 17l4-8 4 4 4-6 4 3' },
]

function NavIcon({ d }: { d: string }) {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { preference, toggleTheme } = useThemeStore()
  const isDark =
    preference === 'dark' ||
    (preference === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className={`flex items-center gap-2 rounded-lg transition-all duration-150 active:scale-95
        text-slate-500 hover:text-slate-700 hover:bg-slate-100
        dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800
        ${compact ? 'p-2' : 'px-3 py-2 text-xs font-medium w-full'}`}
    >
      {isDark ? (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
      ) : (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
        </svg>
      )}
      {!compact && <span>{isDark ? 'Light mode' : 'Dark mode'}</span>}
    </button>
  )
}

interface LayoutProps {
  currentPage: Page
  onNavigate: (page: Page) => void
  children: ReactNode
}

export default function Layout({ currentPage, onNavigate, children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  function navigate(page: Page) {
    onNavigate(page)
    setMobileMenuOpen(false)
  }

  const navButtonClass = (id: Page) => {
    const active = currentPage === id
    return `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
      active
        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 active:scale-95'
    }`
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-200">

      {/* ── Sidebar desktop ─────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-60 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 fixed inset-y-0 z-10 transition-colors duration-200">

        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 6v4l3 3" />
              </svg>
            </div>
            <div>
              <span className="text-base font-bold text-indigo-600 tracking-tight leading-none">PocketPlan</span>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Personal Finance</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button key={item.id} onClick={() => navigate(item.id)} className={navButtonClass(item.id)}>
              <NavIcon d={item.d} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <ThemeToggle />
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/50 rounded-lg px-3 py-2">
            <span className="text-amber-500 text-xs">●</span>
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">Demo Mode</p>
          </div>
        </div>
      </aside>

      {/* ── Mobile header ────────────────────────────────────────────────── */}
      <div className="md:hidden fixed top-0 inset-x-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 h-14 transition-colors duration-200">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 6v4l3 3" />
            </svg>
          </div>
          <span className="text-base font-bold text-indigo-600">PocketPlan</span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle compact />
          <button
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all duration-150"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              {mobileMenuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-10 bg-black/20 backdrop-blur-[1px]"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile dropdown */}
      <div
        className={`md:hidden fixed top-14 inset-x-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 py-2 space-y-0.5 shadow-lg transition-all duration-200 ease-out ${
          mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        {NAV_ITEMS.map((item) => (
          <button key={item.id} onClick={() => navigate(item.id)} className={navButtonClass(item.id)}>
            <NavIcon d={item.d} />
            {item.label}
          </button>
        ))}
        <div className="pt-1 pb-1 space-y-1">
          <ThemeToggle />
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/50 rounded-lg px-3 py-2">
            <span className="text-amber-500 text-xs">●</span>
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">Demo Mode — all data is simulated</p>
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="flex-1 md:ml-60 pt-14 md:pt-0 min-h-screen">
        <div
          className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8"
          style={{ paddingBottom: 'calc(3rem + env(safe-area-inset-bottom))' }}
        >
          {children}
        </div>
      </main>
    </div>
  )
}

export type { Page }
