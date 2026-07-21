import { useEffect, useRef } from 'react'
import { useActiveThemeMedia } from './Background'
import { formatTimer } from '../lib/format'
import { useAppStore } from '../store/useAppStore'

declare global {
  interface Window {
    documentPictureInPicture?: {
      requestWindow: (options?: { width?: number; height?: number }) => Promise<Window>
    }
  }
}

function renderPipDocument(
  win: Window,
  opts: {
    image: string
    nativeVideo: string
    youtubeEmbed: string
    label: string
    phase: string
  },
) {
  const siteFont =
    getComputedStyle(document.documentElement).getPropertyValue('--font-body').trim() ||
    'Manrope, system-ui, sans-serif'
  const media = opts.youtubeEmbed
    ? `<iframe src="${opts.youtubeEmbed}" title="Theme" allow="autoplay; encrypted-media" tabindex="-1"></iframe>`
    : opts.nativeVideo
      ? `<video src="${opts.nativeVideo}" poster="${opts.image}" autoplay muted loop playsinline></video>`
      : `<div class="still" style="background-image:url('${opts.image}')"></div>`

  win.document.body.innerHTML = `
    <style>
      html,body{margin:0;height:100%;overflow:hidden;font-family:${siteFont};color:#f4f1ea}
      .wrap{position:relative;width:100%;height:100%;display:grid;place-items:center}
      .media,.media iframe,.media video,.still{
        position:absolute;inset:0;width:100%;height:100%;border:0;object-fit:cover;pointer-events:none
      }
      .still{background-size:cover;background-position:center}
      .shade{
        position:absolute;inset:0;
        background:linear-gradient(180deg,rgba(8,14,14,.28),rgba(8,14,14,.62));
        pointer-events:none
      }
      .ui{position:relative;z-index:1;text-align:center;text-shadow:0 2px 16px rgba(0,0,0,.55)}
      .s{opacity:.8;font-size:11px;text-transform:uppercase;letter-spacing:.14em;margin-bottom:4px}
      .t{font-size:40px;font-weight:700;letter-spacing:-0.03em;font-variant-numeric:tabular-nums}
    </style>
    <div class="wrap">
      <div class="media">${media}</div>
      <div class="shade"></div>
      <div class="ui">
        <div class="s" id="phase">${opts.phase}</div>
        <div class="t" id="time">${opts.label}</div>
      </div>
    </div>
  `
}

export function MiniTimer() {
  const miniTimer = useAppStore((s) => s.miniTimer)
  const setMiniTimer = useAppStore((s) => s.setMiniTimer)
  const running = useAppStore((s) => s.running)
  const phase = useAppStore((s) => s.phase)
  const remainingMs = useAppStore((s) => s.remainingMs)
  const elapsedMs = useAppStore((s) => s.elapsedMs)
  const timerMode = useAppStore((s) => s.timerSettings.mode)
  const startTimer = useAppStore((s) => s.startTimer)
  const pauseTimer = useAppStore((s) => s.pauseTimer)
  const { image, youtubeEmbed, nativeVideo } = useActiveThemeMedia()
  const pipWin = useRef<Window | null>(null)
  const mediaKey = `${youtubeEmbed}|${nativeVideo}|${image}`

  const displayMs = timerMode === 'stopwatch' ? elapsedMs : remainingMs
  const label = formatTimer(displayMs / 1000)

  useEffect(() => {
    if (!miniTimer) {
      pipWin.current?.close()
      pipWin.current = null
      return
    }

    let cancelled = false

    const mount = async () => {
      if (!window.documentPictureInPicture) return
      try {
        const win = await window.documentPictureInPicture.requestWindow({
          width: 320,
          height: 200,
        })
        if (cancelled) {
          win.close()
          return
        }
        pipWin.current = win
        renderPipDocument(win, { image, nativeVideo, youtubeEmbed, label, phase })
        win.addEventListener('pagehide', () => {
          setMiniTimer(false)
          pipWin.current = null
        })
      } catch {
        /* PiP unsupported or blocked — overlay fallback remains */
      }
    }

    void mount()
    return () => {
      cancelled = true
      pipWin.current?.close()
      pipWin.current = null
    }
    // Open once when mini timer turns on; theme updates handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [miniTimer, setMiniTimer])

  useEffect(() => {
    const win = pipWin.current
    if (!win || !miniTimer) return
    renderPipDocument(win, { image, nativeVideo, youtubeEmbed, label, phase })
    // Only rebuild when theme media changes — timer digits update separately.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaKey, miniTimer])

  useEffect(() => {
    const doc = pipWin.current?.document
    if (!doc) return
    const time = doc.getElementById('time')
    const phaseEl = doc.getElementById('phase')
    if (time) time.textContent = label
    if (phaseEl) phaseEl.textContent = phase
  }, [label, phase])

  if (!miniTimer) return null

  return (
    <div className="mini-timer mini-timer-themed" role="dialog" aria-label="Mini timer">
      <div className="mini-timer-media" aria-hidden>
        {youtubeEmbed ? (
          <iframe src={youtubeEmbed} title="Theme" allow="autoplay; encrypted-media" tabIndex={-1} />
        ) : nativeVideo ? (
          <video key={nativeVideo} src={nativeVideo} poster={image} autoPlay muted loop playsInline />
        ) : (
          <div className="mini-timer-still" style={{ backgroundImage: `url(${image})` }} />
        )}
      </div>
      <div className="mini-timer-shade" aria-hidden />
      <div className="mini-timer-content">
        <div className="mini-timer-phase">{phase}</div>
        <div className="mini-timer-digits">{label}</div>
        <div className="timer-controls">
          <button className="btn primary" onClick={() => (running ? pauseTimer() : startTimer())}>
            {running ? 'Pause' : 'Start'}
          </button>
          <button className="btn" onClick={() => setMiniTimer(false)}>
            Close
          </button>
        </div>
        {!window.documentPictureInPicture && (
          <p className="helper">Picture-in-Picture isn’t available here — using on-page mini timer.</p>
        )}
      </div>
    </div>
  )
}
