import { LEVELS, type Level } from '../content/types';
import { generate, type Pattern } from '../gen/generate';
import { orderExercise, unitSentences } from './ladder';
import { wordItem } from './vocab';
import { stageItem, workshopVerb, type VStage } from '../gen/verbs';
import type { Unit } from '../content/types';

/** Unidad "virtual" del taller de verbos (para mostrar los ejercicios). */
export const VERB_UNIT: Unit = { id: 'verbs', level: 'A1', axis: 'Verbos', title: 'Taller de verbos', prereqs: [], explanation: [], examples: [], trap: '', exercises: [] };

/** Resultado de una etapa del taller de verbos. */
export function completeVerbStage(verbId: string, stage: number, firstTry: ItemResult[], passed: boolean) {
  setState((s) => {
    let next = s;
    for (const r of firstTry) if (r.outcome === 'again') next = logError(next, r);
    const rank: Record<Outcome, number> = { again: 0, hard: 1, good: 2, skip: 3 };
    const worst = new Map<string, Outcome>();
    for (const r of firstTry) {
      const prev = worst.get(r.key);
      if (!prev || rank[r.outcome] < rank[prev]) worst.set(r.key, r.outcome);
    }
    for (const [key, outcome] of worst) next = gradeCard(next, key, outcome);
    if (passed) next = { ...next, verbs: { ...next.verbs, [verbId]: Math.max(next.verbs[verbId] ?? 0, stage + 1) } };
    return markActive(next);
  });
}
import { UNITS } from '../content/curriculum';
import {
  cardKey,
  clearError,
  gradeCard,
  logError,
  markActive,
  seedPlacedCards,
  setState,
  type Outcome,
  type TestResult,
} from './store';

/** Guarda el resultado del test y marca como "ubicadas" las unidades hasta ese nivel; sus tarjetas entran a repaso de a poco. */
export function applyPlacement(result: TestResult) {
  setState((s) => {
    let next = { ...s, tests: [...s.tests, result], units: { ...s.units } };
    if (result.level) {
      const max = LEVELS.indexOf(result.level);
      let day = 1;
      for (const u of UNITS) {
        if (LEVELS.indexOf(u.level) > max || next.units[u.id]) continue;
        next.units[u.id] = { status: 'placed', date: result.date };
        next = seedPlacedCards(next, u.id, day);
        day = Math.min(day + 1, 14);
      }
      next = { ...next, levels: { ...next.levels } };
      for (const L of LEVELS.slice(0, max + 1)) next.levels[L] ??= { date: result.date, score: 1 };
    }
    return markActive(next);
  });
}

/** Unidades agregadas en versiones nuevas: si ya hiciste el test, las de tu nivel o menos quedan ubicadas (y entran a repaso). */
export function syncPlacedUnits() {
  setState((s) => {
    const level = s.tests.at(-1)?.level;
    if (!level) return s;
    const max = LEVELS.indexOf(level);
    let next = { ...s, units: { ...s.units }, levels: { ...s.levels } };
    let day = 1;
    let changed = false;
    for (const L of LEVELS.slice(0, max + 1))
      if (!next.levels[L]) {
        next.levels[L] = { date: new Date().toISOString(), score: 1 };
        changed = true;
      }
    for (const u of UNITS) {
      if (LEVELS.indexOf(u.level) > max || next.units[u.id]) continue;
      next.units[u.id] = { status: 'placed', date: new Date().toISOString() };
      next = seedPlacedCards(next, u.id, day);
      day = Math.min(day + 1, 14);
      changed = true;
    }
    return changed ? next : s;
  });
}

export interface ItemResult {
  key: string;
  unitId: string;
  prompt: string;
  given: string;
  correct: string;
  outcome: Outcome;
  ms?: number;
}

