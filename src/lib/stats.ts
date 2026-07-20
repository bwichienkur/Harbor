import type { FocusSession, Task } from '../types'
import { etaToMinutes } from './format'

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x.getTime()
}

export function focusMsSince(sessions: FocusSession[], from: number) {
  return sessions
    .filter((s) => s.endedAt >= from && s.phase === 'focus')
    .reduce((acc, s) => acc + s.durationMs, 0)
}

export function bestFocusDay(sessions: FocusSession[]) {
  const byDay = new Map<string, number>()
  for (const s of sessions) {
    if (s.phase !== 'focus') continue
    const key = new Date(s.endedAt).toISOString().slice(0, 10)
    byDay.set(key, (byDay.get(key) ?? 0) + s.durationMs)
  }
  let bestKey = ''
  let bestMs = 0
  for (const [key, ms] of byDay) {
    if (ms > bestMs) {
      bestMs = ms
      bestKey = key
    }
  }
  return { date: bestKey, ms: bestMs }
}

/** Consecutive days (ending today or yesterday) with any focus time. */
export function focusStreak(sessions: FocusSession[], now = new Date()) {
  const daysWithFocus = new Set<number>()
  for (const s of sessions) {
    if (s.phase !== 'focus' || s.durationMs <= 0) continue
    daysWithFocus.add(startOfDay(new Date(s.endedAt)))
  }

  let cursor = startOfDay(now)
  if (!daysWithFocus.has(cursor)) {
    cursor -= 86_400_000
  }
  let streak = 0
  while (daysWithFocus.has(cursor)) {
    streak += 1
    cursor -= 86_400_000
  }
  return streak
}

export function weekBars(sessions: FocusSession[], now = new Date()) {
  const todayStart = startOfDay(now)
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(todayStart - (6 - i) * 86_400_000)
    const next = day.getTime() + 86_400_000
    const ms = sessions
      .filter((s) => s.endedAt >= day.getTime() && s.endedAt < next && s.phase === 'focus')
      .reduce((acc, s) => acc + s.durationMs, 0)
    return {
      label: day.toLocaleDateString([], { weekday: 'short' }),
      ms,
    }
  })
}

export function plannedMinutes(tasks: Task[]) {
  return tasks.filter((t) => !t.done).reduce((sum, t) => sum + etaToMinutes(t.eta), 0)
}

export function sessionsToCsv(sessions: FocusSession[]) {
  const header = 'id,startedAt,endedAt,durationMins,mode,phase,taskId'
  const rows = sessions.map((s) =>
    [
      s.id,
      new Date(s.startedAt).toISOString(),
      new Date(s.endedAt).toISOString(),
      (s.durationMs / 60_000).toFixed(2),
      s.mode,
      s.phase,
      s.taskId ?? '',
    ].join(','),
  )
  return [header, ...rows].join('\n')
}

export function downloadText(filename: string, text: string, type = 'text/plain') {
  const blob = new Blob([text], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
