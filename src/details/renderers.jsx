import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { CircleCheck, Circle, ExternalLink, FolderOpen } from 'lucide-react'
import { Section, MiniStats, KeyValues, Chips, BulletList, gbp, useDetail } from '../components/DetailSheet'
import { axisProps, gridProps, tooltipProps, palette } from '../components/ChartCard'
import StatusPill from '../components/StatusPill'
import {
  apps, products, productDetails, recentOrders, filament, spoolDetails,
  printQueue, printJobDetails, printer, robloxStore, robloxProject,
} from '../data/mockData'
import { useRoblox, fmt, timeAgo, ROBLOX_GAMES } from '../data/robloxFeed'

const MONTHS = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov']
const DEVEX_USD_PER_ROBUX = 0.0038 // Roblox DevEx rate; check create.roblox.com for the current figure
const CREATOR_SHARE = 0.7 // creators receive 70% of each Robux sale

function TrendBars({ values, name, money = true, color = palette.emerald }) {
  const data = values.map((v, i) => ({ m: MONTHS[i + MONTHS.length - values.length], v }))
  return (
    <div className="h-40 rounded-xl border border-white/10 bg-white/[0.07] p-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="m" {...axisProps} />
          <YAxis {...axisProps} />
          <Tooltip {...tooltipProps} formatter={(v) => [money ? gbp(v, 0) : v, name]} />
          <Bar dataKey="v" fill={color} radius={[6, 6, 6, 6]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function Roadmap({ items }) {
  const done = items.filter((t) => t.done).length
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.07] px-3.5 py-3">
      <div className="mb-2 flex items-center justify-between text-xs text-white/65">
        <span>{done} of {items.length} done</span>
        <span>{Math.round((done / items.length) * 100)}%</span>
      </div>
      <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-white/15">
        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${(done / items.length) * 100}%` }} />
      </div>
      <ul className="divide-y divide-white/10">
        {items.map((t) => (
          <li key={t.task} className="flex items-start gap-2.5 py-2 text-sm">
            {t.done ? <CircleCheck size={17} className="mt-px shrink-0 text-emerald-300" /> : <Circle size={17} className="mt-px shrink-0 text-white/40" />}
            <span className={t.done ? 'text-white/55 line-through' : ''}>{t.task}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Bars({ rows }) {
  const max = Math.max(1, ...rows.map((r) => r.value))
  return (
    <ul className="space-y-3 rounded-xl border border-white/10 bg-white/[0.07] px-3.5 py-3">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="mb-1 flex justify-between gap-3 text-sm">
            <span className="truncate">{r.label}</span>
            <span className="shrink-0 text-white/70">{r.right}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full" style={{ width: `${(r.value / max) * 100}%`, background: r.color ?? palette.emerald }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

function FolderLine({ path }) {
  return (
    <p className="flex items-center gap-1.5 text-xs text-white/55">
      <FolderOpen size={13} /> <span className="break-all">{path}</span>
    </p>
  )
}

// ── App ─────────────────────────────────────────────────────
function AppBody({ app }) {
  const m = app.metrics
  const paying = m.subscribers.filter((s) => s.monthly > 0).reduce((n, s) => n + s.count, 0)
  const subMrr = m.subscribers.reduce((n, s) => n + s.count * s.monthly, 0)
  const commission = m.commission ? m.commission.gmv * 0.1 : 0
  const mrr = subMrr + commission
  const thisMonth = Math.round(mrr)
  const total = m.revenueTrend.reduce((a, b) => a + b, 0)

  return (
    <>
      <Section title="Money" tag="placeholder">
        <MiniStats
          items={[
            { label: 'Monthly recurring', value: gbp(mrr, 0), sub: commission ? 'subs + 10% commission' : 'from subscriptions' },
            { label: 'Revenue this month', value: gbp(thisMonth, 0) },
            { label: 'Revenue (6 months)', value: gbp(total, 0) },
            { label: 'Paying subscribers', value: fmt(paying) },
            { label: m.freeUsers != null ? 'Free users' : 'Users', value: fmt(m.freeUsers ?? app.users) },
            { label: 'Monthly churn', value: `${m.churnPct}%` },
          ]}
        />
      </Section>

      <Section title="Revenue by month" tag="placeholder">
        <TrendBars values={m.revenueTrend} name="Revenue" color={app.brand === '#3a3a42' ? '#d6d6dd' : palette.emerald} />
      </Section>

      <Section title="Subscriptions" tag="placeholder">
        <Bars
          rows={m.subscribers.map((s) => ({
            label: s.plan,
            value: s.count,
            right: `${s.count} · ${gbp(s.count * s.monthly, 0)}/mo`,
          }))}
        />
        {m.commission && (
          <div className="mt-2.5">
            <KeyValues
              rows={[
                ['Paid bookings this month', fmt(m.commission.bookings)],
                ['Booking value (GMV)', gbp(m.commission.gmv, 0)],
                ['Sparesy 10% commission', gbp(commission, 0)],
                ['Paid out to hosts (90%)', gbp(m.commission.gmv * 0.9, 0)],
              ]}
            />
          </div>
        )}
      </Section>

      <Section title="Pricing" tag="real">
        <p className="mb-2 text-sm text-white/80">{app.pricing.model}</p>
        <KeyValues
          rows={app.pricing.plans.map((p) => [
            p.name,
            p.price == null ? (p.label ?? 'Price not set in code') : `${gbp(p.price)} / ${p.per}${p.label ? ` · ${p.label}` : ''}`,
          ])}
        />
        <p className="mt-2 text-xs text-white/55">{app.pricing.note}</p>
      </Section>

      <Section title="Roadmap" tag="real">
        <Roadmap items={app.roadmap} />
      </Section>

      <Section title="Features" tag="real">
        <BulletList items={app.features} />
      </Section>

      <Section title="Details" tag="real">
        <KeyValues
          rows={[
            ['Category', app.category],
            ['Audience', app.audience],
            ['Platforms', app.platforms.join(' · ')],
            ['Version', app.version],
          ]}
        />
        <div className="mt-2.5">
          <Chips items={app.stack} />
        </div>
        <div className="mt-2.5">
          <FolderLine path={app.folder} />
        </div>
      </Section>
    </>
  )
}

// ── Product ─────────────────────────────────────────────────
function ProductBody({ product }) {
  const d = productDetails[product.id]
  const revenue = d.unitsSold * product.price
  const margin = product.price - d.costPerUnit
  const orders = recentOrders.filter((o) => o.items.startsWith(product.name))
  return (
    <>
      <p className="text-sm text-white/80">{d.description}</p>
      <Section title="Sales" tag="placeholder">
        <MiniStats
          items={[
            { label: 'Price', value: gbp(product.price) },
            { label: 'Units sold', value: fmt(d.unitsSold) },
            { label: 'Revenue', value: gbp(revenue, 0) },
            { label: 'Profit per unit', value: gbp(margin), sub: `${Math.round((margin / product.price) * 100)}% margin` },
            { label: 'Total profit', value: gbp(margin * d.unitsSold, 0) },
            { label: 'In stock', value: fmt(product.stock) },
          ]}
        />
      </Section>
      <Section title="Units sold by month" tag="placeholder">
        <TrendBars values={d.salesTrend} name="Units" money={false} />
      </Section>
      <Section title="Making it" tag="placeholder">
        <KeyValues
          rows={[
            ['Filament', d.material],
            ['Print time', d.printTime],
            ['Filament per unit', `${d.grams} g`],
            ['Material cost per unit', gbp(d.costPerUnit)],
          ]}
        />
      </Section>
      <Section title="Recent orders" tag="placeholder">
        {orders.length ? (
          <KeyValues rows={orders.map((o) => [`${o.id} · ${o.customer}`, <span key={o.id} className="inline-flex items-center gap-2">{o.total} <StatusPill status={o.status} /></span>])} />
        ) : (
          <p className="text-sm text-white/60">No recent orders for this product.</p>
        )}
      </Section>
    </>
  )
}

// ── Print job ───────────────────────────────────────────────
function JobBody({ job }) {
  const d = printJobDetails[job.id]
  const { openDetail } = useDetail()
  const linked = d.product && products.find((p) => p.name === d.product)
  const isCurrent = job.status === 'Printing'
  return (
    <>
      {isCurrent && (
        <Section title="Progress" tag="placeholder">
          <div className="rounded-xl border border-white/10 bg-white/[0.07] px-3.5 py-3">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-3xl font-bold">{printer.progress}%</span>
              <span className="text-sm text-white/65">{printer.timeLeft} left · layer {printer.layer}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-emerald-500" style={{ width: `${printer.progress}%` }} />
            </div>
          </div>
        </Section>
      )}
      <Section title="Job" tag="placeholder">
        <KeyValues
          rows={[
            ['Material', job.material],
            ['Estimated time', job.time],
            ['Filament', `${d.grams} g`],
            d.layers ? ['Layers', `${d.layers} at ${d.layerHeight}`] : ['Layer height', d.layerHeight],
            ['Infill', d.infill],
            ['Build plate', d.plate],
            ['Started', d.started ?? 'Not started'],
          ]}
        />
      </Section>
      {linked && (
        <Section title="For product">
          <button
            onClick={() => openDetail('product', linked.id)}
            className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/10 px-3.5 py-3 text-left text-sm transition hover:bg-white/15"
          >
            <span className="font-medium">{linked.name}</span>
            <span className="text-white/65">{gbp(linked.price)} · view →</span>
          </button>
        </Section>
      )}
      <Section title="Notes">
        <p className="text-sm text-white/80">{d.notes}</p>
      </Section>
    </>
  )
}

// ── Spool ───────────────────────────────────────────────────
function SpoolBody({ spool }) {
  const d = spoolDetails[spool.id]
  const gramsLeft = Math.round((d.weightG * spool.remaining) / 100)
  return (
    <>
      <Section title="Spool" tag="placeholder">
        <MiniStats
          items={[
            { label: 'Remaining', value: `${spool.remaining}%` },
            { label: 'Grams left', value: `${fmt(gramsLeft)} g`, sub: `of ${fmt(d.weightG)} g` },
            { label: 'Value left', value: gbp((gramsLeft / 1000) * d.costPerKg) },
          ]}
        />
        <div className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-white/15">
          <div className="h-full rounded-full" style={{ width: `${spool.remaining}%`, background: spool.color }} />
        </div>
      </Section>
      <Section title="Settings & cost" tag="placeholder">
        <KeyValues
          rows={[
            ['Brand', d.brand],
            ['Material', spool.material],
            ['Cost', `${gbp(d.costPerKg)} / kg`],
            ['Nozzle / bed', `${d.nozzle} / ${d.bed}`],
            ['Opened', d.openedOn],
          ]}
        />
      </Section>
      <Section title="Used for">
        <Chips items={d.usedFor} />
      </Section>
    </>
  )
}

// ── Roblox game ─────────────────────────────────────────────
// Games other than SOS Airlines: live stats only (no store or systems notes recorded yet).
function OtherGameBody({ gameKey }) {
  const { games, status, lastUpdated } = useRoblox()
  const game = games[gameKey]
  const hidden = game?.restricted
  const h = (v) => (hidden ? 'Hidden' : fmt(v))
  return (
    <>
      <Section title={`Right now${lastUpdated ? ` · updated ${timeAgo(lastUpdated)}` : ''}`} tag={status === 'live' ? 'live' : undefined}>
        <MiniStats
          items={[
            { label: 'Visits', value: h(game?.visits), sub: hidden ? 'by Roblox' : null },
            { label: 'Playing now', value: h(game?.playing), sub: hidden ? 'by Roblox' : null },
            { label: 'Favourites', value: h(game?.favourites), sub: hidden ? 'by Roblox' : null },
            { label: 'Likes', value: game?.likes == null ? '—' : `${game.likes}%`, sub: game ? `${game.upVotes}👍 ${game.downVotes}👎` : null },
          ]}
        />
      </Section>
      {hidden && (
        <Section title="Why stats are hidden">
          <p className="text-sm text-white/80">
            Roblox's public API returns "[TITLE UNAVAILABLE]" for this experience and marks it content-restricted, so its name,
            visits and players aren't shared. That's usual for private games, or ones whose content-maturity questionnaire isn't
            finished. Likes still come through. Once it's public, the dashboard picks everything up automatically.
          </p>
        </Section>
      )}
      <Section title="About">
        <KeyValues rows={[['Experience ID', String(game?.universeId ?? '—')], ['Store items', 'None recorded yet'], ['Roadmap', 'None recorded yet']]} />
        {game && (
          <a href={game.dashboardUrl} target="_blank" rel="noreferrer" className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-emerald-200 hover:underline">
            Open in Creator Dashboard <ExternalLink size={12} />
          </a>
        )}
      </Section>
    </>
  )
}

function GameBody() {
  const { game, status, lastUpdated } = useRoblox()
  const gross = robloxStore.reduce((n, i) => n + i.robux * i.sold, 0)
  const earned = Math.floor(gross * CREATOR_SHARE)
  const passes = robloxStore.filter((i) => i.type === 'Game pass')
  const productsList = robloxStore.filter((i) => i.type === 'Product')
  const p = robloxProject

  return (
    <>
      <Section title={`Right now${lastUpdated ? ` · updated ${timeAgo(lastUpdated)}` : ''}`} tag={status === 'live' ? 'live' : undefined}>
        <MiniStats
          items={[
            { label: 'Visits', value: fmt(game?.visits) },
            { label: 'Playing now', value: fmt(game?.playing), sub: game ? `max ${game.maxPlayers} per server` : null },
            { label: 'Favourites', value: fmt(game?.favourites) },
            { label: 'Likes', value: game?.likes == null ? '—' : `${game.likes}%`, sub: game ? `${game.upVotes}👍 ${game.downVotes}👎` : null },
            { label: 'Created', value: game ? new Date(game.created).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—' },
            { label: 'Last published', value: game ? timeAgo(Date.parse(game.updated)) : '—' },
          ]}
        />
      </Section>

      <Section title="Robux earnings" tag="placeholder">
        <MiniStats
          items={[
            { label: 'Items sold', value: fmt(robloxStore.reduce((n, i) => n + i.sold, 0)) },
            { label: 'Robux spent', value: `R$ ${fmt(gross)}` },
            { label: 'You earn (70%)', value: `R$ ${fmt(earned)}`, sub: `≈ $${(earned * DEVEX_USD_PER_ROBUX).toFixed(2)} DevEx` },
          ]}
        />
      </Section>

      <Section title="Game passes" tag="real">
        <Bars
          rows={passes.map((i) => ({
            label: `${i.name} · R$ ${i.robux}`,
            value: i.robux * i.sold,
            right: `${i.sold} sold`,
            color: '#fbbf24',
          }))}
        />
        <p className="mt-1.5 text-xs text-white/55">Names and prices are real. Sales counts are placeholders.</p>
      </Section>

      <Section title="Developer products" tag="real">
        <KeyValues rows={productsList.map((i) => [`${i.name} · R$ ${i.robux}`, <span key={i.id} className="text-white/75">{i.effect} · <b className="text-white">{i.sold} sold</b></span>])} />
      </Section>

      <Section title="Systems" tag="real">
        <ul className="divide-y divide-white/10 rounded-xl border border-white/10 bg-white/[0.07] px-3.5">
          {p.systems.map((s) => (
            <li key={s.name} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span>{s.name}</span>
              <StatusPill status={s.status} />
            </li>
          ))}
        </ul>
      </Section>

      <Section title="About" tag="real">
        <KeyValues
          rows={[
            ['Genre', p.genre],
            ['Core loop', p.loop],
            ['Difficulties', p.difficulties.join(' · ')],
          ]}
        />
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
          <FolderLine path={p.notePath} />
          {game && (
            <a href={game.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-emerald-200 hover:underline">
              Open on Roblox <ExternalLink size={12} />
            </a>
          )}
        </div>
      </Section>
    </>
  )
}

function GameIcon({ gameKey = 'sos' }) {
  const { games } = useRoblox()
  const game = games[gameKey]
  const emoji = ROBLOX_GAMES.find((g) => g.key === gameKey)?.emoji ?? '🎮'
  return game?.icon ? (
    <img src={game.icon} alt="" className="h-14 w-14 shrink-0 rounded-2xl ring-2 ring-white/25" />
  ) : (
    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-emerald-500 text-xl">{emoji}</div>
  )
}

// ── Registry ────────────────────────────────────────────────
const appIcon = (app) => (
  <img src={app.icon} alt="" className="h-14 w-14 shrink-0 rounded-2xl bg-white object-cover ring-2 ring-white/25" />
)

export const detailRenderers = {
  app: (id) => {
    const app = apps.find((a) => a.id === id)
    if (!app) return null
    return {
      title: app.name,
      subtitle: app.tagline,
      icon: appIcon(app),
      badge: <StatusPill status={app.status} />,
      body: <AppBody app={app} />,
    }
  },
  product: (id) => {
    const product = products.find((p) => p.id === id)
    if (!product) return null
    return {
      title: product.name,
      subtitle: `${gbp(product.price)} · ${product.stock > 0 ? `${product.stock} in stock` : 'no stock'}`,
      icon: <div className={`h-14 w-14 shrink-0 rounded-2xl bg-gradient-to-br ${product.hue} ring-2 ring-white/25`} />,
      badge: <StatusPill status={product.status} />,
      body: <ProductBody product={product} />,
    }
  },
  job: (id) => {
    const job = printQueue.find((j) => j.id === id)
    if (!job) return null
    return {
      title: job.file,
      subtitle: `${job.material} · ${job.time}`,
      badge: <StatusPill status={job.status} />,
      body: <JobBody job={job} />,
    }
  },
  spool: (id) => {
    const spool = filament.find((f) => f.id === id)
    if (!spool) return null
    return {
      title: spool.name,
      subtitle: `${spool.material} · ${spool.remaining}% left`,
      icon: <div className="h-14 w-14 shrink-0 rounded-full ring-4 ring-white/25" style={{ background: spool.color }} />,
      body: <SpoolBody spool={spool} />,
    }
  },
  game: (id = 'sos') => {
    const cfg = ROBLOX_GAMES.find((g) => g.key === id) ?? ROBLOX_GAMES[0]
    if (cfg.key !== 'sos')
      return { title: cfg.name, subtitle: 'Roblox experience ' + cfg.universeId, icon: <GameIcon gameKey={cfg.key} />, body: <OtherGameBody gameKey={cfg.key} /> }
    return {
    title: 'SOS Airlines',
    subtitle: 'Roblox · co-op physics party game',
      icon: <GameIcon />,
      body: <GameBody />,
    }
  },
}
