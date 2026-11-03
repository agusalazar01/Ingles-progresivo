import { LEVELS, type Level, type PlacementItem, type Skill } from '../content/types';
import { PLACEMENT } from '../content/placement';
import { UNITS } from '../content/curriculum';
import type { AppState, TestResult } from './store';

export type UnitStatus = 'locked' | 'available' | 'mastered' | 'placed';

export function unitStatus(s: AppState, unitId: string): UnitStatus {
  const p = s.units[unitId];
  if (p) return p.status;
  const unit = UNITS.find((u) => u.id === unitId)!;
  return unit.prereqs.every((id) => s.units[id]) && previousLevelDone(s, unit.level) ? 'available' : 'locked';
}

/** Un nivel se abre recién cuando el anterior está completo: la progresión es estricta. */
export function previousLevelDone(s: AppState, level: Level): boolean {
  const prev = LEVELS[LEVELS.indexOf(level) - 1];
  return !prev || UNITS.filter((u) => u.level === prev).every((u) => s.units[u.id]);
}

/** Siguiente unidad recomendada: la primera disponible en el orden del camino. */
export function nextUnit(s: AppState) {
  return UNITS.find((u) => unitStatus(s, u.id) === 'available');
}

/** Nivel estimado según el camino: el nivel más alto con todas sus unidades dominadas, y el avance en el siguiente. */
export function pathLevel(s: AppState): { level: Level | null; next: Level | null; progress: number } {
  let level: Level | null = null;
  for (const L of LEVELS) {
    const units = UNITS.filter((u) => u.level === L);
    if (units.every((u) => s.units[u.id])) level = L;
    else break;
  }
  const next = level ? (LEVELS[LEVELS.indexOf(level) + 1] ?? null) : 'A1';
  if (!next) return { level, next: null, progress: 1 };
  const units = UNITS.filter((u) => u.level === next);
  return { level, next, progress: units.filter((u) => s.units[u.id]).length / units.length };
}

export const lastTest = (s: AppState): TestResult | undefined => s.tests.at(-1);

export const daysSince = (iso: string, now = new Date()) =>
  Math.floor((now.getTime() - new Date(iso).getTime()) / 86_400_000);

// ───── Test de ubicación adaptativo ─────
// Empieza en B1. Por nivel se hacen 4 preguntas; con 3 o más correctas se sube, si no se baja.
// Termina cuando ya no hay un nivel nuevo hacia donde moverse.

export const ITEMS_PER_LEVEL = 4;
export const PASS_MARK = 3;

export interface PlacementRun {
  current: Level;
  items: PlacementItem[];
  index: number;
  correctInLevel: number;
  tested: Partial<Record<Level, { correct: number; total: number; passed: boolean }>>;
  answers: { item: PlacementItem; correct: boolean }[];
  done: boolean;
}

function pick(level: Level, rnd: () => number): PlacementItem[] {
  return PLACEMENT.filter((p) => p.level === level)
    .map((p) => ({ p, k: rnd() }))
    .sort((a, b) => a.k - b.k)
    .slice(0, ITEMS_PER_LEVEL)
    .map((x) => x.p);
}

export function startPlacement(rnd: () => number = Math.random): PlacementRun {
  return { current: 'B1', items: pick('B1', rnd), index: 0, correctInLevel: 0, tested: {}, answers: [], done: false };
}

export function answerPlacement(run: PlacementRun, correct: boolean, rnd: () => number = Math.random): PlacementRun {
  const item = run.items[run.index];
  const answers = [...run.answers, { item, correct }];
  const correctInLevel = run.correctInLevel + (correct ? 1 : 0);
  if (run.index + 1 < run.items.length) return { ...run, answers, correctInLevel, index: run.index + 1 };

  const passed = correctInLevel >= PASS_MARK;
  const tested = { ...run.tested, [run.current]: { correct: correctInLevel, total: run.items.length, passed } };
  const i = LEVELS.indexOf(run.current);
  const target = passed ? LEVELS[i + 1] : LEVELS[i - 1];
  if (target && !tested[target]) {
    return { current: target, items: pick(target, rnd), index: 0, correctInLevel: 0, tested, answers, done: false };
  }
  return { ...run, tested, answers, correctInLevel, done: true };
}

export function placementResult(run: PlacementRun, now = new Date()): TestResult {
  let level: Level | null = null;
  for (const L of LEVELS) if (run.tested[L]?.passed) level = L;
  const perSkill: TestResult['perSkill'] = {};
  for (const a of run.answers) {
    const k: Skill = a.item.skill;
    const cur = perSkill[k] ?? { correct: 0, total: 0 };
    perSkill[k] = { correct: cur.correct + (a.correct ? 1 : 0), total: cur.total + 1 };
  }
  const perLevel: TestResult['perLevel'] = {};
  for (const L of LEVELS) {
    const t = run.tested[L];
    if (t) perLevel[L] = { correct: t.correct, total: t.total };
  }
  return { date: now.toISOString(), level, perLevel, perSkill };
}
