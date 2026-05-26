import { type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useThemeStore } from '../store/theme'
import { useNavVisibility } from '../hooks'

interface NavItem {
  path: string
  label: string
  d: string
}

// All 8 routes — shown in full on desktop sidebar.
const ALL_NAV: NavItem[] = [
  { path: '/dashboard',    label: 'Dashboard',    d: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10' },
  { path: '/transactions', label: 'Transactions', d: 'M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4' },
  { path: '/budgets',      label: 'Budgets',      d: 'M12 2a10 10 0 100 20A10 10 0 0012 2zm0 0v10l6 3' },
  { path: '/goals',        label: 'Goals',        d: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  { path: '/analytics',    label: 'Analytics',    d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { path: '/accounts',     label: 'Accounts',     d: 'M3 9a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zm0 0V7a2 2 0 012-2h2M16 5H8a2 2 0 00-2 2' },
  { path: '/investments',  label: 'Investments',  d: 'M3 17l4-8 4 4 4-6 4 3' },
  { path: '/settings',     label: 'Settings',     d: 'M12 15a3 3 0 100-6 3 3 0 000 6zm8.9-3a8.9 8.9 0 01-.1 1.4l2 1.6-2 3.5-2.4-.9a7 7 0 01-2.4 1.4L15.5 21h-4l-.5-2.1A7 7 0 018.6 17.5l-2.4.9-2-3.5 2-1.6A9 9 0 016.1 12a9 9 0 01.1-1.4l-2-1.6 2-3.5 2.4.9A7 7 0 0111 4.9L11.5 3h4l.5 2.1a7 7 0 012.4 1.4l2.4-.9 2 3.5-2 1.6c.1.5.1.9.1 1.3z' },
]

// Mobile bottom pill: the 5 most actionable routes.
const MOBILE_NAV: NavItem[] = ALL_NAV.filter((n) =>
  ['/dashboard', '/transactions', '/budgets', '/goals', '/analytics'].includes(n.path)
)

function NavIcon({ d }: { d: string }) {
  return (
    <svg className="w-[17px] h-[17px] shrink-0" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { preference, toggleTheme } = useThemeStore()
  const isDark =
    preference === 'dark' ||
    (preference === 'system' && typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className={`flex items-center gap-2 rounded-xl transition-all duration-200 active:scale-95
        text-slate-400 hover:text-slate-500 hover:bg-black/4
        dark:text-slate-500 dark:hover:text-slate-400 dark:hover:bg-white/5
        ${compact ? 'p-2' : 'px-3 py-2 text-xs font-medium w-full'}`}
    >
      {isDark ? (
        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
        </svg>
      )}
      {!compact && <span>{isDark ? 'Light mode' : 'Dark mode'}</span>}
    </button>
  )
}

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const navVisible = useNavVisibility()

  const sidebarLinkClass = ({ isActive }: { isActive: boolean }) =>
    `w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'nav-pill-active text-violet-700 dark:text-violet-300'
        : 'text-slate-500 hover:bg-black/4 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200 active:scale-[0.97]'
    }`

  const pillLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-200 active:scale-95 ${
      isActive
        ? 'nav-pill-active text-violet-600 dark:text-violet-400'
        : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
    }`

  return (
    <div className="min-h-screen flex transition-colors duration-300 relative">

      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col fixed z-20 transition-all duration-300"
        style={{ top: '16px', left: '16px', bottom: '16px', width: '224px' }}>
        <div className="sidebar-glass flex flex-col h-full overflow-hidden">

          {/* Logo */}
          <div className="px-5 pt-6 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.9), rgba(129,140,248,0.9))' }}>
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 6v4l3 3" />
                </svg>
              </div>
              <span className="text-[15px] font-bold tracking-tight leading-none"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                PocketPlan
              </span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto">
            {ALL_NAV.map((item) => (
              <NavLink key={item.path} to={item.path} className={sidebarLinkClass}>
                <NavIcon d={item.d} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="px-3 pb-5 pt-3 border-t border-white/40 dark:border-white/6">
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* ── Mobile top bar ──────────────────────────────────────────────── */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 flex items-end justify-between px-4 pb-3 mobile-topbar">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.9), rgba(129,140,248,0.9))' }}>
            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 6v4l3 3" />
            </svg>
          </div>
          <span className="text-[15px] font-bold tracking-tight"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            PocketPlan
          </span>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle compact />
          {/* Accounts icon */}
          <NavLink
            to="/accounts"
            aria-label="Accounts"
            className={({ isActive }) =>
              `p-2 rounded-xl transition-all duration-150 active:scale-95 ${
                isActive
                  ? 'text-violet-600 dark:text-violet-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/8'
              }`
            }
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zm0 0V7a2 2 0 012-2h2M16 5H8a2 2 0 00-2 2" />
            </svg>
          </NavLink>
          {/* Investments icon */}
          <NavLink
            to="/investments"
            aria-label="Investments"
            className={({ isActive }) =>
              `p-2 rounded-xl transition-all duration-150 active:scale-95 ${
                isActive
                  ? 'text-violet-600 dark:text-violet-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/8'
              }`
            }
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 17l4-8 4 4 4-6 4 3" />
            </svg>
          </NavLink>
          {/* Settings icon */}
          <button
            onClick={() => navigate('/settings')}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/8 active:scale-95 transition-all duration-150"
            aria-label="Settings"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 15a3 3 0 100-6 3 3 0 000 6zm8.9-3a8.9 8.9 0 01-.1 1.4l2 1.6-2 3.5-2.4-.9a7 7 0 01-2.4 1.4L15.5 21h-4l-.5-2.1A7 7 0 018.6 17.5l-2.4.9-2-3.5 2-1.6A9 9 0 016.1 12a9 9 0 01.1-1.4l-2-1.6 2-3.5 2.4.9A7 7 0 0111 4.9L11.5 3h4l.5 2.1a7 7 0 012.4 1.4l2.4-.9 2 3.5-2 1.6c.1.5.1.9.1 1.3z" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="flex-1 md:ml-[256px] mobile-main-pt min-h-screen relative z-10 w-full overflow-x-hidden">
        <div
          className="w-full max-w-5xl mx-auto py-6 sm:py-8"
          style={{
            paddingLeft:   'calc(1rem + var(--safe-left, 0px))',
            paddingRight:  'calc(1rem + var(--safe-right, 0px))',
            paddingBottom: 'calc(5.5rem + var(--safe-bottom, 0px))',
          }}
        >
          {children}
        </div>
      </main>

      {/* ── Mobile bottom pill nav ───────────────────────────────────────── */}
      <div
        className={`md:hidden fixed bottom-0 inset-x-0 z-30 flex justify-center pill-nav-container ${navVisible ? '' : 'pill-nav-hidden'}`}
        style={{ padding: '0 16px calc(12px + var(--safe-bottom, 0px))' }}
      >
        <nav className="pill-nav flex items-center gap-1 px-3 py-1.5">
          {MOBILE_NAV.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={pillLinkClass}
            >
              <NavIcon d={item.d} />
              <span className="text-[11px] font-medium tracking-tight">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
