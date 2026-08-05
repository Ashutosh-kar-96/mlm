import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { usePageTitle } from '../../hooks/usePageTitle'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import Input from '../../components/ui/Input'
import { Pagination, Table, THead, TRow, TCell } from '../../components/ui/Table'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import { adminApi } from '../../lib/api'

export default function AdminWithdrawals() {
  usePageTitle('Withdrawals', 'Approve or reject member payout requests')
  const [rows, setRows] = useState([])
  const [query, setQuery] = useState('')
  const [meta, setMeta] = useState({ page: 1, limit: 25, total: 0 })
  const toast = useToast()
  const { token } = useAuth()

  useEffect(() => {
    let alive = true
    adminApi.payouts(token, 'pending', { page: meta.page, limit: meta.limit, regno: query || undefined })
      .then((data) => {
        if (!alive) return
        setRows(data.items.map(toWithdrawalRow))
        setMeta(data.meta || { page: 1, limit: meta.limit, total: 0 })
      })
      .catch((error) => {
        toast.push(error.message, 'error')
        if (alive) setRows([])
      })
    return () => {
      alive = false
    }
  }, [meta.page, meta.limit, query, token, toast])

  const approve = async (row) => {
    try {
      await adminApi.distributePayouts(token, { ids: [row.rawId] })
      setRows((current) => current.filter((item) => item.id !== row.id))
      toast.push(`Request ${row.id} approved`, 'success')
    } catch (error) {
      toast.push(error.message, 'error')
    }
  }

  return (
    <Card className="p-6">
      <div className="mb-4 max-w-sm">
        <Input
          label="Search Regno"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setMeta((current) => ({ ...current, page: 1 }))
          }}
          placeholder="Enter member regno"
        />
      </div>
      <Table>
        <THead columns={['Request ID', 'Member', 'Date', 'Amount', 'Method', 'Status', 'Action']} />
        <tbody>
          {rows.map((w) => (
            <TRow key={w.id}>
              <TCell className="font-mono text-xs text-ink-400">{w.id}</TCell>
              <TCell className="font-medium text-ink-950">{w.user}</TCell>
              <TCell>{w.date}</TCell>
              <TCell className="font-mono">₹{w.amount.toLocaleString('en-IN')}</TCell>
              <TCell>{w.method}</TCell>
              <TCell>
                <Badge tone={w.status === 'Pending' ? 'gold' : w.status === 'Approved' ? 'success' : 'danger'}>
                  {w.status}
                </Badge>
              </TCell>
              <TCell>
                {w.status === 'Pending' ? (
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="gold" icon={Check} onClick={() => approve(w)}>
                      Approve
                    </Button>
                  </div>
                ) : (
                  <span className="text-xs text-ink-400">—</span>
                )}
              </TCell>
            </TRow>
          ))}
        </tbody>
      </Table>
      {!rows.length && (
        <p className="mt-4 rounded-xl border border-dashed border-ink-900/12 bg-ivory-100 p-6 text-center text-sm text-ink-400">
          No pending withdrawal requests
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

function toWithdrawalRow(payout) {
  return {
    id: `PO${payout.id}`,
    rawId: payout.id,
    user: payout.name,
    date: formatDate(payout.createdAt),
    amount: Number(payout.netAmount || payout.totalAmount || 0),
    method: payout.bankName || 'Bank Transfer',
    status: payout.status === 1 ? 'Approved' : 'Pending',
  }
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
