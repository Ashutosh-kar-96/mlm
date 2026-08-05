import { motion } from 'framer-motion'
import Avatar from '../ui/Avatar'

const rankTone = {
  'Zonal Sales Executive': 'border-emerald-mlm bg-emerald-mlm/10',
  'Senior Sales Executive': 'border-gold-500 bg-gold-100',
  'Junior Sales Executive': 'border-gold-400 bg-gold-100/80',
  'Sales Executive': 'border-gold-300 bg-gold-100/60',
  Promoter: 'border-ink-900/20 bg-ivory-100',
  'Vision Influencer': 'border-ink-900/15 bg-ivory-100',
  'Fashion Influencer': 'border-ink-900/10 bg-ivory-100',
  'Free Signup': 'border-ink-900/10 bg-ivory-100',
  Member: 'border-ink-900/10 bg-ivory-100',
}

export default function TreeNode({ node, depth = 0 }) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: depth * 0.08 }}
        className={`flex min-w-[150px] flex-col items-center gap-1.5 rounded-xl border px-4 py-3 shadow-sm ${
          rankTone[node.rank] || rankTone.Member
        }`}
      >
        <Avatar name={node.name} size={32} />
        <span className="text-xs font-semibold text-ink-950">{node.name}</span>
        <span className="font-mono text-[10px] text-ink-400">{node.id}</span>
        <span className="text-[10px] font-medium uppercase tracking-wide text-gold-700">{node.rank}</span>
      </motion.div>

      {node.children?.length > 0 && (
        <>
          <div className="h-6 w-px bg-ink-900/15" />
          <div className="flex gap-8">
            {node.children.map((child, i) => (
              <div key={child.id} className="flex flex-col items-center">
                <div className="flex w-full justify-center">
                  {node.children.length > 1 && (
                    <div
                      className={`h-px bg-ink-900/15 ${
                        i === 0 ? 'w-1/2 self-end' : i === node.children.length - 1 ? 'w-1/2 self-start' : 'w-full'
                      }`}
                    />
                  )}
                </div>
                <TreeNode node={child} depth={depth + 1} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
