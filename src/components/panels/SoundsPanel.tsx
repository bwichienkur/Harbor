import { ambientSounds } from '../../data/sounds'
import { useAppStore } from '../../store/useAppStore'

export function SoundsPanel() {
  const activeSoundId = useAppStore((s) => s.activeSoundId)
  const soundVolume = useAppStore((s) => s.soundVolume)
  const setSound = useAppStore((s) => s.setSound)
  const setSoundVolume = useAppStore((s) => s.setSoundVolume)

  return (
    <div className="panel-section">
      <p className="helper">
        Layer generated ambient soundscapes to set the mood. Sounds are synthesized in your browser.
      </p>
      <div className="field">
        <label htmlFor="volume">Volume · {Math.round(soundVolume * 100)}%</label>
        <input
          id="volume"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={soundVolume}
          onChange={(e) => setSoundVolume(Number(e.target.value))}
        />
      </div>
      <div className="sound-grid">
        {ambientSounds.map((sound) => (
          <button
            key={sound.id}
            className={`sound-btn ${activeSoundId === sound.id ? 'active' : ''}`}
            onClick={() => setSound(activeSoundId === sound.id ? null : sound.id)}
          >
            <strong>
              {sound.icon} {sound.name}
            </strong>
            <span className="helper">{activeSoundId === sound.id ? 'Playing' : 'Tap to play'}</span>
          </button>
        ))}
      </div>
      {activeSoundId && (
        <button className="btn" onClick={() => setSound(null)}>
          Stop sound
        </button>
      )}
    </div>
  )
}
