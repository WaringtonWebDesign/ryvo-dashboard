import { useEffect, useState } from 'react'
import {
  Sun, Moon, CloudSun, CloudMoon, Cloud, CloudFog, CloudDrizzle, CloudRain, CloudSnow, CloudLightning,
  Wind, Droplets, Circle, CircleCheck, Loader2, ExternalLink, Rocket, StickyNote, ListChecks,
} from 'lucide-react'
import GlassCard from './GlassCard'
import { useJson, WEATHER_URL, WEATHER_PLACE, describeWeather, obsidianLink } from '../data/localApi'
import { useNow } from '../data/robloxFeed'
import { launches } from '../data/launchData'
import { toggleTask, useLaunches, flattenLaunchTasks } from '../data/tasksLive'
import { useAuth } from '../data/auth'
import { apps } from '../data/mockData'

const ICONS = { sun: Sun, moon: Moon, cloudSun: CloudSun, cloudMoon: CloudMoon, cloud: Cloud, fog: CloudFog, drizzle: CloudDrizzle, rain: CloudRain, snow: CloudSnow, storm: CloudLightning }
const NOTES_KEY = 'oliver-hq:quick-notes'

function Weather() {
  const { data, error } = useJson(WEATHER_URL, 15 * 60_000)
  if (error) return <p className="text-sm text-white/60">Weather unavailable</p>
  if (!data) return <p className="text-sm text-white/60">Loading weather…</p>
  const c = data.current
  const d = data.daily
  const [label, iconKey] = describeWeather(c.weather_code, c.is_day)
  const Icon = ICONS[iconKey]
  return (
    <div className="flex items-center gap-3">
      <Icon size={40} className="shrink-0 text-amber-100" strokeWidth={1.5} />
      <div className="min-w-0">
        <p className="text-2xl font-bold leading-none">
          {Math.round(c.temperature_2m)}°C <span className="text-sm font-medium text-white/70">{label}</span>
        </p>
        <p className="mt-1 flex flex-wrap gap-x-3 text-xs text-white/65">
          <span>H {Math.round(d.temperature_2m_max[0])}° · L {Math.round(d.temperature_2m_min[0])}°</span>
          <span className="inline-flex items-center gap-1"><Wind size={12} />{Math.round(c.wind_speed_10m)} mph</span>
          <span className="inline-flex items-center gap-1"><Droplets size={12} />{d.precipitation_probability_max[0]}%</span>
        </p>
      </div>
    </div>
  )
}

function NextActions() {
  const { data, error, loading } = useJson('/api/vault/today', 60_000)
  // Ticks made here: shown straight away (and struck through) until the note reloads.
  const [ticked, setTicked] = useState({})
  const [busy, setBusy] = useState(null)
  const [failure, setFailure] = useState('')
  if (loading) return <p className="text-sm text-white/60">Reading your vault…</p>
  if (error) return <p className="text-sm text-white/60">Couldn't read "Today & Next Actions" ({error}).</p>

  const sections = data.note.sections
  const withTicks = (i) => (i.line in ticked ? { ...i, done: ticked[i.line] } : i)
  const tasks = (sections.find((s) => s.title === 'Highest priority')?.items ?? []).filter((i) => i.kind === 'task').map(withTicks)
  const shown = tasks.filter((t) => !t.done || t.line in ticked).slice(0, 5)
  const allOpen = sections.flatMap((s) => s.items).filter((i) => i.kind === 'task').map(withTicks).filter((i) => !i.done).length

  const flip = async (t) => {
    setBusy(t.line)
    setFailure('')
    setTicked((m) => ({ ...m, [t.line]: !t.done }))
    const res = await toggleTask('today', t, !t.done)
    setBusy(null)
    if (!res.ok) {
      setTicked((m) => {
        const next = { ...m }
        delete next[t.line]
        return next
      })
      setFailure(res.error)
    }
  }

  return (
    <>
      <ul className="space-y-1">
        {shown.length === 0 && <li className="text-sm text-white/65">All highest-priority actions are done. 🎉</li>}
        {shown.map((t) => {
          const [head, ...rest] = t.text.split(':')
          const Icon = busy === t.line ? Loader2 : t.done ? CircleCheck : Circle
          return (
            <li key={t.line}>
              <button
                type="button"
                onClick={() => flip(t)}
                disabled={busy !== null}
                aria-pressed={t.done}
                title={t.done ? 'Untick (updates Obsidian)' : 'Tick off (updates Obsidian)'}
                className="group -mx-1.5 flex w-[calc(100%+0.75rem)] gap-2.5 rounded-lg px-1.5 py-1.5 text-left text-sm transition-colors hover:bg-white/[0.08]"
              >
                <Icon
                  size={15}
                  className={`mt-0.5 shrink-0 ${busy === t.line ? 'animate-spin text-white/60' : t.done ? 'text-emerald-300' : 'text-white/45 group-hover:text-emerald-200'}`}
                />
                <span className={t.done ? 'text-white/50 line-through' : ''}>
                  {rest.length ? (
                    <>
                      <b className="font-semibold">{head}:</b>
                      <span className={t.done ? '' : 'text-white/75'}>{rest.join(':')}</span>
                    </>
                  ) : (
                    t.text
                  )}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      {failure && <p role="alert" className="mt-1 text-xs text-rose-100">{failure}</p>}
      <a href={obsidianLink(data.note.path)} className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-sky-200 hover:underline">
        {allOpen} open actions in Today & Next Actions <ExternalLink size={12} />
      </a>
    </>
  )
}

function QuickNotes() {
  const [text, setText] = useState(() => {
    try {
      return localStorage.getItem(NOTES_KEY) ?? ''
    } catch {
      return ''
    }
  })
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(NOTES_KEY, text)
      } catch {
        /* storage blocked */
      }
    }, 300)
    return () => clearTimeout(id)
  }, [text])
  return (
    <textarea
      value={text}
      onChange={(e) => setText(e.target.value)}
      placeholder="Jot something down… (saved on this device)"
      className="thin-scrollbar h-full min-h-28 w-full resize-none rounded-xl border border-white/15 bg-white/[0.07] px-3 py-2.5 text-sm text-white placeholder:text-white/45 focus:outline-none focus:ring-2 focus:ring-white/30"
    />
  )
}

