import { getState } from './store';

/**
 * Sonidos cortos generados en el momento con Web Audio (no hay archivos de audio que descargar).
 * Duran menos de un segundo y solo suenan al responder, así que no gastan batería.
 */

let ctx: AudioContext | null = null;
const audio = () => {
  if (!ctx) {
    const C = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
};

interface Note {
  f: number;
  at: number;
  dur: number;
  type?: OscillatorType;
  vol?: number;
  slideTo?: number;
}

function play(notes: Note[], force = false) {
  if (!force && !getState().settings.sounds) return;
  const a = audio();
  if (!a) return;
  const t0 = a.currentTime + 0.01;
  for (const n of notes) {
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = n.type ?? 'sine';
    o.frequency.setValueAtTime(n.f, t0 + n.at);
    if (n.slideTo) o.frequency.exponentialRampToValueAtTime(n.slideTo, t0 + n.at + n.dur);
    const v = n.vol ?? 0.18;
    g.gain.setValueAtTime(0.0001, t0 + n.at);
    g.gain.exponentialRampToValueAtTime(v, t0 + n.at + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + n.at + n.dur);
    o.connect(g).connect(a.destination);
    o.start(t0 + n.at);
    o.stop(t0 + n.at + n.dur + 0.02);
  }
}

/** Acierto: dos notas que suben, brillantes. */
export const sfxCorrect = () =>
  play([
    { f: 784, at: 0, dur: 0.14, type: 'triangle', vol: 0.2 },
    { f: 1175, at: 0.09, dur: 0.24, type: 'triangle', vol: 0.2 },
    { f: 2350, at: 0.09, dur: 0.18, vol: 0.04 },
  ]);

/** Error: un tono grave y suave que baja (no es un castigo, es un aviso). */
export const sfxWrong = () =>
  play([
    { f: 311, at: 0, dur: 0.16, type: 'triangle', vol: 0.16 },
    { f: 233, at: 0.13, dur: 0.28, type: 'triangle', vol: 0.16, slideTo: 207 },
  ]);

/** Racha de aciertos. */
export const sfxCombo = () =>
  play([
    { f: 880, at: 0, dur: 0.1, type: 'triangle' },
    { f: 1109, at: 0.07, dur: 0.1, type: 'triangle' },
    { f: 1319, at: 0.14, dur: 0.1, type: 'triangle' },
    { f: 1760, at: 0.21, dur: 0.3, type: 'triangle' },
  ]);

/** Fin de un escalón: arpegio de festejo. */
export const sfxFinish = () =>
  play([
    { f: 523, at: 0, dur: 0.16, type: 'triangle' },
    { f: 659, at: 0.12, dur: 0.16, type: 'triangle' },
    { f: 784, at: 0.24, dur: 0.16, type: 'triangle' },
    { f: 1047, at: 0.36, dur: 0.45, type: 'triangle', vol: 0.22 },
    { f: 1568, at: 0.36, dur: 0.4, vol: 0.05 },
  ]);

/** Atiende la llamada. */
export const sfxPickup = () =>
  play([
    { f: 660, at: 0, dur: 0.08, type: 'sine', vol: 0.15 },
    { f: 990, at: 0.08, dur: 0.14, type: 'sine', vol: 0.15 },
  ]);

/** Corta la llamada. */
export const sfxHangup = () =>
  play([
    { f: 480, at: 0, dur: 0.12, type: 'sine', vol: 0.14 },
    { f: 360, at: 0.14, dur: 0.18, type: 'sine', vol: 0.14 },
  ]);

/**
 * Tono de llamada (doble timbre como un teléfono fijo: 440 + 480 Hz). Devuelve una función para cortarlo.
 * Suena aunque los efectos estén apagados, porque es parte de la llamada.
 */
export function ringtone(): () => void {
  let stopped = false;
  const ring = () => {
    if (stopped) return;
    const notes: Note[] = [];
    for (const at of [0, 0.5]) {
      notes.push({ f: 440, at, dur: 0.4, vol: 0.09 }, { f: 480, at, dur: 0.4, vol: 0.09 });
    }
    play(notes, true);
  };
  ring();
  const id = setInterval(ring, 3000);
  return () => {
    stopped = true;
    clearInterval(id);
  };
}
