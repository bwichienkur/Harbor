import { motion } from 'framer-motion'
import { useAppStore } from '../store/useAppStore'

const steps = [
  {
    title: 'Welcome to Harbor',
    body: 'A calm focus dashboard with a timer you can move, resize, and clear the chrome around.',
  },
  {
    title: 'Start a session',
    body: 'Press Space to start/pause. Use 1 / 2 / 3 for Home, Focus, and Break. C toggles clear mode.',
  },
  {
    title: 'Make it yours',
    body: 'Themes, ambient sound, Spotify/YouTube, tasks with ETAs, and stats all save in this browser. Export a backup anytime under Settings.',
  },
]

export function Onboarding() {
  const complete = useAppStore((s) => s.settings.onboardingComplete)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const setMode = useAppStore((s) => s.setMode)

  if (complete) return null

  return (
    <div className="onboarding-scrim" role="dialog" aria-modal="true" aria-label="Welcome to Harbor">
      <motion.div
        className="onboarding-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="brand" style={{ marginBottom: '0.5rem' }}>
          Harbor<span>.</span>
        </div>
        {steps.map((step) => (
          <div key={step.title} className="onboarding-step">
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </div>
        ))}
        <div className="timer-controls">
          <button
            className="btn primary"
            onClick={() => {
              updateSettings({ onboardingComplete: true })
              setMode('focus')
            }}
          >
            Start focusing
          </button>
          <button
            className="btn"
            onClick={() => updateSettings({ onboardingComplete: true })}
          >
            Explore Home
          </button>
        </div>
      </motion.div>
    </div>
  )
}