/** Registra una respuesta de repaso: reprograma la tarjeta y actualiza el registro de errores. */
export function recordReview(r: ItemResult) {
  if (r.outcome === 'skip') return;
  setState((s) => {
    let next = gradeCard(s, r.key, r.outcome);
    next = { ...next, stats: { reviews: s.stats.reviews + 1, correct: s.stats.correct + (r.outcome === 'again' ? 0 : 1) } };
    if (r.outcome === 'again') next = logError(next, r);
    else if (r.outcome === 'good' && next.errors[r.key]) {
      // Si un error viejo ahora sale bien a la primera, baja su contador; en 0 desaparece.
      const e = next.errors[r.key];
      next = e.count <= 1 ? clearError(next, r.key) : { ...next, errors: { ...next.errors, [r.key]: { ...e, count: e.count - 1 } } };
    }
    return markActive(next);
  });
}

/** Resultado de un escalón: las tarjetas de repaso arrancan con lo que pasó en el primer intento. */
export function completeStep(unitId: string, stepIndex: number, lastStep: number, firstTry: ItemResult[], passed: boolean) {
  setState((s) => {
    let next = s;
    for (const r of firstTry) if (r.outcome === 'again') next = logError(next, r);
    // Una calificación por tarjeta (los ejercicios generados comparten tarjeta por tipo).
    const worst = new Map<string, Outcome>();
    const rank: Record<Outcome, number> = { again: 0, hard: 1, good: 2, skip: 3 };
    for (const r of firstTry) {
      const prev = worst.get(r.key);
      if (!prev || rank[r.outcome] < rank[prev]) worst.set(r.key, r.outcome);
    }
    for (const [key, outcome] of worst) next = gradeCard(next, key, outcome);
    if (passed) {
      const cur = next.units[unitId] ?? { date: new Date().toISOString() };
      const step = Math.max(cur.step ?? 0, stepIndex + 1);
      const done = step >= lastStep + 1;
      next = {
        ...next,
        units: { ...next.units, [unitId]: { ...cur, step, date: new Date().toISOString(), ...(done ? { status: 'mastered' as const } : {}) } },
      };
    }
    return markActive(next);
  });
}

/** Marca leída la explicación (primer escalón). */
export function readExplanation(unitId: string) {
  setState((s) => {
    const cur = s.units[unitId] ?? { date: new Date().toISOString() };
    if ((cur.step ?? 0) >= 1 || cur.status === 'mastered') return s;
    return { ...s, units: { ...s.units, [unitId]: { ...cur, step: 1 } } };
  });
}

/** Guarda el mejor resultado de la prueba de práctica del nivel. */
export function saveLevelScore(level: Level, score: number) {
  setState((s) => {
    const prev = s.levels[level];
    if (prev && prev.score >= score) return markActive(s);
    return markActive({ ...s, levels: { ...s.levels, [level]: { date: new Date().toISOString(), score } } });
  });
}

export const STEP_PASS = 0.8;

/** Reconstruye un ejercicio a partir de su clave de repaso. Los generados traen una oración nueva. */
export function exerciseRef(key: string) {
  if (key.startsWith('w:')) return wordItem(key.slice(2));
  const vm = key.match(/^v:(.+)@(\w+)$/);
  if (vm) {
    const v = workshopVerb(vm[1]);
    return v ? { key, unit: VERB_UNIT, exercise: stageItem(v, vm[2] as VStage['id']) } : null;
  }
  const gm = key.match(/^(.+)@(\w+)$/);
  if (gm) {
    const unit = UNITS.find((u) => u.id === gm[1]);
    const exercise = unit ? generate(unit.id, gm[2] as Pattern) : null;
    return unit && exercise ? { key, unit, exercise } : null;
  }
  const om = key.match(/^(.+)#o(\d+)$/);
  if (om) {
    const unit = UNITS.find((u) => u.id === om[1]);
    const s = unit ? unitSentences(unit)[Number(om[2])] : undefined;
    return unit && s ? { key, unit, exercise: orderExercise(s) } : null;
  }
  const [unitId, idx] = key.split('#');
  const unit = UNITS.find((u) => u.id === unitId);
  const exercise = unit?.exercises[Number(idx)];
  return unit && exercise ? { key, unit, exercise } : null;
}

export const allKeys = (unitId: string) => UNITS.find((u) => u.id === unitId)!.exercises.map((_, i) => cardKey(unitId, i));
