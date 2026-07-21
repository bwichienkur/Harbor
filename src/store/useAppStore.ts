import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { defaultThemeIds, themes } from '../data/themes'
import {
  captureLayoutAsRelative,
  findLayoutTemplate,
  resolveLayoutTemplate,
} from '../data/layoutTemplates'
import { etaToMinutes } from '../lib/format'
import type {
  AppSettings,
  DashMode,
  FocusSession,
  HarborBackup,
  MusicPlaylist,
  SessionIconShape,
  SoundLayerState,
  StudyRoomState,
  Task,
  TaskColor,
  TaskEta,
  TaskRecurrence,
  TaskDockLayout,
  TimerLayout,
  TimerPhase,
  TimerSettings,
  RoomTimerSnapshot,
  WidgetLayoutTemplate,
} from '../types'

export const DEFAULT_TIMER_WIDTH = 420
export const MIN_TIMER_WIDTH = 240
export const MAX_TIMER_WIDTH = 900

export const DEFAULT_TASK_DOCK_WIDTH = 280
export const MIN_TASK_DOCK_WIDTH = 200
export const MAX_TASK_DOCK_WIDTH = 480
export const DEFAULT_TASK_DOCK_HEIGHT = 220
export const MIN_TASK_DOCK_HEIGHT = 140
export const MAX_TASK_DOCK_HEIGHT = 520

export const DEFAULT_CLOCK_WIDTH = 220
export const MIN_CLOCK_WIDTH = 140
export const MAX_CLOCK_WIDTH = 480

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function phaseDurationSeconds(settings: TimerSettings, phase: TimerPhase) {
  if (phase === 'focus') {
    if (settings.mode === 'countdown') return settings.countdownMins * 60
    if (settings.mode === 'fiftyTwo') return 52 * 60
    return settings.pomodoroMins * 60
  }
  if (phase === 'shortBreak') {
    if (settings.mode === 'fiftyTwo') return 17 * 60
    return settings.shortBreakMins * 60
  }
  if (phase === 'longBreak') return settings.longBreakMins * 60
  return 0
}

function normalizeTask(task: Partial<Task> & Pick<Task, 'id' | 'text'>): Task {
  return {
    id: task.id,
    text: task.text,
    done: task.done ?? false,
    eta: etaToMinutes(task.eta as number | string | null | undefined) || null,
    createdAt: task.createdAt ?? Date.now(),
    priority: task.priority ?? 0,
    color: task.color ?? 'sage',
    tags: task.tags ?? [],
    recurrence: task.recurrence ?? 'none',
    completedAt: task.completedAt ?? null,
  }
}

export interface AppState {
  mode: DashMode
  settings: AppSettings
  timerSettings: TimerSettings
  phase: TimerPhase
  remainingMs: number
  elapsedMs: number
  running: boolean
  phaseEndsAt: number | null
  stopwatchStartedAt: number | null
  completedFocusCount: number
  tasks: Task[]
  notepad: string
  homeThemeId: string
  focusThemeId: string
  ambientThemeId: string
  customBackground: string | null
  activeSoundId: string | null
  soundVolume: number
  soundLayers: SoundLayerState[]
  soundPresets: { id: string; name: string; layers: SoundLayerState[] }[]
  sessions: FocusSession[]
  panel:
    | 'none'
    | 'tasks'
    | 'sounds'
    | 'themes'
    | 'stats'
    | 'settings'
    | 'notepad'
    | 'music'
    | 'room'
  focusStartedAt: number | null
  activeTaskId: string | null
  timerLayout: TimerLayout | null
  taskDockLayout: TaskDockLayout | null
  clockLayout: TimerLayout | null
  activeLayoutTemplateId: string
  customLayoutTemplates: WidgetLayoutTemplate[]
  clearMode: boolean
  miniTimer: boolean
  room: StudyRoomState
  /** Ephemeral hover preview for session tally icons (not persisted). */
  sessionIconPreview: SessionIconShape | null
  pinnedPlaylistIds: string[]
  customPlaylists: MusicPlaylist[]

