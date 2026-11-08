const green = 'bg-emerald-400/20 text-emerald-100 ring-emerald-300/40'
const blue = 'bg-sky-400/20 text-sky-100 ring-sky-300/40'
const amber = 'bg-amber-300/20 text-amber-100 ring-amber-200/40'
const red = 'bg-rose-400/25 text-rose-100 ring-rose-300/40'
const grey = 'bg-white/15 text-white/80 ring-white/25'

const styles = {
  Completed: [green, 'bg-emerald-300'],
  Live: [green, 'bg-emerald-300'],
  Active: [green, 'bg-emerald-300'],
  Printing: [blue, 'bg-sky-300'],
  'In development': [blue, 'bg-sky-300'],
  Pending: [amber, 'bg-amber-200'],
  Queued: [amber, 'bg-amber-200'],
  'Low stock': [amber, 'bg-amber-200'],
  Failed: [red, 'bg-rose-300'],
  'Sold out': [red, 'bg-rose-300'],
  Planning: [grey, 'bg-white/60'],
  Draft: [grey, 'bg-white/60'],
  // Project health
  Fresh: [green, 'bg-emerald-300'],
  Quiet: [amber, 'bg-amber-200'],
  Stale: [red, 'bg-rose-300'],
  Missing: [red, 'bg-rose-300'],
  // Goals table (vault wording)
  'In progress': [blue, 'bg-sky-300'],
  'Not set': [grey, 'bg-white/60'],
}

export default function StatusPill({ status }) {
  const [pill, dot] = styles[status] ?? [grey, 'bg-white/60']
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${pill}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  )
}
