import { Sparkles, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { curatedEnvironments, envCategories, findEnvironment } from '../../data/environments'
import type {
  DashMode,
  EnvCategory,
  Season,
  TimeOfDay,
  Viewpoint,
  WeatherKind,
} from '../../types'
import { useAppStore } from '../../store/useAppStore'

type Filter = EnvCategory | 'all' | 'animated' | 'mine'
type Tab = 'generate' | 'library' | 'tune'

const EXAMPLE_PROMPTS = [
  'A cozy library during a thunderstorm.',
  'A quiet Japanese café overlooking cherry blossoms.',
  'A mountain cabin at sunrise with a fireplace.',
  'A rooftop café in Italy during golden hour.',
  'A train traveling through snowy mountains.',
  'A futuristic cyberpunk apartment during heavy rain.',
]

export function ThemesPanel() {
  const mode = useAppStore((s) => s.mode)
  const homeThemeId = useAppStore((s) => s.homeThemeId)
  const focusThemeId = useAppStore((s) => s.focusThemeId)
  const ambientThemeId = useAppStore((s) => s.ambientThemeId)
  const customBackground = useAppStore((s) => s.customBackground)
  const customEnvironments = useAppStore((s) => s.customEnvironments)
  const overlayStrength = useAppStore((s) => s.settings.overlayStrength)
  const settings = useAppStore((s) => s.settings)
  const setTheme = useAppStore((s) => s.setTheme)
  const setCustomBackground = useAppStore((s) => s.setCustomBackground)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const generateEnvironment = useAppStore((s) => s.generateEnvironment)
  const updateActiveEnvironment = useAppStore((s) => s.updateActiveEnvironment)
  const removeCustomEnvironment = useAppStore((s) => s.removeCustomEnvironment)

  const [tab, setTab] = useState<Tab>('generate')
  const [filter, setFilter] = useState<Filter>('animated')
  const [prompt, setPrompt] = useState('')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')

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

  const activeEnv = findEnvironment(activeId, customEnvironments)

  const catalog = useMemo(() => {
    const mine = customEnvironments
    const all = [...mine, ...curatedEnvironments]
    return all.filter((env) => {
      if (filter === 'all') return true
      if (filter === 'animated') return Boolean(env.animated && env.video)
      if (filter === 'mine') return !env.curated
      return env.category === filter
    })
  }, [customEnvironments, filter])

  const onGenerate = () => {
    const text = prompt.trim()
    if (!text) return
    setBusy(true)
    setStatus('Interpreting scene…')
    window.setTimeout(() => {
      const env = generateEnvironment(text, slot)
      setStatus(`Created “${env.name}”`)
      setBusy(false)
      setTab('tune')
    }, 280)
  }

  return (
    <div className="panel-section">
      <p className="helper">
        Immersive focus environments for <strong>{slot}</strong> — curated worlds or describe your
        own.
      </p>

      <div className="settings-tabs" role="tablist" aria-label="Environment sections">
        {(
          [
            ['generate', 'Create'],
            ['library', 'Library'],
            ['tune', 'Tune'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`chip ${tab === id ? 'active' : ''}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'generate' && (
        <>
          <div className="field">
            <label htmlFor="env-prompt">Describe your focus environment</label>
            <textarea
              id="env-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Quiet cabin overlooking a frozen lake…"
              rows={4}
            />
          </div>
          <button
            type="button"
            className="btn primary"
            disabled={busy || !prompt.trim()}
            onClick={onGenerate}
          >
            <Sparkles size={16} aria-hidden /> {busy ? 'Composing…' : 'Generate environment'}
          </button>
          {status && <p className="helper">{status}</p>}
          <div className="eta-row duration-quicks">
            {EXAMPLE_PROMPTS.map((example) => (
              <button
                key={example}
                type="button"
                className="chip"
                onClick={() => setPrompt(example)}
              >
                {example.length > 36 ? `${example.slice(0, 34)}…` : example}
              </button>
            ))}
          </div>
          <p className="helper">
            Harbor expands your prompt into a full scene, paints an AI still, layers subtle weather
            and sound, and can blend a looping live base when it fits.
          </p>
        </>
      )}

      {tab === 'library' && (
        <>
          <div className="eta-row">
            {envCategories.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`chip ${filter === f.id ? 'active' : ''}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
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
            <label htmlFor="upload">Custom still upload</label>
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
            {catalog.map((env) => {
              const applied = !customBackground && !videoValue && activeId === env.id
              return (
                <button
                  key={env.id}
                  type="button"
                  className={`theme-card ${applied ? 'active' : ''} ${env.animated ? 'theme-card-live' : ''} ${!env.curated ? 'theme-card-ai' : ''}`}
                  onClick={() => {
                    setCustomBackground(null)
                    updateSettings({ [videoKey]: '' })
                    setDraftVideo('')
                    setTheme(slot, env.id)
                  }}
                >
                  <img src={env.image} alt="" loading="lazy" decoding="async" />
                  {env.animated && <em className="theme-live">Live</em>}
                  {!env.curated && <em className="theme-ai">AI</em>}
                  {applied && <em className="theme-applied">Applied</em>}
                  <span>{env.name}</span>
                  {!env.curated && (
                    <span
                      className="theme-delete"
                      role="button"
                      tabIndex={0}
                      title="Remove saved environment"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeCustomEnvironment(env.id)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.stopPropagation()
                          removeCustomEnvironment(env.id)
                        }
                      }}
                    >
                      <Trash2 size={12} />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </>
      )}

      {tab === 'tune' && (
        <>
          {activeEnv ? (
            <>
              <p className="helper">
                Tuning <strong>{activeEnv.name}</strong>
                {activeEnv.prompt ? ` · “${activeEnv.prompt}”` : ''}
              </p>
              <TuneSlider
                label="Animation intensity"
                value={activeEnv.personalization.animationIntensity}
                min={0}
                max={1}
                onChange={(v) => updateActiveEnvironment({ animationIntensity: v })}
              />
              <TuneSlider
                label="Brightness"
                value={activeEnv.personalization.brightness}
                min={0.6}
                max={1.3}
                onChange={(v) => updateActiveEnvironment({ brightness: v })}
              />
              <TuneSlider
                label="Saturation"
                value={activeEnv.personalization.saturation}
                min={0.5}
                max={1.2}
                onChange={(v) => updateActiveEnvironment({ saturation: v })}
              />
              <TuneSlider
                label="Soft blur"
                value={activeEnv.personalization.blur}
                min={0}
                max={6}
                onChange={(v) => updateActiveEnvironment({ blur: v })}
              />
              <TuneSelect
                label="Weather"
                value={activeEnv.personalization.weather}
                options={['none', 'rain', 'snow', 'fog', 'storm', 'dust']}
                onChange={(v) =>
                  updateActiveEnvironment({ weather: v as WeatherKind }, { regenerateImage: true })
                }
              />
              <TuneSelect
                label="Time of day"
                value={activeEnv.personalization.timeOfDay}
                options={['dawn', 'morning', 'afternoon', 'golden', 'blue', 'night']}
                onChange={(v) =>
                  updateActiveEnvironment({ timeOfDay: v as TimeOfDay }, { regenerateImage: true })
                }
              />
              <TuneSelect
                label="Season"
                value={activeEnv.personalization.season}
                options={['spring', 'summer', 'autumn', 'winter']}
                onChange={(v) =>
                  updateActiveEnvironment({ season: v as Season }, { regenerateImage: true })
                }
              />
              <TuneSelect
                label="Viewpoint"
                value={activeEnv.personalization.viewpoint}
                options={['desk', 'window', 'couch', 'reading', 'booth', 'balcony', 'train', 'rooftop']}
                onChange={(v) =>
                  updateActiveEnvironment({ viewpoint: v as Viewpoint }, { regenerateImage: true })
                }
              />
              <button
                type="button"
                className="btn"
                onClick={() => updateActiveEnvironment({}, { regenerateImage: true })}
              >
                Regenerate scene image
              </button>
            </>
          ) : (
            <p className="helper">Select or generate an environment first.</p>
          )}
        </>
      )}
    </div>
  )
}

function TuneSlider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
}) {
  return (
    <div className="field duration-field">
      <div className="duration-label-row">
        <label>{label}</label>
        <strong>{Math.round(value * (max <= 1.5 ? 100 : 1))}{max <= 1.5 ? '%' : ''}</strong>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={max <= 1.5 ? 0.01 : 0.1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}

function TuneSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  )
}
