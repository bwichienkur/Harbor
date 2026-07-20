import { AnimatePresence, motion } from 'framer-motion'
import { quoteForToday } from '../data/quotes'
import { formatClock, greetingFor } from '../lib/format'
import { useNow } from '../hooks/useNow'
import { useAppStore } from '../store/useAppStore'

export function HeroStage() {
  const now = useNow()
  const mode = useAppStore((s) => s.mode)
  const settings = useAppStore((s) => s.settings)
  const clearMode = useAppStore((s) => s.clearMode)
  const running = useAppStore((s) => s.running)
  const setPanel = useAppStore((s) => s.setPanel)
  const setMode = useAppStore((s) => s.setMode)
  const tasks = useAppStore((s) => s.tasks)
  const quote = quoteForToday(now)
  const topTask = tasks.find((t) => !t.done)
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
            <div className="greeting text-scrim">
              {greetingFor(now.getHours(), settings.name)}
            </div>
            {settings.showClock && <div className="clock text-scrim">{formatClock(now)}</div>}
            {settings.showQuotes && <p className="quote text-scrim">“{quote.text}”</p>}
            {settings.showTasks && topTask && (
              <div className="priority-chip">
                Next up{topTask.eta ? ` · ${topTask.eta}` : ''}: {topTask.text}
              </div>
            )}
            {!topTask && settings.showTasks && (
              <div className="empty-home">
                <p className="priority-chip">No tasks yet — plan one focus item for today.</p>
                <div className="timer-controls">
                  <button className="btn primary" onClick={() => setPanel('tasks')}>
                    Add a task
                  </button>
                  <button
                    className="btn"
                    onClick={() => {
                      setMode('focus')
                    }}
                  >
                    Start focusing anyway
                  </button>
                </div>
              </div>
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
