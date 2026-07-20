import { AnimatePresence, motion } from 'framer-motion'
import { formatClock } from '../lib/format'
import { useNow } from '../hooks/useNow'
import { useAppStore } from '../store/useAppStore'

export function HeroStage() {
  const now = useNow()
  const mode = useAppStore((s) => s.mode)
  const settings = useAppStore((s) => s.settings)
  const clearMode = useAppStore((s) => s.clearMode)
  const setPanel = useAppStore((s) => s.setPanel)

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
        ) : null}
      </AnimatePresence>
    </main>
  )
}
