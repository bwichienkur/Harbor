import { useEffect, useState } from 'react'
import { themes } from '../../data/themes'
import type { DashMode } from '../../types'
import { useAppStore } from '../../store/useAppStore'

type ThemeFilter = 'all' | 'cafe' | 'desk' | 'office'

export function ThemesPanel() {
  const mode = useAppStore((s) => s.mode)
  const homeThemeId = useAppStore((s) => s.homeThemeId)
  const focusThemeId = useAppStore((s) => s.focusThemeId)
  const ambientThemeId = useAppStore((s) => s.ambientThemeId)
  const customBackground = useAppStore((s) => s.customBackground)
  const overlayStrength = useAppStore((s) => s.settings.overlayStrength)
  const settings = useAppStore((s) => s.settings)
  const setTheme = useAppStore((s) => s.setTheme)
  const setCustomBackground = useAppStore((s) => s.setCustomBackground)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const [filter, setFilter] = useState<ThemeFilter>('all')

  const slot: DashMode = mode
  const activeId =
    slot === 'focus' ? focusThemeId : slot === 'ambient' ? ambientThemeId : homeThemeId
  const videoKey =
    slot === 'focus' ? 'focusVideoUrl' : slot === 'ambient' ? 'ambientVideoUrl' : 'homeVideoUrl'
  const videoValue = settings[videoKey]
  const [draftVideo, setDraftVideo] = useState(videoValue)

  useEffect(() => {
    setDraftVideo(videoValue)
  }, [videoValue])

  const visible = themes.filter((t) => (filter === 'all' ? true : t.category === filter))

  return (
    <div className="panel-section">
      <p className="helper">
        Scenic animated workspaces for <strong>{slot}</strong> — real places, soft motion, fixed
        camera.
      </p>

      <div className="eta-row">
        {(['all', 'cafe', 'desk', 'office'] as const).map((f) => (
          <button
            key={f}
            type="button"
            className={`chip ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f === 'cafe' ? 'Cafés' : f === 'desk' ? 'Desks' : 'Offices'}
          </button>
        ))}
      </div>

      <div className="field">
        <label htmlFor="overlay">Overlay strength · {Math.round(overlayStrength * 100)}%</label>
        <input
          id="overlay"
          type="range"
          min={0.15}
          max={0.8}
          step={0.01}
          value={overlayStrength}
          onChange={(e) => updateSettings({ overlayStrength: Number(e.target.value) })}
        />
      </div>

      <div className="field">
        <label htmlFor="upload">Custom background</label>
        <input
          id="upload"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (!file) return
            const reader = new FileReader()
            reader.onload = () => {
              if (typeof reader.result === 'string') setCustomBackground(reader.result)
            }
            reader.readAsDataURL(file)
          }}
        />
        {customBackground && (
          <button className="btn" type="button" onClick={() => setCustomBackground(null)}>
            Remove custom image
          </button>
        )}
      </div>

      <div className="field">
        <label htmlFor="video-bg">YouTube / video override</label>
        <input
          id="video-bg"
          value={draftVideo}
          onChange={(e) => setDraftVideo(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=…"
        />
        <div className="timer-controls">
          <button
            className="btn primary"
            type="button"
            onClick={() => updateSettings({ [videoKey]: draftVideo.trim() })}
          >
            Save video
          </button>
          <button
            className="btn"
            type="button"
            onClick={() => {
              setDraftVideo('')
              updateSettings({ [videoKey]: '' })
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="theme-grid theme-grid-lg">
        {visible.map((theme) => {
          const applied = !customBackground && !videoValue && activeId === theme.id
          return (
            <button
              key={theme.id}
              type="button"
              className={`theme-card ${applied ? 'active' : ''} theme-card-live`}
              onClick={() => {
                setCustomBackground(null)
                updateSettings({ [videoKey]: '' })
                setDraftVideo('')
                setTheme(slot, theme.id)
              }}
            >
              <img src={theme.image} alt="" loading="lazy" decoding="async" />
              <em className="theme-live">Live</em>
              {applied && <em className="theme-applied">Applied</em>}
              <span>{theme.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
