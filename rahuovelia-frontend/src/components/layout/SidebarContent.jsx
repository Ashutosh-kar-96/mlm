/*  */import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { ChevronDown, Crown, LogOut } from 'lucide-react'
import logo from '../../assets/logo.jpeg'
import { useAuth } from '../../context/AuthContext'
import { userLinks, adminLinks } from '../../data/navLinks'

function SidebarNavItem({ link, layoutIdPrefix }) {
  const location = useLocation()
  const hasChildren = Boolean(link.children?.length)
  const childIsActive = hasChildren && link.children.some((child) => location.pathname === child.to)
  const [open, setOpen] = useState(childIsActive)

  useEffect(() => {
    if (childIsActive) setOpen(true)
  }, [childIsActive])

  if (hasChildren) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className={clsx(
            'group relative flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-left text-sm font-medium transition-colors',
            childIsActive ? 'text-gold-100' : 'text-ink-400 hover:text-gold-100'
          )}
        >
          {childIsActive && (
            <motion.span
              layoutId={layoutIdPrefix}
              className="absolute inset-0 rounded-lg bg-gradient-to-r from-gold-500/15 to-transparent ring-1 ring-gold-400/25"
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            />
          )}
          <link.icon size={17} strokeWidth={1.8} className="relative z-10 shrink-0" />
          <span className="relative z-10 min-w-0 flex-1 truncate">{link.label}</span>
          <ChevronDown
            size={14}
            strokeWidth={1.8}
            className={clsx('relative z-10 shrink-0 transition-transform', open && 'rotate-180')}
          />
        </button>

        {open && (
          <div className="ml-5 mt-1 space-y-1 border-l border-gold-400/15 pl-2">
            {link.children.map((child) => (
              child.disabled ? (
                <button
                  key={child.to || child.label}
                  type="button"
                  disabled
                  title="Disabled for now"
                  className="flex w-full cursor-not-allowed items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-ink-500 opacity-50"
                >
                  <child.icon size={14} strokeWidth={1.8} className="shrink-0" />
                  <span className="min-w-0 truncate">{child.label}</span>
                </button>
              ) : (
                <NavLink
                  key={child.to}
                  to={child.to}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                      isActive ? 'bg-gold-500/10 text-gold-100' : 'text-ink-400 hover:bg-white/[0.03] hover:text-gold-100'
                    )
                  }
                >
                  <child.icon size={14} strokeWidth={1.8} className="shrink-0" />
                  <span className="min-w-0 truncate">{child.label}</span>
                </NavLink>
              )
            ))}
          </div>
        )}
      </div>
    )
  }

  if (link.disabled) {
    return (
      <button
        type="button"
        disabled
        title="Disabled for now"
        className="group relative flex w-full cursor-not-allowed items-center gap-3 rounded-lg px-3.5 py-2.5 text-left text-sm font-medium text-ink-500 opacity-50"
      >
        <link.icon size={17} strokeWidth={1.8} className="relative z-10 shrink-0" />
        <span className="relative z-10 min-w-0 truncate">{link.label}</span>
      </button>
    )
  }

  return (
    <NavLink
      to={link.to}
      end={link.to === '/dashboard' || link.to === '/admin'}
      className={({ isActive }) =>
        clsx(
          'group relative flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors',
          isActive ? 'text-gold-100' : 'text-ink-400 hover:text-gold-100'
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId={layoutIdPrefix}
              className="absolute inset-0 rounded-lg bg-gradient-to-r from-gold-500/15 to-transparent ring-1 ring-gold-400/25"
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            />
          )}
          <link.icon size={17} strokeWidth={1.8} className="relative z-10 shrink-0" />
          <span className="relative z-10 min-w-0 truncate">{link.label}</span>
        </>
      )}
    </NavLink>
  )
}

export default function SidebarContent({ layoutIdPrefix = 'sidebar' }) {
  const { role, logout, user } = useAuth()
  const links = role === 'admin' ? adminLinks : userLinks

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-6 py-6">
        <img src={logo} alt="Rahuovelia" className="h-10 w-10 rounded-full object-cover ring-1 ring-gold-400/40" />
        <div>
          <p className="font-display text-lg font-semibold leading-tight text-gold-100">Rahuovelia</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gold-500/70">
            {role === 'admin' ? 'Admin Console' : 'Fashion Retail'}
          </p>
        </div>
      </div>

      <div className="crown-divider px-6">
        <Crown size={12} className="text-gold-500" />
      </div>

      <nav className="mt-6 flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {links.map((link) => (
          <SidebarNavItem key={link.to || link.label} link={link} layoutIdPrefix={layoutIdPrefix} />
        ))}
      </nav>

      <div className="mx-3 mb-4 rounded-xl border border-gold-400/15 bg-white/[0.03] p-3.5">
        <p className="truncate text-sm font-medium text-gold-100">{user?.name}</p>
        <p className="truncate text-xs text-ink-400">{user?.id}</p>
        <button
          onClick={logout}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-gold-400/20 py-2 text-xs font-medium text-gold-300 transition-colors hover:bg-gold-400/10"
        >
          <LogOut size={13} /> Sign out
        </button>
      </div>
    </div>
  )
}
