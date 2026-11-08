import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion'
import { ArrowRight, Lock, Loader2 } from 'lucide-react'
import { useAuth } from '../data/auth'

function Hello({ name }) {
  return (
    <motion.div
      key="hello"
      className="text-center"
      initial={{ opacity: 0, scale: 0.92, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 1.04, filter: 'blur(6px)' }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
    >
      <motion.p
        className="text-6xl"
        aria-hidden="true"
        animate={{ rotate: [0, 18, -10, 18, -6, 0] }}
        transition={{ duration: 1.2, delay: 0.15 }}
        style={{ transformOrigin: '70% 70%', display: 'inline-block' }}
      >
        👋
      </motion.p>
      <h1 className="mt-4 text-5xl font-extrabold tracking-tight md:text-6xl">Hello {name}</h1>
      <p className="mt-2 text-white/70">Opening your dashboard…</p>
    </motion.div>
  )
}

export default function LockScreen() {
  const { login, enter } = useAuth()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [hello, setHello] = useState(null)
  const input = useRef(null)
  const shake = useAnimationControls()

  useEffect(() => {
    input.current?.focus()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (!password || busy) return
    setBusy(true)
    setError('')
    const res = await login(password)
    setBusy(false)
    if (!res.ok) {
      setError(res.error)
      setPassword('')
      shake.start({ x: [0, -12, 10, -8, 6, -3, 0], transition: { duration: 0.45 } })
      input.current?.focus()
      return
    }
    setHello(res.user)
    setTimeout(() => enter(res.user), 1900)
  }

  return (
    <div className="safe-pad grid min-h-dvh place-items-center">
      <AnimatePresence mode="wait">
        {hello ? (
          <Hello name={hello.name} />
        ) : (
          <motion.form
            key="lock"
            onSubmit={submit}
            animate={shake}
            exit={{ opacity: 0, y: -10 }}
            className="glass-panel w-full max-w-sm rounded-3xl px-6 py-8 text-center sm:px-8"
          >
            <img src="/icons/icon-192.png" alt="" className="mx-auto h-16 w-16 rounded-2xl shadow-lg" />
            <h1 className="mt-4 text-2xl font-bold tracking-tight">RYVO Dashboard</h1>
            <p className="mt-1 text-sm text-white/65">Enter your password to unlock</p>

            <label className="mt-6 flex h-12 items-center gap-2 rounded-full border border-white/25 bg-white/10 pl-4 pr-1.5 focus-within:bg-white/15 focus-within:ring-2 focus-within:ring-white/30">
              <Lock size={16} className="shrink-0 text-white/60" />
              <span className="sr-only">Password</span>
              <input
                ref={input}
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="min-w-0 flex-1 bg-transparent text-white placeholder:text-white/50 focus:outline-none"
                aria-invalid={!!error}
                aria-describedby={error ? 'lock-error' : undefined}
              />
              <button
                type="submit"
                disabled={!password || busy}
                aria-label="Unlock"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-stone-900 transition disabled:opacity-40"
              >
                {busy ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              </button>
            </label>
            <p id="lock-error" role="alert" className="mt-3 min-h-5 text-sm text-rose-100">
              {error}
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