  setMode: (mode: DashMode) => void
  setPanel: (panel: AppState['panel']) => void
  setClearMode: (on: boolean) => void
  toggleClearMode: () => void
  setMiniTimer: (on: boolean) => void
  setSessionIconPreview: (shape: SessionIconShape | null) => void
  togglePinnedPlaylist: (id: string) => void
  pinCustomPlaylist: (playlist: Omit<MusicPlaylist, 'id' | 'custom'> & { id?: string }) => void
  removeCustomPlaylist: (id: string) => void
  applyMusicPlaylist: (playlist: MusicPlaylist) => void
  updateSettings: (patch: Partial<AppSettings>) => void
  updateTimerSettings: (patch: Partial<TimerSettings>) => void
  setTheme: (slot: 'home' | 'focus' | 'ambient', themeId: string) => void
  setCustomBackground: (dataUrl: string | null) => void
  setSound: (id: string | null) => void
  setSoundVolume: (v: number) => void
  setSoundLayers: (layers: SoundLayerState[]) => void
  toggleSoundLayer: (id: SoundLayerState['id']) => void
  setSoundLayerVolume: (id: SoundLayerState['id'], volume: number) => void
  saveSoundPreset: (name: string) => void
  applySoundPreset: (id: string) => void
  removeSoundPreset: (id: string) => void
  setNotepad: (text: string) => void
  setTimerLayout: (layout: TimerLayout) => void
  resetTimerLayout: () => void
  setTaskDockLayout: (layout: TaskDockLayout) => void
  resetTaskDockLayout: () => void
  setClockLayout: (layout: TimerLayout) => void
  resetClockLayout: () => void
  applyLayoutTemplate: (id: string) => void
  saveCurrentLayoutTemplate: (name: string) => void
  removeLayoutTemplate: (id: string) => void
  /** Clear filled session tally icons only — does not touch the timer. */
  resetFocusSessions: () => void
  setActiveTask: (id: string | null) => void
  setRoom: (patch: Partial<StudyRoomState>) => void
  applyRoomSnapshot: (snapshot: RoomTimerSnapshot) => void

  addTask: (
    text: string,
    opts?: {
      eta?: TaskEta
      color?: TaskColor
      tags?: string[]
      recurrence?: TaskRecurrence
    },
  ) => void
  updateTask: (id: string, patch: Partial<Task>) => void
  toggleTask: (id: string) => void
  removeTask: (id: string) => void
  reorderTask: (id: string, direction: 'up' | 'down') => void
  clearDoneTasks: () => void
  completeActiveTaskIfEnabled: () => void

  startTimer: () => void
  pauseTimer: () => void
  resetTimer: () => void
  skipPhase: (endedAt?: number) => void
  syncFromWallClock: () => boolean
  tick: (deltaMs?: number) => void
  ensurePhase: () => void

  exportBackup: () => HarborBackup
  importBackup: (backup: HarborBackup) => void
}

const defaultTimer: TimerSettings = {
  mode: 'pomodoro',
  pomodoroMins: 25,
  shortBreakMins: 5,
  longBreakMins: 15,
  countdownMins: 45,
  longBreakEvery: 4,
  autoStartBreaks: true,
  autoStartFocus: false,
}

const defaultSettings: AppSettings = {
  name: '',
  showClock: true,
  showQuotes: false,
  showTasks: true,
  showNotepad: true,
  showTasksOnFocus: true,
  showClockOnFocus: true,
  sessionIconShape: 'heart',
  overlayStrength: 0.26,
  youtubeUrl: '',
  spotifyUrl: '',
  alertSound: true,
  desktopNotifications: false,
  alertSoundId: 'chime',
  autoClearOnStart: false,
  lockTimerPosition: false,
  completeTaskOnFocusEnd: false,
  homeVideoUrl: '',
  focusVideoUrl: '',
  ambientVideoUrl: '',
  onboardingComplete: false,
  softClearFocus: true,
  highContrast: false,
  autoOverlay: true,
  siteFont: 'Manrope',
  customFont: '',
  keepAwakeWhileRunning: true,
}

