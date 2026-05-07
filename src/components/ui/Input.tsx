import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export default function Input({ label, error, hint, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-600 dark:text-slate-300">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400/70 dark:placeholder-slate-500 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-violet-400/40 ${
          error
            ? 'border border-rose-300 dark:border-rose-500/40 bg-rose-50/60 dark:bg-rose-500/6'
            : ''
        } ${className}`}
        style={error ? {} : {
          background: 'rgba(255,255,255,0.55)',
          border: '1px solid rgba(200,200,230,0.45)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
        {...props}
      />
      {error && <p className="text-xs text-rose-500 dark:text-rose-400">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
    </div>
  )
}
