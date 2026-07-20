import type { AlertSoundId, AmbientSound } from '../types'

type ActiveNodes = {
  gain: GainNode
  sources: AudioNode[]
  timers: number[]
}

let ctx: AudioContext | null = null
let master: GainNode | null = null
let active: ActiveNodes | null = null

function ensureContext() {
  if (!ctx) {
    ctx = new AudioContext()
    master = ctx.createGain()
    master.gain.value = 0.35
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

export async function playAmbient(sound: AmbientSound | null, volume = 0.35) {
  stopAmbient()
  if (!sound) return

  const { ctx: context, master: out } = ensureContext()
  if (context.state === 'suspended') await context.resume()

  out.gain.value = volume
  const bus = context.createGain()
  bus.gain.value = 1
  bus.connect(out)

  const sources: AudioNode[] = []
  const timers: number[] = []

  switch (sound.kind) {
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
        o.frequency.linearRampToValueAtTime(
          o.frequency.value + 400,
          context.currentTime + 0.12,
        )
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
  }

  active = { gain: bus, sources, timers }
}

export function setAmbientVolume(volume: number) {
  if (master) master.gain.value = Math.max(0, Math.min(1, volume))
}

export function stopAmbient() {
  if (!active) return
  for (const t of active.timers) window.clearInterval(t)
  for (const node of active.sources) {
    try {
      if ('stop' in node && typeof node.stop === 'function') node.stop()
    } catch {
      /* already stopped */
    }
    try {
      node.disconnect()
    } catch {
      /* already disconnected */
    }
  }
  try {
    active.gain.disconnect()
  } catch {
    /* ignore */
  }
  active = null
}

const alertPresets: Record<AlertSoundId, { freqs: number[]; type: OscillatorType; gap: number }> = {
  chime: { freqs: [523.25, 659.25, 783.99], type: 'sine', gap: 0.12 },
  bell: { freqs: [392, 523.25], type: 'triangle', gap: 0.18 },
  soft: { freqs: [349.23, 440], type: 'sine', gap: 0.2 },
  bright: { freqs: [659.25, 880, 1046.5], type: 'sine', gap: 0.09 },
  wood: { freqs: [220, 277.18], type: 'square', gap: 0.08 },
}

export function playChime(id: AlertSoundId = 'chime') {
  const { ctx: context, master: out } = ensureContext()
  void context.resume()
  const preset = alertPresets[id] ?? alertPresets.chime
  const now = context.currentTime
  const volume = id === 'wood' ? 0.08 : 0.16
  preset.freqs.forEach((freq, i) => {
    const osc = context.createOscillator()
    const gain = context.createGain()
    osc.type = preset.type
    osc.frequency.value = freq
    gain.gain.value = 0
    osc.connect(gain)
    gain.connect(out)
    const t = now + i * preset.gap
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(volume, t + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55)
    osc.start(t)
    osc.stop(t + 0.6)
  })
}
