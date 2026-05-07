import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

interface CardHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`glass-card hover-lift ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between px-5 py-4 border-b border-white/50 dark:border-white/6">
      <div>
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="ml-4 shrink-0">{action}</div>}
    </div>
  )
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>
}
