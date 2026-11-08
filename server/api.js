// ─────────────────────────────────────────────────────────────
// Local API served by the Vite dev/preview server (sign-in required).
//   GET /api/vault/today   → "Today & Next Actions" note, parsed
//   GET /api/vault/goals   → Goals Dashboard + Goals & North Star, parsed
//   GET /api/health        → last change / git / to-do marker counts per project folder
//   GET /api/launch        → the three Launch Plan notes, parsed
//   POST /api/tasks/toggle → tick/untick ONE checkbox in an allowlisted note
//   POST /api/tasks/assign → set/clear its [owner:: Name] field (the only other write)
// Only the notes and folders listed below are ever read. The only writes are
// ticking a "- [ ]" box or setting its owner, in the notes listed in TICKABLE.
// All of these need a signed-in session (see server/auth.js).
// With `npm run dev -- --host` the dashboard is reachable on your home Wi-Fi, but these still need a password.
// ─────────────────────────────────────────────────────────────
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

import { handleAuth, getSessionUser, readBody, USERS } from './auth.js'

const run = promisify(execFile)

// Where the Obsidian vault lives on this computer. Set RYVO_VAULT_PATH in .env.local
// (git-ignored; see .env.example). It's passed in by vite.config.js.
export let VAULT = ''
export const VAULT_NAME = 'Ryvo-HQ-Obsidian-Vault'

const NOTES = {
  today: '00 Command Centre/Today & Next Actions.md',
  goalsDashboard: '14 Future & Goals/Goals Dashboard.md',
  northStar: '00 Command Centre/Goals & North Star.md',
}

const LAUNCH_PLANS = {
  intofy: '02 Products/Intofy/Launch Plan.md',
  sparesy: '02 Products/Sparesy/Launch Plan.md',
  selvo: '02 Products/Selvo/Launch Plan.md',
}

// The ONLY notes the dashboard may write to, and only to flip a "- [ ]" box.
const TICKABLE = {
  today: NOTES.today,
  'launch:intofy': LAUNCH_PLANS.intofy,
  'launch:sparesy': LAUNCH_PLANS.sparesy,
  'launch:selvo': LAUNCH_PLANS.selvo,
}

const todayISO = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' })

// Task owner, stored in the note as a Dataview inline field: "- [ ] Do the thing [owner:: Ryley]"
const OWNER_FIELD = /\s*\[owner::\s*([^\]]*)\]/i

/** Splits a raw task body into display text and owner id ('oliver' | 'ryley' | null). */
export function splitTask(raw) {
  const name = raw.match(OWNER_FIELD)?.[1]?.trim().toLowerCase()
  const owner = name ? (USERS.find((u) => u.name.toLowerCase() === name || u.id === name)?.id ?? null) : null
  return { text: clean(raw.replace(OWNER_FIELD, '')), owner }
}

/**
 * Changes one checkbox line in an allowlisted note. The line must still hold
 * the same task text the dashboard saw, so a note edited in Obsidian meanwhile
 * is never changed by mistake (the dashboard just reloads instead).
 * `change(parts)` returns the new [box, body] for the line.
 */
async function editTaskLine({ note, line, text }, change) {
  const rel = TICKABLE[note]
  if (!rel) throw Object.assign(new Error('That note cannot be changed from the dashboard'), { status: 400 })
  const full = path.join(VAULT, rel)
  const raw = await fs.readFile(full, 'utf8')
  const eol = raw.includes('\r\n') ? '\r\n' : '\n'
  const lines = raw.split(/\r?\n/)
  const m = Number.isInteger(line) ? lines[line]?.match(/^(\s*[-*]\s+\[)( |x|X)(\]\s+)(.*)$/) : null
  if (!m || splitTask(m[4]).text !== text) {
    throw Object.assign(new Error('The note changed in Obsidian. Reloaded, try again.'), { status: 409 })
  }
  const [box, body] = change({ box: m[2], body: m[4] })
  lines[line] = `${m[1]}${box}${m[3]}${body}`
  // Keep the note's own "updated:" date current, if it has one.
  if (lines[0] === '---') {
    const end = lines.indexOf('---', 1)
    for (let i = 1; i < end; i++) if (/^updated:\s*/.test(lines[i])) lines[i] = `updated: ${todayISO()}`
  }
  await fs.writeFile(full, lines.join(eol), 'utf8')
  healthCache = { at: 0, data: null }
}

async function toggleTask({ note, line, text, done }) {
  await editTaskLine({ note, line, text }, ({ body }) => [done ? 'x' : ' ', body])
  return { ok: true, note, line, done }
}

