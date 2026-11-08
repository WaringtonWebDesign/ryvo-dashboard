import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Loader2, UserPlus, UserX } from 'lucide-react'
import { PEOPLE, person, assignTask } from '../data/tasksLive'

/** Small avatar chip showing who owns a task; click to (re)assign. Writes [owner:: Name] into the note. */
export default function OwnerChip({ item, note, disabled = false }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const box = useRef(null)
  const owner = person(item.owner)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => box.current && !box.current.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const choose = async (id) => {
    setOpen(false)
    if (id === (item.owner ?? null)) return
    setBusy(true)
    setError('')
    const res = await assignTask(note, item, id)
    setBusy(false)
    if (!res.ok) setError(res.error)
  }

  return (
    <div ref={box} className="relative shrink-0">
      <button
        type="button"
        disabled={disabled || busy}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={owner ? `Owner: ${owner.name}. Change owner` : 'Assign this task'}
        title={error || (owner ? `${owner.name} is on this` : 'Assign to someone')}
        className={`grid h-6 w-6 place-items-center rounded-full text-[9px] font-bold transition ${
          owner ? `${owner.chip} ring-1 ring-white/40` : 'border border-dashed border-white/35 text-white/50 hover:border-white/70 hover:text-white'
        } ${error ? 'ring-2 ring-rose-400' : ''} disabled:cursor-default`}
      >
        {busy ? <Loader2 size={11} className="animate-spin" /> : owner ? owner.initials : <UserPlus size={11} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            role="menu"
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-7 z-30 w-40 overflow-hidden rounded-xl border border-white/20 bg-[rgba(58,39,27,0.97)] p-1 shadow-[0_20px_50px_-15px_rgba(20,10,4,0.7)] backdrop-blur-2xl"
          >
            {PEOPLE.map((p) => (
              <li key={p.id}>
                <button role="menuitem" type="button" title={p.title} onClick={() => choose(p.id)} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-white/10">
                  <span className={`grid h-5 w-5 place-items-center rounded-full text-[8px] font-bold ${p.chip}`}>{p.initials}</span>
                  <span className="flex-1">{p.name}</span>
                  {item.owner === p.id && <Check size={13} className="text-emerald-300" />}
                </button>
              </li>
            ))}
            <li>
              <button role="menuitem" type="button" onClick={() => choose(null)} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-white/75 hover:bg-white/10">
                <UserX size={15} className="ml-0.5" />
                <span className="flex-1">Unassigned</span>
                {!item.owner && <Check size={13} className="text-emerald-300" />}
              </button>
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
