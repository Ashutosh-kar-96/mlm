import { motion } from 'framer-motion'
import logo from '../../assets/logo.jpeg'

export function PageLoader() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-ink-950">
      <motion.img
        src={logo}
        alt="Rahuovelia"
        className="h-16 w-16 rounded-full object-cover ring-2 ring-gold-400/50"
        animate={{ scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <span className="font-display text-lg tracking-[0.2em] text-gold-200">RAHUOVELIA</span>
    </div>
  )
}

export function Spinner({ size = 16, className = '' }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-gold-300 border-t-transparent ${className}`}
      style={{ width: size, height: size }}
    />
  )
}
