import { useEffect } from 'react'
import { applySiteFontFamily, resolveSiteFontFamily } from '../data/fonts'
import { useAppStore } from '../store/useAppStore'

export function useSiteFont() {
  const siteFont = useAppStore((s) => s.settings.siteFont)
  const customFont = useAppStore((s) => s.settings.customFont)

  useEffect(() => {
    applySiteFontFamily(resolveSiteFontFamily(siteFont, customFont))
  }, [siteFont, customFont])
}
