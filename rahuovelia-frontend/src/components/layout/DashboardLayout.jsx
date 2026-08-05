import { useMemo, useState } from 'react'
import { Outlet, useOutletContext } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import Sidebar from './Sidebar'
import MobileSidebarContent from './MobileSidebarContent'
import Topbar from './Topbar'

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [pageMeta, setPageMeta] = useState({ title: '', subtitle: '' })
  const outletContext = useMemo(() => ({ setPageMeta }), [])

  return (
    <div className="min-h-screen bg-ivory-50">
      <Sidebar />

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-ink-950/60 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 z-50 h-screen w-64 bg-ink-950 lg:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-4 rounded-full p-1.5 text-gold-200 hover:bg-white/5"
              >
                <X size={18} />
              </button>
              <MobileSidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        <Topbar title={pageMeta.title} subtitle={pageMeta.subtitle} onMenuClick={() => setMobileOpen(true)} />
        <main className="px-5 py-6 lg:px-8">
          <Outlet context={outletContext} />
        </main>
      </div>
    </div>
  )
}

export const usePageMeta = () => useOutletContext()
