import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import BottomNav from './components/BottomNav'
import CommandPalette from './components/CommandPalette'
import Overview from './views/Overview'
import Apps from './views/Apps'
import Printing from './views/Printing'
import Roblox from './views/Roblox'
import Products from './views/Products'
import Launch from './views/Launch'
import Goals from './views/Goals'
import { RobloxProvider } from './data/robloxFeed'
import { AlertsProvider } from './data/alerts'
import { DetailProvider } from './components/DetailSheet'
import { detailRenderers } from './details/renderers'

const views = {
  overview: Overview,
  launch: Launch,
  goals: Goals,
  apps: Apps,
  printing: Printing,
  roblox: Roblox,
  products: Products,
}

const isTyping = (el) => el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)

export default function App() {
  const [tab, setTab] = useState('overview')
  const [searchOpen, setSearchOpen] = useState(false)
  const scrollRef = useRef(null)
  const View = views[tab]

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [tab])

  // ⌘K / Ctrl+K anywhere, or "/" when not typing, opens search.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((o) => !o)
      } else if (e.key === '/' && !isTyping(document.activeElement)) {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <RobloxProvider>
      <AlertsProvider>
        <DetailProvider renderers={detailRenderers}>
          <div className="safe-pad h-dvh">
            <div className="glass-panel relative flex h-full overflow-hidden rounded-3xl">
              <Sidebar active={tab} onChange={setTab} />

              <div className="flex min-w-0 flex-1 flex-col">
                <TopBar onOpenSearch={() => setSearchOpen(true)} />
                <main ref={scrollRef} className="thin-scrollbar min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4 pb-28 pt-2 md:px-8">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={tab}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                    >
                      <View onNavigate={setTab} />
                    </motion.div>
                  </AnimatePresence>
                </main>
              </div>

              <BottomNav active={tab} onChange={setTab} />
            </div>
          </div>
          <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} goTo={setTab} />
        </DetailProvider>
      </AlertsProvider>
    </RobloxProvider>
  )
}
