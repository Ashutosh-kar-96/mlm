import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

export default function Modal({ open, onClose, title, children, footer, maxWidth = 'max-w-md' }) {
  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`relative flex max-h-[92vh] w-full ${maxWidth} flex-col overflow-hidden rounded-2xl border border-gold-300/30 bg-white shadow-2xl`}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-ink-900/8 px-6 py-4">
              <h3 className="font-display text-2xl font-semibold text-ink-950">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-ink-400 transition-colors hover:bg-ink-900/5 hover:text-ink-900"
              >
                <X size={18} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer && <div className="flex shrink-0 justify-end gap-3 border-t border-ink-900/8 bg-white px-6 py-4">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
