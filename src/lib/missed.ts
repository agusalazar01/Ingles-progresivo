/**
 * Lo que te salió mal en los escalones de una unidad vuelve cuando entrás a esa unidad, pero con otra
 * oración del mismo formato (mismo tipo de ejercicio y misma consigna: «Convertila en pregunta»,
 * «Cambiá a: …», el mismo tiempo verbal…). Así practicás lo que te costó sin memorizar la respuesta.
 */
import type { Exercise, Unit } from '../content/types';
import type { RunnerItem } from '../components/ExerciseRunner';
import { generate, type Pattern } from '../gen/generate';
import { normalize } from './answer';
import { orderExercise, unitSentences } from './ladder';
import { getState, setState, type MissedItem } from './store';

const MAX_PER_UNIT = 20;

/** Formato de un ejercicio: tipo + consigna + pista, sin las palabras concretas entre «…». */
export function exerciseSig(ex: Exercise): string {
  const strip = (s?: string) => (s ?? '').replace(/«[^»]*»/g, '«»').trim();
  const task = 'task' in ex ? strip(ex.task) : '';
  const hint = 'hint' in ex ? strip(ex.hint) : '';
  return [ex.kind, task, hint].join('|');
}

/** Qué generador produce cada tipo de ejercicio. */
const PATTERN_OF: Partial<Record<Exercise['kind'], Pattern>> = {
  choice: 'recognize',
  type: 'complete',
  transform: 'transform',
  order: 'order',
  translate: 'translate',
};

export const missedFor = (unitId: string): MissedItem[] => getState().missed?.[unitId] ?? [];

/** Anota un ejercicio que salió mal (si ya hay uno del mismo formato, no se repite). */
export function addMissed(unitId: string, key: string, exercise: Exercise) {
  const sig = exerciseSig(exercise);
  setState((s) => {
    const list = s.missed?.[unitId] ?? [];
    if (list.some((m) => m.sig === sig && m.key === key)) return s;
    const item: MissedItem = { id: Math.random().toString(36).slice(2, 10), key, sig, exercise, date: new Date().toISOString() };
    return { ...s, missed: { ...(s.missed ?? {}), [unitId]: [...list, item].slice(-MAX_PER_UNIT) } };
  });
}

export function removeMissed(unitId: string, id: string) {
  setState((s) => {
    const list = (s.missed?.[unitId] ?? []).filter((m) => m.id !== id);
    return { ...s, missed: { ...(s.missed ?? {}), [unitId]: list } };
  });
}

/** Otro ejercicio con el mismo formato que `m` pero con otra oración. Si no hay otro posible, el mismo. */
export function variantOf(unit: Unit, m: MissedItem): Exercise {
  const old = normalize(m.exercise.prompt);
  const differs = (ex: Exercise) => normalize(ex.prompt) !== old;
  const pattern = m.key.match(/@(\w+)$/)?.[1] as Pattern | undefined;
  const gp = pattern ?? PATTERN_OF[m.exercise.kind];

  // Generados: se pide otra oración hasta que salga una con la misma consigna.
  if (gp) {
    let loose: Exercise | null = null;
    for (let i = 0; i < 60; i++) {
      const ex = generate(unit.id, gp);
      if (!ex || ex.kind !== m.exercise.kind || !differs(ex)) continue;
      if (exerciseSig(ex) === m.sig) return ex;
      loose ??= ex;
    }
    if (loose && pattern) return loose;
  }
  // Ordenar palabras: otra oración de la unidad.
  if (m.exercise.kind === 'order') {
    const others = unitSentences(unit).filter((x) => normalize(x.en) !== normalize(m.exercise.kind === 'order' ? m.exercise.answers[0] : ''));
    if (others.length) return orderExercise(others[Math.floor(Math.random() * others.length)]);
  }
  // Del banco de la unidad: otro del mismo tipo.
  const same = unit.exercises.filter((e) => e.kind === m.exercise.kind && differs(e));
  if (same.length) return same[Math.floor(Math.random() * same.length)];
  return m.exercise;
}

/** Ejercicios para repasar lo que te costó en la unidad (cada uno con oración nueva). */
export function missedItems(unit: Unit): { items: RunnerItem[]; ids: string[] } {
  const list = missedFor(unit.id);
  return {
    items: list.map((m) => ({ key: m.key, unit, exercise: variantOf(unit, m) })),
    ids: list.map((m) => m.id),
  };
}
