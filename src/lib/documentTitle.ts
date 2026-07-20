import { formatTimer } from './format'

export function updateDocumentTitle(
  running: boolean,
  phase: string,
  remainingMs: number,
  elapsedMs: number,
  isStopwatch: boolean,
) {
  if (!running && phase === 'idle') {
    document.title = 'Harbor'
    return
  }

  const ms = isStopwatch ? elapsedMs : remainingMs
  const label =
    phase === 'shortBreak'
      ? 'Break'
      : phase === 'longBreak'
        ? 'Long break'
        : phase === 'idle'
          ? 'Done'
          : 'Focus'

  document.title = `${formatTimer(ms / 1000)} · ${label} · Harbor`
}
