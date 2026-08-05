import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import Card from './Card'
import { useEffect, useState } from 'react'

function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let raf
    const start = performance.now()
    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(target * eased)
      if (progress < 1) raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}

export default function StatCard({ label, value, prefix = '', suffix = '', icon: Icon, delta, delay = 0, mono = true }) {
  const animated = useCountUp(typeof value === 'number' ? value : 0)
  const display = typeof value === 'number' ? Math.round(animated).toLocaleString('en-IN') : value
  const positive = delta >= 0

  return (
    <Card delay={delay} className="p-5" hover>
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-400">{label}</span>
        {Icon && (
          <span className="rounded-lg bg-gold-100 p-2 text-gold-600">
            <Icon size={16} strokeWidth={1.8} />
          </span>
        )}
      </div>
      <div className={`mt-3 text-2xl font-semibold text-ink-950 ${mono ? 'font-mono' : ''}`}>
        {prefix}
        {display}
        {suffix}
      </div>
      {delta !== undefined && (
        <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${positive ? 'text-emerald-mlm' : 'text-rose-mlm'}`}>
          {positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {Math.abs(delta)}% this month
        </div>
      )}
    </Card>
  )
}
