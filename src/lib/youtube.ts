export function extractYoutubeId(raw: string): string | null {
  try {
    const url = new URL(raw.trim())
    if (url.hostname.includes('youtu.be')) {
      const id = url.pathname.split('/').filter(Boolean)[0]
      return id || null
    }
    if (url.hostname.includes('youtube.com')) {
      const list = url.searchParams.get('list')
      // Prefer a concrete video when present; playlist-only handled separately.
      const v = url.searchParams.get('v')
      if (v) return v
      const parts = url.pathname.split('/').filter(Boolean)
      if (parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live') {
        return parts[1] || null
      }
      if (parts[0] === 'playlist' && list) return null
    }
  } catch {
    return null
  }
  return null
}

export function extractYoutubePlaylistId(raw: string): string | null {
  try {
    const url = new URL(raw.trim())
    if (!url.hostname.includes('youtube.com') && !url.hostname.includes('youtu.be')) return null
    return url.searchParams.get('list')
  } catch {
    return null
  }
}

export function toYoutubeEmbed(raw: string, opts?: { background?: boolean }) {
  const id = extractYoutubeId(raw)
  if (id) {
    if (opts?.background) {
      return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&playsinline=1&modestbranding=1&rel=0`
    }
    return `https://www.youtube.com/embed/${id}?autoplay=0`
  }
  const list = extractYoutubePlaylistId(raw)
  if (list && !opts?.background) {
    return `https://www.youtube.com/embed/videoseries?list=${list}`
  }
  return ''
}

export function toSpotifyEmbed(raw: string) {
  try {
    const url = new URL(raw.trim())
    if (!url.hostname.includes('spotify.com')) return ''
    // https://open.spotify.com/playlist/xxx -> embed
    const parts = url.pathname.split('/').filter(Boolean)
    if (parts.length >= 2) {
      return `https://open.spotify.com/embed/${parts[0]}/${parts[1]}?utm_source=generator`
    }
  } catch {
    return ''
  }
  return ''
}
