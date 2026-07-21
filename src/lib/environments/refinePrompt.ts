import type { Season, TimeOfDay, Viewpoint, WeatherKind } from '../../types'

const LOCATION_HINTS: { re: RegExp; phrase: string }[] = [
  { re: /\bcafé|cafe|coffee\b/i, phrase: 'a cozy European coffee shop with warm wood tables and large windows' },
  { re: /\blibrary|reading room|study hall\b/i, phrase: 'a quiet historic library with tall shelves and reading lamps' },
  { re: /\bcabin|lodge|chalet\b/i, phrase: 'a timber mountain cabin with a writing desk by the window' },
  { re: /\btrain\b/i, phrase: 'a quiet train compartment with a window seat and a small table' },
  { re: /\brooftop\b/i, phrase: 'a refined rooftop terrace workspace overlooking the city' },
  { re: /\bbeach|coastal|hawaii|oceanfront\b/i, phrase: 'a breezy beachside café with open shutters to the sea' },
  { re: /\bjapanese|tokyo|ryokan|zen\b/i, phrase: 'a serene Japanese interior with soft wood and paper screens' },
  { re: /\bparis|italian|italy|european\b/i, phrase: 'an elegant European interior with stone and warm plaster walls' },
  { re: /\bcastle\b/i, phrase: 'a candlelit castle library with stone arches and heavy drapes' },
  { re: /\bcyberpunk|futuristic|neon\b/i, phrase: 'a refined futuristic apartment with rain-streaked panoramic glass' },
  { re: /\bhotel|lobby|lounge\b/i, phrase: 'a luxury hotel lounge with soft seating and muted brass accents' },
  { re: /\brainforest|treehouse|jungle\b/i, phrase: 'a rainforest treehouse study overlooking dense green canopy' },
  { re: /\bspace|observatory|station\b/i, phrase: 'a calm space-station observatory with a wide viewport' },
  { re: /\bunderwater\b/i, phrase: 'an underwater research lounge with soft blue porthole light' },
  { re: /\bwizard|fantasy|temple\b/i, phrase: 'an atmospheric fantasy study filled with books and soft magical glow' },
  { re: /\bapartment|penthouse|cowork/i, phrase: 'a quiet modern apartment workspace with clean lines' },
  { re: /\bgreenhouse|garden\b/i, phrase: 'a glass greenhouse reading corner among lush plants' },
]

const WEATHER_PHRASE: Record<WeatherKind, string> = {
  none: 'calm clear air',
  rain: 'gentle rain running down the windows',
  snow: 'soft snowfall drifting outside',
  fog: 'soft morning fog softening the distant scenery',
  storm: 'a distant thunderstorm with occasional soft flashes far away',
  dust: 'slow dust motes floating in shafts of light',
}

const TIME_PHRASE: Record<TimeOfDay, string> = {
  dawn: 'at quiet dawn with pale cool light',
  morning: 'on a soft morning with gentle daylight',
  afternoon: 'during a peaceful afternoon',
  golden: 'in golden hour light',
  blue: 'during blue hour with cool twilight tones',
  night: 'at night under warm lamps',
}

const SEASON_PHRASE: Record<Season, string> = {
  spring: 'in spring with fresh soft greens',
  summer: 'in summer with airy light',
  autumn: 'in autumn with warm amber tones',
  winter: 'in winter with hushed cool quiet',
}

const VIEW_PHRASE: Record<Viewpoint, string> = {
  desk: 'from a seated desk viewpoint',
  window: 'from a window seat',
  couch: 'from a soft couch workspace',
  reading: 'from a reading chair',
  booth: 'from a café booth',
  balcony: 'from a balcony table',
  train: 'from a train seat',
  rooftop: 'from a rooftop table',
}

