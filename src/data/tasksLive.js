// Live launch plans from the vault + ticking tasks (written back to Obsidian
// by server/api.js). One shared store, so every view sees the same ticks.
import { useEffect, useSyncExternalStore } from 'react'
import { launches as staticLaunches } from './launchData'

// ── Store ──
let state = { plans: null, error: null, loading: true }
const subs = new Set()
const emit = () => subs.forEach((f) => f())
const set = (patch) => {
  state = { ...state, ...patch }
  emit()
}

export async function reloadLaunchPlans() {
  try {
    const res = await fetch('/api/launch')
    const body = await res.json()
    if (!res.ok) throw new Error(body.error || res.statusText)
    set({ plans: body.plans, error: null, loading: false })
  } catch (err) {
    set({ error: err.message, loading: false })
  }
}

let timer = null
function subscribe(fn) {
  subs.add(fn)
  if (subs.size === 1) {
    reloadLaunchPlans()
    timer = setInterval(reloadLaunchPlans, 60_000)
    document.addEventListener('visibilitychange', onVisible)
  }
  return () => {
    subs.delete(fn)
    if (subs.size === 0) {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }
}
const onVisible = () => document.visibilityState === 'visible' && reloadLaunchPlans()

export function useLaunchPlans() {
  return useSyncExternalStore(subscribe, () => state)
}

// ── People who can own tasks (names must match server/auth.js) ──
export const PEOPLE = [
  // Oliver builds the apps, so tasks about building, testing and running them are his.
  { id: 'oliver', name: 'Oliver', title: 'Co-CEO · Product & Engineering', initials: 'OP', chip: 'bg-gradient-to-br from-orange-200 to-rose-300 text-stone-800' },
  // Ryley funds RYVO's paid services, so tasks that cost money (hosting, API keys, fees) are his.
  { id: 'ryley', name: 'Ryley', title: 'Co-CEO · Finance & Investment', initials: 'RR', chip:'bg-gradient-to-br from-sky-200 to-indigo-300 text-stone-800' },
]
export const person = (id) => PEOPLE.find((p) => p.id === id)

// ── Ticking / assigning ──
function patchPlan(appId, line, patch) {
  const plan = state.plans?.[appId]
  if (!plan) return
  const sections = plan.sections.map((s) => ({ ...s, items: s.items.map((i) => (i.line === line ? { ...i, ...patch } : i)) }))
  set({ plans: { ...state.plans, [appId]: { ...plan, sections } } })
}

async function postTask(path, note, item, extra) {
  const appId = note.startsWith('launch:') ? note.slice(7) : null
  if (appId) patchPlan(appId, item.line, extra) // optimistic
  try {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note, line: item.line, text: item.text, ...extra }),
    })
    const body = await res.json()
    if (!res.ok) throw new Error(body.error || res.statusText)
    if (appId) reloadLaunchPlans()
    return { ok: true }
  } catch (err) {
    if (appId) reloadLaunchPlans() // put back whatever the note really says
    return { ok: false, error: err.message }
  }
}

/** Sets the task's owner ('oliver' | 'ryley' | null). Written into the note as [owner:: Name]. */
export const assignTask = (note, item, owner) => postTask('/api/tasks/assign', note, item, { owner })

/**
 * Ticks/unticks a task in an Obsidian note. `note` is 'today' or 'launch:<appId>'.
 * Returns { ok } or { ok: false, error }.
 */
export const toggleTask = (note, item, done) => postTask('/api/tasks/toggle', note, item, { done })

/** Every launch task as a flat list: { ...item, appId, note, group, blocking }. */
export function flattenLaunchTasks(launches) {
  return launches.flatMap((l) =>
    l.groups.flatMap((g) => g.items.map((i) => ({ ...i, appId: l.appId, note: `launch:${l.appId}`, group: g.title, blocking: g.blocking, live: l.live }))),
  )
}

// ── Turning a parsed Launch Plan note into dashboard groups ──
const BLOCKING = /blocking|blocker|before launch|before inviting|app stores/i

// Same job appearing in several plans. First rule that matches wins.
const SHARED_RULES = [
  ['solicitor', /solicitor|legal review/i],
  ['appleDev', /apple developer/i],
  ['stripeLive', /stripe.*(live|sandbox)|live mode/i],
  ['git', /\bgit\b/i],
  ['hosting', /hosting.*https|https.*hosting|choose hosting/i],
  ['backups', /test restore/i],
  ['email', /email/i],
  ['domain', /domain/i],
]
export const sharedKey = (text) => SHARED_RULES.find(([, re]) => re.test(text))?.[0]

/** Static launch info (dates, gates, links) + live checklist groups when available. */
export function buildLaunches(plans) {
  const built = buildRaw(plans)
  // Only call a job "shared" when it really appears in two or more apps' plans.
  const appsPerKey = {}
  built.forEach((l) =>
    l.groups.forEach((g) => g.items.forEach((i) => i.shared && (appsPerKey[i.shared] ??= new Set()).add(l.appId))),
  )
  return built.map((l) => ({
    ...l,
    groups: l.groups.map((g) => ({
      ...g,
      items: g.items.map((i) => (i.shared && appsPerKey[i.shared].size < 2 ? { ...i, shared: undefined } : i)),
    })),
  }))
}

function buildRaw(plans) {
  return staticLaunches.map((l) => {
    const plan = plans?.[l.appId]
    if (!plan) return { ...l, live: false }
    const groups = plan.sections
      .map((s) => ({ s, tasks: s.items.filter((i) => i.kind === 'task') }))
      .filter(({ tasks }) => tasks.length)
      .map(({ s, tasks }) => ({
        title: s.title.replace(/\s*\([^)]*\)\s*$/, ''),
        blocking: BLOCKING.test(s.title),
        items: tasks.map((i) => ({ ...i, shared: sharedKey(i.text) })),
      }))
    return { ...l, groups, live: true, modified: plan.modified }
  })
}

/** Convenience hook: launches with live groups. */
export function useLaunches() {
  const { plans, error, loading } = useLaunchPlans()
  return { launches: buildLaunches(plans), error, loading, live: !!plans }
}

export function useAutoReload() {
  useEffect(() => {
    reloadLaunchPlans()
  }, [])
}
