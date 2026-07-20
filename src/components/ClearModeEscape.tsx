import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'

/** Esc exits clear mode; auto-enters clear mode when starting a focus session optionally later. */
export function ClearModeEscape() {
  const clearMode = useAppStore((s) => s.clearMode)
  const setClearMode = useAppStore((s) => s.setClearMode)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && clearMode) {
        setClearMode(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [clearMode, setClearMode])

  return null
}
