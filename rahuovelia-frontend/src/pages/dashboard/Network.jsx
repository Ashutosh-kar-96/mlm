import { useEffect, useState } from 'react'
import { Copy, Check, Share2 } from 'lucide-react'
import { usePageTitle } from '../../hooks/usePageTitle'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Table, THead, TRow, TCell } from '../../components/ui/Table'
import TreeNode from '../../components/charts/TreeNode'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import { memberApi } from '../../lib/api'

export default function Network() {
  usePageTitle('My Network', 'Your referral tree and direct team')
  const [copied, setCopied] = useState(false)
  const [network, setNetwork] = useState(null)
  const toast = useToast()
  const { token, user } = useAuth()
  const referralLink = `${window.location.origin}${network?.referralLink || `/register?ref=${user?.id || ''}`}`
  const directMembers = network?.directMembers
    ? network.directMembers.map((item) => ({
        id: item.regno || item.id,
        name: item.name,
        joined: formatDate(item.joined),
        status: item.status === 1 ? 'Active' : item.status === 2 ? 'Blocked' : 'Unpaid',
        earnings: 0,
      }))
    : []

  useEffect(() => {
    let alive = true
    memberApi.network(token)
      .then((data) => {
        if (alive) setNetwork(data)
      })
      .catch(() => {
        if (alive) setNetwork(null)
      })
    return () => {
      alive = false
    }
  }, [token])

  const handleCopy = () => {
    navigator.clipboard?.writeText(referralLink)
    setCopied(true)
    toast.push('Referral link copied', 'success')
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="space-y-6">
      <Card className="flex flex-col items-center justify-between gap-4 p-5 sm:flex-row" hover={false}>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Your referral link</p>
          <p className="font-mono text-sm text-ink-900">{referralLink}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={copied ? Check : Copy} onClick={handleCopy}>
            {copied ? 'Copied' : 'Copy link'}
          </Button>
          <Button variant="gold" size="sm" icon={Share2}>
            Share
          </Button>
        </div>
      </Card>

      <Card className="overflow-x-auto p-6" delay={0.1}>
        <h3 className="mb-6 font-display text-xl font-semibold text-ink-950">Network Tree</h3>
        {network?.tree ? (
          <div className="flex min-w-max justify-center pb-4">
            <TreeNode node={network.tree} />
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-ink-900/12 bg-ivory-100 p-6 text-center text-sm text-ink-400">
            No network tree found
          </p>
        )}
      </Card>

      <Card className="p-6" delay={0.15}>
        <h3 className="mb-4 font-display text-xl font-semibold text-ink-950">Direct Referrals</h3>
        <Table>
          <THead columns={['Member', 'ID', 'Joined', 'Status', 'Earnings']} />
          <tbody>
            {directMembers.map((r) => (
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
        {!directMembers.length && (
          <p className="mt-4 rounded-xl border border-dashed border-ink-900/12 bg-ivory-100 p-6 text-center text-sm text-ink-400">
            No direct referrals found
          </p>
        )}
      </Card>
    </div>
  )
}

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
