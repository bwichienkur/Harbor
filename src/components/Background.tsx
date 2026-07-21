import { useEffect, useMemo, useState } from 'react'
import { themes } from '../data/themes'
import { extractYoutubeId, toYoutubeEmbed } from '../lib/youtube'
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

export function isDirectVideoUrl(raw: string) {
  try {
    const url = new URL(raw.trim())
    return /\.(mp4|webm|ogg)(\?|$)/i.test(url.pathname)
  } catch {
    return false
  }
}

/** Resolve the active visual theme for the current (or given) mode. */
export function useActiveThemeMedia(forceMode?: 'home' | 'focus' | 'ambient') {
  const mode = useAppStore((s) => forceMode ?? s.mode)
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

  const customVideoUrl =
    mode === 'focus'
      ? settings.focusVideoUrl
      : mode === 'ambient'
        ? settings.ambientVideoUrl
        : settings.homeVideoUrl

  const activeVideo = customVideoUrl.trim() || (!customBackground ? theme.video ?? '' : '')
  const youtubeEmbed = useMemo(
    () => (extractYoutubeId(activeVideo) ? toYoutubeEmbed(activeVideo, { background: true }) : ''),
    [activeVideo],
  )
  const nativeVideo = !youtubeEmbed && isDirectVideoUrl(activeVideo) ? activeVideo : ''
  const hasVideo = Boolean(youtubeEmbed || nativeVideo)

  useEffect(() => {
    if (hasVideo || !autoOverlay) return
    let cancelled = false
    void estimateBrightness(image).then((b) => {
      if (!cancelled) setBrightness(b)
    })
    return () => {
      cancelled = true
    }
  }, [image, hasVideo, autoOverlay])

  const baseOverlay = overlayStrength
  // Per-theme bias around the catalog's light-overlay target (~0.22)
  const themeBias = (theme.overlay - 0.22) * 0.45
  const autoBoost = autoOverlay && !hasVideo ? Math.max(0, (brightness - 0.42) * 0.4) : 0
  // Live video already needs less veil to stay close to the Mixkit source
  const videoBias = hasVideo ? -0.1 : -0.02
  const overlay = Math.min(0.58, Math.max(0.04, baseOverlay + themeBias + autoBoost + videoBias))

  return {
    theme,
    image,
    youtubeEmbed,
    nativeVideo,
    hasVideo,
    overlay,
  }
}

export function Background() {
  const { image, youtubeEmbed, nativeVideo, overlay } = useActiveThemeMedia()

  return (
    <>
      {youtubeEmbed ? (
        <div className="bg-video" aria-hidden>
          <iframe
            src={youtubeEmbed}
            title="Background video"
            allow="autoplay; encrypted-media"
            tabIndex={-1}
          />
        </div>
      ) : nativeVideo ? (
        <div className="bg-video bg-video-native" aria-hidden>
          <video
            key={nativeVideo}
            src={nativeVideo}
            poster={image}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
        </div>
      ) : (
        <div className="bg-layer" style={{ backgroundImage: `url(${image})` }} aria-hidden />
      )}
      <div className="bg-overlay" style={{ opacity: overlay }} aria-hidden />
      <div className="grain" aria-hidden />
    </>
  )
}
