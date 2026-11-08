import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { Clock, Flame, Layers, Thermometer } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import GlassCard from '../components/GlassCard'
import ChartCard, { tooltipProps } from '../components/ChartCard'
import DataTable from '../components/DataTable'
import { useDetail } from '../components/DetailSheet'
import StatusPill from '../components/StatusPill'
import { printer, filament, printQueue, filamentUsage } from '../data/mockData'

function Metric({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-xl bg-white/10 px-3 py-3">
      <p className="flex items-center gap-1.5 text-xs text-white/60">
        <Icon size={13} /> {label}
      </p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
      {sub && <p className="text-xs text-white/50">{sub}</p>}
    </div>
  )
}

function Bar({ value, color }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/15">
      <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
    </div>
  )
}

export default function Printing() {
  const { openDetail } = useDetail()
  const currentJob = printQueue.find((q) => q.status === 'Printing')
  const totalUsage = filamentUsage.reduce((n, f) => n + f.value, 0)

  return (
    <>
      <PageHeader title="3D Printing" subtitle={`${printer.name} · live status, spools and the queue.`} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        {/* Printer status */}
        <GlassCard className="xl:col-span-3" onClick={() => currentJob && openDetail('job', currentJob.id)} label="Current print job: open details">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-white/60">Current job</p>
              <h3 className="mt-1 break-all text-xl font-semibold">{printer.currentJob}</h3>
            </div>
            <StatusPill status={printer.status} />
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-4xl font-bold tracking-tight">{printer.progress}%</span>
              <span className="text-sm text-white/60">Layer {printer.layer}</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-emerald-500"
                style={{ width: `${printer.progress}%` }}
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Metric icon={Clock} label="Time left" value={printer.timeLeft} />
            <Metric icon={Flame} label="Nozzle" value={`${printer.nozzleTemp}°C`} sub={`target ${printer.nozzleTarget}°C`} />
            <Metric icon={Thermometer} label="Bed" value={`${printer.bedTemp}°C`} sub={`target ${printer.bedTarget}°C`} />
            <Metric icon={Layers} label="Queue" value={`${printQueue.filter((q) => q.status === 'Queued').length} jobs`} />
          </div>
        </GlassCard>

        {/* Filament inventory */}
        <GlassCard className="xl:col-span-2">
          <h3 className="text-base font-semibold">Filament inventory</h3>
          <p className="mt-0.5 text-sm text-white/60">Remaining per spool</p>
          <ul className="mt-5 space-y-4">
            {filament.map((f) => (
              <li key={f.id}>
                <button type="button" onClick={() => openDetail('spool', f.id)} className="-mx-2 block w-[calc(100%+1rem)] rounded-lg px-2 py-1.5 text-left transition hover:bg-white/10">
                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="h-3 w-3 shrink-0 rounded-full ring-1 ring-white/40" style={{ background: f.color }} />
                    <span className="truncate">{f.name}</span>
                  </span>
                  <span className={f.remaining < 25 ? 'font-semibold text-rose-200' : 'text-white/70'}>
                    {f.remaining}%
                  </span>
                </div>
                <Bar value={f.remaining} color={f.color} />
                </button>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-5">
        <DataTable
          className="xl:col-span-3"
          title="Print queue"
          rows={printQueue}
          onRowClick={(r) => openDetail('job', r.id)}
          columns={[
            { key: 'file', header: 'File', render: (r) => <span className="break-all font-medium">{r.file}</span> },
            { key: 'material', header: 'Material', hideOnMobile: true },
            { key: 'time', header: 'Est. time', hideOnMobile: true, className: 'whitespace-nowrap text-white/70' },
            { key: 'status', header: 'Status', render: (r) => <StatusPill status={r.status} /> },
          ]}
        />

        <ChartCard className="xl:col-span-2" title="Filament usage" subtitle="Grams by material, last 30 days">
          <div className="relative mx-auto h-52 max-w-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={filamentUsage}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="68%"
                  outerRadius="95%"
                  paddingAngle={3}
                  cornerRadius={8}
                  stroke="none"
                >
                  {filamentUsage.map((f) => (
                    <Cell key={f.name} fill={f.color} />
                  ))}
                </Pie>
                <Tooltip {...tooltipProps} formatter={(v) => `${v} g`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
              <div>
                <p className="text-2xl font-bold">{(totalUsage / 1000).toFixed(1)} kg</p>
                <p className="text-xs text-white/60">total</p>
              </div>
            </div>
          </div>
          <ul className="mt-5 space-y-3">
            {filamentUsage.map((f) => {
              const pct = Math.round((f.value / totalUsage) * 100)
              return (
                <li key={f.name}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full ring-1 ring-white/40" style={{ background: f.color }} />
                      {f.name}
                    </span>
                    <span className="text-white/70">
                      {f.value} g · {pct}%
                    </span>
                  </div>
                  <Bar value={pct} color={f.color} />
                </li>
              )
            })}
          </ul>
        </ChartCard>
      </div>
    </>
  )
}
