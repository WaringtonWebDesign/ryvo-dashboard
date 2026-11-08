import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, Bell, BellRing, Command, Gamepad2, Lock } from 'lucide-react'
import { useAuth } from '../data/auth'
import { useAlerts } from '../data/alerts'
import { timeAgo } from '../data/robloxFeed'
import { person } from '../data/tasksLive'

function AlertsMenu({ onClose }) {
  const { alerts, markAllRead, clearAll, canNotify, permission, enableNotifications } = useAlerts()
  const box = useRef(null)

  useEffect(() => {
    const onDown = (e) => box.current && !box.current.contains(e.target) && !e.target.closest('[data-alerts-button]') && onClose()
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('pointerdown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      window.removeEventListener('keydown', onKey)
      markAllRead()
    }
  }, [onClose, markAllRead])

  return (
    <motion.div
      ref={box}
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.16 }}
      className="absolute right-0 top-14 z-40 w-[min(360px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-white/20 bg-[rgba(58,39,27,0.97)] shadow-[0_30px_80px_-20px_rgba(20,10,4,0.7)] backdrop-blur-2xl"
      role="dialog"
      aria-label="Alerts"
    >
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <p className="text-sm font-semibold">Roblox alerts</p>
        {alerts.length > 0 && (
          <button onClick={clearAll} className="text-xs text-white/60 hover:text-white">
            Clear
          </button>
        )}
      </div>
      <ul className="thin-scrollbar max-h-80 overflow-y-auto">
        {alerts.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-white/60">
            No alerts yet. You'll see players joining, milestones, new likes and favourites here.
          </li>
        )}
        {alerts.map((a) => (
          <li key={a.id} className="flex gap-3 border-b border-white/[0.06] px-4 py-3 last:border-0">
            {a.icon ? (
              <img src={a.icon} alt="" className="mt-0.5 h-8 w-8 shrink-0 rounded-lg" />
            ) : (
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-400/25">
                <Gamepad2 size={15} />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm font-medium">
                {a.title}
                {!a.read && <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />}
              </p>
              <p className="text-xs text-white/65">{a.body}</p>
              <p className="mt-0.5 text-[11px] text-white/45">{timeAgo(a.t)}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="border-t border-white/10 px-4 py-3 text-xs text-white/65">
        {!canNotify ? (
          <p>Pop-up notifications need a secure connection (localhost or HTTPS). On your phone, alerts collect here instead.</p>
        ) : permission === 'granted' ? (
          <p className="flex items-center gap-1.5"><BellRing size={13} /> Desktop notifications are on.</p>
        ) : permission === 'denied' ? (
          <p>Notifications are blocked for this site in your browser settings.</p>
        ) : (
          <button onClick={enableNotifications} className="w-full rounded-full bg-white px-3 py-2 text-sm font-semibold text-stone-900 hover:bg-white/90">
            Turn on desktop notifications
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default function TopBar({ onOpenSearch }) {
  const { unread } = useAlerts()
  const { user, logout } = useAuth()
  const [userOpen, setUserOpen] = useState(false)
  const userBox = useRef(null)
  useEffect(() => {
    if (!userOpen) return
    const onDown = (e) => userBox.current && !userBox.current.contains(e.target) && setUserOpen(false)
    const onKey = (e) => e.key === 'Escape' && setUserOpen(false)
    document.addEventListener('pointerdown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [userOpen])
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

  return (
    <header className="relative z-30 flex shrink-0 items-center gap-3 px-4 py-4 md:gap-6 md:px-8 md:py-5">
      <div ref={userBox} className="relative shrink-0">
        <button
          onClick={() => setUserOpen((o) => !o)}
          aria-expanded={userOpen}
          aria-label={`Signed in as ${user.fullName}`}
          className="flex items-center gap-3 rounded-full text-left"
        >
          <span
            className={`grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br text-sm font-semibold text-stone-800 ring-2 ring-white/40 ${
              user.id === 'ryley' ? 'from-sky-200 to-indigo-300' : 'from-orange-200 to-rose-300'
            }`}
          >
            {user.initials}
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-xs text-white/60">Welcome,</span>
            <span className="block text-sm font-semibold">{user.name}</span>
          </span>
        </button>
        <AnimatePresence>
          {userOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 top-12 z-40 w-56 overflow-hidden rounded-2xl border border-white/20 bg-[rgba(58,39,27,0.97)] p-1.5 shadow-[0_30px_80px_-20px_rgba(20,10,4,0.7)] backdrop-blur-2xl"
            >
              <p className="px-3 pb-2 pt-1.5 text-xs text-white/60">
                Signed in as <b className="text-white">{user.fullName}</b>
                {person(user.id)?.title && <span className="mt-0.5 block text-white/50">{person(user.id).title}</span>}
              </p>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-white/10"
              >
                <Lock size={15} /> Lock dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        onClick={onOpenSearch}
        className="mx-auto flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 text-left text-sm backdrop-blur-xl transition hover:bg-white/15 md:max-w-md"
      >
        <Search size={16} className="shrink-0 text-white/60" />
        <span className="min-w-0 flex-1 truncate text-white/55">Search or jump to...</span>
        <kbd className="hidden shrink-0 items-center gap-0.5 rounded-md bg-white/15 px-1.5 py-0.5 font-sans text-[11px] text-white/70 sm:inline-flex">
          {isMac ? <Command size={11} /> : 'Ctrl '}K
        </kbd>
      </button>

      <div className="relative shrink-0">
        <button
          data-alerts-button
          onClick={() => setOpen((o) => !o)}
          aria-label={unread ? `Alerts, ${unread} unread` : 'Alerts'}
          aria-expanded={open}
          className="relative grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10 backdrop-blur-xl transition hover:bg-white/20"
        >
          <Bell size={18} />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
        <AnimatePresence>{open && <AlertsMenu onClose={close} />}</AnimatePresence>
      </div>
    </header>
  )
}
