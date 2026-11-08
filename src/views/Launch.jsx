import { useEffect, useState } from 'react'
import { CalendarDays, ChevronDown, CircleCheck, Circle, ExternalLink, Layers, Loader2, Rocket, Flag, Users } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import PageHeader from '../components/PageHeader'
import GlassCard from '../components/GlassCard'
import StatCard from '../components/StatCard'
import { useDetail } from '../components/DetailSheet'
import { apps } from '../data/mockData'
import { launchStats, sharedJobs } from '../data/launchData'
import { useLaunches, toggleTask, PEOPLE, flattenLaunchTasks } from '../data/tasksLive'
import { useAuth } from '../data/auth'
import OwnerChip from '../components/OwnerChip'
import { timeAgo } from '../data/robloxFeed'

const DAY = 86_400_000
const storeKey = (id) => `oliver-hq:launch-target:${id}`

// A date picked on this device overrides the plan's date ('' = cleared here).
function readTarget(id, fallback = '') {
  try {
    const v = localStorage.getItem(storeKey(id))
    return v === null ? fallback : v
  } catch {
    return fallback
  }
}

function writeTarget(id, value, fallback = '') {
  try {
    if (value === fallback) localStorage.removeItem(storeKey(id))
    else localStorage.setItem(storeKey(id), value)
  } catch {
    /* storage blocked: the date just won't be remembered */
  }
}

