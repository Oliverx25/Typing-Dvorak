let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function playTone(frequency: number, duration: number, volume = 0.08): void {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = frequency;
  osc.type = 'sine';
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

export function playCorrectSound(): void {
  playTone(880, 0.06);
}

export function playIncorrectSound(): void {
  playTone(220, 0.1, 0.1);
}

export function playCompleteSound(): void {
  playTone(523, 0.1);
  setTimeout(() => playTone(659, 0.1), 80);
  setTimeout(() => playTone(784, 0.15), 160);
}
