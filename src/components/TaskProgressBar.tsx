import { useEffect, useState } from 'react'
import { etaToMinutes, formatDuration, formatEtaMinutes } from '../lib/format'
import { taskProgressRatio, taskSpentMs } from '../lib/stats'
import { useAppStore } from '../store/useAppStore'
import type { Task } from '../types'

type TaskProgressBarProps = {
  task: Task
  /** Compact bar for the focus dock / under the timer. */
  compact?: boolean
  className?: string
}

export function TaskProgressBar({ task, compact = false, className = '' }: TaskProgressBarProps) {
  const sessions = useAppStore((s) => s.sessions)
  const phase = useAppStore((s) => s.phase)
  const focusStartedAt = useAppStore((s) => s.focusStartedAt)
  const activeTaskId = useAppStore((s) => s.activeTaskId)
  const running = useAppStore((s) => s.running)
  const etaMins = etaToMinutes(task.eta)
  const live =
    phase === 'focus' && activeTaskId === task.id && Boolean(focusStartedAt)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!live) return
    const id = window.setInterval(() => setNow(Date.now()), running ? 1000 : 4000)
    return () => window.clearInterval(id)
  }, [live, running])

  if (!etaMins) return null

  const spentMs = taskSpentMs(sessions, task.id, {
    phase,
    focusStartedAt,
    activeTaskId,
    now,
  })
  const ratio = taskProgressRatio(spentMs, etaMins)
  const over = spentMs > etaMins * 60_000
  const label = `${formatDuration(spentMs)} / ${formatEtaMinutes(etaMins)}`

  return (
    <div
      className={`task-progress ${compact ? 'compact' : ''} ${over ? 'over' : ''} ${className}`.trim()}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(ratio * 100)}
      aria-label={`Progress on ${task.text}: ${label}`}
    >
      <div className="task-progress-track">
        <div className="task-progress-fill" style={{ width: `${ratio * 100}%` }} />
      </div>
      <small className="task-progress-label">{label}</small>
    </div>
  )
}
