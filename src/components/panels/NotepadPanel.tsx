import { useAppStore } from '../../store/useAppStore'

export function NotepadPanel() {
  const notepad = useAppStore((s) => s.notepad)
  const setNotepad = useAppStore((s) => s.setNotepad)
  const words = notepad.trim() ? notepad.trim().split(/\s+/).length : 0

  return (
    <div className="panel-section">
      <p className="helper">
        {words} words · {notepad.length} chars · saved to this browser
      </p>
      <div className="field">
        <label htmlFor="notes">Scratchpad</label>
        <textarea
          id="notes"
          value={notepad}
          onChange={(e) => setNotepad(e.target.value)}
          placeholder="Capture thoughts without leaving your focus space…"
        />
      </div>
    </div>
  )
}
