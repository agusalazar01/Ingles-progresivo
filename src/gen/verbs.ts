import type { Exercise } from '../content/types';
import { NGSL } from '../content/ngsl';
import { ingOf, sentenceEn, TENSE_LABEL, third, verbPhrase, type Pol, type Tense } from './english';
import { ALL_TENSES, _TIMES as TIMES, _verbOk as verbOk, verbSentence } from './generate';
import { SUBJECTS, VERBS, type Verb } from './lexicon';

/**
 * Taller de verbos: cada verbo, de los más frecuentes a los menos, en 4 etapas:
 * 1 Formas (elegir) · 2 Conjugar (escribir) · 3 Completar oraciones en todos los tiempos · 4 Crear oraciones propias.
 */

const rank = (base: string) => {
  const i = NGSL.findIndex(([w]) => w === base.split(' ')[0]);
  return i < 0 ? 9999 : i;
};

/** Un verbo por forma base, ordenados por frecuencia de uso (NGSL). */
export const WORKSHOP: Verb[] = VERBS.filter((v, i) => VERBS.findIndex((x) => x.base === v.base) === i).sort((a, b) => rank(a.base) - rank(b.base));

export const isIrregular = (v: Verb) => !(v.past === regularPast(v.base) && v.pp === v.past);

function regularPast(base: string): string {
  const w = base.split(' ')[0];
  const rest = base.slice(w.length);
  const p = /e$/.test(w) ? w + 'd' : /[^aeiou]y$/.test(w) ? w.slice(0, -1) + 'ied' : w + 'ed';
  return p + rest;
}

export interface VStage {
  id: 'forms' | 'conjugate' | 'sentences' | 'create';
  title: string;
  desc: string;
}
export const VSTAGES: VStage[] = [
  { id: 'forms', title: 'Formas', desc: 'Elegí la forma correcta del verbo' },
  { id: 'conjugate', title: 'Conjugar', desc: 'Escribí cada forma' },
  { id: 'sentences', title: 'Completar oraciones', desc: 'El verbo en todos los tiempos' },
  { id: 'create', title: 'Crear', desc: 'Armá tus propias oraciones' },
];

const r = Math.random;
const pick = <T,>(a: T[]): T => a[Math.floor(r() * a.length)];
const shuffle = <T,>(a: T[]): T[] => a.map((x) => ({ x, k: r() })).sort((p, q) => p.k - q.k).map((p) => p.x);

export const meaningOf = (v: Verb) => v.es;

function choice(prompt: string, correct: string, wrong: string[], explain: string): Exercise {
  const opts = shuffle([correct, ...[...new Set(wrong)].filter((w) => w !== correct).slice(0, 2)]);
  return { kind: 'choice', prompt, options: opts, answer: opts.indexOf(correct), explain };
}

function formsItem(v: Verb): Exercise {
  const reg = regularPast(v.base);
  const table = `${v.base} · ${v.past} · ${v.pp} · ${ingOf(v)}`;
  const subj = pick(['he', 'she', 'it', 'Ana', 'my brother']);
  const kind = pick(['past', 'past2', 'pp', 'pp2', 'ing', 'third', 'meaning', 'base'] as const);
  switch (kind) {
    case 'past':
      return choice(`Pasado simple de «${v.base}» (${v.es})`, v.past, [reg, v.pp, v.base + 's', `${v.past}ed`], table);
    case 'past2':
      return choice(`Last week we ___ (${v.base}).`, v.past, [v.base, reg, ingOf(v), v.pp], table);
    case 'pp':
      return choice(`Participio de «${v.base}»: I have ___`, v.pp, [v.past === v.pp ? v.base : v.past, reg, ingOf(v)], table);
    case 'pp2':
      return choice(`They had already ___ (${v.base}).`, v.pp, [v.base, v.past === v.pp ? reg : v.past, ingOf(v)], table);
    case 'ing':
      return choice(`Forma -ing de «${v.base}»: I am ___`, ingOf(v), [v.base + 'ing', v.base.replace(/e$/, '') + 'eing', v.past + 'ing'].filter((x) => x !== ingOf(v)), table);
    case 'third':
      return choice(`Presente con ${subj}: ${subj} ___ (${v.base})`, third(v.base), [v.base, v.base + 's', v.past].filter((x) => x !== third(v.base)), table);
    case 'meaning': {
      const others = shuffle(WORKSHOP.filter((x) => x.id !== v.id && x.es !== v.es)).slice(0, 2).map((x) => x.es);
      return choice(`¿Qué significa «${v.base}»?`, v.es, others, table);
    }
    case 'base': {
      const others = shuffle(WORKSHOP.filter((x) => x.id !== v.id && x.base !== v.base)).slice(0, 2).map((x) => x.base);
      return choice(`¿Cómo se dice «${v.es}» en inglés?`, v.base, others, table);
    }
  }
}

