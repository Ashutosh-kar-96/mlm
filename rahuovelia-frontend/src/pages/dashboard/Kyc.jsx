import { useEffect, useState } from 'react'
import { ShieldCheck, Upload, FileText } from 'lucide-react'
import { usePageTitle } from '../../hooks/usePageTitle'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import { memberApi } from '../../lib/api'

export default function Kyc() {
  usePageTitle('KYC Verification', 'Keep your identity documents up to date')
  const [pan, setPan] = useState('')
  const [aadhaar, setAadhaar] = useState('')
  const [status, setStatus] = useState('Pending')
  const [submitting, setSubmitting] = useState(false)
  const toast = useToast()
  const { token, user } = useAuth()

  useEffect(() => {
    setStatus(user?.kyc || 'Pending')
  }, [user])

  const submit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await memberApi.submitKyc(token, { panNo: pan, aadhaarNo: aadhaar })
      setStatus('Pending')
      toast.push('KYC documents submitted for review', 'success')
    } catch (error) {
      toast.push(error.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="flex flex-col items-center justify-center p-8 text-center" delay={0}>
        <span className="rounded-full bg-emerald-mlm/10 p-4 text-emerald-mlm">
          <ShieldCheck size={28} strokeWidth={1.6} />
        </span>
        <h3 className="mt-4 font-display text-xl font-semibold text-ink-950">Verification Status</h3>
        <Badge tone={status === 'Verified' ? 'success' : 'gold'} className="mt-3">
          {status}
        </Badge>
        <p className="mt-3 text-xs text-ink-400">
          {status === 'Verified' ? 'Your identity documents are verified.' : 'Submit your identity documents for admin review.'}
        </p>
      </Card>

      <Card className="p-6 lg:col-span-2" delay={0.1}>
        <h3 className="mb-1 font-display text-xl font-semibold text-ink-950">Update Documents</h3>
        <p className="mb-6 text-xs text-ink-400">Upload clear scans or photos — PDF, JPG or PNG under 5MB.</p>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="PAN Number" placeholder="ABCDE1234F" value={pan} onChange={(e) => setPan(e.target.value.toUpperCase())} />
            <Input label="Aadhaar Number" placeholder="XXXX XXXX XXXX" value={aadhaar} onChange={(e) => setAadhaar(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {['PAN Card scan', 'Aadhaar Card scan'].map((label) => (
              <label
                key={label}
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-ink-900/15 bg-ivory-100/50 px-4 py-8 text-center transition-colors hover:border-gold-400"
              >
                <Upload size={20} className="text-gold-500" />
                <span className="text-xs font-medium text-ink-700">{label}</span>
                <span className="text-[11px] text-ink-400">Click to upload</span>
                <input type="file" className="hidden" />
              </label>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-gold-100/60 px-4 py-3 text-xs text-gold-700">
            <FileText size={14} /> Review typically takes 24–48 hours.
          </div>

          <Button type="submit" variant="gold" loading={submitting}>
            Submit for Review
          </Button>
        </form>
      </Card>
    </div>
  )
}
