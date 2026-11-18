import type { Exercise } from '../content/types';
import { NGSL } from '../content/ngsl';
import { ingOf, sentenceEn, sentenceEs, TENSE_LABEL, third, verbPhrase, type Pol, type Tense } from './english';
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

/** Un ejemplo de la ficha del verbo: la oración, la parte que es el verbo (para resaltarla) y la traducción. */
export interface VerbExample {
  en: string;
  /** La forma del verbo dentro de `en` («has eaten», «didn't eat»). */
  hl: string;
  es: string;
}

/** Cada forma del verbo: para qué sirve y ejemplos con complementos propios del verbo (nunca un complemento suelto). */
export interface VerbFormGuide {
  label: string;
  form: string;
  use: string;
  examples: VerbExample[];
}

const SUBJ = (en: string) => SUBJECTS.find((s) => s.en === en)!;
const lowerFirst = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);

/** En negativa, «something / some» pasan a «anything / any» (y «algo» a «nada»). */
function negWords(e: VerbExample): VerbExample {
  return { en: e.en.replace(/\bsomething\b/g, 'anything').replace(/\bsome\b/g, 'any'), hl: e.hl, es: e.es.replace(/\balgo\b/g, 'nada') };
}

function example(v: Verb, t: Tense, subj: string, pol: Exclude<Pol, 'q'>, ci: number): VerbExample {
  const s = SUBJ(subj);
  const c = v.comps[ci % v.comps.length];
  const e = { en: sentenceEn(t, s, v, pol, c.en), hl: verbPhrase(t, s, v, pol), es: sentenceEs(t, s, c.esVerb ?? v.es, pol, c.es) };
  return pol === 'neg' ? negWords(e) : e;
}

/** Presente perfecto de experiencia: «I've never…» / «Have you ever…?». En español rioplatense va en pretérito: «Nunca tuve…», «¿Alguna vez tuviste…?». */
function experience(v: Verb, ci: number, q: boolean): VerbExample {
  const c = v.comps[ci % v.comps.length];
  if (q) {
    const es = sentenceEs('pastSimple', SUBJ('you'), c.esVerb ?? v.es, 'q', c.es);
    return { en: `Have you ever ${v.pp} ${c.en}?`, hl: `ever ${v.pp}`, es: `¿Alguna vez ${lowerFirst(es.slice(1))}` };
  }
  const es = sentenceEs('pastSimple', SUBJ('I'), c.esVerb ?? v.es, 'aff', c.es);
  return negWords({ en: `I have never ${v.pp} ${c.en}.`, hl: `have never ${v.pp}`, es: `Nunca ${lowerFirst(es)}` });
}

