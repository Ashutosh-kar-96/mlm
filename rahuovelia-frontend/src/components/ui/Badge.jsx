import clsx from 'clsx'
import { Crown } from 'lucide-react'

const tones = {
  gold: 'bg-gold-100 text-gold-700 border-gold-300/60',
  success: 'bg-emerald-mlm/10 text-emerald-mlm border-emerald-mlm/25',
  danger: 'bg-rose-mlm/10 text-rose-mlm border-rose-mlm/25',
  neutral: 'bg-ink-900/5 text-ink-700 border-ink-900/10',
  ink: 'bg-ink-950 text-gold-200 border-ink-950',
}

export function Badge({ children, tone = 'neutral', className, icon: Icon }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase',
        tones[tone],
        className
      )}
    >
      {Icon && <Icon size={11} strokeWidth={2} />}
      {children}
    </span>
  )
}

const rankCrowns = {
  'Zonal Sales Executive': 4,
  'Senior Sales Executive': 3,
  'Junior Sales Executive': 3,
  'Sales Executive': 2,
  Promoter: 2,
  'Vision Influencer': 1,
  'Fashion Influencer': 1,
  'Free Signup': 1,
}

export function RankBadge({ rank }) {
  const crowns = rankCrowns[rank] || 0
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-300/50 bg-gradient-to-r from-gold-100 to-ivory-100 px-3 py-1 text-xs font-semibold text-gold-700">
      <span className="flex">
        {Array.from({ length: Math.max(crowns, 1) }).map((_, i) => (
          <Crown key={i} size={12} className="fill-gold-400 text-gold-600 -ml-1 first:ml-0" strokeWidth={1.5} />
        ))}
      </span>
      {rank}
    </span>
  )
}
