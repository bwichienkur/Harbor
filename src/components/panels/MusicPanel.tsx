import { useMemo, useState } from 'react'
import { toSpotifyEmbed, toYoutubeEmbed } from '../../lib/youtube'
import { useAppStore } from '../../store/useAppStore'

export function MusicPanel() {
  const youtubeUrl = useAppStore((s) => s.settings.youtubeUrl)
  const spotifyUrl = useAppStore((s) => s.settings.spotifyUrl)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const [ytDraft, setYtDraft] = useState(youtubeUrl)
  const [spDraft, setSpDraft] = useState(spotifyUrl)
  const ytEmbed = useMemo(() => toYoutubeEmbed(youtubeUrl), [youtubeUrl])
  const spEmbed = useMemo(() => toSpotifyEmbed(spotifyUrl), [spotifyUrl])

  return (
    <div className="panel-section">
      <p className="helper">
        Load focus music from YouTube or Spotify. Ambient soundscapes stay available under Sounds.
      </p>

      <div className="field">
        <label htmlFor="yt">YouTube URL</label>
        <input
          id="yt"
          value={ytDraft}
          onChange={(e) => setYtDraft(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=…"
        />
      </div>
      <button
        className="btn primary"
        onClick={() => updateSettings({ youtubeUrl: ytDraft.trim() })}
      >
        Load YouTube
      </button>
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
      <button
        className="btn primary"
        onClick={() => updateSettings({ spotifyUrl: spDraft.trim() })}
      >
        Load Spotify
      </button>
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
  )
}
