import { Circle, CircleCheck, ExternalLink, FolderOpen, GitBranch, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import GlassCard from '../components/GlassCard'
import DataTable from '../components/DataTable'
import StatusPill from '../components/StatusPill'
import { useJson, obsidianLink } from '../data/localApi'
import { timeAgo } from '../data/robloxFeed'
import { launchStats } from '../data/launchData'
import { useLaunches } from '../data/tasksLive'

const DAY = 86_400_000

function healthStatus(p) {
  if (!p.exists) return 'Missing'
  const age = Date.now() - Date.parse(p.lastChange)
  if (age < 3 * DAY) return 'Fresh'
  if (age < 14 * DAY) return 'Quiet'
  return 'Stale'
}

function LaunchProgress() {
  const { launches } = useLaunches()
  const stats = launches.map(launchStats)
  const pct = Math.round(stats.reduce((n, s) => n + s.pct, 0) / stats.length)
  const dated = launches.filter((l) => l.target)
  return (
    <div className="mt-2 rounded-lg bg-white/[0.07] px-3 py-2">
      <div className="mb-1 flex justify-between text-[11px] text-white/65">
        <span>Launch checklists (all three apps)</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${pct}%` }} />
      </div>
      {dated.map((l) => (
        <p key={l.appId} className="mt-1 text-[11px] text-white/65">
          {l.appId[0].toUpperCase() + l.appId.slice(1)} target: {new Date(`${l.target}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
        </p>
      ))}
    </div>
  )
}

function Horizon({ section }) {
  return (
    <GlassCard hover={false}>
      <h3 className="text-base font-semibold">{section.title}</h3>
      <ul className="mt-3 space-y-2.5">
        {section.items.map((i) => {
          const [goal, link] = i.text.split(' → ')
          return (
            <li key={i.text} className="text-sm">
              <div className="flex gap-2.5">
                {i.kind === 'task' ? (
                  i.done ? <CircleCheck size={16} className="mt-0.5 shrink-0 text-emerald-300" /> : <Circle size={16} className="mt-0.5 shrink-0 text-white/45" />
                ) : (
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-200" />
                )}
                <div className="min-w-0">
                  <p>{goal}</p>
                  {link && <p className="text-xs text-white/50">{link}</p>}
                </div>
              </div>
              {/^Launch Ryvo apps/.test(goal) && <LaunchProgress />}
            </li>
          )
        })}
      </ul>
    </GlassCard>
  )
}

export default function Goals() {
  const goals = useJson('/api/vault/goals', 5 * 60_000)
  const [refreshKey, setRefreshKey] = useState(0)
  const health = useJson(`/api/health${refreshKey ? `?refresh=1&k=${refreshKey}` : ''}`, 5 * 60_000)

  const horizons = goals.data?.dashboard?.sections.filter((s) => /^(Now|Next|Later)/.test(s.title ?? '')) ?? []
  const yearTable = goals.data?.northStar.sections.find((s) => /12-month goals/.test(s.title ?? ''))?.tables[0]
  const projects = health.data?.projects ?? []

  return (
    <>
      <PageHeader title="Goals" subtitle="Your goals from Obsidian, and how each project folder is doing." />

      {goals.error && <p className="mb-4 text-sm text-rose-100">Couldn't read the goals notes: {goals.error}</p>}
      {goals.loading && <p className="mb-4 text-sm text-white/60">Reading your vault…</p>}

      {goals.data && !goals.data.dashboard && (
        <p className="mb-4 rounded-xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm text-white/70">Personal goals are only shown when Oliver is signed in. The Ryvo goals are below.</p>
      )}

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
        {horizons.map((s) => (
          <Horizon key={s.title} section={s} />
        ))}
      </div>

      {yearTable && (
        <div className="mt-4">
          <DataTable
            title="12-month goals"
            subtitle="From Goals & North Star"
            action={
              <a href={obsidianLink(goals.data.northStar.path)} className="inline-flex items-center gap-1 text-xs font-medium text-sky-200 hover:underline">
                Open in Obsidian <ExternalLink size={12} />
              </a>
            }
            rows={yearTable.rows.map((r, i) => ({ id: i, goal: r[0], measure: r[1], date: r[2], status: r[3] }))}
            columns={[
              { key: 'goal', header: 'Goal', className: 'font-medium' },
              { key: 'measure', header: 'Measure', hideOnMobile: true, className: 'text-white/75' },
              { key: 'date', header: 'Target', hideOnMobile: true, className: 'whitespace-nowrap text-white/70' },
              { key: 'status', header: 'Status', render: (r) => <StatusPill status={r.status} /> },
            ]}
          />
        </div>
      )}

      <div className="mt-4">
        <DataTable
          title="Project health"
          subtitle={
            health.loading
              ? 'Scanning project folders… (first scan takes ~10 s)'
              : `Last change, git and open to-dos in each folder · scanned ${timeAgo(Date.parse(health.data?.generatedAt))}`
          }
          action={
            <button
              onClick={() => setRefreshKey(Date.now())}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/20"
            >
              <RefreshCw size={12} className={health.loading ? 'animate-spin' : ''} /> Rescan
            </button>
          }
          rows={projects}
          columns={[
            {
              key: 'name',
              header: 'Project',
              render: (p) => (
                <div className="min-w-0">
                  <p className="font-medium">{p.name}</p>
                  <p className="flex items-center gap-1 truncate text-xs text-white/50">
                    <FolderOpen size={11} className="shrink-0" /> {p.path}
                  </p>
                </div>
              ),
            },
            {
              key: 'last',
              header: 'Last change',
              render: (p) =>
                p.exists ? (
                  <div>
                    <p className="whitespace-nowrap">{timeAgo(Date.parse(p.lastChange))}</p>
                    <p className="max-w-56 truncate text-xs text-white/50" title={p.lastFile}>{p.lastFile}</p>
                  </div>
                ) : (
                  '—'
                ),
            },
            {
              key: 'git',
              header: 'Git',
              hideOnMobile: true,
              render: (p) =>
                p.git?.repo ? (
                  <div className="text-xs">
                    <p className="flex items-center gap-1"><GitBranch size={12} /> {timeAgo(Date.parse(p.git.lastCommit))}</p>
                    <p className={p.git.uncommitted ? 'text-amber-100' : 'text-white/55'}>{p.git.uncommitted} uncommitted</p>
                  </div>
                ) : (
                  <span className="text-xs text-rose-100/90">No git repo</span>
                ),
            },
            { key: 'openTasks', header: 'Open tasks', hideOnMobile: true, className: 'text-center', render: (p) => p.openTasks ?? '—' },
            { key: 'todos', header: 'Code markers', hideOnMobile: true, className: 'text-center', render: (p) => p.todos ?? '—' },
            { key: 'status', header: 'Status', render: (p) => <StatusPill status={healthStatus(p)} /> },
          ]}
        />
        <p className="mt-2 px-1 text-xs text-white/55">
          Fresh = changed in the last 3 days · Quiet = 3–14 days · Stale = over 2 weeks. Open tasks = unticked "- [ ]" lines in Markdown files. Code markers = to-do / fix-me comments in code.
        </p>
      </div>
    </>
  )
}
