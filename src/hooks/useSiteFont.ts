import { useEffect } from 'react'
import {
  fontStackFor,
  googleFontStylesheetUrl,
  isSystemFont,
  resolveSiteFontFamily,
} from '../data/fonts'
import { useAppStore } from '../store/useAppStore'

const LINK_ID = 'harbor-site-font'

function ensureFontLink(href: string) {
  let link = document.getElementById(LINK_ID) as HTMLLinkElement | null
  if (!href) {
    link?.remove()
    return
  }
  if (!link) {
    link = document.createElement('link')
    link.id = LINK_ID
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }
  if (link.href !== href) link.href = href
}

export function useSiteFont() {
  const siteFont = useAppStore((s) => s.settings.siteFont)
  const customFont = useAppStore((s) => s.settings.customFont)

  useEffect(() => {
    const family = resolveSiteFontFamily(siteFont, customFont)
    const stack = fontStackFor(family)
    const root = document.documentElement
    root.style.setProperty('--font-body', stack)
    root.style.setProperty('--font-display', stack)
    root.style.setProperty('--font-time', stack)
    root.dataset.siteFont = family

    if (isSystemFont(family)) {
      ensureFontLink('')
      return
    }

    ensureFontLink(googleFontStylesheetUrl(family))
  }, [siteFont, customFont])
}
