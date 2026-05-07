import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  glass?: boolean
  glow?: 'indigo' | 'emerald' | 'red' | 'none'
}

interface CardHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
}

export default function Card({ children, className = '', glass = false, glow = 'none' }: CardProps) {
  const glowClass = glow === 'indigo' ? 'shadow-glow-indigo' : glow === 'emerald' ? 'shadow-glow-emerald' : glow === 'red' ? 'shadow-glow-red' : ''
  const baseClass = glass
    ? `glass-card ${glowClass}`
    : `bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-white/6 shadow-card transition-colors duration-200 ${glowClass}`

  return (
    <div className={`${baseClass} ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between px-5 py-4 border-b border-slate-100/80 dark:border-white/5">
      <div>
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="ml-4 shrink-0">{action}</div>}
    </div>
  )
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>
}
