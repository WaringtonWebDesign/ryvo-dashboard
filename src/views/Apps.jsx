import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { ArrowRight, ChevronRight, Users } from 'lucide-react'
import { useDetail } from '../components/DetailSheet'
import PageHeader from '../components/PageHeader'
import GlassCard from '../components/GlassCard'
import ChartCard, { axisProps, gridProps, tooltipProps, palette, Legend } from '../components/ChartCard'
import DataTable from '../components/DataTable'
import StatusPill from '../components/StatusPill'
import Sparkline from '../components/Sparkline'
import { apps, appUsersTrend, recentReleases } from '../data/mockData'

const series = [
  { key: 'Intofy', color: palette.coral },
  { key: 'Sparesy', color: palette.charcoal },
  { key: 'Selvo', color: palette.emerald },
]

export default function Apps() {
  const { openDetail } = useDetail()
  return (
    <>
      <PageHeader title="Apps" subtitle="Tap an app for revenue, subscriptions, pricing and roadmap." />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {apps.map((app) => (
          <GlassCard key={app.id} onClick={() => openDetail('app', app.id)} label={`${app.name}: open details`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <img src={app.icon} alt="" className="h-12 w-12 shrink-0 rounded-2xl bg-white object-cover shadow-lg" />
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-semibold">{app.name}</h3>
                  <p className="truncate text-xs text-white/60">{app.version} · {app.category}</p>
                </div>
              </div>
              <StatusPill status={app.status} />
            </div>

            <div className="mt-5 flex items-end justify-between gap-4">
              <div>
                <p className="flex items-center gap-1.5 text-xs text-white/60">
                  <Users size={13} /> Users
                </p>
                <p className="mt-1 text-2xl font-bold">{app.users.toLocaleString('en-GB')}</p>
              </div>
              <div className="w-28 shrink-0">
                <Sparkline data={app.sparkline} />
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-sm">
              <ArrowRight size={15} className="mt-0.5 shrink-0 text-emerald-200" />
              <p>
                <span className="text-white/60">Next up: </span>
                {app.nextUp}
              </p>
            </div>
            <p className="mt-3 flex items-center justify-end gap-1 text-xs font-medium text-white/70">
              Revenue, subscriptions & roadmap <ChevronRight size={14} />
            </p>
          </GlassCard>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-5">
        <ChartCard
          className="xl:col-span-3"
          title="Users per app"
          subtitle="Monthly active users, last 6 months"
          action={<Legend items={series.map((s) => ({ label: s.key, color: s.color }))} />}
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={appUsersTrend} margin={{ top: 6, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="month" {...axisProps} padding={{ left: 12, right: 12 }} />
                <YAxis {...axisProps} />
                <Tooltip {...tooltipProps} />
                {series.map((s) => (
                  <Line
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    stroke={s.color}
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <DataTable
          className="xl:col-span-2"
          title="Recent releases"
          rows={recentReleases}
          onRowClick={(r) => openDetail('app', r.app.toLowerCase())}
          columns={[
            {
              key: 'app',
              header: 'App',
              render: (r) => (
                <div>
                  <p className="font-medium">{r.app}</p>
                  <p className="text-xs text-white/55">{r.notes}</p>
                </div>
              ),
            },
            { key: 'version', header: 'Version', className: 'whitespace-nowrap' },
            { key: 'date', header: 'Date', hideOnMobile: true, className: 'whitespace-nowrap text-white/60' },
            { key: 'status', header: 'Status', render: (r) => <StatusPill status={r.status} /> },
          ]}
        />
      </div>
    </>
  )
}
