export function formatClock(date: Date) {
  // Keep a compact wall-clock that visually matches timer digits (tabular, no seconds).
  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatTimer(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(safe / 3600)
  const m = Math.floor((safe % 3600) / 60)
  const s = safe % 60
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function formatDuration(ms: number) {
  const mins = Math.round(ms / 60_000)
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

export function formatEtaMinutes(mins: number | null | undefined) {
  if (mins == null || mins <= 0) return 'No estimate'
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

export function greetingFor(hour: number, name: string) {
  const who = name.trim() || 'friend'
  if (hour < 5) return `Still burning the midnight oil, ${who}?`
  if (hour < 12) return `Good morning, ${who}.`
  if (hour < 17) return `Good afternoon, ${who}.`
  if (hour < 21) return `Good evening, ${who}.`
  return `Winding down looks good on you, ${who}.`
}

/** Accepts current numeric minutes or legacy Flocus-style labels like "30m" / "1h". */
export function etaToMinutes(eta: number | string | null | undefined): number {
  if (eta == null || eta === '') return 0
  if (typeof eta === 'number') return Number.isFinite(eta) ? Math.max(0, Math.round(eta)) : 0
  const raw = String(eta).trim().toLowerCase()
  if (raw.endsWith('h')) return Number(raw.replace('h', '')) * 60
  if (raw.endsWith('m')) return Number(raw.replace('m', ''))
  const n = Number(raw)
  return Number.isFinite(n) ? n : 0
}

export function clampEtaMinutes(mins: number) {
  return Math.min(240, Math.max(5, Math.round(mins)))
}
