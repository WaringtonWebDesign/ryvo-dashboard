// Hooks for the local read-only API (server/api.js) and the weather feed.
import { useEffect, useState } from 'react'

export const VAULT_NAME = 'Ryvo-HQ-Obsidian-Vault'
export const obsidianLink = (file) =>
  `obsidian://open?vault=${encodeURIComponent(VAULT_NAME)}&file=${encodeURIComponent(file)}`

/** Fetches JSON from `url`, refreshing every `refreshMs` and when the tab is shown again. */
export function useJson(url, refreshMs = 60_000) {
  const [state, setState] = useState({ data: null, error: null, loading: true })
  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const res = await fetch(url)
        const body = await res.json()
        if (!res.ok || body.error) throw new Error(body.error || res.statusText)
        if (alive) setState({ data: body, error: null, loading: false })
      } catch (err) {
        if (alive) setState((s) => ({ ...s, error: err.message, loading: false }))
      }
    }
    load()
    const id = setInterval(load, refreshMs)
    const onVisible = () => document.visibilityState === 'visible' && load()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      alive = false
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [url, refreshMs])
  return state
}

// Weather location comes from .env.local (VITE_WEATHER_PLACE / _LAT / _LON); London if unset.
// Open-Meteo is free and needs no key.
export const WEATHER_PLACE = import.meta.env.VITE_WEATHER_PLACE || 'London'
const LAT = import.meta.env.VITE_WEATHER_LAT || '51.51'
const LON = import.meta.env.VITE_WEATHER_LON || '-0.13'
export const WEATHER_URL =
  `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
  '&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,is_day' +
  '&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max' +
  '&timezone=Europe%2FLondon&wind_speed_unit=mph&forecast_days=1'

/** WMO weather code → [label, icon key] */
export function describeWeather(code, isDay = 1) {
  if (code === 0) return ['Clear', isDay ? 'sun' : 'moon']
  if (code <= 2) return ['Partly cloudy', isDay ? 'cloudSun' : 'cloudMoon']
  if (code === 3) return ['Overcast', 'cloud']
  if (code <= 48) return ['Fog', 'fog']
  if (code <= 57) return ['Drizzle', 'drizzle']
  if (code <= 67) return ['Rain', 'rain']
  if (code <= 77) return ['Snow', 'snow']
  if (code <= 82) return ['Showers', 'rain']
  if (code <= 86) return ['Snow showers', 'snow']
  return ['Thunderstorm', 'storm']
}
