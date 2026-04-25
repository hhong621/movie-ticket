/** Web Audio SFX: click, pop, and paper-flip (filtered noise). */
export class Sound {
  constructor(context, soundType) {
    this.context = context
    this.soundType = soundType
  }

  init() {
    this.oscillator = this.context.createOscillator()
    this.gainNode = this.context.createGain()

    switch (this.soundType) {
      case 'click': {
        this.oscillator.type = 'triangle'
        this.biquadFilter = this.context.createBiquadFilter()
        this.biquadFilter.type = 'bandpass'
        this.biquadFilter.frequency.value = 10000
        this.biquadFilter.Q.value = 10
        this.oscillator.connect(this.biquadFilter)
        this.biquadFilter.connect(this.gainNode)
        this.gainNode.connect(this.context.destination)
        break
      }
      case 'pop': {
        this.oscillator.type = 'sine'
        this.oscillator.connect(this.gainNode)
        this.gainNode.connect(this.context.destination)
        break
      }
      default:
        throw new Error(`Unknown sound type: ${this.soundType}`)
    }
  }

  play(frequency, gain, time, duration) {
    this.init()
    this.oscillator.frequency.value = frequency
    this.gainNode.gain.setValueAtTime(gain, this.context.currentTime)
    this.oscillator.start(time)
    this.stop(time, duration)
  }

  stop(time, duration) {
    this.gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration)
    this.oscillator.stop(time + duration)
  }
}

const AudioContextCtor = typeof window !== 'undefined'
  ? window.AudioContext || window.webkitAudioContext
  : null

let sharedContext = null
let clickSound = null
let popSound = null

function getAudioContext() {
  if (!sharedContext) {
    if (!AudioContextCtor) {
      return null
    }
    sharedContext = new AudioContextCtor()
  }
  return sharedContext
}

function getClickInstance() {
  const ctx = getAudioContext()
  if (!ctx) return null
  if (!clickSound) clickSound = new Sound(ctx, 'click')
  return clickSound
}

function getPopInstance() {
  const ctx = getAudioContext()
  if (!ctx) return null
  if (!popSound) popSound = new Sound(ctx, 'pop')
  return popSound
}

function resumeIfNeeded(ctx) {
  if (ctx && ctx.state === 'suspended') {
    void ctx.resume()
  }
}

/** Ticket canvas: sharp click on press / release. No-op if muted. */
export function playItemClick(muted) {
  if (muted) return
  const ctx = getAudioContext()
  if (!ctx) return
  resumeIfNeeded(ctx)
  const s = getClickInstance()
  if (!s) return
  const now = ctx.currentTime
  s.play(1600, 5, now, 0.01)
}

function playPopInternal() {
  const ctx = getAudioContext()
  if (!ctx) return
  resumeIfNeeded(ctx)
  const s = getPopInstance()
  if (!s) return
  const now = ctx.currentTime
  s.play(350, 0.4, now, 0.05)
}

/** Mute control: unmute feedback (pop). Not subject to previous mute. */
export function playUnmutePop() {
  playPopInternal()
}

/** Short UI pop (e.g. theme toggle). No-op if muted. */
export function playPop(muted) {
  if (muted) return
  playPopInternal()
}

/** Modal ticket flip: short bandpassed noise + airy sweep (paper turn). No-op if muted. */
export function playPaperFlip(muted) {
  if (muted) return
  const ctx = getAudioContext()
  if (!ctx) return
  resumeIfNeeded(ctx)

  const now = ctx.currentTime
  const duration = 0.14
  const sampleRate = ctx.sampleRate
  const n = Math.max(1, Math.floor(sampleRate * duration))
  const noiseBuf = ctx.createBuffer(1, n, sampleRate)
  const ch = noiseBuf.getChannelData(0)
  for (let i = 0; i < n; i++) {
    ch[i] = Math.random() * 2 - 1
  }

  const noise = ctx.createBufferSource()
  noise.buffer = noiseBuf

  const hp = ctx.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 900
  hp.Q.value = 0.7

  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.setValueAtTime(2000, now)
  bp.frequency.exponentialRampToValueAtTime(800, now + 0.09)
  bp.Q.value = 0.85

  const noiseGain = ctx.createGain()
  noiseGain.gain.setValueAtTime(0, now)
  noiseGain.gain.linearRampToValueAtTime(0.08, now + 0.02)
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration)

  noise.connect(hp)
  hp.connect(bp)
  bp.connect(noiseGain)

  const air = ctx.createOscillator()
  air.type = 'sine'
  air.frequency.setValueAtTime(2000, now)
  air.frequency.exponentialRampToValueAtTime(500, now + 0.11)
  const airGain = ctx.createGain()
  airGain.gain.setValueAtTime(0, now)
  airGain.gain.linearRampToValueAtTime(0.006, now + 0.021)
  airGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.1)
  air.connect(airGain)

  const bus = ctx.createGain()
  bus.gain.value = 1
  noiseGain.connect(bus)
  airGain.connect(bus)
  bus.connect(ctx.destination)

  noise.start(now)
  noise.stop(now + duration + 0.02)
  air.start(now)
  air.stop(now + 0.12)
}
