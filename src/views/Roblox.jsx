import { useState } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { CircleCheck, Circle, ExternalLink, Eye, EyeOff, Heart, ThumbsUp, Users, RefreshCw, AlertTriangle, LayoutDashboard } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import GlassCard from '../components/GlassCard'
import ChartCard, { axisProps, gridProps, tooltipProps, palette, Legend } from '../components/ChartCard'
import DataTable from '../components/DataTable'
import { useDetail } from '../components/DetailSheet'
import StatusPill from '../components/StatusPill'
import { robloxRoadmap, robloxUpdates } from '../data/mockData'
import { useRoblox, useNow, timeAgo, fmt, historyToChart, POLL_MS, ROBLOX_GAMES } from '../data/robloxFeed'

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

function LiveBadge({ status, lastUpdated, error }) {
  const now = useNow(1000)
  if (status === 'error')
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-400/25 px-3 py-1.5 text-xs font-medium text-rose-100 ring-1 ring-rose-300/40" title={error}>
        <AlertTriangle size={13} /> Can't reach Roblox{lastUpdated ? `, last data ${timeAgo(lastUpdated, now)}` : ''}
      </span>
    )
  if (status === 'loading')
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium ring-1 ring-white/25">
        <RefreshCw size={13} className="animate-spin" /> Connecting…
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/25 px-3 py-1.5 text-xs font-medium text-emerald-50 ring-1 ring-emerald-300/40">
      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
      Live · updated {timeAgo(lastUpdated, now)}
    </span>
  )
}

function GameIcon({ game, cfg, size = 'h-16 w-16 text-xl' }) {
  return game?.icon ? (
    <img src={game.icon} alt="" className={`${size} shrink-0 rounded-2xl shadow-lg ring-2 ring-white/30`} />
  ) : (
    <div className={`${size} grid shrink-0 place-items-center rounded-2xl bg-white/25 font-extrabold`}>{cfg.emoji}</div>
  )
}

function GameSwitcher({ selected, onSelect, games }) {
  return (
    <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto" role="tablist" aria-label="Choose a game">
      {ROBLOX_GAMES.map((cfg) => {
        const g = games[cfg.key]
        const active = selected === cfg.key
        return (
          <button
            key={cfg.key}
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(cfg.key)}
            className={`flex shrink-0 items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-4 text-sm font-medium transition ${
              active ? 'bg-white text-stone-900 shadow-md' : 'bg-white/10 text-white/80 ring-1 ring-white/20 hover:bg-white/15'
            }`}
          >
            {g?.icon ? (
              <img src={g.icon} alt="" className="h-7 w-7 rounded-full" />
            ) : (
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white/20 text-xs">{cfg.emoji}</span>
            )}
            {g?.name ?? cfg.name}
            {g?.restricted && <EyeOff size={13} className={active ? 'text-stone-500' : 'text-white/55'} aria-label="stats hidden" />}
          </button>
        )
      })}
    </div>
  )
}

