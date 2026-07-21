import { useEffect, useState } from 'react'
import type { EnvironmentPersonalization, WeatherKind } from '../../types'
import { useAppStore } from '../../store/useAppStore'

function weatherClass(weather: WeatherKind) {
  if (weather === 'none') return ''
  return `env-weather env-weather-${weather}`
}

function timeGrade(time: EnvironmentPersonalization['timeOfDay']) {
  return `env-time env-time-${time}`
}

export function EnvironmentAtmosphere({
  personalization,
  active,
}: {
  personalization: EnvironmentPersonalization
  active: boolean
}) {
  const reduceMotion = useAppStore((s) => s.settings.reduceEnvironmentMotion)
  const [pageVisible, setPageVisible] = useState(
    typeof document === 'undefined' ? true : document.visibilityState === 'visible',
  )

  useEffect(() => {
    const onVis = () => setPageVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  if (!active) return null

  const intensity = reduceMotion || !pageVisible ? 0 : personalization.animationIntensity
  const paused = intensity < 0.05

  return (
    <div
      className={`env-atmosphere ${paused ? 'is-paused' : ''}`}
      style={{
        ['--env-intensity' as string]: String(intensity),
        ['--env-brightness' as string]: String(personalization.brightness),
        ['--env-saturate' as string]: String(personalization.saturation),
        ['--env-blur' as string]: `${personalization.blur}px`,
      }}
      aria-hidden
    >
      <div className={`env-grade ${timeGrade(personalization.timeOfDay)}`} />
      {personalization.weather !== 'none' && (
        <div className={weatherClass(personalization.weather)} />
      )}
      {intensity > 0.2 && personalization.weather === 'none' && (
        <div className="env-dust" />
      )}
    </div>
  )
}
