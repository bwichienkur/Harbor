import { GripVertical, RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { formatClock } from '../lib/format'
import { useNow } from '../hooks/useNow'
import {
  DEFAULT_CLOCK_WIDTH,
  MAX_CLOCK_WIDTH,
  MIN_CLOCK_WIDTH,
  useAppStore,
} from '../store/useAppStore'
import type { TimerLayout } from '../types'

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function defaultLayout(width = DEFAULT_CLOCK_WIDTH): TimerLayout {
  const w = Math.min(width, window.innerWidth - 24)
  return {
    x: Math.max(12, window.innerWidth - w - 20),
    y: 80,
    width: w,
  }
}

function clampLayout(layout: TimerLayout, clearMode = false): TimerLayout {
  const width = clamp(layout.width, MIN_CLOCK_WIDTH, Math.min(MAX_CLOCK_WIDTH, window.innerWidth - 24))
  const maxX = Math.max(12, window.innerWidth - width - 12)
  const minY = clearMode ? 16 : 64
  const maxY = Math.max(minY, window.innerHeight - 80)
  return {
    width,
    x: clamp(layout.x, 12, maxX),
    y: clamp(layout.y, minY, maxY),
  }
}

export function FocusClock() {
  const now = useNow(1000)
  const mode = useAppStore((s) => s.mode)
  const clearMode = useAppStore((s) => s.clearMode)
  const show = useAppStore((s) => s.settings.showClockOnFocus)
  const clockLayout = useAppStore((s) => s.clockLayout)
  const setClockLayout = useAppStore((s) => s.setClockLayout)
  const resetClockLayout = useAppStore((s) => s.resetClockLayout)

  const [local, setLocal] = useState<TimerLayout>(() => clockLayout ?? defaultLayout())
  const [interacting, setInteracting] = useState<'drag' | 'resize' | null>(null)
  const dragRef = useRef<{
    kind: 'drag' | 'resize'
    startX: number
    startY: number
    origin: TimerLayout
  } | null>(null)

  useLayoutEffect(() => {
    if (clockLayout) {
      setLocal(clampLayout(clockLayout, clearMode))
      return
    }
    setLocal(defaultLayout())
  }, [clockLayout, clearMode])

  useEffect(() => {
    const onResize = () => {
      setLocal((prev) => {
        const next = clampLayout(prev, clearMode)
        setClockLayout(next)
        return next
      })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [setClockLayout, clearMode])

  const commitLayout = useCallback(
    (next: TimerLayout) => {
      const clamped = clampLayout(next, clearMode)
      setLocal(clamped)
      setClockLayout(clamped)
    },
    [setClockLayout, clearMode],
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
    if (event.button !== 0) return
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

  if (!show || mode === 'home') return null

  const scale = local.width / DEFAULT_CLOCK_WIDTH
  const timeLabel = formatClock(now)

  return (
    <aside
      className={`focus-clock ${interacting ? 'interacting' : ''} ${clearMode ? 'clear' : ''}`}
      aria-label="Current time"
      style={{
        left: local.x,
        top: local.y,
        width: local.width,
        ['--clock-scale' as string]: String(scale),
      }}
    >
      <div
        className="focus-clock-drag"
        onPointerDown={(e) => beginInteraction('drag', e)}
        title="Drag to move"
      >
        <span className="drag-grip" aria-hidden>
          <GripVertical size={Math.round(16 * scale)} strokeWidth={2} />
        </span>
        <button
          type="button"
          className="tiny focus-clock-reset"
          title="Reset position & size"
          aria-label="Reset clock position and size"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => {
            resetClockLayout()
            const next = defaultLayout()
            setLocal(next)
            setClockLayout(next)
          }}
        >
          <RotateCcw size={Math.round(14 * scale)} />
        </button>
      </div>
      <div className="focus-clock-time time-display text-scrim" aria-live="polite">
        {timeLabel}
      </div>
      <button
        type="button"
        className="focus-clock-resize"
        aria-label="Resize clock"
        title="Drag to resize"
        onPointerDown={(e) => beginInteraction('resize', e)}
      />
    </aside>
  )
}
