import type { EnvCategory, FocusEnvironment } from '../types'
import { defaultPersonalization, soundLayer } from '../lib/environments/defaults'
import { themes } from './themes'

function env(
  partial: Omit<FocusEnvironment, 'curated' | 'createdAt' | 'personalization' | 'soundLayers'> & {
    personalization?: Partial<FocusEnvironment['personalization']>
    sounds?: Parameters<typeof soundLayer>[0][]
  },
): FocusEnvironment {
  const sounds = partial.sounds ?? ['white']
  return {
    id: partial.id,
    name: partial.name,
    category: partial.category,
    image: partial.image,
    video: partial.video,
    animated: partial.animated,
    prompt: partial.prompt,
    refinedPrompt: partial.refinedPrompt,
    tags: partial.tags,
    curated: true,
    createdAt: 0,
    personalization: { ...defaultPersonalization(), ...partial.personalization },
    soundLayers: sounds.map((id, i) => soundLayer(id, true, i === 0 ? 0.36 : 0.2)),
  }
}

const fromThemes: FocusEnvironment[] = themes.map((t) =>
  env({
    id: t.id,
    name: t.name,
    category: t.category,
    image: t.image,
    video: t.video,
    animated: t.animated,
    tags: [t.category, t.animated ? 'animated' : 'still'],
    personalization: { overlay: t.overlay },
    sounds:
      t.category === 'cafe'
        ? ['cafe']
        : t.id.includes('rain')
          ? ['rain']
          : t.category === 'library'
            ? ['pages']
            : ['white'],
  }),
)

