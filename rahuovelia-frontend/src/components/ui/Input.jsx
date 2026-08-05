import { forwardRef, useState } from 'react'
import clsx from 'clsx'
import { Eye, EyeOff } from 'lucide-react'

const Input = forwardRef(function Input(
  { label, icon: Icon, error, type = 'text', className, containerClassName, ...props },
  ref
) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  const resolvedType = isPassword ? (show ? 'text' : 'password') : type

  return (
    <label className={clsx('block', containerClassName)}>
      {label && (
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-400">
          {label}
        </span>
      )}
      <span className="relative flex items-center">
        {Icon && (
          <Icon size={16} strokeWidth={1.8} className="absolute left-3.5 text-ink-400 pointer-events-none" />
        )}
        <input
          ref={ref}
          type={resolvedType}
          className={clsx(
            'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400/70',
            'outline-none transition-shadow duration-150 focus:ring-2 focus:ring-gold-300/60 focus:border-gold-400',
            Icon && 'pl-10',
            isPassword && 'pr-10',
            error ? 'border-rose-mlm/60' : 'border-ink-900/12',
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShow((s) => !s)}
            className="absolute right-3.5 text-ink-400 hover:text-ink-700"
          >
            {show ? <EyeOff size={16} strokeWidth={1.8} /> : <Eye size={16} strokeWidth={1.8} />}
          </button>
        )}
      </span>
      {error && <span className="mt-1 block text-xs text-rose-mlm">{error}</span>}
    </label>
  )
})

export default Input
