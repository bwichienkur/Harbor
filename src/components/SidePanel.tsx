import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { MusicPanel } from './panels/MusicPanel'
import { NotepadPanel } from './panels/NotepadPanel'
import { SettingsPanel } from './panels/SettingsPanel'
import { SoundsPanel } from './panels/SoundsPanel'
import { StatsPanel } from './panels/StatsPanel'
import { TasksPanel } from './panels/TasksPanel'
import { ThemesPanel } from './panels/ThemesPanel'

const titles = {
  tasks: 'Tasks',
  sounds: 'Ambient Sounds',
  themes: 'Themes',
  stats: 'Focus Stats',
  settings: 'Settings',
  notepad: 'Notepad',
  music: 'Music',
} as const

export function SidePanel() {
  const panel = useAppStore((s) => s.panel)
  const setPanel = useAppStore((s) => s.setPanel)

  return (
    <AnimatePresence>
      {panel !== 'none' && (
        <>
          <motion.button
            key="scrim"
            className="panel-scrim"
            aria-label="Close panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setPanel('none')}
          />
          <motion.aside
            key="panel"
            className="side-panel"
            initial={false}
            animate={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="panel-header">
              <h2>{titles[panel]}</h2>
              <button className="icon-btn" aria-label="Close" onClick={() => setPanel('none')}>
                <X size={18} />
              </button>
            </div>
            {panel === 'tasks' && <TasksPanel />}
            {panel === 'sounds' && <SoundsPanel />}
            {panel === 'themes' && <ThemesPanel />}
            {panel === 'stats' && <StatsPanel />}
            {panel === 'settings' && <SettingsPanel />}
            {panel === 'notepad' && <NotepadPanel />}
            {panel === 'music' && <MusicPanel />}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
