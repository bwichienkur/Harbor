import { ChevronDown, ChevronUp } from 'lucide-react'
import { useMemo, useState } from 'react'
import { etaToMinutes, formatDuration } from '../../lib/format'
import { plannedMinutes } from '../../lib/stats'
import type { TaskColor, TaskEta, TaskRecurrence } from '../../types'
import { useAppStore } from '../../store/useAppStore'

const etas: TaskEta[] = ['5m', '10m', '15m', '30m', '45m', '1h', '2h', '3h', '4h']
const colors: TaskColor[] = ['sage', 'sand', 'coral', 'sky', 'lilac', 'slate']
const recurrences: { id: TaskRecurrence; label: string }[] = [
  { id: 'none', label: 'Once' },
  { id: 'daily', label: 'Daily' },
  { id: 'weekdays', label: 'Weekdays' },
  { id: 'weekly', label: 'Weekly' },
]

export function TasksPanel() {
  const tasks = useAppStore((s) => s.tasks)
  const addTask = useAppStore((s) => s.addTask)
  const toggleTask = useAppStore((s) => s.toggleTask)
  const removeTask = useAppStore((s) => s.removeTask)
  const reorderTask = useAppStore((s) => s.reorderTask)
  const clearDoneTasks = useAppStore((s) => s.clearDoneTasks)
  const activeTaskId = useAppStore((s) => s.activeTaskId)
  const setActiveTask = useAppStore((s) => s.setActiveTask)

  const [text, setText] = useState('')
  const [selectedEta, setSelectedEta] = useState<TaskEta>('30m')
  const [color, setColor] = useState<TaskColor>('sage')
  const [tags, setTags] = useState('')
  const [recurrence, setRecurrence] = useState<TaskRecurrence>('none')
  const [advanced, setAdvanced] = useState(false)

  const remaining = tasks.filter((t) => !t.done)
  const done = tasks.filter((t) => t.done)
  const totalMins = plannedMinutes(remaining)

  const dayPlan = useMemo(() => {
    let cursor = 0
    return remaining.map((task) => {
      const mins = etaToMinutes(task.eta) || 25
      const start = cursor
      cursor += mins
      return { task, start, end: cursor }
    })
  }, [remaining])

  return (
    <div className="panel-section">
      <p className="helper">
        {remaining.length} remaining
        {totalMins > 0 ? ` · ~${totalMins} mins planned` : ''}
      </p>

      <form
        className="panel-section"
        onSubmit={(e) => {
          e.preventDefault()
          addTask(text, {
            eta: selectedEta,
            color,
            tags: tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean),
            recurrence,
          })
          setText('')
          setTags('')
        }}
      >
        <div className="field">
          <label htmlFor="task-input">What do you want to focus on?</label>
          <input
            id="task-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ship the landing page…"
          />
        </div>
        <div className="eta-row">
          {etas.map((option) => (
            <button
              key={option}
              type="button"
              className={`chip ${selectedEta === option ? 'active' : ''}`}
              onClick={() => setSelectedEta(option)}
            >
              {option}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="advanced-toggle"
          onClick={() => setAdvanced((v) => !v)}
          aria-expanded={advanced}
        >
          {advanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          Advanced · color, tags, repeat
        </button>

        {advanced && (
          <div className="advanced-block">
            <div className="eta-row" aria-label="Color">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`color-dot ${c} ${color === c ? 'active' : ''}`}
                  aria-label={c}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
            <div className="field">
              <label htmlFor="tags">Tags (comma separated)</label>
              <input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="deep-work, school"
              />
            </div>
            <div className="field">
              <label htmlFor="recurrence">Repeat</label>
              <select
                id="recurrence"
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as TaskRecurrence)}
              >
                {recurrences.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <button className="btn primary" type="submit">
          + Add Task
        </button>
      </form>

      {dayPlan.length > 0 && (
        <div className="panel-section">
          <h3 className="panel-subhead">Today’s plan</h3>
          <p className="helper">From ETAs · {formatDuration(totalMins * 60_000)} total</p>
          <div className="day-plan">
            {dayPlan.map(({ task, start, end }) => (
              <div key={task.id} className={`plan-row color-${task.color}`}>
                <span>
                  {start}–{end}m
                </span>
                <strong>{task.text}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="task-list">
        {remaining.map((task) => (
          <div
            key={task.id}
            className={`task-item color-${task.color} ${activeTaskId === task.id ? 'active-task' : ''}`}
          >
            <button className="tiny" aria-label="Complete" onClick={() => toggleTask(task.id)}>
              ○
            </button>
            <div>
              <div className="task-text">{task.text}</div>
              <small className="helper">
                {[task.eta, task.recurrence !== 'none' ? task.recurrence : null, ...(task.tags ?? [])]
                  .filter(Boolean)
                  .join(' · ')}
              </small>
            </div>
            <div className="task-actions">
              <button
                className="tiny"
                aria-label="Set as active focus task"
                title="Focus this task"
                onClick={() => setActiveTask(task.id)}
              >
                ◎
              </button>
              <button className="tiny" aria-label="Move up" onClick={() => reorderTask(task.id, 'up')}>
                ↑
              </button>
              <button
                className="tiny"
                aria-label="Move down"
                onClick={() => reorderTask(task.id, 'down')}
              >
                ↓
              </button>
              <button className="tiny" aria-label="Delete" onClick={() => removeTask(task.id)}>
                ×
              </button>
            </div>
          </div>
        ))}
        {remaining.length === 0 && (
          <p className="helper">You’re clear. Add one priority task above to shape the day.</p>
        )}
      </div>

      {done.length > 0 && (
        <>
          <h3 className="panel-subhead">Done</h3>
          <div className="task-list">
            {done.map((task) => (
              <div key={task.id} className="task-item done">
                <button className="tiny" aria-label="Undo" onClick={() => toggleTask(task.id)}>
                  ✓
                </button>
                <div className="task-text">{task.text}</div>
                <button className="tiny" aria-label="Delete" onClick={() => removeTask(task.id)}>
                  ×
                </button>
              </div>
            ))}
          </div>
          <button className="btn" onClick={clearDoneTasks}>
            Clear completed
          </button>
        </>
      )}
    </div>
  )
}
