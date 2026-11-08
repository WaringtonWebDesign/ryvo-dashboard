// Who is signed in. Passwords are checked on the server (server/auth.js);
// the browser only ever sees the user's name and initials.
import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', user: null })

  useEffect(() => {
    fetch('/api/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => setState(body?.user ? { status: 'in', user: body.user } : { status: 'out', user: null }))
      .catch(() => setState({ status: 'out', user: null }))
  }, [])

  const login = useCallback(async (password) => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const body = await res.json()
      if (!res.ok) return { ok: false, error: body.error || "That password isn't right." }
      return { ok: true, user: body.user }
    } catch {
      return { ok: false, error: "Can't reach the dashboard server." }
    }
  }, [])

  const enter = useCallback((user) => setState({ status: 'in', user }), [])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/logout', { method: 'POST' })
    } finally {
      setState({ status: 'out', user: null })
    }
  }, [])

  return <AuthContext.Provider value={{ ...state, login, enter, logout }}>{children}</AuthContext.Provider>
}
