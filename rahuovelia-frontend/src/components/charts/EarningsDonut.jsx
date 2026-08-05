import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const toneColors = { gold: '#c19a2e', emerald: '#4c8d6d', rose: '#b1523f', ink: '#211f24' }

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="rounded-lg border border-gold-300/40 bg-ink-950 px-3 py-2 text-xs text-gold-100 shadow-lg">
      <p className="font-medium">{d.name}</p>
      <p className="font-mono text-gold-300">₹{d.value.toLocaleString('en-IN')}</p>
    </div>
  )
}

export default function EarningsDonut({ data }) {
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius={62}
            outerRadius={90}
            paddingAngle={3}
            cornerRadius={6}
            animationDuration={900}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={toneColors[entry.tone]} stroke="none" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-lg font-semibold text-ink-950">
          ₹{(data.reduce((a, b) => a + b.value, 0) / 1000).toFixed(0)}K
        </span>
        <span className="text-[10px] uppercase tracking-wide text-ink-400">Total Earned</span>
      </div>
    </div>
  )
}
