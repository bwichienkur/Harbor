import type { Theme, ThemeCategory } from '../types'
import { mixkit, resolveThemeMedia, type ThemeMediaRef } from './themeMedia'

/**
 * Theme philosophy
 * ----------------
 * Themes never compete with app content. Motion is so gentle that after a few
 * minutes you barely notice it — yet the room still feels alive.
 *
 * Prefer: rain, clouds, steam, fire flicker, snow, leaves, soft water, distant life.
 * Avoid: camera moves, zooms, flashes, fast cuts, large foreground motion.
 *
 * Sources are Mixkit loops today; swap via `themeMedia` providers later.
 */

type ThemeDraft = {
  id: string
  name: string
  category: ThemeCategory
  overlay: number
  media: ThemeMediaRef
  /** Short note on the ambient motion (for curation / docs). */
  motion: string
}

function defineTheme(draft: ThemeDraft): Theme {
  const { video, image } = resolveThemeMedia(draft.media)
  return {
    id: draft.id,
    name: draft.name,
    category: draft.category,
    overlay: draft.overlay,
    image,
    video,
    animated: true,
    motion: draft.motion,
  }
}

const drafts: ThemeDraft[] = [
  // —— Nature ——
  {
    id: 'forest-cabin',
    name: 'Forest Cabin',
    category: 'nature',
    overlay: 0.4,
    media: mixkit('2738'),
    motion: 'Soft rain around a quiet cabin roof',
  },
  {
    id: 'mountain-lake',
    name: 'Mountain Lake',
    category: 'nature',
    overlay: 0.38,
    media: mixkit('9598'),
    motion: 'Still water with autumn leaves along the shore',
  },
  {
    id: 'beach-sunrise',
    name: 'Beach Sunrise',
    category: 'nature',
    overlay: 0.36,
    media: mixkit('25163'),
    motion: 'Gentle waves and slow sunlight on the water',
  },
  {
    id: 'beach-sunset',
    name: 'Beach Sunset',
    category: 'nature',
    overlay: 0.4,
    media: mixkit('44496'),
    motion: 'Calm shore under a fading sunset sky',
  },
  {
    id: 'rainy-forest',
    name: 'Rainy Forest',
    category: 'nature',
    overlay: 0.42,
    media: mixkit('6890'),
    motion: 'Tropical canopy under steady, soft rain',
  },
  {
    id: 'waterfall',
    name: 'Waterfall',
    category: 'nature',
    overlay: 0.4,
    media: mixkit('2186'),
    motion: 'Water slipping over mossy stones',
  },
  {
    id: 'autumn-park',
    name: 'Autumn Park',
    category: 'nature',
    overlay: 0.38,
    media: mixkit('14911'),
    motion: 'Sunlit autumn trees with quiet leaf motion',
  },
  {
    id: 'snowy-cabin',
    name: 'Snowy Cabin',
    category: 'nature',
    overlay: 0.36,
    media: mixkit('2571'),
    motion: 'Snow settling around a small winter cabin',
  },
  {
    id: 'japanese-garden',
    name: 'Japanese Garden',
    category: 'nature',
    overlay: 0.34,
    media: mixkit('48889'),
    motion: 'Cherry blossoms drifting in a soft breeze',
  },
  {
    id: 'alpine-lodge',
    name: 'Alpine Lodge',
    category: 'nature',
    overlay: 0.4,
    media: mixkit('4396'),
    motion: 'Fog drifting across snowy mountain ridges',
  },

  // —— Coffee shops ——
  {
    id: 'cozy-rain-cafe',
    name: 'Cozy Rain Café',
    category: 'cafe',
    overlay: 0.44,
    media: mixkit('2846'),
    motion: 'Rain on glass with a warm café glow beyond',
  },
  {
    id: 'paris-cafe',
    name: 'Paris Café',
    category: 'cafe',
    overlay: 0.42,
    media: mixkit('4348'),
    motion: 'Quiet Paris street atmosphere, soft ambient life',
  },
  {
    id: 'tokyo-cafe',
    name: 'Tokyo Café',
    category: 'cafe',
    overlay: 0.46,
    media: mixkit('4451'),
    motion: 'Quiet nighttime Tokyo street, distant calm lights',
  },
  {
    id: 'scandinavian-coffee-shop',
    name: 'Scandinavian Coffee Shop',
    category: 'cafe',
    overlay: 0.4,
    media: mixkit('808'),
    motion: 'Coffee steam rising from a still mug',
  },
  {
    id: 'book-cafe',
    name: 'Book Café',
    category: 'cafe',
    overlay: 0.42,
    media: mixkit('21594'),
    motion: 'Open books on a table — barely-there stillness',
  },
  {
    id: 'mountain-coffee-shop',
    name: 'Mountain Coffee Shop',
    category: 'cafe',
    overlay: 0.42,
    media: mixkit('14218'),
    motion: 'Warm drink poured in a cabin woods setting',
  },
  {
    id: 'coastal-cafe',
    name: 'Coastal Café',
    category: 'cafe',
    overlay: 0.38,
    media: mixkit('1954'),
    motion: 'Soft bay waves, fixed shoreline view',
  },

  // —— Libraries ——
  {
    id: 'historic-library',
    name: 'Historic Library',
    category: 'library',
    overlay: 0.48,
    media: mixkit('48574'),
    motion: 'Dim archive stacks — quiet, nearly still',
  },
  {
    id: 'modern-university-library',
    name: 'Modern University Library',
    category: 'library',
    overlay: 0.44,
    media: mixkit('50729'),
    motion: 'Shelves of books in soft indoor light',
  },
  {
    id: 'fireplace-library',
    name: 'Fireplace Library',
    category: 'library',
    overlay: 0.46,
    media: mixkit('1242'),
    motion: 'Gentle fireplace flicker',
  },
  {
    id: 'rainy-reading-room',
    name: 'Rainy Reading Room',
    category: 'library',
    overlay: 0.4,
    media: mixkit('28085'),
    motion: 'Rain beyond an open window',
  },
  {
    id: 'japanese-reading-room',
    name: 'Japanese Reading Room',
    category: 'library',
    overlay: 0.44,
    media: mixkit('4109'),
    motion: 'Paper lantern glow, soft ambient hush',
  },
  {
    id: 'castle-library',
    name: 'Castle Library',
    category: 'library',
    overlay: 0.4,
    media: mixkit('4074'),
    motion: 'Castle grounds and garden, calm outdoor stillness',
  },

  // —— Home offices ——
  {
    id: 'cozy-apartment',
    name: 'Cozy Apartment',
    category: 'office',
    overlay: 0.42,
    media: mixkit('4029'),
    motion: 'Quiet apartment interior with terrace light',
  },
  {
    id: 'loft-workspace',
    name: 'Loft Workspace',
    category: 'office',
    overlay: 0.44,
    media: mixkit('1749'),
    motion: 'Calm desk setup with coffee — soft room presence',
  },
  {
    id: 'window-desk',
    name: 'Window Desk',
    category: 'office',
    overlay: 0.4,
    media: mixkit('14606'),
    motion: 'Study seat by the window, distant outdoor hush',
  },
  {
    id: 'minimal-scandinavian-office',
    name: 'Minimal Scandinavian Office',
    category: 'office',
    overlay: 0.4,
    media: mixkit('914'),
    motion: 'Open, airy workspace with restrained motion',
  },
  {
    id: 'luxury-penthouse-office',
    name: 'Luxury Penthouse Office',
    category: 'office',
    overlay: 0.44,
    media: mixkit('14279'),
    motion: 'High window city view — distant, slow life outside',
  },
]

export const themes: Theme[] = drafts.map(defineTheme)

export const themeCategories: { id: ThemeCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'nature', label: 'Nature' },
  { id: 'cafe', label: 'Coffee Shops' },
  { id: 'library', label: 'Libraries' },
  { id: 'office', label: 'Home Offices' },
]

export const themeImageUrls = themes.map((t) => t.image)
export const animatedThemes = themes.filter((t) => t.animated && t.video)

export const defaultThemeIds = {
  home: 'window-desk',
  focus: 'cozy-rain-cafe',
  ambient: 'rainy-forest',
} as const
