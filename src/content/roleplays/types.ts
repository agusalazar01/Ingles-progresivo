import type { Level } from '../types';

/**
 * Roleplays: guiones con ramas (sin IA). Cada nodo es un momento de la charla: la otra persona dice algo
 * y vos contestás libre (voz o teclado). La app reconoce tu respuesta con patrones, igual que las
 * llamadas de las unidades:
 *  - cada patrón tiene alternativas separadas por «|» y tienen que aparecer TODOS los patrones de la opción;
 *  - «-ing» = alguna palabra que termine en -ing; «[0-9]» = algún número; «*» = cualquier respuesta.
 * Las opciones se prueban en orden: poné las más específicas primero y una con «*» al final si
 * cualquier respuesta sirve para seguir.
 */
export interface RLine {
  /** Lo que dice la otra persona. Si hay varias, se elige una al azar (para que no sea siempre igual). */
  say: string | string[];
}

export interface ROption {
  match: string[];
  /** Reacción antes de seguir. */
  reply?: string | string[];
  next: string;
  /** Elogio corto en español cuando sale bien. */
  praise?: string;
}

/** Error típico previsto: si tu respuesta coincide, se muestra la corrección explicada. */
export interface RFix {
  /** Expresión regular (sin mayúsculas/minúsculas) que detecta el error en lo que dijiste. */
  wrong: string;
  /** Cómo se dice bien. */
  right: string;
  /** Qué estaba mal y por qué (en español, simple). */
  why: string;
}

export interface RNode extends RLine {
  /** Una respuesta posible (la pista 💡). */
  hint: string;
  /** Qué tenés que lograr en este momento, en español (se muestra si pedís ayuda). */
  aim?: string;
  options: ROption[];
  /** Si después de dos intentos no coincide nada: qué dice la otra persona y a dónde sigue. */
  fallback: { reply?: string; next: string };
  fixes?: RFix[];
}

export interface RVocab {
  en: string;
  es: string;
  /** Pronunciación aproximada para hispanohablantes. */
  say: string;
  example: string;
}

export interface RoleplayScript {
  id: string;
  /** Lugar donde pasa. */
  place: string;
  /** Con quién hablás. */
  partner: { name: string; role: string };
  /** Situación (en español). */
  situation: string;
  /** Objetivo a conseguir (en español). */
  goal: string;
  vocab: RVocab[];
  /** Expresiones australianas que aparecen, con cuándo usarlas. */
  aussie?: { en: string; es: string; when: string }[];
  /** Primer nodo. */
  start: string;
  nodes: Record<string, RNode>;
  /** Lo que dice al cerrar (se agrega solo cuando un nodo sigue a 'end'). */
  closing: string | string[];
}

export interface RoleplayEntry {
  id: string;
  /** Número del catálogo (1–155) o código de rubro. */
  n: string;
  category: string;
  title: string;
  titleEs: string;
  level: Level;
  script?: RoleplayScript;
}
