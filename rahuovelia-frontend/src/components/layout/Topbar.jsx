import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, CheckCircle2, Clock, CreditCard, IndianRupee, Menu, Search, ShieldAlert, Users } from 'lucide-react'
import Avatar from '../ui/Avatar'
import { useAuth } from '../../context/AuthContext'
import { adminApi, memberApi } from '../../lib/api'

export default function Topbar({ title, subtitle, onMenuClick }) {
  const { role, token, user } = useAuth()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    if (!token) {
      setNotifications([])
      return
    }

    let alive = true
    const load = role === 'admin' ? adminApi.dashboard(token) : memberApi.dashboard(token)

    load
      .then((data) => {
        if (!alive) return
        setNotifications(role === 'admin' ? adminNotifications(data) : memberNotifications(data))
      })
      .catch(() => {
        if (alive) setNotifications([])
      })

    return () => {
      alive = false
    }
  }, [role, token])

  const unreadCount = notifications.length
  const previewNotifications = useMemo(() => notifications.slice(0, 6), [notifications])

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-ink-900/8 bg-ivory-50/80 px-5 py-4 backdrop-blur-md lg:px-8">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="rounded-lg p-2 text-ink-700 hover:bg-ink-900/5 lg:hidden">
          <Menu size={20} />
        </button>
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-950">{title}</h1>
          {subtitle && <p className="text-xs text-ink-400">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            placeholder="Search members, IDs..."
            className="w-56 rounded-full border border-ink-900/10 bg-white py-2 pl-9 pr-3 text-xs outline-none transition-shadow focus:ring-2 focus:ring-gold-300/60"
          />
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="relative rounded-full p-2 text-ink-700 hover:bg-ink-900/5"
            aria-label="Open notifications"
          >
            <Bell size={18} strokeWidth={1.8} />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-mlm px-1 text-[10px] font-semibold leading-none text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 top-12 z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-ink-900/10 bg-white shadow-2xl shadow-ink-950/10">
              <div className="flex items-center justify-between border-b border-ink-900/8 px-4 py-3">
                <div>
                  <p className="font-display text-lg font-semibold text-ink-950">Notifications</p>
                  <p className="text-xs text-ink-400">{role === 'admin' ? 'Admin alerts' : 'Member updates'}</p>
                </div>
                <span className="rounded-full bg-gold-100 px-2.5 py-1 text-xs font-semibold text-gold-700">
                  {unreadCount}
                </span>
              </div>

              <div className="max-h-96 overflow-y-auto p-2">
                {previewNotifications.length ? (
                  previewNotifications.map((item) => (
                    <Link
                      key={item.id}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className="flex gap-3 rounded-lg px-3 py-3 transition hover:bg-ivory-100"
                    >
                      <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg ${item.tone}`}>
                        <item.icon size={16} strokeWidth={1.8} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-ink-900">{item.title}</span>
                        <span className="mt-0.5 block text-xs leading-5 text-ink-500">{item.description}</span>
                      </span>
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center">
                    <CheckCircle2 className="mx-auto text-emerald-mlm" size={28} strokeWidth={1.8} />
                    <p className="mt-3 text-sm font-semibold text-ink-900">All clear</p>
                    <p className="mt-1 text-xs text-ink-400">No urgent MLM updates right now.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <Avatar name={user?.name || 'U'} ring />
      </div>
    </header>
  )
}

function adminNotifications(data) {
  const stats = data?.stats || {}
  const recentMembers = data?.recentMembers || []
  const items = []

  if (Number(stats.pendingPan || 0) > 0) {
    items.push({
      id: 'admin-pan',
      icon: CreditCard,
      tone: 'bg-gold-100 text-gold-700',
      title: `${stats.pendingPan} PAN/KYC pending`,
      description: 'Review member PAN submissions waiting for approval.',
      to: '/admin/pan-card/unverified',
    })
  }

  if (Number(stats.pendingPayouts || 0) > 0) {
    items.push({
      id: 'admin-payouts',
      icon: IndianRupee,
      tone: 'bg-emerald-50 text-emerald-700',
      title: `${stats.pendingPayouts} payout requests`,
      description: 'Check withdrawal requests before payout distribution.',
      to: '/admin/withdrawals',
    })
  }

  if (Number(stats.unpaidUsers || 0) > 0) {
    items.push({
      id: 'admin-unpaid',
      icon: Users,
      tone: 'bg-amber-50 text-amber-700',
      title: `${stats.unpaidUsers} unpaid members`,
      description: 'Members registered but not activated yet.',
      to: '/admin/members/unpaid',
    })
  }

  recentMembers.slice(0, 3).forEach((member) => {
    items.push({
      id: `member-${member.regno}`,
      icon: Clock,
      tone: 'bg-ivory-100 text-ink-700',
      title: `New member ${member.regno}`,
      description: [member.firstName, member.lastName].filter(Boolean).join(' ') || 'Recently joined member',
      to: `/admin/member-account/${member.regno}`,
    })
  })

  return items
}

function memberNotifications(data) {
  const stats = data?.stats || {}
  const user = data?.user || {}
  const announcements = data?.announcements || []
  const items = []

  if (user.kyc !== 'Verified') {
    items.push({
      id: 'member-kyc',
      icon: ShieldAlert,
      tone: 'bg-gold-100 text-gold-700',
      title: 'KYC verification pending',
      description: 'Upload or wait for PAN/KYC approval to keep payout access smooth.',
      to: '/dashboard/kyc/pan',
    })
  }

  if (Number(stats.pendingWithdrawal || 0) > 0) {
    items.push({
      id: 'member-withdrawal',
      icon: IndianRupee,
      tone: 'bg-emerald-50 text-emerald-700',
      title: 'Withdrawal request pending',
      description: `Rs ${Number(stats.pendingWithdrawal).toLocaleString('en-IN')} is waiting for admin processing.`,
      to: '/dashboard/withdrawals',
    })
  }

  if (Number(stats.directTeam || 0) > 0) {
    items.push({
      id: 'member-team',
      icon: Users,
      tone: 'bg-ivory-100 text-ink-700',
      title: `${stats.directTeam} direct team members`,
      description: 'Open your network to track sponsor and downline activity.',
      to: '/dashboard/network',
    })
  }

  announcements.slice(0, 3).forEach((announcement) => {
    items.push({
      id: `announcement-${announcement.id}`,
      icon: Bell,
      tone: 'bg-gold-100 text-gold-700',
      title: 'Admin announcement',
      description: announcement.message,
      to: '/dashboard',
    })
  })

  return items
}
