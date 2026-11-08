import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import TodayPanel from '../components/TodayPanel'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import ChartCard, { axisProps, gridProps, tooltipProps, palette, Legend } from '../components/ChartCard'
import DataTable from '../components/DataTable'
import StatusPill from '../components/StatusPill'
import { overviewStats, weeklyActivity, recentActivity } from '../data/mockData'
import { useAuth } from '../data/auth'
import { useRoblox, compact, timeAgo } from '../data/robloxFeed'

function greeting() {
  const h = new Date().getHours()
  if (h < 5) return 'Good night'
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

const sectionColors = {
  Apps: 'bg-violet-300',
  Products: 'bg-amber-200',
  '3D Printing': 'bg-sky-300',
  Roblox: 'bg-emerald-300',
}

const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

const statTabs = { users: 'apps', prints: 'printing', visits: 'roblox', revenue: 'products' }
const sectionTabs = { Apps: 'apps', Products: 'products', '3D Printing': 'printing', Roblox: 'roblox' }

export default function Overview({ onNavigate }) {
  const { user } = useAuth()
  const { list } = useRoblox()
  const visible = list.filter((g) => !g.restricted)
  const hidden = list.filter((g) => g.restricted)

  // Roblox visits card is live (all public games added up); the rest are still placeholder.
  const stats = overviewStats.map((s) =>
    s.id === 'visits'
      ? {
          ...s,
          value: list.length ? compact(visible.reduce((n, g) => n + g.visits, 0)) : '…',
          live: true,
          note: list.length
            ? [`${list.length} games · ${visible.reduce((n, g) => n + g.playing, 0)} playing`, hidden.length ? `${hidden.length} hidden` : null].filter(Boolean).join(' · ')
            : 'connecting to Roblox',
        }
      : s,
  )

  // Real "last updated" events from Roblox, merged into the feed by date.
  const activity = visible.length
    ? [
        ...visible.map((game) => ({
          id: `rbx-updated-${game.key}`,
          event: `${game.name}: new version published`,
          section: 'Roblox',
          time: timeAgo(Date.parse(game.updated)),
          status: 'Completed',
          at: Date.parse(game.updated),
        })),
        ...recentActivity.map((r) => ({ ...r, at: Date.now() - r.minsAgo * 60_000 })),
      ].sort((a, b) => b.at - a.at)
    : recentActivity

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${user.name}`}
        subtitle={`${today} · here's how apps, prints, Roblox and products are tracking.`}
      />

      <TodayPanel onNavigate={onNavigate} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.id} {...s} onClick={() => onNavigate?.(statTabs[s.id])} />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-5">
        <ChartCard
          className="xl:col-span-2"
          title="Weekly activity"
          subtitle="Build & ops events across all projects"
          action={
            <Legend
              items={[
                { label: 'Builds', color: palette.charcoal },
                { label: 'Ops', color: palette.emerald },
              ]}
            />
          }
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivity} barGap={4} margin={{ top: 4, right: 0, left: -24, bottom: 0 }}>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="day" {...axisProps} />
                <YAxis {...axisProps} />
                <Tooltip {...tooltipProps} />
                <Bar dataKey="builds" name="Builds" fill={palette.charcoal} radius={[8, 8, 8, 8]} maxBarSize={14} />
                <Bar dataKey="ops" name="Ops" fill={palette.emerald} radius={[8, 8, 8, 8]} maxBarSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <DataTable
          className="xl:col-span-3"
          title="Recent activity"
          subtitle="Latest events from every section"
          rows={activity}
          onRowClick={(r) => onNavigate?.(sectionTabs[r.section])}
          columns={[
            {
              key: 'event',
              header: 'Event',
              render: (r) => <span className="font-medium">{r.event}</span>,
            },
            {
              key: 'section',
              header: 'Section',
              hideOnMobile: true,
              className: 'whitespace-nowrap',
              render: (r) => (
                <span className="inline-flex items-center gap-2 text-white/75">
                  <span className={`h-2 w-2 rounded-full ${sectionColors[r.section]}`} />
                  {r.section}
                </span>
              ),
            },
            { key: 'time', header: 'When', hideOnMobile: true, className: 'whitespace-nowrap text-white/60' },
            { key: 'status', header: 'Status', render: (r) => <StatusPill status={r.status} /> },
          ]}
        />
      </div>
    </>
  )
}
