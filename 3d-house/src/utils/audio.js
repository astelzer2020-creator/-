/**
 * צלילים עדינים מסונתזים ב-WebAudio — ללא קובצי אודיו חיצוניים.
 */
import { useTourStore } from '../stores/tourStore.js';

let ctx = null;
function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function tone({ freq = 440, to = freq, dur = 0.15, gain = 0.05, type = 'sine' }) {
  if (useTourStore.getState().muted) return;
  const a = ac();
  if (!a) return;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, a.currentTime);
  osc.frequency.exponentialRampToValueAtTime(Math.max(30, to), a.currentTime + dur);
  g.gain.setValueAtTime(gain, a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
  osc.connect(g).connect(a.destination);
  osc.start();
  osc.stop(a.currentTime + dur + 0.02);
}

export const sounds = {
  doorOpen: () => tone({ freq: 180, to: 90, dur: 0.35, gain: 0.06, type: 'triangle' }),
  doorClose: () => tone({ freq: 120, to: 70, dur: 0.22, gain: 0.07, type: 'triangle' }),
  click: () => tone({ freq: 660, to: 520, dur: 0.07, gain: 0.03, type: 'sine' }),
  step: () => tone({ freq: 95, to: 60, dur: 0.07, gain: 0.015, type: 'sine' }),
};
