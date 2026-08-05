import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { UserRound, Lock, ArrowRight, Crown } from 'lucide-react'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import logo from '../assets/logo.jpeg'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Login() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('member')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const isAdmin = mode === 'admin'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login({ identifier, password, asAdmin: isAdmin })
      toast.push(`Welcome back${isAdmin ? ', admin' : ''}.`, 'success')
      navigate(isAdmin ? '/admin' : '/dashboard')
    } catch (error) {
      toast.push(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink-950 p-12 lg:flex">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-gold-500/5 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative flex items-center gap-3"
        >
          <img src={logo} className="h-11 w-11 rounded-full object-cover ring-1 ring-gold-400/40" />
          <div>
            <p className="font-display text-xl font-semibold text-gold-100">Rahuovelia</p>
            <p className="text-[10px] uppercase tracking-[0.25em] text-gold-500/70">Fashion Retail OPC</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative"
        >
          <Crown className="mb-6 text-gold-400" size={28} strokeWidth={1.5} />
          <h2 className="font-display text-4xl font-semibold leading-tight text-ivory-50">
            Where every referral is <span className="text-gold-300 italic">tailored</span> to success.
          </h2>
          <p className="mt-4 max-w-sm text-sm text-ink-400">
            Manage your network, track commissions and grow your Rahuovelia business — all from one refined
            dashboard.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="crown-divider relative text-[10px] uppercase tracking-[0.2em] text-ink-400"
        >
          <span>Est. 2025</span>
        </motion.div>
      </div>

      {/* Form panel */}
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

          <h1 className="font-display text-3xl font-semibold text-ink-950">Sign in</h1>
          <p className="mt-1.5 text-sm text-ink-400">
            Access your {isAdmin ? 'admin console' : 'member dashboard'}.
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 rounded-lg border border-ink-900/10 bg-white p-1">
              {[
                ['member', 'Member'],
                ['admin', 'Admin'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMode(value)}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                    mode === value
                      ? 'bg-ink-950 text-gold-100 shadow-sm'
                      : 'text-ink-500 hover:bg-ink-900/5 hover:text-ink-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <Input
              label={isAdmin ? 'Admin username' : 'Member login ID'}
              icon={UserRound}
              placeholder={isAdmin ? 'Admin' : 'Email, regno, mobile or username'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 text-ink-400">
                <input type="checkbox" className="rounded border-ink-900/20 text-gold-500 focus:ring-gold-300" />
                Remember me
              </label>
              <a href="#" className="font-medium text-gold-700 hover:text-gold-600">
                Forgot password?
              </a>
            </div>

            <Button type="submit" variant="gold" fullWidth loading={loading} iconRight={ArrowRight} size="lg">
              Sign in as {isAdmin ? 'Admin' : 'Member'}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-ink-400">
            New to Rahuovelia?{' '}
            <Link to="/register" className="font-medium text-gold-700 hover:text-gold-600">
              Create an account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
