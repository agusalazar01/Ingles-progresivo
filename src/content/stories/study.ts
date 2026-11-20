import type { Exercise } from '../types';
import { STUDIES_A1 } from './study-a1';
import { STUDIES_A2 } from './study-a2';
import { STUDIES_B1 } from './study-b1';
import { STUDIES_B2 } from './study-b2';
import { STUDIES_C1 } from './study-c1';

/**
 * Análisis de cada cuento libre: el texto original no se toca. Acá va lo que escribimos nosotros alrededor:
 * traducción, desglose de las frases clave, preguntas de comprensión y ejercicios con lo que aparece en el cuento.
 */
export interface StoryStudy {
  storyId: string;
  /** Nivel sugerido en la app (los niveles de Global Storybooks son de lectura infantil, no del MCER). */
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  /** De qué se trata y qué gramática aparece (para mostrar antes de leer). */
  intro: string;
  /** Traducción de cada página. */
  es: string[];
  /** Desglose por página: [fragmento, explicación]. */
  notes: [string, string][][];
  /** Preguntas de comprensión: aparecen después de la página `after` (índice desde 0). */
  questions: { after: number; prompt: string; options: string[]; answer: number; why: string }[];
  /** Palabras del cuento para repasar. */
  vocab: [string, string][];
  /** Ejercicios al terminar, con la gramática y el vocabulario del cuento. */
  exercises: Exercise[];
}

export const STORY_STUDIES: StoryStudy[] = [...STUDIES_A1, ...STUDIES_A2, ...STUDIES_B1, ...STUDIES_B2, ...STUDIES_C1];

export const studyOf = (storyId: string) => STORY_STUDIES.find((s) => s.storyId === storyId);