export function detectWeather(prompt: string): WeatherKind {
  if (/\bstorm|thunder\b/i.test(prompt)) return 'storm'
  if (/\bsnow|blizzard|frozen\b/i.test(prompt)) return 'snow'
  if (/\bfog|mist\b/i.test(prompt)) return 'fog'
  if (/\brain|rainy|drizzle\b/i.test(prompt)) return 'rain'
  if (/\bdust|sunbeam|motes\b/i.test(prompt)) return 'dust'
  return 'none'
}

export function detectTime(prompt: string): TimeOfDay {
  if (/\bdawn|sunrise\b/i.test(prompt)) return 'dawn'
  if (/\bgolden hour|sunset\b/i.test(prompt)) return 'golden'
  if (/\bblue hour|twilight|dusk\b/i.test(prompt)) return 'blue'
  if (/\bnight|midnight|evening\b/i.test(prompt)) return 'night'
  if (/\bmorning\b/i.test(prompt)) return 'morning'
  return 'afternoon'
}

export function detectSeason(prompt: string): Season {
  if (/\bspring|cherry blossom|sakura\b/i.test(prompt)) return 'spring'
  if (/\bsummer|beach\b/i.test(prompt)) return 'summer'
  if (/\bwinter|snow|frozen\b/i.test(prompt)) return 'winter'
  if (/\bautumn|fall\b/i.test(prompt)) return 'autumn'
  return 'autumn'
}

export function detectViewpoint(prompt: string): Viewpoint {
  if (/\btrain\b/i.test(prompt)) return 'train'
  if (/\brooftop\b/i.test(prompt)) return 'rooftop'
  if (/\bbalcony\b/i.test(prompt)) return 'balcony'
  if (/\bbooth\b/i.test(prompt)) return 'booth'
  if (/\bcouch|sofa\b/i.test(prompt)) return 'couch'
  if (/\breading chair|armchair\b/i.test(prompt)) return 'reading'
  if (/\bwindow seat\b/i.test(prompt)) return 'window'
  return 'desk'
}

function locationFromPrompt(prompt: string): string {
  for (const hint of LOCATION_HINTS) {
    if (hint.re.test(prompt)) return hint.phrase
  }
  return 'a calm premium focus workspace with soft furniture and a clear seated viewpoint'
}

/**
 * Expand a short user prompt into a richer internal scene description.
 * Used for image generation and tagging — not shown to the user by default.
 */
export function refinePrompt(userPrompt: string): string {
  const prompt = userPrompt.trim() || 'a quiet cozy workspace'
  const weather = detectWeather(prompt)
  const time = detectTime(prompt)
  const season = detectSeason(prompt)
  const viewpoint = detectViewpoint(prompt)
  const location = locationFromPrompt(prompt)

  const extras: string[] = []
  if (/\bfireplace|fire\b/i.test(prompt)) extras.push('a crackling fireplace casting soft warm light')
  if (/\bcandle\b/i.test(prompt)) extras.push('candles flickering gently')
  if (/\bcoffee|espresso\b/i.test(prompt)) extras.push('coffee steam rising from a ceramic cup')
  if (/\bbook|library|reading\b/i.test(prompt)) extras.push('open books and quiet paper textures')
  if (/\bjazz|piano|music\b/i.test(prompt)) extras.push('a sense of soft lounge music in the air')
  if (/\bbird\b/i.test(prompt)) extras.push('occasional birds outside the frame')
  if (/\bwaterfall\b/i.test(prompt)) extras.push('a distant waterfall in the scenery')
  if (/\bcherry blossom|sakura\b/i.test(prompt)) extras.push('cherry blossoms drifting softly outside')

  const detail =
    extras.length > 0
      ? extras.join(', ')
      : 'subtle living details that never distract from deep work'

  return [
    location,
    TIME_PHRASE[time],
    SEASON_PHRASE[season],
    `with ${WEATHER_PHRASE[weather]}`,
    VIEW_PHRASE[viewpoint],
    detail,
    'cinematic, cozy, premium, calming, photorealistic focus environment',
  ].join(', ')
}
