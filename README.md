# Harbor — Focus Dashboard

A calm, Flocus-inspired focus dashboard you can run as a web app or install as a PWA on your phone.

## Features

- **Home / Focus / Break modes** with full-bleed themes and optional YouTube video backgrounds
- **Timer modes:** Pomodoro, Animedoro, Countdown, Stopwatch, 52/17
- **Background-safe timer** using wall-clock sync (stays accurate when the tab is hidden)
- **Alert sounds + desktop notifications** on phase changes
- **Clear mode** and **mini / Picture-in-Picture timer**
- **Draggable / resizable timer** with lock + saved layout
- **Priority tasks** with ETA, colors, tags, recurrence, and a daily plan
- **Focus stats** with streaks, best day, and CSV export
- **Ambient soundscapes**, YouTube + Spotify players
- **Backup export/import** to move data between devices
- **Keyboard shortcuts**, onboarding, lazy-loaded themes, offline image caching
- **Installable PWA** for mobile/desktop

## Quick start

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `Space` | Start / pause timer |
| `C` | Toggle clear mode |
| `M` | Mini / PiP timer |
| `1` / `2` / `3` | Home / Focus / Break |
| `Esc` | Exit clear mode / close panel |
| `?` | Settings |

## Mobile

Open the site in Safari/Chrome → **Add to Home Screen** / **Install app**.

## Notes

- Data stays in your browser — export a backup JSON under Settings to sync devices.
- Ambient audio is generated with the Web Audio API.
- Theme photos load from Unsplash and are cached by the service worker after first visit.
