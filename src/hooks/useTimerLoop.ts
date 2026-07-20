import { useEffect, useRef } from 'react'
import { playChime } from '../lib/audio'
import { updateDocumentTitle } from '../lib/documentTitle'
import { notifyPhaseChange } from '../lib/notifications'
import { useAppStore } from '../store/useAppStore'

export function useTimerLoop() {
  const tick = useAppStore((s) => s.tick)
  const syncFromWallClock = useAppStore((s) => s.syncFromWallClock)
  const running = useAppStore((s) => s.running)
  const phase = useAppStore((s) => s.phase)
  const remainingMs = useAppStore((s) => s.remainingMs)
  const elapsedMs = useAppStore((s) => s.elapsedMs)
  const timerMode = useAppStore((s) => s.timerSettings.mode)
  const alertSound = useAppStore((s) => s.settings.alertSound)
  const alertSoundId = useAppStore((s) => s.settings.alertSoundId)
  const desktopNotifications = useAppStore((s) => s.settings.desktopNotifications)
  const prevPhase = useRef(phase)
  const primed = useRef(false)

  useEffect(() => {
    if (!running) return

    let frame = 0
    let interval = 0

    const loop = () => {
      tick()
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    interval = window.setInterval(() => tick(), 1000)

    return () => {
      cancelAnimationFrame(frame)
      window.clearInterval(interval)
    }
  }, [running, tick])

  useEffect(() => {
    const sync = () => {
      syncFromWallClock()
    }
    document.addEventListener('visibilitychange', sync)
    window.addEventListener('focus', sync)
    window.addEventListener('pageshow', sync)
    sync()
    return () => {
      document.removeEventListener('visibilitychange', sync)
      window.removeEventListener('focus', sync)
      window.removeEventListener('pageshow', sync)
    }
  }, [syncFromWallClock])

  useEffect(() => {
    if (!primed.current) {
      primed.current = true
      prevPhase.current = phase
      return
    }
    if (prevPhase.current === phase) return

    const from = prevPhase.current
    prevPhase.current = phase

    if (alertSound) playChime(alertSoundId)

    if (desktopNotifications) {
      const detail =
        phase === 'focus'
          ? 'Back to focus. You’ve got this.'
          : phase === 'idle'
            ? 'Nice work — session complete.'
            : 'Time for a break. Stretch and reset.'
      notifyPhaseChange(phase, `${from} → ${phase}. ${detail}`)
    }
  }, [phase, alertSound, alertSoundId, desktopNotifications])

  useEffect(() => {
    updateDocumentTitle(
      running,
      phase,
      remainingMs,
      elapsedMs,
      timerMode === 'stopwatch',
    )
  }, [running, phase, remainingMs, elapsedMs, timerMode])
}
