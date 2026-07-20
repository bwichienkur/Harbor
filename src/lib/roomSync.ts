import { Peer, type DataConnection } from 'peerjs'
import type { RoomTimerSnapshot } from '../types'
import { useAppStore } from '../store/useAppStore'

const ROOM_PREFIX = 'harbor-study-'

export function buildRoomSnapshot(): RoomTimerSnapshot {
  const s = useAppStore.getState()
  return {
    mode: s.mode,
    phase: s.phase,
    remainingMs: s.remainingMs,
    elapsedMs: s.elapsedMs,
    running: s.running,
    phaseEndsAt: s.phaseEndsAt,
    stopwatchStartedAt: s.stopwatchStartedAt,
    completedFocusCount: s.completedFocusCount,
    timerSettings: s.timerSettings,
    sessionIconShape: s.settings.sessionIconShape,
  }
}

function roomPeerId(code: string, role: 'host' | 'guest', guestSuffix = '') {
  const clean = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)
  return `${ROOM_PREFIX}${clean}-${role}${guestSuffix}`
}

export function generateRoomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)]
  return out
}

type RoomMessage =
  | { type: 'snapshot'; payload: RoomTimerSnapshot }
  | { type: 'hello'; name: string }

let peer: Peer | null = null
const connections = new Map<string, DataConnection>()
let broadcastTimer: number | null = null

function cleanupPeer() {
  if (broadcastTimer != null) {
    window.clearInterval(broadcastTimer)
    broadcastTimer = null
  }
  for (const conn of connections.values()) conn.close()
  connections.clear()
  peer?.destroy()
  peer = null
}

function wireConnection(conn: DataConnection, role: 'host' | 'guest') {
  connections.set(conn.peer, conn)
  useAppStore.getState().setRoom({
    connected: true,
    peerCount: connections.size,
    lastError: null,
  })

  conn.on('data', (raw) => {
    const msg = raw as RoomMessage
    if (msg?.type === 'snapshot' && role === 'guest') {
      useAppStore.getState().applyRoomSnapshot(msg.payload)
    }
  })

  conn.on('close', () => {
    connections.delete(conn.peer)
    useAppStore.getState().setRoom({
      peerCount: connections.size,
      connected: connections.size > 0 || role === 'host',
    })
  })

  if (role === 'host') {
    conn.send({ type: 'snapshot', payload: buildRoomSnapshot() } satisfies RoomMessage)
  }
}

function startHostBroadcast() {
  if (broadcastTimer != null) window.clearInterval(broadcastTimer)
  broadcastTimer = window.setInterval(() => {
    const payload = buildRoomSnapshot()
    for (const conn of connections.values()) {
      if (conn.open) conn.send({ type: 'snapshot', payload } satisfies RoomMessage)
    }
  }, 1000)
}

export async function createStudyRoom(code = generateRoomCode()) {
  cleanupPeer()
  const clean = code.trim().toUpperCase()
  useAppStore.getState().setRoom({
    code: clean,
    role: 'host',
    connected: false,
    peerCount: 0,
    lastError: null,
  })

  return new Promise<string>((resolve, reject) => {
    peer = new Peer(roomPeerId(clean, 'host'), { debug: 0 })
    peer.on('open', () => {
      useAppStore.getState().setRoom({ connected: true })
      startHostBroadcast()
      resolve(clean)
    })
    peer.on('connection', (conn) => {
      conn.on('open', () => wireConnection(conn, 'host'))
    })
    peer.on('error', (err) => {
      useAppStore.getState().setRoom({
        lastError: err.message || 'Could not create room',
        connected: false,
      })
      reject(err)
    })
  })
}

export async function joinStudyRoom(code: string) {
  cleanupPeer()
  const clean = code.trim().toUpperCase()
  if (clean.length < 4) throw new Error('Enter a valid room code')

  useAppStore.getState().setRoom({
    code: clean,
    role: 'guest',
    connected: false,
    peerCount: 0,
    lastError: null,
  })

  const guestId = roomPeerId(clean, 'guest', `-${Math.random().toString(36).slice(2, 7)}`)

  return new Promise<string>((resolve, reject) => {
    peer = new Peer(guestId, { debug: 0 })
    peer.on('open', () => {
      const conn = peer!.connect(roomPeerId(clean, 'host'), { reliable: true })
      conn.on('open', () => {
        wireConnection(conn, 'guest')
        resolve(clean)
      })
      conn.on('error', (err) => {
        useAppStore.getState().setRoom({
          lastError: err.message || 'Could not join room',
          connected: false,
        })
        reject(err)
      })
    })
    peer.on('error', (err) => {
      useAppStore.getState().setRoom({
        lastError: err.message || 'Could not join room',
        connected: false,
      })
      reject(err)
    })
  })
}

export function leaveStudyRoom() {
  cleanupPeer()
  useAppStore.getState().setRoom({
    code: null,
    role: null,
    connected: false,
    peerCount: 0,
    lastError: null,
  })
}

export function pushRoomSnapshotNow() {
  const role = useAppStore.getState().room.role
  if (role !== 'host') return
  const payload = buildRoomSnapshot()
  for (const conn of connections.values()) {
    if (conn.open) conn.send({ type: 'snapshot', payload } satisfies RoomMessage)
  }
}
