let ctx: AudioContext | null = null

// iOS Safari ではユーザー操作のハンドラ内で resume しないと音が出ない
export function unlockAudio() {
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return
    ctx = new Ctor()
  }
  if (ctx.state === 'suspended') void ctx.resume()
}

function tone(type: OscillatorType, freq: number, start: number, duration: number, volume: number) {
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(volume, start + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration)
  osc.connect(gain).connect(ctx.destination)
  osc.start(start)
  osc.stop(start + duration + 0.02)
}

// ピンポン♪
export function playCorrect() {
  if (!ctx) return
  const t = ctx.currentTime
  tone('sine', 1318.5, t, 0.25, 0.35)
  tone('sine', 1046.5, t + 0.13, 0.45, 0.35)
}

// ブッブー
export function playWrong() {
  if (!ctx) return
  const t = ctx.currentTime
  tone('square', 140, t, 0.14, 0.12)
  tone('square', 140, t + 0.18, 0.32, 0.12)
}
