import { useEffect, useState } from 'react'
import { usePageTitle } from '../../hooks/usePageTitle'
import Card from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Table, THead, TRow, TCell } from '../../components/ui/Table'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import { memberApi } from '../../lib/api'

const toneFor = { Pending: 'gold', Approved: 'success', Rejected: 'danger' }

export default function Withdrawals() {
  usePageTitle('Withdrawals', 'History and status of your payout requests')
  const [rows, setRows] = useState([])
  const { token } = useAuth()
  const toast = useToast()

  useEffect(() => {
    let alive = true
    memberApi.payouts(token)
      .then((data) => {
        if (alive) setRows(data.items.map(toWithdrawalRow))
      })
      .catch((error) => {
        toast.push(error.message, 'error')
        if (alive) setRows([])
      })
    return () => {
      alive = false
    }
  }, [token, toast])

  return (
    <Card className="p-6">
      <Table>
        <THead columns={['Request ID', 'Date', 'Amount', 'Method', 'Status']} />
        <tbody>
          {rows.map((w) => (
            <TRow key={w.id}>
              <TCell className="font-mono text-xs text-ink-400">{w.id}</TCell>
              <TCell>{w.date}</TCell>
              <TCell className="font-mono font-medium">₹{Number(w.amount || 0).toLocaleString('en-IN')}</TCell>
              <TCell>{w.method}</TCell>
              <TCell>
                <Badge tone={toneFor[w.status]}>{w.status}</Badge>
              </TCell>
            </TRow>
          ))}
        </tbody>
      </Table>
      {!rows.length && (
        <p className="mt-4 rounded-xl border border-dashed border-ink-900/12 bg-ivory-100 p-6 text-center text-sm text-ink-400">
          No withdrawal requests found
        </p>
      )}
    </Card>
  )
}

function toWithdrawalRow(payout) {
  return {
    id: `PO${payout.id}`,
    date: formatDate(payout.paymentDate || payout.createdAt),
    amount: Number(payout.netAmount || payout.totalAmount || 0),
    method: payout.bankName || 'Bank Transfer',
    status: payout.status === 1 ? 'Approved' : 'Pending',
  }
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
