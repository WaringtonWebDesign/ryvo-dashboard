// Sets a dashboard password: npm run set-password
// Asks who and the new password, then saves only a salted scrypt hash
// to server/users.json (not committed to git). Restart the dev server after.
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline/promises'
import { fileURLToPath } from 'node:url'

const file = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'server', 'users.json')
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

const who = (await rl.question('Whose password? (oliver / ryley): ')).trim().toLowerCase()
if (!['oliver', 'ryley'].includes(who)) {
  console.error('Unknown person.')
  process.exit(1)
}
// Sign-in lowercases and trims what's typed, so the hash is made the same way.
const password = (await rl.question('New password: ')).trim().toLowerCase()
rl.close()
if (password.length < 8) {
  console.error('Use at least 8 characters.')
  process.exit(1)
}

let users = {}
try {
  users = JSON.parse(fs.readFileSync(file, 'utf8'))
} catch {
  /* first password: start a new file */
}
const salt = crypto.randomBytes(16).toString('hex')
users[who] = { ...users[who], salt, hash: crypto.scryptSync(password, salt, 32).toString('hex') }
fs.writeFileSync(file, JSON.stringify(users, null, 2) + '\n', { mode: 0o600 })
console.log(`Saved ${who}'s password. Restart the dev server to use it.`)
