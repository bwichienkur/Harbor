import { formatDuration } from '../../lib/format'
import {
  bestFocusDay,
  downloadText,
  focusMsSince,
  focusStreak,
  sessionsToCsv,
  weekBars,
} from '../../lib/stats'
import { useAppStore } from '../../store/useAppStore'

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x.getTime()
}

export function StatsPanel() {
  const sessions = useAppStore((s) => s.sessions)
  const completedFocusCount = useAppStore((s) => s.completedFocusCount)
  const now = new Date()
  const todayStart = startOfDay(now)
  const weekStart = todayStart - 6 * 86_400_000
  const monthStart = todayStart - 29 * 86_400_000

  const todayMs = focusMsSince(sessions, todayStart)
  const weekMs = focusMsSince(sessions, weekStart)
  const monthMs = focusMsSince(sessions, monthStart)
  const streak = focusStreak(sessions, now)
  const best = bestFocusDay(sessions)
  const days = weekBars(sessions, now)
  const max = Math.max(...days.map((d) => d.ms), 1)

  return (
    <div className="panel-section">
      <p className="helper">Track focus streaks, best days, and export your history.</p>
      <div className="stats-grid">
        <div className="stat-card">
          <strong>{formatDuration(todayMs)}</strong>
          <span>Today</span>
        </div>
        <div className="stat-card">
          <strong>{formatDuration(weekMs)}</strong>
          <span>7 days</span>
        </div>
        <div className="stat-card">
          <strong>{formatDuration(monthMs)}</strong>
          <span>30 days</span>
        </div>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <strong>{streak}</strong>
          <span>Day streak</span>
        </div>
        <div className="stat-card">
          <strong>{completedFocusCount}</strong>
          <span>Sessions</span>
        </div>
        <div className="stat-card">
          <strong>{best.ms ? formatDuration(best.ms) : '—'}</strong>
          <span>Best day{best.date ? ` · ${best.date.slice(5)}` : ''}</span>
        </div>
      </div>
      <div>
        <h3 style={{ margin: '0 0 0.6rem', fontFamily: 'var(--font-display)' }}>This week</h3>
        <div className="bar-chart">
          {days.map((day) => (
            <div key={day.label} className="bar-col">
              <div className="bar" style={{ height: `${Math.max(6, (day.ms / max) * 100)}px` }} />
              <small>{day.label}</small>
            </div>
          ))}
        </div>
      </div>
      <button
        className="btn"
        onClick={() =>
          downloadText(
            `harbor-sessions-${new Date().toISOString().slice(0, 10)}.csv`,
            sessionsToCsv(sessions),
            'text/csv',
          )
        }
      >
        Export sessions CSV
      </button>
    </div>
  )
}
