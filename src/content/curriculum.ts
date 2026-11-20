import { EXTRA_ANSWERS } from './extra-answers';
import type { Unit } from './types';
import { VERB_UNITS } from './units';
import { FOUNDATION_UNITS } from './units-foundation';
import { ADVANCED_UNITS } from './units-advanced';
import { EXTRA_FIX } from './fix-bank';
import { TENSE_UNITS } from './units-tenses';
import { CONTEXT_UNITS } from './context';

/**
 * Orden del programa: qué conviene saber primero y qué viene después.
 * Basado en la progresión por niveles del Core Inventory (British Council / EAQUALS) y en los cuatro ejes de Nation:
 * input (escucha/lectura), práctica deliberada (estructura, vocabulario), producción (hablar) y fluidez.
 */
const ORDER = [
  // A1 — lo mínimo para armar oraciones
  'to-be', 'pronouns', 'articles-plurals', 'sounds-vowels', 'pres-simple', 'there-is', 'questions',
  'prep-time-place', 'pres-cont', 'ctx-greetings', 'ctx-family', 'can', 'vocab-daily',
  // A2 — contar el pasado y planes, describir y comparar
  'past-simple', 'countables', 'sounds-endings', 'future', 'ctx-food', 'ctx-shopping', 'ctx-plans', 'comparatives', 'ctx-weather', 'past-cont', 'ctx-beach', 'ctx-transport', 'collocations',
  // B1 — experiencias, hipótesis y conectar ideas
  'pres-perfect', 'ctx-house', 'ctx-feelings', 'future-cont', 'phrasal-1', 'ctx-problems', 'ctx-health', 'ctx-work', 'ctx-jobhunt', 'relatives', 'cond-1-2', 'ctx-money', 'passive', 'connectors', 'aussie', 'connected-speech',
  // B2 — precisión y naturalidad (romper el techo de B2)
  'pres-perf-cont', 'past-perfect', 'ctx-stories', 'past-perf-cont', 'false-friends', 'gerund-inf', 'reported', 'ctx-news', 'register',
  // C1
  'cond-3', 'past-modals', 'future-perf', 'future-perf-cont', 'inversion', 'ctx-debate',
];

const ALL = [...VERB_UNITS, ...FOUNDATION_UNITS, ...ADVANCED_UNITS, ...TENSE_UNITS, ...CONTEXT_UNITS];

export const UNITS: Unit[] = ORDER.map((id) => {
  const u = ALL.find((x) => x.id === id);
  if (!u) throw new Error(`Unidad desconocida: ${id}`);
  return u;
});

// Banco ampliado de «Corregí el error»: se agrega al final para no cambiar las claves de los que ya había.
for (const u of UNITS) {
  const extra = EXTRA_FIX[u.id];
  if (extra) u.exercises.push(...extra.filter((e) => !u.exercises.some((x) => x.prompt === e.prompt)));
}

// Respuestas alternativas igual de correctas.
for (const u of UNITS)
  for (const e of u.exercises) {
    const more = EXTRA_ANSWERS[e.prompt];
    if (more && 'answers' in e) e.answers.push(...more.filter((m) => !e.answers.includes(m)));
  }

if (UNITS.length !== ALL.length) throw new Error('Hay unidades fuera del orden del programa');

export const unitById = (id: string) => UNITS.find((u) => u.id === id)!;