/** Verbos que no siguen la regla general en continuo o en presente perfecto: ejemplos escritos a mano. */
const SPECIAL: Record<string, { ing?: { use: string; examples: VerbExample[] }; pp?: VerbExample[] }> = {
  have: {
    ing: {
      use: 'Con el significado «tener» (algo tuyo) no va en -ing: ✗ I\'m having a dog. Pero sí en expresiones donde have es «hacer» algo: have lunch (almorzar), have a shower (bañarse), have a good time (pasarla bien).',
      examples: [
        { en: "I'm having lunch.", hl: 'having', es: 'Estoy almorzando.' },
        { en: "We're having a great time.", hl: 'having', es: 'La estamos pasando bárbaro.' },
      ],
    },
    pp: [
      { en: "I've had this job for a year.", hl: 'had', es: 'Tengo este trabajo hace un año.' },
      { en: 'Have you ever had a dog?', hl: 'ever had', es: '¿Alguna vez tuviste un perro?' },
    ],
  },
  know: {
    ing: {
      use: 'No va en -ing: ✗ I\'m knowing the answer → ✓ I know the answer. Saber o conocer es un estado, no una acción que está pasando.',
      examples: [{ en: 'I know the answer.', hl: 'know', es: 'Sé la respuesta.' }],
    },
    pp: [
      { en: "I've known my best friend for ten years.", hl: 'known', es: 'Conozco a mi mejor amigo hace diez años.' },
      { en: "She hasn't known the truth for long.", hl: "hasn't known", es: 'Ella no sabe la verdad hace mucho.' },
    ],
  },
  understand: {
    ing: {
      use: 'No va en -ing: ✗ I\'m understanding → ✓ I understand. Entender es un estado.',
      examples: [{ en: "Now I understand the problem.", hl: 'understand', es: 'Ahora entiendo el problema.' }],
    },
  },
  want: {
    ing: {
      use: 'No va en -ing: ✗ I\'m wanting a coffee → ✓ I want a coffee. Querer es un estado.',
      examples: [{ en: 'I want a coffee.', hl: 'want', es: 'Quiero un café.' }],
    },
  },
  live: {
    ing: {
      use: 'En -ing (am / is / are living) es para algo temporal, por ahora. Para algo permanente se usa el presente simple: I live in Montevideo.',
      examples: [{ en: "I'm living with my parents for now.", hl: 'living', es: 'Por ahora estoy viviendo con mis padres.' }],
    },
  },
  see: {
    ing: {
      use: 'Con el significado «ver con los ojos» no va en -ing: ✗ I\'m seeing the sea → ✓ I can see the sea. En -ing significa «ver a alguien, encontrarse», sobre todo para planes.',
      examples: [{ en: "I'm seeing my friends tonight.", hl: 'seeing', es: 'Esta noche me veo con mis amigos.' }],
    },
  },
};

export function verbGuide(v: Verb): VerbFormGuide[] {
  const irr = isIrregular(v);
  const ing = ingOf(v);
  const sp = SPECIAL[v.base];
  return [
    {
      label: 'Base',
      form: v.base,
      use: "Presente con I, you, we, they. También después de to, can, will y en negativas y preguntas (don't, didn't).",
      examples: [example(v, 'presSimple', 'I', 'aff', 0), example(v, 'presSimple', 'they', 'neg', 1)],
    },
    {
      label: 'he / she / it',
      form: third(v.base),
      use: `En presente, con he, she, it (o una persona: Ana, my brother) se agrega -s: ${v.base} → ${third(v.base)}. En negativa vuelve a la base: doesn't ${v.base}, no «doesn't ${third(v.base)}».`,
      examples: [example(v, 'presSimple', 'she', 'aff', 1), example(v, 'presSimple', 'my brother', 'neg', 0)],
    },
    {
      label: 'Pasado',
      form: v.past,
      use: `Algo que pasó y terminó (yesterday, last week, in 2020). ${irr ? `Es irregular: ${v.base} → ${v.past}, hay que aprenderlo de memoria.` : 'Es regular: termina en -ed.'} En negativa y pregunta se usa did + la base: didn't ${v.base}, no «didn't ${v.past}».`,
      examples: [example(v, 'pastSimple', 'we', 'aff', 2), example(v, 'pastSimple', 'I', 'neg', 0)],
    },
    {
      label: 'Participio',
      form: v.pp,
      use: `Va después de have / has (presente perfecto): lo que hiciste alguna vez en tu vida, o algo que empezó antes y sigue. ${v.pp === v.past ? `Acá es igual al pasado (${v.pp}).` : `Ojo: no es igual al pasado (${v.past} ≠ ${v.pp}).`}`,
      examples: sp?.pp ?? [experience(v, 1, true), experience(v, 0, false)],
    },
    {
      label: '-ing',
      form: ing,
      use: sp?.ing?.use ?? 'Con am / is / are (presente continuo: lo que está pasando ahora) y con was / were (lo que estaba pasando en un momento del pasado).',
      examples: sp?.ing?.examples ?? [example(v, 'presCont', 'he', 'aff', 1), example(v, 'pastCont', 'we', 'aff', 2)],
    },
  ];
}
