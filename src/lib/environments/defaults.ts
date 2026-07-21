import type {
  AmbientSoundKind,
  EnvironmentPersonalization,
  SoundLayerState,
} from '../../types'

export const defaultPersonalization = (): EnvironmentPersonalization => ({
  animationIntensity: 0.45,
  weather: 'none',
  timeOfDay: 'afternoon',
  season: 'autumn',
  brightness: 1,
  blur: 0,
  saturation: 0.92,
  viewpoint: 'desk',
  overlay: 0.42,
})

export function soundLayer(
  id: AmbientSoundKind,
  enabled = true,
  volume = 0.35,
): SoundLayerState {
  return { id, enabled, volume }
}

export const ART_DIRECTION =
  'cinematic cozy premium believable elegant immersive warm calming minimalist relaxing focus workspace, fixed seated camera, subtle atmosphere, soft natural color grading, not cartoonish, no flashy effects, photorealistic'
