import { useEffect, useState } from 'react'
import { Check, X, FileText } from 'lucide-react'
import { usePageTitle } from '../../hooks/usePageTitle'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import { adminApi } from '../../lib/api'

export default function AdminKyc() {
  usePageTitle('KYC Queue', 'Review submitted identity documents')
  const [rows, setRows] = useState([])
  const toast = useToast()
  const { token } = useAuth()

  useEffect(() => {
    let alive = true
    adminApi.panByStatus(token, 'pending', { limit: 100 })
      .then((data) => {
        if (!alive) return
        setRows(data.items.map(toKycRow))
      })
      .catch((error) => {
        toast.push(error.message, 'error')
        if (alive) setRows([])
      })
    return () => {
      alive = false
    }
  }, [token, toast])

  const act = async (id, status) => {
    try {
      await adminApi.updatePanStatus(token, id, status === 'Rejected' ? 'Cancelled' : 'Verified')
      setRows((r) => r.filter((k) => k.id !== id))
      toast.push(`${id} marked ${status.toLowerCase()}`, status === 'Verified' ? 'success' : 'error')
    } catch (error) {
      toast.push(error.message, 'error')
    }
  }

  if (rows.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center gap-2 p-16 text-center">
        <FileText className="text-gold-400" size={32} />
        <p className="font-display text-lg text-ink-950">All caught up</p>
        <p className="text-sm text-ink-400">No pending KYC submissions right now.</p>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((k, i) => (
        <Card key={k.id} delay={i * 0.05} className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <Badge tone="gold">{k.id}</Badge>
            <span className="text-xs text-ink-400">{k.submitted}</span>
          </div>
          <p className="font-display text-lg font-semibold text-ink-950">{k.user}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-400">
            <FileText size={12} /> {k.doc}
          </p>
          <div className="mt-4 flex gap-2">
            <Button size="sm" variant="gold" icon={Check} onClick={() => act(k.id, 'Verified')} fullWidth>
              Verify
            </Button>
            <Button size="sm" variant="danger" icon={X} onClick={() => act(k.id, 'Rejected')} fullWidth>
              Reject
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}

function toKycRow(item) {
  const member = item.member || {}
  return {
    id: item.id,
    user: [member.firstName, member.lastName].filter(Boolean).join(' ') || member.regno,
    submitted: formatDate(member.doj),
    doc: item.panNo ? `PAN ${item.panNo}` : 'PAN pending',
    status: item.status,
  }
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
