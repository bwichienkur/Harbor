import type { AmbientSoundKind, SoundLayerState } from '../types'

type LayerNodes = {
  gain: GainNode
  sources: AudioNode[]
  timers: number[]
}

let ctx: AudioContext | null = null
let master: GainNode | null = null
const layers = new Map<AmbientSoundKind, LayerNodes>()

function ensureContext() {
  if (!ctx) {
    ctx = new AudioContext()
    master = ctx.createGain()
    master.gain.value = 1
    master.connect(ctx.destination)
  }
  return { ctx, master: master! }
}

function noiseBuffer(context: AudioContext, seconds = 2) {
  const length = context.sampleRate * seconds
  const buffer = context.createBuffer(1, length, context.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
  return buffer
}

function startNoise(
  context: AudioContext,
  dest: AudioNode,
  type: BiquadFilterType,
  frequency: number,
  volume: number,
) {
  const source = context.createBufferSource()
  source.buffer = noiseBuffer(context)
  source.loop = true
  const filter = context.createBiquadFilter()
  filter.type = type
  filter.frequency.value = frequency
  const gain = context.createGain()
  gain.gain.value = volume
  source.connect(filter)
  filter.connect(gain)
  gain.connect(dest)
  source.start()
  return { source, filter, gain }
}

function startLfoTone(
  context: AudioContext,
  dest: AudioNode,
  freq: number,
  volume: number,
  lfoRate: number,
) {
  const osc = context.createOscillator()
  osc.type = 'sine'
  osc.frequency.value = freq
  const gain = context.createGain()
  gain.gain.value = volume
  const lfo = context.createOscillator()
  lfo.frequency.value = lfoRate
  const lfoGain = context.createGain()
  lfoGain.gain.value = volume * 0.4
  lfo.connect(lfoGain)
  lfoGain.connect(gain.gain)
  osc.connect(gain)
  gain.connect(dest)
  osc.start()
  lfo.start()
  return { osc, lfo, gain }
}

function buildKind(context: AudioContext, bus: GainNode, kind: AmbientSoundKind) {
  const sources: AudioNode[] = []
  const timers: number[] = []

  switch (kind) {
    case 'rain': {
      const n = startNoise(context, bus, 'lowpass', 1200, 0.55)
      sources.push(n.source, n.filter, n.gain)
      break
    }
    case 'ocean': {
      const n = startNoise(context, bus, 'lowpass', 500, 0.4)
      sources.push(n.source, n.filter, n.gain)
      const wave = startLfoTone(context, bus, 80, 0.08, 0.08)
      sources.push(wave.osc, wave.lfo, wave.gain)
      break
    }
    case 'cafe': {
      const n = startNoise(context, bus, 'bandpass', 900, 0.22)
      sources.push(n.source, n.filter, n.gain)
      const murmur = startLfoTone(context, bus, 180, 0.03, 0.25)
      sources.push(murmur.osc, murmur.lfo, murmur.gain)
      break
    }
    case 'fire': {
      const n = startNoise(context, bus, 'lowpass', 700, 0.35)
      sources.push(n.source, n.filter, n.gain)
      const crackle = () => {
        const o = context.createOscillator()
        const g = context.createGain()
        o.type = 'triangle'
        o.frequency.value = 200 + Math.random() * 800
        g.gain.value = 0.04
        o.connect(g)
        g.connect(bus)
        o.start()
        g.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.08)
        o.stop(context.currentTime + 0.1)
      }
      timers.push(window.setInterval(crackle, 280))
      break
    }
    case 'wind': {
      const n = startNoise(context, bus, 'bandpass', 400, 0.3)
      sources.push(n.source, n.filter, n.gain)
      break
    }
    case 'white': {
      const n = startNoise(context, bus, 'allpass', 1000, 0.25)
      sources.push(n.source, n.filter, n.gain)
      break
    }
    case 'birds': {
      const n = startNoise(context, bus, 'highpass', 2000, 0.05)
      sources.push(n.source, n.filter, n.gain)
      const chirp = () => {
        const o = context.createOscillator()
        const g = context.createGain()
        o.type = 'sine'
        o.frequency.value = 1800 + Math.random() * 1200
        g.gain.value = 0.03
        o.connect(g)
        g.connect(bus)
        o.start()
        o.frequency.linearRampToValueAtTime(o.frequency.value + 400, context.currentTime + 0.12)
        g.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.15)
        o.stop(context.currentTime + 0.16)
      }
      timers.push(window.setInterval(chirp, 1600))
      break
    }
    case 'night': {
      const n = startNoise(context, bus, 'highpass', 3000, 0.04)
      sources.push(n.source, n.filter, n.gain)
      const cricket = () => {
        const o = context.createOscillator()
        const g = context.createGain()
        o.type = 'square'
        o.frequency.value = 4200 + Math.random() * 400
        g.gain.value = 0.012
        o.connect(g)
        g.connect(bus)
        o.start()
        g.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.05)
        o.stop(context.currentTime + 0.06)
      }
      timers.push(window.setInterval(cricket, 180))
      break
    }
    case 'thunder': {
      const rumble = () => {
        const n = startNoise(context, bus, 'lowpass', 180, 0.001)
        sources.push(n.source, n.filter, n.gain)
        n.gain.gain.setValueAtTime(0.001, context.currentTime)
        n.gain.gain.linearRampToValueAtTime(0.45, context.currentTime + 0.08)
        n.gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 1.8)
      }
      timers.push(window.setInterval(rumble, 7000 + Math.random() * 5000))
      rumble()
      break
    }
    case 'train': {
      const n = startNoise(context, bus, 'lowpass', 320, 0.22)
      sources.push(n.source, n.filter, n.gain)
      const rhythm = startLfoTone(context, bus, 55, 0.04, 2.4)
      sources.push(rhythm.osc, rhythm.lfo, rhythm.gain)
      break
    }
    case 'pages': {
      const turn = () => {
        const n = startNoise(context, bus, 'bandpass', 1800, 0.001)
        sources.push(n.source, n.filter, n.gain)
        n.gain.gain.setValueAtTime(0.001, context.currentTime)
        n.gain.gain.linearRampToValueAtTime(0.12, context.currentTime + 0.02)
        n.gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.25)
      }
      timers.push(window.setInterval(turn, 4200))
      break
    }
    case 'keyboard': {
      const click = () => {
        const o = context.createOscillator()
        const g = context.createGain()
        o.type = 'square'
        o.frequency.value = 800 + Math.random() * 600
        g.gain.value = 0.018
        o.connect(g)
        g.connect(bus)
        o.start()
        g.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.04)
        o.stop(context.currentTime + 0.05)
      }
      timers.push(window.setInterval(click, 140 + Math.random() * 80))
      break
    }
    case 'clock': {
      const tick = () => {
        const o = context.createOscillator()
        const g = context.createGain()
        o.type = 'sine'
        o.frequency.value = 1200
        g.gain.value = 0.02
        o.connect(g)
        g.connect(bus)
        o.start()
        g.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.03)
        o.stop(context.currentTime + 0.04)
      }
      timers.push(window.setInterval(tick, 1000))
      break
    }
  }

  return { sources, timers }
}

