import { BUILD, type BuildItem } from '../content/build';
import type { Exercise, Level, Unit } from '../content/types';
import type { RunnerItem } from '../components/ExerciseRunner';
import { setState, type AppState } from './store';

export const buildKey = (b: BuildItem) => `build:${b.answers[0]}`;

export function buildExercise(b: BuildItem): Exercise {
  return { kind: 'build', prompt: b.cues.join(' · '), cues: b.cues, task: b.task, es: b.es, answers: b.answers };
}

const unitFor = (b: BuildItem): Unit => ({ id: `build-${b.topic}`, level: b.level, axis: 'Estructura', title: 'Armá la frase', prereqs: [], explanation: [], examples: [], trap: '', exercises: [] });

const LEVEL_ORDER: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

/**
 * Una tanda: primero lo que te costó, después frases nuevas del tema (o de tu nivel y el siguiente si es mezcla).
 * Las que ya hiciste bien quedan al final, así casi todo es nuevo.
 */
export function buildSession(s: AppState, opts: { topic?: string; level?: Level; n?: number }, rand = Math.random): RunnerItem[] {
  const n = opts.n ?? 10;
  const missed = new Set(s.build?.missed ?? []);
  const doneOk = new Set(Object.keys(s.build?.done ?? {}));
  let pool = BUILD.filter((b) => !opts.topic || b.topic === opts.topic);
  if (!opts.topic && opts.level) {
    const i = LEVEL_ORDER.indexOf(opts.level);
    pool = pool.filter((b) => {
      const j = LEVEL_ORDER.indexOf(b.level);
      return j >= i - 1 && j <= i + 1;
    });
  }
  const shuffled = pool.map((b) => ({ b, k: rand() })).sort((x, y) => x.k - y.k).map((x) => x.b);
  const rank = (b: BuildItem) => (missed.has(buildKey(b)) ? 0 : doneOk.has(buildKey(b)) ? 2 : 1);
  const picked = shuffled.sort((x, y) => rank(x) - rank(y)).slice(0, n);
  return picked.map((b) => ({ key: buildKey(b), unit: unitFor(b), exercise: buildExercise(b) }));
}

export function recordBuild(key: string, ok: boolean) {
  setState((s) => {
    const b = s.build ?? { missed: [], done: {} };
    const missed = ok ? b.missed.filter((k) => k !== key) : b.missed.includes(key) ? b.missed : [...b.missed, key];
    const done = ok ? { ...b.done, [key]: (b.done[key] ?? 0) + 1 } : b.done;
    return { ...s, build: { missed, done } };
  });
}

export const buildStats = (s: AppState, topic?: string) => {
  const items = BUILD.filter((b) => !topic || b.topic === topic);
  const done = items.filter((b) => s.build?.done[buildKey(b)]).length;
  return { done, total: items.length };
};
