import type {
  AmbientSoundKind,
  EnvironmentPersonalization,
  SoundLayerState,
} from '../../types'

export const defaultPersonalization = (): EnvironmentPersonalization => ({
  animationIntensity: 0.4,
  weather: 'none',
  timeOfDay: 'afternoon',
  season: 'autumn',
  brightness: 1,
  blur: 0,
  saturation: 0.9,
  viewpoint: 'desk',
  overlay: 0.42,
  rainAmount: 0.45,
  snowAmount: 0.4,
})

export function soundLayer(
  id: AmbientSoundKind,
  enabled = true,
  volume = 0.35,
): SoundLayerState {
  return { id, enabled, volume }
}
