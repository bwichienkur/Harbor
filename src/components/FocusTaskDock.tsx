import { CheckSquare, Plus } from 'lucide-react'
import { formatEtaMinutes } from '../lib/format'
import { useAppStore } from '../store/useAppStore'

export function FocusTaskDock() {
  const mode = useAppStore((s) => s.mode)
  const clearMode = useAppStore((s) => s.clearMode)
  const show = useAppStore((s) => s.settings.showTasksOnFocus)
  const tasks = useAppStore((s) => s.tasks)
  const activeTaskId = useAppStore((s) => s.activeTaskId)
  const setActiveTask = useAppStore((s) => s.setActiveTask)
  const toggleTask = useAppStore((s) => s.toggleTask)
  const setPanel = useAppStore((s) => s.setPanel)

  if (!show || clearMode || mode === 'home') return null

  const open = tasks.filter((t) => !t.done).slice(0, 6)

  return (
    <aside className="focus-task-dock" aria-label="Focus tasks">
      <div className="focus-task-dock-head">
        <strong>
          <CheckSquare size={14} aria-hidden /> Tasks
        </strong>
        <button type="button" className="tiny" onClick={() => setPanel('tasks')}>
          <Plus size={14} /> Add
        </button>
      </div>
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
    </aside>
  )
}