/** Sets or clears the [owner:: Name] field on one task. */
async function assignTask({ note, line, text, owner }) {
  const user = owner == null ? null : USERS.find((u) => u.id === owner)
  if (owner != null && !user) throw Object.assign(new Error('Unknown person'), { status: 400 })
  await editTaskLine({ note, line, text }, ({ box, body }) => {
    const bare = body.replace(OWNER_FIELD, '').trimEnd()
    return [box, user ? `${bare} [owner:: ${user.name}]` : bare]
  })
  return { ok: true, note, line, owner: user?.id ?? null }
}

export const PROJECTS = [
  { id: 'intofy', name: 'Intofy', path: 'C:\\Fussed\\MAIN' },
  { id: 'sparesy', name: 'Sparesy', path: 'C:\\Spare Seat' },
  { id: 'selvo', name: 'Selvo', path: 'C:\\Websites\\SoloBiz' },
  { id: 'ryvo', name: 'RYVO website', path: 'C:\\Websites\\RYVO' },
  { id: 'ryvo-dashboard', name: 'RYVO Dashboard', path: 'C:\\Websites\\ryvo-dashboard' },
  { id: 'roblox', name: 'Roblox vault (SOS Airlines)', path: 'C:\\Obsidian\\Roblox' },
  { id: 'pc-workshop', name: 'PC Workshop game', path: 'C:\\pc-workshop-game\\pc-workshop-game' },
  { id: 'vault', name: 'RYVO HQ vault', path: VAULT },
]

const IGNORE = new Set([
  'node_modules', '.git', 'dist', 'build', '.next', 'venv', '.venv', '__pycache__', '.expo', '.pgdata',
  'test-results', 'playwright-report', 'coverage', '.turbo', '.cache', 'uploads', '.obsidian', '.trash',
])
// Built from pieces so this file doesn't count its own markers.
const MARKERS = new RegExp(String.raw`\b(` + ['TO' + 'DO', 'FIX' + 'ME', 'HA' + 'CK'].join('|') + String.raw`)\b`, 'g')
const CODE_EXT = new Set(['.js', '.jsx', '.ts', '.tsx', '.py', '.lua', '.luau', '.css', '.html', '.sql'])

// ── Markdown → sections / tasks / tables ──
function clean(s) {
  return s
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, (_, a) => a.split('/').pop())
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .trim()
}

