import { CheckSquare, GripVertical, Plus, RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { formatEtaMinutes } from '../lib/format'
import {
  DEFAULT_TASK_DOCK_HEIGHT,
  DEFAULT_TASK_DOCK_WIDTH,
  MAX_TASK_DOCK_HEIGHT,
  MAX_TASK_DOCK_WIDTH,
  MIN_TASK_DOCK_HEIGHT,
  MIN_TASK_DOCK_WIDTH,
  useAppStore,
} from '../store/useAppStore'
import type { TaskDockLayout } from '../types'

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function defaultLayout(): TaskDockLayout {
  const width = Math.min(DEFAULT_TASK_DOCK_WIDTH, window.innerWidth - 24)
  const height = DEFAULT_TASK_DOCK_HEIGHT
  return {
    x: 16,
    y: Math.max(72, window.innerHeight - height - 88),
    width,
    height,
  }
}

function clampLayout(layout: TaskDockLayout): TaskDockLayout {
  const width = clamp(
    layout.width,
    MIN_TASK_DOCK_WIDTH,
    Math.min(MAX_TASK_DOCK_WIDTH, window.innerWidth - 24),
  )
  const height = clamp(
    layout.height,
    MIN_TASK_DOCK_HEIGHT,
    Math.min(MAX_TASK_DOCK_HEIGHT, window.innerHeight - 100),
  )
  const maxX = Math.max(12, window.innerWidth - width - 12)
  const maxY = Math.max(64, window.innerHeight - height - 64)
  return {
    width,
    height,
    x: clamp(layout.x, 12, maxX),
    y: clamp(layout.y, 64, maxY),
  }
}

export function FocusTaskDock() {
  const mode = useAppStore((s) => s.mode)
  const clearMode = useAppStore((s) => s.clearMode)
  const show = useAppStore((s) => s.settings.showTasksOnFocus)
  const tasks = useAppStore((s) => s.tasks)
  const activeTaskId = useAppStore((s) => s.activeTaskId)
  const setActiveTask = useAppStore((s) => s.setActiveTask)
  const toggleTask = useAppStore((s) => s.toggleTask)
  const setPanel = useAppStore((s) => s.setPanel)
  const taskDockLayout = useAppStore((s) => s.taskDockLayout)
  const setTaskDockLayout = useAppStore((s) => s.setTaskDockLayout)
  const resetTaskDockLayout = useAppStore((s) => s.resetTaskDockLayout)

  const [local, setLocal] = useState<TaskDockLayout>(() => taskDockLayout ?? defaultLayout())
  const [interacting, setInteracting] = useState<'drag' | 'resize' | null>(null)
  const dragRef = useRef<{
    kind: 'drag' | 'resize'
    startX: number
    startY: number
    origin: TaskDockLayout
  } | null>(null)

  useLayoutEffect(() => {
    if (taskDockLayout) {
      setLocal(clampLayout(taskDockLayout))
      return
    }
    const next = defaultLayout()
    setLocal(next)
    setTaskDockLayout(next)
  }, [taskDockLayout, setTaskDockLayout])

  useEffect(() => {
    const onResize = () => {
      setLocal((prev) => {
        const next = clampLayout(prev)
        setTaskDockLayout(next)
        return next
      })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [setTaskDockLayout])

  const commitLayout = useCallback(
    (next: TaskDockLayout) => {
      const clamped = clampLayout(next)
      setLocal(clamped)
      setTaskDockLayout(clamped)
    },
    [setTaskDockLayout],
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
        height: drag.origin.height + (event.clientY - drag.startY),
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

  if (!show || clearMode || mode === 'home') return null

  const open = tasks.filter((t) => !t.done).slice(0, 6)

  return (
    <aside
      className={`focus-task-dock ${interacting ? 'interacting' : ''}`}
      aria-label="Focus tasks"
      style={{
        left: local.x,
        top: local.y,
        width: local.width,
        height: local.height,
      }}
    >
      <div
        className="focus-task-dock-head"
        onPointerDown={(e) => beginInteraction('drag', e)}
        title="Drag to move"
      >
        <strong>
          <GripVertical size={14} aria-hidden />
          <CheckSquare size={14} aria-hidden /> Tasks
        </strong>
        <div className="focus-task-dock-actions">
          <button
            type="button"
            className="tiny"
            title="Reset position & size"
            aria-label="Reset task widget position and size"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => {
              resetTaskDockLayout()
              const next = defaultLayout()
              setLocal(next)
              setTaskDockLayout(next)
            }}
          >
            <RotateCcw size={14} />
          </button>
          <button
            type="button"
            className="tiny"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setPanel('tasks')}
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </div>
      <div className="focus-task-dock-body">
        {open.length === 0 ? (
          <p className="helper">No open tasks — add one to stay oriented.</p>
        ) : (
          <ul className="focus-task-list">
            {open.map((task) => (
              <li key={task.id} className={task.id === activeTaskId ? 'active' : ''}>
                <button
                  type="button"
                  className="focus-task-check"
                  aria-label={task.done ? 'Mark incomplete' : 'Complete task'}
                  onClick={() => toggleTask(task.id)}
                />
                <button
                  type="button"
                  className="focus-task-main"
                  onClick={() => setActiveTask(task.id)}
                >
                  <span>{task.text}</span>
                  {task.eta ? <small>{formatEtaMinutes(task.eta)}</small> : null}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        type="button"
        className="focus-task-resize-handle"
        aria-label="Resize task widget"
        title="Drag to resize"
        onPointerDown={(e) => beginInteraction('resize', e)}
      />
    </aside>
  )
}
