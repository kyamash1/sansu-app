let ctx: AudioContext | null = null

function getContext(): AudioContext | null {
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  return ctx
}

// ブラウザはユーザー操作のハンドラ内でしか音声を開始させない。
// タッチの pointerdown はその対象外なので、対象になるイベントすべてで解除を試みる。
// iOS はバックグラウンド復帰後に 'interrupted' になるため 'running' 以外はすべて resume する。
export function unlockAudio() {
  const c = getContext()
  if (!c || c.state === 'running') return
  void c.resume().catch(() => {})
  // iOS Safari は resume だけでは解除されないことがあるので無音を1つ鳴らす
  const buffer = c.createBuffer(1, 1, 22050)
  const src = c.createBufferSource()
  src.buffer = buffer
  src.connect(c.destination)
  src.start(0)
}

for (const type of ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'] as const) {
  window.addEventListener(type, unlockAudio, { capture: true, passive: true })
}

function tone(c: AudioContext, type: OscillatorType, freq: number, start: number, duration: number, volume: number) {
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(volume, start + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration)
  osc.connect(gain).connect(c.destination)
  osc.start(start)
  osc.stop(start + duration + 0.02)
}

function play(schedule: (c: AudioContext, t: number) => void) {
  const c = getContext()
  if (!c) return
  if (c.state === 'running') {
    schedule(c, c.currentTime)
    return
  }
  c.resume()
    .then(() => schedule(c, c.currentTime))
    .catch(() => {})
}

// ピンポン♪
export function playCorrect() {
  play((c, t) => {
    tone(c, 'sine', 1318.5, t, 0.25, 0.35)
    tone(c, 'sine', 1046.5, t + 0.13, 0.45, 0.35)
  })
}

// ブッブー
export function playWrong() {
  play((c, t) => {
    tone(c, 'square', 140, t, 0.14, 0.12)
    tone(c, 'square', 140, t + 0.18, 0.32, 0.12)
  })
}
