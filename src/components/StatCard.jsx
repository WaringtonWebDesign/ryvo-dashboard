import {
  ArrowUpRight, ArrowDownRight,
  Users, Printer, Gamepad2, PoundSterling, ShoppingBag, Boxes, Percent,
} from 'lucide-react'
import GlassCard from './GlassCard'

// Icon names used in mockData.js → lucide components
const iconMap = { Users, Printer, Gamepad2, PoundSterling, ShoppingBag, Boxes, Percent }

export default function StatCard({ label, value, change, icon, accent = false, live = false, note, onClick }) {
  const Icon = typeof icon === 'string' ? iconMap[icon] : icon
  const up = change >= 0
  return (
    <GlassCard onClick={onClick} label={onClick ? `${label}: open` : undefined}
      className={
        accent
          ? '!border-emerald-200/40 !bg-transparent bg-gradient-to-br from-emerald-400/95 via-emerald-500/90 to-emerald-700/95'
          : ''
      }
    >
      <div className="flex items-start justify-between gap-3">
        <p className={`text-sm ${accent ? 'text-white/85' : 'text-white/60'}`}>{label}</p>
        {Icon && (
          <span
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
              accent ? 'bg-white/25' : 'bg-white/15'
            }`}
          >
            <Icon size={17} />
          </span>
        )}
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
      {live ? (
        <div className="mt-3 flex items-center gap-2 text-xs">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-semibold ${accent ? 'bg-white/25' : 'bg-emerald-400/25 text-emerald-100'}`}>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
            LIVE
          </span>
          <span className={`truncate ${accent ? 'text-white/80' : 'text-white/60'}`}>{note}</span>
        </div>
      ) : note ? (
        <p className={`mt-3 truncate text-xs ${accent ? 'text-white/85' : 'text-white/60'}`}>{note}</p>
      ) : (
      <div className="mt-3 flex items-center gap-2 text-xs">
        <span
          className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-semibold ${
            accent
              ? 'bg-white/25 text-white'
              : up
                ? 'bg-emerald-400/25 text-emerald-100'
                : 'bg-rose-400/30 text-rose-100'
          }`}
        >
          {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {Math.abs(change).toFixed(1)}%
        </span>
        <span className={accent ? 'text-white/80' : 'text-white/60'}>vs last month</span>
      </div>
      )}
    </GlassCard>
  )
}
