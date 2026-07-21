import {
  GripVertical,
  ListRestart,
  Lock,
  LockOpen,
  Maximize2,
  Minimize2,
  PictureInPicture2,
  RotateCcw,
  Scan,
} from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { formatTimer } from '../lib/format'
import { phaseProgress } from '../lib/phaseDuration'
import {
  DEFAULT_TIMER_WIDTH,
  MAX_TIMER_WIDTH,
  MIN_TIMER_WIDTH,
  useAppStore,
} from '../store/useAppStore'
import type { TimerLayout } from '../types'
import { SessionTally } from './SessionTally'
import { TaskProgressBar } from './TaskProgressBar'

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function centerLayout(width = DEFAULT_TIMER_WIDTH): TimerLayout {
  const approxHeight = width * 0.72
  return {
    x: Math.max(12, (window.innerWidth - width) / 2),
    y: Math.max(72, (window.innerHeight - approxHeight) / 2 - 20),
    width,
  }
}

function clampLayout(layout: TimerLayout, clearMode = false): TimerLayout {
  const width = clamp(layout.width, MIN_TIMER_WIDTH, Math.min(MAX_TIMER_WIDTH, window.innerWidth - 24))
  const maxX = Math.max(12, window.innerWidth - width - 12)
  const minY = clearMode ? 16 : 64
  const maxY = Math.max(minY, window.innerHeight - (clearMode ? 80 : 120))
  return {
    width,
    x: clamp(layout.x, 12, maxX),
    y: clamp(layout.y, minY, maxY),
  }
}

