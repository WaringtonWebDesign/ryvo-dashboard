import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { oliverHqApi } from './server/api.js'

// Roblox's public APIs don't allow browser requests from other sites (no CORS),
// so the dev/preview server forwards them. Browser calls /api/roblox/... → Roblox.
const robloxProxy = {
  '/api/roblox/games': {
    target: 'https://games.roblox.com',
    changeOrigin: true,
    rewrite: (p) => p.replace(/^\/api\/roblox\/games/, ''),
  },
  '/api/roblox/thumbs': {
    target: 'https://thumbnails.roblox.com',
    changeOrigin: true,
    rewrite: (p) => p.replace(/^\/api\/roblox\/thumbs/, ''),
  },
}

export default defineConfig(({ mode }) => {
  // Local settings (vault path, weather location) come from .env.local, which isn't committed.
  const env = loadEnv(mode, process.cwd(), '')
  return {
    // oliverHqApi: local endpoints for vault notes + project health (see server/api.js)
    plugins: [react(), tailwindcss(), oliverHqApi({ vault: env.RYVO_VAULT_PATH })],
    server: { proxy: robloxProxy },
    preview: { proxy: robloxProxy },
  }
})
