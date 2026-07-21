import { themes } from '../../data/themes'
import type {
  EnvironmentPersonalization,
  FocusEnvironment,
  SoundLayerState,
} from '../../types'
import { defaultPersonalization, soundLayer } from './defaults'
import { buildEnvironmentImageUrl, buildRegeneratedImageUrl } from './imageUrl'
import { interpretScene } from './interpretScene'

function uid() {
  return `env-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function titleFromPrompt(prompt: string): string {
  const cleaned = prompt.trim().replace(/\s+/g, ' ')
  if (!cleaned) return 'Custom Environment'
  return cleaned.length > 48 ? `${cleaned.slice(0, 45)}…` : cleaned
}

function layersFromKinds(kinds: string[]): SoundLayerState[] {
  return kinds.map((id, i) =>
    soundLayer(id as SoundLayerState['id'], true, i === 0 ? 0.38 : 0.22),
  )
}

/** Compose a new AI focus environment from a natural-language prompt. */
export function composeEnvironmentFromPrompt(userPrompt: string): FocusEnvironment {
  const scene = interpretScene(userPrompt)
  const base = scene.preferVideoBaseId
    ? themes.find((t) => t.id === scene.preferVideoBaseId)
    : undefined

  const personalization: EnvironmentPersonalization = {
    ...defaultPersonalization(),
    weather: scene.weather,
    timeOfDay: scene.timeOfDay,
    season: scene.season,
    viewpoint: scene.viewpoint,
    overlay: base?.overlay ?? 0.44,
    saturation: 0.9,
    brightness: scene.timeOfDay === 'night' ? 0.85 : 1,
  }

  const image = buildEnvironmentImageUrl(scene.refinedPrompt)

  return {
    id: uid(),
    name: titleFromPrompt(userPrompt),
    category: scene.category,
    image,
    video: base?.video,
    animated: Boolean(base?.video),
    curated: false,
    prompt: userPrompt.trim(),
    refinedPrompt: scene.refinedPrompt,
    tags: scene.tags,
    personalization,
    soundLayers: layersFromKinds(scene.sounds),
    createdAt: Date.now(),
  }
}

/** Recompose image / overlays after personalization changes, keeping identity. */
export function applyEnvironmentPersonalization(
  env: FocusEnvironment,
  patch: Partial<EnvironmentPersonalization>,
  regenerateImage = false,
): FocusEnvironment {
  const personalization = { ...env.personalization, ...patch }
  const extras = [
    `weather ${personalization.weather}`,
    `${personalization.timeOfDay} lighting`,
    `${personalization.season} season`,
    `${personalization.viewpoint} viewpoint`,
  ]
  const image = regenerateImage
    ? buildRegeneratedImageUrl(
        env.refinedPrompt ?? env.prompt ?? env.name,
        extras,
        env.createdAt % 1_000_000,
      )
    : env.image

  return {
    ...env,
    image,
    personalization,
  }
}
