import { useEffect, useRef, useState } from 'react'
import {
  CheckSquare,
  Ellipsis,
  Focus,
  ListMusic,
  NotebookPen,
  Palette,
  Settings,
  BarChart3,
  Volume2,
  X,
} from 'lucide-react'
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

  if (clearMode) {
    return (
      <header className="top-bar clear-mode-bar">
        <button
          className="btn clear-exit-btn"
          onClick={() => toggleClearMode()}
          title="Exit clear mode (Esc)"
        >
          <X size={16} aria-hidden /> Exit clear
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
        {(mode === 'focus' || mode === 'ambient') && (
          <button
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
            className={`icon-btn labeled ${moreOpen || moreTools.some((t) => t.id === panel) ? 'active' : ''}`}
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
              {moreTools.map(({ id, label, Icon }) => (
                <button
                  key={id}
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
