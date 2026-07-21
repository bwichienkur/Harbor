import { useMemo, useState } from 'react'
import { fontStackFor, siteFontPresets } from '../../data/fonts'
import { allLayoutTemplates } from '../../data/layoutTemplates'
import { playChime } from '../../lib/audio'
import { requestNotificationPermission } from '../../lib/notifications'
import { downloadText } from '../../lib/stats'
import { useAppStore } from '../../store/useAppStore'
import type { AlertSoundId, HarborBackup, SessionIconShape, TimerMode } from '../../types'
import { SelectMenu } from '../SelectMenu'

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

type Tab = 'general' | 'layout' | 'timer' | 'alerts' | 'backup'

export function SettingsPanel() {
  const settings = useAppStore((s) => s.settings)
  const timerSettings = useAppStore((s) => s.timerSettings)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const updateTimerSettings = useAppStore((s) => s.updateTimerSettings)
  const resetTimer = useAppStore((s) => s.resetTimer)
  const exportBackup = useAppStore((s) => s.exportBackup)
  const importBackup = useAppStore((s) => s.importBackup)
  const activeLayoutTemplateId = useAppStore((s) => s.activeLayoutTemplateId)
  const customLayoutTemplates = useAppStore((s) => s.customLayoutTemplates)
  const applyLayoutTemplate = useAppStore((s) => s.applyLayoutTemplate)
  const saveCurrentLayoutTemplate = useAppStore((s) => s.saveCurrentLayoutTemplate)
  const removeLayoutTemplate = useAppStore((s) => s.removeLayoutTemplate)
  const timerLayout = useAppStore((s) => s.timerLayout)
  const clockLayout = useAppStore((s) => s.clockLayout)
  const taskDockLayout = useAppStore((s) => s.taskDockLayout)
  const [tab, setTab] = useState<Tab>('general')
  const [layoutName, setLayoutName] = useState('')
  const [fontHover, setFontHover] = useState<string | null>(null)

  const layouts = allLayoutTemplates(customLayoutTemplates)
  const canSaveLayout = Boolean(timerLayout && clockLayout && taskDockLayout)

  const fontOptions = useMemo(
    () =>
      siteFontPresets.map((font) => ({
        value: font.id,
        label: font.label,
        fontFamily: font.id === 'custom' ? undefined : font.id,
      })),
    [],
  )

  const previewSource =
    fontHover && fontHover !== 'custom'
      ? fontHover
      : settings.siteFont === 'custom'
        ? settings.customFont.trim() || 'Manrope'
        : settings.siteFont
  const previewFontFamily = fontStackFor(previewSource)

  return (
    <div className="panel-section">
      <div className="settings-tabs" role="tablist" aria-label="Settings sections">
        {(
          [
            ['general', 'General'],
            ['layout', 'Layout'],
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
            <SelectMenu
              id="site-font"
              value={settings.siteFont}
              options={fontOptions}
              preloadFonts
              onChange={(siteFont) => updateSettings({ siteFont })}
              onHoverOption={setFontHover}
            />
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
            </div>
          )}
          {(settings.siteFont !== 'custom' || settings.customFont.trim()) && (
            <p className="font-preview" style={{ fontFamily: previewFontFamily }}>
              Preview · Harbor Focus · 25:00
            </p>
          )}
          <div className="field">
            <label htmlFor="session-icon">Session tally icon</label>
            <SelectMenu
              id="session-icon"
              value={settings.sessionIconShape}
              onChange={(sessionIconShape) => updateSettings({ sessionIconShape })}
              options={
                [
                  { value: 'heart', label: 'Hearts' },
                  { value: 'star', label: 'Stars' },
                  { value: 'circle', label: 'Circles' },
                  { value: 'flame', label: 'Flames' },
                  { value: 'check', label: 'Checks' },
                ] satisfies { value: SessionIconShape; label: string }[]
              }
            />
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

      {tab === 'layout' && (
        <>
          <p className="helper">
            Choose where the timer, clock, and task list sit on Focus / Break. Dragging a widget
            switches to a freeform layout — save it as your own template anytime.
          </p>
          {activeLayoutTemplateId === 'custom' && (
            <p className="helper">Current arrangement: <strong>Custom (freeform)</strong></p>
          )}
          <div className="layout-template-list">
            {layouts.map((template) => {
              const active = activeLayoutTemplateId === template.id
              return (
                <div
                  key={template.id}
                  className={`layout-template-card ${active ? 'active' : ''}`}
                >
                  <button
                    type="button"
                    className="layout-template-main"
                    onClick={() => applyLayoutTemplate(template.id)}
                  >
                    <strong>{template.name}</strong>
                    <span className="helper">{template.description}</span>
                    {active && <em>Applied</em>}
                  </button>
                  {!template.builtin && (
                    <button
                      type="button"
                      className="tiny"
                      aria-label={`Delete ${template.name}`}
                      onClick={() => removeLayoutTemplate(template.id)}
                    >
                      ×
                    </button>
                  )}
                </div>
              )
            })}
          </div>
          <h3 className="panel-subhead">Save current layout</h3>
          <div className="field">
            <label htmlFor="layout-name">Template name</label>
            <input
              id="layout-name"
              value={layoutName}
              onChange={(e) => setLayoutName(e.target.value)}
              placeholder="My focus desk"
              disabled={!canSaveLayout}
            />
            <button
              type="button"
              className="btn primary"
              disabled={!canSaveLayout || !layoutName.trim()}
              onClick={() => {
                saveCurrentLayoutTemplate(layoutName)
                setLayoutName('')
              }}
            >
              Save as template
            </button>
            {!canSaveLayout && (
              <p className="helper">
                Open Focus once and arrange the widgets (or apply a template) before saving.
              </p>
            )}
          </div>
        </>
      )}

      {tab === 'timer' && (
        <>
          <div className="field">
            <label htmlFor="timer-mode">Timer mode</label>
            <SelectMenu
              id="timer-mode"
              value={timerSettings.mode}
              options={modes.map((m) => ({ value: m.id, label: m.label }))}
              onChange={(mode) => {
                updateTimerSettings({ mode })
                resetTimer()
              }}
            />
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
            <SelectMenu
              id="alert-sound"
              value={settings.alertSoundId}
              options={alerts.map((a) => ({ value: a.id, label: a.label }))}
              onChange={(alertSoundId) => {
                updateSettings({ alertSoundId })
                playChime(alertSoundId)
              }}
            />
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