function conjugateItem(v: Verb): Exercise {
  const kind = pick(['past', 'past2', 'pp', 'pp2', 'third', 'ing', 'neg', 'neg2', 'q'] as const);
  const cue = `(${v.base})`;
  const subj = pick(['He', 'She', 'Ana', 'My brother']);
  switch (kind) {
    case 'past':
      return { kind: 'type', prompt: `Yesterday I ___ ${cue}.`, answers: [v.past], hint: 'Pasado simple.', explain: `${v.base} → ${v.past}` };
    case 'past2':
      return { kind: 'type', prompt: `Two days ago they ___ ${cue}.`, answers: [v.past], hint: 'Pasado simple.', explain: `${v.base} → ${v.past}` };
    case 'pp':
      return { kind: 'type', prompt: `She has ___ ${cue}.`, answers: [v.pp], hint: 'Participio (tercera columna).', explain: `${v.base} → ${v.pp}` };
    case 'pp2':
      return { kind: 'type', prompt: `We had never ___ before ${cue}.`, answers: [v.pp], hint: 'Participio (tercera columna).', explain: `${v.base} → ${v.pp}` };
    case 'third':
      return { kind: 'type', prompt: `${subj} ___ every day ${cue}.`, answers: [third(v.base)], hint: 'Presente con he/she/it: lleva -s.', explain: `${subj.toLowerCase()} ${third(v.base)}` };
    case 'ing':
      return { kind: 'type', prompt: `They are ___ right now ${cue}.`, answers: [ingOf(v)], hint: 'Forma -ing.', explain: `${v.base} → ${ingOf(v)}` };
    case 'neg':
      return { kind: 'type', prompt: `I ___ yesterday (not / ${v.base}).`, answers: [`didn't ${v.base}`], hint: "Con didn't el verbo vuelve a la forma base.", explain: `didn't ${v.base}` };
    case 'neg2':
      return { kind: 'type', prompt: `${subj} ___ on Sundays (not / ${v.base}).`, answers: [`doesn't ${v.base}`], hint: "Con he/she: doesn't + verbo base (sin -s).", explain: `doesn't ${v.base}` };
    case 'q':
      return { kind: 'type', prompt: `___ you ___ last week? (${v.base}) — escribí las dos palabras`, answers: [`Did ${v.base}`, `Did you ${v.base}`], hint: 'Pregunta en pasado: Did + verbo base.', explain: `Did you ${v.base}…?` };
  }
}

const CREATE_TENSES: Tense[] = ['presSimple', 'pastSimple', 'presCont', 'will', 'goingTo', 'presPerf', 'pastCont'];

function createItem(v: Verb): Exercise {
  const tenses = CREATE_TENSES.filter((t) => verbOk(v, t));
  const t: Tense = pick<Tense>(tenses.length ? tenses : ['pastSimple']);
  const pol: Exclude<Pol, 'q'> = r() < 0.65 ? 'aff' : 'neg';
  const accept = [...new Set(SUBJECTS.map((s) => verbPhrase(t, s, v, pol)))];
  const s = pick(SUBJECTS);
  const c = pick(v.comps);
  const time = pick(TIMES[t]);
  const example = sentenceEn(t, s, v, pol, [c.en, time[0]].filter(Boolean).join(' '));
  return {
    kind: 'create',
    prompt: `Escribí una oración tuya con «${v.base}» en ${TENSE_LABEL[t]}${pol === 'neg' ? ', negativa' : ''}.`,
    accept,
    example,
    hint: `Tiene que aparecer la forma: ${accept.slice(0, 2).join(' / ')}.`,
  };
}

export function stageItem(v: Verb, stage: VStage['id']): Exercise {
  switch (stage) {
    case 'forms':
      return formsItem(v);
    case 'conjugate':
      return conjugateItem(v);
    case 'sentences':
      return verbSentence(v.id, pick(['complete', 'complete', 'recognize', 'transform', 'translate']));
    case 'create':
      return r() < 0.7 ? createItem(v) : verbSentence(v.id, pick(['translate', 'order']));
  }
}

export function stageItems(v: Verb, stage: VStage['id'], n = 8): Exercise[] {
  const out: Exercise[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < n * 4 && out.length < n; i++) {
    const e = stageItem(v, stage);
    if (seen.has(e.prompt)) continue;
    seen.add(e.prompt);
    out.push(e);
  }
  return out;
}

export const workshopVerb = (id: string) => WORKSHOP.find((v) => v.id === id);
export { ALL_TENSES };
