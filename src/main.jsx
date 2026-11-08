import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import LockScreen from './components/LockScreen'
import { AuthProvider, useAuth } from './data/auth'
import './index.css'

function Gate() {
  const { status, user } = useAuth()
  if (status === 'loading') return null
  if (status === 'out') return <LockScreen />
  return <App key={user.id} />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <Gate />
    </AuthProvider>
  </StrictMode>,
)
