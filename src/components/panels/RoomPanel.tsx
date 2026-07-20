import { useState } from 'react'
import { Copy, DoorOpen, LogOut, Users } from 'lucide-react'
import {
  createStudyRoom,
  generateRoomCode,
  joinStudyRoom,
  leaveStudyRoom,
} from '../../lib/roomSync'
import { useAppStore } from '../../store/useAppStore'

export function RoomPanel() {
  const room = useAppStore((s) => s.room)
  const [joinCode, setJoinCode] = useState('')
  const [busy, setBusy] = useState(false)

  const create = async () => {
    setBusy(true)
    try {
      await createStudyRoom(generateRoomCode())
    } catch {
      /* error stored on room state */
    } finally {
      setBusy(false)
    }
  }

  const join = async () => {
    setBusy(true)
    try {
      await joinStudyRoom(joinCode)
    } catch {
      /* error stored on room state */
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="panel-section">
      <p className="helper">
        Create a study room to sync timer settings and session progress with friends. The host
        controls the timer; guests follow along in real time.
      </p>

      {room.code ? (
        <div className="room-active">
          <div className="room-code-row">
            <div>
              <p className="helper">Room code</p>
              <strong className="room-code">{room.code}</strong>
            </div>
            <button
              type="button"
              className="btn"
              onClick={() => void navigator.clipboard.writeText(room.code ?? '')}
            >
              <Copy size={14} /> Copy
            </button>
          </div>
          <p className="helper">
            <Users size={14} aria-hidden />{' '}
            {room.role === 'host' ? 'Hosting' : 'Joined'} ·{' '}
            {room.connected ? `${Math.max(1, room.peerCount + (room.role === 'host' ? 1 : 0))} connected` : 'Connecting…'}
          </p>
          {room.lastError && <p className="helper room-error">{room.lastError}</p>}
          <button type="button" className="btn" onClick={() => leaveStudyRoom()}>
            <LogOut size={14} /> Leave room
          </button>
        </div>
      ) : (
        <>
          <button className="btn primary" type="button" disabled={busy} onClick={() => void create()}>
            <DoorOpen size={16} /> Create room
          </button>
          <div className="field">
            <label htmlFor="join-code">Or join with a code</label>
            <input
              id="join-code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              maxLength={8}
            />
          </div>
          <button className="btn" type="button" disabled={busy || joinCode.length < 4} onClick={() => void join()}>
            Join room
          </button>
          {room.lastError && <p className="helper room-error">{room.lastError}</p>}
        </>
      )}
    </div>
  )
}
