/** Built-in font choices. Values are CSS font-family names (loaded from Google Fonts unless system). */
export const siteFontPresets = [
  { id: 'Manrope', label: 'Manrope (Flocus)', google: true },
  { id: 'Inter', label: 'Inter', google: true },
  { id: 'Figtree', label: 'Figtree', google: true },
  { id: 'Space Grotesk', label: 'Space Grotesk', google: true },
  { id: 'Syne', label: 'Syne', google: true },
  { id: 'DM Sans', label: 'DM Sans', google: true },
  { id: 'Outfit', label: 'Outfit', google: true },
  { id: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans', google: true },
  { id: 'Nunito', label: 'Nunito', google: true },
  { id: 'Poppins', label: 'Poppins', google: true },
  { id: 'Rubik', label: 'Rubik', google: true },
  { id: 'Work Sans', label: 'Work Sans', google: true },
  { id: 'Lora', label: 'Lora', google: true },
  { id: 'IBM Plex Sans', label: 'IBM Plex Sans', google: true },
  { id: 'system-ui', label: 'System UI', google: false },
  { id: 'Georgia', label: 'Georgia', google: false },
  { id: 'custom', label: 'Custom font…', google: false },
] as const

export type SiteFontPresetId = (typeof siteFontPresets)[number]['id']

const SYSTEM_FONTS = new Set([
  'system-ui',
  'sans-serif',
  'serif',
  'monospace',
  'ui-sans-serif',
  'ui-serif',
  'ui-monospace',
  'Georgia',
  'Times New Roman',
  'Arial',
  'Helvetica',
  'Verdana',
  'Tahoma',
  'Trebuchet MS',
  'Courier New',
  'Menlo',
  'Monaco',
])

export function isSystemFont(family: string) {
  return SYSTEM_FONTS.has(family.trim())
}

/** Build a Google Fonts CSS2 URL for a family name. */
export function googleFontStylesheetUrl(family: string) {
  const cleaned = family.trim().replace(/\s+/g, ' ')
  if (!cleaned || isSystemFont(cleaned)) return ''
  const param = cleaned.replace(/ /g, '+')
  return `https://fonts.googleapis.com/css2?family=${param}:wght@400;500;600;700;800&display=swap`
}

/** Preload several Google Font families (e.g. for font-picker hover previews). */
export function preloadGoogleFonts(families: string[]) {
  const unique = [
    ...new Set(
      families
        .map((f) => f.trim().replace(/\s+/g, ' '))
        .filter((f) => f && f !== 'custom' && !isSystemFont(f)),
    ),
  ]
  if (!unique.length) return

  const href = `https://fonts.googleapis.com/css2?${unique
    .map((f) => `family=${f.replace(/ /g, '+')}:wght@400;500;600;700;800`)
    .join('&')}&display=swap`

  const id = 'harbor-font-preview-preload'
  let link = document.getElementById(id) as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }
  if (link.href !== href) link.href = href
}

export function resolveSiteFontFamily(siteFont: string, customFont: string) {
  if (siteFont === 'custom') {
    const custom = customFont.trim()
    return custom || 'Manrope'
  }
  return siteFont.trim() || 'Manrope'
}

export function fontStackFor(family: string) {
  const name = family.trim() || 'Manrope'
  if (name === 'system-ui') {
    return 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  }
  if (isSystemFont(name)) {
    return `"${name}", system-ui, sans-serif`
  }
  return `"${name}", system-ui, sans-serif`
}

const SITE_FONT_LINK_ID = 'harbor-site-font'

function ensureSiteFontLink(href: string) {
  let link = document.getElementById(SITE_FONT_LINK_ID) as HTMLLinkElement | null
  if (!href) {
    link?.remove()
    return
  }
  if (!link) {
    link = document.createElement('link')
    link.id = SITE_FONT_LINK_ID
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }
  if (link.href !== href) link.href = href
}

/** Apply a font family to the whole app via CSS variables (and load Google Fonts if needed). */
export function applySiteFontFamily(family: string) {
  const stack = fontStackFor(family)
  const root = document.documentElement
  root.style.setProperty('--font-body', stack)
  root.style.setProperty('--font-display', stack)
  root.style.setProperty('--font-time', stack)
  root.dataset.siteFont = family.trim() || 'Manrope'

  if (isSystemFont(family)) {
    ensureSiteFontLink('')
    return
  }
  ensureSiteFontLink(googleFontStylesheetUrl(family))
}
