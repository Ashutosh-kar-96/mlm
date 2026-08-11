import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Award,
  BarChart3,
  BadgeCheck,
  Building2,
  CalendarDays,
  Camera,
  CreditCard,
  FileText,
  Heart,
  IdCard,
  IndianRupee,
  KeyRound,
  LifeBuoy,
  LockKeyhole,
  Mail,
  MapPin,
  Network,
  Phone,
  Plus,
  Printer,
  ReceiptText,
  Search,
  Send,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Star,
  Trash2,
  Upload,
  User,
  Users,
  Wallet,
} from 'lucide-react'
import { usePageTitle } from '../../hooks/usePageTitle'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Pagination, Table, THead, TRow, TCell } from '../../components/ui/Table'
import logo from '../../assets/logo.jpeg'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { memberApi } from '../../lib/api'

const member = {
  name: 'Member',
  id: '',
  firstName: '',
  lastName: '',
  father: '',
  dob: '',
  mobile: '',
  sponsor: '',
  rank: 'Member',
  joined: '',
  bank: '',
  branch: '',
  accountType: 'Saving',
  accountNo: '',
  ifsc: '',
  accountHolder: '',
  aadhaar: '',
  email: '',
  pan: '',
}

const states = ['Select State', 'Chhattisgarh', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Uttar Pradesh']

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function initials(name) {
  return String(name || 'Member')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'M'
}

function printDocument(target) {
  if (typeof window === 'undefined') return

  const clearPrintTarget = () => {
    delete document.body.dataset.printTarget
    window.removeEventListener('afterprint', clearPrintTarget)
  }

  document.body.dataset.printTarget = target
  window.addEventListener('afterprint', clearPrintTarget)
  window.setTimeout(() => {
    window.print()
    window.setTimeout(clearPrintTarget, 500)
  }, 50)
}

function profileDate(value, fallback) {
  return value ? formatDate(value) : fallback
}

function memberFromUser(user) {
  return {
    ...member,
    ...user,
    id: user?.regno || user?.id || member.id,
    name: user?.name || member.name,
    firstName: user?.firstName || user?.name?.split(/\s+/)[0] || member.firstName,
    lastName: user?.lastName || user?.name?.split(/\s+/).slice(1).join(' ') || member.lastName,
    father: user?.fatherName || member.father,
    dob: profileDate(user?.birthday, member.dob),
    mobile: user?.mobile || member.mobile,
    sponsor: user?.sponsorId || user?.sponsor || member.sponsor,
    rank: user?.rank || member.rank,
    joined: profileDate(user?.joined, member.joined),
    bank: user?.bankName || member.bank,
    branch: user?.branch || member.branch,
    accountType: user?.accountType || member.accountType,
    accountNo: user?.accountNo || member.accountNo,
    ifsc: user?.ifscCode || member.ifsc,
    accountHolder: user?.accountHolderName || user?.name || member.accountHolder,
    aadhaar: user?.aadhaarNo || member.aadhaar,
    pan: user?.panNo || '',
  }
}

function useMemberProfile() {
  const { token, user } = useAuth()
  const [profile, setProfile] = useState(() => memberFromUser(user))

  useEffect(() => {
    setProfile(memberFromUser(user))
    if (!token) return undefined

    let alive = true
    memberApi.dashboard(token)
      .then((data) => {
        if (alive) setProfile(memberFromUser({ ...user, ...data.user }))
      })
      .catch(() => {
        if (alive) setProfile(memberFromUser(user))
      })
    return () => {
      alive = false
    }
  }, [token, user])

  return profile
}

function PageShell({ title, subtitle, icon: Icon, children, aside }) {
  usePageTitle(title, subtitle)

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden bg-ink-950 p-6 lg:p-8" animate={false}>
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-gold-400/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-100 text-gold-700 ring-1 ring-gold-300/50">
              <Icon size={24} strokeWidth={1.7} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-gold-500/80">Member Console</p>
              <h2 className="mt-1 font-display text-3xl font-semibold text-gold-100">{title}</h2>
              {subtitle && <p className="mt-1 text-sm text-ink-400">{subtitle}</p>}
            </div>
          </div>
          {aside}
        </div>
      </Card>
      {children}
    </div>
  )
}

function FieldGrid({ children }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>
}

function SelectField({ label, options, defaultValue }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-400">{label}</span>
      <select
        defaultValue={defaultValue || options[0]}
        className="w-full rounded-lg border border-ink-900/12 bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none transition-shadow focus:border-gold-400 focus:ring-2 focus:ring-gold-300/60"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  )
}

function TextareaField({ label, placeholder }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-400">{label}</span>
      <textarea
        placeholder={placeholder}
        className="min-h-24 w-full rounded-lg border border-ink-900/12 bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none transition-shadow focus:border-gold-400 focus:ring-2 focus:ring-gold-300/60"
      />
    </label>
  )
}

function FileDrop({ label, helper, onFile }) {
  const handleChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => onFile?.({ name: file.name, type: file.type, url: reader.result })
    reader.readAsDataURL(file)
  }

  return (
    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gold-400/60 bg-gold-100/30 px-5 py-7 text-center transition hover:bg-gold-100/60">
      <Upload size={22} className="text-gold-700" />
      <span className="mt-2 text-sm font-semibold text-ink-950">{label}</span>
      <span className="mt-1 text-xs text-ink-400">{helper || 'JPG, PNG or PDF under 5MB'}</span>
      <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleChange} />
    </label>
  )
}

const isNewUpload = (file) => String(file?.url || '').startsWith('data:')

export function EditProfilePage() {
  return (
    <PageShell
      title="Edit Profile"
      subtitle="Keep your personal, address and nominee details updated"
      icon={User}
      aside={<Badge tone="gold">{member.id}</Badge>}
    >
      <Card className="p-6" animate={false}>
        <div className="mb-6 flex items-center gap-4">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gold-100 to-ivory-100 text-2xl font-semibold text-gold-700 ring-1 ring-gold-300/60">
              SK
            </div>
            <button className="absolute bottom-0 right-0 rounded-full bg-ink-950 p-2 text-gold-200 ring-2 ring-white">
              <Camera size={14} />
            </button>
          </div>
          <div>
            <h3 className="font-display text-2xl font-semibold text-ink-950">{member.name}</h3>
            <p className="text-sm text-ink-400">{member.rank} Partner</p>
          </div>
        </div>

        <form className="space-y-6">
          <FieldGrid>
            <Input label="User Name" defaultValue={member.firstName} icon={User} />
            <Input label="Mobile No." defaultValue={member.mobile} icon={Phone} />
            <Input label="Father / Husband Name" defaultValue={member.father} icon={User} />
            <Input label="Email ID" defaultValue={member.email} icon={Mail} />
            <Input label="Date Of Birth" defaultValue={member.dob} icon={CalendarDays} />
            <SelectField label="Marital Status" options={['Married', 'Single']} defaultValue="Married" />
            <SelectField label="Gender" options={['Male', 'Female', 'Other']} defaultValue="Male" />
            <Input label="City" placeholder="Enter city" icon={MapPin} />
            <Input label="District" placeholder="Enter district" icon={MapPin} />
            <SelectField label="State" options={states} />
            <Input label="Pin Code" placeholder="Enter pin code" />
            <Input label="Nominee Name" placeholder="Enter nominee name" />
            <SelectField label="Relation" options={['Select Relations', 'Father', 'Mother', 'Spouse', 'Brother', 'Sister']} />
          </FieldGrid>
          <FieldGrid>
            <TextareaField label="Address" placeholder="Enter full address" />
            <TextareaField label="Shipping Address" placeholder="Enter shipping address" />
          </FieldGrid>
          <div className="flex gap-3">
            <Button variant="gold">Update Profile</Button>
            <Button type="button" variant="danger">Cancel</Button>
          </div>
        </form>
      </Card>
    </PageShell>
  )
}

