import { useEffect, useRef } from 'react'
import { useAppStore } from '../store/useAppStore'

/**
 * Keeps the display awake via the Screen Wake Lock API while the timer runs.
 * Wake locks are released when the tab is hidden; we re-request on visibility restore.
 */
export function useWakeLock() {
  const running = useAppStore((s) => s.running)
  const enabled = useAppStore((s) => s.settings.keepAwakeWhileRunning)
  const lockRef = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    const canLock = typeof navigator !== 'undefined' && 'wakeLock' in navigator
    if (!canLock) return

    let cancelled = false

    const release = async () => {
      const lock = lockRef.current
      lockRef.current = null
      if (!lock) return
      try {
        await lock.release()
      } catch {
        /* already released */
      }
    }

    const request = async () => {
      if (cancelled || !enabled || !running || document.visibilityState !== 'visible') {
        await release()
        return
      }
      if (lockRef.current && !lockRef.current.released) return

      try {
        const lock = await navigator.wakeLock.request('screen')
        if (cancelled || !enabled || !running) {
          await lock.release()
          return
        }
        lockRef.current = lock
        lock.addEventListener('release', () => {
          if (lockRef.current === lock) lockRef.current = null
        })
      } catch {
        /* permission denied / unsupported context — ignore */
      }
    }

    void request()

    const onVisibility = () => {
      if (document.visibilityState === 'visible') void request()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibility)
      void release()
    }
  }, [running, enabled])
}