function nextPhase(
  settings: TimerSettings,
  current: TimerPhase,
  completedFocusCount: number,
): TimerPhase {
  if (settings.mode === 'stopwatch') return 'focus'
  if (settings.mode === 'countdown') return current === 'focus' ? 'idle' : 'focus'

  if (current === 'focus' || current === 'idle') {
    const cycle = completedFocusCount % settings.longBreakEvery
    if (settings.mode === 'animedoro') return 'longBreak'
    return cycle === 0 && completedFocusCount > 0 ? 'longBreak' : 'shortBreak'
  }
  return 'focus'
}

function maybeRecur(task: Task): Task | null {
  if (task.recurrence === 'none') return null
  const now = new Date()
  if (task.recurrence === 'weekdays') {
    const day = now.getDay()
    if (day === 0 || day === 6) return null
  }
  return normalizeTask({
    ...task,
    id: uid(),
    done: false,
    completedAt: null,
    createdAt: Date.now(),
  })
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      mode: 'home',
      settings: defaultSettings,
      timerSettings: defaultTimer,
      phase: 'focus',
      remainingMs: defaultTimer.pomodoroMins * 60_000,
      elapsedMs: 0,
      running: false,
      phaseEndsAt: null,
      stopwatchStartedAt: null,
      completedFocusCount: 0,
      tasks: [],
      notepad: '',
      homeThemeId: defaultThemeIds.home,
      focusThemeId: defaultThemeIds.focus,
      ambientThemeId: defaultThemeIds.ambient,
      customBackground: null,
      activeSoundId: null,
      soundVolume: 0.35,
      soundLayers: [],
      soundPresets: [],
      sessions: [],
      panel: 'none',
      focusStartedAt: null,
      activeTaskId: null,
      timerLayout: null,
      taskDockLayout: null,
      clockLayout: null,
      activeLayoutTemplateId: 'classic',
      customLayoutTemplates: [],
      clearMode: false,
      miniTimer: false,
      sessionIconPreview: null,
      pinnedPlaylistIds: [],
      customPlaylists: [],
      room: {
        code: null,
        role: null,
        connected: false,
        peerCount: 0,
        lastError: null,
      },

      setMode: (mode) => set({ mode }),
      setPanel: (panel) => set({ panel }),
      setClearMode: (on) => set({ clearMode: on, panel: on ? 'none' : get().panel }),
      toggleClearMode: () => {
        const next = !get().clearMode
        set({ clearMode: next, panel: next ? 'none' : get().panel })
      },
      setMiniTimer: (on) => set({ miniTimer: on }),
      setSessionIconPreview: (shape) => set({ sessionIconPreview: shape }),
      togglePinnedPlaylist: (id) =>
        set((s) => ({
          pinnedPlaylistIds: s.pinnedPlaylistIds.includes(id)
            ? s.pinnedPlaylistIds.filter((x) => x !== id)
            : [...s.pinnedPlaylistIds, id],
        })),
      pinCustomPlaylist: (playlist) =>
        set((s) => {
          const id = playlist.id ?? uid()
          const entry: MusicPlaylist = {
            id,
            title: playlist.title.trim() || 'Pinned playlist',
            blurb: playlist.blurb || 'Saved from Music',
            source: playlist.source,
            url: playlist.url.trim(),
            mood: playlist.mood,
            custom: true,
          }
          if (!entry.url) return s
          const exists = s.customPlaylists.some(
            (p) => p.url === entry.url || p.id === entry.id,
          )
          if (exists) {
            return {
              customPlaylists: s.customPlaylists.map((p) =>
                p.url === entry.url || p.id === entry.id ? { ...p, ...entry, custom: true } : p,
              ),
            }
          }
          return { customPlaylists: [entry, ...s.customPlaylists] }
        }),
      removeCustomPlaylist: (id) =>
        set((s) => ({
          customPlaylists: s.customPlaylists.filter((p) => p.id !== id),
          pinnedPlaylistIds: s.pinnedPlaylistIds.filter((x) => x !== id),
        })),
      applyMusicPlaylist: (playlist) =>
        set((s) => ({
          settings: {
            ...s.settings,
            ...(playlist.source === 'youtube'
              ? { youtubeUrl: playlist.url }
              : { spotifyUrl: playlist.url }),
          },
        })),
      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),
      setRoom: (patch) => set((s) => ({ room: { ...s.room, ...patch } })),
      applyRoomSnapshot: (snapshot) =>
        set((s) => ({
          mode: snapshot.mode,
          phase: snapshot.phase,
          remainingMs: snapshot.remainingMs,
          elapsedMs: snapshot.elapsedMs,
          running: snapshot.running,
          phaseEndsAt: snapshot.phaseEndsAt,
          stopwatchStartedAt: snapshot.stopwatchStartedAt,
          completedFocusCount: snapshot.completedFocusCount,
          timerSettings: { ...s.timerSettings, ...snapshot.timerSettings },
          settings: {
            ...s.settings,
            sessionIconShape: snapshot.sessionIconShape ?? s.settings.sessionIconShape,
          },
        })),
      updateTimerSettings: (patch) => {
        const timerSettings = { ...get().timerSettings, ...patch }
        const phase = get().phase === 'idle' ? 'focus' : get().phase
        const remainingMs = phaseDurationSeconds(timerSettings, phase) * 1000
        const running = get().running
        set({
          timerSettings,
          remainingMs: running ? get().remainingMs : remainingMs,
          elapsedMs: running ? get().elapsedMs : 0,
          phaseEndsAt:
            running && timerSettings.mode !== 'stopwatch'
              ? Date.now() + get().remainingMs
              : null,
        })
      },
      setTheme: (slot, themeId) => {
        if (slot === 'home') set({ homeThemeId: themeId })
        if (slot === 'focus') set({ focusThemeId: themeId })
        if (slot === 'ambient') set({ ambientThemeId: themeId })
      },
      setCustomBackground: (dataUrl) => set({ customBackground: dataUrl }),
      setSound: (id) => {
        if (!id) {
          set({ activeSoundId: null, soundLayers: [] })
          return
        }
        set({
          activeSoundId: id,
          soundLayers: [{ id: id as SoundLayerState['id'], enabled: true, volume: get().soundVolume }],
        })
      },
      setSoundVolume: (v) =>
        set((s) => ({
          soundVolume: v,
          soundLayers: s.soundLayers.map((l) => (l.enabled ? { ...l, volume: v } : l)),
        })),
      setSoundLayers: (layers) => {
        const first = layers.find((l) => l.enabled)
        set({
          soundLayers: layers,
          activeSoundId: first?.id ?? null,
          soundVolume: first?.volume ?? get().soundVolume,
        })
      },
      toggleSoundLayer: (id) => {
        const existing = get().soundLayers.find((l) => l.id === id)
        let next: SoundLayerState[]
        if (!existing) {
          next = [...get().soundLayers, { id, enabled: true, volume: get().soundVolume || 0.35 }]
        } else {
          next = get().soundLayers.map((l) =>
            l.id === id ? { ...l, enabled: !l.enabled } : l,
          )
        }
        const first = next.find((l) => l.enabled)
        set({
          soundLayers: next,
          activeSoundId: first?.id ?? null,
        })
      },
      setSoundLayerVolume: (id, volume) => {
        const next = get().soundLayers.map((l) => (l.id === id ? { ...l, volume } : l))
        set({
          soundLayers: next,
          soundVolume: next.find((l) => l.enabled)?.volume ?? get().soundVolume,
        })
      },
      saveSoundPreset: (name) => {
        const trimmed = name.trim()
        if (!trimmed) return
        const preset = {
          id: uid(),
          name: trimmed,
          layers: get().soundLayers.map((l) => ({ ...l })),
        }
        set((s) => ({ soundPresets: [...s.soundPresets, preset] }))
      },
      applySoundPreset: (id) => {
        const preset = get().soundPresets.find((p) => p.id === id)
        if (!preset) return
        get().setSoundLayers(preset.layers.map((l) => ({ ...l })))
      },
      removeSoundPreset: (id) =>
        set((s) => ({ soundPresets: s.soundPresets.filter((p) => p.id !== id) })),
      setNotepad: (text) => set({ notepad: text }),
      setTimerLayout: (layout) =>
        set({ timerLayout: layout, activeLayoutTemplateId: 'custom' }),
      resetTimerLayout: () => set({ timerLayout: null, activeLayoutTemplateId: 'custom' }),
      setTaskDockLayout: (layout) =>
        set({ taskDockLayout: layout, activeLayoutTemplateId: 'custom' }),
      resetTaskDockLayout: () =>
        set({ taskDockLayout: null, activeLayoutTemplateId: 'custom' }),
      setClockLayout: (layout) =>
        set({ clockLayout: layout, activeLayoutTemplateId: 'custom' }),
      resetClockLayout: () => set({ clockLayout: null, activeLayoutTemplateId: 'custom' }),
      applyLayoutTemplate: (id) => {
        const template = findLayoutTemplate(id, get().customLayoutTemplates)
        if (!template) return
        const resolved = resolveLayoutTemplate(template)
        set({
          activeLayoutTemplateId: id,
          timerLayout: resolved.timer,
          clockLayout: resolved.clock,
          taskDockLayout: resolved.tasks,
        })
      },
      saveCurrentLayoutTemplate: (name) => {
        const trimmed = name.trim()
        if (!trimmed) return
        const s = get()
        if (!s.timerLayout || !s.clockLayout || !s.taskDockLayout) return
        const template = captureLayoutAsRelative(
          {
            timer: s.timerLayout,
            clock: s.clockLayout,
            tasks: s.taskDockLayout,
          },
          { id: `layout-${uid()}`, name: trimmed },
        )
        set((state) => ({
          customLayoutTemplates: [...state.customLayoutTemplates, template],
          activeLayoutTemplateId: template.id,
        }))
      },
      removeLayoutTemplate: (id) =>
        set((s) => ({
          customLayoutTemplates: s.customLayoutTemplates.filter((t) => t.id !== id),
          activeLayoutTemplateId:
            s.activeLayoutTemplateId === id ? 'custom' : s.activeLayoutTemplateId,
        })),
      resetFocusSessions: () => set({ completedFocusCount: 0 }),
      setActiveTask: (id) => set({ activeTaskId: id }),

      addTask: (text, opts = {}) => {
        const trimmed = text.trim()
        if (!trimmed) return
        const task = normalizeTask({
          id: uid(),
          text: trimmed,
          eta: opts.eta ?? null,
          color: opts.color ?? 'sage',
          tags: opts.tags ?? [],
          recurrence: opts.recurrence ?? 'none',
          priority: get().tasks.length,
          createdAt: Date.now(),
        })
        set((s) => ({ tasks: [...s.tasks, task] }))
      },
      updateTask: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? normalizeTask({ ...t, ...patch }) : t)),
        })),
      toggleTask: (id) =>
        set((s) => {
          const tasks: Task[] = []
          for (const t of s.tasks) {
            if (t.id !== id) {
              tasks.push(t)
              continue
            }
            const done = !t.done
            const updated = normalizeTask({
              ...t,
              done,
              completedAt: done ? Date.now() : null,
            })
            tasks.push(updated)
            if (done) {
              const recur = maybeRecur(updated)
              if (recur) tasks.push(recur)
            }
          }
          return {
            tasks,
            activeTaskId: s.activeTaskId === id ? null : s.activeTaskId,
          }
        }),
      removeTask: (id) =>
        set((s) => ({
          tasks: s.tasks.filter((t) => t.id !== id),
          activeTaskId: s.activeTaskId === id ? null : s.activeTaskId,
        })),
      reorderTask: (id, direction) =>
        set((s) => {
          const open = s.tasks.filter((t) => !t.done)
          const done = s.tasks.filter((t) => t.done)
          const idx = open.findIndex((t) => t.id === id)
          if (idx < 0) return s
          const swap = direction === 'up' ? idx - 1 : idx + 1
          if (swap < 0 || swap >= open.length) return s
          const next = [...open]
          ;[next[idx], next[swap]] = [next[swap], next[idx]]
          return { tasks: [...next, ...done] }
        }),
      clearDoneTasks: () =>
        set((s) => ({ tasks: s.tasks.filter((t) => !t.done) })),
      completeActiveTaskIfEnabled: () => {
        const { settings, activeTaskId } = get()
        if (!settings.completeTaskOnFocusEnd || !activeTaskId) return
        get().toggleTask(activeTaskId)
      },

      ensurePhase: () => {
        const { timerSettings, phase, remainingMs } = get()
        if (phase === 'idle' || remainingMs > 0) return
        const secs = phaseDurationSeconds(timerSettings, 'focus')
        set({
          phase: 'focus',
          remainingMs: secs * 1000,
          elapsedMs: 0,
          phaseEndsAt: null,
          stopwatchStartedAt: null,
        })
      },

      startTimer: () => {
        const state = get()
        let phase = state.phase
        let remainingMs = state.remainingMs
        if (phase === 'idle' || (remainingMs <= 0 && state.timerSettings.mode !== 'stopwatch')) {
          phase = 'focus'
          remainingMs = phaseDurationSeconds(state.timerSettings, phase) * 1000
        }
        const now = Date.now()
        const isStopwatch = state.timerSettings.mode === 'stopwatch'
        const topTask = state.tasks.find((t) => !t.done)
        set({
          running: true,
          mode: phase === 'focus' ? 'focus' : 'ambient',
          phase,
          remainingMs,
          phaseEndsAt: isStopwatch ? null : now + remainingMs,
          stopwatchStartedAt: isStopwatch ? now - state.elapsedMs : null,
          focusStartedAt:
            phase === 'focus' ? state.focusStartedAt ?? now : state.focusStartedAt,
          activeTaskId:
            phase === 'focus'
              ? state.activeTaskId ?? topTask?.id ?? null
              : state.activeTaskId,
          clearMode: state.settings.autoClearOnStart ? true : state.clearMode,
          panel: state.settings.autoClearOnStart ? 'none' : state.panel,
        })
      },

      pauseTimer: () => {
        get().syncFromWallClock()
        set({
          running: false,
          phaseEndsAt: null,
          stopwatchStartedAt: null,
        })
      },

      resetTimer: () => {
        const { timerSettings } = get()
        const remainingMs = phaseDurationSeconds(timerSettings, 'focus') * 1000
        set({
          running: false,
          phase: 'focus',
          remainingMs,
          elapsedMs: 0,
          focusStartedAt: null,
          phaseEndsAt: null,
          stopwatchStartedAt: null,
        })
      },

      skipPhase: (endedAt) => {
        const state = get()
        const wasFocus = state.phase === 'focus'
        let completed = state.completedFocusCount
        const sessions = [...state.sessions]
        const now = endedAt ?? Date.now()

        if (wasFocus && state.focusStartedAt) {
          completed += 1
          sessions.push({
            id: uid(),
            startedAt: state.focusStartedAt,
            endedAt: now,
            durationMs: Math.max(0, now - state.focusStartedAt),
            mode: state.timerSettings.mode,
            phase: 'focus',
            taskId: state.activeTaskId,
          })
          get().completeActiveTaskIfEnabled()
        }

        const phase = nextPhase(state.timerSettings, state.phase, completed)
        if (phase === 'idle') {
          set({
            running: false,
            phase: 'idle',
            remainingMs: 0,
            elapsedMs: 0,
            completedFocusCount: completed,
            sessions,
            focusStartedAt: null,
            phaseEndsAt: null,
            stopwatchStartedAt: null,
            mode: 'home',
            clearMode: false,
          })
          return
        }

        const remainingMs = phaseDurationSeconds(state.timerSettings, phase) * 1000
        const auto =
          phase === 'focus'
            ? state.timerSettings.autoStartFocus
            : state.timerSettings.autoStartBreaks
        const isStopwatch = state.timerSettings.mode === 'stopwatch'

        set({
          phase,
          remainingMs,
          elapsedMs: 0,
          completedFocusCount: completed,
          sessions,
          running: auto,
          mode: phase === 'focus' ? 'focus' : 'ambient',
          focusStartedAt: phase === 'focus' && auto ? now : null,
          phaseEndsAt: auto && !isStopwatch ? now + remainingMs : null,
          stopwatchStartedAt: auto && isStopwatch ? now : null,
        })
      },

      syncFromWallClock: () => {
        const state = get()
        if (!state.running) return false

        if (state.timerSettings.mode === 'stopwatch') {
          const origin = state.stopwatchStartedAt ?? Date.now() - state.elapsedMs
          set({
            elapsedMs: Math.max(0, Date.now() - origin),
            stopwatchStartedAt: origin,
          })
          return false
        }

        let advanced = false
        let guard = 0
        while (guard < 24) {
          guard += 1
          const current = get()
          if (!current.running || current.timerSettings.mode === 'stopwatch') break

          const endsAt = current.phaseEndsAt ?? Date.now() + current.remainingMs
          if (endsAt > Date.now()) {
            set({ remainingMs: endsAt - Date.now(), phaseEndsAt: endsAt })
            break
          }

          set({ remainingMs: 0, phaseEndsAt: endsAt })
          get().skipPhase(endsAt)
          advanced = true
          if (!get().running) break
        }

        return advanced
      },

      tick: () => {
        get().syncFromWallClock()
      },

      exportBackup: () => {
        const s = get()
        return {
          version: 1 as const,
          exportedAt: Date.now(),
          settings: s.settings,
          timerSettings: s.timerSettings,
          tasks: s.tasks,
          notepad: s.notepad,
          sessions: s.sessions,
          homeThemeId: s.homeThemeId,
          focusThemeId: s.focusThemeId,
          ambientThemeId: s.ambientThemeId,
          activeSoundId: s.activeSoundId,
          soundVolume: s.soundVolume,
          completedFocusCount: s.completedFocusCount,
          timerLayout: s.timerLayout,
          taskDockLayout: s.taskDockLayout,
          clockLayout: s.clockLayout,
          soundLayers: s.soundLayers,
          soundPresets: s.soundPresets,
          activeLayoutTemplateId: s.activeLayoutTemplateId,
          customLayoutTemplates: s.customLayoutTemplates,
          pinnedPlaylistIds: s.pinnedPlaylistIds,
          customPlaylists: s.customPlaylists,
        }
      },

      importBackup: (backup) => {
        if (!backup || backup.version !== 1) return
        set({
          settings: { ...defaultSettings, ...backup.settings },
          timerSettings: { ...defaultTimer, ...backup.timerSettings },
          tasks: (backup.tasks ?? []).map((t) => normalizeTask(t)),
          notepad: backup.notepad ?? '',
          sessions: backup.sessions ?? [],
          homeThemeId: backup.homeThemeId ?? defaultThemeIds.home,
          focusThemeId: backup.focusThemeId ?? defaultThemeIds.focus,
          ambientThemeId: backup.ambientThemeId ?? defaultThemeIds.ambient,
          activeSoundId: backup.activeSoundId ?? null,
          soundVolume: backup.soundVolume ?? 0.35,
          completedFocusCount: backup.completedFocusCount ?? 0,
          timerLayout: backup.timerLayout ?? null,
          taskDockLayout: backup.taskDockLayout ?? null,
          clockLayout: backup.clockLayout ?? null,
          soundLayers: backup.soundLayers ?? [],
          soundPresets: backup.soundPresets ?? [],
          activeLayoutTemplateId: backup.activeLayoutTemplateId ?? 'custom',
          customLayoutTemplates: backup.customLayoutTemplates ?? [],
          pinnedPlaylistIds: backup.pinnedPlaylistIds ?? [],
          customPlaylists: backup.customPlaylists ?? [],
        })
      },
    }),
    {
      name: 'harbor-focus-dashboard',
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AppState>
        const themeIds = new Set(themes.map((t) => t.id))
        const resolveId = (id: string | undefined, fallback: string) =>
          id && themeIds.has(id) ? id : fallback
        const persistedSettings = (p.settings ?? {}) as Partial<AppState['settings']>
        const migratedOverlay =
          persistedSettings.overlayStrength === 0.45
            ? 0.26
            : persistedSettings.overlayStrength
        return {
          ...current,
          ...p,
          homeThemeId: resolveId(p.homeThemeId, defaultThemeIds.home),
          focusThemeId: resolveId(p.focusThemeId, defaultThemeIds.focus),
          ambientThemeId: resolveId(p.ambientThemeId, defaultThemeIds.ambient),
          settings: {
            ...current.settings,
            ...persistedSettings,
            ...(migratedOverlay !== undefined ? { overlayStrength: migratedOverlay } : {}),
          },
          timerSettings: { ...current.timerSettings, ...p.timerSettings },
          tasks: (p.tasks ?? current.tasks).map((t) => normalizeTask(t)),
          soundLayers: p.soundLayers ?? current.soundLayers,
          soundPresets: p.soundPresets ?? current.soundPresets,
          customLayoutTemplates: p.customLayoutTemplates ?? current.customLayoutTemplates,
          activeLayoutTemplateId: p.activeLayoutTemplateId ?? current.activeLayoutTemplateId,
          pinnedPlaylistIds: p.pinnedPlaylistIds ?? current.pinnedPlaylistIds,
          customPlaylists: p.customPlaylists ?? current.customPlaylists,
        }
      },
      partialize: (s) => ({
        settings: s.settings,
        timerSettings: s.timerSettings,
        tasks: s.tasks,
        notepad: s.notepad,
        homeThemeId: s.homeThemeId,
        focusThemeId: s.focusThemeId,
        ambientThemeId: s.ambientThemeId,
        customBackground: s.customBackground,
        activeSoundId: s.activeSoundId,
        soundVolume: s.soundVolume,
        soundLayers: s.soundLayers,
        soundPresets: s.soundPresets,
        sessions: s.sessions,
        completedFocusCount: s.completedFocusCount,
        timerLayout: s.timerLayout,
        taskDockLayout: s.taskDockLayout,
        clockLayout: s.clockLayout,
        activeLayoutTemplateId: s.activeLayoutTemplateId,
        customLayoutTemplates: s.customLayoutTemplates,
        pinnedPlaylistIds: s.pinnedPlaylistIds,
        customPlaylists: s.customPlaylists,
        clearMode: s.clearMode,
        activeTaskId: s.activeTaskId,
        mode: s.mode,
        phase: s.phase,
        remainingMs: s.remainingMs,
        elapsedMs: s.elapsedMs,
        running: s.running,
        phaseEndsAt: s.phaseEndsAt,
        stopwatchStartedAt: s.stopwatchStartedAt,
        focusStartedAt: s.focusStartedAt,
      }),
    },
  ),
)
