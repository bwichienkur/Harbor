import { useState } from 'react'
import { playChime } from '../../lib/audio'
import { requestNotificationPermission } from '../../lib/notifications'
import { downloadText } from '../../lib/stats'
import { useAppStore } from '../../store/useAppStore'
import type { AlertSoundId, HarborBackup, TimerMode } from '../../types'

const modes: { id: TimerMode; label: string }[] = [
  { id: 'pomodoro', label: 'Pomodoro' },
  { id: 'animedoro', label: 'Animedoro' },
  { id: 'countdown', label: 'Countdown' },
  { id: 'stopwatch', label: 'Stopwatch' },
  { id: 'fiftyTwo', label: '52 / 17' },
]

const alerts: { id: AlertSoundId; label: string }[] = [
  { id: 'chime', label: 'Chime' },
  { id: 'bell', label: 'Bell' },
  { id: 'soft', label: 'Soft' },
  { id: 'bright', label: 'Bright' },
  { id: 'wood', label: 'Wood' },
]

type Tab = 'general' | 'timer' | 'alerts' | 'backup'

export function SettingsPanel() {
  const settings = useAppStore((s) => s.settings)
  const timerSettings = useAppStore((s) => s.timerSettings)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const updateTimerSettings = useAppStore((s) => s.updateTimerSettings)
  const resetTimer = useAppStore((s) => s.resetTimer)
  const exportBackup = useAppStore((s) => s.exportBackup)
  const importBackup = useAppStore((s) => s.importBackup)
  const [tab, setTab] = useState<Tab>('general')

  return (
    <div className="panel-section">
      <div className="settings-tabs" role="tablist" aria-label="Settings sections">
        {(
          [
            ['general', 'General'],
            ['timer', 'Timer'],
            ['alerts', 'Alerts'],
            ['backup', 'Backup'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            className={`chip ${tab === id ? 'active' : ''}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'general' && (
        <>
          <div className="field">
            <label htmlFor="name">Your name</label>
            <input
              id="name"
              value={settings.name}
              onChange={(e) => updateSettings({ name: e.target.value })}
              placeholder="How should Harbor greet you?"
            />
          </div>
          <Toggle
            label="Show clock on home"
            on={settings.showClock}
            onToggle={() => updateSettings({ showClock: !settings.showClock })}
          />
          <Toggle
            label="Show Add Task on home"
            on={settings.showTasks}
            onToggle={() => updateSettings({ showTasks: !settings.showTasks })}
          />
          <Toggle
            label="Show notepad in tools"
            on={settings.showNotepad}
            onToggle={() => updateSettings({ showNotepad: !settings.showNotepad })}
          />
          <Toggle
            label="Soft clear chrome while focusing"
            on={settings.softClearFocus}
            onToggle={() => updateSettings({ softClearFocus: !settings.softClearFocus })}
          />
          <Toggle
            label="Auto clear mode on Start"
            on={settings.autoClearOnStart}
            onToggle={() => updateSettings({ autoClearOnStart: !settings.autoClearOnStart })}
          />
          <Toggle
            label="Lock timer position"
            on={settings.lockTimerPosition}
            onToggle={() => updateSettings({ lockTimerPosition: !settings.lockTimerPosition })}
          />
          <Toggle
            label="Complete active task when focus ends"
            on={settings.completeTaskOnFocusEnd}
            onToggle={() =>
              updateSettings({ completeTaskOnFocusEnd: !settings.completeTaskOnFocusEnd })
            }
          />
          <Toggle
            label="Auto-boost overlay on bright themes"
            on={settings.autoOverlay}
            onToggle={() => updateSettings({ autoOverlay: !settings.autoOverlay })}
          />
          <Toggle
            label="High contrast UI"
            on={settings.highContrast}
            onToggle={() => updateSettings({ highContrast: !settings.highContrast })}
          />
          <h3 className="panel-subhead">Shortcuts</h3>
          <p className="helper">
            Space start/pause · F fullscreen · C clear · M mini · 1/2/3 modes · Esc close · ?
            settings
          </p>
          <button
            className="btn"
            type="button"
            onClick={() => updateSettings({ onboardingComplete: false })}
          >
            Show welcome again
          </button>
        </>
      )}

      {tab === 'timer' && (
        <>
          <div className="field">
            <label htmlFor="timer-mode">Timer mode</label>
            <select
              id="timer-mode"
              value={timerSettings.mode}
              onChange={(e) => {
                updateTimerSettings({ mode: e.target.value as TimerMode })
                resetTimer()
              }}
            >
              {modes.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <NumberField
            label="Focus minutes"
            value={timerSettings.pomodoroMins}
            onChange={(v) => {
              updateTimerSettings({ pomodoroMins: v })
              resetTimer()
            }}
          />
          <NumberField
            label="Short break minutes"
            value={timerSettings.shortBreakMins}
            onChange={(v) => updateTimerSettings({ shortBreakMins: v })}
          />
          <NumberField
            label="Long break / watch minutes"
            value={timerSettings.longBreakMins}
            onChange={(v) => updateTimerSettings({ longBreakMins: v })}
          />
          <NumberField
            label="Countdown minutes"
            value={timerSettings.countdownMins}
            onChange={(v) => {
              updateTimerSettings({ countdownMins: v })
              resetTimer()
            }}
          />
          <NumberField
            label="Long break every N sessions"
            value={timerSettings.longBreakEvery}
            onChange={(v) => updateTimerSettings({ longBreakEvery: Math.max(1, v) })}
          />
          <Toggle
            label="Auto-start breaks"
            on={timerSettings.autoStartBreaks}
            onToggle={() =>
              updateTimerSettings({ autoStartBreaks: !timerSettings.autoStartBreaks })
            }
          />
          <Toggle
            label="Auto-start focus"
            on={timerSettings.autoStartFocus}
            onToggle={() =>
              updateTimerSettings({ autoStartFocus: !timerSettings.autoStartFocus })
            }
          />
        </>
      )}

      {tab === 'alerts' && (
        <>
          <Toggle
            label="Alert sound on phase change"
            on={settings.alertSound}
            onToggle={() => updateSettings({ alertSound: !settings.alertSound })}
          />
          <div className="field">
            <label htmlFor="alert-sound">Alert sound</label>
            <select
              id="alert-sound"
              value={settings.alertSoundId}
              onChange={(e) => {
                const id = e.target.value as AlertSoundId
                updateSettings({ alertSoundId: id })
                playChime(id)
              }}
            >
              {alerts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
          <Toggle
            label="Desktop notifications"
            on={settings.desktopNotifications}
            onToggle={async () => {
              if (!settings.desktopNotifications) {
                const permission = await requestNotificationPermission()
                updateSettings({ desktopNotifications: permission === 'granted' })
                return
              }
              updateSettings({ desktopNotifications: false })
            }}
          />
          <p className="helper">
            Notifications fire when Harbor is in the background. Timers stay accurate even if the
            tab is hidden.
          </p>
        </>
      )}

      {tab === 'backup' && (
        <>
          <p className="helper">
            Export a backup JSON to sync to another device, then import it there. Full cloud
            accounts need a hosted backend — backups are the portable sync layer.
          </p>
          <div className="timer-controls">
            <button
              className="btn primary"
              type="button"
              onClick={() => {
                const backup = exportBackup()
                downloadText(
                  `harbor-backup-${new Date().toISOString().slice(0, 10)}.json`,
                  JSON.stringify(backup, null, 2),
                  'application/json',
                )
              }}
            >
              Export backup
            </button>
            <label className="btn" style={{ display: 'inline-grid', placeItems: 'center' }}>
              Import backup
              <input
                type="file"
                accept="application/json,.json"
                hidden
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  try {
                    const text = await file.text()
                    const data = JSON.parse(text) as HarborBackup
                    importBackup(data)
                  } catch {
                    alert('Could not import that backup file.')
                  }
                }}
              />
            </label>
          </div>
        </>
      )}
    </div>
  )
}

function Toggle({
  label,
  on,
  onToggle,
}: {
  label: string
  on: boolean
  onToggle: () => void
}) {
  return (
    <div className="toggle-row">
      <span>{label}</span>
      <button
        type="button"
        className={`switch ${on ? 'on' : ''}`}
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={onToggle}
      />
    </div>
  )
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <input
        type="number"
        min={1}
        max={180}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 1)}
      />
    </div>
  )
}
