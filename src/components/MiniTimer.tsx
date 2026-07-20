import { useEffect, useRef } from 'react'
import { formatTimer } from '../lib/format'
import { useAppStore } from '../store/useAppStore'

declare global {
  interface Window {
    documentPictureInPicture?: {
      requestWindow: (options?: { width?: number; height?: number }) => Promise<Window>
    }
  }
}

export function MiniTimer() {
  const miniTimer = useAppStore((s) => s.miniTimer)
  const setMiniTimer = useAppStore((s) => s.setMiniTimer)
  const running = useAppStore((s) => s.running)
  const phase = useAppStore((s) => s.phase)
  const remainingMs = useAppStore((s) => s.remainingMs)
  const elapsedMs = useAppStore((s) => s.elapsedMs)
  const timerMode = useAppStore((s) => s.timerSettings.mode)
  const startTimer = useAppStore((s) => s.startTimer)
  const pauseTimer = useAppStore((s) => s.pauseTimer)
  const pipWin = useRef<Window | null>(null)

  const displayMs = timerMode === 'stopwatch' ? elapsedMs : remainingMs
  const label = formatTimer(displayMs / 1000)

  useEffect(() => {
    if (!miniTimer) {
      pipWin.current?.close()
      pipWin.current = null
      return
    }

    let cancelled = false

    const mount = async () => {
      if (!window.documentPictureInPicture) return
      try {
        const win = await window.documentPictureInPicture.requestWindow({
          width: 280,
          height: 160,
        })
        if (cancelled) {
          win.close()
          return
        }
        pipWin.current = win
        win.document.body.innerHTML = `
          <style>
            html,body{margin:0;height:100%;background:#0f1c1c;color:#f4f1ea;font-family:Manrope,system-ui,sans-serif;display:grid;place-items:center}
            .t{font-size:42px;font-weight:700;letter-spacing:-0.03em;font-variant-numeric:tabular-nums}
            .s{opacity:.65;font-size:12px;text-transform:uppercase;letter-spacing:.14em;margin-bottom:6px}
          </style>
          <div style="text-align:center">
            <div class="s" id="phase">${phase}</div>
            <div class="t" id="time">${label}</div>
          </div>
        `
        win.addEventListener('pagehide', () => {
          setMiniTimer(false)
          pipWin.current = null
        })
      } catch {
        /* PiP unsupported or blocked — overlay fallback remains */
      }
    }

    void mount()
    return () => {
      cancelled = true
      pipWin.current?.close()
      pipWin.current = null
    }
  }, [miniTimer, setMiniTimer])

  useEffect(() => {
    const doc = pipWin.current?.document
    if (!doc) return
    const time = doc.getElementById('time')
    const phaseEl = doc.getElementById('phase')
    if (time) time.textContent = label
    if (phaseEl) phaseEl.textContent = phase
  }, [label, phase])

  if (!miniTimer) return null

  return (
    <div className="mini-timer" role="dialog" aria-label="Mini timer">
      <div className="mini-timer-phase">{phase}</div>
      <div className="mini-timer-digits">{label}</div>
      <div className="timer-controls">
        <button className="btn primary" onClick={() => (running ? pauseTimer() : startTimer())}>
          {running ? 'Pause' : 'Start'}
        </button>
        <button className="btn" onClick={() => setMiniTimer(false)}>
          Close
        </button>
      </div>
      {!window.documentPictureInPicture && (
        <p className="helper">Picture-in-Picture isn’t available here — using on-page mini timer.</p>
      )}
    </div>
  )
}
