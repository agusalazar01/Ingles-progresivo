export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
export const LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

/** Ejercicios de recuperación activa: el usuario siempre produce o elige la respuesta. */
export type Exercise =
  | { kind: 'choice'; prompt: string; options: string[]; answer: number; explain?: string }
  /** Completar el hueco (___). `answers` son las respuestas aceptadas. */
  | { kind: 'type'; prompt: string; answers: string[]; hint?: string; explain?: string }
  /** Corregir una oración con un error típico de hispanohablantes. */
  | { kind: 'fix'; prompt: string; answers: string[]; hint?: string; explain?: string }
  /** Traducir del español. Si no coincide exacto, se muestra la respuesta modelo y el usuario se autoevalúa. */
  | { kind: 'translate'; prompt: string; answers: string[]; hint?: string; explain?: string };

export interface Unit {
  id: string;
  level: Level;
  title: string;
  /** Unidades que hay que dominar antes. */
  prereqs: string[];
  /** Explicación breve en español (gramática explícita, 1–2 minutos). */
  explanation: string[];
  /** Ejemplos en inglés con traducción. */
  examples: [string, string][];
  /** Trampa típica para hispanohablantes. */
  trap: string;
  exercises: Exercise[];
}

export type Skill = 'gramática' | 'vocabulario' | 'lectura';

export interface PlacementItem {
  id: string;
  level: Level;
  skill: Skill;
  text?: string;
  prompt: string;
  options: string[];
  answer: number;
}
