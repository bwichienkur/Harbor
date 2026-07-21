import { useState } from 'react'
import { siteFontPresets } from '../../data/fonts'
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
            label="Show clock on Focus / Break"
            on={settings.showClockOnFocus}
            onToggle={() => updateSettings({ showClockOnFocus: !settings.showClockOnFocus })}
          />
          <Toggle
            label="Show Add Task on home"
            on={settings.showTasks}
            onToggle={() => updateSettings({ showTasks: !settings.showTasks })}
          />
          <Toggle
            label="Show task list on Focus / Break"
            on={settings.showTasksOnFocus}
            onToggle={() => updateSettings({ showTasksOnFocus: !settings.showTasksOnFocus })}
          />
          <Toggle
            label="Show notepad in tools"
            on={settings.showNotepad}
            onToggle={() => updateSettings({ showNotepad: !settings.showNotepad })}
          />
          <div className="field">
            <label htmlFor="site-font">Site font</label>
            <select
              id="site-font"
              value={settings.siteFont}
              onChange={(e) => updateSettings({ siteFont: e.target.value })}
            >
              {siteFontPresets.map((font) => (
                <option key={font.id} value={font.id}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>
          {settings.siteFont === 'custom' && (
            <div className="field">
              <label htmlFor="custom-font">Custom font family</label>
              <input
                id="custom-font"
                value={settings.customFont}
                onChange={(e) => updateSettings({ customFont: e.target.value })}
                placeholder="e.g. Playfair Display, JetBrains Mono, Comic Neue"
              />
              <p className="helper">
                Type any Google Fonts family name (or a system font). Harbor loads it for the whole
                app.
              </p>
              {settings.customFont.trim() && (
                <p className="font-preview" style={{ fontFamily: `"${settings.customFont.trim()}"` }}>
                  The quick brown fox jumps over the lazy dog · 25:00
                </p>
              )}
            </div>
          )}
          {settings.siteFont !== 'custom' && (
            <p
              className="font-preview"
              style={{ fontFamily: `"${settings.siteFont}", system-ui, sans-serif` }}
            >
              Preview · Harbor Focus · 25:00
            </p>
          )}
          <div className="field">
            <label htmlFor="session-icon">Session tally icon</label>
            <select
              id="session-icon"
              value={settings.sessionIconShape}
              onChange={(e) =>
                updateSettings({
                  sessionIconShape: e.target.value as typeof settings.sessionIconShape,
                })
              }
            >
              <option value="heart">Hearts</option>
              <option value="star">Stars</option>
              <option value="circle">Circles</option>
              <option value="flame">Flames</option>
              <option value="check">Checks</option>
            </select>
          </div>
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
            label="Keep screen awake while timer runs"
            on={settings.keepAwakeWhileRunning}
            onToggle={() =>
              updateSettings({ keepAwakeWhileRunning: !settings.keepAwakeWhileRunning })
            }
          />
          <p className="helper">
            Uses the browser Wake Lock API so the display stays on during a session. Some browsers
            or OS power settings may still sleep the machine.
          </p>
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
            Space start/pause · F fullscreen · C clear · M picture-in-picture · 1/2/3 modes · Esc
            close · ? settings
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
          <SliderField
            label="Focus minutes"
            value={timerSettings.pomodoroMins}
            min={1}
            max={120}
            onChange={(v) => {
              updateTimerSettings({ pomodoroMins: v })
              resetTimer()
            }}
          />
          <SliderField
            label="Short break minutes"
            value={timerSettings.shortBreakMins}
            min={1}
            max={60}
            onChange={(v) => updateTimerSettings({ shortBreakMins: v })}
          />
          <SliderField
            label="Long break / watch minutes"
            value={timerSettings.longBreakMins}
            min={1}
            max={120}
            onChange={(v) => updateTimerSettings({ longBreakMins: v })}
          />
          <SliderField
            label="Countdown minutes"
            value={timerSettings.countdownMins}
            min={1}
            max={180}
            onChange={(v) => {
              updateTimerSettings({ countdownMins: v })
              resetTimer()
            }}
          />
          <SliderField
            label="Long break every N sessions"
            value={timerSettings.longBreakEvery}
            min={1}
            max={12}
            unit="sessions"
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

function SliderField({
  label,
  value,
  onChange,
  min = 1,
  max = 180,
  step = 1,
  unit = 'min',
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  unit?: 'min' | 'sessions'
}) {
  const display =
    unit === 'sessions' ? `${value} session${value === 1 ? '' : 's'}` : `${value}m`

  return (
    <div className="field duration-field">
      <div className="duration-label-row">
        <label>{label}</label>
        <strong>{display}</strong>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value) || min)}
      />
    </div>
  )
}
