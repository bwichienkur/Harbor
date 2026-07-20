import { useEffect, useMemo, useState } from 'react'
import { themes } from '../data/themes'
import { toYoutubeEmbed } from '../lib/youtube'
import { useAppStore } from '../store/useAppStore'

async function estimateBrightness(src: string): Promise<number> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const size = 24
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) {
          resolve(0.5)
          return
        }
        ctx.drawImage(img, 0, 0, size, size)
        const data = ctx.getImageData(0, 0, size, size).data
        let sum = 0
        for (let i = 0; i < data.length; i += 4) {
          sum += (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255
        }
        resolve(sum / (data.length / 4))
      } catch {
        resolve(0.5)
      }
    }
    img.onerror = () => resolve(0.5)
    img.src = src
  })
}

export function Background() {
  const mode = useAppStore((s) => s.mode)
  const homeThemeId = useAppStore((s) => s.homeThemeId)
  const focusThemeId = useAppStore((s) => s.focusThemeId)
  const ambientThemeId = useAppStore((s) => s.ambientThemeId)
  const customBackground = useAppStore((s) => s.customBackground)
  const overlayStrength = useAppStore((s) => s.settings.overlayStrength)
  const autoOverlay = useAppStore((s) => s.settings.autoOverlay)
  const settings = useAppStore((s) => s.settings)
  const [brightness, setBrightness] = useState(0.45)

  const themeId =
    mode === 'focus' ? focusThemeId : mode === 'ambient' ? ambientThemeId : homeThemeId
  const theme = themes.find((t) => t.id === themeId) ?? themes[0]
  const image = customBackground || theme.image

  const videoUrl =
    mode === 'focus'
      ? settings.focusVideoUrl
      : mode === 'ambient'
        ? settings.ambientVideoUrl
        : settings.homeVideoUrl

  const embed = useMemo(() => toYoutubeEmbed(videoUrl, { background: true }), [videoUrl])

  useEffect(() => {
    if (embed || !autoOverlay) return
    let cancelled = false
    void estimateBrightness(image).then((b) => {
      if (!cancelled) setBrightness(b)
    })
    return () => {
      cancelled = true
    }
  }, [image, embed, autoOverlay])

  const baseOverlay = customBackground ? overlayStrength : theme.overlay
  const autoBoost = autoOverlay && !embed ? Math.max(0, (brightness - 0.42) * 0.55) : 0
  const overlay = Math.min(0.88, Math.max(0.18, baseOverlay + autoBoost))

  return (
    <>
      {embed ? (
        <div className="bg-video" aria-hidden>
          <iframe
            src={embed}
            title="Background video"
            allow="autoplay; encrypted-media"
            tabIndex={-1}
          />
        </div>
      ) : (
        <div
          className="bg-layer"
          style={{ backgroundImage: `url(${image})` }}
          aria-hidden
        />
      )}
      <div className="bg-overlay" style={{ opacity: overlay }} aria-hidden />
      <div className="grain" aria-hidden />
    </>
  )
}
