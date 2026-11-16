import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { getState } from './store';

/**
 * Vibración corta que acompaña los momentos clave: acertar, errar, una racha, terminar un escalón y el texto que aparece
 * en las charlas. No vibra por vibrar: solo en esos momentos.
 * Se apaga desde Configuración. En el teléfono usa el motor háptico; en otros lados, la vibración del navegador.
 */

type Hit = 'l' | 'm' | 'h';
const STYLE: Record<Hit, ImpactStyle> = { l: ImpactStyle.Light, m: ImpactStyle.Medium, h: ImpactStyle.Heavy };
const MS: Record<Hit, number> = { l: 10, m: 18, h: 32 };

export const hapticsOn = () => getState().settings.haptics !== false;

function hit(h: Hit) {
  try {
    if (Capacitor.isNativePlatform()) Haptics.impact({ style: STYLE[h] }).catch(() => {});
    else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(MS[h]);
  } catch {
    /* sin vibración disponible */
  }
}

/** Toques sueltos en tiempos fijos [golpe, ms desde el inicio]. */
function play(pattern: [Hit, number][]) {
  if (!hapticsOn()) return;
  for (const [h, at] of pattern) (at === 0 ? hit(h) : setTimeout(() => hapticsOn() && hit(h), at));
}

/** Acierto: tres toques que crecen. */
export const hapticCorrect = () => play([['l', 0], ['l', 110], ['m', 230]]);
/** Error: un golpe y un eco más suave, como un «mm». */
export const hapticWrong = () => play([['m', 0], ['l', 120]]);
/** Racha: sube de a poco. */
export const hapticCombo = () => play([['l', 0], ['l', 70], ['m', 140], ['h', 230]]);
/** Terminar un escalón o unidad: golpes que suben y después toques suaves. */
export const hapticFinish = () =>
  play([['l', 0], ['l', 130], ['m', 280], ['m', 430], ['h', 600], ['l', 900], ['l', 1050], ['l', 1250], ['l', 1500], ['l', 1850]]);
/** Un toque suave (atender o cortar una llamada, mostrar algo). */
export const hapticSoft = () => play([['l', 0]]);

let last = 0;
/** Un tic por palabra mientras aparece el texto (con un mínimo entre toques para no zumbar). */
export function hapticTick() {
  const now = Date.now();
  if (now - last < 110) return;
  last = now;
  play([['l', 0]]);
}
