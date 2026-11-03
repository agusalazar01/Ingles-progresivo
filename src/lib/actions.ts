import { LEVELS } from '../content/types';
import { UNITS } from '../content/units';
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
    }
    return markActive(next);
  });
}

export interface ItemResult {
  key: string;
  unitId: string;
  prompt: string;
  given: string;
  correct: string;
  outcome: Outcome;
}

/** Registra una respuesta de repaso: reprograma la tarjeta y actualiza el registro de errores. */
export function recordReview(r: ItemResult) {
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

/** Termina una lección. Si el primer intento llegó al umbral, la unidad queda dominada y sus tarjetas arrancan con esa calificación. */
export function finishLesson(unitId: string, firstTry: ItemResult[], mastered: boolean) {
  setState((s) => {
    let next = s;
    for (const r of firstTry) if (r.outcome === 'again') next = logError(next, r);
    if (mastered) {
      const score = firstTry.filter((r) => r.outcome === 'good').length / firstTry.length;
      next = { ...next, units: { ...next.units, [unitId]: { status: 'mastered', date: new Date().toISOString(), score } } };
      for (const r of firstTry) next = gradeCard(next, r.key, r.outcome);
    }
    return markActive(next);
  });
}

export const MASTERY = 0.85;

export function exerciseRef(key: string) {
  const [unitId, idx] = key.split('#');
  const unit = UNITS.find((u) => u.id === unitId);
  const exercise = unit?.exercises[Number(idx)];
  return unit && exercise ? { key, unit, exercise } : null;
}

export const allKeys = (unitId: string) => UNITS.find((u) => u.id === unitId)!.exercises.map((_, i) => cardKey(unitId, i));
