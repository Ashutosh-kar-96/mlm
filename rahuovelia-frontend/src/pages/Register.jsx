import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { User, Mail, Lock, Hash, ArrowRight, Crown } from 'lucide-react'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import logo from '../assets/logo.jpeg'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Register() {
  const [params] = useSearchParams()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    sponsor: params.get('ref') || '',
  })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(form)
      toast.push('Account created. Welcome to Rahuovelia!', 'success')
      navigate('/dashboard')
    } catch (error) {
      toast.push(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink-950 p-12 lg:flex">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-gold-500/5 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <img src={logo} className="h-11 w-11 rounded-full object-cover ring-1 ring-gold-400/40" />
          <div>
            <p className="font-display text-xl font-semibold text-gold-100">Rahuovelia</p>
            <p className="text-[10px] uppercase tracking-[0.25em] text-gold-500/70">Fashion Retail OPC</p>
          </div>
        </div>

        <div className="relative">
          <Crown className="mb-6 text-gold-400" size={28} strokeWidth={1.5} />
          <h2 className="font-display text-4xl font-semibold leading-tight text-ivory-50">
            Build your own <span className="text-gold-300 italic">couture</span> network.
          </h2>
          <ul className="mt-6 space-y-3 text-sm text-ink-400">
            {['Earn on every direct & level referral', 'Track your matrix in real time', 'Fast, verified payouts'].map(
              (t) => (
                <li key={t} className="flex items-center gap-2.5">
                  <span className="h-1 w-1 rounded-full bg-gold-400" /> {t}
                </li>
              )
            )}
          </ul>
        </div>

        <div className="crown-divider relative text-[10px] uppercase tracking-[0.2em] text-ink-400">
          <span>Est. 2025</span>
        </div>
      </div>

      <div className="flex items-center justify-center bg-ivory-50 px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <img src={logo} className="h-10 w-10 rounded-full object-cover ring-1 ring-gold-400/40" />
            <p className="font-display text-lg font-semibold text-ink-950">Rahuovelia</p>
          </div>

          <h1 className="font-display text-3xl font-semibold text-ink-950">Create your account</h1>
          <p className="mt-1.5 text-sm text-ink-400">Join the Rahuovelia partner network.</p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <Input label="Full name" icon={User} placeholder="Ananya Sharma" value={form.name} onChange={update('name')} required />
            <Input label="Email address" type="email" icon={Mail} placeholder="you@example.com" value={form.email} onChange={update('email')} required />
            <Input label="Password" type="password" icon={Lock} placeholder="••••••••" value={form.password} onChange={update('password')} required />
            <Input
              label="Sponsor referral code"
              icon={Hash}
              placeholder="RHV0087"
              value={form.sponsor}
              onChange={update('sponsor')}
            />

            <Button type="submit" variant="gold" fullWidth loading={loading} iconRight={ArrowRight} size="lg" className="!mt-6">
              Create account
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-ink-400">
            Already registered?{' '}
            <Link to="/login" className="font-medium text-gold-700 hover:text-gold-600">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
