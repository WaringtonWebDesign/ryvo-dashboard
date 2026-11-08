import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { tabs } from './tabs'

export default function BottomNav({ active, onChange }) {
  const scroller = useRef(null)

  // On narrow screens the nav scrolls sideways — keep the active pill visible.
  useEffect(() => {
    const box = scroller.current
    const btn = box?.querySelector('[aria-current="page"]')
    if (!box || !btn) return
    const b = btn.getBoundingClientRect()
    const c = box.getBoundingClientRect()
    const left = box.scrollLeft + (b.left - c.left) - (c.width - b.width) / 2
    box.scrollTo({ left, behavior: 'smooth' })
  }, [active])

  return (
    <nav className="pointer-events-none absolute inset-x-3 bottom-4 z-20 flex justify-center md:bottom-5">
      <div ref={scroller} className="no-scrollbar pointer-events-auto max-w-full overflow-x-auto rounded-full border border-white/25 bg-[rgba(50,34,24,0.4)] p-1.5 shadow-[0_15px_40px_-10px_rgba(30,18,8,0.6)] backdrop-blur-2xl">
        <ul className="flex w-max items-center gap-1">
          {tabs.map((t) => {
            const isActive = t.id === active
            return (
              <li key={t.id}>
                <button
                  onClick={() => onChange(t.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors md:px-5 ${
                    isActive ? 'text-stone-900' : 'text-white/75 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-white shadow-md"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative">{t.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
