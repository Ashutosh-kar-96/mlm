import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet, TrendingUp, Users, Award, ShoppingCart, User, CalendarDays, Newspaper } from 'lucide-react'
import { usePageTitle } from '../../hooks/usePageTitle'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { Badge, RankBadge } from '../../components/ui/Badge'
import EarningsAreaChart from '../../components/charts/EarningsAreaChart'
import EarningsDonut from '../../components/charts/EarningsDonut'
import { Table, THead, TRow, TCell } from '../../components/ui/Table'
import { currentUser } from '../../data/mockData'
import { useAuth } from '../../context/AuthContext'
import { memberApi } from '../../lib/api'

const emptyMonthlyEarnings = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'].map((month) => ({ month, earnings: 0 }))
const emptyEarningsBreakdown = [
  { label: 'Direct Differential', value: 0, tone: 'gold' },
  { label: 'Rank Differential', value: 0, tone: 'emerald' },
  { label: 'GPG Differential', value: 0, tone: 'rose' },
  { label: 'Other Income', value: 0, tone: 'ink' },
]

export default function Overview() {
  usePageTitle('Overview', 'Your Rahuovelia business at a glance')
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState(null)
  const apiUser = dashboard?.user || {}
  const profile = { ...currentUser, ...user, ...apiUser, id: apiUser.regno || user?.id || currentUser.id }
  const stats = dashboard?.stats || {}
  const monthlyEarnings = dashboard?.monthlyEarnings?.length ? dashboard.monthlyEarnings : emptyMonthlyEarnings
  const earningsBreakdown = dashboard?.earningsBreakdown?.length ? dashboard.earningsBreakdown : emptyEarningsBreakdown
  const topDirectMembers = dashboard?.topDirectMembers || []
  const liveReferrals = dashboard?.recentReferrals
    ? dashboard.recentReferrals.map((item) => ({
        id: item.regno || item.id,
        name: item.name,
        joined: formatDate(item.joined),
        status: item.status === 1 ? 'Active' : item.status === 2 ? 'Blocked' : 'Unpaid',
        earnings: Number(item.totalEarnings || 0),
      }))
    : []

  useEffect(() => {
    let alive = true
    memberApi.dashboard(token)
      .then((data) => {
        if (alive) setDashboard(data)
      })
      .catch(() => {
        if (alive) setDashboard(null)
      })
    return () => {
      alive = false
    }
  }, [token])

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <Card className="relative overflow-hidden bg-ink-950 p-6 lg:p-8" hover={false}>
        <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold-500/70">Welcome back</p>
            <h2 className="mt-1 font-display text-3xl font-semibold text-gold-100">{profile.name}</h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <RankBadge rank={profile.rank} />
              <Badge tone={profile.kyc === 'Verified' ? 'success' : 'gold'}>KYC {profile.kyc}</Badge>
            </div>
          </div>
          <Button variant="gold" size="lg" onClick={() => navigate('/dashboard/register-member')}>
            Invite a Member
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Wallet Balance" value={stats.walletBalance ?? 0} prefix="₹" icon={Wallet} delay={0.05} />
        <StatCard label="Total Earnings" value={stats.totalEarnings ?? 0} prefix="₹" icon={TrendingUp} delta={stats.earningsGrowth ?? 0} delay={0.1} />
        <StatCard label="Direct Team" value={stats.directTeam ?? liveReferrals.length} icon={Users} delta={stats.directTeamGrowth ?? 0} delay={0.15} />
        <StatCard label="Current Rank" value={stats.currentRank || profile.rank} icon={Award} mono={false} delay={0.2} />
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="relative overflow-hidden bg-ivory-100 p-6 lg:col-span-2" delay={0.18}>
          <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full border-[18px] border-gold-400/25" />
          <p className="text-xs uppercase tracking-[0.2em] text-gold-700">Top 5 Seller This Month</p>
          <div className="relative mt-5 flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-300 to-gold-600 text-ink-950 shadow-gold-glow">
              <Award size={42} />
            </div>
            <div>
              <h3 className="font-display text-3xl font-semibold text-ink-950">{stats.currentRank || profile.rank}</h3>
              <p className="text-sm text-ink-400">Current business rank</p>
            </div>
          </div>
        </Card>
        <Card className="p-6" delay={0.2}>
          <ShoppingCart size={30} className="text-gold-600" />
          <p className="mt-4 text-xs text-ink-400">My PV</p>
          <p className="font-mono text-xl font-semibold text-ink-950">{Number(stats.myPv || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <div className="mt-4 h-1 rounded-full bg-gold-300" />
        </Card>
        <Card className="p-6" delay={0.22}>
          <Users size={30} className="text-emerald-mlm" />
          <p className="mt-4 text-xs text-ink-400">Total Team PV</p>
          <p className="font-mono text-xl font-semibold text-ink-950">{Number(stats.totalTeamPv || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <div className="mt-4 h-1 rounded-full bg-emerald-mlm" />
        </Card>
      </div>

      <Card className="overflow-hidden p-0" delay={0.24}>
        <div className="bg-gradient-to-r from-ink-950 to-gold-700 px-5 py-3 text-gold-100">
          <h3 className="font-display text-xl font-semibold">Your Top Advify Marquies Detail</h3>
        </div>
        <div className="p-5">
          <Table>
            <THead columns={['Regno', 'Name', 'Mobile No.', 'Rank', 'Status']} />
            <tbody>
              {topDirectMembers.length ? topDirectMembers.map((member) => (
                <TRow key={member.regno || member.id}>
                  <TCell className="font-mono text-xs text-ink-400">{member.regno || member.id}</TCell>
                  <TCell className="font-medium text-ink-950">{member.name}</TCell>
                  <TCell>{member.mobile || '-'}</TCell>
                  <TCell>{member.rank || 'Member'}</TCell>
                  <TCell>
                    <Badge tone="success">₹{Number(member.monthlyBusiness || 0).toLocaleString('en-IN')}</Badge>
                  </TCell>
                </TRow>
              )) : (
                <TRow>
                  <TCell colSpan={5} className="text-center text-ink-400">No seller activity this month</TCell>
                </TRow>
              )}
            </tbody>
          </Table>
        </div>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2" delay={0.25}>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-display text-xl font-semibold text-ink-950">Earnings Trend</h3>
            <Badge tone="gold">Last 7 months</Badge>
          </div>
          <EarningsAreaChart data={monthlyEarnings} />
        </Card>

        <Card className="p-6" delay={0.3}>
          <h3 className="mb-2 font-display text-xl font-semibold text-ink-950">Earnings Breakdown</h3>
          <EarningsDonut data={earningsBreakdown} />
          <div className="mt-4 space-y-2">
            {earningsBreakdown.map((e) => (
              <div key={e.label} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-ink-600">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: { gold: '#c19a2e', emerald: '#4c8d6d', rose: '#b1523f', ink: '#211f24' }[e.tone],
                    }}
                  />
                  {e.label}
                </span>
                <span className="font-mono font-medium text-ink-900">₹{e.value.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent referrals */}
      <Card className="p-6" delay={0.35}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl font-semibold text-ink-950">Recent Referrals</h3>
          <Button variant="ghost" size="sm">
            View all
          </Button>
        </div>
        <Table>
          <THead columns={['Member', 'ID', 'Joined', 'Status', 'Earnings']} />
          <tbody>
            {liveReferrals.slice(0, 5).map((r) => (
              <TRow key={r.id}>
                <TCell className="font-medium text-ink-950">{r.name}</TCell>
                <TCell className="font-mono text-xs text-ink-400">{r.id}</TCell>
                <TCell>{r.joined}</TCell>
                <TCell>
                  <Badge tone={r.status === 'Active' ? 'success' : 'neutral'}>{r.status}</Badge>
                </TCell>
                <TCell className="font-mono">₹{r.earnings.toLocaleString('en-IN')}</TCell>
              </TRow>
            ))}
          </tbody>
        </Table>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden p-0" delay={0.38}>
          <div className="bg-gradient-to-r from-ink-950 to-emerald-mlm px-5 py-3">
            <h3 className="font-display text-xl font-semibold text-gold-100">Welcome To {profile.name}</h3>
          </div>
          <div className="divide-y divide-ink-900/8">
            {[
              [User, 'Registration ID', profile.id],
              [Users, 'Sponsor ID', profile.sponsor || 'Direct'],
              [CalendarDays, 'Date Of Joining', formatDate(profile.joined)],
            ].map(([Icon, label, value]) => (
              <div key={label} className="flex items-center gap-4 px-5 py-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-100 text-gold-700">
                  <Icon size={17} />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wide text-ink-400">{label}</p>
                  <p className="text-sm font-medium text-ink-950">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="overflow-hidden p-0" delay={0.4}>
          <div className="bg-gradient-to-r from-gold-600 to-rose-mlm px-5 py-3">
            <h3 className="font-display text-xl font-semibold text-white">Current News</h3>
          </div>
          <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
            <Newspaper size={34} className="text-gold-600" />
            <p className="mt-3 text-sm font-medium text-ink-950">
              {dashboard?.announcements?.[0]?.message || 'No current announcement'}
            </p>
            <p className="mt-1 text-xs text-ink-400">Admin messages will appear here.</p>
          </div>
        </Card>
      </div>
    </div>
  )
}

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
