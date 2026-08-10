import clsx from 'clsx'

export function Table({ children, className }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-ink-900/8">
      <table className={clsx('w-full min-w-max text-left text-sm', className)}>{children}</table>
    </div>
  )
}

export function THead({ columns }) {
  return (
    <thead>
      <tr className="border-b border-ink-900/8 bg-ivory-100/60">
        {columns.map((c) => (
          <th key={c} className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
            {c}
          </th>
        ))}
      </tr>
    </thead>
  )
}

export function TRow({ children, className }) {
  return (
    <tr className={clsx('border-b border-ink-900/6 last:border-0 transition-colors hover:bg-gold-50/40 hover:bg-gold-100/20', className)}>
      {children}
    </tr>
  )
}

export function TCell({ children, className, ...props }) {
  return <td className={clsx('whitespace-nowrap px-4 py-3.5 text-ink-800', className)} {...props}>{children}</td>
}

export function Pagination({ meta, page, limit, onPageChange, onLimitChange }) {
  const total = Number(meta?.total || 0)
  const currentPage = Number(meta?.page || page || 1)
  const pageSize = Number(meta?.limit || limit || 25)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = total ? (currentPage - 1) * pageSize + 1 : 0
  const end = Math.min(total, currentPage * pageSize)

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-xl border border-ink-900/8 bg-white px-4 py-3 text-sm text-ink-500 sm:flex-row sm:items-center sm:justify-between">
      <span>
        Showing <span className="font-mono text-ink-900">{start}</span>-<span className="font-mono text-ink-900">{end}</span> of{' '}
        <span className="font-mono text-ink-900">{total}</span>
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={pageSize}
          onChange={(event) => onLimitChange?.(Number(event.target.value))}
          className="h-9 rounded-lg border border-ink-900/12 bg-white px-2 text-xs outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-300/60"
        >
          {[10, 25, 50, 100].map((value) => (
            <option key={value} value={value}>{value} / page</option>
          ))}
        </select>
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange?.(currentPage - 1)}
          className="h-9 rounded-lg border border-ink-900/12 px-3 text-xs font-medium text-ink-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        <span className="font-mono text-xs text-ink-700">{currentPage} / {totalPages}</span>
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange?.(currentPage + 1)}
          className="h-9 rounded-lg border border-ink-900/12 px-3 text-xs font-medium text-ink-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  )
}
