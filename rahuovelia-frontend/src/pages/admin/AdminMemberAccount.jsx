import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, X } from 'lucide-react'
import { usePageTitle } from '../../hooks/usePageTitle'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { adminApi } from '../../lib/api'

const initialForm = {
  username: '',
  password: '',
  firstName: '',
  lastName: '',
  aadhaarNo: '',
  fatherName: '',
  address: '',
  city: '',
  state: '',
  country: 'India',
  maritalStatus: '',
  sex: '',
  emailId: '',
  mobileNo: '',
  postalCode: '',
  birthday: '',
  bankName: '',
  branch: '',
  accountNo: '',
  accountType: '',
  ifscCode: '',
  panNo: '',
  accountHolderName: '',
  nomineeName: '',
  nomineeRelation: '',
}

const statusLabels = {
  0: 'Unpaid',
  1: 'Active',
  2: 'Blocked',
}

const statusTone = {
  Unpaid: 'gold',
  Active: 'success',
  Blocked: 'danger',
}

function toDateInput(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

function toForm(member) {
  return {
    username: member.username || '',
    password: '',
    firstName: member.firstName || '',
    lastName: member.lastName || '',
    aadhaarNo: member.aadhaarNo || '',
    fatherName: member.fatherName || '',
    address: member.address || '',
    city: member.city || '',
    state: member.state || '',
    country: member.country || 'India',
    maritalStatus: member.maritalStatus || '',
    sex: member.sex || '',
    emailId: member.emailId || '',
    mobileNo: member.mobileNo || '',
    postalCode: member.postalCode || '',
    birthday: toDateInput(member.birthday),
    bankName: member.bankName || '',
    branch: member.branch || '',
    accountNo: member.accountNo || '',
    accountType: member.accountType || '',
    ifscCode: member.ifscCode || '',
    panNo: member.panNo || member.panVerification?.panNo || '',
    accountHolderName: member.accountHolderName || '',
    nomineeName: member.nomineeName || '',
    nomineeRelation: member.nomineeRelation || '',
  }
}

function cleanPayload(form) {
  return Object.fromEntries(
    Object.entries({
      ...form,
      password: form.password || undefined,
      birthday: form.birthday || undefined,
    }).filter(([, value]) => value !== undefined)
  )
}

function Section({ title, children, tone = 'ink' }) {
  const bg = tone === 'blue' ? 'bg-blue-800' : 'bg-ink-700'

  return (
    <section className="overflow-hidden rounded-lg border border-ink-900/10 bg-white shadow-sm">
      <div className={`${bg} px-4 py-2 text-center text-xs font-bold uppercase text-white`}>
        {title}
      </div>
      <div className="grid gap-x-8 gap-y-4 p-5 md:grid-cols-2">{children}</div>
    </section>
  )
}

function Field({ label, children }) {
  return (
    <div className="grid gap-2 sm:grid-cols-[150px_1fr] sm:items-center">
      <label className="text-xs font-medium text-ink-700">{label}</label>
      {children}
    </div>
  )
}

function SelectField({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full rounded border border-ink-900/15 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-300/60"
    >
      <option value="">Select</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}

export default function AdminMemberAccount() {
  const { memberId = '' } = useParams()
  const { token } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [member, setMember] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  usePageTitle('Edit Member Profile', `Update account details for ${memberId}`)

  useEffect(() => {
    let alive = true
    setLoading(true)
    adminApi.member(token, memberId)
      .then((data) => {
        if (!alive) return
        setMember(data)
        setForm(toForm(data))
      })
      .catch((error) => toast.push(error.message, 'error'))
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [memberId, toast, token])

  const update = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      const updated = await adminApi.updateMember(token, memberId, cleanPayload(form))
      setMember(updated)
      setForm(toForm(updated))
      toast.push('Member profile updated successfully.', 'success')
    } catch (error) {
      toast.push(error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const status = statusLabels[member?.status] || 'Review'

  if (loading) {
    return (
      <Card className="p-8 text-sm text-ink-500" animate={false}>
        Loading member profile...
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/admin/members/active"
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-700 transition hover:bg-ink-900/5 hover:text-ink-950"
        >
          <ArrowLeft size={16} strokeWidth={1.8} />
          Back to members
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={statusTone[status] || 'neutral'}>{status}</Badge>
          <Badge tone="neutral">User ID: {member?.regno || memberId}</Badge>
        </div>
      </div>

      <Section title="Personal Information">
        <div className="md:col-span-2 grid gap-2 text-center text-xs text-ink-600">
          <p>Status: <span className="font-semibold text-ink-950">{status}</span></p>
          <p>Date of Joining: <span className="font-semibold text-ink-950">{member?.doj ? new Date(member.doj).toLocaleString('en-IN') : '-'}</span></p>
          <p>Paid Date: <span className="font-semibold text-ink-950">{member?.paidDate ? new Date(member.paidDate).toLocaleString('en-IN') : '-'}</span></p>
        </div>
      </Section>

      <Section title="User Information">
        <Field label="User Name">
          <Input value={form.username} onChange={update('username')} />
        </Field>
        <Field label="Sponsor ID No.">
          <Input value={member?.sponsorId || ''} disabled />
        </Field>
        <Field label="Reset Password">
          <Input
            type="password"
            value={form.password}
            onChange={update('password')}
            placeholder="Leave blank to keep current password"
            minLength={6}
          />
        </Field>
        <Field label="Sponsor Name">
          <Input value={member?.sponsorId || '-'} disabled />
        </Field>
      </Section>

      <Section title="Registration Information">
        <Field label="First Name">
          <Input value={form.firstName} onChange={update('firstName')} required />
        </Field>
        <Field label="Last Name">
          <Input value={form.lastName} onChange={update('lastName')} />
        </Field>
        <Field label="Aadhaar Number">
          <Input value={form.aadhaarNo} onChange={update('aadhaarNo')} />
        </Field>
        <Field label="City">
          <Input value={form.city} onChange={update('city')} />
        </Field>
        <Field label="Father Name">
          <Input value={form.fatherName} onChange={update('fatherName')} />
        </Field>
        <Field label="Country">
          <SelectField value={form.country} onChange={update('country')} options={['India']} />
        </Field>
        <Field label="Address">
          <textarea
            value={form.address}
            onChange={update('address')}
            className="min-h-20 w-full rounded border border-ink-900/15 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-300/60"
          />
        </Field>
        <Field label="Sex">
          <SelectField value={form.sex} onChange={update('sex')} options={['Male', 'Female', 'Other']} />
        </Field>
        <Field label="State">
          <Input value={form.state} onChange={update('state')} />
        </Field>
        <Field label="Postal Code">
          <Input value={form.postalCode} onChange={update('postalCode')} />
        </Field>
        <Field label="Marital Status">
          <SelectField value={form.maritalStatus} onChange={update('maritalStatus')} options={['Single', 'Married']} />
        </Field>
        <Field label="Birthday">
          <Input type="date" value={form.birthday} onChange={update('birthday')} />
        </Field>
        <Field label="Email">
          <Input type="email" value={form.emailId} onChange={update('emailId')} />
        </Field>
        <Field label="Mobile No.">
          <Input value={form.mobileNo} onChange={update('mobileNo')} />
        </Field>
      </Section>

      <Section title="Bank Detail">
        <Field label="Bank Name">
          <Input value={form.bankName} onChange={update('bankName')} />
        </Field>
        <Field label="Branch">
          <Input value={form.branch} onChange={update('branch')} />
        </Field>
        <Field label="Account Number">
          <Input value={form.accountNo} onChange={update('accountNo')} />
        </Field>
        <Field label="Account Type">
          <SelectField value={form.accountType} onChange={update('accountType')} options={['Saving', 'Current']} />
        </Field>
        <Field label="IFSC Code">
          <Input value={form.ifscCode} onChange={update('ifscCode')} />
        </Field>
        <Field label="IT PAN">
          <Input value={form.panNo} onChange={update('panNo')} />
        </Field>
        <Field label="Account Holder Name">
          <Input value={form.accountHolderName} onChange={update('accountHolderName')} />
        </Field>
      </Section>

      <Section title="Nominee" tone="blue">
        <Field label="Name">
          <Input value={form.nomineeName} onChange={update('nomineeName')} />
        </Field>
        <Field label="Relation">
          <SelectField
            value={form.nomineeRelation}
            onChange={update('nomineeRelation')}
            options={['Father', 'Mother', 'Spouse', 'Son', 'Daughter', 'Brother', 'Sister']}
          />
        </Field>
      </Section>

      <div className="flex justify-center gap-3 pb-8">
        <Button type="submit" variant="gold" loading={saving} icon={Save}>
          Update
        </Button>
        <Button type="button" variant="outline" icon={X} disabled={saving} onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
