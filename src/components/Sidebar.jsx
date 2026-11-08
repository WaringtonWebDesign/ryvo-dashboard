import { Settings } from 'lucide-react'
import { tabs } from './tabs'

export default function Sidebar({ active, onChange }) {
  return (
    <aside className="hidden w-[76px] shrink-0 flex-col items-center gap-3 border-r border-white/10 py-6 md:flex">
      <div className="mb-4 grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-lg font-bold shadow-lg">
        O
      </div>
      <nav className="flex flex-1 flex-col items-center gap-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            title={label}
            aria-label={label}
            onClick={() => onChange(id)}
            className={`grid h-11 w-11 place-items-center rounded-full transition-all ${
              active === id
                ? 'bg-white text-stone-900 shadow-md'
                : 'text-white/70 hover:bg-white/15 hover:text-white'
            }`}
          >
            <Icon size={19} />
          </button>
        ))}
      </nav>
      <button
        title="Settings"
        aria-label="Settings"
        className="grid h-11 w-11 place-items-center rounded-full text-white/70 transition-all hover:bg-white/15 hover:text-white"
      >
        <Settings size={19} />
      </button>
    </aside>
  )
}
