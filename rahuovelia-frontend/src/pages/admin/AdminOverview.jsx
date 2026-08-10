import { useEffect, useState } from 'react'
import { Users, IndianRupee, ShieldAlert, UserCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePageTitle } from '../../hooks/usePageTitle'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Table, THead, TRow, TCell } from '../../components/ui/Table'
import UserGrowthChart from '../../components/charts/UserGrowthChart'
import { adminShortcuts } from '../../data/navLinks'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import { adminApi } from '../../lib/api'

const emptyStats = { totalUsers: 0, activeUsers: 0, totalBusiness: 0, currentBusiness: 0, pendingPan: 0 }
const emptyGrowth = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'].map((month) => ({ month, users: 0 }))

export default function AdminOverview() {
  usePageTitle('Admin Overview', 'Platform-wide performance & activity')
  const { token } = useAuth()
  const toast = useToast()
  const [dashboard, setDashboard] = useState(null)

  useEffect(() => {
    let alive = true
    adminApi.dashboard(token)
      .then((data) => {
        if (alive) setDashboard(data)
      })
      .catch((error) => {
        toast.push(error.message, 'error')
        if (alive) setDashboard(null)
      })
    return () => {
      alive = false
    }
  }, [token, toast])

  const stats = dashboard?.stats || emptyStats
  const memberGrowth = dashboard?.memberGrowth?.length ? dashboard.memberGrowth : emptyGrowth
  const recentMembers = dashboard?.recentMembers?.length
    ? dashboard.recentMembers.map((member) => ({
        id: member.regno,
        user: [member.firstName, member.lastName].filter(Boolean).join(' '),
        date: member.doj ? new Date(member.doj).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
        amount: Number(member.planAmount || 0),
        method: member.rank?.rankName || 'Member',
        status: member.status === 1 ? 'Active' : member.status === 2 ? 'Blocked' : 'Unpaid',
      }))
    : []

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total Users" value={stats.totalUsers} icon={Users} />
        <StatCard label="Active Users" value={stats.activeUsers} icon={UserCheck} delay={0.05} />
        <StatCard label="Total Business" value={Number(stats.totalBusiness || 0)} prefix="₹" icon={IndianRupee} delay={0.1} />
        <StatCard label="Current Business" value={Number(stats.currentBusiness || 0)} prefix="₹" icon={IndianRupee} delay={0.15} />
        <StatCard label="Pending KYC" value={stats.pendingPan ?? stats.pendingKyc} icon={ShieldAlert} delay={0.15} />
      </div>

      <Card className="p-6" delay={0.2}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-display text-xl font-semibold text-ink-950">Important Shortcuts</h3>
          <Badge tone="gold">{adminShortcuts.length} actions</Badge>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {adminShortcuts.map((shortcut) => (
            <Link
              key={shortcut.to}
              to={shortcut.to}
              className="group flex min-h-24 flex-col items-center justify-center gap-2 rounded-lg border border-ink-900/8 bg-ivory-100 px-3 text-center text-xs font-medium text-ink-600 transition hover:border-gold-400/50 hover:bg-gold-100/40 hover:text-ink-950"
            >
              <shortcut.icon size={24} strokeWidth={1.8} className="text-gold-600 transition group-hover:scale-105" />
              <span>{shortcut.label}</span>
            </Link>
          ))}
        </div>
      </Card>

      <Card className="p-6" delay={0.25}>
        <h3 className="mb-2 font-display text-xl font-semibold text-ink-950">Member Growth</h3>
        <UserGrowthChart data={memberGrowth} />
      </Card>

      <Card className="p-6" delay={0.3}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl font-semibold text-ink-950">Recent Members</h3>
          <Badge tone="gold">{recentMembers.length} records</Badge>
        </div>
        <Table>
          <THead columns={['Reg No.', 'Member', 'Joining Date', 'Plan Amount', 'Rank', 'Status']} />
          <tbody>
            {recentMembers.map((w) => (
              <TRow key={w.id}>
                <TCell className="font-mono text-xs text-ink-400">{w.id}</TCell>
                <TCell className="font-medium text-ink-950">{w.user}</TCell>
                <TCell>{w.date}</TCell>
                <TCell className="font-mono">₹{w.amount.toLocaleString('en-IN')}</TCell>
                <TCell>{w.method}</TCell>
                <TCell>
                  <Badge tone={w.status === 'Pending' ? 'gold' : 'success'}>{w.status}</Badge>
                </TCell>
              </TRow>
            ))}
          </tbody>
        </Table>
        {!recentMembers.length && (
          <p className="mt-4 rounded-xl border border-dashed border-ink-900/12 bg-ivory-100 p-6 text-center text-sm text-ink-400">
            No recent members found
          </p>
        )}
      </Card>
    </div>
  )
}
