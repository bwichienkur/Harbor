import { useEffect, useRef, useState } from 'react'
import {
  CheckSquare,
  Ellipsis,
  Focus,
  ListMusic,
  Maximize2,
  Minimize2,
  NotebookPen,
  Palette,
  Settings,
  BarChart3,
  Volume2,
  X,
} from 'lucide-react'
import { useFullscreen } from '../hooks/useFullscreen'
import { useAppStore } from '../store/useAppStore'

const primaryTools = [
  { id: 'tasks' as const, label: 'Tasks', Icon: CheckSquare },
  { id: 'themes' as const, label: 'Themes', Icon: Palette },
  { id: 'sounds' as const, label: 'Sounds', Icon: Volume2 },
  { id: 'settings' as const, label: 'Settings', Icon: Settings },
]

const moreTools = [
  { id: 'music' as const, label: 'Music', Icon: ListMusic },
  { id: 'notepad' as const, label: 'Notes', Icon: NotebookPen },
  { id: 'stats' as const, label: 'Stats', Icon: BarChart3 },
]

export function TopBar() {
  const panel = useAppStore((s) => s.panel)
  const setPanel = useAppStore((s) => s.setPanel)
  const clearMode = useAppStore((s) => s.clearMode)
  const toggleClearMode = useAppStore((s) => s.toggleClearMode)
  const mode = useAppStore((s) => s.mode)
  const showNotepad = useAppStore((s) => s.settings.showNotepad)
  const { isFullscreen, toggleFullscreen } = useFullscreen()
  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!moreOpen) return
    const onDoc = (e: MouseEvent) => {
      if (!moreRef.current?.contains(e.target as Node)) setMoreOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [moreOpen])

  useEffect(() => {
    if (!showNotepad && panel === 'notepad') setPanel('none')
  }, [showNotepad, panel, setPanel])

  const visibleMoreTools = moreTools.filter((t) => t.id !== 'notepad' || showNotepad)

  if (clearMode) {
    return (
      <header className="top-bar clear-mode-bar">
        <button
          type="button"
          className="btn clear-exit-btn"
          onClick={() => toggleClearMode()}
          title="Exit clear mode (Esc)"
        >
          <X size={16} aria-hidden /> Exit clear
        </button>
        <button
          type="button"
          className="btn clear-exit-btn"
          onClick={() => void toggleFullscreen()}
          title={isFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen theme (F)'}
        >
          {isFullscreen ? <Minimize2 size={16} aria-hidden /> : <Maximize2 size={16} aria-hidden />}
          {isFullscreen ? 'Exit full' : 'Fullscreen'}
        </button>
      </header>
    )
  }

  return (
    <header className="top-bar">
      <div className="brand">
        Harbor<span>.</span>
      </div>
      <nav className="icon-row" aria-label="Tools">
        <button
          type="button"
          className={`icon-btn labeled ${isFullscreen ? 'active' : ''}`}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen background'}
          title={
            isFullscreen
              ? 'Exit fullscreen (F)'
              : 'Fullscreen — fill the screen with your theme (F)'
          }
          aria-pressed={isFullscreen}
          onClick={() => void toggleFullscreen()}
        >
          {isFullscreen ? (
            <Minimize2 size={18} strokeWidth={2} aria-hidden />
          ) : (
            <Maximize2 size={18} strokeWidth={2} aria-hidden />
          )}
          <span className="icon-label">{isFullscreen ? 'Exit' : 'Full'}</span>
        </button>
        {(mode === 'focus' || mode === 'ambient') && (
          <button
            type="button"
            className="icon-btn labeled"
            aria-label="Clear mode"
            title="Clear mode — hide chrome"
            onClick={() => toggleClearMode()}
          >
            <Focus size={18} strokeWidth={2} aria-hidden />
            <span className="icon-label">Clear</span>
          </button>
        )}
        {primaryTools.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className={`icon-btn labeled ${panel === id ? 'active' : ''}`}
            aria-label={label}
            title={label}
            onClick={() => setPanel(panel === id ? 'none' : id)}
          >
            <Icon size={18} strokeWidth={2} aria-hidden />
            <span className="icon-label">{label}</span>
          </button>
        ))}
        <div className="more-menu" ref={moreRef}>
          <button
            type="button"
            className={`icon-btn labeled ${moreOpen || visibleMoreTools.some((t) => t.id === panel) ? 'active' : ''}`}
            aria-label="More tools"
            aria-expanded={moreOpen}
            title="More"
            onClick={() => setMoreOpen((v) => !v)}
          >
            <Ellipsis size={18} strokeWidth={2} aria-hidden />
            <span className="icon-label">More</span>
          </button>
          {moreOpen && (
            <div className="more-dropdown" role="menu">
              {visibleMoreTools.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  role="menuitem"
                  className={panel === id ? 'active' : ''}
                  onClick={() => {
                    setPanel(panel === id ? 'none' : id)
                    setMoreOpen(false)
                  }}
                >
                  <Icon size={16} strokeWidth={2} aria-hidden />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}
