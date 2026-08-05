import { useCallback, useEffect, useState } from 'react'
import { Wallet, TrendingUp, ArrowDownToLine, Clock } from 'lucide-react'
import { usePageTitle } from '../../hooks/usePageTitle'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { Badge } from '../../components/ui/Badge'
import { Table, THead, TRow, TCell } from '../../components/ui/Table'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import { memberApi } from '../../lib/api'

const emptySummary = { balance: 0, totalEarnings: 0, totalWithdrawn: 0, pendingWithdrawal: 0 }

export default function WalletPage() {
  usePageTitle('Wallet', 'Track balance, earnings and transaction history')
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [wallet, setWallet] = useState({ summary: emptySummary, transactions: [] })
  const toast = useToast()
  const { token } = useAuth()

  const loadWallet = useCallback(() => {
    memberApi.wallet(token)
      .then(setWallet)
      .catch((error) => {
        toast.push(error.message, 'error')
        setWallet({ summary: emptySummary, transactions: [] })
      })
  }, [token, toast])

  useEffect(() => {
    loadWallet()
  }, [loadWallet])

  const handleWithdraw = async () => {
    setSubmitting(true)
    try {
      await memberApi.requestWithdrawal(token, { amount: Number(amount) })
      setOpen(false)
      toast.push(`Withdrawal request for Rs ${amount || 0} submitted`, 'success')
      setAmount('')
      loadWallet()
    } catch (error) {
      toast.push(error.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const summary = wallet.summary || emptySummary
  const transactions = wallet.transactions || []

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Wallet Balance" value={summary.balance} prefix="₹" icon={Wallet} />
        <StatCard label="Total Earnings" value={summary.totalEarnings} prefix="₹" icon={TrendingUp} delay={0.05} />
        <StatCard label="Total Withdrawn" value={summary.totalWithdrawn} prefix="₹" icon={ArrowDownToLine} delay={0.1} />
        <StatCard label="Pending" value={summary.pendingWithdrawal} prefix="₹" icon={Clock} delay={0.15} />
      </div>

      <Card className="flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center" delay={0.2}>
        <div>
          <p className="font-display text-xl font-semibold text-ink-950">Available for withdrawal</p>
          <p className="mt-1 font-mono text-3xl font-semibold text-gold-700">
            ₹{Number(summary.balance || 0).toLocaleString('en-IN')}
          </p>
        </div>
        <Button variant="gold" size="lg" onClick={() => setOpen(true)}>
          Request Withdrawal
        </Button>
      </Card>

      <Card className="p-6" delay={0.25}>
        <h3 className="mb-4 font-display text-xl font-semibold text-ink-950">Transaction History</h3>
        <Table>
          <THead columns={['Txn ID', 'Date', 'Type', 'Amount', 'Status']} />
          <tbody>
            {transactions.map((t) => (
              <TRow key={t.id}>
                <TCell className="font-mono text-xs text-ink-400">{t.id}</TCell>
                <TCell>{formatDate(t.date)}</TCell>
                <TCell>{t.type}</TCell>
                <TCell className={`font-mono font-medium ${t.amount < 0 ? 'text-rose-mlm' : 'text-emerald-mlm'}`}>
                  {t.amount < 0 ? '-' : '+'}₹{Math.abs(Number(t.amount || 0)).toLocaleString('en-IN')}
                </TCell>
                <TCell>
                  <Badge tone={t.status === 'Pending' ? 'gold' : t.amount < 0 ? 'neutral' : 'success'}>{t.status}</Badge>
                </TCell>
              </TRow>
            ))}
          </tbody>
        </Table>
        {!transactions.length && (
          <p className="mt-4 rounded-xl border border-dashed border-ink-900/12 bg-ivory-100 p-6 text-center text-sm text-ink-400">
            No wallet transactions found
          </p>
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Request Withdrawal"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="gold" onClick={handleWithdraw} loading={submitting}>
              Submit Request
            </Button>
          </>
        }
      >
        <p className="mb-4 text-sm text-ink-400">
          Available balance:{' '}
          <span className="font-mono font-medium text-ink-900">₹{Number(summary.balance || 0).toLocaleString('en-IN')}</span>
        </p>
        <Input
          label="Amount (₹)"
          type="number"
          placeholder="e.g. 5000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </Modal>
    </div>
  )
}

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