export function FocusTimer() {
  const mode = useAppStore((s) => s.mode)
  const timerSettings = useAppStore((s) => s.timerSettings)
  const phase = useAppStore((s) => s.phase)
  const remainingMs = useAppStore((s) => s.remainingMs)
  const elapsedMs = useAppStore((s) => s.elapsedMs)
  const running = useAppStore((s) => s.running)
  const timerLayout = useAppStore((s) => s.timerLayout)
  const startTimer = useAppStore((s) => s.startTimer)
  const pauseTimer = useAppStore((s) => s.pauseTimer)
  const resetTimer = useAppStore((s) => s.resetTimer)
  const skipPhase = useAppStore((s) => s.skipPhase)
  const setTimerLayout = useAppStore((s) => s.setTimerLayout)
  const resetTimerLayout = useAppStore((s) => s.resetTimerLayout)
  const resetFocusSessions = useAppStore((s) => s.resetFocusSessions)
  const clearMode = useAppStore((s) => s.clearMode)
  const toggleClearMode = useAppStore((s) => s.toggleClearMode)
  const lockTimerPosition = useAppStore((s) => s.settings.lockTimerPosition)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const setMiniTimer = useAppStore((s) => s.setMiniTimer)
  const tasks = useAppStore((s) => s.tasks)
  const activeTaskId = useAppStore((s) => s.activeTaskId)
  const roomRole = useAppStore((s) => s.room.role)
  const topTask = tasks.find((t) => t.id === activeTaskId) ?? tasks.find((t) => !t.done)
  const guestLocked = roomRole === 'guest'

  const cardRef = useRef<HTMLElement>(null)
  const [local, setLocal] = useState<TimerLayout>(() => timerLayout ?? centerLayout())
  const [interacting, setInteracting] = useState<'drag' | 'resize' | null>(null)
  const [hovered, setHovered] = useState(false)
  const dragRef = useRef<{
    kind: 'drag' | 'resize'
    startX: number
    startY: number
    origin: TimerLayout
  } | null>(null)

  useLayoutEffect(() => {
    if (timerLayout) {
      setLocal(clampLayout(timerLayout, clearMode))
      return
    }
    setLocal(centerLayout())
  }, [timerLayout, clearMode])

  useEffect(() => {
    const onResize = () => {
      setLocal((prev) => {
        const next = clampLayout(prev, clearMode)
        setTimerLayout(next)
        return next
      })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [setTimerLayout, clearMode])

  const commitLayout = useCallback(
    (next: TimerLayout) => {
      const clamped = clampLayout(next, clearMode)
      setLocal(clamped)
      setTimerLayout(clamped)
    },
    [setTimerLayout, clearMode],
  )

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
      const drag = dragRef.current
      if (!drag) return
      event.preventDefault()

      if (drag.kind === 'drag') {
        commitLayout({
          ...drag.origin,
          x: drag.origin.x + (event.clientX - drag.startX),
          y: drag.origin.y + (event.clientY - drag.startY),
        })
        return
      }

      commitLayout({
        ...drag.origin,
        width: drag.origin.width + (event.clientX - drag.startX),
      })
    },
    [commitLayout],
  )

  const endInteraction = useCallback(() => {
    dragRef.current = null
    setInteracting(null)
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', endInteraction)
    window.removeEventListener('pointercancel', endInteraction)
  }, [onPointerMove])

  const beginInteraction = (kind: 'drag' | 'resize', event: React.PointerEvent) => {
    if (lockTimerPosition || event.button !== 0) return
    event.preventDefault()
    event.stopPropagation()
    dragRef.current = {
      kind,
      startX: event.clientX,
      startY: event.clientY,
      origin: local,
    }
    setInteracting(kind)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', endInteraction)
    window.addEventListener('pointercancel', endInteraction)
  }

  useEffect(() => () => endInteraction(), [endInteraction])

  const isStopwatch = timerSettings.mode === 'stopwatch'
  const displayMs = isStopwatch ? elapsedMs : remainingMs
  const scale = local.width / DEFAULT_TIMER_WIDTH
  const progress = phaseProgress(timerSettings, phase, remainingMs, elapsedMs)
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - progress)
  const compactChrome = running && !hovered && !interacting && !clearMode
  const breakTone = phase === 'shortBreak' || phase === 'longBreak' || mode === 'ambient'
  const timeLabel = formatTimer(displayMs / 1000)

  return (
    <section
      ref={cardRef}
      className={`timer-card floating ${interacting ? 'interacting' : ''} ${clearMode ? 'clear' : ''} ${lockTimerPosition ? 'locked' : ''} ${compactChrome ? 'compact' : ''} ${breakTone ? 'break-tone' : ''}`}
      aria-live="polite"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        left: local.x,
        top: local.y,
        width: local.width,
        ['--timer-scale' as string]: String(scale),
      }}
    >
      <div
        className="timer-drag-bar"
        onPointerDown={(e) => beginInteraction('drag', e)}
        title={lockTimerPosition ? 'Position locked' : 'Drag to move'}
      >
        <span className="drag-grip" aria-hidden>
          <GripVertical size={18} strokeWidth={2} />
        </span>
        <div className="session-tally-row">
          <SessionTally scale={scale} />
          {!guestLocked && (
            <button
              type="button"
              className="timer-reset-pos timer-chrome session-reset-btn"
              title="Clear session icons only — does not reset the timer"
              aria-label="Clear session icons only"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => resetFocusSessions()}
            >
              <ListRestart size={15} />
            </button>
          )}
        </div>
        <div className="timer-drag-actions timer-chrome">
          <button
            type="button"
            className="timer-reset-pos"
            title={lockTimerPosition ? 'Unlock position' : 'Lock position'}
            aria-label={lockTimerPosition ? 'Unlock timer position' : 'Lock timer position'}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => updateSettings({ lockTimerPosition: !lockTimerPosition })}
          >
            {lockTimerPosition ? <Lock size={15} /> : <LockOpen size={15} />}
          </button>
          <button
            type="button"
            className="timer-reset-pos"
            title="Picture-in-Picture timer"
            aria-label="Open picture-in-picture timer"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setMiniTimer(true)}
          >
            <PictureInPicture2 size={15} />
          </button>
          <button
            type="button"
            className="timer-reset-pos"
            title={clearMode ? 'Exit clear mode' : 'Enter clear mode'}
            aria-label={clearMode ? 'Exit clear mode' : 'Enter clear mode'}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => toggleClearMode()}
          >
            <Scan size={15} />
          </button>
          {!clearMode && (
            <button
              type="button"
              className="timer-reset-pos"
              title="Reset position & size"
              aria-label="Reset timer position and size"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => {
                resetTimerLayout()
                const centered = centerLayout()
                setLocal(centered)
                setTimerLayout(centered)
              }}
            >
              <RotateCcw size={15} />
            </button>
          )}
        </div>
      </div>

      <div className="timer-ring-wrap">
        <svg className="timer-ring" viewBox="0 0 120 120" aria-hidden>
          <circle className="timer-ring-track" cx="60" cy="60" r={radius} />
          <circle
            className="timer-ring-progress"
            cx="60"
            cy="60"
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="timer-digits time-display" aria-label={timeLabel}>
          {timeLabel}
        </div>
      </div>

      {topTask && (
        <div className="timer-task-progress text-scrim">
          <div className="timer-meta">{topTask.text}</div>
          {topTask.eta ? <TaskProgressBar task={topTask} compact /> : null}
        </div>
      )}
      {guestLocked && <div className="timer-meta text-scrim">Following room host</div>}

      <div className={`timer-controls ${running ? 'timer-chrome' : ''}`}>
        {!guestLocked && !running ? (
          <button className="btn primary" onClick={startTimer}>
            Start
          </button>
        ) : null}
        {!guestLocked && running ? (
          <button className="btn primary" onClick={pauseTimer}>
            Pause
          </button>
        ) : null}
        {!guestLocked && (!running || hovered || clearMode) && (
          <button className="btn" onClick={() => skipPhase()}>
            Skip
          </button>
        )}
        {!guestLocked && (!running || hovered || clearMode) && (
          <button
            className="btn"
            type="button"
            title="Reset the timer only — keeps session icons"
            aria-label="Reset timer only"
            onClick={resetTimer}
          >
            Reset timer
          </button>
        )}
      </div>

      {!lockTimerPosition && (
        <div className="timer-size-control timer-chrome">
          <button
            type="button"
            className="tiny size-btn"
            aria-label="Make timer smaller"
            onClick={() => commitLayout({ ...local, width: local.width - 40 })}
          >
            <Minimize2 size={14} />
          </button>
          <span>Size</span>
          <button
            type="button"
            className="tiny size-btn"
            aria-label="Make timer larger"
            onClick={() => commitLayout({ ...local, width: local.width + 40 })}
          >
            <Maximize2 size={14} />
          </button>
        </div>
      )}

      {!lockTimerPosition && (
        <button
          type="button"
          className="timer-resize-handle timer-chrome"
          aria-label="Resize timer"
          title="Drag to resize"
          onPointerDown={(e) => beginInteraction('resize', e)}
        />
      )}
    </section>
  )
}