export function ChangePasswordPage() {
  const { token } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const setField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    if (form.newPassword !== form.confirmPassword) {
      toast.push('New password and confirm password do not match.', 'error')
      return
    }
    setSaving(true)
    try {
      await memberApi.changePassword(token, {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      })
      toast.push('Password changed successfully.', 'success')
      setForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast.push(error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageShell title="Change Password" subtitle="Update your account password securely" icon={LockKeyhole}>
      <Card className="max-w-2xl p-6" animate={false}>
        <form className="space-y-4" onSubmit={submit}>
          <Input label="Old Password" type="password" placeholder="Enter old password" value={form.oldPassword} onChange={setField('oldPassword')} required />
          <Input label="New Password" type="password" placeholder="Enter new password" value={form.newPassword} onChange={setField('newPassword')} minLength={6} required />
          <Input label="Confirm Password" type="password" placeholder="Re-enter new password" value={form.confirmPassword} onChange={setField('confirmPassword')} minLength={6} required />
          <div className="flex gap-3">
            <Button type="submit" variant="gold" loading={saving}>Change Password</Button>
            <Button type="button" variant="outline" onClick={() => setForm({ oldPassword: '', newPassword: '', confirmPassword: '' })}>Cancel</Button>
          </div>
        </form>
      </Card>
    </PageShell>
  )
}

export function WelcomeLetterPage() {
  const profile = useMemberProfile()

  return (
    <PageShell title="My Welcome Letter" subtitle="A printable welcome certificate for your distributor account" icon={FileText}>
      <Card className="mx-auto max-w-5xl overflow-hidden p-0" animate={false}>
        <div className="bg-gradient-to-r from-ink-950 via-ink-800 to-gold-700 px-6 py-4 text-gold-100">
          <p className="text-sm font-semibold uppercase tracking-[0.22em]">Welcome Letter</p>
        </div>
        <div className="relative p-8 md:p-12">
          <div className="absolute right-8 top-8 opacity-10">
            <Award size={150} className="text-gold-700" />
          </div>
          <div className="print-welcome-letter relative mx-auto max-w-3xl border border-gold-300/50 bg-ivory-50 p-8 text-center shadow-sm">
            <img src={logo} alt="Rahuovelia" className="mx-auto h-16 w-16 rounded-full object-cover" />
            <h3 className="mt-5 font-display text-4xl font-semibold text-ink-950">Welcome Letter</h3>
            <p className="mt-6 text-sm leading-7 text-ink-600">
              Congratulations Dear <strong>{profile.name}</strong> for taking a fantastic decision for your life. We are
              delighted to welcome you into the Rahuovelia partner family.
            </p>
            <div className="mx-auto mt-8 grid max-w-xl gap-3 text-left text-sm">
              {[
                ['Registration ID', profile.id],
                ['Name', profile.name],
                ['Mobile', profile.mobile],
                ['Sponsor ID', profile.sponsor],
                ['Date Of Registration', profile.joined],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-[170px_1fr] border-b border-gold-300/40 pb-2">
                  <span className="font-semibold text-ink-950">{label}</span>
                  <span className="text-ink-700">{value}</span>
                </div>
              ))}
            </div>
            <p className="mt-8 font-display text-2xl font-semibold text-ink-950">Rahuovelia</p>
            <p className="text-xs text-ink-400">This is only a welcome letter, not a payment receipt.</p>
            <Button className="no-print mt-6" variant="gold" icon={Printer} onClick={() => printDocument('welcome-letter')}>
              Print Letter
            </Button>
          </div>
        </div>
      </Card>
    </PageShell>
  )
}

export function IdCardPage() {
  const profile = useMemberProfile()

  return (
    <PageShell title="My ID Card" subtitle="Your digital partner identity card" icon={IdCard}>
      <div className="flex flex-col items-center gap-6">
        <div className="print-id-card relative aspect-[1.62/1] w-full max-w-lg overflow-hidden rounded-2xl bg-ink-950 p-6 text-gold-100 shadow-2xl">
          <div className="absolute -right-14 -top-20 h-56 w-56 rounded-full bg-gold-400/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-full w-32 bg-gradient-to-br from-gold-400 via-rose-mlm to-ink-800 opacity-90" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={logo} className="h-11 w-11 rounded-full object-cover" />
                <div>
                  <p className="font-display text-2xl font-semibold">Rahuovelia</p>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-gold-300">Partner ID</p>
                </div>
              </div>
              <Badge tone="gold">{profile.rank}</Badge>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gold-300">Name</p>
                <h3 className="font-display text-3xl font-semibold">{profile.name}</h3>
                <p className="mt-2 font-mono text-sm text-gold-200">ID: {profile.id}</p>
                <p className="text-xs text-ink-400">{profile.email}</p>
              </div>
              <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-ivory-50 text-2xl font-bold text-gold-700 ring-1 ring-gold-300">
                {initials(profile.name)}
              </div>
            </div>
          </div>
        </div>
        <Button className="no-print" variant="gold" icon={Printer} onClick={() => printDocument('id-card')}>
          Print ID Card
        </Button>
      </div>
    </PageShell>
  )
}

function UploadPreview({ label, icon: Icon, value }) {
  return (
    <div className="rounded-xl border border-ink-900/8 bg-ivory-100/50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon size={16} className="text-gold-700" />
        <p className="text-sm font-semibold text-ink-950">{label}</p>
      </div>
      <div className="flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-dashed border-ink-900/15 bg-white text-xs text-ink-400">
        {value?.url && value.type?.startsWith('image/') ? (
          <img src={value.url} alt={label} className="h-full w-full object-contain" />
        ) : value?.name ? (
          <span className="px-4 text-center font-medium text-ink-600">{value.name}</span>
        ) : (
          'No preview uploaded'
        )}
      </div>
    </div>
  )
}

