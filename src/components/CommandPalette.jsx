import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, CornerDownLeft, LayoutGrid, Package, Printer, Disc3, Gamepad2, Rocket, ListChecks, ShoppingBag, Compass } from 'lucide-react'
import { useDetail } from './DetailSheet'
import { tabs } from './tabs'
import { apps, products, printQueue, filament, robloxStore } from '../data/mockData'
import { useLaunches } from '../data/tasksLive'
import { ROBLOX_GAMES } from '../data/robloxFeed'

// Everything the palette can find. `run` receives { openDetail, goTo }.
function buildIndex(launches) {
  const items = []
  tabs.forEach((t) => items.push({ id: `tab:${t.id}`, group: 'Go to', icon: t.icon ?? Compass, title: t.label, hint: 'Tab', run: (h) => h.goTo(t.id) }))
  apps.forEach((a) => {
    items.push({ id: `app:${a.id}`, group: 'Apps', icon: LayoutGrid, title: a.name, hint: `${a.status} · ${a.tagline}`, run: (h) => h.openDetail('app', a.id) })
    a.roadmap.filter((r) => !r.done).forEach((r, i) =>
      items.push({ id: `road:${a.id}:${i}`, group: 'Roadmap', icon: ListChecks, title: r.task, hint: a.name, run: (h) => h.openDetail('app', a.id) }),
    )
  })
  launches.forEach((l) => {
    const name = apps.find((a) => a.id === l.appId)?.name
    l.groups.forEach((g) =>
      g.items.filter((i) => !i.done).forEach((i, n) =>
        items.push({ id: `launch:${l.appId}:${g.title}:${n}`, group: 'Launch tasks', icon: Rocket, title: i.text, hint: `${name} · ${g.title}${i.owner ? ` · ${i.owner === 'ryley' ? 'Ryley' : 'Oliver'}` : ''}`, run: (h) => h.goTo('launch') }),
      ),
    )
  })
  products.forEach((p) => items.push({ id: `product:${p.id}`, group: 'Products', icon: Package, title: p.name, hint: `£${p.price.toFixed(2)} · ${p.status}`, run: (h) => h.openDetail('product', p.id) }))
  printQueue.forEach((j) => items.push({ id: `job:${j.id}`, group: 'Print jobs', icon: Printer, title: j.file, hint: `${j.material} · ${j.status}`, run: (h) => h.openDetail('job', j.id) }))
  filament.forEach((f) => items.push({ id: `spool:${f.id}`, group: 'Filament', icon: Disc3, title: f.name, hint: `${f.remaining}% left`, run: (h) => h.openDetail('spool', f.id) }))
  ROBLOX_GAMES.forEach((g) =>
    items.push({ id: `game:${g.key}`, group: 'Roblox', icon: Gamepad2, title: g.name, hint: g.key === 'sos' ? 'Live stats, store, systems' : `Roblox experience ${g.universeId}`, run: (h) => h.openDetail('game', g.key) }),
  )
  robloxStore.forEach((s) => items.push({ id: `store:${s.id}`, group: 'Roblox', icon: ShoppingBag, title: s.name, hint: `${s.type} · R$ ${s.robux}`, run: (h) => h.openDetail('game') }))
  return items
}

function match(item, words) {
  const hay = `${item.title} ${item.hint} ${item.group}`.toLowerCase()
  return words.every((w) => hay.includes(w))
}

export default function CommandPalette({ open, onClose, goTo }) {
  const { openDetail } = useDetail()
  const { launches } = useLaunches()
  const index = useMemo(() => buildIndex(launches), [launches])
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const results = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean)
    const list = words.length ? index.filter((i) => match(i, words)) : index.filter((i) => i.group === 'Go to' || i.group === 'Apps' || i.group === 'Roblox' && i.id.startsWith('game:'))
    return list.slice(0, 40)
  }, [q, index])

  useEffect(() => {
    if (open) {
      setQ('')
      setActive(0)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open])
  useEffect(() => setActive(0), [q])
  useEffect(() => {
    listRef.current?.querySelector(`[data-idx="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const choose = (item) => {
    if (!item) return
    onClose()
    item.run({ openDetail, goTo })
  }

  const onKey = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      choose(results[active])
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  let lastGroup = null
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center px-3 pt-[12vh]">
          <motion.div className="absolute inset-0 bg-[rgba(30,18,10,0.4)] backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/20 bg-[rgba(58,39,27,0.96)] shadow-[0_30px_80px_-20px_rgba(20,10,4,0.7)] backdrop-blur-2xl"
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-4">
              <Search size={18} className="shrink-0 text-white/60" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKey}
                placeholder="Search apps, products, prints, launch tasks…"
                className="h-14 w-full bg-transparent text-base text-white placeholder:text-white/50 focus:outline-none"
                role="combobox"
                aria-expanded="true"
                aria-controls="palette-results"
                aria-activedescendant={results[active] ? `pal-${active}` : undefined}
              />
              <kbd className="hidden shrink-0 rounded-md bg-white/15 px-1.5 py-0.5 text-[11px] text-white/70 sm:inline">Esc</kbd>
            </div>
            <ul id="palette-results" ref={listRef} role="listbox" className="thin-scrollbar max-h-[55vh] overflow-y-auto p-2">
              {results.length === 0 && <li className="px-3 py-6 text-center text-sm text-white/60">Nothing matches "{q}"</li>}
              {results.map((item, i) => {
                const header = item.group !== lastGroup ? item.group : null
                lastGroup = item.group
                const Icon = item.icon
                return (
                  <li key={item.id} role="presentation">
                    {header && <p className="px-3 pb-1 pt-2.5 text-[11px] font-semibold uppercase tracking-wider text-white/50">{header}</p>}
                    <button
                      id={`pal-${i}`}
                      data-idx={i}
                      role="option"
                      aria-selected={i === active}
                      onMouseMove={() => setActive(i)}
                      onClick={() => choose(item)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${i === active ? 'bg-white/15' : ''}`}
                    >
                      <Icon size={16} className="shrink-0 text-white/70" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{item.title}</span>
                        <span className="block truncate text-xs text-white/55">{item.hint}</span>
                      </span>
                      {i === active && <CornerDownLeft size={14} className="shrink-0 text-white/50" />}
                    </button>
                  </li>
                )
              })}
            </ul>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
