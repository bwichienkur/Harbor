import { Check, Circle, Flame, Heart, Star } from 'lucide-react'
import type { SessionIconShape } from '../types'
import { useAppStore } from '../store/useAppStore'

const icons: Record<
  SessionIconShape,
  { Icon: typeof Heart; label: string }
> = {
  heart: { Icon: Heart, label: 'Hearts' },
  star: { Icon: Star, label: 'Stars' },
  circle: { Icon: Circle, label: 'Circles' },
  flame: { Icon: Flame, label: 'Flames' },
  check: { Icon: Check, label: 'Checks' },
}

export const sessionIconOptions = (
  Object.entries(icons) as [SessionIconShape, (typeof icons)[SessionIconShape]][]
).map(([id, meta]) => ({ id, label: meta.label }))

export function SessionTally({ scale = 1 }: { scale?: number }) {
  const shape = useAppStore((s) => s.settings.sessionIconShape)
  const completedFocusCount = useAppStore((s) => s.completedFocusCount)
  const longBreakEvery = useAppStore((s) => s.timerSettings.longBreakEvery)
  const phase = useAppStore((s) => s.phase)
  const running = useAppStore((s) => s.running)

  const total = Math.max(1, longBreakEvery)
  const filled = completedFocusCount % total
  const activeIndex =
    phase === 'focus' ? filled : phase === 'idle' ? -1 : Math.max(0, filled - 1)
  const { Icon } = icons[shape] ?? icons.heart
  const size = Math.round(18 * scale)

  return (
    <div
      className="session-tally"
      role="img"
      aria-label={`${filled} of ${total} focus sessions complete`}
      style={{ ['--tally-scale' as string]: String(scale) }}
    >
      {Array.from({ length: total }, (_, index) => {
        const done = index < filled
        const current = phase === 'focus' && running && index === activeIndex && !done
        return (
          <span
            key={index}
            className={`session-pip ${done ? 'filled' : ''} ${current ? 'current' : ''}`}
          >
            <Icon
              size={size}
              strokeWidth={done ? 0 : 2}
              fill={done ? 'currentColor' : 'none'}
              aria-hidden
            />
          </span>
        )
      })}
    </div>
  )
}
