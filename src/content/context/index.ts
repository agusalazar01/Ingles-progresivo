import type { Exercise, Unit } from '../types';
import type { Expression } from './dsl';
import { MODAL_EXPR } from './modals';
import { GREETINGS_EXPR, GREETINGS_UNIT } from './u-greetings';
import { FOOD_EXPR, FOOD_UNIT } from './u-food';
import { PLANS_EXPR, PLANS_UNIT } from './u-plans';
import { BEACH_EXPR, BEACH_UNIT } from './u-beach';
import { TRANSPORT_EXPR, TRANSPORT_UNIT } from './u-transport';
import { HOUSE_EXPR, HOUSE_UNIT } from './u-house';
import { PROBLEMS_EXPR, PROBLEMS_UNIT } from './u-problems';
import { WORK_EXPR, WORK_UNIT } from './u-work';
import { HEALTH_EXPR, HEALTH_UNIT } from './u-health';
import { FEELINGS_EXPR, FEELINGS_UNIT } from './u-feelings';
import { MONEY_EXPR, MONEY_UNIT } from './u-money';
import { STORIES_EXPR, STORIES_UNIT } from './u-stories';

export { EXPR_TYPE_LABEL, type Expression, type ExprType } from './dsl';

/** Unidades temáticas (situaciones reales). Se ubican dentro del camino en `curriculum.ts`. */
export const CONTEXT_UNITS: Unit[] = [
  GREETINGS_UNIT, FOOD_UNIT, PLANS_UNIT, BEACH_UNIT, TRANSPORT_UNIT,
  HOUSE_UNIT, FEELINGS_UNIT, PROBLEMS_UNIT, HEALTH_UNIT, WORK_UNIT, MONEY_UNIT, STORIES_UNIT,
];

/** Catálogo completo, en orden de aparición. */
export const CATALOG: Expression[] = [
  ...GREETINGS_EXPR, ...FOOD_EXPR, ...PLANS_EXPR, ...BEACH_EXPR, ...TRANSPORT_EXPR,
  ...HOUSE_EXPR, ...FEELINGS_EXPR, ...PROBLEMS_EXPR, ...HEALTH_EXPR, ...WORK_EXPR, ...MONEY_EXPR, ...STORIES_EXPR,
  ...MODAL_EXPR,
];

const byId = new Map(CATALOG.map((e) => [e.id, e]));
export const exprById = (id: string) => byId.get(id);

const norm = (s: string) => ` ${s.toLowerCase().replace(/[’]/g, "'").replace(/[^a-z' ]+/g, ' ').replace(/\s+/g, ' ').trim()} `;

/** Formas que cuentan como «usar» la expresión. */
export function exprForms(e: Expression): string[] {
  if (e.match) return e.match;
  return e.en
    .split(/\s*\/\s*|\s*=\s*|\s*≠\s*|\s*·\s*/)
    .map((f) => f.replace(/\(.*?\)|\+.*$/g, '').trim())
    .filter((f) => f.length > 1);
}

/** Texto en inglés de un ejercicio (lo que hay que entender o producir). */
export function exerciseText(e: Exercise): string {
  switch (e.kind) {
    case 'choice':
    case 'sound':
      return `${e.prompt} ${e.options[e.answer]}`;
    case 'create':
      return `${e.example} ${e.accept.join(' ')}`;
    case 'respond':
      return `${e.prompt} ${e.examples.join(' ')}`;
    case 'speak':
      return e.prompt;
    case 'type':
      return `${e.prompt.replace('___', e.answers[0])}`;
    default:
      return `${e.prompt} ${e.answers[0]}`;
  }
}

export const usesExpr = (e: Exercise, ex: Expression) => {
  const t = norm(exerciseText(e));
  return exprForms(ex).some((f) => t.includes(norm(f)));
};

/** Claves de repaso de los ejercicios (de todas las unidades temáticas) que usan la expresión. */
export function exprKeys(ex: Expression, units: Unit[] = CONTEXT_UNITS): string[] {
  return units.flatMap((u) => u.exercises.map((e, i) => ({ e, k: `${u.id}#${i}` })).filter(({ e }) => usesExpr(e, ex)).map(({ k }) => k));
}

/** Unidades donde se enseña cada expresión. */
export const unitsOfExpr = (id: string) => CONTEXT_UNITS.filter((u) => u.context!.expressions.includes(id));