export default function Roblox() {
  const { openDetail } = useDetail()
  const { status, games, histories, error, lastUpdated } = useRoblox()
  const [selected, setSelected] = useState(ROBLOX_GAMES[0].key)
  const cfg = ROBLOX_GAMES.find((g) => g.key === selected)
  const game = games[selected]
  const hidden = game?.restricted
  const chart = historyToChart(histories[selected] ?? [])
  const isSos = selected === 'sos'
  const doneCount = robloxRoadmap.filter((t) => t.done).length

  const hiddenValue = { value: 'Hidden', sub: 'by Roblox' }
  const metrics = [
    { label: 'Visits', icon: Eye, ...(hidden ? hiddenValue : { value: fmt(game?.visits) }) },
    { label: 'Favourites', icon: Heart, ...(hidden ? hiddenValue : { value: fmt(game?.favourites) }) },
    { label: 'Playing now', icon: Users, live: !hidden, ...(hidden ? hiddenValue : { value: fmt(game?.playing) }) },
    {
      label: 'Likes',
      value: game?.likes == null ? '—' : `${game.likes}%`,
      sub: game ? `${game.upVotes}👍 ${game.downVotes}👎` : null,
      icon: ThumbsUp,
    },
  ]

  return (
    <>
      <PageHeader title="Roblox" subtitle={`Real stats from Roblox for ${ROBLOX_GAMES.length} games, refreshed every ${POLL_MS / 1000}s.`}>
        <LiveBadge status={status} lastUpdated={lastUpdated} error={error} />
      </PageHeader>

      <GameSwitcher selected={selected} onSelect={setSelected} games={games} />

      {/* Game card — live */}
      <GlassCard
        onClick={() => openDetail('game', selected)}
        label={`${game?.name ?? cfg.name}: open details`}
        className={`!bg-transparent bg-gradient-to-br !border-emerald-200/40 ${
          hidden ? 'from-stone-500/80 via-stone-600/80 to-stone-800/85' : 'from-emerald-400/90 via-emerald-500/85 to-emerald-700/90'
        }`}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <GameIcon game={game} cfg={cfg} />
            <div className="min-w-0">
              <h2 className="truncate text-2xl font-bold">{game?.name ?? cfg.name}</h2>
              <p className="text-sm text-white/85">
                {!game
                  ? 'Fetching from Roblox'
                  : hidden
                    ? `Experience ${game.universeId} · stats hidden by Roblox`
                    : `${game.genre} · by ${game.creator} · max ${game.maxPlayers} per server`}
              </p>
              {game?.robloxName && game.robloxName !== game.name && (
                <p className="text-xs text-white/75">Listed on Roblox as “{game.robloxName}” (the new name hasn't reached Roblox's public listing yet)</p>
              )}
              {game && (
                <a
                  href={hidden ? game.dashboardUrl : game.url}
                  onClick={(e) => e.stopPropagation()}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-white/90 underline-offset-2 hover:underline"
                >
                  {hidden ? 'Open in Creator Dashboard' : 'Open on Roblox'} <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-auto">
            {metrics.map(({ label, value, sub, icon: Icon, live }) => (
              <div key={label} className="min-w-0 rounded-xl bg-white/20 px-4 py-3">
                <p className="flex items-center gap-1.5 text-xs text-white/85">
                  <Icon size={13} /> {label}
                  {live && status === 'live' && <span className="ml-0.5 h-1.5 w-1.5 animate-pulse rounded-full bg-white" />}
                </p>
                <p className={`mt-1 font-bold ${value === 'Hidden' ? 'text-base text-white/80' : 'text-xl'}`}>{value}</p>
                {sub && <p className="text-[11px] text-white/75">{sub}</p>}
              </div>
            ))}
          </div>
        </div>
        {game && !hidden && (
          <p className="mt-5 text-xs text-white/75">
            Created {fmtDate(game.created)} · last published {fmtDate(game.updated)} ({timeAgo(Date.parse(game.updated))})
          </p>
        )}
        {hidden && (
          <p className="mt-5 flex items-start gap-2 rounded-xl bg-black/15 px-3 py-2.5 text-xs text-white/85">
            <EyeOff size={14} className="mt-px shrink-0" />
            <span>
              Roblox isn't sharing this game's name, visits or players publicly. That usually means it's private, or its
              content-maturity questionnaire isn't finished. Likes still come through. The dashboard starts tracking
              everything automatically once Roblox shows its stats.
            </span>
          </p>
        )}
      </GlassCard>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-5">
        <ChartCard
          className="xl:col-span-3"
          title="Players & new visits"
          subtitle={`Sampled every ${POLL_MS / 1000}s while the dashboard is open · last 24h`}
          action={
            <Legend
              items={[
                { label: 'Playing', color: palette.coral },
                { label: 'New visits', color: palette.charcoal },
              ]}
            />
          }
        >
          <div className="h-64">
            {hidden ? (
              <div className="grid h-full place-items-center px-6 text-center text-sm text-white/60">
                <p>
                  No chart yet: Roblox hides visits and players for {game.name}.
                  <br />
                  It starts filling in once the game's stats are public.
                </p>
              </div>
            ) : chart.length < 2 ? (
              <div className="grid h-full place-items-center text-center text-sm text-white/60">
                <p>
                  Collecting samples…
                  <br />
                  The chart fills in as the dashboard stays open.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chart} margin={{ top: 6, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="time" {...axisProps} minTickGap={24} padding={{ left: 12, right: 12 }} />
                  <YAxis {...axisProps} allowDecimals={false} />
                  <Tooltip {...tooltipProps} />
                  <Line type="monotone" dataKey="playing" name="Playing" stroke={palette.coral} strokeWidth={3} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="gained" name="New visits" stroke={palette.charcoal} strokeWidth={3} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>

        <GlassCard hover={false} className="xl:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold">Roadmap</h3>
              <p className="mt-0.5 text-sm text-white/60">Edit in mockData.js</p>
            </div>
            {isSos && (
              <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium">
                {doneCount}/{robloxRoadmap.length} done
              </span>
            )}
          </div>
          {isSos ? (
            <>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/15">
                <div className="h-full rounded-full bg-emerald-400" style={{ width: `${(doneCount / robloxRoadmap.length) * 100}%` }} />
              </div>
              <ul className="mt-4 divide-y divide-white/10">
                {robloxRoadmap.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 py-3 text-sm">
                    {t.done ? <CircleCheck size={18} className="shrink-0 text-emerald-300" /> : <Circle size={18} className="shrink-0 text-white/40" />}
                    <span className={t.done ? 'text-white/55 line-through' : ''}>{t.task}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-white/20 px-4 py-6 text-center text-sm text-white/65">
              <LayoutDashboard size={20} className="mx-auto mb-2 text-white/50" />
              No roadmap recorded for {game?.name ?? cfg.name} yet.
            </div>
          )}
        </GlassCard>
      </div>

      {isSos && (
        <div className="mt-4">
          <DataTable
            title="Recent updates"
            subtitle="Update notes aren't in Roblox's public API · edit in mockData.js"
            rows={robloxUpdates}
            columns={[
              { key: 'version', header: 'Version', className: 'whitespace-nowrap font-medium' },
              { key: 'title', header: 'Update' },
              { key: 'date', header: 'Date', hideOnMobile: true, className: 'whitespace-nowrap text-white/60' },
              { key: 'status', header: 'Status', render: (r) => <StatusPill status={r.status} /> },
            ]}
          />
        </div>
      )}
    </>
  )
}
