const palette = ['bg-gold-400', 'bg-ink-700', 'bg-emerald-mlm', 'bg-rose-mlm', 'bg-gold-600']

function hashColor(name = '') {
  const idx = name.charCodeAt(0) % palette.length
  return palette[idx] || palette[0]
}

export default function Avatar({ name = '?', size = 36, ring = false }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-semibold text-white ${hashColor(name)} ${
        ring ? 'ring-2 ring-gold-300/60 ring-offset-2' : ''
      }`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </span>
  )
}
