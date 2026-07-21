import type {
  EnvironmentPersonalization,
  FocusEnvironment,
  SoundLayerState,
} from '../../types'
import { defaultPersonalization } from './defaults'

/** Apply personalization to an environment (overlays / grade). Image stays curated. */
export function applyEnvironmentPersonalization(
  env: FocusEnvironment,
  patch: Partial<EnvironmentPersonalization>,
): FocusEnvironment {
  return {
    ...env,
    personalization: { ...env.personalization, ...patch },
  }
}

export function withPersonalization(
  env: FocusEnvironment,
  personalization: Partial<EnvironmentPersonalization>,
  soundLayers?: SoundLayerState[],
): FocusEnvironment {
  return {
    ...env,
    personalization: { ...defaultPersonalization(), ...env.personalization, ...personalization },
    soundLayers: soundLayers ?? env.soundLayers,
  }
}
