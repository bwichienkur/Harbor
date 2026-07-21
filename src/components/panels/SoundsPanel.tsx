import { useState } from 'react'
import { ambientSounds } from '../../data/sounds'
import { useAppStore } from '../../store/useAppStore'

export function SoundsPanel() {
  const soundLayers = useAppStore((s) => s.soundLayers)
  const soundPresets = useAppStore((s) => s.soundPresets)
  const soundVolume = useAppStore((s) => s.soundVolume)
  const toggleSoundLayer = useAppStore((s) => s.toggleSoundLayer)
  const setSoundLayerVolume = useAppStore((s) => s.setSoundLayerVolume)
  const setSoundLayers = useAppStore((s) => s.setSoundLayers)
  const setSoundVolume = useAppStore((s) => s.setSoundVolume)
  const saveSoundPreset = useAppStore((s) => s.saveSoundPreset)
  const applySoundPreset = useAppStore((s) => s.applySoundPreset)
  const removeSoundPreset = useAppStore((s) => s.removeSoundPreset)
  const [presetName, setPresetName] = useState('')

  const layerMap = new Map(soundLayers.map((l) => [l.id, l]))

  return (
    <div className="panel-section">
      <p className="helper">
        Layer ambient soundscapes independently. Each sound can be toggled and leveled — presets
        save your mix.
      </p>

      <div className="field">
        <label htmlFor="master-volume">Master · {Math.round(soundVolume * 100)}%</label>
        <input
          id="master-volume"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={soundVolume}
          onChange={(e) => setSoundVolume(Number(e.target.value))}
        />
      </div>

      <div className="sound-grid">
        {ambientSounds.map((sound) => {
          const layer = layerMap.get(sound.kind)
          const on = Boolean(layer?.enabled)
          return (
            <div key={sound.id} className={`sound-layer-card ${on ? 'active' : ''}`}>
              <button
                type="button"
                className={`sound-btn ${on ? 'active' : ''}`}
                onClick={() => toggleSoundLayer(sound.kind)}
              >
                <strong>
                  {sound.icon} {sound.name}
                </strong>
                <span className="helper">{on ? 'On' : 'Off'}</span>
              </button>
              {on && (
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={layer?.volume ?? 0.35}
                  aria-label={`${sound.name} volume`}
                  onChange={(e) => setSoundLayerVolume(sound.kind, Number(e.target.value))}
                />
              )}
            </div>
          )
        })}
      </div>

      {soundLayers.some((l) => l.enabled) && (
        <button className="btn" type="button" onClick={() => setSoundLayers([])}>
          Stop all sounds
        </button>
      )}

      <h3 className="panel-subhead">Presets</h3>
      <div className="field">
        <label htmlFor="preset-name">Save current mix</label>
        <input
          id="preset-name"
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
          placeholder="Rainy café"
        />
        <button
          type="button"
          className="btn primary"
          disabled={!presetName.trim() || !soundLayers.some((l) => l.enabled)}
          onClick={() => {
            saveSoundPreset(presetName)
            setPresetName('')
          }}
        >
          Save preset
        </button>
      </div>
      {soundPresets.length > 0 && (
        <div className="eta-row">
          {soundPresets.map((preset) => (
            <span key={preset.id} className="preset-chip-wrap">
              <button type="button" className="chip" onClick={() => applySoundPreset(preset.id)}>
                {preset.name}
              </button>
              <button
                type="button"
                className="tiny"
                aria-label={`Delete ${preset.name}`}
                onClick={() => removeSoundPreset(preset.id)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
