import clsx from 'clsx'
import { motion } from 'framer-motion'

export default function Card({ children, className, hover = false, animate = true, delay = 0, ...props }) {
  const Comp = animate ? motion.div : 'div'
  const animProps = animate
    ? {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.35, delay, ease: 'easeOut' },
      }
    : {}
  return (
    <Comp
      className={clsx(
        'rounded-2xl border border-ink-900/8 bg-white/90 backdrop-blur-sm',
        hover && 'transition-shadow duration-200 hover:shadow-gold-glow',
        className
      )}
      {...animProps}
      {...props}
    >
      {children}
    </Comp>
  )
}
