// ─────────────────────────────────────────────────────────────
// Live Roblox feed — real public stats for your experiences.
// No login needed. Requests go through the Vite proxy in
// vite.config.js (/api/roblox/...) because Roblox blocks CORS.
// ─────────────────────────────────────────────────────────────
import { createContext, useContext, useEffect, useRef, useState } from 'react'

// Your experiences. The universe ID is the number in
// create.roblox.com/dashboard/creations/experiences/<ID>/overview
// `name` is used when Roblox hides the real title (private / restricted games).
export const ROBLOX_GAMES = [
  { key: 'sos', universeId: 10773679611, name: 'SOS Airlines', emoji: '✈' },
  { key: 'investor', universeId: 10767644004, name: 'Steal an Investor', emoji: '💰' },
]
export const ROBLOX_UNIVERSE_ID = ROBLOX_GAMES[0].universeId
export const POLL_MS = 30_000

// SOS Airlines keeps its original storage key so its saved history survives.
const historyKey = (g) => `oliver-hq:roblox-history:${g.universeId}`
const HISTORY_WINDOW_MS = 24 * 60 * 60 * 1000

async function getJson(url, signal) {
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

/** Fetches every configured game in one go. Returns { [key]: game }. */
export async function fetchRobloxGames(signal) {
  const ids = ROBLOX_GAMES.map((g) => g.universeId).join(',')
  const [games, votes, icons] = await Promise.all([
    getJson(`/api/roblox/games/v1/games?universeIds=${ids}`, signal),
    getJson(`/api/roblox/games/v1/games/votes?universeIds=${ids}`, signal),
    getJson(`/api/roblox/thumbs/v1/games/icons?universeIds=${ids}&size=150x150&format=Png&isCircular=false`, signal).catch(() => null),
  ])
  const out = {}
  // Restricted games come back with id 0 and "[TITLE UNAVAILABLE]", in no fixed order.
  // Match real ids first; a game Roblox hides takes one of the unclaimed id-0 rows.
  const rows = games.data ?? []
  const anonymous = rows.filter((x) => x.id === 0)
  ROBLOX_GAMES.forEach((cfg) => {
    const g = rows.find((x) => x.id === cfg.universeId) ?? anonymous.shift()
    const v = votes.data?.find((x) => x.id === cfg.universeId) ?? { upVotes: 0, downVotes: 0 }
    const icon = icons?.data?.find((x) => x.targetId === cfg.universeId)?.imageUrl ?? null
    const restricted = !g || g.id === 0 || g.isContentRestricted || /UNAVAILABLE/.test(g.name ?? '')
    const totalVotes = v.upVotes + v.downVotes
    out[cfg.key] = {
      key: cfg.key,
      universeId: cfg.universeId,
      emoji: cfg.emoji,
      restricted,
      name: restricted ? cfg.name : g.name,
      robloxName: restricted ? null : g.name, // the title Roblox shows publicly
      creator: restricted ? null : g.creator?.name,
      genre: restricted ? null : g.genre_l1 || g.genre,
      url: restricted ? null : `https://www.roblox.com${g.canonicalUrlPath ?? `/games/${g.rootPlaceId}`}`,
      dashboardUrl: `https://create.roblox.com/dashboard/creations/experiences/${cfg.universeId}/overview`,
      icon,
      // Hidden by Roblox for restricted games: null, never a fake 0.
      visits: restricted ? null : g.visits,
      favourites: restricted ? null : g.favoritedCount,
      playing: restricted ? null : g.playing,
      maxPlayers: restricted ? null : g.maxPlayers,
      upVotes: v.upVotes,
      downVotes: v.downVotes,
      likes: totalVotes ? Math.round((v.upVotes / totalVotes) * 100) : null,
      created: restricted ? null : g.created,
      updated: restricted ? null : g.updated,
    }
  })
  return out
}

// ── Local sample history (so we can chart players/visits over time) ──
function loadHistory(g) {
  try {
    const raw = JSON.parse(localStorage.getItem(historyKey(g)) ?? '[]')
    const cutoff = Date.now() - HISTORY_WINDOW_MS
    return Array.isArray(raw) ? raw.filter((s) => s.t >= cutoff) : []
  } catch {
    return []
  }
}

function saveHistory(g, history) {
  try {
    localStorage.setItem(historyKey(g), JSON.stringify(history))
  } catch {
    /* storage unavailable — history just won't persist */
  }
}

// ── Provider: one poller shared by every view ──
const RobloxContext = createContext(null)

export function RobloxProvider({ children }) {
  const [state, setState] = useState(() => ({
    status: 'loading', // loading | live | error
    games: {}, // { [key]: game }
    histories: Object.fromEntries(ROBLOX_GAMES.map((g) => [g.key, loadHistory(g)])),
    error: null,
    lastUpdated: null,
  }))
  const timer = useRef(null)

  useEffect(() => {
    let alive = true
    let controller

    const poll = async () => {
      controller = new AbortController()
      try {
        const games = await fetchRobloxGames(controller.signal)
        if (!alive) return
        const now = Date.now()
        setState((prev) => {
          const cutoff = now - HISTORY_WINDOW_MS
          const histories = {}
          for (const cfg of ROBLOX_GAMES) {
            const g = games[cfg.key]
            const prevH = (prev.histories[cfg.key] ?? []).filter((s) => s.t >= cutoff)
            // Only record samples for games whose stats Roblox actually shows.
            histories[cfg.key] = g && !g.restricted ? [...prevH, { t: now, playing: g.playing, visits: g.visits }] : prevH
            saveHistory(cfg, histories[cfg.key])
          }
          return { status: 'live', games, histories, error: null, lastUpdated: now }
        })
      } catch (err) {
        if (!alive || err.name === 'AbortError') return
        setState((prev) => ({ ...prev, status: 'error', error: err.message }))
      }
    }

    poll()
    timer.current = setInterval(poll, POLL_MS)
    // Refresh straight away when the tab/phone comes back into view.
    const onVisible = () => document.visibilityState === 'visible' && poll()
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      alive = false
      controller?.abort()
      clearInterval(timer.current)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  return <RobloxContext.Provider value={state}>{children}</RobloxContext.Provider>
}

/**
 * Roblox state. Also exposes `game` and `history` for the first game
 * (SOS Airlines), so older views keep working, plus `list` in config order.
 */
export function useRoblox() {
  const s = useContext(RobloxContext)
  const first = ROBLOX_GAMES[0].key
  return {
    ...s,
    game: s.games[first] ?? null,
    history: s.histories[first] ?? [],
    list: ROBLOX_GAMES.map((g) => s.games[g.key]).filter(Boolean),
  }
}

// ── Helpers for views ──
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

export function timeAgo(ts, now = Date.now()) {
  if (!ts) return '—'
  const s = Math.max(0, Math.round((now - ts) / 1000))
  if (s < 5) return 'just now'
  if (s < 60) return `${s}s ago`
  const m = Math.round(s / 60)
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h} hr${h > 1 ? 's' : ''} ago`
  const d = Math.round(h / 24)
  return `${d} day${d > 1 ? 's' : ''} ago`
}

export const fmt = (n) => (n == null ? '—' : n.toLocaleString('en-GB'))

export function compact(n) {
  if (n == null) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 10_000) return `${(n / 1000).toFixed(1)}K`
  return n.toLocaleString('en-GB')
}

/** Turns raw samples into chart points: players + visits gained since previous sample. */
export function historyToChart(history) {
  return history.map((s, i) => ({
    time: new Date(s.t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    playing: s.playing,
    gained: i === 0 ? 0 : Math.max(0, s.visits - history[i - 1].visits),
  }))
}
