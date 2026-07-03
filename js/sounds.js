// ============================================================
// sounds.js — Web Audio API generated UI sounds (no asset files)
// ============================================================

let ctx = null;
let enabled = true;

function ensureCtx() {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) { return null; }
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, duration, type = 'sine', volume = 0.08, when = 0) {
  const ac = ensureCtx();
  if (!ac || !enabled) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t = ac.currentTime + when;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(volume, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(t);
  osc.stop(t + duration);
}

export const sounds = {
  setEnabled(on) { enabled = !!on; },
  isEnabled() { return enabled; },

  play(name) {
    if (!enabled) return;
    switch (name) {
      case 'success':
        tone(523.25, 0.12, 'sine', 0.07);
        tone(783.99, 0.15, 'sine', 0.07, 0.06);
        break;
      case 'warning':
        tone(440, 0.18, 'triangle', 0.06);
        break;
      case 'error':
        tone(220, 0.2, 'sawtooth', 0.05);
        tone(180, 0.25, 'sawtooth', 0.05, 0.08);
        break;
      case 'info':
        tone(660, 0.1, 'sine', 0.05);
        break;
      case 'levelup':
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, 0.25, 'sine', 0.09, i * 0.08));
        break;
      case 'achievement':
        tone(659.25, 0.12, 'sine', 0.08);
        tone(880, 0.12, 'sine', 0.08, 0.08);
        tone(1318.51, 0.3, 'sine', 0.08, 0.16);
        break;
      case 'click':
        tone(800, 0.04, 'sine', 0.03);
        break;
      case 'quest':
        tone(587.33, 0.1, 'sine', 0.06);
        tone(880, 0.12, 'sine', 0.06, 0.05);
        break;
    }
  },
};