export function BankDetailsPage() {
  const profile = useMemberProfile()
  const { token } = useAuth()
  const toast = useToast()
  const [preview, setPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    bankName: profile.bank,
    branch: profile.branch,
    accountType: profile.accountType,
    accountNo: profile.accountNo,
    ifscCode: profile.ifsc,
    accountHolderName: profile.accountHolder,
  })

  useEffect(() => {
    setForm({
      bankName: profile.bank,
      branch: profile.branch,
      accountType: profile.accountType,
      accountNo: profile.accountNo,
      ifscCode: profile.ifsc,
      accountHolderName: profile.accountHolder,
    })
  }, [profile])

  useEffect(() => {
    if (!token) return undefined
    let alive = true
    memberApi.uploads(token, { type: 'bank_passbook' })
      .then((items) => {
        if (alive && items[0]) setPreview({ name: items[0].fileName || items[0].fileUrl, type: '', url: items[0].fileUrl })
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [token])

  const setField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      await memberApi.updateProfile(token, form)
      if (isNewUpload(preview)) {
        await memberApi.createUpload(token, { type: 'bank_passbook', fileName: preview.name, fileData: preview.url, status: 'Pending' })
      }
      toast.push('Bank details updated.', 'success')
    } catch (error) {
      toast.push(error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageShell title="Upload Bank Details" subtitle="Manage payout bank account verification" icon={Wallet}>
      <Card className="p-6" animate={false}>
        <form className="space-y-6" onSubmit={submit}>
          <FieldGrid>
            <Input label="Bank Name" value={form.bankName || ''} onChange={setField('bankName')} icon={Building2} />
            <Input label="Branch Name" value={form.branch || ''} onChange={setField('branch')} />
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-400">Account Type</span>
              <select value={form.accountType || 'Saving'} onChange={setField('accountType')} className="w-full rounded-lg border border-ink-900/12 bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none transition-shadow focus:border-gold-400 focus:ring-2 focus:ring-gold-300/60">
                <option>Saving</option>
                <option>Current</option>
              </select>
            </label>
            <Input label="Account Number" value={form.accountNo || ''} onChange={setField('accountNo')} />
            <Input label="IFSC Code" value={form.ifscCode || ''} onChange={setField('ifscCode')} />
            <Input label="Account Holder Name" value={form.accountHolderName || ''} onChange={setField('accountHolderName')} icon={User} />
          </FieldGrid>
          <div className="grid gap-4 md:grid-cols-2">
            <FileDrop label="Cheque / Bank Passbook Upload" onFile={setPreview} />
            <UploadPreview label="Uploaded Passbook Preview" icon={FileText} value={preview} />
          </div>
          <div className="flex gap-3">
            <Button type="submit" variant="gold" loading={saving}>Update Bank</Button>
            <Button type="button" variant="danger">Cancel</Button>
          </div>
        </form>
      </Card>
    </PageShell>
  )
}

export function PanUploadPage() {
  const profile = useMemberProfile()
  const { token } = useAuth()
  const toast = useToast()
  const [panNo, setPanNo] = useState(profile.pan || '')
  const [preview, setPreview] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setPanNo(profile.pan || '')
  }, [profile.pan])

  useEffect(() => {
    if (!token) return undefined
    let alive = true
    memberApi.uploads(token, { type: 'pan_card' })
      .then((items) => {
        if (alive && items[0]) setPreview({ name: items[0].fileName || items[0].fileUrl, type: '', url: items[0].fileUrl })
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [token])

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      const upload = isNewUpload(preview)
        ? await memberApi.createUpload(token, { type: 'pan_card', fileName: preview.name, fileData: preview.url, status: 'Pending' })
        : null
      await memberApi.submitKyc(token, { panNo, panImage: upload?.fileUrl || preview?.url || preview?.name })
      toast.push('PAN details uploaded.', 'success')
    } catch (error) {
      toast.push(error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageShell title="Upload PAN Card Details" subtitle="Submit your PAN number and document copy" icon={CreditCard}>
      <Card className="max-w-4xl p-6" animate={false}>
        <form className="space-y-6" onSubmit={submit}>
          <Input label="PAN Card Number" placeholder="ABCDE1234F" value={panNo} onChange={(event) => setPanNo(event.target.value)} />
          <div className="grid gap-4 md:grid-cols-2">
            <FileDrop label="PAN Card Upload" onFile={setPreview} />
            <UploadPreview label="PAN Copy" icon={CreditCard} value={preview} />
          </div>
          <div className="flex gap-3">
            <Button type="submit" variant="gold" loading={saving}>Update PAN</Button>
            <Button type="button" variant="danger">Cancel</Button>
          </div>
        </form>
      </Card>
    </PageShell>
  )
}

export function AadhaarUploadPage() {
  const profile = useMemberProfile()
  const { token } = useAuth()
  const toast = useToast()
  const [aadhaarNo, setAadhaarNo] = useState(profile.aadhaar || '')
  const [frontPreview, setFrontPreview] = useState(null)
  const [backPreview, setBackPreview] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setAadhaarNo(profile.aadhaar || '')
  }, [profile.aadhaar])

  useEffect(() => {
    if (!token) return undefined
    let alive = true
    Promise.all([
      memberApi.uploads(token, { type: 'aadhaar_front' }),
      memberApi.uploads(token, { type: 'aadhaar_back' }),
    ])
      .then(([front, back]) => {
        if (!alive) return
        if (front[0]) setFrontPreview({ name: front[0].fileName || front[0].fileUrl, type: '', url: front[0].fileUrl })
        if (back[0]) setBackPreview({ name: back[0].fileName || back[0].fileUrl, type: '', url: back[0].fileUrl })
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [token])

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      await memberApi.submitKyc(token, { aadhaarNo })
      if (isNewUpload(frontPreview)) {
        await memberApi.createUpload(token, { type: 'aadhaar_front', fileName: frontPreview.name, fileData: frontPreview.url, status: 'Pending' })
      }
      if (isNewUpload(backPreview)) {
        await memberApi.createUpload(token, { type: 'aadhaar_back', fileName: backPreview.name, fileData: backPreview.url, status: 'Pending' })
      }
      toast.push('Aadhaar details uploaded.', 'success')
    } catch (error) {
      toast.push(error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageShell title="Upload Aadhaar Card Details" subtitle="Upload front and back Aadhaar images for KYC" icon={ShieldCheck}>
      <Card className="p-6" animate={false}>
        <form className="space-y-6" onSubmit={submit}>
          <Input label="Aadhaar Number" value={aadhaarNo} onChange={(event) => setAadhaarNo(event.target.value)} icon={IdCard} />
          <div className="grid gap-4 md:grid-cols-2">
            <FileDrop label="Upload Aadhaar Card Front" onFile={setFrontPreview} />
            <UploadPreview label="Aadhaar Front Side" icon={IdCard} value={frontPreview} />
            <FileDrop label="Upload Aadhaar Card Back" onFile={setBackPreview} />
            <UploadPreview label="Aadhaar Back Side" icon={IdCard} value={backPreview} />
          </div>
          <div className="flex gap-3">
            <Button type="submit" variant="gold" loading={saving}>Update Aadhaar</Button>
            <Button type="button" variant="danger">Cancel</Button>
          </div>
        </form>
      </Card>
    </PageShell>
  )
}

export function MemberRegisterPage() {
  const profile = useMemberProfile()
  const { token } = useAuth()
  const toast = useToast()
  const [photo, setPhoto] = useState(null)
  const [saving, setSaving] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [form, setForm] = useState({
    sponsorId: profile.id,
    firstName: '',
    lastName: '',
    birthday: '',
    password: '',
    confirmPassword: '',
    fatherName: 'Admin',
    mobileNo: '',
  })

  useEffect(() => {
    setForm((current) => ({ ...current, sponsorId: profile.id }))
  }, [profile.id])

  const setField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    if (!agreed) {
      toast.push('Please read and accept the registration agreement.', 'error')
      return
    }
    if (form.password !== form.confirmPassword) {
      toast.push('Password and re-type password do not match.', 'error')
      return
    }
    if (form.birthday && new Date(form.birthday) > new Date()) {
      toast.push('DOB cannot be a future date.', 'error')
      return
    }
    setSaving(true)
    try {
      const created = await memberApi.createMember(token, {
        sponsorId: form.sponsorId,
        firstName: form.firstName,
        lastName: form.lastName,
        birthday: form.birthday || undefined,
        password: form.password,
        fatherName: form.fatherName,
        mobileNo: form.mobileNo,
        username: form.mobileNo || undefined,
      })
      toast.push(`Member ${created.regno} created successfully.`, 'success')
      setForm((current) => ({
        ...current,
        firstName: '',
        lastName: '',
        birthday: '',
        password: '',
        confirmPassword: '',
        fatherName: 'Admin',
        mobileNo: '',
      }))
      setPhoto(null)
      setAgreed(false)
    } catch (error) {
      toast.push(error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageShell title="Create Member Account" subtitle="Register a new distributor under your sponsor ID" icon={User}>
      <Card className="mx-auto max-w-4xl overflow-hidden p-0" animate={false}>
        <div className="bg-gradient-to-r from-ink-950 to-gold-700 px-6 py-4 text-gold-100">
          <p className="font-semibold uppercase tracking-[0.2em]">Distributor Registration</p>
          <p className="text-xs text-gold-200/80">Sponsor: {profile.name} ({profile.id})</p>
        </div>
        <form className="space-y-6 p-6" onSubmit={submit}>
          <FieldGrid>
            <Input label="Sponsor ID" value={form.sponsorId} onChange={setField('sponsorId')} />
            <Input label="First Name" placeholder="Your First Name" value={form.firstName} onChange={setField('firstName')} />
            <Input label="Last Name" placeholder="Your Last Name" value={form.lastName} onChange={setField('lastName')} />
            <Input label="DOB" type="date" value={form.birthday} onChange={setField('birthday')} />
            <Input label="Password" type="password" placeholder="Enter password" value={form.password} onChange={setField('password')} />
            <Input label="Re-Type Password" type="password" placeholder="Confirm password" value={form.confirmPassword} onChange={setField('confirmPassword')} />
            <Input label="Father / Husband Name" value={form.fatherName} onChange={setField('fatherName')} />
            <Input label="Mobile Number" placeholder="Mobile Number" value={form.mobileNo} onChange={setField('mobileNo')} />
          </FieldGrid>
          <div className="grid gap-4 md:grid-cols-[160px_1fr] md:items-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gold-100 text-gold-700 ring-1 ring-gold-300/60">
              {photo?.url && photo.type?.startsWith('image/') ? (
                <img src={photo.url} alt="Profile preview" className="h-full w-full rounded-full object-cover" />
              ) : (
                <User size={46} />
              )}
            </div>
            <FileDrop label="Upload Profile Photo" onFile={setPhoto} />
          </div>
          <label className="flex items-center gap-3 rounded-lg bg-ivory-100 p-3 text-xs font-semibold text-ink-700">
            <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} className="h-4 w-4 accent-gold-500" />
            Please read distributor registration agreement.
          </label>
          <Button type="submit" variant="gold" fullWidth loading={saving}>Create Account</Button>
        </form>
      </Card>
    </PageShell>
  )
}

function ReportCard({ title, columns, rows, emptyText }) {
  return (
    <Card className="overflow-hidden p-0" animate={false}>
      <div className="border-b border-ink-900/8 bg-gradient-to-r from-ink-950 to-gold-700 px-5 py-4">
        <h3 className="font-display text-xl font-semibold text-gold-100">{title}</h3>
      </div>
      <div className="p-5">
        {rows?.length ? (
          <Table>
            <THead columns={columns} />
            <tbody>
              {rows.map((row, index) => (
                <TRow key={`${title}-${index}`}>
                  {row.map((cell, cellIndex) => (
                    <TCell key={`${cell}-${cellIndex}`} className={cellIndex === 0 ? 'font-mono text-xs text-ink-400' : ''}>
                      {cell}
                    </TCell>
                  ))}
                </TRow>
              ))}
            </tbody>
          </Table>
        ) : (
          <div className="flex min-h-28 items-center justify-center rounded-xl border border-dashed border-ink-900/12 bg-ivory-100 text-sm font-medium text-rose-mlm">
            {emptyText || 'No record found'}
          </div>
        )}
      </div>
    </Card>
  )
}

export function DirectDownlinePage() {
  const { token } = useAuth()
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const filteredRows = rows.filter((row) => row.join(' ').toLowerCase().includes(query.trim().toLowerCase()))
  const pagedRows = filteredRows.slice((page - 1) * limit, page * limit)
  const pageMeta = { page, limit, total: filteredRows.length }

  useEffect(() => {
    let alive = true
    memberApi.network(token)
      .then((data) => {
        if (!alive) return
        setRows(data.directMembers.map((item) => [
          item.regno || item.id,
          item.name,
          item.regno || item.id,
          formatDate(item.joined),
          item.rank,
          item.sponsorId || member.id,
        ]))
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
    <PageShell
      title="Direct Downline"
      subtitle="Your personally sponsored members, ranks and joining dates"
      icon={Users}
      aside={<Badge tone="success">{rows.length} direct members</Badge>}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="relative overflow-hidden p-5" animate={false}>
          <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-gold-300/10 blur-2xl" />
          <div className="relative flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-ink-400">Direct Members</p>
              <p className="mt-2 font-display text-3xl font-semibold text-ink-950">{rows.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
              <Users size={22} />
            </div>
          </div>
          <Badge tone="gold" className="mt-4">Live report</Badge>
        </Card>
        <Card className="relative overflow-hidden p-5" animate={false}>
          <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-gold-300/10 blur-2xl" />
          <div className="relative flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-ink-400">Influencers</p>
              <p className="mt-2 font-display text-3xl font-semibold text-ink-950">
                {rows.filter((row) => row[4] === 'Influencer').length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
              <Award size={22} />
            </div>
          </div>
          <Badge tone="success" className="mt-4">Live report</Badge>
        </Card>
        <Card className="relative overflow-hidden p-5" animate={false}>
          <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-gold-300/10 blur-2xl" />
          <div className="relative flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-ink-400">Sponsor ID</p>
              <p className="mt-2 font-display text-3xl font-semibold text-ink-950">{member.id}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
              <IdCard size={22} />
            </div>
          </div>
          <Badge tone="neutral" className="mt-4">Live report</Badge>
        </Card>
      </div>

      <Card className="overflow-hidden p-0" animate={false}>
        <div className="flex flex-col gap-4 border-b border-ink-900/8 bg-white px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="font-display text-2xl font-semibold text-ink-950">Direct Downline</h3>
            <p className="text-sm text-ink-400">Scan member ID, rank, sponsor and date of joining.</p>
          </div>
          <div className="relative w-full max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              placeholder="Search by member, ID or rank"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setPage(1)
              }}
              className="w-full rounded-full border border-ink-900/10 bg-ivory-50 py-2.5 pl-9 pr-4 text-sm outline-none transition-shadow focus:ring-2 focus:ring-gold-300/60"
            />
          </div>
        </div>
        <div className="p-5">
          <Table>
            <THead columns={['Reg No', 'Member', 'User ID', 'DOJ', 'Rank', 'Sponsor ID']} />
            <tbody>
              {pagedRows.map((row) => (
                <TRow key={row[0]}>
                  <TCell className="font-mono text-xs text-ink-400">{row[0]}</TCell>
                  <TCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-100 text-xs font-semibold text-gold-700">
                        {row[1].slice(0, 2)}
                      </div>
                      <span className="font-medium text-ink-950">{row[1]}</span>
                    </div>
                  </TCell>
                  <TCell className="font-mono text-xs text-ink-400">{row[2]}</TCell>
                  <TCell>{row[3]}</TCell>
                  <TCell>
                    <Badge tone={row[4] === 'Influencer' ? 'gold' : 'neutral'}>{row[4]}</Badge>
                  </TCell>
                  <TCell className="font-mono text-xs text-ink-400">{row[5]}</TCell>
                </TRow>
              ))}
            </tbody>
          </Table>
          {!pagedRows.length && (
            <p className="mt-4 rounded-xl border border-dashed border-ink-900/12 bg-ivory-100 p-6 text-center text-sm text-ink-400">
              No direct members found
            </p>
          )}
          <Pagination
            meta={pageMeta}
            page={page}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={(value) => {
              setLimit(value)
              setPage(1)
            }}
          />
        </div>
      </Card>
    </PageShell>
  )
}

function TreePerson({ id, name, muted = false }) {
  return (
    <div className="flex flex-col items-center">
      <div className={muted ? 'flex h-14 w-14 items-center justify-center rounded-full bg-ink-900/10 text-ink-400' : 'flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-ink-950 to-gold-700 text-gold-100 shadow-gold-glow'}>
        <User size={26} />
      </div>
      <div className="mt-2 rounded-lg border border-ink-900/8 bg-white px-3 py-2 text-center shadow-sm">
        <p className="font-mono text-[11px] text-ink-500">{id}</p>
        <p className="text-xs font-semibold text-ink-950">{name}</p>
      </div>
    </div>
  )
}

function LevelTreeNode({ node, depth = 0 }) {
  const children = node.children || []

  return (
    <div className="flex flex-col items-center">
      <TreePerson id={node.id || '-'} name={node.name || 'Member'} muted={depth > 1} />
      {children.length > 0 && (
        <>
          <div className="mt-7 h-px w-56 bg-ink-900/20" />
          <div className="grid grid-cols-1 gap-5 pt-5 sm:grid-cols-2 lg:grid-cols-3">
            {children.map((child) => (
              <LevelTreeNode key={child.id} node={child} depth={depth + 1} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export function LevelTreePage() {
  const { token } = useAuth()
  const [network, setNetwork] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError('')
    memberApi.network(token)
      .then((data) => {
        if (alive) setNetwork(data)
      })
      .catch(() => {
        if (alive) setError('Unable to load level tree')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [token])

  return (
    <PageShell
      title="Level Tree"
      subtitle="A visual snapshot of your generation network"
      icon={Network}
      aside={
        <div className="flex gap-2">
          <Button size="sm" variant="outline">Back</Button>
          <Button size="sm" variant="gold">Next</Button>
        </div>
      }
    >
      <Card className="overflow-x-auto p-8" animate={false}>
        {loading ? (
          <p className="rounded-xl border border-ink-900/8 bg-ivory-100 p-6 text-center text-sm text-ink-400">
            Loading level tree...
          </p>
        ) : error ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-600">
            {error}
          </p>
        ) : network?.tree ? (
          <div className="min-w-[860px]">
            <LevelTreeNode node={network.tree} />
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-ink-900/12 bg-ivory-100 p-6 text-center text-sm text-ink-400">
            No level tree found
          </p>
        )}
      </Card>
    </PageShell>
  )
}

export function DownlineReportPage() {
  const { token, user } = useAuth()
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [memberRegno, setMemberRegno] = useState('')
  const [meta, setMeta] = useState({ page: 1, limit: 25, total: 0 })

  useEffect(() => {
    let alive = true
    memberApi.downline(token, user?.id || member.id, {
      page: meta.page,
      limit: meta.limit,
      memberRegno: memberRegno || undefined,
    })
      .then((data) => {
        if (!alive) return
        setMeta(data.meta || { page: 1, limit: meta.limit, total: 0 })
        setRows(data.items.map((item, index) => [
          String((Number(data.meta?.page || meta.page) - 1) * Number(data.meta?.limit || meta.limit) + index + 1),
          item.downlineRegno,
          [item.downline?.firstName, item.downline?.lastName].filter(Boolean).join(' ') || item.downlineRegno,
          item.regno,
          user?.name || member.name,
          item.downline?.rank?.rankName || 'Member',
          formatDate(item.fromDate),
        ]))
      })
      .catch((error) => {
        toast.push(error.message, 'error')
        if (alive) setRows([])
      })
    return () => {
      alive = false
    }
  }, [memberRegno, meta.page, meta.limit, token, user, toast])

  return (
    <PageShell title="Downline Report" subtitle="Complete level details with sponsor chain" icon={FileText}>
      <Card className="p-5" animate={false}>
        <div className="max-w-sm">
          <Input
            label="Search Downline Regno"
            value={memberRegno}
            onChange={(event) => {
              setMemberRegno(event.target.value)
              setMeta((current) => ({ ...current, page: 1 }))
            }}
            placeholder="Enter member regno"
          />
        </div>
      </Card>
      <ReportCard
        title="Level Details"
        columns={['Sl No.', 'Reg. No.', 'Name', 'Sponsor ID', 'Sponsor ID Name', 'Post', 'Joining Date']}
        rows={rows}
      />
      <Pagination
        meta={meta}
        page={meta.page}
        limit={meta.limit}
        onPageChange={(page) => setMeta((current) => ({ ...current, page }))}
        onLimitChange={(limit) => setMeta({ page: 1, limit, total: meta.total })}
      />
    </PageShell>
  )
}

export function LicensePage({ used = false }) {
  const { token, user } = useAuth()
  const toast = useToast()
  const [licenses, setLicenses] = useState([])
  const [pinNo, setPinNo] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadLicenses = useCallback(() => {
    if (!token) return
    setLoading(true)
    memberApi.dashboard(token)
      .then((data) => setLicenses(data.licenses || []))
      .catch((error) => toast.push(error.message, 'error'))
      .finally(() => setLoading(false))
  }, [token, toast])

  useEffect(() => {
    loadLicenses()
  }, [loadLicenses])

  const availableLicenses = licenses.filter((license) => !license.used)
  const visibleLicenses = licenses.filter((license) => license.used === used)
  const redeemPin = async (event) => {
    event.preventDefault()
    const selectedPin = pinNo.trim()
    if (!selectedPin) {
      toast.push('Enter a license number to activate.', 'error')
      return
    }

    setSaving(true)
    try {
      await memberApi.usePin(token, { pinNo: selectedPin, usedForRegno: user?.id })
      toast.push('Activation license used successfully.', 'success')
      setPinNo('')
      loadLicenses()
    } catch (error) {
      toast.push(error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageShell title={used ? 'Used License' : 'Activation License'} subtitle="Track activation pin/license usage" icon={KeyRound}>
      {!used && (
        <Card className="p-5" animate={false}>
          <form className="grid gap-3 md:grid-cols-[1fr_auto]" onSubmit={redeemPin}>
            <Input
              label="License Number"
              value={pinNo}
              onChange={(event) => setPinNo(event.target.value)}
              placeholder={availableLicenses[0]?.pinNo || 'Enter transferred license number'}
              icon={KeyRound}
            />
            <div className="flex items-end">
              <Button type="submit" variant="gold" loading={saving}>Use License</Button>
            </div>
          </form>
        </Card>
      )}
      <Card className="overflow-hidden p-0" animate={false}>
        <div className="border-b border-ink-900/8 bg-gradient-to-r from-ink-950 to-gold-700 px-5 py-4">
          <h3 className="font-display text-xl font-semibold text-gold-100">{used ? 'Used License' : 'Activation License'}</h3>
        </div>
        <div className="p-5">
          {loading ? (
            <p className="rounded-xl border border-ink-900/8 bg-ivory-100 p-6 text-center text-sm text-ink-400">Loading license records...</p>
          ) : visibleLicenses.length ? (
            <Table>
              <THead columns={['License No.', 'Plan', 'Pin Value', used ? 'Used Date' : 'Transfer Date', 'Status']} />
              <tbody>
                {visibleLicenses.map((license) => (
                  <TRow key={license.id}>
                    <TCell className="font-mono text-xs text-ink-500">{license.pinNo}</TCell>
                    <TCell>{license.planName || 'Activation License'}</TCell>
                    <TCell>₹{Number(license.pinValue || 0).toLocaleString('en-IN')}</TCell>
                    <TCell>{formatDate(used ? license.usedDate : license.transferDate)}</TCell>
                    <TCell>
                      <Badge tone={license.used ? 'success' : 'gold'}>{license.used ? 'Used' : 'Available'}</Badge>
                    </TCell>
                  </TRow>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="rounded-xl border border-dashed border-ink-900/12 bg-ivory-100 p-6 text-center text-sm text-ink-400">
              {used ? 'Sorry, no used license found' : 'No activation license record found'}
            </p>
          )}
        </div>
      </Card>
    </PageShell>
  )
}

export function MlmStatusPage() {
  const { token } = useAuth()
  const toast = useToast()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const latestGpg = summary?.gpg?.subscriptions?.[0]
  const activeChallenge = summary?.rankChallenges?.[0]

  useEffect(() => {
    let alive = true
    setLoading(true)
    memberApi.mlmSummary(token)
      .then((data) => {
        if (alive) setSummary(data)
      })
      .catch((error) => {
        if (alive) setSummary({ error: error.message || 'Unable to load MLM status' })
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [token])

  const subscribe = async () => {
    try {
      const subscription = await memberApi.subscribeGpg(token)
      setSummary((current) => ({
        ...current,
        gpg: {
          ...(current?.gpg || {}),
          subscriptions: [subscription, ...(current?.gpg?.subscriptions || []).filter((item) => item.id !== subscription.id)],
        },
      }))
      toast.push('GPG subscription submitted for admin approval.', 'success')
    } catch (error) {
      toast.push(error.message, 'error')
    }
  }

  return (
    <PageShell title="MLM Status" subtitle="Rank, GPG, license and challenge status" icon={BarChart3}>
      {loading ? (
        <Card className="p-6 text-center text-sm text-ink-400" animate={false}>Loading MLM status...</Card>
      ) : summary?.error ? (
        <Card className="p-6 text-center" animate={false}>
          <p className="text-sm font-medium text-rose-600">{summary.error}</p>
          <p className="mt-2 text-xs text-ink-400">Restart the backend and apply the latest Prisma migration if this page was just added.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="p-5" animate={false}>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Current Rank</p>
              <p className="mt-2 font-display text-2xl font-semibold text-ink-950">{summary?.currentRank || '-'}</p>
              <p className="font-mono text-xs text-gold-700">{summary?.rankPercent || 0}%</p>
            </Card>
            <Card className="p-5" animate={false}>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Licenses Remaining</p>
              <p className="mt-2 font-display text-2xl font-semibold text-ink-950">{summary?.licenses?.remaining || 0}</p>
            </Card>
            <Card className="p-5" animate={false}>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-400">GPG Status</p>
              <p className="mt-2 font-display text-xl font-semibold text-ink-950">{latestGpg?.approvalStatus || (summary?.gpg?.available ? 'Available' : 'Not Available')}</p>
              <p className="text-xs text-ink-400">{latestGpg?.subscribedAt ? new Date(latestGpg.subscribedAt).toLocaleString('en-IN') : '-'}</p>
            </Card>
            <Card className="p-5" animate={false}>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Rank 41 Challenge</p>
              <p className="mt-2 font-display text-xl font-semibold text-ink-950">{activeChallenge?.status || '-'}</p>
              <p className="font-mono text-xs text-gold-700">{money(activeChallenge?.currentBv)} / {money(activeChallenge?.requiredBv)} BV</p>
            </Card>
          </div>

          {summary?.gpg?.available && (
            <Card className="flex flex-wrap items-center justify-between gap-4 p-5" animate={false}>
              <div>
                <h3 className="font-display text-xl font-semibold text-ink-950">GPG Subscription</h3>
                <p className="text-sm text-ink-400">Admin approval is required before GPG slots are paid.</p>
              </div>
              <Button variant="gold" onClick={subscribe}>Subscribe Current Cycle</Button>
            </Card>
          )}

          <Card className="overflow-hidden p-0" animate={false}>
            <div className="border-b border-ink-900/8 px-5 py-4">
              <h3 className="font-display text-xl font-semibold text-ink-950">Rank History</h3>
            </div>
            <Table>
              <THead columns={['Date', 'Old Rank', 'New Rank', 'Reason']} />
              <tbody>
                {(summary?.rankHistory || []).map((item) => (
                  <TRow key={item.id}>
                    <TCell>{formatDate(item.createdAt)}</TCell>
                    <TCell>{item.oldRankName || '-'}</TCell>
                    <TCell>{item.newRankName || '-'}</TCell>
                    <TCell>{item.promotionReason || '-'}</TCell>
                  </TRow>
                ))}
              </tbody>
            </Table>
          </Card>
        </div>
      )}
    </PageShell>
  )
}

export function PayoutStatementPage() {
  const { token } = useAuth()
  const toast = useToast()
  const [summary, setSummary] = useState({ totalAmount: 0, tds: 0, netAmount: 0 })
  const [rows, setRows] = useState([])

  useEffect(() => {
    let alive = true
    memberApi.payouts(token)
      .then((data) => {
        if (!alive) return
        setSummary(data.summary)
        setRows(data.items.map((item) => [
          formatDate(item.paymentDate || item.createdAt),
          item.status === 1 ? 'Distributed Payout' : 'Pending Payout',
          item.regno,
          item.name,
          Number(item.netAmount || 0).toLocaleString('en-IN'),
          item.status === 1 ? 'Credited' : 'Pending',
        ]))
      })
      .catch((error) => {
        toast.push(error.message, 'error')
        if (alive) {
          setSummary({ totalAmount: 0, tds: 0, netAmount: 0 })
          setRows([])
        }
      })
    return () => {
      alive = false
    }
  }, [token, toast])

  return (
    <PageShell title="Payout Statement" subtitle="Summary of your payout eligibility and history" icon={IndianRupee}>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5" animate={false}>
          <p className="text-xs uppercase tracking-wide text-ink-400">Total Payout</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-ink-950">₹{Number(summary.totalAmount || 0).toLocaleString('en-IN')}</p>
        </Card>
        <Card className="p-5" animate={false}>
          <p className="text-xs uppercase tracking-wide text-ink-400">TDS</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-ink-950">₹{Number(summary.tds || 0).toLocaleString('en-IN')}</p>
        </Card>
        <Card className="p-5" animate={false}>
          <p className="text-xs uppercase tracking-wide text-ink-400">Net Amount</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-emerald-mlm">₹{Number(summary.netAmount || 0).toLocaleString('en-IN')}</p>
        </Card>
      </div>
      <ReportCard title="Payout Statement" columns={['Date', 'Type', 'Member ID', 'Member', 'Amount', 'Status']} rows={rows} />
    </PageShell>
  )
}

export function IncomeDetailPage() {
  const { token } = useAuth()
  const toast = useToast()
  const [rows, setRows] = useState([])

  useEffect(() => {
    let alive = true
    memberApi.commissions(token)
      .then((data) => {
        if (!alive) return
        setRows(data.items.map((item) => [
          formatDate(item.createdAt),
          item.type,
          item.sourceRegno,
          [item.source?.firstName, item.source?.lastName].filter(Boolean).join(' ') || item.sourceRegno,
          Number(item.amount || 0).toLocaleString('en-IN'),
          item.status,
        ]))
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
    <PageShell title="My Payment History Slip" subtitle="Datewise direct and level income details" icon={Wallet}>
      <ReportCard title="Income Detail" columns={['Date', 'Income Type', 'From ID', 'From Member', 'Amount', 'Status']} rows={rows} />
    </PageShell>
  )
}

export function HelpDeskPage() {
  const { token } = useAuth()
  const toast = useToast()
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [tickets, setTickets] = useState([])
  const [saving, setSaving] = useState(false)

  const loadTickets = useCallback(() => {
    memberApi.supportTickets(token)
      .then((data) => setTickets(data.items.map((item) => [
        `HD${item.id}`,
        item.subject || '-',
        formatDate(item.createdAt),
        item.status,
      ])))
      .catch(() => setTickets([]))
  }, [token])

  useEffect(() => {
    loadTickets()
  }, [loadTickets])

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      await memberApi.createSupportTicket(token, { subject, message })
      toast.push('Support request sent.', 'success')
      setSubject('')
      setMessage('')
      loadTickets()
    } catch (error) {
      toast.push(error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageShell title="Help Desk" subtitle="Raise a support request to the admin team" icon={LifeBuoy}>
      <Card className="max-w-3xl p-6" animate={false}>
        <form className="space-y-4" onSubmit={submit}>
          <Input label="Subject" placeholder="Enter support subject" value={subject} onChange={(event) => setSubject(event.target.value)} />
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-400">Message</span>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Describe your issue clearly"
              className="min-h-24 w-full rounded-lg border border-ink-900/12 bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none transition-shadow focus:border-gold-400 focus:ring-2 focus:ring-gold-300/60"
            />
          </label>
          <Button type="submit" variant="gold" icon={Send} loading={saving}>Send Request</Button>
        </form>
      </Card>
      <ReportCard title="Help Desk Request" columns={['Ticket ID', 'Subject', 'Date', 'Status']} rows={tickets} emptyText="No support requests yet" />
    </PageShell>
  )
}

export function AddFundPage() {
  const { token, user } = useAuth()
  const toast = useToast()
  const [amount, setAmount] = useState('')
  const [walletRows, setWalletRows] = useState([])
  const [saving, setSaving] = useState(false)
  const walletBalance = walletRows.reduce((sum, row) => sum + Number(row.amount || 0), 0)

  const loadWallet = () =>
    memberApi.walletLedger(token)
      .then((data) => setWalletRows(data.items || []))
      .catch(() => setWalletRows([]))

  useEffect(() => {
    let alive = true
    memberApi.walletLedger(token)
      .then((data) => {
        if (alive) setWalletRows(data.items || [])
      })
      .catch(() => {
        if (alive) setWalletRows([])
      })
    return () => {
      alive = false
    }
  }, [token])

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      await memberApi.addFund(token, { amount: Number(amount) })
      toast.push('Fund added successfully.', 'success')
      setAmount('')
      await loadWallet()
    } catch (error) {
      toast.push(error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageShell title="Add Fund" subtitle="Add money to your shopping wallet for product purchases" icon={PlusCircleIcon}>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="overflow-hidden p-0" animate={false}>
          <div className="bg-gradient-to-r from-ink-950 to-gold-700 px-6 py-4 text-gold-100">
            <h3 className="font-display text-xl font-semibold">Online Fund Request</h3>
            <p className="text-xs text-gold-200/80">Amount will be added to shopping wallet after confirmation.</p>
          </div>
          <form className="space-y-5 p-6" onSubmit={submit}>
            <Input label="Payment User ID" value={user?.id || member.id} readOnly />
            <Input label="Full Name" value={user?.name || member.name} readOnly />
            <Input label="Amount" placeholder="Enter amount" icon={IndianRupee} value={amount} onChange={(event) => setAmount(event.target.value)} />
            <Button type="submit" variant="gold" fullWidth loading={saving} disabled>Confirm Order</Button>
          </form>
        </Card>
        <Card className="relative overflow-hidden bg-ink-950 p-6 text-gold-100" animate={false}>
          <div className="absolute -right-12 -top-14 h-40 w-40 rounded-full bg-gold-400/15 blur-3xl" />
          <Wallet size={32} className="relative text-gold-300" />
          <p className="relative mt-6 text-xs uppercase tracking-[0.22em] text-gold-500">Shopping Wallet</p>
          <p className="relative mt-2 font-mono text-4xl font-semibold">₹{walletBalance.toLocaleString('en-IN')}</p>
          <p className="relative mt-3 text-sm text-ink-400">Use wallet balance for faster checkout.</p>
        </Card>
      </div>
    </PageShell>
  )
}

function PlusCircleIcon(props) {
  return <IndianRupee {...props} />
}

export function ShoppingWalletPage() {
  const { token } = useAuth()
  const [rows, setRows] = useState([])
  const balance = rows.reduce((sum, row) => sum + Number(row.amount || 0), 0)

  useEffect(() => {
    let alive = true
    memberApi.walletLedger(token)
      .then((data) => {
        if (alive) setRows(data.items)
      })
      .catch(() => {
        if (alive) setRows([])
      })
    return () => {
      alive = false
    }
  }, [token])

  return (
    <PageShell title="Shopping Wallet" subtitle="Track available shopping wallet funds" icon={Wallet}>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6" animate={false}>
          <IndianRupee size={34} className="text-gold-600" />
          <p className="mt-4 text-xs uppercase tracking-wide text-ink-400">Shopping Wallet</p>
          <p className="font-mono text-3xl font-semibold text-ink-950">₹{balance.toLocaleString('en-IN')}</p>
        </Card>
        <Card className="p-6 md:col-span-2" animate={false}>
          <h3 className="font-display text-2xl font-semibold text-ink-950">Wallet ready for checkout</h3>
          <p className="mt-2 text-sm text-ink-400">Funds added online appear here and can be used with Pay from Wallet.</p>
        </Card>
      </div>
    </PageShell>
  )
}

export function ShoppingTransactionPage() {
  const { token } = useAuth()
  const toast = useToast()
  const [rows, setRows] = useState([])

  useEffect(() => {
    let alive = true
    memberApi.orders(token)
      .then((data) => {
        if (!alive) return
        setRows(data.transactions.map((txn) => [
          txn.amountTxnId,
          'Online Transaction',
          txn.orderId ? 'Order Payment' : 'Pay Online',
          `₹${Number(txn.transactionAmount || 0).toLocaleString('en-IN')}`,
          formatDate(txn.txnDate),
          'Success',
        ]))
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
    <PageShell title="Payment Transaction Details" subtitle="Add-fund and shopping payment history" icon={ReceiptText}>
      <ReportCard
        title="Payment Transaction Details"
        columns={['Transaction ID', 'Type', 'Mode', 'Amount', 'Date', 'Status']}
        rows={rows}
      />
    </PageShell>
  )
}

export function PaymentMethodPage() {
  const { token } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [savingMode, setSavingMode] = useState('')

  const pay = async (paymentMode) => {
    setSavingMode(paymentMode)
    try {
      const cart = await memberApi.cart(token)
      if (!cart.length) {
        toast.push('Your cart is empty. Add a product before payment.', 'error')
        navigate('/dashboard/continue-shopping')
        return
      }
      await memberApi.checkout(token, { paymentMode })
      toast.push(paymentMode === 'Wallet' ? 'Order paid from wallet.' : 'Online order created successfully.', 'success')
      navigate('/dashboard/orders/my-orders')
    } catch (error) {
      toast.push(error.message, 'error')
    } finally {
      setSavingMode('')
    }
  }

  return (
    <PageShell title="Choose Payment Method" subtitle="Select how you want to complete your product payment" icon={CreditCard}>
      <div className="mx-auto max-w-lg">
        <Card className="overflow-hidden p-0 shadow-gold-glow" animate={false}>
          <div className="bg-ink-950 px-6 py-5 text-center">
            <CreditCard className="mx-auto text-gold-300" />
            <h3 className="mt-2 font-display text-2xl font-semibold text-gold-100">Choose Payment Method</h3>
          </div>
          <div className="space-y-4 p-6">
            <Button variant="gold" fullWidth size="lg" icon={CreditCard} disabled title="Online payment is disabled for now">
              Pay Online
            </Button>
            <Button variant="primary" fullWidth size="lg" icon={Wallet} loading={savingMode === 'Wallet'} onClick={() => pay('Wallet')}>
              Pay from Wallet
            </Button>
            <p className="text-center text-xs text-ink-400">Online payment is disabled for now. Please use wallet payment.</p>
          </div>
        </Card>
      </div>
    </PageShell>
  )
}

export function MyOrdersPage() {
  const { token } = useAuth()
  const [rows, setRows] = useState([])

  useEffect(() => {
    let alive = true
    memberApi.orders(token)
      .then((data) => {
        if (!alive) return
        setRows(data.items.map((order) => [
          order.orderId,
          order.items?.[0]?.productDescription || order.shop?.shopName || 'Order',
          `₹${Number(order.totalAmount || 0).toLocaleString('en-IN')}`,
          order.paymentMode || '-',
          order.approvedStatus === 1 ? 'Approved' : 'Pending',
          formatDate(order.saleDate),
        ]))
      })
      .catch(() => {
        if (alive) setRows([])
      })
    return () => {
      alive = false
    }
  }, [token])

  return (
    <PageShell title="My Orders" subtitle="View submitted shopping orders and invoices" icon={ShoppingBag}>
      <ReportCard
        title="My Orders"
        columns={['Order ID', 'Product', 'Amount', 'Payment Mode', 'Status', 'Date']}
        rows={rows}
        emptyText="Sorry, no orders found"
      />
    </PageShell>
  )
}

const demoShopProducts = [
  {
    id: 'demo-1',
    name: 'Activation Fashion Combo',
    description: 'Starter product combo for new distributors.',
    category: 'Combos',
    brand: 'Rahuovelia',
    size: 'Free Size',
    color: 'Assorted',
    material: 'Mixed fabric',
    highlights: 'Starter distributor combo\nReady stock\nBusiness value included',
    price: 3500,
    offerPrice: 3000,
    pv: 30,
    bv: 3000,
    stock: 99,
    rating: 4.4,
  },
  {
    id: 'demo-2',
    name: 'Designer Kurti Set',
    description: 'Daily wear fashion set with business value.',
    category: 'Fashion',
    brand: 'Rahuovelia',
    size: 'M to XL',
    color: 'Pastel',
    material: 'Rayon',
    highlights: 'Comfort fit\nDaily wear\nEasy wash',
    price: 2199,
    offerPrice: 1899,
    pv: 22,
    bv: 1900,
    stock: 80,
    rating: 4.6,
  },
  {
    id: 'demo-3',
    name: 'Rahuovelia Signature Saree',
    description: 'Premium ethnic wear for partner shopping orders.',
    category: 'Ethnic',
    brand: 'Rahuovelia',
    size: '6.3 m',
    color: 'Maroon',
    material: 'Silk blend',
    highlights: 'Premium ethnic collection\nBlouse piece included\nFestival ready',
    price: 3499,
    discountPercent: 14,
    pv: 35,
    bv: 3000,
    stock: 50,
    rating: 4.8,
  },
  {
    id: 'demo-4',
    name: 'Classic Men Shirt Pack',
    description: 'Smart formal shirts with comfortable fabric finish.',
    category: 'Menswear',
    brand: 'Rahuovelia',
    size: 'M, L, XL',
    color: 'Blue',
    material: 'Cotton blend',
    highlights: 'Pack of formal shirts\nBreathable fabric\nOffice ready',
    price: 1799,
    offerPrice: 1399,
    pv: 18,
    bv: 1400,
    stock: 64,
    rating: 4.3,
  },
]

export function CartCheckoutPage() {
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [shipping, setShipping] = useState({ shipAddress: '', shipCity: '', shipState: '', shipPincode: '', shipMobile: '' })
  const [saving] = useState(false)

  const loadCart = useCallback(() => {
    memberApi.cart(token)
      .then(setItems)
      .catch(() => setItems([]))
  }, [token])

  useEffect(() => {
    loadCart()
  }, [loadCart])

  const totals = items.reduce((sum, item) => {
    const price = Number(item.product?.offerPrice || item.product?.price || 0)
    const line = price * Number(item.quantity || 1)
    const gst = line * Number(item.product?.gstPercent || 0) / 100
    return {
      subtotal: sum.subtotal + line,
      gst: sum.gst + gst,
      total: sum.total + line + gst,
    }
  }, { subtotal: 0, gst: 0, total: 0 })

  const checkout = () => {
    navigate('/dashboard/orders/payment')
  }

  return (
    <PageShell title="Shopping Cart" subtitle="Review cart, shipping address and payment summary" icon={ShoppingCart}>
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <Card className="p-6" animate={false}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-2xl font-semibold text-ink-950">My Cart</h3>
            <label className="flex items-center gap-2 text-xs text-ink-400">
              <input type="checkbox" className="accent-gold-500" /> Select All
            </label>
          </div>
          {items.length ? (
            <Table>
              <THead columns={['Product', 'Qty', 'Price', 'Total']} />
              <tbody>
                {items.map((item) => {
                  const price = Number(item.product?.offerPrice || item.product?.price || 0)
                  return (
                    <TRow key={item.id}>
                      <TCell className="font-medium text-ink-950">{item.product?.name}</TCell>
                      <TCell>{item.quantity}</TCell>
                      <TCell>₹{price.toLocaleString('en-IN')}</TCell>
                      <TCell>₹{(price * item.quantity).toLocaleString('en-IN')}</TCell>
                    </TRow>
                  )
                })}
              </tbody>
            </Table>
          ) : (
            <div className="flex min-h-36 items-center justify-center rounded-xl border border-dashed border-ink-900/12 bg-ivory-100 text-sm font-medium text-rose-mlm">
              Sorry, no product in cart
            </div>
          )}
        </Card>
        <Card className="overflow-hidden p-0" animate={false}>
          <div className="bg-gradient-to-r from-ink-950 to-gold-700 px-6 py-4 text-gold-100">
            <h3 className="font-display text-xl font-semibold">Order Summary</h3>
          </div>
          <div className="space-y-4 p-6 text-sm">
            {[
              ['Discount Subtotal', `₹${totals.subtotal.toLocaleString('en-IN')}`],
              ['Total GST', `₹${totals.gst.toLocaleString('en-IN')}`],
              ['Shipping Charge', '₹0'],
              ['Total Amount', `₹${totals.total.toLocaleString('en-IN')}`],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between border-b border-ink-900/8 pb-3">
                <span className="text-ink-400">{label}</span>
                <span className="font-mono font-semibold text-ink-950">{value}</span>
              </div>
            ))}
            <Button variant="gold" fullWidth loading={saving} onClick={checkout}>Proceed to Payment</Button>
          </div>
        </Card>
      </div>
      <Card className="p-6" animate={false}>
        <h3 className="mb-4 font-display text-2xl font-semibold text-ink-950">Add New Shipping Address</h3>
        <form className="grid gap-4 md:grid-cols-2">
          <Input label="Member ID" value={user?.id || member.id} readOnly />
          <Input label="City" placeholder="City" value={shipping.shipCity} onChange={(event) => setShipping((s) => ({ ...s, shipCity: event.target.value }))} />
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-400">Address</span>
            <textarea
              placeholder="House / Flat / Landmark"
              value={shipping.shipAddress}
              onChange={(event) => setShipping((s) => ({ ...s, shipAddress: event.target.value }))}
              className="min-h-24 w-full rounded-lg border border-ink-900/12 bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none transition-shadow focus:border-gold-400 focus:ring-2 focus:ring-gold-300/60"
            />
          </label>
          <SelectField label="State" options={states} />
          <Input label="Postal Code" placeholder="Postal Code" value={shipping.shipPincode} onChange={(event) => setShipping((s) => ({ ...s, shipPincode: event.target.value }))} />
        </form>
      </Card>
    </PageShell>
  )
}

export function ProductCatalogPage() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [products, setProducts] = useState([])
  const [cartItems, setCartItems] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [quantities, setQuantities] = useState({})
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('popular')
  const [savingId, setSavingId] = useState(null)

  const loadCart = useCallback(() => {
    memberApi.cart(token)
      .then((items) => setCartItems(items || []))
      .catch(() => setCartItems([]))
  }, [token])

  useEffect(() => {
    let alive = true
    memberApi.products(token, { limit: 100 })
      .then((data) => {
        if (alive) setProducts(data.items?.length ? data.items : demoShopProducts)
      })
      .catch(() => {
        if (alive) setProducts(demoShopProducts)
      })
    return () => {
      alive = false
    }
  }, [token])

  useEffect(() => {
    loadCart()
  }, [loadCart])

  const visibleProducts = useMemo(() => {
    const term = query.trim().toLowerCase()
    const filtered = products.filter((product) => {
      const haystack = [product.name, product.description, product.category, product.sku].filter(Boolean).join(' ').toLowerCase()
      return !term || haystack.includes(term)
    })
    return [...filtered].sort((a, b) => {
      if (sort === 'low') return productPrice(a) - productPrice(b)
      if (sort === 'high') return productPrice(b) - productPrice(a)
      if (sort === 'stock') return Number(b.stock || 0) - Number(a.stock || 0)
      return Number(b.rating || b.pv || 0) - Number(a.rating || a.pv || 0)
    })
  }, [products, query, sort])

  const cartSummary = useMemo(() => {
    const lines = cartItems.map((item) => {
      const product = item.product || products.find((p) => p.id === item.productId) || item
      const quantity = Number(item.quantity || 1)
      return {
        id: item.id || product.id,
        product,
        quantity,
        total: productPrice(product) * quantity,
      }
    })
    return {
      lines,
      count: lines.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: lines.reduce((sum, item) => sum + item.total, 0),
    }
  }, [cartItems, products])

  const add = async (product, quantity = productQuantity(product.id)) => {
    if (Number(product.stock || 0) <= 0) return
    setSavingId(product.id)
    try {
      if (String(product.id).startsWith('demo-')) {
        setCartItems((items) => addLocalCartItem(items, product, quantity))
      } else {
        await memberApi.addToCart(token, { productId: product.id, quantity })
        loadCart()
      }
      toast.push(`${product.name} added to cart.`, 'success')
    } catch (error) {
      toast.push(error.message, 'error')
    } finally {
      setSavingId(null)
    }
  }

  const buyNow = async (product) => {
    await add(product)
    navigate('/dashboard/orders/payment')
  }

  const removeCartLine = async (line) => {
    if (String(line.id).startsWith('demo-')) {
      setCartItems((items) => items.filter((item) => item.id !== line.id))
      return
    }
    try {
      await memberApi.removeCartItem(token, line.id)
      loadCart()
      toast.push('Item removed from cart.', 'success')
    } catch (error) {
      toast.push(error.message, 'error')
    }
  }

  const productQuantity = (id) => quantities[id] || 1
  const setProductQuantity = (id, next) => {
    setQuantities((current) => ({ ...current, [id]: Math.max(1, Math.min(10, next)) }))
  }
  const toggleWishlist = (id) => {
    setWishlist((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id])
  }

  return (
    <PageShell title="Continue Shopping" subtitle="Shop products, manage cart and purchase quickly" icon={ShoppingBag}>
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <Card className="p-4" animate={false}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search products, SKU or category"
                  className="h-11 w-full rounded-lg border border-ink-900/10 bg-white pl-10 pr-3 text-sm outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-300/60"
                />
              </div>
              <div className="grid grid-cols-3 gap-2 sm:flex">
                {[
                  ['popular', 'Popular'],
                  ['low', 'Price Low'],
                  ['high', 'Price High'],
                  ['stock', 'In Stock'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSort(value)}
                    className={`h-11 rounded-lg border px-3 text-xs font-semibold transition ${sort === value ? 'border-gold-500 bg-gold-100 text-gold-800' : 'border-ink-900/10 bg-white text-ink-500 hover:border-gold-300'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {visibleProducts.map((product) => {
              const price = productPrice(product)
              const mrp = Number(product.price || 0)
              const quantity = productQuantity(product.id)
              const inStock = Number(product.stock || 0) > 0
              const wished = wishlist.includes(product.id)
              return (
                <Card key={product.id} className="flex min-h-[520px] flex-col overflow-hidden p-0" animate={false} hover>
                  <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gold-100 text-gold-700">
                    {productImage(product) ? (
                      <img src={productImage(product)} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <ShoppingBag size={42} />
                    )}
                    <button
                      type="button"
                      onClick={() => toggleWishlist(product.id)}
                      className={`absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full border bg-white shadow-sm transition ${wished ? 'border-rose-mlm text-rose-mlm' : 'border-white text-ink-400 hover:text-rose-mlm'}`}
                      aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <Heart size={18} fill={wished ? 'currentColor' : 'none'} />
                    </button>
                    <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink-700 shadow-sm">
                      {product.category || product.sku || 'Rahuovelia'}
                    </span>
                    {!inStock && (
                      <span className="absolute bottom-3 left-3 rounded-full bg-rose-mlm px-3 py-1 text-xs font-semibold text-white">
                        Out of stock
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display text-xl font-semibold text-ink-950">{product.name}</h3>
                        <p className="mt-1 line-clamp-2 min-h-10 text-sm text-ink-400">{product.description || 'Rahuovelia product'}</p>
                      </div>
                      <span className="flex shrink-0 items-center gap-1 rounded-lg bg-emerald-mlm px-2 py-1 text-xs font-semibold text-white">
                        <Star size={12} fill="currentColor" /> {Number(product.rating || 4.2).toFixed(1)}
                      </span>
                    </div>

                    <div className="mt-4 flex items-end justify-between gap-3">
                      <div>
                        <p className="font-mono text-3xl font-semibold text-gold-700">₹{money(price)}</p>
                        {mrp > price && (
                          <p className="text-xs text-ink-400">
                            <span className="line-through">₹{money(mrp)}</span>
                            <span className="ml-2 font-semibold text-emerald-mlm">{Math.round(((mrp - price) / mrp) * 100)}% off</span>
                          </p>
                        )}
                      </div>
                      <div className="flex h-10 items-center rounded-lg border border-ink-900/10 bg-white">
                        <button type="button" className="grid h-10 w-9 place-items-center text-ink-500" onClick={() => setProductQuantity(product.id, quantity - 1)}>
                          -
                        </button>
                        <span className="w-8 text-center font-mono text-sm font-semibold">{quantity}</span>
                        <button type="button" className="grid h-10 w-9 place-items-center text-ink-500" onClick={() => setProductQuantity(product.id, quantity + 1)}>
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge tone={inStock ? 'success' : 'danger'} className="w-fit">
                        {inStock ? `Stock ${product.stock}` : 'Out of stock'}
                      </Badge>
                      {product.brand && <Badge tone="neutral" className="w-fit">{product.brand}</Badge>}
                      {product.size && <Badge tone="neutral" className="w-fit">Size {product.size}</Badge>}
                      {product.color && <Badge tone="neutral" className="w-fit">{product.color}</Badge>}
                      <Badge tone="neutral" className="w-fit">PV {Number(product.pv || 0)}</Badge>
                      <Badge tone="neutral" className="w-fit">BV {Number(product.bv || price)}</Badge>
                    </div>

                    {product.highlights && (
                      <div className="mt-3 space-y-1 rounded-lg bg-ivory-100/70 p-3">
                        {String(product.highlights).split(/\n|,/).filter(Boolean).slice(0, 3).map((item) => (
                          <p key={item} className="text-xs text-ink-500">{item.trim()}</p>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto grid gap-2 pt-5 sm:grid-cols-2">
                      <Button
                        variant="outline"
                        icon={ShoppingCart}
                        disabled={!inStock}
                        loading={savingId === product.id}
                        onClick={() => add(product, quantity)}
                      >
                        Add to Cart
                      </Button>
                      <Button
                        variant="gold"
                        disabled={!inStock}
                        onClick={() => buyNow(product)}
                      >
                        Purchase
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {!visibleProducts.length && (
            <Card className="p-8 text-center" animate={false}>
              <h3 className="font-display text-2xl font-semibold text-ink-950">No products found</h3>
              <p className="mt-2 text-sm text-ink-400">Try a different search or clear the filter.</p>
            </Card>
          )}
        </div>

        <Card className="sticky top-5 h-fit overflow-hidden p-0" animate={false}>
          <div className="bg-ink-950 px-5 py-4 text-gold-100">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-semibold">My Cart</h3>
              <Badge tone="gold">{cartSummary.count} items</Badge>
            </div>
            <p className="mt-1 text-xs text-ink-400">{wishlist.length} saved in wishlist</p>
          </div>
          <div className="max-h-80 space-y-3 overflow-y-auto p-4">
            {cartSummary.lines.length ? cartSummary.lines.map((line) => (
              <div key={line.id} className="flex items-start gap-3 rounded-lg border border-ink-900/8 bg-ivory-100/50 p-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-gold-100 text-gold-700">
                  {productImage(line.product) ? <img src={productImage(line.product)} alt="" className="h-full w-full object-cover" /> : <ShoppingBag size={18} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-950">{line.product.name}</p>
                  <p className="font-mono text-xs text-ink-400">Qty {line.quantity} x ₹{money(productPrice(line.product))}</p>
                  <p className="mt-1 font-mono text-sm font-semibold text-gold-700">₹{money(line.total)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeCartLine(line)}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-400 transition hover:bg-rose-mlm/10 hover:text-rose-mlm"
                  aria-label="Remove item"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            )) : (
              <div className="rounded-lg border border-dashed border-ink-900/12 p-6 text-center">
                <ShoppingCart className="mx-auto text-gold-600" />
                <p className="mt-2 text-sm font-semibold text-ink-950">Cart is empty</p>
                <p className="mt-1 text-xs text-ink-400">Add products to start shopping.</p>
              </div>
            )}
          </div>
          <div className="border-t border-ink-900/8 p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-400">Subtotal</span>
              <span className="font-mono text-xl font-semibold text-ink-950">₹{money(cartSummary.subtotal)}</span>
            </div>
            <Button className="mt-4" variant="gold" fullWidth disabled={!cartSummary.count} onClick={() => navigate('/dashboard/orders/payment')}>
              Purchase Cart
            </Button>
            <Button className="mt-2" variant="outline" fullWidth onClick={() => navigate('/dashboard/orders/my-orders')}>
              My Orders
            </Button>
          </div>
        </Card>
      </div>
    </PageShell>
  )
}

function productPrice(product) {
  const price = Number(product.price || 0)
  if (product.offerPrice) return Number(product.offerPrice)
  if (product.discountPercent) return Math.max(0, price - (price * Number(product.discountPercent)) / 100)
  return price
}

function money(value) {
  return Number(value || 0).toLocaleString('en-IN')
}

function productImage(product) {
  if (product.imageData && product.imageMime) return `data:${product.imageMime};base64,${product.imageData}`
  return product.imageUrl || ''
}

function addLocalCartItem(items, product, quantity) {
  const existing = items.find((item) => item.id === product.id)
  if (existing) {
    return items.map((item) => item.id === product.id ? { ...item, quantity: Number(item.quantity || 1) + quantity } : item)
  }
  return [...items, { id: product.id, product, productId: product.id, quantity }]
}

export function UserComingSoonPage({ title = 'Member Section' }) {
  return (
    <PageShell title={title} subtitle="This member module is not available" icon={BadgeCheck}>
      <Card className="p-8 text-center" animate={false}>
        <h3 className="font-display text-2xl font-semibold text-ink-950">{title}</h3>
        <p className="mx-auto mt-2 max-w-xl text-sm text-ink-400">
          This route is not configured for the current dashboard.
        </p>
      </Card>
    </PageShell>
  )
}

export default function UserProfileRouter() {
  const { pathname } = useLocation()
  const map = {
    '/dashboard/profile/edit': <EditProfilePage />,
    '/dashboard/profile/welcome-letter': <WelcomeLetterPage />,
    '/dashboard/profile/id-card': <IdCardPage />,
    '/dashboard/profile/change-password': <ChangePasswordPage />,
    '/dashboard/kyc/bank': <BankDetailsPage />,
    '/dashboard/kyc/pan': <PanUploadPage />,
    '/dashboard/kyc/aadhaar': <AadhaarUploadPage />,
    '/dashboard/register-member': <MemberRegisterPage />,
    '/dashboard/business/direct': <DirectDownlinePage />,
    '/dashboard/business/level-tree': <LevelTreePage />,
    '/dashboard/business/downline': <DownlineReportPage />,
    '/dashboard/business/mlm-status': <MlmStatusPage />,
    '/dashboard/license/activation': <LicensePage />,
    '/dashboard/license/used': <LicensePage used />,
    '/dashboard/payout/statement': <PayoutStatementPage />,
    '/dashboard/payout/income-detail': <IncomeDetailPage />,
    '/dashboard/support/help-desk': <HelpDeskPage />,
    '/dashboard/support/contact-us': <HelpDeskPage />,
    '/dashboard/orders/add-fund': <AddFundPage />,
    '/dashboard/orders/transactions': <ShoppingTransactionPage />,
    '/dashboard/orders/wallet': <ShoppingWalletPage />,
    '/dashboard/orders/payment': <PaymentMethodPage />,
    '/dashboard/orders/my-orders': <MyOrdersPage />,
    '/dashboard/continue-shopping': <ProductCatalogPage />,
  }

  return map[pathname] || <UserComingSoonPage />
}
