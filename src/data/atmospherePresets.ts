import type { EnvironmentPersonalization, SoundLayerState } from '../types'
import { defaultPersonalization, soundLayer } from '../lib/environments/defaults'

export interface AtmospherePreset {
  id: string
  name: string
  description: string
  personalization: Partial<EnvironmentPersonalization>
  sounds: SoundLayerState[]
}

export const atmospherePresets: AtmospherePreset[] = [
  {
    id: 'cozy',
    name: 'Cozy',
    description: 'Warm light, soft motion, fireplace hush',
    personalization: {
      animationIntensity: 0.35,
      timeOfDay: 'golden',
      brightness: 0.95,
      saturation: 0.88,
      weather: 'none',
      blur: 0.4,
    },
    sounds: [soundLayer('fire', true, 0.32), soundLayer('pages', true, 0.12)],
  },
  {
    id: 'deep-focus',
    name: 'Deep Focus',
    description: 'Quiet, minimal motion, soft white noise',
    personalization: {
      animationIntensity: 0.18,
      weather: 'none',
      brightness: 0.92,
      saturation: 0.8,
      blur: 0.8,
      timeOfDay: 'afternoon',
    },
    sounds: [soundLayer('white', true, 0.28)],
  },
  {
    id: 'rainy-day',
    name: 'Rainy Day',
    description: 'Gentle rain on glass, café murmur',
    personalization: {
      animationIntensity: 0.55,
      weather: 'rain',
      rainAmount: 0.65,
      timeOfDay: 'afternoon',
      saturation: 0.85,
    },
    sounds: [soundLayer('rain', true, 0.42), soundLayer('cafe', true, 0.18)],
  },
  {
    id: 'morning-coffee',
    name: 'Morning Coffee',
    description: 'Soft morning light and café calm',
    personalization: {
      animationIntensity: 0.3,
      timeOfDay: 'morning',
      season: 'spring',
      brightness: 1.05,
      weather: 'none',
    },
    sounds: [soundLayer('cafe', true, 0.3), soundLayer('birds', true, 0.14)],
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Lamp glow, night hush, soft keyboard',
    personalization: {
      animationIntensity: 0.28,
      timeOfDay: 'night',
      brightness: 0.82,
      weather: 'none',
      saturation: 0.85,
    },
    sounds: [soundLayer('night', true, 0.16), soundLayer('keyboard', true, 0.1)],
  },
  {
    id: 'library',
    name: 'Library',
    description: 'Pages, clock, and quiet study air',
    personalization: {
      animationIntensity: 0.25,
      timeOfDay: 'afternoon',
      weather: 'dust',
      saturation: 0.86,
    },
    sounds: [soundLayer('pages', true, 0.22), soundLayer('clock', true, 0.1)],
  },
  {
    id: 'cabin',
    name: 'Cabin',
    description: 'Fireplace, wind, and winter calm',
    personalization: {
      animationIntensity: 0.4,
      weather: 'snow',
      snowAmount: 0.5,
      season: 'winter',
      timeOfDay: 'night',
      brightness: 0.9,
    },
    sounds: [soundLayer('fire', true, 0.38), soundLayer('wind', true, 0.16)],
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Waves and open coastal air',
    personalization: {
      animationIntensity: 0.35,
      timeOfDay: 'golden',
      season: 'summer',
      weather: 'none',
      brightness: 1.05,
    },
    sounds: [soundLayer('ocean', true, 0.4), soundLayer('birds', true, 0.1)],
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Barely-there motion, soft hush',
    personalization: {
      ...defaultPersonalization(),
      animationIntensity: 0.12,
      weather: 'none',
      blur: 1,
      saturation: 0.75,
      brightness: 0.96,
    },
    sounds: [soundLayer('white', true, 0.18)],
  },
]
