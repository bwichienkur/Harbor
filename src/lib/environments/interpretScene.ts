import type {
  AmbientSoundKind,
  EnvCategory,
  Season,
  TimeOfDay,
  Viewpoint,
  WeatherKind,
} from '../../types'
import {
  detectSeason,
  detectTime,
  detectViewpoint,
  detectWeather,
  refinePrompt,
} from './refinePrompt'

export interface SceneInterpretation {
  refinedPrompt: string
  category: EnvCategory
  weather: WeatherKind
  timeOfDay: TimeOfDay
  season: Season
  viewpoint: Viewpoint
  tags: string[]
  sounds: AmbientSoundKind[]
  preferVideoBaseId: string | null
}

function detectCategory(prompt: string): EnvCategory {
  if (/\bwizard|floating island|space|underwater|steampunk|temple|fantasy\b/i.test(prompt)) {
    return 'fantasy'
  }
  if (/\bautumn|snowy|spring garden|summer beach|thunderstorm|foggy|golden hour|blue hour\b/i.test(prompt)) {
    return 'seasonal'
  }
  if (/\bforest|lake|beach|zen|greenhouse|waterfall|mountain|cabin|nature\b/i.test(prompt)) {
    return 'nature'
  }
  if (/\brooftop|apartment|penthouse|cowork|museum|hotel|city\b/i.test(prompt)) {
    return 'city'
  }
  if (/\blibrary|reading|books\b/i.test(prompt)) return 'library'
  if (/\bcafé|cafe|coffee\b/i.test(prompt)) return 'cafe'
  if (/\boffice|desk|workspace\b/i.test(prompt)) return 'desk'
  return 'cafe'
}

function detectSounds(prompt: string, weather: WeatherKind): AmbientSoundKind[] {
  const sounds = new Set<AmbientSoundKind>()
  if (weather === 'rain' || weather === 'storm') sounds.add('rain')
  if (weather === 'storm') sounds.add('thunder')
  if (weather === 'snow' || /\bwind\b/i.test(prompt)) sounds.add('wind')
  if (/\bfireplace|fire|cabin|castle|lodge\b/i.test(prompt)) sounds.add('fire')
  if (/\bcafé|cafe|coffee|jazz|hotel|lobby\b/i.test(prompt)) sounds.add('cafe')
  if (/\bocean|beach|coast|waves|hawaii\b/i.test(prompt)) sounds.add('ocean')
  if (/\bbird|forest|garden|treehouse|zen\b/i.test(prompt)) sounds.add('birds')
  if (/\bnight|cricket\b/i.test(prompt)) sounds.add('night')
  if (/\btrain\b/i.test(prompt)) sounds.add('train')
  if (/\blibrary|book|pages|reading\b/i.test(prompt)) sounds.add('pages')
  if (/\bkeyboard|coding|typing|office\b/i.test(prompt)) sounds.add('keyboard')
  if (/\bclock|quiet study\b/i.test(prompt)) sounds.add('clock')
  if (sounds.size === 0) sounds.add('white')
  return [...sounds].slice(0, 4)
}

/** Prefer a looping Mixkit base when the prompt maps cleanly to one. */
function preferVideoBase(weather: WeatherKind, category: EnvCategory): string | null {
  if (weather === 'rain' || weather === 'storm') {
    if (category === 'cafe') return 'laptop-cafe-live'
    if (category === 'office' || category === 'city') return 'city-window-office'
    return 'rainy-window-desk'
  }
  if (category === 'cafe') return 'reading-cafe-live'
  if (category === 'office' || category === 'city') return 'highrise-window'
  if (category === 'desk') return 'dev-coffee-desk'
  return null
}

export function interpretScene(userPrompt: string): SceneInterpretation {
  const refinedPrompt = refinePrompt(userPrompt)
  const weather = detectWeather(userPrompt)
  const timeOfDay = detectTime(userPrompt)
  const season = detectSeason(userPrompt)
  const viewpoint = detectViewpoint(userPrompt)
  const category = detectCategory(userPrompt)
  const sounds = detectSounds(userPrompt, weather)
  const tags = [
    category,
    weather,
    timeOfDay,
    season,
    viewpoint,
    ...sounds,
  ].filter((t) => t && t !== 'none')

  return {
    refinedPrompt,
    category,
    weather,
    timeOfDay,
    season,
    viewpoint,
    tags,
    sounds,
    preferVideoBaseId: preferVideoBase(weather, category),
  }
}
