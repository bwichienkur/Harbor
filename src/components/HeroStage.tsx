import { AnimatePresence, motion } from 'framer-motion'
import { formatClock } from '../lib/format'
import { useNow } from '../hooks/useNow'
import { useAppStore } from '../store/useAppStore'

export function HeroStage() {
  const now = useNow()
  const mode = useAppStore((s) => s.mode)
  const settings = useAppStore((s) => s.settings)
  const clearMode = useAppStore((s) => s.clearMode)
  const running = useAppStore((s) => s.running)
  const setPanel = useAppStore((s) => s.setPanel)
  const softHideHint = mode === 'focus' && running && settings.softClearFocus

  return (
    <main className={`main-stage ${clearMode ? 'is-clear' : ''}`}>
      <AnimatePresence mode="wait">
        {mode === 'home' && !clearMode ? (
          <motion.div
            key="home"
            className="hero-stack"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {settings.showClock && (
              <div className="clock time-display text-scrim">{formatClock(now)}</div>
            )}
            {settings.showTasks && (
              <button className="btn primary home-add-task" onClick={() => setPanel('tasks')}>
                Add Task
              </button>
            )}
          </motion.div>
        ) : mode !== 'home' && !clearMode && !softHideHint ? (
          <motion.p
            key={`${mode}-hint`}
            className="timer-hint text-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Hold the top bar to move · use ± to resize
          </motion.p>
        ) : null}
      </AnimatePresence>
    </main>
  )
}
