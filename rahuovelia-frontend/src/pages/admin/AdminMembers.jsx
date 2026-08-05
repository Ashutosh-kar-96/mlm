import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, MoreVertical } from 'lucide-react'
import { usePageTitle } from '../../hooks/usePageTitle'
import Card from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Pagination, Table, THead, TRow, TCell } from '../../components/ui/Table'
import Avatar from '../../components/ui/Avatar'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import { adminApi } from '../../lib/api'

const kycTone = { Verified: 'success', Pending: 'gold', Rejected: 'danger' }

export default function AdminMembers() {
  usePageTitle('Members', 'Manage every Rahuovelia partner account')
  const [query, setQuery] = useState('')
  const [members, setMembers] = useState([])
  const [meta, setMeta] = useState({ page: 1, limit: 25, total: 0 })
  const { token } = useAuth()
  const toast = useToast()

  useEffect(() => {
    let alive = true
    adminApi.members(token, { page: meta.page, limit: meta.limit, q: query || undefined })
      .then((data) => {
        if (!alive) return
        setMembers(data.items.map(toMemberRow))
        setMeta(data.meta || { page: 1, limit: meta.limit, total: 0 })
      })
      .catch((error) => {
        toast.push(error.message, 'error')
        if (alive) setMembers([])
      })
    return () => {
      alive = false
    }
  }, [meta.page, meta.limit, query, token, toast])

  return (
    <Card className="p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="font-display text-xl font-semibold text-ink-950">All Members</h3>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            placeholder="Search by name or ID"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setMeta((current) => ({ ...current, page: 1 }))
            }}
            className="w-56 rounded-full border border-ink-900/10 bg-white py-2 pl-8 pr-3 text-xs outline-none focus:ring-2 focus:ring-gold-300/60"
          />
        </div>
      </div>
      <Table>
        <THead columns={['Member', 'ID', 'Rank', 'Status', 'KYC', '']} />
        <tbody>
          {members.map((u) => (
            <TRow key={u.id}>
              <TCell>
                <div className="flex items-center gap-2.5">
                  <Avatar name={u.name} size={30} />
                  <div>
                    <p className="font-medium text-ink-950">{u.name}</p>
                    <p className="text-xs text-ink-400">{u.email}</p>
                  </div>
                </div>
              </TCell>
              <TCell className="font-mono text-xs text-ink-400">
                <Link
                  to={`/admin/member-account/${u.id}`}
                  className="font-semibold text-gold-700 underline-offset-4 transition hover:text-ink-950 hover:underline"
                >
                  {u.id}
                </Link>
              </TCell>
              <TCell>{u.rank}</TCell>
              <TCell>
                <Badge tone={u.status === 'Active' ? 'success' : 'neutral'}>{u.status}</Badge>
              </TCell>
              <TCell>
                <Badge tone={kycTone[u.kyc]}>{u.kyc}</Badge>
              </TCell>
              <TCell>
                <button className="rounded-full p-1.5 text-ink-400 hover:bg-ink-900/5 hover:text-ink-900">
                  <MoreVertical size={16} />
                </button>
              </TCell>
            </TRow>
          ))}
        </tbody>
      </Table>
      {!members.length && (
        <p className="mt-4 rounded-xl border border-dashed border-ink-900/12 bg-ivory-100 p-6 text-center text-sm text-ink-400">
          No members found
        </p>
      )}
      <Pagination
        meta={meta}
        page={meta.page}
        limit={meta.limit}
        onPageChange={(page) => setMeta((current) => ({ ...current, page }))}
        onLimitChange={(limit) => setMeta({ page: 1, limit, total: meta.total })}
      />
    </Card>
  )
}

function toMemberRow(member) {
  return {
    id: member.regno,
    name: [member.firstName, member.lastName].filter(Boolean).join(' ') || member.username || member.regno,
    email: member.emailId || member.mobileNo || '-',
    rank: member.rank?.rankName || 'Member',
    status: member.status === 1 ? 'Active' : member.status === 2 ? 'Blocked' : 'Unpaid',
    kyc: member.panVerification?.status === 'Cancelled' ? 'Rejected' : member.panVerification?.status || 'Pending',
  }
}
