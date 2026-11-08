// SOS Airlines alerts: compares each Roblox poll with the last snapshot this
// device saw (kept in localStorage, so you also get "while you were away"
// alerts) and records anything worth knowing. Optional browser notifications.
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useRoblox } from './robloxFeed'

const SNAP_KEY = 'oliver-hq:rbx-snapshot'
const LIST_KEY = 'oliver-hq:alerts'
const MAX = 40

const load = (k, fallback) => {
  try {
    const v = localStorage.getItem(k)
    return v ? JSON.parse(v) : fallback
  } catch {
    return fallback
  }
}
const save = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v))
  } catch {
    /* storage blocked */
  }
}

const milestoneStep = (n) => (n < 10_000 ? 100 : n < 100_000 ? 1_000 : 10_000)
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`

// Numbers Roblox hides for a restricted game are null, so every check needs both sides.
const has = (...xs) => xs.every((x) => typeof x === 'number')

export function diffGame(prev, g) {
  const out = []
  if (!prev) return out
  const n = g.name
  if (has(g.playing, prev.playing) && g.playing > 0 && prev.playing === 0) out.push({ title: `Players joined ${n}`, body: `${plural(g.playing, 'player')} in game right now` })
  if (has(g.playing) && g.playing > (prev.peak ?? 0) && g.playing > 0) out.push({ title: `${n}: new player peak`, body: `${plural(g.playing, 'player')} at once, the most this dashboard has seen` })
  if (has(g.visits, prev.visits)) {
    const step = milestoneStep(g.visits)
    if (Math.floor(g.visits / step) > Math.floor(prev.visits / step)) {
      out.push({ title: `${n} passed ${(Math.floor(g.visits / step) * step).toLocaleString('en-GB')} visits`, body: `Now on ${g.visits.toLocaleString('en-GB')} visits` })
    } else if (g.visits - prev.visits >= 10) {
      out.push({ title: `${n}: +${g.visits - prev.visits} visits`, body: `Since last check · now ${g.visits.toLocaleString('en-GB')}` })
    }
  }
  if (has(g.favourites, prev.favourites) && g.favourites > prev.favourites) out.push({ title: `${n}: +${plural(g.favourites - prev.favourites, 'favourite')}`, body: `${g.favourites} in total` })
  if (has(g.upVotes, prev.upVotes) && g.upVotes > prev.upVotes) out.push({ title: `${n}: +${plural(g.upVotes - prev.upVotes, 'like')}`, body: `${g.likes}% liked (${g.upVotes}👍 ${g.downVotes}👎)` })
  if (has(g.downVotes, prev.downVotes) && g.downVotes > prev.downVotes) out.push({ title: `${n}: +${plural(g.downVotes - prev.downVotes, 'dislike')}`, body: `${g.likes}% liked (${g.upVotes}👍 ${g.downVotes}👎)` })
  if (prev.updated && g.updated && g.updated !== prev.updated) out.push({ title: `${n}: new version published`, body: 'Updated on Roblox' })
  if (prev.restricted === true && g.restricted === false) out.push({ title: `${n} is now public`, body: 'Roblox is showing its stats, so the dashboard is tracking visits and players' })
  return out
}

// SOS Airlines keeps the original key so its saved snapshot carries on.
// Keyed by experience ID, so pointing a game at a different experience starts fresh.
const snapKey = (game) => (game.key === 'sos' ? SNAP_KEY : `${SNAP_KEY}:${game.universeId}`)

const AlertsContext = createContext(null)
export const useAlerts = () => useContext(AlertsContext)

export function AlertsProvider({ children }) {
  const { list, lastUpdated } = useRoblox()
  const [alerts, setAlerts] = useState(() => load(LIST_KEY, []))
  const [permission, setPermission] = useState(() => (typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'))
  const seen = useRef(null)

  const canNotify = typeof Notification !== 'undefined' && window.isSecureContext

  useEffect(() => save(LIST_KEY, alerts), [alerts])

  useEffect(() => {
    if (!list.length || !lastUpdated || seen.current === lastUpdated) return
    seen.current = lastUpdated
    const stamped = []
    for (const game of list) {
      const prev = load(snapKey(game), null)
      diffGame(prev, game).forEach((a, i) =>
        stamped.push({ ...a, game: game.key, icon: game.icon, id: `${lastUpdated}-${game.key}-${i}`, t: lastUpdated, read: false }),
      )
      save(snapKey(game), {
        visits: game.visits, favourites: game.favourites, playing: game.playing,
        upVotes: game.upVotes, downVotes: game.downVotes, updated: game.updated, restricted: game.restricted,
        peak: Math.max(prev?.peak ?? 0, game.playing ?? 0),
      })
    }
    if (!stamped.length) return
    setAlerts((current) => [...stamped.reverse(), ...current].slice(0, MAX))
    if (canNotify && Notification.permission === 'granted') {
      stamped.forEach((a) => {
        try {
          new Notification(a.title, { body: a.body, icon: a.icon ?? '/icons/icon-192.png', tag: a.id })
        } catch {
          /* some browsers only allow notifications from a service worker */
        }
      })
    }
  }, [list, lastUpdated, canNotify])

  const enableNotifications = useCallback(async () => {
    if (!canNotify) return
    setPermission(await Notification.requestPermission())
  }, [canNotify])

  const markAllRead = useCallback(() => setAlerts((l) => l.map((a) => ({ ...a, read: true }))), [])
  const clearAll = useCallback(() => setAlerts([]), [])
  const unread = alerts.filter((a) => !a.read).length

  return (
    <AlertsContext.Provider value={{ alerts, unread, markAllRead, clearAll, canNotify, permission, enableNotifications }}>
      {children}
    </AlertsContext.Provider>
  )
}
