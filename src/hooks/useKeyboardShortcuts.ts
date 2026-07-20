import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'

export function useKeyboardShortcuts() {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const typing =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      if (typing) return

      const state = useAppStore.getState()

      if (event.key === 'Escape') {
        if (state.clearMode) {
          state.setClearMode(false)
          return
        }
        if (state.panel !== 'none') {
          state.setPanel('none')
          return
        }
        if (state.miniTimer) {
          state.setMiniTimer(false)
        }
        return
      }

      if (event.key === '?' && !event.metaKey && !event.ctrlKey) {
        state.setPanel(state.panel === 'settings' ? 'none' : 'settings')
        return
      }

      if (event.code === 'Space') {
        event.preventDefault()
        if (state.running) state.pauseTimer()
        else state.startTimer()
        return
      }

      if (event.key === 'c' || event.key === 'C') {
        if (state.mode !== 'home') state.toggleClearMode()
        return
      }

      if (event.key === 'm' || event.key === 'M') {
        if (state.mode !== 'home') state.setMiniTimer(!state.miniTimer)
        return
      }

      if (event.key === '1') state.setMode('home')
      if (event.key === '2') state.setMode('focus')
      if (event.key === '3') state.setMode('ambient')
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
