import { UNITS } from './curriculum';
import type { Unit } from './types';

/**
 * El camino se muestra por temas gramaticales. Dentro de cada tema, las unidades van de fácil a difícil
 * (en el orden del programa) y se abren por prerrequisitos. Los niveles A1–C1 solo se usan para evaluar.
 */
export interface Theme {
  id: string;
  title: string;
  desc: string;
  units: string[];
}

export const THEMES: Theme[] = [
  { id: 'basics', title: 'Lo básico', desc: 'to be, pronombres, artículos y plurales, there is/are', units: ['to-be', 'pronouns', 'articles-plurals', 'there-is'] },
  { id: 'questions', title: 'Preguntas', desc: 'palabras interrogativas y el orden de la pregunta', units: ['questions'] },
  { id: 'present', title: 'Presente', desc: 'los 4 presentes (simple, continuo, perfecto y perfecto continuo) y can', units: ['pres-simple', 'pres-cont', 'can', 'pres-perfect', 'pres-perf-cont'] },
  { id: 'past', title: 'Pasado', desc: 'los 4 pasados: simple, continuo, perfecto y perfecto continuo', units: ['past-simple', 'past-cont', 'past-perfect', 'past-perf-cont'] },
  { id: 'future', title: 'Futuro', desc: 'los 4 futuros: will / going to, continuo, perfecto y perfecto continuo', units: ['future', 'future-cont', 'future-perf', 'future-perf-cont'] },
  { id: 'conditionals', title: 'Condicionales', desc: 'condicionales 1, 2 y 3, y modales en pasado', units: ['cond-1-2', 'cond-3', 'past-modals'] },
  { id: 'quantity', title: 'Cantidades y comparaciones', desc: 'contables e incontables, comparativos y superlativos', units: ['countables', 'comparatives'] },
  { id: 'prepositions', title: 'Preposiciones', desc: 'in, on y at para tiempo y lugar', units: ['prep-time-place'] },
  { id: 'linking', title: 'Conectar ideas', desc: 'conectores, relativos, gerundio e infinitivo', units: ['connectors', 'relatives', 'gerund-inf'] },
  { id: 'passive-reported', title: 'Pasiva y estilo indirecto', desc: 'se hace, fue hecho, dijo que…', units: ['passive', 'reported'] },
  { id: 'vocab', title: 'Vocabulario y frases', desc: 'rutina, make/do, phrasal verbs, falsos amigos, registro y Australia', units: ['vocab-daily', 'collocations', 'phrasal-1', 'false-friends', 'register', 'aussie'] },
  { id: 'sounds', title: 'Sonidos', desc: 'vocales, finales -s/-ed y habla conectada', units: ['sounds-vowels', 'sounds-endings', 'connected-speech'] },
  { id: 'emphasis', title: 'Énfasis e inversión', desc: 'Never have I…, What I need is…', units: ['inversion'] },
];

const byUnit = new Map<string, Theme>();
for (const t of THEMES) for (const id of t.units) byUnit.set(id, t);

if (byUnit.size !== UNITS.length || UNITS.some((u) => !byUnit.has(u.id))) throw new Error('Hay unidades sin tema');

export const themeOf = (unit: Unit | string) => byUnit.get(typeof unit === 'string' ? unit : unit.id)!;

/** Unidades del tema en el orden del programa (de fácil a difícil). */
export const themeUnits = (t: Theme) => UNITS.filter((u) => t.units.includes(u.id));
