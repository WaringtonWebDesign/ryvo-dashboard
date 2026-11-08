import GlassCard from './GlassCard'

export default function ChartCard({ title, subtitle, action, children, className = '' }) {
  return (
    <GlassCard className={className}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          {subtitle && <p className="mt-0.5 text-sm text-white/60">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </GlassCard>
  )
}

// Shared chart palette + recharts styling so every chart matches.
export const palette = {
  charcoal: '#2a2522',
  emerald: '#10b981',
  coral: '#fb7a6b',
  cream: '#f8f3ea',
}

export const axisProps = {
  tick: { fill: 'rgba(255,255,255,0.65)', fontSize: 12 },
  tickLine: false,
  axisLine: false,
}

export const gridProps = {
  stroke: 'rgba(255,255,255,0.12)',
  strokeDasharray: '4 6',
  vertical: false,
}

export const tooltipProps = {
  cursor: { fill: 'rgba(255,255,255,0.08)', stroke: 'rgba(255,255,255,0.3)' },
  contentStyle: {
    background: 'rgba(40, 28, 20, 0.8)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 12,
    color: '#fff',
    fontSize: 12,
  },
  labelStyle: { color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  itemStyle: { color: '#fff', padding: 0 },
}

export function Legend({ items }) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-white/75">
      {items.map((i) => (
        <span key={i.label} className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full ring-1 ring-white/30" style={{ background: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  )
}
