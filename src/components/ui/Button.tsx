import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:   'text-white disabled:opacity-50',
  secondary: 'text-slate-600 dark:text-slate-200 disabled:opacity-50',
  danger:    'text-white disabled:opacity-50',
  ghost:     'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-50',
}

const VARIANT_STYLES: Record<Variant, React.CSSProperties> = {
  primary:   { background: 'rgba(109,40,217,0.85)', boxShadow: '0 2px 12px rgba(139,92,246,0.20)' },
  secondary: { background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(200,200,230,0.50)', boxShadow: '0 1px 4px rgba(139,92,246,0.06)' },
  danger:    { background: 'rgba(220,38,38,0.85)', boxShadow: '0 2px 12px rgba(239,68,68,0.20)' },
  ghost:     { background: 'transparent' },
}

const VARIANT_HOVER: Record<Variant, string> = {
  primary:   'hover:opacity-90',
  secondary: 'hover:bg-violet-50/50 dark:hover:bg-white/8',
  danger:    'hover:opacity-90',
  ghost:     'hover:bg-slate-100/70 dark:hover:bg-white/8',
}

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-xl',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-5 py-2.5 text-base rounded-2xl',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  style,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:ring-offset-2 dark:focus:ring-offset-transparent disabled:cursor-not-allowed active:scale-[0.97] ${VARIANT_CLASSES[variant]} ${VARIANT_HOVER[variant]} ${SIZE_CLASSES[size]} ${className}`}
      style={{ ...VARIANT_STYLES[variant], ...style }}
      {...props}
    >
      {children}
    </button>
  )
}
