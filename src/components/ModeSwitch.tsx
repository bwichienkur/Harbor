import { Flower2, Home, Target } from 'lucide-react'
import { motion } from 'framer-motion'
import type { DashMode } from '../types'
import { useAppStore } from '../store/useAppStore'

const modes: { id: DashMode; label: string; Icon: typeof Home }[] = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'focus', label: 'Focus', Icon: Target },
  { id: 'ambient', label: 'Break', Icon: Flower2 },
]

export function ModeSwitch() {
  const mode = useAppStore((s) => s.mode)
  const setMode = useAppStore((s) => s.setMode)
  const clearMode = useAppStore((s) => s.clearMode)

  if (clearMode) return null

  return (
    <div className="bottom-bar">
      <div className="mode-switch" role="tablist" aria-label="Dashboard mode">
        {modes.map((item) => (
          <button
            key={item.id}
            role="tab"
            aria-selected={mode === item.id}
            className={`mode-btn ${mode === item.id ? 'active' : ''}`}
            onClick={() => setMode(item.id)}
          >
            {mode === item.id && (
              <motion.span
                layoutId="mode-pill"
                className="mode-pill"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <item.Icon size={16} strokeWidth={2.25} aria-hidden />
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