function NextLaunch() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const next = launches
    .filter((l) => l.target)
    .map((l) => ({ l, days: Math.round((new Date(`${l.target}T00:00:00`) - today) / 86_400_000) }))
    .filter((x) => x.days >= 0)
    .sort((a, b) => a.days - b.days)[0]
  if (!next) return null
  const app = apps.find((a) => a.id === next.l.appId)
  return (
    <div className="mt-4 flex items-center gap-3 rounded-xl bg-emerald-400/20 px-3 py-2.5 ring-1 ring-emerald-300/30">
      <Rocket size={18} className="shrink-0 text-emerald-200" />
      <p className="text-sm">
        <b>{app.name}</b> launches in <b>{next.days} {next.days === 1 ? 'day' : 'days'}</b>
        <span className="text-white/65"> · {new Date(`${next.l.target}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
      </p>
    </div>
  )
}

function MyLaunchTasks({ onNavigate }) {
  const { user } = useAuth()
  const { launches, live } = useLaunches()
  if (!live) return null
  const mine = flattenLaunchTasks(launches).filter((t) => !t.done && t.owner === user.id)
  const blocking = mine.filter((t) => t.blocking).length
  return (
    <button
      type="button"
      onClick={() => onNavigate?.('launch')}
      className="mt-2 flex w-full items-center gap-3 rounded-xl bg-white/[0.08] px-3 py-2.5 text-left text-sm ring-1 ring-white/15 transition hover:bg-white/[0.13]"
    >
      <ListChecks size={18} className="shrink-0 text-white/75" />
      {mine.length ? (
        <span>
          <b>{mine.length}</b> launch task{mine.length === 1 ? '' : 's'} on you
          {blocking ? <span className="text-rose-100"> · {blocking} blocking</span> : null}
        </span>
      ) : (
        <span className="text-white/70">No launch tasks assigned to you yet</span>
      )}
    </button>
  )
}

export default function TodayPanel({ onNavigate }) {
  const now = useNow(15_000)
  const d = new Date(now)
  return (
    <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
      <GlassCard hover={false}>
        <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Today · {WEATHER_PLACE}</p>
        <p className="mt-2 text-4xl font-extrabold tracking-tight">
          {d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
        </p>
        <p className="text-sm text-white/70">{d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        <div className="mt-4">
          <Weather />
        </div>
        <NextLaunch />
        <MyLaunchTasks onNavigate={onNavigate} />
      </GlassCard>

      <GlassCard hover={false}>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/60">Highest priority · from your vault</p>
        <NextActions />
      </GlassCard>

      <GlassCard hover={false} className="flex flex-col">
        <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/60">
          <StickyNote size={13} /> Quick notes
        </p>
        <div className="flex-1">
          <QuickNotes />
        </div>
      </GlassCard>
    </div>
  )
}
