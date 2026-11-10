import type { Exercise, Unit } from '../content/types';
import { UNITS } from '../content/curriculum';
import { generate, supports, type Pattern } from '../gen/generate';
import type { RunnerItem } from '../components/ExerciseRunner';
import { recentlySeen } from './store';

/**
 * Escalera de cada unidad: de muy fácil a difícil. Cada escalón se desbloquea al dominar el anterior.
 * 1 Explicación · 2 Reconocer · 3 Completar · 4 Transformar · 5 Construir · 6 Fluidez (contra reloj)
 */
export interface Step {
  id: 'explain' | 'recognize' | 'complete' | 'transform' | 'build' | 'fluency';
  title: string;
  desc: string;
}

export const STEPS: Step[] = [
  { id: 'explain', title: 'Explicación', desc: 'Cómo se forma, cuándo se usa y la trampa del español' },
  { id: 'recognize', title: 'Reconocer', desc: 'Elegí la forma correcta' },
  { id: 'complete', title: 'Completar', desc: 'Escribí solo la parte que falta' },
  { id: 'transform', title: 'Transformar', desc: 'Corregí o cambiá la oración' },
  { id: 'build', title: 'Construir', desc: 'Ordená y traducí oraciones completas' },
  { id: 'fluency', title: 'Fluidez', desc: 'Todo mezclado, contra reloj' },
];

export { STEP_PASS } from './actions';
const PER_STEP = 8;
const FLUENCY_ITEMS = 10;

const shuffle = <T,>(a: T[]) => a.map((x) => ({ x, k: Math.random() })).sort((p, q) => p.k - q.k).map((p) => p.x);

/** Oraciones en inglés de la unidad, para armar ejercicios de ordenar palabras. */
export function unitSentences(unit: Unit): { en: string; es?: string }[] {
  const out: { en: string; es?: string }[] = unit.examples.filter(([en]) => !/[→·]/.test(en)).map(([en, es]) => ({ en, es }));
  for (const e of unit.exercises) {
    if (e.kind === 'translate') out.push({ en: e.answers[0], es: e.prompt });
    else if ((e.kind === 'fix' || e.kind === 'listen') && e.answers[0].split(' ').length >= 3) out.push({ en: e.answers[0] });
  }
  const seen = new Set<string>();
  return out.filter((s) => (seen.has(s.en) ? false : (seen.add(s.en), true)));
}

export function orderExercise(s: { en: string; es?: string }): Exercise {
  const words = s.en.replace(/[.?!]$/, '').split(' ');
  let w = shuffle(words);
  for (let i = 0; i < 5 && w.join(' ') === words.join(' '); i++) w = shuffle(words);
  return { kind: 'order', prompt: s.es ?? '', words: w, answers: [s.en] };
}

/** Ejercicios fijos de la unidad: primero los que no viste hace poco, en orden al azar. */
const curated = (unit: Unit, kinds: Exercise['kind'][]): RunnerItem[] => {
  const seen = recentlySeen(unit.id);
  const all = unit.exercises.map((exercise, i) => ({ key: `${unit.id}#${i}`, unit, exercise })).filter((x) => kinds.includes(x.exercise.kind));
  const fresh = shuffle(all.filter((x) => !seen(x.exercise.prompt)));
  return [...fresh, ...shuffle(all.filter((x) => seen(x.exercise.prompt)))];
};

/** Ejercicios generados: oraciones distintas entre sí y, si se puede, que no hayas visto hace poco. */
const gen = (unit: Unit, pattern: Pattern, n: number): RunnerItem[] => {
  if (!supports(unit.id, pattern)) return [];
  const seen = recentlySeen(unit.id);
  const used = new Set<string>();
  const out: RunnerItem[] = [];
  for (let i = 0; i < n; i++) {
    let pick: Exercise | null = null;
    for (let t = 0; t < 15; t++) {
      const ex = generate(unit.id, pattern);
      if (!ex) continue;
      const k = ex.prompt.toLowerCase();
      if (used.has(k)) continue;
      pick = ex;
      if (!seen(ex.prompt)) break;
    }
    if (pick) {
      used.add(pick.prompt.toLowerCase());
      out.push({ key: `${unit.id}@${pattern}`, unit, exercise: pick });
    }
  }
  return out;
};

const orders = (unit: Unit, n: number): RunnerItem[] =>
  shuffle(unitSentences(unit).map((s, j) => ({ s, j })))
    .slice(0, n)
    .map(({ s, j }) => ({ key: `${unit.id}#o${j}`, unit, exercise: orderExercise(s) }));

/** Ejercicios de un escalón. Con generador o banco, cada vez trae oraciones nuevas. */
export function stepItems(unit: Unit, step: Step['id']): RunnerItem[] {
  const take = (items: RunnerItem[], n = PER_STEP) => shuffle(items).slice(0, n);
  switch (step) {
    case 'explain':
      return [];
    case 'recognize':
      return take([...(curated(unit, ['choice', 'sound'])).slice(0, 3), ...gen(unit, 'recognize', PER_STEP)]);
    case 'complete':
      return take([...(curated(unit, ['type', 'listen'])).slice(0, 3), ...gen(unit, 'complete', PER_STEP)]);
    case 'transform':
      return take([...(curated(unit, ['fix'])).slice(0, 3), ...gen(unit, 'transform', PER_STEP)]);
    case 'build':
      return take([
        ...(curated(unit, ['translate', 'speak'])).slice(0, 3),
        ...gen(unit, 'order', 4),
        ...gen(unit, 'translate', 4),
        ...orders(unit, 2),
      ]);
    case 'fluency':
      return take(
        [
          ...(curated(unit, ['choice', 'type', 'fix', 'translate', 'sound', 'listen'])).slice(0, 3),
          ...gen(unit, 'recognize', 2),
          ...gen(unit, 'complete', 3),
          ...gen(unit, 'transform', 2),
          ...gen(unit, 'translate', 2),
          ...gen(unit, 'order', 2),
          ...orders(unit, 1),
        ],
        FLUENCY_ITEMS,
      );
  }
}

const KINDS: Record<Exclude<Step['id'], 'explain' | 'fluency'>, { kinds: Exercise['kind'][]; patterns: Pattern[] }> = {
  recognize: { kinds: ['choice', 'sound'], patterns: ['recognize'] },
  complete: { kinds: ['type', 'listen'], patterns: ['complete'] },
  transform: { kinds: ['fix'], patterns: ['transform'] },
  build: { kinds: ['translate', 'speak'], patterns: ['order', 'translate'] },
};

/** Escalones con ejercicios en esta unidad (los vacíos se saltean). Se calcula sin generar. */
export function activeSteps(unit: Unit): Step[] {
  return STEPS.filter((s) => {
    if (s.id === 'explain' || s.id === 'fluency') return true;
    const k = KINDS[s.id];
    const curatedCount = unit.exercises.filter((e) => k.kinds.includes(e.kind)).length + (s.id === 'build' ? unitSentences(unit).length : 0);
    return curatedCount >= 2 || k.patterns.some((p) => supports(unit.id, p));
  });
}

/** Segundos esperables por tipo de ejercicio para contar como respuesta fluida. */
export const TIME_LIMIT: Record<Exercise['kind'], number> = {
  choice: 8,
  sound: 6,
  type: 12,
  listen: 20,
  fix: 20,
  transform: 20,
  order: 20,
  translate: 25,
  speak: 15,
  create: 40,
  build: 40,
};

export const unitOf = (id: string) => UNITS.find((u) => u.id === id);
