import { useState } from 'react'
import type { ReactNode } from 'react'
import { useThemeStore } from '../store/theme'

type Page = 'dashboard' | 'transactions' | 'budgets' | 'goals' | 'accounts' | 'investments' | 'analytics' | 'settings'

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
  { id: 'analytics',   label: 'Analytics',    d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { id: 'settings',    label: 'Settings',     d: 'M12 15a3 3 0 100-6 3 3 0 000 6zm8.9-3a8.9 8.9 0 01-.1 1.4l2 1.6-2 3.5-2.4-.9a7 7 0 01-2.4 1.4L15.5 21h-4l-.5-2.1A7 7 0 018.6 17.5l-2.4.9-2-3.5 2-1.6A9 9 0 016.1 12a9 9 0 01.1-1.4l-2-1.6 2-3.5 2.4.9A7 7 0 0111 4.9L11.5 3h4l.5 2.1a7 7 0 012.4 1.4l2.4-.9 2 3.5-2 1.6c.1.5.1.9.1 1.3z' },
]

// Bottom mobile nav shows only the 5 most important pages
const MOBILE_NAV_ITEMS = NAV_ITEMS.slice(0, 5)

function NavIcon({ d, size = 'md' }: { d: string; size?: 'sm' | 'md' }) {
  const sz = size === 'sm' ? 'w-4 h-4' : 'w-[18px] h-[18px]'
  return (
    <svg className={`${sz} shrink-0`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
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
      className={`flex items-center gap-2 rounded-xl transition-all duration-200 active:scale-95
        text-slate-400 hover:text-slate-600 hover:bg-slate-100/80
        dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-white/5
        ${compact ? 'p-2' : 'px-3 py-2.5 text-xs font-medium w-full'}`}
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
    return `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      active
        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300 nav-active-glow'
        : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200 active:scale-[0.98]'
    }`
  }

  const mobileNavClass = (id: Page) => {
    const active = currentPage === id
    return `flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 active:scale-95 ${
      active
        ? 'text-indigo-600 dark:text-indigo-400'
        : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
    }`
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080d1a] flex transition-colors duration-300 relative">

      {/* ── Ambient background ───────────────────────────────────────────── */}
      <div className="ambient-bg">
        <div className="ambient-mid" />
      </div>

      {/* ── Sidebar desktop ─────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-[220px] glass-sidebar fixed inset-y-0 z-20 transition-all duration-300">

        {/* Logo */}
        <div className="px-5 pt-6 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 6v4l3 3" />
              </svg>
            </div>
            <div>
              <span className="text-[15px] font-bold tracking-tight leading-none"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                PocketPlan
              </span>
              <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-0.5">Personal Finance</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button key={item.id} onClick={() => navigate(item.id)} className={navButtonClass(item.id)}>
              <NavIcon d={item.d} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-5 pt-3 space-y-1 border-t border-slate-200/60 dark:border-white/5">
          <ThemeToggle />
          <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 bg-amber-50/80 dark:bg-amber-500/8 border border-amber-100 dark:border-amber-500/15">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">Demo Mode</p>
          </div>
        </div>
      </aside>

      {/* ── Mobile top bar ───────────────────────────────────────────────── */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 flex items-center justify-between px-4 h-14"
        style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', background: 'rgba(248,250,252,0.85)', borderBottom: '1px solid rgba(226,232,240,0.6)' }}>
        <div className="dark:[background:rgba(8,13,26,0.88)] dark:[border-bottom-color:rgba(255,255,255,0.05)] absolute inset-0 -z-10" />
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 6v4l3 3" />
            </svg>
          </div>
          <span className="text-[15px] font-bold tracking-tight"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            PocketPlan
          </span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle compact />
          <button
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/8 active:scale-95 transition-all duration-150"
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
          className="md:hidden fixed inset-0 z-20 bg-black/20 dark:bg-black/40"
          style={{ backdropFilter: 'blur(2px)' }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile fullscreen menu */}
      <div
        className={`md:hidden fixed top-14 inset-x-0 z-30 px-3 py-2 space-y-0.5 shadow-xl transition-all duration-250 ease-out ${
          mobileMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-3 pointer-events-none'
        }`}
        style={{ backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', background: 'rgba(248,250,252,0.95)', borderBottom: '1px solid rgba(226,232,240,0.6)' }}
      >
        {NAV_ITEMS.map((item) => (
          <button key={item.id} onClick={() => navigate(item.id)} className={navButtonClass(item.id)}>
            <NavIcon d={item.d} />
            {item.label}
          </button>
        ))}
        <div className="pt-2 pb-1 space-y-1 border-t border-slate-200/60 dark:border-white/5 mt-1">
          <ThemeToggle />
          <div className="flex items-center gap-2 rounded-xl px-3 py-2 bg-amber-50/80 dark:bg-amber-500/8">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">Demo Mode — all data is simulated</p>
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="flex-1 md:ml-[220px] pt-14 md:pt-0 min-h-screen relative z-10">
        <div
          className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8"
          style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}
        >
          {children}
        </div>
      </main>

      {/* ── Mobile bottom navigation ─────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 mobile-nav-blur"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-center justify-around px-2 py-1">
          {MOBILE_NAV_ITEMS.map((item) => {
            const active = currentPage === item.id
            return (
              <button key={item.id} onClick={() => navigate(item.id)} className={mobileNavClass(item.id)}>
                {active ? (
                  <div className="relative">
                    <div className="absolute inset-0 -m-1 rounded-full bg-indigo-100 dark:bg-indigo-500/15 blur-sm" />
                    <NavIcon d={item.d} size="sm" />
                  </div>
                ) : (
                  <NavIcon d={item.d} size="sm" />
                )}
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            )
          })}
          {/* More button for hidden pages */}
          <button
            onClick={() => setMobileMenuOpen((o) => !o)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 active:scale-95 ${
              mobileMenuOpen ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>
            </svg>
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

export type { Page }
