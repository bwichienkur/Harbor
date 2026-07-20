import type { TimerPhase, TimerSettings } from '../types'

export function phaseDurationSeconds(settings: TimerSettings, phase: TimerPhase) {
  if (phase === 'focus') {
    if (settings.mode === 'countdown') return settings.countdownMins * 60
    if (settings.mode === 'fiftyTwo') return 52 * 60
    return settings.pomodoroMins * 60
  }
  if (phase === 'shortBreak') {
    if (settings.mode === 'fiftyTwo') return 17 * 60
    return settings.shortBreakMins * 60
  }
  if (phase === 'longBreak') return settings.longBreakMins * 60
  return 0
}

export function phaseProgress(
  settings: TimerSettings,
  phase: TimerPhase,
  remainingMs: number,
  elapsedMs: number,
) {
  if (settings.mode === 'stopwatch') {
    const target = settings.pomodoroMins * 60_000
    return Math.min(1, elapsedMs / Math.max(1, target))
  }
  const total = phaseDurationSeconds(settings, phase) * 1000
  if (total <= 0) return 0
  return Math.min(1, Math.max(0, 1 - remainingMs / total))
}
