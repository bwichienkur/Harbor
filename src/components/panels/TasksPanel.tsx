import { ChevronDown, ChevronUp } from 'lucide-react'
import { useMemo, useState } from 'react'
import { clampEtaMinutes, etaToMinutes, formatDuration, formatEtaMinutes } from '../../lib/format'
import { plannedMinutes } from '../../lib/stats'
import type { TaskColor, TaskRecurrence } from '../../types'
import { useAppStore } from '../../store/useAppStore'
import { SelectMenu } from '../SelectMenu'

const colors: TaskColor[] = ['sage', 'sand', 'coral', 'sky', 'lilac', 'slate']
const recurrences: { id: TaskRecurrence; label: string }[] = [
  { id: 'none', label: 'Once' },
  { id: 'daily', label: 'Daily' },
  { id: 'weekdays', label: 'Weekdays' },
  { id: 'weekly', label: 'Weekly' },
]
const quickMins = [15, 25, 45, 60, 90]

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
  const [etaMins, setEtaMins] = useState(25)
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
            eta: clampEtaMinutes(etaMins),
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

        <div className="field duration-field">
          <div className="duration-label-row">
            <label htmlFor="task-duration">Estimated time</label>
            <strong>{formatEtaMinutes(etaMins)}</strong>
          </div>
          <input
            id="task-duration"
            type="range"
            min={5}
            max={240}
            step={5}
            value={etaMins}
            onChange={(e) => setEtaMins(Number(e.target.value))}
          />
          <div className="eta-row duration-quicks">
            {quickMins.map((mins) => (
              <button
                key={mins}
                type="button"
                className={`chip ${etaMins === mins ? 'active' : ''}`}
                onClick={() => setEtaMins(mins)}
              >
                {mins < 60 ? `${mins}m` : `${mins / 60}h`}
              </button>
            ))}
          </div>
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
              <SelectMenu
                id="recurrence"
                value={recurrence}
                onChange={(value) => setRecurrence(value)}
                options={recurrences.map((r) => ({ value: r.id, label: r.label }))}
              />
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

      <div className="panel-section">
        <h3 className="panel-subhead">Open</h3>
        <div className="task-list">
          {remaining.map((task, index) => (
            <div key={task.id} className={`task-row color-${task.color}`}>
              <button
                type="button"
                className="task-check"
                aria-label="Complete"
                onClick={() => toggleTask(task.id)}
              />
              <button
                type="button"
                className={`task-main ${activeTaskId === task.id ? 'active' : ''}`}
                onClick={() => setActiveTask(task.id)}
              >
                <span>{task.text}</span>
                <small>
                  {task.eta ? formatEtaMinutes(task.eta) : 'No ETA'}
                  {task.tags.length ? ` · ${task.tags.join(', ')}` : ''}
                </small>
              </button>
              <div className="task-move">
                <button
                  type="button"
                  className="tiny"
                  disabled={index === 0}
                  onClick={() => reorderTask(task.id, 'up')}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="tiny"
                  disabled={index === remaining.length - 1}
                  onClick={() => reorderTask(task.id, 'down')}
                >
                  ↓
                </button>
                <button type="button" className="tiny" onClick={() => removeTask(task.id)}>
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {done.length > 0 && (
        <div className="panel-section">
          <div className="duration-label-row">
            <h3 className="panel-subhead">Done</h3>
            <button type="button" className="tiny" onClick={clearDoneTasks}>
              Clear
            </button>
          </div>
          <div className="task-list done">
            {done.map((task) => (
              <div key={task.id} className={`task-row color-${task.color}`}>
                <button
                  type="button"
                  className="task-check checked"
                  aria-label="Undo"
                  onClick={() => toggleTask(task.id)}
                />
                <div className="task-main">
                  <span>{task.text}</span>
                </div>
                <button type="button" className="tiny" onClick={() => removeTask(task.id)}>
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
