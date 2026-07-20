export type DashMode = 'home' | 'focus' | 'ambient'

export type TimerMode = 'pomodoro' | 'animedoro' | 'countdown' | 'stopwatch' | 'fiftyTwo'

export type TimerPhase = 'focus' | 'shortBreak' | 'longBreak' | 'idle'

export type TaskEta =
  | '5m'
  | '10m'
  | '15m'
  | '30m'
  | '45m'
  | '1h'
  | '2h'
  | '3h'
  | '4h'
  | null

export type TaskColor = 'sage' | 'sand' | 'coral' | 'sky' | 'lilac' | 'slate'

export type TaskRecurrence = 'none' | 'daily' | 'weekdays' | 'weekly'

export type AlertSoundId = 'chime' | 'bell' | 'soft' | 'bright' | 'wood'

export interface Task {
  id: string
  text: string
  done: boolean
  eta: TaskEta
  createdAt: number
  priority: number
  color: TaskColor
  tags: string[]
  recurrence: TaskRecurrence
  completedAt: number | null
}

export interface Theme {
  id: string
  name: string
  image: string
  overlay: number
  category: 'desk' | 'cafe' | 'library' | 'office'
}

export interface AmbientSound {
  id: string
  name: string
  icon: string
  kind: 'rain' | 'ocean' | 'cafe' | 'fire' | 'wind' | 'white' | 'birds' | 'night'
}

export interface FocusSession {
  id: string
  startedAt: number
  endedAt: number
  durationMs: number
  mode: TimerMode
  phase: TimerPhase
  taskId?: string | null
}

export interface TimerSettings {
  mode: TimerMode
  pomodoroMins: number
  shortBreakMins: number
  longBreakMins: number
  countdownMins: number
  longBreakEvery: number
  autoStartBreaks: boolean
  autoStartFocus: boolean
}

export interface AppSettings {
  name: string
  showClock: boolean
  showQuotes: boolean
  showTasks: boolean
  showNotepad: boolean
  overlayStrength: number
  youtubeUrl: string
  spotifyUrl: string
  alertSound: boolean
  desktopNotifications: boolean
  alertSoundId: AlertSoundId
  autoClearOnStart: boolean
  lockTimerPosition: boolean
  completeTaskOnFocusEnd: boolean
  homeVideoUrl: string
  focusVideoUrl: string
  ambientVideoUrl: string
  onboardingComplete: boolean
  softClearFocus: boolean
  highContrast: boolean
  autoOverlay: boolean
}

export interface TimerLayout {
  x: number
  y: number
  width: number
}

export interface HarborBackup {
  version: 1
  exportedAt: number
  settings: AppSettings
  timerSettings: TimerSettings
  tasks: Task[]
  notepad: string
  sessions: FocusSession[]
  homeThemeId: string
  focusThemeId: string
  ambientThemeId: string
  activeSoundId: string | null
  soundVolume: number
  completedFocusCount: number
  timerLayout: TimerLayout | null
}