function daysUntil(dateStr) {
  if (!dateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(`${dateStr}T00:00:00`)
  return Math.round((target - today) / DAY)
}

const fmtDate = (s) =>
  new Date(`${s}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })

function Ring({ pct, color, size = 64 }) {
  const r = (size - 8) / 2
  const c = 2 * Math.PI * r
  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90" aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct / 100)}
      />
    </svg>
  )
}

function Countdown({ target, setTarget, blockers }) {
  const days = daysUntil(target)
  const weeks = days != null ? Math.max(days / 7, 1 / 7) : null
  const pace = days != null && days > 0 && blockers > 0 ? Math.ceil(blockers / weeks) : null

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.08] px-4 py-3.5">
      {target ? (
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className={`text-4xl font-extrabold tracking-tight ${days < 0 ? 'text-rose-200' : ''}`}>
              {days === 0 ? 'Today' : Math.abs(days)}
              {days !== 0 && <span className="ml-1.5 text-base font-semibold text-white/70">{Math.abs(days) === 1 ? 'day' : 'days'} {days < 0 ? 'overdue' : 'to go'}</span>}
            </p>
            <p className="mt-0.5 text-xs text-white/60">Target {fmtDate(target)}</p>
          </div>
          {pace != null && (
            <p className="text-right text-xs text-white/70">
              <span className="block text-lg font-bold text-white">≈ {pace}</span>
              {pace === 1 ? 'blocker' : 'blockers'} / week
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-white/70">No launch date in the plan yet. Pick one to start the countdown.</p>
      )}
      <label className="mt-3 flex items-center gap-2 text-xs text-white/65">
        <CalendarDays size={14} />
        <span>Target date</span>
        <input
          type="date"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="ml-auto min-w-0 rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-sm text-white [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-white/40"
        />
        {target && (
          <button onClick={() => setTarget('')} className="rounded-md px-1.5 py-1 text-white/60 hover:bg-white/10 hover:text-white">
            Clear
          </button>
        )}
      </label>
    </div>
  )
}

export function TaskRow({ item, blocking, note, live, appBadge = null }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const flip = async () => {
    if (!live || busy) return
    setBusy(true)
    setError('')
    const res = await toggleTask(note, item, !item.done)
    setBusy(false)
    if (!res.ok) setError(res.error)
  }
  const Icon = busy ? Loader2 : item.done ? CircleCheck : Circle
  return (
    <li className="first:mt-2">
      <div className="-mx-1.5 flex items-start gap-1 rounded-lg pr-1.5 transition-colors hover:bg-white/[0.06]">
      <button
        type="button"
        onClick={flip}
        disabled={!live}
        aria-pressed={item.done}
        title={live ? (item.done ? 'Untick (updates Obsidian)' : 'Tick off (updates Obsidian)') : 'Read-only until the vault loads'}
        className={`group flex min-w-0 flex-1 items-start gap-2.5 rounded-lg py-1.5 pl-1.5 text-left text-sm ${live ? '' : 'cursor-default'}`}
      >
        {appBadge}
        <Icon
          size={16}
          className={`mt-0.5 shrink-0 transition-colors ${busy ? 'animate-spin text-white/60' : item.done ? 'text-emerald-300' : blocking ? 'text-rose-200/80 group-hover:text-emerald-200' : 'text-white/40 group-hover:text-emerald-200'}`}
        />
        <span className={item.done ? 'text-white/50 line-through' : ''}>
          {item.text}
          {item.shared && !item.done && (
            <span className="ml-1.5 inline-block rounded-full bg-amber-300/20 px-1.5 py-px align-middle text-[10px] font-medium text-amber-100 ring-1 ring-amber-200/30">
              shared
            </span>
          )}
        </span>
      </button>
      <div className="pt-1">
        <OwnerChip item={item} note={note} disabled={!live} />
      </div>
      </div>
      {error && <p role="alert" className="ml-7 text-xs text-rose-100">{error}</p>}
    </li>
  )
}

function Group({ group, note, live, filter }) {
  const items = filter ? group.items.filter(filter) : group.items
  const remaining = items.filter((i) => !i.done).length
  const [open, setOpen] = useState(group.blocking || remaining > 0)
  if (filter && items.length === 0) return null
  return (
    <div className="border-t border-white/10 pt-3">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-2 text-left" aria-expanded={open}>
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/65">
          {group.blocking && <Flag size={12} className="text-rose-200" />}
          {group.title}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-white/60">
          {remaining ? `${remaining} left` : 'all done'}
          <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {items.map((i) => (
              <TaskRow key={i.line ?? i.text} item={i} blocking={group.blocking} note={note} live={live} />
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

function LaunchCard({ launch, target, setTarget, filter }) {
  const app = apps.find((a) => a.id === launch.appId)
  const s = launchStats(launch)
  const { openDetail } = useDetail()
  const ringColor = app.id === 'selvo' ? '#d6d6dd' : app.id === 'sparesy' ? '#6fd1a5' : '#7fb2ff'

  return (
    <GlassCard hover={false} className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="relative grid place-items-center">
          <Ring pct={s.pct} color={ringColor} />
          <img src={app.icon} alt="" className="absolute h-10 w-10 rounded-xl bg-white object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <button onClick={() => openDetail('app', app.id)} className="truncate text-left text-lg font-semibold hover:underline">
            {app.name}
          </button>
          <p className="text-xs text-white/60">
            {s.pct}% ready · {s.done}/{s.total} done
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-rose-100">{s.blockers}</p>
          <p className="text-[11px] text-white/60">blockers</p>
        </div>
      </div>

      <Countdown target={target} setTarget={setTarget} blockers={s.blockers} />

      <div className="space-y-3">
        {filter && !launch.groups.some((g) => g.items.some(filter)) && (
          <p className="border-t border-white/10 pt-3 text-sm text-white/60">No tasks here for this filter.</p>
        )}
        {launch.groups.map((g) => (
          <Group key={g.title} group={g} note={`launch:${launch.appId}`} live={launch.live} filter={filter} />
        ))}
      </div>

      <div className="mt-auto space-y-2 border-t border-white/10 pt-3">
        <p className="text-xs text-white/60">
          <span className="font-semibold text-white/75">Launch gate: </span>
          {launch.gate}
        </p>
        <a
          href={launch.obsidian}
          className="inline-flex items-center gap-1 text-xs font-medium text-sky-200 hover:underline"
        >
          Launch Plan in Obsidian · {launch.live ? `changed ${timeAgo(Date.parse(launch.modified))}` : `updated ${new Date(launch.updated).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
          <ExternalLink size={12} />
        </a>
      </div>
    </GlassCard>
  )
}

const appOrder = (id, targets) => (targets[id] ? targets[id] : '9999')

function WhoPanel({ launches, user, targets, onShow }) {
  const tasks = flattenLaunchTasks(launches)
  const open = tasks.filter((t) => !t.done)
  const selvoDays = daysUntil(targets.selvo)
  const weeks = selvoDays > 0 ? selvoDays / 7 : null

  const rows = [
    ...PEOPLE.map((p) => ({ key: p.id, label: p.name, person: p, tasks: open.filter((t) => t.owner === p.id) })),
    { key: 'unassigned', label: 'Unassigned', person: null, tasks: open.filter((t) => !t.owner) },
  ]
  const max = Math.max(1, ...rows.map((r) => r.tasks.length))

  // Your open tasks: blockers first, then the app launching soonest.
  const mine = open
    .filter((t) => t.owner === user.id)
    .sort((a, b) => Number(b.blocking) - Number(a.blocking) || appOrder(a.appId, targets).localeCompare(appOrder(b.appId, targets)))

  return (
    <GlassCard hover={false} className="mt-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold"><Users size={17} /> Who's doing what</h3>
          <p className="mt-0.5 text-sm text-white/60">Tap the circle on any task to give it to Oliver or Ryley. It's saved in the Obsidian note.</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ul className="space-y-3">
          {rows.map((r) => {
            const blockers = r.tasks.filter((t) => t.blocking).length
            const selvo = r.tasks.filter((t) => t.appId === 'selvo' && t.blocking).length
            const pace = weeks && selvo ? Math.ceil(selvo / weeks) : null
            return (
              <li key={r.key}>
                <button
                  type="button"
                  onClick={() => onShow(r.key === user.id ? 'mine' : r.key === 'unassigned' ? 'unassigned' : 'other')}
                  className="-mx-2 w-[calc(100%+1rem)] rounded-xl px-2 py-1.5 text-left transition hover:bg-white/[0.07]"
                  title={`Show ${r.label === 'Unassigned' ? 'unassigned' : `${r.label}'s`} tasks below`}
                >
                  <div className="mb-1.5 flex items-center gap-2.5">
                    {r.person ? (
                      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-bold ring-1 ring-white/40 ${r.person.chip}`}>{r.person.initials}</span>
                    ) : (
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-dashed border-white/40 text-white/60"><Users size={13} /></span>
                    )}
                    <span className="min-w-0 flex-1 text-sm font-medium leading-tight">
                      {r.label}
                      {r.key === user.id && <span className="ml-1.5 text-xs font-normal text-white/55">(you)</span>}
                      {r.person?.title && <span className="block truncate text-[11px] font-normal text-white/55">{r.person.title}</span>}
                    </span>
                    <span className="text-right text-xs text-white/70">
                      <b className="text-sm text-white">{r.tasks.length}</b> open · <span className={blockers ? 'text-rose-100' : ''}>{blockers} blocking</span>
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
                    <div className={`h-full rounded-full ${r.person ? 'bg-emerald-400' : 'bg-white/40'}`} style={{ width: `${(r.tasks.length / max) * 100}%` }} />
                  </div>
                  {r.person && selvo > 0 && (
                    <p className="mt-1 text-[11px] text-white/60">
                      Selvo: {selvo} blocker{selvo === 1 ? '' : 's'}{pace ? ` · ≈ ${pace} a week to hit ${fmtDate(targets.selvo).replace(/^\w+, /, '')}` : ''}
                    </p>
                  )}
                </button>
              </li>
            )
          })}
        </ul>

        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-white/60">Your next tasks</p>
          {mine.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/20 px-3 py-4 text-sm text-white/65">
              Nothing assigned to you yet. Use the circle next to any task to take it.
            </p>
          ) : (
            <ul>
              {mine.slice(0, 6).map((t) => {
                const app = apps.find((a) => a.id === t.appId)
                return (
                  <TaskRow
                    key={`${t.appId}:${t.line}`}
                    item={t}
                    blocking={t.blocking}
                    note={t.note}
                    live={t.live}
                    appBadge={<img src={app.icon} alt={app.name} title={app.name} className="mt-px h-[18px] w-[18px] shrink-0 rounded-md bg-white object-cover" />}
                  />
                )
              })}
              {mine.length > 6 && (
                <li>
                  <button type="button" onClick={() => onShow('mine')} className="mt-1 text-xs font-medium text-sky-200 hover:underline">
                    + {mine.length - 6} more of yours
                  </button>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </GlassCard>
  )
}

function FilterBar({ value, onChange, user, counts }) {
  const other = PEOPLE.find((p) => p.id !== user.id)
  const options = [
    ['all', 'All tasks'],
    ['mine', 'Mine'],
    ['other', `${other.name}'s`],
    ['unassigned', 'Unassigned'],
  ]
  return (
    <div className="no-scrollbar mt-6 flex items-center gap-1 overflow-x-auto" role="tablist" aria-label="Show tasks">
      {options.map(([key, label]) => (
        <button
          key={key}
          role="tab"
          aria-selected={value === key}
          onClick={() => onChange(key)}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${value === key ? 'bg-white text-stone-900' : 'text-white/75 hover:bg-white/10 hover:text-white'}`}
        >
          {label}
          {key !== 'all' && <span className={`ml-1.5 text-xs ${value === key ? 'text-stone-500' : 'text-white/50'}`}>{counts[key]}</span>}
        </button>
      ))}
    </div>
  )
}

export default function Launch() {
  const { launches, error, live } = useLaunches()
  const { user } = useAuth()
  const [show, setShow] = useState('all')
  const otherId = PEOPLE.find((p) => p.id !== user.id)?.id
  const filters = {
    all: null,
    mine: (i) => i.owner === user.id,
    other: (i) => i.owner === otherId,
    unassigned: (i) => !i.owner,
  }
  const filterFn = filters[show]
  const openTasks = flattenLaunchTasks(launches).filter((t) => !t.done)
  const counts = {
    mine: openTasks.filter(filters.mine).length,
    other: openTasks.filter(filters.other).length,
    unassigned: openTasks.filter(filters.unassigned).length,
  }
  const stats = launches.map(launchStats)
  const blockers = stats.reduce((n, s) => n + s.blockers, 0)
  const done = stats.reduce((n, s) => n + s.done, 0)
  const total = stats.reduce((n, s) => n + s.total, 0)

  // Jobs that appear (unfinished) in more than one app's plan.
  const shared = Object.entries(sharedJobs)
    .map(([key, label]) => ({
      key,
      label,
      apps: launches.filter((l) => l.groups.some((g) => g.items.some((i) => i.shared === key && !i.done))).map((l) => apps.find((a) => a.id === l.appId)),
    }))
    .filter((j) => j.apps.length > 1)
    .sort((a, b) => b.apps.length - a.apps.length)

  // Target dates live here so the "Next launch" card updates as you pick them.
  const [targets, setTargets] = useState(() => Object.fromEntries(launches.map((l) => [l.appId, readTarget(l.appId, l.target)])))
  useEffect(() => {
    Object.entries(targets).forEach(([id, d]) => writeTarget(id, d, launches.find((l) => l.appId === id)?.target))
  }, [targets])
  const setTargetFor = (id) => (d) => setTargets((t) => ({ ...t, [id]: d }))

  const today = new Date().toISOString().slice(0, 10)
  const nearest =
    Object.entries(targets)
      .filter(([, d]) => d && d >= today)
      .map(([id, d]) => ({ id, d }))
      .sort((a, b) => a.d.localeCompare(b.d))[0] ?? null

  return (
    <>
      <PageHeader
        title="Launch"
        subtitle={
          live
            ? "Live from your Obsidian launch plans. Tick a task and the note updates."
            : error
              ? `Couldn't read the vault (${error}). Showing the last saved copy, read-only.`
              : 'Reading your Obsidian launch plans…'
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Blockers left" value={blockers} icon={Flag} note="across all three launch plans" />
        <StatCard label="Checklist done" value={`${Math.round((done / total) * 100)}%`} icon={CircleCheck} note={`${done} of ${total} items`} />
        <StatCard
          label="Next launch"
          value={nearest ? `${Math.max(daysUntil(nearest.d), 0)}d` : 'Not set'}
          icon={Rocket}
          accent

          note={nearest ? `${apps.find((a) => a.id === nearest.id).name} · ${fmtDate(nearest.d)}` : 'pick target dates below'}
        />
        <StatCard label="Shared jobs" value={shared.length} icon={Layers} note="do once, unblocks several apps" />
      </div>

      <GlassCard hover={false} className="mt-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold">Do once, unblocks several launches</h3>
            <p className="mt-0.5 text-sm text-white/60">The same job appears in more than one plan</p>
          </div>
        </div>
        <ul className="mt-3 grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3">
          {shared.map((j) => (
            <li key={j.key} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.08] px-3.5 py-3">
              <span className="text-sm font-medium">{j.label}</span>
              <span className="flex shrink-0 -space-x-2">
                {j.apps.map((a) => (
                  <img key={a.id} src={a.icon} alt={a.name} title={a.name} className="h-7 w-7 rounded-lg bg-white object-cover ring-2 ring-[#5a3e2b]" />
                ))}
              </span>
            </li>
          ))}
        </ul>
      </GlassCard>

      <WhoPanel
        launches={launches}
        user={user}
        targets={targets}
        onShow={(key) => {
          setShow(key)
          document.getElementById('launch-cards')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }}
      />

      <FilterBar value={show} onChange={setShow} user={user} counts={counts} />

      <div id="launch-cards" className="mt-3 grid scroll-mt-4 grid-cols-1 items-start gap-4 xl:grid-cols-3">
        {launches.map((l) => (
          <LaunchCard key={l.appId} launch={l} target={targets[l.appId]} setTarget={setTargetFor(l.appId)} filter={filterFn} />
        ))}
      </div>
    </>
  )
}
