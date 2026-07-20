const phaseTitles: Record<string, string> = {
  focus: 'Focus time',
  shortBreak: 'Short break',
  longBreak: 'Long break',
  idle: 'Session complete',
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'denied' as const
  if (Notification.permission === 'granted') return 'granted' as const
  if (Notification.permission === 'denied') return 'denied' as const
  return Notification.requestPermission()
}

export function notifyPhaseChange(phase: string, detail?: string) {
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return
  if (document.visibilityState === 'visible') return

  const title = phaseTitles[phase] ?? 'Harbor'
  try {
    new Notification(title, {
      body: detail ?? 'Your Harbor timer moved to the next phase.',
      tag: 'harbor-timer-phase',
      silent: false,
    })
  } catch {
    /* ignore notification failures */
  }
}
