import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-gold-300/40 bg-ink-950 px-3 py-2 text-xs text-gold-100 shadow-lg">
      <p className="font-medium">{label}</p>
      <p className="font-mono text-gold-300">₹{payload[0].value.toLocaleString('en-IN')}</p>
    </div>
  )
}

export default function EarningsAreaChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c19a2e" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#c19a2e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#17161a10" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6e6a72' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#6e6a72' }} axisLine={false} tickLine={false} width={40} />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="earnings"
          stroke="#9c7a1e"
          strokeWidth={2.5}
          fill="url(#goldFill)"
          animationDuration={900}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
