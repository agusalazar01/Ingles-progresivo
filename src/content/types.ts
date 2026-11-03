export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
export const LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

/** Ejes del programa. Avanzan en paralelo, con prerrequisitos entre ellos. */
export type Axis = 'Estructura' | 'Verbos' | 'Vocabulario' | 'Sonidos' | 'Escucha';

/** Ejercicios de recuperación activa: el usuario siempre produce o elige la respuesta. */
export type Exercise =
  | { kind: 'choice'; prompt: string; options: string[]; answer: number; explain?: string }
  /** Completar el hueco (___). `answers` son las respuestas aceptadas. */
  | { kind: 'type'; prompt: string; answers: string[]; hint?: string; explain?: string }
  /** Corregir una oración con un error típico de hispanohablantes. */
  | { kind: 'fix'; prompt: string; answers: string[]; hint?: string; explain?: string }
  /** Traducir del español. Si no coincide exacto, se muestra la respuesta modelo y el usuario se autoevalúa. */
  | { kind: 'translate'; prompt: string; answers: string[]; hint?: string; explain?: string }
  /** Dictado: se escucha `prompt` (no se muestra) y se escribe. */
  | { kind: 'listen'; prompt: string; answers: string[]; hint?: string; explain?: string }
  /** Par mínimo: se escucha `options[answer]` con una voz al azar y se elige cuál fue. */
  | { kind: 'sound'; prompt: string; options: string[]; answer: number; explain?: string }
  /** Decir en voz alta `prompt`; el reconocimiento de voz comprueba si se entiende. */
  | { kind: 'speak'; prompt: string; es?: string; explain?: string };

export interface Unit {
  id: string;
  level: Level;
  axis: Axis;
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
