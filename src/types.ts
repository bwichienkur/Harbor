export type DashMode = 'home' | 'focus' | 'ambient'

export type TimerMode = 'pomodoro' | 'animedoro' | 'countdown' | 'stopwatch' | 'fiftyTwo'

export type TimerPhase = 'focus' | 'shortBreak' | 'longBreak' | 'idle'

/** Estimated focus minutes for a task (null = unset). Legacy string labels are normalized on load. */
export type TaskEta = number | null

export type TaskColor = 'sage' | 'sand' | 'coral' | 'sky' | 'lilac' | 'slate'

export type TaskRecurrence = 'none' | 'daily' | 'weekdays' | 'weekly'

export type AlertSoundId = 'chime' | 'bell' | 'soft' | 'bright' | 'wood'

export type SessionIconShape = 'heart' | 'star' | 'circle' | 'flame' | 'check'

export type RoomRole = 'host' | 'guest' | null

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

export type ThemeCategory = 'nature' | 'cafe' | 'library' | 'office'

export type AmbientSoundKind =
  | 'rain'
  | 'ocean'
  | 'cafe'
  | 'fire'
  | 'wind'
  | 'white'
  | 'birds'
  | 'night'
  | 'thunder'
  | 'train'
  | 'pages'
  | 'keyboard'
  | 'clock'

export interface Theme {
  id: string
  name: string
  /** Still poster / fallback image */
  image: string
  overlay: number
  category: ThemeCategory
  /** Looping ambient video (mp4/webm URL or YouTube URL) */
  video?: string
  animated?: boolean
  /** Curation note describing the subtle motion */
  motion?: string
}

export interface AmbientSound {
  id: string
  name: string
  icon: string
  kind: AmbientSoundKind
}

export type MusicSource = 'youtube' | 'spotify'
export type MusicMood = 'deep' | 'chill' | 'classical' | 'ambient' | 'jazz'

export interface MusicPlaylist {
  id: string
  title: string
  blurb: string
  source: MusicSource
  url: string
  mood: MusicMood
  /** User-pinned custom entry (not from curated catalog). */
  custom?: boolean
}

export interface SoundLayerState {
  id: AmbientSoundKind
  enabled: boolean
  volume: number
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
  showTasksOnFocus: boolean
  showClockOnFocus: boolean
  sessionIconShape: SessionIconShape
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
  /** Preset font id, or `"custom"` to use `customFont`. */
  siteFont: string
  /** Any Google Font / system font family name when `siteFont` is `"custom"`. */
  customFont: string
  /** Keep the screen awake with Wake Lock while the timer is running. */
  keepAwakeWhileRunning: boolean
}

export interface StudyRoomState {
  code: string | null
  role: RoomRole
  connected: boolean
  peerCount: number
  lastError: string | null
}

/** Host → guest timer payload for study rooms. */
export interface RoomTimerSnapshot {
  mode: DashMode
  phase: TimerPhase
  remainingMs: number
  elapsedMs: number
  running: boolean
  phaseEndsAt: number | null
  stopwatchStartedAt: number | null
  completedFocusCount: number
  timerSettings: TimerSettings
  sessionIconShape: SessionIconShape
}

export interface TimerLayout {
  x: number
  y: number
  width: number
}

/** Position + size for the focus task dock widget. */
export interface TaskDockLayout {
  x: number
  y: number
  width: number
  height: number
}

export type LayoutAnchorX = 'left' | 'center' | 'right'
export type LayoutAnchorY = 'top' | 'center' | 'bottom'

export interface LayoutPlacement {
  anchorX: LayoutAnchorX
  anchorY: LayoutAnchorY
  offsetX?: number
  offsetY?: number
  width: number
  height?: number
}

/** Named arrangement for timer, clock, and task widgets. */
export interface WidgetLayoutTemplate {
  id: string
  name: string
  description: string
  builtin: boolean
  timer: LayoutPlacement
  clock: LayoutPlacement
  tasks: LayoutPlacement & { height: number }
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
  taskDockLayout: TaskDockLayout | null
  clockLayout: TimerLayout | null
  soundLayers: SoundLayerState[]
  soundPresets: { id: string; name: string; layers: SoundLayerState[] }[]
  /** Active layout template id, or `"custom"` when freeform. */
  activeLayoutTemplateId: string
  customLayoutTemplates: WidgetLayoutTemplate[]
  /** Curated playlist ids the user pinned. */
  pinnedPlaylistIds: string[]
  /** User-saved custom playlists (from paste or pin-current). */
  customPlaylists: MusicPlaylist[]
}
