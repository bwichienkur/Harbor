/**
 * Theme media providers — swap the backend without rewriting the catalog.
 *
 * Current default: Mixkit CDN (`assets.mixkit.co`).
 * Later: point themes at `hosted` refs + set `VITE_THEME_MEDIA_BASE`,
 * or use `url` refs for fully custom assets / original loops.
 */

export type ThemeMediaProviderId = 'mixkit' | 'hosted' | 'url'

/** Mixkit clip referenced by numeric asset id (from mixkit.co URLs). */
export type MixkitMediaRef = {
  provider: 'mixkit'
  /** e.g. "2738" from `/free-stock-video/cabin-on-rainy-day-2738/` */
  id: string
  quality?: '360' | '720'
}

/** Self-hosted or CDN-relative paths under `VITE_THEME_MEDIA_BASE` (default `/themes`). */
export type HostedMediaRef = {
  provider: 'hosted'
  /** Path relative to the media base, e.g. `nature/forest-cabin.mp4` */
  videoPath: string
  /** Optional poster; defaults to same path with `.jpg` */
  posterPath?: string
}

/** Absolute URLs — escape hatch for one-offs. */
export type UrlMediaRef = {
  provider: 'url'
  video: string
  image: string
}

export type ThemeMediaRef = MixkitMediaRef | HostedMediaRef | UrlMediaRef

const MIXKIT_CDN = 'https://assets.mixkit.co/videos'

function hostedBase() {
  const raw = (import.meta.env.VITE_THEME_MEDIA_BASE as string | undefined)?.trim()
  return (raw && raw.length > 0 ? raw : '/themes').replace(/\/$/, '')
}

/** Resolve a media ref into concrete playable + poster URLs. */
export function resolveThemeMedia(ref: ThemeMediaRef): { video: string; image: string } {
  switch (ref.provider) {
    case 'mixkit': {
      const quality = ref.quality ?? '720'
      const id = ref.id
      return {
        video: `${MIXKIT_CDN}/${id}/${id}-${quality}.mp4`,
        image: `${MIXKIT_CDN}/${id}/${id}-thumb-720-0.jpg`,
      }
    }
    case 'hosted': {
      const base = hostedBase()
      const poster =
        ref.posterPath ??
        ref.videoPath.replace(/\.(mp4|webm|ogg)$/i, '.jpg')
      return {
        video: `${base}/${ref.videoPath.replace(/^\//, '')}`,
        image: `${base}/${poster.replace(/^\//, '')}`,
      }
    }
    case 'url':
      return { video: ref.video, image: ref.image }
  }
}

/** Convenience helper for Mixkit catalog entries. */
export function mixkit(id: string, quality: MixkitMediaRef['quality'] = '720'): MixkitMediaRef {
  return { provider: 'mixkit', id, quality }
}
