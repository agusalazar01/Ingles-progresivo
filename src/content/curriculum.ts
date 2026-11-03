import type { Unit } from './types';
import { VERB_UNITS } from './units';
import { FOUNDATION_UNITS } from './units-foundation';
import { ADVANCED_UNITS } from './units-advanced';

/**
 * Orden del programa: qué conviene saber primero y qué viene después.
 * Basado en la progresión por niveles del Core Inventory (British Council / EAQUALS) y en los cuatro ejes de Nation:
 * input (escucha/lectura), práctica deliberada (estructura, vocabulario), producción (hablar) y fluidez.
 */
const ORDER = [
  // A1 — lo mínimo para armar oraciones
  'to-be', 'pronouns', 'articles-plurals', 'sounds-vowels', 'pres-simple', 'there-is', 'questions',
  'prep-time-place', 'pres-cont', 'can', 'vocab-daily',
  // A2 — contar el pasado y planes, describir y comparar
  'past-simple', 'countables', 'sounds-endings', 'future', 'comparatives', 'past-cont', 'collocations',
  // B1 — experiencias, hipótesis y conectar ideas
  'pres-perfect', 'phrasal-1', 'relatives', 'cond-1-2', 'passive', 'connectors', 'connected-speech',
  // B2 — precisión y naturalidad (romper el techo de B2)
  'pres-perf-cont', 'past-perfect', 'false-friends', 'gerund-inf', 'reported', 'register',
  // C1
  'cond-3', 'past-modals', 'future-perf', 'inversion',
];

const ALL = [...VERB_UNITS, ...FOUNDATION_UNITS, ...ADVANCED_UNITS];

export const UNITS: Unit[] = ORDER.map((id) => {
  const u = ALL.find((x) => x.id === id);
  if (!u) throw new Error(`Unidad desconocida: ${id}`);
  return u;
});

if (UNITS.length !== ALL.length) throw new Error('Hay unidades fuera del orden del programa');

export const unitById = (id: string) => UNITS.find((u) => u.id === id)!;
