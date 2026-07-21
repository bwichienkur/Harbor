import { useEffect, useMemo, useState } from 'react'
import { EnvironmentAtmosphere } from './environment/EnvironmentAtmosphere'
import { findEnvironment } from '../data/environments'
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

function isDirectVideoUrl(raw: string) {
  try {
    const url = new URL(raw.trim())
    return /\.(mp4|webm|ogg)(\?|$)/i.test(url.pathname)
  } catch {
    return false
  }
}

export function Background() {
  const mode = useAppStore((s) => s.mode)
  const homeThemeId = useAppStore((s) => s.homeThemeId)
  const focusThemeId = useAppStore((s) => s.focusThemeId)
  const ambientThemeId = useAppStore((s) => s.ambientThemeId)
  const customBackground = useAppStore((s) => s.customBackground)
  const customEnvironments = useAppStore((s) => s.customEnvironments)
  const overlayStrength = useAppStore((s) => s.settings.overlayStrength)
  const autoOverlay = useAppStore((s) => s.settings.autoOverlay)
  const settings = useAppStore((s) => s.settings)
  const [brightness, setBrightness] = useState(0.45)

  const themeId =
    mode === 'focus' ? focusThemeId : mode === 'ambient' ? ambientThemeId : homeThemeId

  const environment = findEnvironment(themeId, customEnvironments)
  const theme = themes.find((t) => t.id === themeId) ?? themes[0]
  const image = customBackground || environment?.image || theme.image
  const personalization = environment?.personalization

  const customVideoUrl =
    mode === 'focus'
      ? settings.focusVideoUrl
      : mode === 'ambient'
        ? settings.ambientVideoUrl
        : settings.homeVideoUrl

  const themeVideo = environment?.video ?? theme.video ?? ''
  const activeVideo = customVideoUrl.trim() || (!customBackground ? themeVideo : '')
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

  const baseOverlay = customBackground
    ? overlayStrength
    : (personalization?.overlay ?? theme.overlay)
  const autoBoost = autoOverlay && !hasVideo ? Math.max(0, (brightness - 0.42) * 0.55) : 0
  const videoBias = hasVideo ? -0.12 : -0.04
  const overlay = Math.min(0.72, Math.max(0.12, baseOverlay + autoBoost + videoBias))

  const gradeFilter = personalization
    ? `brightness(${personalization.brightness}) saturate(${personalization.saturation}) blur(${personalization.blur}px)`
    : undefined

  return (
    <>
      {youtubeEmbed ? (
        <div className="bg-video" style={{ filter: gradeFilter }} aria-hidden>
          <iframe
            src={youtubeEmbed}
            title="Background video"
            allow="autoplay; encrypted-media"
            tabIndex={-1}
          />
        </div>
      ) : nativeVideo ? (
        <div className="bg-video bg-video-native" style={{ filter: gradeFilter }} aria-hidden>
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
        <div
          className="bg-layer"
          style={{ backgroundImage: `url(${image})`, filter: gradeFilter }}
          aria-hidden
        />
      )}
      {personalization && (
        <EnvironmentAtmosphere personalization={personalization} active={!customBackground} />
      )}
      <div className="bg-overlay" style={{ opacity: overlay }} aria-hidden />
      <div className="grain" aria-hidden />
    </>
  )
}
