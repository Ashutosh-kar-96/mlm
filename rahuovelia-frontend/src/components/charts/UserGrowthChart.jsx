import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-gold-300/40 bg-ink-950 px-3 py-2 text-xs text-gold-100 shadow-lg">
      <p className="font-medium">{label}</p>
      <p className="font-mono text-gold-300">{payload[0].value.toLocaleString('en-IN')} users</p>
    </div>
  )
}

export default function UserGrowthChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#17161a10" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6e6a72' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#6e6a72' }} axisLine={false} tickLine={false} width={40} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#c19a2e10' }} />
        <Bar dataKey="users" radius={[6, 6, 0, 0]} fill="#c19a2e" animationDuration={900} />
      </BarChart>
    </ResponsiveContainer>
  )
}