const curatedExtras: FocusEnvironment[] = [
  // Libraries
  env({
    id: 'historic-european-library',
    name: 'Historic European Library',
    category: 'library',
    image:
      'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1920&q=70',
    tags: ['library', 'historic', 'europe'],
    personalization: { timeOfDay: 'afternoon', viewpoint: 'reading', overlay: 0.48 },
    sounds: ['pages', 'clock'],
  }),
  env({
    id: 'japanese-reading-room',
    name: 'Japanese Reading Room',
    category: 'library',
    image:
      'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1920&q=70',
    tags: ['library', 'japanese', 'zen'],
    personalization: { season: 'spring', viewpoint: 'reading', weather: 'none' },
    sounds: ['birds', 'pages'],
  }),
  env({
    id: 'fireplace-library',
    name: 'Fireplace Library',
    category: 'library',
    image:
      'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1920&q=70',
    tags: ['library', 'fireplace', 'cozy'],
    personalization: { weather: 'none', timeOfDay: 'night', overlay: 0.5 },
    sounds: ['fire', 'pages'],
  }),
  env({
    id: 'rainy-library',
    name: 'Rainy Library',
    category: 'library',
    image:
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1920&q=70',
    video: 'https://assets.mixkit.co/videos/2846/2846-720.mp4',
    animated: true,
    tags: ['library', 'rain'],
    personalization: { weather: 'rain', timeOfDay: 'afternoon' },
    sounds: ['rain', 'pages'],
  }),
  env({
    id: 'night-library',
    name: 'Night Library',
    category: 'library',
    image:
      'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1920&q=70',
    tags: ['library', 'night'],
    personalization: { timeOfDay: 'night', brightness: 0.88 },
    sounds: ['pages', 'clock'],
  }),
  env({
    id: 'mountain-library',
    name: 'Mountain Library',
    category: 'library',
    image:
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1920&q=70',
    tags: ['library', 'mountain'],
    personalization: { season: 'autumn', viewpoint: 'window' },
    sounds: ['wind', 'pages'],
  }),

  // Cafés
  env({
    id: 'paris-cafe',
    name: 'Paris Café',
    category: 'cafe',
    image:
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1920&q=70',
    video: 'https://assets.mixkit.co/videos/206/206-720.mp4',
    animated: true,
    tags: ['cafe', 'paris'],
    personalization: { timeOfDay: 'golden', viewpoint: 'booth' },
    sounds: ['cafe'],
  }),
  env({
    id: 'tokyo-cafe',
    name: 'Tokyo Café',
    category: 'cafe',
    image:
      'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1920&q=70',
    tags: ['cafe', 'tokyo'],
    personalization: { season: 'spring', viewpoint: 'window' },
    sounds: ['cafe', 'rain'],
  }),
  env({
    id: 'coastal-cafe',
    name: 'Coastal Café',
    category: 'cafe',
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=70',
    tags: ['cafe', 'coast'],
    personalization: { season: 'summer', timeOfDay: 'morning', viewpoint: 'window' },
    sounds: ['ocean', 'cafe'],
  }),
  env({
    id: 'italian-cafe-golden',
    name: 'Italian Café · Golden Hour',
    category: 'cafe',
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=70',
    tags: ['cafe', 'italy', 'golden'],
    personalization: { timeOfDay: 'golden', viewpoint: 'booth' },
    sounds: ['cafe'],
  }),
  env({
    id: 'book-cafe',
    name: 'Book Café',
    category: 'cafe',
    image:
      'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1920&q=70',
    tags: ['cafe', 'books'],
    personalization: { viewpoint: 'reading' },
    sounds: ['cafe', 'pages'],
  }),
  env({
    id: 'mountain-cafe',
    name: 'Mountain Café',
    category: 'cafe',
    image:
      'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1920&q=70',
    tags: ['cafe', 'mountain'],
    personalization: { season: 'winter', weather: 'snow' },
    sounds: ['cafe', 'wind'],
  }),

  // Nature
  env({
    id: 'forest-cabin',
    name: 'Forest Cabin',
    category: 'nature',
    image:
      'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1920&q=70',
    tags: ['nature', 'cabin', 'forest'],
    personalization: { weather: 'none', viewpoint: 'desk', season: 'autumn' },
    sounds: ['birds', 'fire'],
  }),
  env({
    id: 'lake-dock',
    name: 'Lake Dock',
    category: 'nature',
    image:
      'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1920&q=70',
    tags: ['nature', 'lake'],
    personalization: { timeOfDay: 'dawn', viewpoint: 'window' },
    sounds: ['birds', 'wind'],
  }),
  env({
    id: 'beach-sunrise',
    name: 'Beach Sunrise',
    category: 'nature',
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=70',
    tags: ['nature', 'beach', 'sunrise'],
    personalization: { timeOfDay: 'dawn', season: 'summer' },
    sounds: ['ocean'],
  }),
  env({
    id: 'zen-garden',
    name: 'Zen Garden',
    category: 'nature',
    image:
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1920&q=70',
    tags: ['nature', 'zen'],
    personalization: { season: 'spring', viewpoint: 'reading' },
    sounds: ['birds', 'wind'],
  }),
  env({
    id: 'greenhouse-nook',
    name: 'Greenhouse',
    category: 'nature',
    image:
      'https://images.unsplash.com/photo-1466692476866-aef614ec2d7e?auto=format&fit=crop&w=1920&q=70',
    tags: ['nature', 'greenhouse'],
    personalization: { season: 'summer', weather: 'dust' },
    sounds: ['birds'],
  }),
  env({
    id: 'waterfall-overlook',
    name: 'Waterfall Overlook',
    category: 'nature',
    image:
      'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1920&q=70',
    tags: ['nature', 'waterfall'],
    personalization: { viewpoint: 'balcony' },
    sounds: ['ocean', 'birds'],
  }),
  env({
    id: 'mountain-lodge',
    name: 'Mountain Lodge',
    category: 'nature',
    image:
      'https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=1920&q=70',
    tags: ['nature', 'lodge', 'winter'],
    personalization: { season: 'winter', weather: 'snow', timeOfDay: 'night' },
    sounds: ['fire', 'wind'],
  }),

  // Cities
  env({
    id: 'modern-apartment',
    name: 'Modern Apartment',
    category: 'city',
    image:
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1920&q=70',
    tags: ['city', 'apartment'],
    personalization: { viewpoint: 'desk', timeOfDay: 'afternoon' },
    sounds: ['white', 'keyboard'],
  }),
  env({
    id: 'rooftop-workspace',
    name: 'Rooftop Workspace',
    category: 'city',
    image:
      'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1920&q=70',
    tags: ['city', 'rooftop'],
    personalization: { viewpoint: 'rooftop', timeOfDay: 'golden' },
    sounds: ['wind', 'cafe'],
  }),
  env({
    id: 'luxury-penthouse',
    name: 'Luxury Penthouse',
    category: 'city',
    image:
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1920&q=70',
    tags: ['city', 'penthouse'],
    personalization: { timeOfDay: 'blue', viewpoint: 'window' },
    sounds: ['white'],
  }),
  env({
    id: 'quiet-coworking',
    name: 'Quiet Coworking',
    category: 'city',
    image:
      'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1920&q=70',
    tags: ['city', 'coworking'],
    personalization: { viewpoint: 'desk' },
    sounds: ['keyboard', 'cafe'],
  }),
  env({
    id: 'hotel-lounge',
    name: 'Hotel Lounge',
    category: 'city',
    image:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=70',
    tags: ['city', 'hotel'],
    personalization: { timeOfDay: 'night', viewpoint: 'couch' },
    sounds: ['cafe'],
  }),

  // Fantasy
  env({
    id: 'wizard-library',
    name: 'Wizard Library',
    category: 'fantasy',
    image:
      'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1920&q=70',
    tags: ['fantasy', 'wizard', 'library'],
    personalization: { timeOfDay: 'night', weather: 'dust', viewpoint: 'reading' },
    sounds: ['fire', 'pages'],
  }),
  env({
    id: 'space-observatory',
    name: 'Space Observatory',
    category: 'fantasy',
    image:
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1920&q=70',
    tags: ['fantasy', 'space'],
    personalization: { timeOfDay: 'night', brightness: 0.8, viewpoint: 'window' },
    sounds: ['white'],
  }),
  env({
    id: 'ancient-temple',
    name: 'Ancient Temple',
    category: 'fantasy',
    image:
      'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1920&q=70',
    tags: ['fantasy', 'temple'],
    personalization: { timeOfDay: 'golden', weather: 'dust' },
    sounds: ['wind', 'birds'],
  }),
  env({
    id: 'steampunk-workshop',
    name: 'Steampunk Workshop',
    category: 'fantasy',
    image:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1920&q=70',
    tags: ['fantasy', 'steampunk'],
    personalization: { timeOfDay: 'night', viewpoint: 'desk' },
    sounds: ['clock', 'fire'],
  }),

  // Seasonal
  env({
    id: 'autumn-porch',
    name: 'Autumn Porch',
    category: 'seasonal',
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1920&q=70',
    tags: ['seasonal', 'autumn'],
    personalization: { season: 'autumn', viewpoint: 'balcony', weather: 'dust' },
    sounds: ['wind', 'birds'],
  }),
  env({
    id: 'snowy-cabin',
    name: 'Snowy Cabin',
    category: 'seasonal',
    image:
      'https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=1920&q=70',
    tags: ['seasonal', 'winter', 'snow'],
    personalization: { season: 'winter', weather: 'snow', timeOfDay: 'night' },
    sounds: ['fire', 'wind'],
  }),
  env({
    id: 'spring-garden',
    name: 'Spring Garden',
    category: 'seasonal',
    image:
      'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1920&q=70',
    tags: ['seasonal', 'spring'],
    personalization: { season: 'spring', weather: 'none' },
    sounds: ['birds'],
  }),
  env({
    id: 'thunderstorm-window',
    name: 'Thunderstorm',
    category: 'seasonal',
    image:
      'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?auto=format&fit=crop&w=1920&q=70',
    video: 'https://assets.mixkit.co/videos/28085/28085-720.mp4',
    animated: true,
    tags: ['seasonal', 'storm', 'rain'],
    personalization: { weather: 'storm', timeOfDay: 'afternoon' },
    sounds: ['rain', 'thunder'],
  }),
  env({
    id: 'foggy-morning',
    name: 'Foggy Morning',
    category: 'seasonal',
    image:
      'https://images.unsplash.com/photo-1487621167305-5d248087c724?auto=format&fit=crop&w=1920&q=70',
    tags: ['seasonal', 'fog'],
    personalization: { weather: 'fog', timeOfDay: 'dawn' },
    sounds: ['wind'],
  }),
  env({
    id: 'golden-hour-desk',
    name: 'Golden Hour',
    category: 'seasonal',
    image:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1920&q=70',
    tags: ['seasonal', 'golden'],
    personalization: { timeOfDay: 'golden', weather: 'dust' },
    sounds: ['birds', 'keyboard'],
  }),
  env({
    id: 'blue-hour-city',
    name: 'Blue Hour City',
    category: 'seasonal',
    image:
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1920&q=70',
    tags: ['seasonal', 'blue'],
    personalization: { timeOfDay: 'blue', viewpoint: 'window' },
    sounds: ['white'],
  }),
  env({
    id: 'train-snowy-mountains',
    name: 'Train Through Snow',
    category: 'seasonal',
    image:
      'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1920&q=70',
    tags: ['seasonal', 'train', 'snow'],
    personalization: { season: 'winter', weather: 'snow', viewpoint: 'train' },
    sounds: ['train', 'wind'],
  }),
]

export const curatedEnvironments: FocusEnvironment[] = [...fromThemes, ...curatedExtras]

export const envCategories: { id: EnvCategory | 'all' | 'animated' | 'mine'; label: string }[] = [
  { id: 'animated', label: 'Live' },
  { id: 'all', label: 'All' },
  { id: 'mine', label: 'My AI' },
  { id: 'library', label: 'Libraries' },
  { id: 'cafe', label: 'Cafés' },
  { id: 'nature', label: 'Nature' },
  { id: 'city', label: 'Cities' },
  { id: 'fantasy', label: 'Fantasy' },
  { id: 'seasonal', label: 'Seasonal' },
  { id: 'desk', label: 'Desk' },
  { id: 'office', label: 'Office' },
]

export function findEnvironment(
  id: string,
  custom: FocusEnvironment[] = [],
): FocusEnvironment | undefined {
  return custom.find((e) => e.id === id) ?? curatedEnvironments.find((e) => e.id === id)
}
