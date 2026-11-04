import type { Exercise, Level, Unit } from '../content/types';
import { NGSL } from '../content/ngsl';
import type { RunnerItem } from '../components/ExerciseRunner';
import { getState, gradeCard, markActive, setState, type AppState } from './store';

/**
 * Vocabulario por frecuencia (NGSL): las palabras más usadas primero, en bandas por nivel.
 * Palabras nuevas por día → tarjeta de repaso espaciado → producir la palabra en inglés desde el español.
 */
/** Nombre de cada banda (los niveles A1–C1 se muestran solo al evaluar). */
export const BAND_NAME: Record<string, string> = { A1: 'Básicas (1–500)', A2: 'Frecuentes (501–1200)', B1: 'Intermedias (1201–2000)', B2: 'Avanzadas (2001–2801)' };

export const BANDS: { level: Level; from: number; to: number }[] = [
  { level: 'A1', from: 0, to: 500 },
  { level: 'A2', from: 500, to: 1200 },
  { level: 'B1', from: 1200, to: 2000 },
  { level: 'B2', from: 2000, to: 2801 },
];

export const bandWords = (level: Level) => {
  const b = BANDS.find((x) => x.level === level);
  return b ? NGSL.slice(b.from, b.to) : [];
};

export const wordKey = (w: string) => `w:${w}`;
const ES = new Map(NGSL);
export const meaning = (w: string) => ES.get(w) ?? '';

/** Unidad "virtual" para mostrar los ejercicios de vocabulario. */
export const VOCAB_UNIT: Unit = {
  id: 'vocab',
  level: 'A1',
  axis: 'Vocabulario',
  title: 'Vocabulario',
  prereqs: [],
  explanation: [],
  examples: [],
  trap: '',
  exercises: [],
};

export function bandProgress(s: AppState, level: Level) {
  const words = bandWords(level);
  const added = words.filter(([w]) => s.words[w]).length;
  const solid = words.filter(([w]) => (s.cards[wordKey(w)]?.stability ?? 0) >= 7).length;
  return { total: words.length, added, solid };
}

/** Banda en la que conviene estar: la primera sin terminar desde el nivel del test (o A1). */
export function defaultBand(s: AppState): Level {
  const testLevel = s.tests.at(-1)?.level;
  const startIdx = testLevel ? Math.max(0, BANDS.findIndex((b) => b.level === testLevel)) : 0;
  for (const b of BANDS.slice(startIdx)) {
    const p = bandProgress(s, b.level);
    if (p.added < p.total) return b.level;
  }
  return BANDS[BANDS.length - 1].level;
}

export function nextNewWords(s: AppState, level: Level, n: number): [string, string][] {
  return bandWords(level)
    .filter(([w]) => !s.words[w])
    .slice(0, n);
}

/** Resultado de presentar una palabra: la sabía (repaso más espaciado) o no (vuelve pronto). */
export function introduceWord(word: string, known: boolean) {
  setState((s) => {
    let next: AppState = { ...s, words: { ...s.words, [word]: { added: new Date().toISOString(), known } } };
    next = gradeCard(next, wordKey(word), known ? 'good' : 'again');
    return markActive(next);
  });
}

const accepted = (w: string) => {
  // Si otras palabras del NGSL tienen el mismo significado principal, también se aceptan.
  const first = meaning(w).split(/[;,]/)[0].trim();
  return [w, ...NGSL.filter(([x, es]) => x !== w && es.split(/[;,]/)[0].trim() === first).map(([x]) => x)];
};

/** Ejercicio de producción: del español al inglés, con la primera letra como pista. */
export function wordExercise(w: string): Exercise {
  const hint = `${w[0]}${'_'.repeat(Math.max(0, w.length - 1)).split('').join(' ')}`;
  return {
    kind: 'type',
    prompt: `«${meaning(w)}» → ${hint} (${w.length} letras)`,
    answers: accepted(w),
    hint: `Empieza con «${w[0]}».`,
    explain: `${w}: ${meaning(w)}`,
  };
}

export function wordItem(w: string): RunnerItem {
  return { key: wordKey(w), unit: VOCAB_UNIT, exercise: wordExercise(w) };
}

/** Palabras ya estudiadas de la banda del nivel, para el examen de cierre. */
export function vocabExamItems(level: Level, n: number): RunnerItem[] {
  const s = getState();
  const pool = bandWords(level).filter(([w]) => s.words[w]);
  return pool
    .map((x) => ({ x, k: Math.random() }))
    .sort((a, b) => a.k - b.k)
    .slice(0, n)
    .map(({ x }) => wordItem(x[0]));
}
