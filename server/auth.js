// ─────────────────────────────────────────────────────────────
// Password sign-in for RYVO Dashboard (server side, so passwords never reach
// the browser bundle). Passwords are stored only as salted scrypt hashes, in
// server/users.json, which is NOT committed to git (see .gitignore).
//
// To set or change a password:   npm run set-password
// (server/users.example.json shows the file's format.)
//
// Sessions are HMAC-signed cookies (30 days). The signing secret lives in
// server/.session-secret, created on first run and also not committed.
// Delete it to sign everyone out.
// ─────────────────────────────────────────────────────────────
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
export const USERS_FILE = path.join(here, 'users.json')

// Who can sign in. Their password hashes (and optional full names) come from server/users.json.
const PEOPLE = [
  { id: 'oliver', name: 'Oliver', initials: 'OP' },
  { id: 'ryley', name: 'Ryley', initials: 'RR' },
]

function loadHashes() {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'))
  } catch {
    console.warn('[auth] server/users.json is missing, so nobody can sign in. Run: npm run set-password')
    return {}
  }
}
const hashes = loadHashes()
export const USERS = PEOPLE.map((p) => ({
  ...p,
  fullName: hashes[p.id]?.fullName || p.name,
  salt: hashes[p.id]?.salt,
  hash: hashes[p.id]?.hash,
}))

const COOKIE = 'ohq_session'
const MAX_AGE_S = 30 * 24 * 60 * 60
const SECRET_FILE = path.join(here, '.session-secret')

function loadSecret() {
  try {
    return fs.readFileSync(SECRET_FILE, 'utf8').trim()
  } catch {
    const s = crypto.randomBytes(32).toString('hex')
    fs.writeFileSync(SECRET_FILE, s, { mode: 0o600 })
    return s
  }
}
const SECRET = loadSecret()

const sign = (data) => crypto.createHmac('sha256', SECRET).update(data).digest('hex')
const publicUser = (u) => ({ id: u.id, name: u.name, fullName: u.fullName, initials: u.initials })

function matchPassword(password) {
  if (typeof password !== 'string' || password.length > 200) return null
  for (const u of USERS) {
    if (!u.salt || !u.hash) continue
    const got = crypto.scryptSync(password, u.salt, 32)
    if (crypto.timingSafeEqual(got, Buffer.from(u.hash, 'hex'))) return u
  }
  return null
}

function readCookie(req) {
  const raw = req.headers.cookie || ''
  const hit = raw.split(/;\s*/).find((c) => c.startsWith(`${COOKIE}=`))
  return hit ? decodeURIComponent(hit.slice(COOKIE.length + 1)) : null
}

/** Returns the signed-in user for this request, or null. */
export function getSessionUser(req) {
  const token = readCookie(req)
  if (!token) return null
  const [id, exp, mac] = token.split('.')
  if (!id || !exp || !mac || Number(exp) < Date.now() / 1000) return null
  const expected = sign(`${id}.${exp}`)
  if (mac.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null
  const u = USERS.find((x) => x.id === id)
  return u ? publicUser(u) : null
}

function setSession(res, user) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_S
  const token = `${user.id}.${exp}.${sign(`${user.id}.${exp}`)}`
  res.setHeader('Set-Cookie', `${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE_S}`)
}

// Simple brute-force brake: 8 wrong tries per address per 10 minutes.
const attempts = new Map()
function tooMany(ip) {
  const now = Date.now()
  const a = attempts.get(ip) ?? { n: 0, since: now }
  if (now - a.since > 10 * 60_000) {
    a.n = 0
    a.since = now
  }
  attempts.set(ip, a)
  return a.n >= 8
}

export function readBody(req) {
  return new Promise((resolve) => {
    let s = ''
    req.on('data', (d) => {
      s += d
      if (s.length > 2000) req.destroy()
    })
    req.on('end', () => {
      try {
        resolve(JSON.parse(s || '{}'))
      } catch {
        resolve({})
      }
    })
  })
}

const json = (res, status, body) => {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

/** Handles /api/login, /api/logout, /api/me. Returns true if it answered. */
export async function handleAuth(req, res, pathname) {
  if (pathname === '/api/me' && req.method === 'GET') {
    const user = getSessionUser(req)
    json(res, user ? 200 : 401, user ? { user } : { error: 'signed out' })
    return true
  }
  if (pathname === '/api/login' && req.method === 'POST') {
    const ip = req.socket.remoteAddress || 'unknown'
    if (tooMany(ip)) {
      json(res, 429, { error: 'Too many tries. Wait a few minutes and try again.' })
      return true
    }
    const { password } = await readBody(req)
    const u = matchPassword(String(password ?? '').trim().toLowerCase())
    if (!u) {
      attempts.get(ip).n++
      json(res, 401, { error: "That password isn't right." })
      return true
    }
    attempts.delete(ip)
    setSession(res, u)
    json(res, 200, { user: publicUser(u) })
    return true
  }
  if (pathname === '/api/logout' && req.method === 'POST') {
    res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`)
    json(res, 200, { ok: true })
    return true
  }
  return false
}
