import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Layout from './components/Layout'
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

const PAGE_VARIANTS = {
  initial:  { opacity: 0, y: 12 },
  animate:  { opacity: 1, y: 0  },
  exit:     { opacity: 0, y: -8 },
}

const PAGE_TRANSITION = {
  duration: 0.2,
  ease: 'easeOut' as const,
}

function AnimatedPage({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={PAGE_VARIANTS}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={PAGE_TRANSITION}
    >
      {children}
    </motion.div>
  )
}

function AppRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard"    element={<AnimatedPage><Dashboard /></AnimatedPage>} />
        <Route path="/transactions" element={<AnimatedPage><Transactions /></AnimatedPage>} />
        <Route path="/budgets"      element={<AnimatedPage><Budgets /></AnimatedPage>} />
        <Route path="/goals"        element={<AnimatedPage><Goals /></AnimatedPage>} />
        <Route path="/accounts"     element={<AnimatedPage><Accounts /></AnimatedPage>} />
        <Route path="/investments"  element={<AnimatedPage><Investments /></AnimatedPage>} />
        <Route path="/analytics"    element={<AnimatedPage><Analytics /></AnimatedPage>} />
        <Route path="/settings"     element={<AnimatedPage><Settings /></AnimatedPage>} />
        <Route path="*"             element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  // Subscribe at root so formatters re-run when settings change.
  useSettingsStore()

  return (
    <>
      <div className="app-bg" aria-hidden="true" />
      <Layout>
        <AppRoutes />
        <ToastContainer />
      </Layout>
    </>
  )
}
