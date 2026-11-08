import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

// ── Context: any card or row can call openDetail('app', 'intofy') ──
const DetailContext = createContext({ openDetail: () => {}, closeDetail: () => {} })
export const useDetail = () => useContext(DetailContext)

/**
 * renderers: { [kind]: (id, helpers) => ({ title, subtitle?, icon?, body }) }
 */
export function DetailProvider({ renderers, children }) {
  const [current, setCurrent] = useState(null) // { kind, id }
  const openDetail = useCallback((kind, id) => setCurrent({ kind, id }), [])
  const closeDetail = useCallback(() => setCurrent(null), [])

  const content = current ? renderers[current.kind]?.(current.id, { openDetail, closeDetail }) : null

  return (
    <DetailContext.Provider value={{ openDetail, closeDetail }}>
      {children}
      <AnimatePresence>
        {content && <Sheet key={`${current.kind}:${current.id}`} {...content} onClose={closeDetail} />}
      </AnimatePresence>
    </DetailContext.Provider>
  )
}

function Sheet({ title, subtitle, icon, badge, body, onClose }) {
  const closeBtn = useRef(null)

  useEffect(() => {
    closeBtn.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-stretch md:justify-end">
      <motion.div
        className="absolute inset-0 bg-[rgba(30,18,10,0.35)] backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="relative flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-white/20 bg-[rgba(78,54,38,0.78)] shadow-[0_30px_80px_-20px_rgba(20,10,4,0.7)] backdrop-blur-2xl md:m-4 md:max-h-none md:w-[min(600px,calc(100vw-32px))] md:rounded-3xl"
      >
        <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-white/30 md:hidden" />
        <header className="flex items-start gap-4 border-b border-white/10 px-5 pb-4 pt-4 md:px-6 md:pt-6">
          {icon}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-2xl font-bold tracking-tight">{title}</h2>
              {badge}
            </div>
            {subtitle && <p className="mt-0.5 text-sm text-white/65">{subtitle}</p>}
          </div>
          <button
            ref={closeBtn}
            onClick={onClose}
            aria-label="Close"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 transition hover:bg-white/20"
          >
            <X size={18} />
          </button>
        </header>
        <div className="thin-scrollbar flex-1 space-y-5 overflow-y-auto px-5 pb-8 pt-5 md:px-6">{body}</div>
      </motion.aside>
    </div>
  )
}

// ── Building blocks for detail bodies ──

const tags = {
  real: { text: 'From project files', cls: 'bg-sky-400/20 text-sky-100 ring-sky-300/40' },
  live: { text: 'Live', cls: 'bg-emerald-400/25 text-emerald-100 ring-emerald-300/40' },
  placeholder: { text: 'Placeholder', cls: 'bg-white/15 text-white/75 ring-white/25' },
}

export function Section({ title, tag, children, className = '' }) {
  const t = tags[tag]
  return (
    <section className={className}>
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-white/60">{title}</h3>
        {t && <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${t.cls}`}>{t.text}</span>}
      </div>
      {children}
    </section>
  )
}

export function MiniStats({ items }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      {items.map((i) => (
        <div key={i.label} className="min-w-0 rounded-xl border border-white/10 bg-white/10 px-3.5 py-3">
          <p className="truncate text-xs text-white/60">{i.label}</p>
          <p className="mt-0.5 truncate text-xl font-bold">{i.value}</p>
          {i.sub && <p className="truncate text-[11px] text-white/55">{i.sub}</p>}
        </div>
      ))}
    </div>
  )
}

export function KeyValues({ rows }) {
  return (
    <dl className="divide-y divide-white/10 rounded-xl border border-white/10 bg-white/[0.07]">
      {rows.filter(Boolean).map(([k, v]) => (
        <div key={k} className="flex items-start justify-between gap-4 px-3.5 py-2.5 text-sm">
          <dt className="shrink-0 text-white/60">{k}</dt>
          <dd className="min-w-0 break-words text-right font-medium">{v}</dd>
        </div>
      ))}
    </dl>
  )
}

export function Chips({ items }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((s) => (
        <span key={s} className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-xs">
          {s}
        </span>
      ))}
    </div>
  )
}

export function BulletList({ items }) {
  return (
    <ul className="space-y-1.5 text-sm">
      {items.map((s) => (
        <li key={s} className="flex gap-2">
          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" />
          <span>{s}</span>
        </li>
      ))}
    </ul>
  )
}

export const gbp = (n, dp = 2) =>
  n == null ? '—' : n.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: dp, maximumFractionDigits: dp })
