import type { MusicPlaylist } from '../types'

/**
 * Curated focus playlists — YouTube + Spotify embeds Harbor can load in one click.
 * Prefer calm, long-form focus music (lofi, classical, ambient, jazz).
 */
export const curatedPlaylists: MusicPlaylist[] = [
  {
    id: 'yt-lofi-girl',
    title: 'Lofi Girl',
    blurb: 'Classic chill beats to study / relax to',
    source: 'youtube',
    url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    mood: 'chill',
  },
  {
    id: 'yt-synthwave',
    title: 'Synthwave Radio',
    blurb: 'Retro night-drive energy for deep work',
    source: 'youtube',
    url: 'https://www.youtube.com/watch?v=4xDzrJKXOOY',
    mood: 'deep',
  },
  {
    id: 'yt-peaceful-piano',
    title: 'Peaceful Piano',
    blurb: 'Soft piano for calm concentration',
    source: 'youtube',
    url: 'https://www.youtube.com/watch?v=vPhg6sc1Mk4',
    mood: 'classical',
  },
  {
    id: 'yt-ambient-study',
    title: 'Ambient Study',
    blurb: 'Spacious ambient beds without vocals',
    source: 'youtube',
    url: 'https://www.youtube.com/watch?v=sjkrrmBnpGE',
    mood: 'ambient',
  },
  {
    id: 'yt-coffee-jazz',
    title: 'Coffee Shop Jazz',
    blurb: 'Warm jazz for café-mode focus',
    source: 'youtube',
    url: 'https://www.youtube.com/watch?v=Dx5qFachd3A',
    mood: 'jazz',
  },
  {
    id: 'yt-rainy-night',
    title: 'Rainy Night Coding',
    blurb: 'Gentle rain + soft beats',
    source: 'youtube',
    url: 'https://www.youtube.com/watch?v=mPZkdG3j2nk',
    mood: 'chill',
  },
  {
    id: 'sp-deep-focus',
    title: 'Deep Focus',
    blurb: 'Spotify’s instrumental deep-work mix',
    source: 'spotify',
    url: 'https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ',
    mood: 'deep',
  },
  {
    id: 'sp-lofi-beats',
    title: 'lofi beats',
    blurb: 'Chill lofi for studying and coding',
    source: 'spotify',
    url: 'https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn',
    mood: 'chill',
  },
  {
    id: 'sp-peaceful-piano',
    title: 'Peaceful Piano',
    blurb: 'Relaxing piano for quiet sessions',
    source: 'spotify',
    url: 'https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO',
    mood: 'classical',
  },
  {
    id: 'sp-jazz-vibes',
    title: 'Jazz Vibes',
    blurb: 'Smooth jazz without the chatter',
    source: 'spotify',
    url: 'https://open.spotify.com/playlist/37i9dQZF1DX0SM0LYsmbMT',
    mood: 'jazz',
  },
  {
    id: 'sp-brain-food',
    title: 'Brain Food',
    blurb: 'Electronic focus fuel',
    source: 'spotify',
    url: 'https://open.spotify.com/playlist/37i9dQZF1DWXLeA8Omikj7',
    mood: 'deep',
  },
  {
    id: 'sp-intense-studying',
    title: 'Intense Studying',
    blurb: 'Higher-energy instrumental study',
    source: 'spotify',
    url: 'https://open.spotify.com/playlist/37i9dQZF1DX8NTLI2TtZa6',
    mood: 'deep',
  },
]

export function findCuratedPlaylist(id: string) {
  return curatedPlaylists.find((p) => p.id === id)
}

export const playlistMoods = [
  { id: 'all', label: 'All' },
  { id: 'chill', label: 'Chill' },
  { id: 'deep', label: 'Deep' },
  { id: 'classical', label: 'Classical' },
  { id: 'ambient', label: 'Ambient' },
  { id: 'jazz', label: 'Jazz' },
] as const
