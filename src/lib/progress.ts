import { LEVELS, type Level, type PlacementItem, type Skill } from '../content/types';
import { PLACEMENT } from '../content/placement';
import { UNITS } from '../content/curriculum';
import type { AppState, TestResult } from './store';
import { activeSteps } from './ladder';

export type UnitStatus = 'locked' | 'available' | 'progress' | 'mastered' | 'placed';

export const isDone = (s: AppState, unitId: string) => !!s.units[unitId]?.status;

export function unitStatus(s: AppState, unitId: string): UnitStatus {
  const p = s.units[unitId];
  if (p?.status === 'mastered') return 'mastered';
  // Ubicada por el test: queda abierta, pero el tic aparece recién al completarla.
  if (p?.status === 'placed') return p.step || s.resume[unitId] ? 'progress' : 'placed';
  const unit = UNITS.find((u) => u.id === unitId)!;
  const open = unit.prereqs.every((id) => isDone(s, id)) && previousLevelDone(s, unit.level);
  if (!open) return 'locked';
  return p?.step || s.resume[unitId] ? 'progress' : 'available';
}

/** Cuánto llevás de la unidad (0–1): escalones aprobados más la parte hecha del escalón en curso. */
export function unitPercent(s: AppState, unitId: string): number {
  const p = s.units[unitId];
  if (p?.status === 'mastered') return 1;
  const total = activeSteps(UNITS.find((u) => u.id === unitId)!).length;
  const step = p?.step ?? 0;
  const r = s.resume[unitId];
  const part = r && r.stepIndex === step && r.queue.length ? Math.min(r.pos / r.queue.length, 0.99) : 0;
  return Math.min((step + part) / total, 1);
}

/** Avance de un grupo de unidades (promedio). */
export const groupPercent = (s: AppState, ids: string[]) => (ids.length ? ids.reduce((a, id) => a + unitPercent(s, id), 0) / ids.length : 0);

/** Unidades que marcan el nivel (la gramática). Las temáticas complementan y no bloquean el nivel siguiente. */
export const coreUnits = (level?: Level) => UNITS.filter((u) => !u.context && (!level || u.level === level));

/** ¿Están todas las unidades (de gramática) del nivel dominadas o ubicadas? */
export const levelUnitsDone = (s: AppState, level: Level) => coreUnits(level).every((u) => isDone(s, u.id));

/** Un nivel se abre cuando el anterior está completo. */
export function previousLevelDone(s: AppState, level: Level): boolean {
  const prev = LEVELS[LEVELS.indexOf(level) - 1];
  return !prev || levelUnitsDone(s, prev);
}

/** Siguiente unidad recomendada: la primera disponible en el orden del camino. */
export function nextUnit(s: AppState) {
  return UNITS.find((u) => unitStatus(s, u.id) === 'progress') ?? UNITS.find((u) => unitStatus(s, u.id) === 'available');
}

/** Nivel estimado según el camino: el nivel más alto con todas sus unidades dominadas, y el avance en el siguiente. */
export function pathLevel(s: AppState): { level: Level | null; next: Level | null; progress: number } {
  let level: Level | null = null;
  for (const L of LEVELS) {
    const units = coreUnits(L);
    if (units.every((u) => isDone(s, u.id))) level = L;
    else break;
  }
  const next = level ? (LEVELS[LEVELS.indexOf(level) + 1] ?? null) : 'A1';
  if (!next) return { level, next: null, progress: 1 };
  const units = coreUnits(next);
  return { level, next, progress: units.filter((u) => isDone(s, u.id)).length / units.length };
}

export const lastTest = (s: AppState): TestResult | undefined => s.tests.at(-1);

export const daysSince = (iso: string, now = new Date()) =>
  Math.floor((now.getTime() - new Date(iso).getTime()) / 86_400_000);

// ───── Test de ubicación adaptativo ─────
// Empieza en B1. Por nivel se hacen 8 preguntas (4 de gramática, 2 de vocabulario y 2 de lectura); con 6 o más correctas se sube, si no se baja.
// Termina cuando ya no hay un nivel nuevo hacia donde moverse.

export const ITEMS_PER_LEVEL = 8;
export const PASS_MARK = 6;
const MIX: Record<Skill, number> = { gramática: 4, vocabulario: 2, lectura: 2 };

export interface PlacementRun {
  current: Level;
  items: PlacementItem[];
  index: number;
  correctInLevel: number;
  tested: Partial<Record<Level, { correct: number; total: number; passed: boolean }>>;
  answers: { item: PlacementItem; correct: boolean }[];
  done: boolean;
}

const shuffled = <T,>(xs: T[], rnd: () => number) =>
  xs
    .map((x) => ({ x, k: rnd() }))
    .sort((a, b) => a.k - b.k)
    .map((e) => e.x);

/** 8 preguntas del nivel, balanceadas por habilidad, con las opciones mezcladas (así la respuesta correcta no cae siempre en el mismo lugar). */
function pick(level: Level, rnd: () => number): PlacementItem[] {
  const pool = PLACEMENT.filter((p) => p.level === level);
  const out: PlacementItem[] = [];
  for (const k of Object.keys(MIX) as Skill[]) out.push(...shuffled(pool.filter((p) => p.skill === k), rnd).slice(0, MIX[k]));
  if (out.length < ITEMS_PER_LEVEL) out.push(...shuffled(pool.filter((p) => !out.includes(p)), rnd).slice(0, ITEMS_PER_LEVEL - out.length));
  return shuffled(out, rnd).map((p) => {
    const order = shuffled(p.options.map((_, i) => i), rnd);
    return { ...p, options: order.map((i) => p.options[i]), answer: order.indexOf(p.answer) };
  });
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

/** Tu nivel: el del último test de ubicación o, si no hay, el más alto que ya aprobaste. */
export function userLevel(s: AppState): Level | null {
  const t = s.tests.at(-1)?.level;
  if (t) return t;
  const passed = LEVELS.filter((l) => s.levels[l]);
  return passed.at(-1) ?? null;
}