export function parseNote(text) {
  const lines = text.split(/\r?\n/)
  // Skip YAML frontmatter, but keep real file line numbers so tasks can be ticked in place.
  let start = 0
  if (lines[0] === '---') {
    const end = lines.indexOf('---', 1)
    if (end > 0) start = end + 1
  }
  const sections = []
  let cur = { title: null, level: 1, items: [], tables: [] }
  sections.push(cur)
  let table = null
  for (let lineNo = start; lineNo < lines.length; lineNo++) {
    const line = lines[lineNo]
    const h = line.match(/^(#{1,6})\s+(.*)/)
    if (h) {
      cur = { title: clean(h[2]), level: h[1].length, items: [], tables: [] }
      sections.push(cur)
      table = null
      continue
    }
    if (/^\s*\|/.test(line)) {
      const cells = line.trim().replace(/^\||\|$/g, '').split('|').map((c) => clean(c))
      if (cells.every((c) => /^:?-{2,}:?$/.test(c))) continue
      if (!table) {
        table = { head: cells, rows: [] }
        cur.tables.push(table)
      } else table.rows.push(cells)
      continue
    }
    table = null
    const t = line.match(/^\s*[-*]\s+\[( |x|X)\]\s+(.*)/)
    if (t) {
      cur.items.push({ kind: 'task', done: t[1] !== ' ', ...splitTask(t[2]), line: lineNo })
      continue
    }
    const b = line.match(/^\s*[-*]\s+(.*)/)
    if (b) cur.items.push({ kind: 'bullet', text: clean(b[1]) })
  }
  return sections.filter((s) => s.title || s.items.length || s.tables.length)
}

async function readNote(rel) {
  const full = path.join(VAULT, rel)
  const [text, stat] = await Promise.all([fs.readFile(full, 'utf8'), fs.stat(full)])
  return { path: rel, modified: stat.mtime.toISOString(), sections: parseNote(text) }
}

// ── Project health ──
async function walk(dir, state, depth = 0) {
  if (depth > 10 || state.files > 25000) return
  let entries
  try {
    entries = await fs.readdir(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const e of entries) {
    if (IGNORE.has(e.name)) continue
    const full = path.join(dir, e.name)
    if (e.isDirectory()) await walk(full, state, depth + 1)
    else if (e.isFile()) {
      state.files++
      let st
      try {
        st = await fs.stat(full)
      } catch {
        continue
      }
      if (st.mtimeMs > state.latest) {
        state.latest = st.mtimeMs
        state.latestFile = full
      }
      const ext = path.extname(e.name).toLowerCase()
      if (CODE_EXT.has(ext) && st.size < 400_000) {
        try {
          const txt = await fs.readFile(full, 'utf8')
          state.todos += (txt.match(MARKERS) || []).length
        } catch {
          /* unreadable file */
        }
      }
      if (ext === '.md' && st.size < 400_000) {
        try {
          const txt = await fs.readFile(full, 'utf8')
          state.openTasks += (txt.match(/^\s*[-*]\s+\[ \]/gm) || []).length
        } catch {
          /* unreadable file */
        }
      }
    }
  }
}

async function gitInfo(dir) {
  try {
    const [{ stdout: log }, { stdout: status }] = await Promise.all([
      run('git', ['-C', dir, 'log', '-1', '--format=%cI%x09%s'], { timeout: 8000 }),
      run('git', ['-C', dir, 'status', '--porcelain'], { timeout: 8000 }),
    ])
    const [date, subject] = log.trim().split('\t')
    return { repo: true, lastCommit: date || null, subject: subject || null, uncommitted: status.split('\n').filter(Boolean).length }
  } catch {
    return { repo: false }
  }
}

let healthCache = { at: 0, data: null }

async function projectHealth() {
  if (healthCache.data && Date.now() - healthCache.at < 5 * 60_000) return healthCache.data
  const data = await Promise.all(
    PROJECTS.map(async (p) => {
      try {
        await fs.access(p.path)
      } catch {
        return { ...p, exists: false }
      }
      const state = { files: 0, latest: 0, latestFile: null, todos: 0, openTasks: 0 }
      const [, git] = await Promise.all([walk(p.path, state), gitInfo(p.path)])
      return {
        ...p,
        exists: true,
        files: state.files,
        lastChange: state.latest ? new Date(state.latest).toISOString() : null,
        lastFile: state.latestFile ? path.relative(p.path, state.latestFile) : null,
        todos: state.todos,
        openTasks: state.openTasks,
        git,
      }
    }),
  )
  healthCache = { at: Date.now(), data }
  return data
}

// ── HTTP handler ──
const routes = {
  '/api/vault/today': async () => ({ vault: VAULT_NAME, note: await readNote(NOTES.today) }),
  // The Goals Dashboard note is Oliver's personal goals,
  // so it's only sent to Oliver. Everyone signed in gets the Ryvo 12-month goals.
  '/api/vault/goals': async (url, user) => ({
    vault: VAULT_NAME,
    dashboard: user.id === 'oliver' ? await readNote(NOTES.goalsDashboard) : null,
    northStar: await readNote(NOTES.northStar),
  }),
  '/api/health': async (url) => {
    if (url.searchParams.get('refresh') === '1') healthCache = { at: 0, data: null }
    return { generatedAt: new Date(healthCache.at || Date.now()).toISOString(), projects: await projectHealth() }
  },
  '/api/launch': async () => {
    const entries = await Promise.all(Object.entries(LAUNCH_PLANS).map(async ([id, rel]) => [id, await readNote(rel)]))
    return { vault: VAULT_NAME, plans: Object.fromEntries(entries) }
  },
}

const postRoutes = {
  '/api/tasks/toggle': async (req) => toggleTask(await readBody(req)),
  '/api/tasks/assign': async (req) => assignTask(await readBody(req)),
}

export function oliverHqApi({ vault } = {}) {
  VAULT = vault || ''
  const vaultProject = PROJECTS.find((p) => p.id === 'vault')
  if (vaultProject) vaultProject.path = VAULT
  if (!VAULT) console.warn('[api] RYVO_VAULT_PATH is not set in .env.local, so vault notes can\'t be read.')
  const handler = async (req, res, next) => {
    const url = new URL(req.url, 'http://local')
    if (await handleAuth(req, res, url.pathname)) return
    const route = req.method === 'GET' ? routes[url.pathname] : req.method === 'POST' ? postRoutes[url.pathname] : null
    if (!route) return next()
    // Every vault / health endpoint needs a signed-in session.
    const user = getSessionUser(req)
    if (!user) {
      res.statusCode = 401
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Sign in first' }))
      return
    }
    try {
      const body = req.method === 'POST' ? await route(req, user) : await route(url, user)
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Cache-Control', 'no-store')
      res.end(JSON.stringify(body))
    } catch (err) {
      res.statusCode = err.status || 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: err.message }))
    }
  }
  return {
    name: 'ryvo-dashboard-api',
    configureServer(server) {
      server.middlewares.use(handler)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler)
    },
  }
}
