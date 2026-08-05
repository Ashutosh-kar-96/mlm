import { motion } from 'framer-motion'
import clsx from 'clsx'

const variants = {
  primary:
    'bg-ink-950 text-gold-200 border border-ink-950 hover:bg-ink-800 hover:text-gold-100 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset]',
  gold:
    'bg-gradient-to-b from-gold-300 to-gold-500 text-ink-950 border border-gold-600/40 hover:from-gold-200 hover:to-gold-400 shadow-gold-glow',
  outline:
    'bg-transparent text-ink-900 border border-ink-900/15 hover:border-gold-400 hover:text-gold-700',
  ghost:
    'bg-transparent text-ink-700 border border-transparent hover:bg-ink-900/5',
  danger:
    'bg-rose-mlm/10 text-rose-mlm border border-rose-mlm/30 hover:bg-rose-mlm/15',
}

const sizes = {
  sm: 'text-xs px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2.5 gap-2',
  lg: 'text-sm px-6 py-3.5 gap-2',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  disabled = false,
  fullWidth = false,
  className,
  ...props
}) {
  return (
    <motion.button
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      whileHover={{ y: disabled || loading ? 0 : -1 }}
      transition={{ duration: 0.15 }}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center rounded-lg font-medium tracking-wide transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed select-none',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : Icon ? (
        <Icon size={16} strokeWidth={1.8} />
      ) : null}
      {children}
      {!loading && IconRight && <IconRight size={16} strokeWidth={1.8} />}
    </motion.button>
  )
}