function stopLayer(kind: AmbientSoundKind) {
  const active = layers.get(kind)
  if (!active) return
  for (const t of active.timers) window.clearInterval(t)
  for (const node of active.sources) {
    try {
      if ('stop' in node && typeof node.stop === 'function') node.stop()
    } catch {
      /* ignore */
    }
    try {
      node.disconnect()
    } catch {
      /* ignore */
    }
  }
  try {
    active.gain.disconnect()
  } catch {
    /* ignore */
  }
  layers.delete(kind)
}

export async function syncAmbientLayers(states: SoundLayerState[]) {
  const { ctx: context, master: out } = ensureContext()
  if (context.state === 'suspended') await context.resume()

  const wanted = new Set(
    states.filter((s) => s.enabled && s.volume > 0.01).map((s) => s.id),
  )

  for (const kind of [...layers.keys()]) {
    if (!wanted.has(kind)) stopLayer(kind)
  }

  for (const state of states) {
    if (!state.enabled || state.volume <= 0.01) continue
    const existing = layers.get(state.id)
    if (existing) {
      existing.gain.gain.value = state.volume
      continue
    }
    const bus = context.createGain()
    bus.gain.value = state.volume
    bus.connect(out)
    const built = buildKind(context, bus, state.id)
    layers.set(state.id, { gain: bus, sources: built.sources, timers: built.timers })
  }
}

export function stopAllAmbientLayers() {
  for (const kind of [...layers.keys()]) stopLayer(kind)
}
