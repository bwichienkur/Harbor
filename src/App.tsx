import { Background } from './components/Background'
import { ClearModeEscape } from './components/ClearModeEscape'
import { FocusClock } from './components/FocusClock'
import { FocusTaskDock } from './components/FocusTaskDock'
import { FocusTimer } from './components/FocusTimer'
import { HeroStage } from './components/HeroStage'
import { MiniTimer } from './components/MiniTimer'
import { ModeSwitch } from './components/ModeSwitch'
import { Onboarding } from './components/Onboarding'
import { SidePanel } from './components/SidePanel'
import { TopBar } from './components/TopBar'
import { useAmbientSound } from './hooks/useAmbientSound'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useSiteFont } from './hooks/useSiteFont'
import { useTimerLoop } from './hooks/useTimerLoop'
import { useWakeLock } from './hooks/useWakeLock'
import { useAppStore } from './store/useAppStore'

export default function App() {
  useTimerLoop()
  useAmbientSound()
  useKeyboardShortcuts()
  useSiteFont()
  useWakeLock()
  const mode = useAppStore((s) => s.mode)
  const clearMode = useAppStore((s) => s.clearMode)
  const running = useAppStore((s) => s.running)
  const softClearFocus = useAppStore((s) => s.settings.softClearFocus)
  const highContrast = useAppStore((s) => s.settings.highContrast)
  const softFocus = mode === 'focus' && running && softClearFocus && !clearMode

  return (
    <div
      className={[
        'app-shell',
        clearMode ? 'clear-mode' : '',
        softFocus ? 'soft-clear-focus' : '',
        highContrast ? 'high-contrast' : '',
        mode === 'ambient' ? 'mode-ambient' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Background />
      <TopBar />
      <HeroStage />
      {mode !== 'home' && <FocusTimer />}
      {mode !== 'home' && <FocusClock />}
      <FocusTaskDock />
      <ModeSwitch />
      {!clearMode && <SidePanel />}
      <MiniTimer />
      <Onboarding />
      <ClearModeEscape />
    </div>
  )
}
