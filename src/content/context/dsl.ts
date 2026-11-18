import type { DialogueLine, Exercise } from '../types';

/**
 * Catálogo de expresiones: phrasal verbs, modales, expresiones coloquiales, inglés de Australia, combinaciones
 * naturales y contracciones. Cada una se muestra en varias estructuras y tiempos (nunca sola).
 */
export type ExprType = 'phrasal' | 'modal' | 'coloquial' | 'australia' | 'combinacion' | 'adjetivo' | 'contraccion';

export const EXPR_TYPE_LABEL: Record<ExprType, string> = {
  phrasal: 'Phrasal verb',
  modal: 'Modal',
  coloquial: 'Coloquial',
  australia: 'Australia',
  combinacion: 'Combinación natural',
  adjetivo: 'Adjetivo / descripción',
  contraccion: 'Inglés hablado',
};

export interface Expression {
  id: string;
  /** Forma base, como se busca (figure out, reckon, should have + participio…). */
  en: string;
  es: string;
  type: ExprType;
  register: 'muy informal' | 'informal' | 'neutro' | 'formal';
  /** Frecuencia de uso: 3 = la vas a escuchar todo el tiempo, 1 = de vez en cuando. */
  freq: 1 | 2 | 3;
  /** Pronunciación aproximada para hispanohablantes. */
  say?: string;
  /** Cuándo se usa, matices y significados según el contexto. */
  note: string;
  /** La misma expresión en distintos tiempos y estructuras: [estructura, inglés, español]. */
  forms: [string, string, string][];
  /** Diferencia con expresiones parecidas. */
  vs?: string;
  /** Formas que cuentan como «usarla» en una oración (para buscarla en los ejercicios). */
  match?: string[];
}

export const x = (
  id: string,
  en: string,
  es: string,
  type: ExprType,
  register: Expression['register'],
  freq: Expression['freq'],
  note: string,
  forms: [string, string, string][],
  more: { say?: string; vs?: string; match?: string[] } = {},
): Expression => ({ id, en, es, type, register, freq, note, forms, ...more });

// ───── Diálogo ─────
export const line = (who: string, en: string, es: string, parts: [string, string][] = [], swap: [string, string, string][] = []): DialogueLine => ({ who, en, es, parts, swap });

// ───── Ejercicios (atajos) ─────
type W = { why?: string; wrong?: Record<string, string> };
export const ch = (prompt: string, options: string[], answer: number, why?: string, context?: string): Exercise => ({ kind: 'choice', prompt, options, answer, ...(why ? { why } : {}), ...(context ? { context } : {}) });
/** Completar: `es` = qué significa la oración (se muestra como contexto). */
export const ty = (prompt: string, answers: string[], why?: string, es?: string): Exercise => ({ kind: 'type', prompt, answers, ...(why ? { why } : {}), ...(es ? { context: es } : {}) });
export const fx = (prompt: string, answers: string[], why?: string, hint?: string): Exercise => ({ kind: 'fix', prompt, answers, ...(why ? { why } : {}), ...(hint ? { hint } : {}) });
export const tr = (prompt: string, answers: string[], hint?: string, w: W = {}): Exercise => ({ kind: 'translate', prompt, answers, ...(hint ? { hint } : {}), ...w });
export const ls = (en: string, more: string[] = []): Exercise => ({ kind: 'listen', prompt: en, answers: [en, ...more] });
export const sp = (en: string, es: string): Exercise => ({ kind: 'speak', prompt: en, es });
export const tf = (prompt: string, task: string, answers: string[], why?: string, hint?: string): Exercise => ({ kind: 'transform', prompt, task, answers, ...(why ? { why } : {}), ...(hint ? { hint } : {}) });
export const bd = (cues: string[], task: string, es: string, answers: string[], hint?: string): Exercise => ({ kind: 'build', prompt: cues.join(' / '), cues, task, es, answers, ...(hint ? { hint } : {}) });
export const cr = (prompt: string, accept: string[], example: string, hint?: string, question?: boolean): Exercise => ({ kind: 'create', prompt, accept, example, ...(hint ? { hint } : {}), ...(question ? { question } : {}) });
export const rs = (who: string, prompt: string, es: string, examples: string[], accept?: string[]): Exercise => ({ kind: 'respond', who, prompt, es, examples, ...(accept ? { accept } : {}) });

/** Ordenar palabras: el orden mezclado es fijo (no depende del azar) para que se pueda revisar. */
export const od = (es: string, en: string): Exercise => {
  const words = en.replace(/[.?!]$/, '').split(' ');
  const mixed = words.map((w, i) => ({ w, k: (i * 7 + 3) % (words.length + 2) })).sort((a, b) => a.k - b.k).map((p) => p.w);
  if (mixed.join(' ') === words.join(' ')) mixed.reverse();
  return { kind: 'order', prompt: es, words: mixed, answers: [en] };
};
