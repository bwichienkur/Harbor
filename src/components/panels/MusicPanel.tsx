import { Pin, PinOff } from 'lucide-react'
import { useMemo, useState } from 'react'
import { curatedPlaylists, playlistMoods } from '../../data/playlists'
import { toSpotifyEmbed, toYoutubeEmbed } from '../../lib/youtube'
import { useAppStore } from '../../store/useAppStore'
import type { MusicMood, MusicPlaylist, MusicSource } from '../../types'

export function MusicPanel() {
  const youtubeUrl = useAppStore((s) => s.settings.youtubeUrl)
  const spotifyUrl = useAppStore((s) => s.settings.spotifyUrl)
  const pinnedPlaylistIds = useAppStore((s) => s.pinnedPlaylistIds)
  const customPlaylists = useAppStore((s) => s.customPlaylists)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const togglePinnedPlaylist = useAppStore((s) => s.togglePinnedPlaylist)
  const pinCustomPlaylist = useAppStore((s) => s.pinCustomPlaylist)
  const removeCustomPlaylist = useAppStore((s) => s.removeCustomPlaylist)
  const applyMusicPlaylist = useAppStore((s) => s.applyMusicPlaylist)

  const [ytDraft, setYtDraft] = useState(youtubeUrl)
  const [spDraft, setSpDraft] = useState(spotifyUrl)
  const [mood, setMood] = useState<(typeof playlistMoods)[number]['id']>('all')

  const ytEmbed = useMemo(() => toYoutubeEmbed(youtubeUrl), [youtubeUrl])
  const spEmbed = useMemo(() => toSpotifyEmbed(spotifyUrl), [spotifyUrl])

  const pinnedCurated = curatedPlaylists.filter((p) => pinnedPlaylistIds.includes(p.id))
  const library = curatedPlaylists.filter((p) => (mood === 'all' ? true : p.mood === mood))

  const activeUrl = (source: MusicSource) => (source === 'youtube' ? youtubeUrl : spotifyUrl)

  const pinCurrent = (source: MusicSource) => {
    const url = (source === 'youtube' ? ytDraft || youtubeUrl : spDraft || spotifyUrl).trim()
    if (!url) return
    const ok = source === 'youtube' ? Boolean(toYoutubeEmbed(url)) : Boolean(toSpotifyEmbed(url))
    if (!ok) return
    pinCustomPlaylist({
      title: source === 'youtube' ? 'Pinned YouTube' : 'Pinned Spotify',
      blurb: 'Saved from your URL',
      source,
      url,
      mood: 'chill',
    })
  }

  return (
    <div className="panel-section">
      <p className="helper">
        Pick a curated focus playlist, pin favorites, or paste your own YouTube / Spotify link.
        Ambient soundscapes stay under Sounds.
      </p>

      {(pinnedCurated.length > 0 || customPlaylists.length > 0) && (
        <div className="panel-section music-section">
          <h3 className="panel-subhead">Pinned</h3>
          <div className="playlist-grid">
            {[...customPlaylists, ...pinnedCurated].map((playlist) => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                active={activeUrl(playlist.source) === playlist.url}
                pinned
                onPlay={() => applyMusicPlaylist(playlist)}
                onTogglePin={() =>
                  playlist.custom
                    ? removeCustomPlaylist(playlist.id)
                    : togglePinnedPlaylist(playlist.id)
                }
              />
            ))}
          </div>
        </div>
      )}

      <div className="panel-section music-section">
        <div className="duration-label-row">
          <h3 className="panel-subhead">Curated</h3>
        </div>
        <div className="eta-row">
          {playlistMoods.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`chip ${mood === m.id ? 'active' : ''}`}
              onClick={() => setMood(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="playlist-grid">
          {library.map((playlist) => {
            const pinned = pinnedPlaylistIds.includes(playlist.id)
            return (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                active={activeUrl(playlist.source) === playlist.url}
                pinned={pinned}
                onPlay={() => applyMusicPlaylist(playlist)}
                onTogglePin={() => togglePinnedPlaylist(playlist.id)}
              />
            )
          })}
        </div>
      </div>

      <div className="panel-section music-section">
        <h3 className="panel-subhead">Custom URL</h3>
        <div className="field">
          <label htmlFor="yt">YouTube URL</label>
          <input
            id="yt"
            value={ytDraft}
            onChange={(e) => setYtDraft(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=…"
          />
        </div>
        <div className="timer-controls">
          <button
            className="btn primary"
            type="button"
            onClick={() => {
              updateSettings({ youtubeUrl: ytDraft.trim() })
            }}
          >
            Load YouTube
          </button>
          <button className="btn" type="button" onClick={() => pinCurrent('youtube')}>
            Pin current
          </button>
        </div>
        {ytEmbed ? (
          <iframe
            className="music-frame"
            src={ytEmbed}
            title="Focus music"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <p className="helper">No YouTube URL loaded yet.</p>
        )}

        <div className="field">
          <label htmlFor="spotify">Spotify playlist / album / track URL</label>
          <input
            id="spotify"
            value={spDraft}
            onChange={(e) => setSpDraft(e.target.value)}
            placeholder="https://open.spotify.com/playlist/…"
          />
        </div>
        <div className="timer-controls">
          <button
            className="btn primary"
            type="button"
            onClick={() => updateSettings({ spotifyUrl: spDraft.trim() })}
          >
            Load Spotify
          </button>
          <button className="btn" type="button" onClick={() => pinCurrent('spotify')}>
            Pin current
          </button>
        </div>
        {spEmbed ? (
          <iframe
            className="music-frame spotify"
            src={spEmbed}
            title="Spotify player"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        ) : (
          <p className="helper">Paste an open.spotify.com link to embed a player.</p>
        )}
      </div>
    </div>
  )
}

function PlaylistCard({
  playlist,
  active,
  pinned,
  onPlay,
  onTogglePin,
}: {
  playlist: MusicPlaylist
  active: boolean
  pinned: boolean
  onPlay: () => void
  onTogglePin: () => void
}) {
  return (
    <div className={`playlist-card ${active ? 'active' : ''}`}>
      <button type="button" className="playlist-card-main" onClick={onPlay}>
        <em className="playlist-source">{playlist.source === 'youtube' ? 'YouTube' : 'Spotify'}</em>
        <strong>{playlist.title}</strong>
        <span>{playlist.blurb}</span>
        <small className="playlist-mood">{moodLabel(playlist.mood)}</small>
      </button>
      <button
        type="button"
        className={`playlist-pin ${pinned ? 'on' : ''}`}
        aria-label={pinned ? `Unpin ${playlist.title}` : `Pin ${playlist.title}`}
        title={pinned ? 'Unpin' : 'Pin'}
        onClick={onTogglePin}
      >
        {pinned ? <PinOff size={15} /> : <Pin size={15} />}
      </button>
    </div>
  )
}

function moodLabel(mood: MusicMood) {
  return mood.charAt(0).toUpperCase() + mood.slice(1)
}
