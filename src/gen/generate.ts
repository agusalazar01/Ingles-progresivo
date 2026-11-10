import type { Exercise } from '../content/types';
import { sentenceEn, sentenceEs, TENSE_LABEL, third, verbParts, verbPhrase, type Pol, type Tense } from './english';
import { SUBJECTS, VERBS, type Comp, type Subject, type Verb } from './lexicon';
import { conjugateEs } from './spanish';
import { CLOZE, DICTATIONS, SOUND_PAIRS, type Cloze } from './banks';
import { articleWhy, gerundWhy, passiveWhy, prepWhy, RULES, WRONG } from './why-rules';
import { normalize } from '../lib/answer';

/**
 * Generador de ejercicios: cada vez arma oraciones nuevas que practican la misma regla.
 * Así el repaso evalúa si sabés la regla, no si te acordás de una frase.
 */

export type Pattern = 'recognize' | 'complete' | 'transform' | 'order' | 'translate';
export const PATTERNS: Pattern[] = ['recognize', 'complete', 'transform', 'order', 'translate'];

type Rng = () => number;
const pick = <T,>(a: T[], r: Rng): T => a[Math.floor(r() * a.length)];
const shuffle = <T,>(a: T[], r: Rng): T[] => a.map((x) => ({ x, k: r() })).sort((p, q) => p.k - q.k).map((p) => p.x);

/** Expresiones de tiempo que piden cada tiempo verbal (la pista para elegir el tiempo correcto). */
const TIMES: Record<Tense, [string, string][]> = {
  presSimple: [['every day', 'todos los días'], ['on Sundays', 'los domingos'], ['every week', 'todas las semanas']],
  presCont: [['now', 'ahora'], ['at the moment', 'en este momento'], ['this week', 'esta semana'], ['this arvo', 'esta tarde']],
  pastSimple: [['yesterday', 'ayer'], ['last week', 'la semana pasada'], ['two days ago', 'hace dos días'], ['in 2019', 'en 2019']],
  pastCont: [['at 8 last night', 'anoche a las 8'], ['all afternoon', 'toda la tarde']],
  will: [['tomorrow', 'mañana'], ['next week', 'la semana que viene'], ['later', 'más tarde'], ['this arvo', 'esta tarde']],
  goingTo: [['tomorrow', 'mañana'], ['next week', 'la semana que viene'], ['next year', 'el año que viene']],
  presPerf: [['many times', 'muchas veces'], ['twice', 'dos veces'], ['this week', 'esta semana']],
  presPerfCont: [['for two hours', 'durante dos horas'], ['since this morning', 'desde esta mañana'], ['all day', 'todo el día']],
  pastPerf: [['before the party', 'antes de la fiesta'], ['before 2020', 'antes de 2020']],
  futPerf: [['by Friday', 'para el viernes'], ['by next year', 'para el año que viene']],
  futCont: [['at this time tomorrow', 'mañana a esta hora'], ['at eight tonight', 'esta noche a las ocho'], ['tomorrow morning', 'mañana de mañana']],
  pastPerfCont: [['for two hours before the meeting', 'durante dos horas antes de la reunión'], ['for a while when you called', 'durante un rato cuando llamaste'], ['all morning before lunch', 'toda la mañana antes del almuerzo']],
  futPerfCont: [['for two hours by then', 'durante dos horas para entonces'], ['for three hours by midday', 'durante tres horas para el mediodía']],
  can: [['', '']],
  shouldHave: [['', ''], ['earlier', 'antes']],
  couldHave: [['', '']],
};

const CONTINUOUS: Tense[] = ['presCont', 'pastCont', 'presPerfCont', 'futCont', 'pastPerfCont', 'futPerfCont'];

const ACCOMPLISH = ['finish', 'write', 'read', 'sell', 'buy', 'pay', 'send', 'clean', 'cook', 'do', 'make', 'start', 'find', 'pass', 'visit'];

function verbOk(v: Verb, t: Tense): boolean {
  if (CONTINUOUS.includes(t) && (v.stative || v.punctual)) return false;
  if (t === 'futPerf' && !ACCOMPLISH.includes(v.id)) return false;
  if (t === 'presSimple' && v.rare) return false;
  if (t === 'can' && (v.rare || v.punctual)) return false;
  return true;
}

interface Pick {
  t: Tense;
  s: Subject;
  v: Verb;
  c: Comp;
  time: [string, string];
  pol: Pol;
}

function pickParts(tenses: Tense[], r: Rng, pols: Pol[] = ['aff', 'aff', 'neg', 'q'], only?: string): Pick {
  const okTenses = only ? tenses.filter((t) => verbOk(VERBS.find((x) => x.id === only)!, t)) : tenses;
  const t = pick(okTenses.length ? okTenses : tenses, r);
  const v = only ? VERBS.find((x) => x.id === only)! : pick(VERBS.filter((x) => verbOk(x, t)), r);
  const s = pick(SUBJECTS, r);
  const c = pick(v.comps, r);
  let time = pick(TIMES[t], r);
  if (v.stative && ['presSimple', 'presPerf', 'pastPerf', 'futPerf'].includes(t)) time = ['', ''];
  return { t, s, v, c, time, pol: pick(pols, r) };
}

const tail = (p: Pick) => [p.c.en, p.time[0]].filter(Boolean).join(' ');
const tailEs = (p: Pick) => [p.c.es, p.time[1]].filter(Boolean).join(' ');
const en = (p: Pick, pol: Pol = p.pol, t: Tense = p.t) => sentenceEn(t, p.s, p.v, pol, tail(p));
const es = (p: Pick, pol: Pol = p.pol, t: Tense = p.t) => sentenceEs(t, p.s, p.c.esVerb ?? p.v.es, pol, tailEs(p));

/** Errores verosímiles para el ejercicio de reconocer (incluye los típicos del español). */
function distractors(p: Pick, correct: string): string[] {
  const alt = new Set<string>();
  const other: Tense[] = ['presSimple', 'pastSimple', 'presPerf', 'presCont', 'will', 'pastCont', 'pastPerf'];
  for (const t of other) if (t !== p.t && verbOk(p.v, t)) alt.add(verbPhrase(t, p.s, p.v, p.pol === 'neg' ? 'neg' : 'aff'));
  // concordancia y "didn't worked"
  if (p.t === 'presSimple') alt.add(p.s.third ? p.v.base : third(p.v.base));
  if (p.pol === 'neg' && p.t === 'pastSimple') alt.add(`didn't ${p.v.past}`);
  if (p.pol === 'neg' && p.t === 'presSimple') alt.add(`${p.s.third ? "doesn't" : "don't"} ${third(p.v.base)}`);
  if (p.t === 'presPerf') alt.add(`${p.s.third ? 'has' : 'have'} ${p.v.past === p.v.pp ? p.v.base : p.v.past}`);
  alt.delete(correct);
  return [...alt];
}

export interface GenItem {
  exercise: Exercise;
  /** Firma para no repetir la misma oración. */
  sig: string;
}

const NO_TIME: Tense[] = ['can', 'shouldHave', 'couldHave'];

// ───── Por qué va cada tiempo (explicación de los errores) ─────

const USE: Record<Tense, string> = {
  presSimple: 'es una costumbre o algo que se repite',
  presCont: 'está pasando ahora o en estos días',
  pastSimple: 'es algo terminado en un momento del pasado',
  pastCont: 'estaba pasando (en curso) en un momento del pasado',
  will: 'es una decisión o una predicción sobre el futuro',
  goingTo: 'es un plan ya decidido para el futuro',
  presPerf: 'es una experiencia o un resultado, sin decir cuándo pasó',
  presPerfCont: 'empezó antes, sigue hasta ahora y se marca cuánto dura',
  pastPerf: 'pasó antes que otra cosa del pasado',
  futPerf: 'va a estar terminado antes de un momento del futuro',
  futCont: 'va a estar pasando (en curso) en un momento del futuro',
  pastPerfCont: 'venía pasando durante un tiempo antes de otro momento del pasado',
  futPerfCont: 'va a llevar un tiempo pasando cuando llegue un momento del futuro',
  can: 'es una habilidad o una posibilidad',
  shouldHave: 'convenía hacerlo y no se hizo',
  couldHave: 'era posible, pero no pasó',
};

const subjName = (s: Subject) => (s.en === 'I' ? 'I' : s.en);
const irregular = (v: Verb) => !v.past.endsWith('ed');

function formWhy(t: Tense, s: Subject, v: Verb, pol: Exclude<Pol, 'q'>): string {
  const sub = subjName(s);
  const be = s.en === 'I' ? 'am' : s.third ? 'is' : 'are';
  const has = s.third ? 'has' : 'have';
  const pp = `participio (${v.base} → ${v.pp})`;
  switch (t) {
    case 'presSimple':
      if (pol === 'neg') return `${s.third ? "doesn't" : "don't"} + verbo base, sin -s (con ${sub} va ${s.third ? "doesn't" : "don't"})`;
      return s.third ? `con ${sub} el verbo lleva -s: ${third(v.base)}` : `con ${sub} el verbo va sin -s: ${v.base}`;
    case 'pastSimple':
      if (pol === 'neg') return "didn't + verbo base (el pasado ya lo marca didn't)";
      return irregular(v) ? `${v.base} es irregular: su pasado es ${v.past}` : `verbo regular: ${v.base} + -ed = ${v.past}`;
    case 'presCont':
      return `${be} + verbo con -ing (con ${sub} va ${be})`;
    case 'pastCont':
      return `${s.were ? 'were' : 'was'} + verbo con -ing (con ${sub} va ${s.were ? 'were' : 'was'})`;
    case 'will':
      return 'will + verbo base, sin to y sin -s';
    case 'goingTo':
      return `${be} going to + verbo base (con ${sub} va ${be})`;
    case 'presPerf':
      return `${has} + ${pp}; con ${sub} va ${has}`;
    case 'presPerfCont':
      return `${has} been + verbo con -ing; con ${sub} va ${has}`;
    case 'pastPerf':
      return `had + ${pp}, con cualquier sujeto`;
    case 'futPerf':
      return `will have + ${pp}`;
    case 'futCont':
      return 'will be + verbo con -ing';
    case 'pastPerfCont':
      return 'had been + verbo con -ing, con cualquier sujeto';
    case 'futPerfCont':
      return 'will have been + verbo con -ing';
    case 'can':
      return 'can + verbo base, sin to y sin -s';
    case 'shouldHave':
      return `should have + ${pp}`;
    case 'couldHave':
      return `could have + ${pp}`;
  }
}

function tenseWhy(p: Pick, pol: Exclude<Pol, 'q'>): string {
  const correct = verbPhrase(p.t, p.s, p.v, pol);
  const cue = p.time[0] ? `«${p.time[0]}» indica que ` : '';
  return `Va «${correct}» porque ${cue}${USE[p.t]}: ${TENSE_LABEL[p.t]}. Forma: ${formWhy(p.t, p.s, p.v, pol)}.`;
}

/** Respuestas incorrectas probables → por qué no van. */
function tenseWrong(p: Pick, pol: Exclude<Pol, 'q'>): Record<string, string> {
  const out: Record<string, string> = {};
  const add = (form: string, msg: string) => {
    const k = normalize(form);
    if (k && k !== normalize(verbPhrase(p.t, p.s, p.v, pol)) && !out[k]) out[k] = msg;
  };
  const sub = subjName(p.s);
  // Errores de forma dentro del mismo tiempo
  if (p.t === 'presSimple' && pol === 'aff') {
    if (p.s.third) add(p.v.base, `Falta la -s: con ${sub} el verbo lleva -s (${third(p.v.base)}).`);
    else add(third(p.v.base), `Con ${sub} el verbo no lleva -s: ${p.v.base}.`);
  }
  if (p.t === 'presSimple' && pol === 'neg') {
    add(`${p.s.third ? "doesn't" : "don't"} ${third(p.v.base)}`, "Después de don't/doesn't el verbo va sin -s: la -s ya está en el auxiliar.");
    add(`${p.s.third ? "don't" : "doesn't"} ${p.v.base}`, `Con ${sub} va ${p.s.third ? "doesn't" : "don't"}.`);
  }
  if (p.t === 'pastSimple' && pol === 'neg') add(`didn't ${p.v.past}`, `Después de didn't el verbo vuelve a la forma base: didn't ${p.v.base}.`);
  if (p.t === 'pastSimple' && pol === 'aff' && irregular(p.v)) add(`${p.v.base}ed`, `${p.v.base} es irregular: su pasado es ${p.v.past}.`);
  if (p.t === 'presPerf' || p.t === 'pastPerf' || p.t === 'futPerf') {
    if (p.v.past !== p.v.pp) add(verbPhrase(p.t, p.s, p.v, pol).replace(new RegExp(`\\b${p.v.pp}$`), p.v.past), `Después de have/has/had va el participio (${p.v.pp}), no el pasado (${p.v.past}).`);
  }
  if (p.t === 'presPerf' || p.t === 'presPerfCont') {
    const other = { ...p.s, third: !p.s.third };
    add(verbPhrase(p.t, other, p.v, pol), `Con ${sub} va ${p.s.third ? 'has' : 'have'}.`);
  }
  if (p.t === 'presCont' || p.t === 'goingTo') {
    const be = p.s.en === 'I' ? 'am' : p.s.third ? 'is' : 'are';
    for (const b of ['am', 'is', 'are'].filter((x) => x !== be)) {
      const form = verbPhrase(p.t, p.s, p.v, pol).replace(/^(am|is|are|isn't|aren't|am not)\b/, pol === 'neg' ? (b === 'am' ? 'am not' : `${b}n't`) : b);
      add(form, `Con ${sub} va ${be}.`);
    }
    add(verbPhrase(p.t, p.s, p.v, pol).replace(/^(am|is|are|isn't|aren't|am not) /, ''), `Falta ${be}: el presente continuo y going to llevan to be adelante.`);
  }
  if (p.t === 'pastCont') {
    const wrongBe = p.s.were ? 'was' : 'were';
    add(verbPhrase(p.t, { ...p.s, were: !p.s.were }, p.v, pol), `Con ${sub} va ${p.s.were ? 'were' : 'was'}, no ${wrongBe}.`);
  }
  if (p.t === 'will' || p.t === 'can') add(`${p.t === 'will' ? 'will' : 'can'} to ${p.v.base}`, `Después de ${p.t === 'will' ? 'will' : 'can'} el verbo va sin to.`);
  // Otros tiempos: el error más común es elegir el tiempo equivocado
  const others: Tense[] = ['presSimple', 'presCont', 'pastSimple', 'pastCont', 'will', 'goingTo', 'presPerf', 'presPerfCont', 'pastPerf', 'futPerf', 'futCont', 'pastPerfCont', 'futPerfCont'];
  for (const t of others) {
    if (t === p.t) continue;
    const cue = p.time[0] ? ` Acá «${p.time[0]}» pide ${TENSE_LABEL[p.t]}.` : ` Acá va ${TENSE_LABEL[p.t]}.`;
    add(verbPhrase(t, p.s, p.v, pol), `Eso es ${TENSE_LABEL[t]}, que se usa cuando ${USE[t]}.${cue}`);
  }
  return out;
}

/** Negativa o pregunta: dónde va el auxiliar. */
function polWhy(p: Pick, pol: Pol): string {
  const { aux, rest } = verbParts(p.t, p.s, p.v, 'q');
  const label = TENSE_LABEL[p.t];
  if (pol === 'q') return `Pregunta en ${label}: el auxiliar (${aux}) va antes del sujeto, y después ${rest}. ${aux === 'do' || aux === 'does' || aux === 'did' ? 'Con do/does/did el verbo queda en la forma base.' : ''}`.trim();
  return `Negativa en ${label}: not va pegado al auxiliar (${verbPhrase(p.t, p.s, p.v, 'neg')}). ${aux === 'do' || aux === 'does' || aux === 'did' ? 'Con don\'t/doesn\'t/didn\'t el verbo queda en la forma base.' : ''}`.trim();
}

function tensePattern(tenses: Tense[], pattern: Pattern, r: Rng, fromTense?: Tense, only?: string): GenItem {
  let p = pickParts(tenses, r, undefined, only);
  // Para elegir o completar el tiempo hace falta la pista de tiempo.
  for (let i = 0; i < 20 && (pattern === 'recognize' || pattern === 'complete') && !p.time[0] && !NO_TIME.includes(p.t); i++) p = pickParts(tenses, r, undefined, only);
  const sig = `${p.t}|${p.s.en}|${p.v.id}|${p.c.en}|${p.time[0]}|${p.pol}|${pattern}`;
  const label = TENSE_LABEL[p.t];
  switch (pattern) {
    case 'recognize': {
      const pol = p.pol === 'q' ? 'aff' : p.pol;
      const correct = verbPhrase(p.t, p.s, p.v, pol);
      const opts = shuffle([correct, ...shuffle(distractors({ ...p, pol }, correct), r).slice(0, 2)], r);
      const sentence = `${p.s.en === 'I' ? 'I' : p.s.en.charAt(0).toUpperCase() + p.s.en.slice(1)} ___ ${tail(p)}.`;
      return {
        sig,
        exercise: { kind: 'choice', prompt: sentence, options: opts, answer: opts.indexOf(correct), explain: `${label}: ${en({ ...p, pol })}`, why: tenseWhy(p, pol), wrong: tenseWrong(p, pol) },
      };
    }
    case 'complete': {
      const pol = p.pol === 'q' ? 'neg' : p.pol;
      const cue = pol === 'neg' ? `(not / ${p.v.base})` : `(${p.v.base})`;
      const subj = p.s.en.charAt(0).toUpperCase() + p.s.en.slice(1);
      return {
        sig,
        exercise: {
          kind: 'type',
          prompt: `${subj} ___ ${cue} ${tail(p)}.`.replace(/\s+\./, '.'),
          answers: [verbPhrase(p.t, p.s, p.v, pol)],
          context: es({ ...p, pol }),
          hint: `Mirá la pista de tiempo: va en ${label}.`,
          explain: en({ ...p, pol }),
          why: tenseWhy(p, pol),
          wrong: tenseWrong(p, pol),
        },
      };
    }
    case 'transform': {
      // De otro tiempo a este (la pista es la nueva expresión de tiempo), o a negativa / pregunta.
      if (fromTense && r() < 0.5 && verbOk(p.v, fromTense)) {
        const src: Pick = { ...p, t: fromTense, time: pick(TIMES[fromTense], r), pol: 'aff' };
        if (p.v.stative && fromTense === 'presSimple') src.time = ['', ''];
        const target: Pick = { ...p, pol: 'aff' };
        return {
          sig,
          exercise: {
            kind: 'transform',
            prompt: en(src),
            task: `Cambiá a: «${p.time[0] || label}»`,
            answers: [en(target)],
            hint: `Con «${p.time[0]}» va ${label}.`,
            why: tenseWhy(target, 'aff'),
          },
        };
      }
      const toPol: Pol = r() < 0.5 ? 'neg' : 'q';
      return {
        sig,
        exercise: {
          kind: 'transform',
          prompt: en(p, 'aff'),
          task: toPol === 'neg' ? 'Pasala a negativa' : 'Convertila en pregunta',
          answers: [en(p, toPol)],
          hint: toPol === 'q' ? 'En la pregunta el auxiliar va antes del sujeto.' : 'Revisá el auxiliar y la forma del verbo.',
          why: polWhy(p, toPol),
        },
      };
    }
    case 'order': {
      const sentence = en(p);
      const words = sentence.replace(/[.?]$/, '').split(' ');
      let shuffled = shuffle(words, r);
      for (let i = 0; i < 5 && shuffled.join(' ') === words.join(' '); i++) shuffled = shuffle(words, r);
      return { sig, exercise: { kind: 'order', prompt: es(p), words: shuffled, answers: [sentence], why: p.pol === 'q' ? polWhy(p, 'q') : tenseWhy(p, p.pol as 'aff' | 'neg') } };
    }
    case 'translate': {
      const answers = [en(p)];
      if (p.t === 'goingTo') answers.push(en(p, p.pol, 'will'));
      if (p.t === 'will') answers.push(en(p, p.pol, 'goingTo'));
      return { sig, exercise: { kind: 'translate', prompt: es(p), answers, explain: `${label}.`, why: p.pol === 'q' ? polWhy(p, 'q') : tenseWhy(p, p.pol as 'aff' | 'neg') } };
    }
  }
}

// ───── Condicionales ─────

interface CondPair {
  ifS: number;
  ifV: string;
  ifC: number;
  resS: number;
  resV: string;
  resC: number | null;
  resNeg?: boolean;
}
const S = (en: string) => SUBJECTS.findIndex((x) => x.en === en);
const PAIRS: CondPair[] = [
  { ifS: S('she'), ifV: 'study', ifC: 2, resS: S('she'), resV: 'pass', resC: 0 },
  { ifS: S('I'), ifV: 'have', ifC: 1, resS: S('I'), resV: 'buy', resC: 0 },
  { ifS: S('we'), ifV: 'win', ifC: 1, resS: S('we'), resV: 'travel', resC: 2 },
  { ifS: S('they'), ifV: 'sell', ifC: 0, resS: S('they'), resV: 'buy', resC: 0 },
  { ifS: S('he'), ifV: 'find', ifC: 0, resS: S('he'), resV: 'live', resC: 1 },
  { ifS: S('Ana'), ifV: 'finish', ifC: 0, resS: S('Ana'), resV: 'go', resC: 1 },
  { ifS: S('I'), ifV: 'know', ifC: 0, resS: S('I'), resV: 'help', resC: 0 },
  { ifS: S('we'), ifV: 'lose', ifC: 0, resS: S('we'), resV: 'call', resC: 0 },
  { ifS: S('you'), ifV: 'drink', ifC: 0, resS: S('you'), resV: 'sleep', resC: null, resNeg: true },
  { ifS: S('my parents'), ifV: 'sell', ifC: 0, resS: S('my parents'), resV: 'live', resC: 1 },
];
const verb = (id: string) => VERBS.find((x) => x.id === id)!;

type CondType = 1 | 2 | 3;

function condSentence(pair: CondPair, type: CondType) {
  const si = SUBJECTS[pair.ifS];
  const sr = SUBJECTS[pair.resS];
  const vi = verb(pair.ifV);
  const vr = verb(pair.resV);
  const ci = vi.comps[pair.ifC];
  const cr = pair.resC === null ? null : vr.comps[pair.resC];
  const neg = !!pair.resNeg;
  const subjR = sr.en === si.en ? (sr.en === 'Ana' ? 'she' : sr.en === 'my parents' ? 'they' : sr.en) : sr.en;
  const ifVerb = type === 1 ? (si.third ? third(vi.base) : vi.base) : type === 2 ? (vi.id === 'have' ? 'had' : vi.past) : `had ${vi.pp}`;
  const resAux = type === 1 ? (neg ? "won't" : 'will') : neg ? "wouldn't" : 'would';
  const resVerb = type === 3 ? `have ${vr.pp}` : vr.base;
  const ifClause = `If ${si.en === 'I' ? 'I' : si.en} ${ifVerb} ${ci.en}`;
  const resClause = `${subjR} ${resAux} ${resVerb}${cr ? ` ${cr.en}` : ''}`;
  const enS = `${ifClause}, ${resClause}.`;
  const esIf = type === 1 ? conjugateEs(ci.esVerb ?? vi.es, 'pres', si.p) : type === 2 ? conjugateEs(ci.esVerb ?? vi.es, 'subjImp', si.p) : conjugateEs(ci.esVerb ?? vi.es, 'subjPluperf', si.p);
  const esRes = type === 1 ? conjugateEs(vr.es, 'fut', sr.p) : type === 2 ? conjugateEs(vr.es, 'cond', sr.p) : conjugateEs(vr.es, 'condPerf', sr.p);
  const esS = `Si ${[si.es, esIf, ci.es].filter(Boolean).join(' ')}, ${[neg ? 'no' : '', esRes, cr?.es].filter(Boolean).join(' ')}.`;
  return { en: enS, es: esS, ifVerb, ifCue: type === 3 ? `(${vi.base}, pasado perfecto)` : `(${vi.base})`, ifClause, resClause, resAux, resVerb, ci, si };
}

const COND_LABEL: Record<CondType, string> = { 1: 'condicional 1 (posible)', 2: 'condicional 2 (imaginario)', 3: 'condicional 3 (pasado que no pasó)' };
const COND_WHY: Record<CondType, string> = {
  1: 'Condicional 1 (algo posible): if + presente, y en la otra parte will + verbo. En la parte del if nunca va will.',
  2: 'Condicional 2 (algo imaginario o poco probable): if + pasado, y en la otra parte would + verbo.',
  3: 'Condicional 3 (algo del pasado que no pasó): if + had + participio, y en la otra parte would have + participio.',
};

function condPattern(types: CondType[], pattern: Pattern, r: Rng): GenItem {
  const pair = pick(PAIRS, r);
  const type = pick(types, r);
  const c = condSentence(pair, type);
  const sig = `cond|${PAIRS.indexOf(pair)}|${type}|${pattern}`;
  switch (pattern) {
    case 'recognize': {
      const forms = [`${c.resAux} ${c.resVerb}`, ...([1, 2, 3] as CondType[]).filter((x) => x !== type).map((x) => {
        const o = condSentence(pair, x);
        return `${o.resAux} ${o.resVerb}`;
      })];
      const opts = shuffle([...new Set(forms)], r);
      const wrong: Record<string, string> = {};
      ([1, 2, 3] as CondType[]).filter((x) => x !== type).forEach((x) => {
        const o = condSentence(pair, x);
        wrong[normalize(`${o.resAux} ${o.resVerb}`)] = `Eso es del ${COND_LABEL[x]}. ${COND_WHY[type]}`;
      });
      return { sig, exercise: { kind: 'choice', prompt: `${c.ifClause}, ${c.resClause.replace(`${c.resAux} ${c.resVerb}`, '___')}.`, options: opts, answer: opts.indexOf(forms[0]), explain: `${COND_LABEL[type]}: ${c.en}`, why: COND_WHY[type], wrong } };
    }
    case 'complete':
      return {
        sig,
        exercise: {
          kind: 'type',
          prompt: `If ${c.si.en === 'I' ? 'I' : c.si.en} ___ ${c.ifCue} ${c.ci.en}, ${c.resClause}.`,
          answers: [c.ifVerb],
          hint: 'Mirá la otra mitad de la oración: te dice qué condicional es.',
          explain: c.en,
          why: COND_WHY[type],
          wrong: Object.fromEntries(([1, 2, 3] as CondType[]).filter((x) => x !== type).map((x) => [normalize(condSentence(pair, x).ifVerb), `Esa forma es del ${COND_LABEL[x]}. ${COND_WHY[type]}`])),
        },
      };
    case 'transform': {
      const to: CondType = type === 3 ? 3 : 2;
      const from = condSentence(pair, to === 3 ? 2 : 1);
      const target = condSentence(pair, to);
      return {
        sig,
        exercise: {
          kind: 'transform',
          prompt: from.en,
          task: to === 2 ? 'Hacela imaginaria (condicional 2)' : 'Pasala al pasado que no ocurrió (condicional 3)',
          answers: [target.en],
          hint: to === 2 ? 'If + pasado, would + verbo.' : 'If + had + participio, would have + participio.',
          why: COND_WHY[to],
        },
      };
    }
    case 'order': {
      const words = c.en.replace(/[.]$/, '').split(' ');
      return { sig, exercise: { kind: 'order', prompt: c.es, words: shuffle(words, r), answers: [c.en], why: COND_WHY[type] } };
    }
    case 'translate':
      return { sig, exercise: { kind: 'translate', prompt: c.es, answers: [c.en], explain: COND_LABEL[type], why: COND_WHY[type] } };
  }
}

// ───── Unidades con generador ─────

interface GenSpec {
  tenses?: Tense[];
  cond?: CondType[];
  /** Tiempo desde el que se transforma (la pista es la expresión de tiempo). */
  from?: Tense;
}

export const GENERATED: Record<string, GenSpec> = {
  'pres-simple': { tenses: ['presSimple'] },
  'pres-cont': { tenses: ['presCont'], from: 'presSimple' },
  can: { tenses: ['can'] },
  'past-simple': { tenses: ['pastSimple'], from: 'presSimple' },
  future: { tenses: ['will', 'goingTo'], from: 'presSimple' },
  'past-cont': { tenses: ['pastCont'], from: 'pastSimple' },
  'pres-perfect': { tenses: ['presPerf'], from: 'pastSimple' },
  'pres-perf-cont': { tenses: ['presPerfCont'], from: 'presPerf' },
  'past-perfect': { tenses: ['pastPerf'], from: 'pastSimple' },
  'future-perf': { tenses: ['futPerf'], from: 'will' },
  'future-cont': { tenses: ['futCont'], from: 'will' },
  'past-perf-cont': { tenses: ['pastPerfCont'], from: 'pastCont' },
  'future-perf-cont': { tenses: ['futPerfCont'], from: 'futCont' },
  'past-modals': { tenses: ['shouldHave', 'couldHave'] },
  'cond-1-2': { cond: [1, 2] },
  'cond-3': { cond: [3, 2] },
};

// ───── Unidades con banco (oraciones con la parte a practicar marcada) ─────

const fill = (c: Cloze, with_: string) => c.s.replace(/\{(.+?)\}/, with_);
const target = (c: Cloze) => c.s.match(/\{(.+?)\}/)![1];
const full = (c: Cloze) => fill(c, target(c));

/** Por qué va la parte marcada de una oración del banco, según la unidad y lo que la rodea. */
function clozeWhy(unitId: string, c: Cloze): string | undefined {
  const t = target(c);
  const [before, after] = c.s.split(/\{.+?\}/);
  if (unitId === 'prep-time-place') return prepWhy(t, after) || undefined;
  if (unitId === 'articles-plurals' && /^(a|an)$/i.test(t)) return articleWhy(t, after);
  if (unitId === 'gerund-inf') return gerundWhy(before, t);
  if (unitId === 'passive') return passiveWhy(t);
  if (unitId === 'inversion' && !/^(what|who)$/i.test(t)) {
    const lead = before.replace(/[",]/g, '').trim() || 'la palabra negativa';
    return `Con «${lead}» al principio, la oración se invierte como una pregunta: auxiliar + sujeto (${t}).`;
  }
  return RULES[unitId]?.[t.toLowerCase()] ?? RULES[unitId]?.[t];
}

function clozeWrong(unitId: string, c: Cloze): Record<string, string> {
  const out: Record<string, string> = {};
  for (const a of c.alt) {
    const k = normalize(a);
    const msg =
      WRONG[a.toLowerCase()] ??
      (unitId === 'prep-time-place' ? RULES[unitId][a.toLowerCase()] : undefined) ??
      (unitId === 'gerund-inf' ? (!/^to /i.test(target(c)) && /ing$/.test(target(c)) ? 'Acá va el verbo con -ing, no to + verbo.' : 'Acá va to + verbo, no -ing.') : undefined) ??
      (unitId === 'passive' ? 'En pasiva hace falta to be + participio: lo importante es la cosa, no quién lo hace.' : undefined) ??
      (unitId === 'inversion' && !/^(what|who)$/i.test(target(c)) ? 'Ese es el orden normal (sujeto + verbo); después de Never, Rarely, Not only… va el auxiliar antes del sujeto.' : undefined) ??
      RULES[unitId]?.[a.toLowerCase()];
    if (msg) out[k] = msg;
  }
  return out;
}

function clozePattern(unitId: string, pattern: Pattern, r: Rng): GenItem | null {
  const bank = CLOZE[unitId];
  const pool = pattern === 'transform' ? bank.filter((x) => x.tr) : bank;
  if (!pool.length) return null;
  const item = pick(pool, r);
  const sig = `${unitId}|${bank.indexOf(item)}|${pattern}`;
  const t = target(item);
  switch (pattern) {
    case 'recognize': {
      const opts = shuffle([t, ...item.alt], r);
      return { sig, exercise: { kind: 'choice', prompt: fill(item, '___'), options: opts, answer: opts.indexOf(t), explain: full(item), context: item.es, why: clozeWhy(unitId, item), wrong: clozeWrong(unitId, item) } };
    }
    case 'complete':
      return {
        sig,
        exercise: {
          kind: 'type',
          prompt: `${fill(item, '___')}${item.cue ? ` (${item.cue})` : ''}`,
          answers: [t],
          hint: 'Fijate en la oración en español: te dice qué va en el espacio.',
          explain: full(item),
          context: item.es,
          why: clozeWhy(unitId, item),
          wrong: clozeWrong(unitId, item),
        },
      };
    case 'transform':
      return { sig, exercise: { kind: 'transform', prompt: full(item), task: item.tr![0], answers: [item.tr![1]], why: item.tr![0].includes('pregunta') ? 'En la pregunta, el auxiliar o el verbo to be va antes del sujeto.' : 'En la negativa, not va pegado al auxiliar o al verbo to be (isn\'t, aren\'t, don\'t…).' } };
    case 'order': {
      const sentence = full(item);
      if (sentence.includes('→') || sentence.includes('"')) return null;
      const words = sentence.replace(/[.?!]$/, '').split(' ');
      return { sig, exercise: { kind: 'order', prompt: item.es, words: shuffle(words, r), answers: [sentence], why: clozeWhy(unitId, item) } };
    }
    case 'translate': {
      if (item.es.includes('→')) return null;
      return { sig, exercise: { kind: 'translate', prompt: item.es, answers: [full(item)], why: clozeWhy(unitId, item) } };
    }
  }
}

function soundPattern(unitId: string, pattern: Pattern, r: Rng): GenItem | null {
  const pairs = SOUND_PAIRS[unitId];
  const dict = DICTATIONS[unitId];
  if (pattern === 'recognize' && pairs) {
    const pair = pick(pairs, r);
    const answer = r() < 0.5 ? 0 : 1;
    return { sig: `${unitId}|${pair.join('-')}|${answer}`, exercise: { kind: 'sound', prompt: pair[answer], options: pair, answer } };
  }
  if ((pattern === 'complete' || pattern === 'order') && dict) {
    const sentence = pick(dict, r);
    if (pattern === 'complete') return { sig: `${unitId}|${sentence}|d`, exercise: { kind: 'listen', prompt: sentence, answers: [sentence] } };
    return { sig: `${unitId}|${sentence}|o`, exercise: { kind: 'order', prompt: '', words: shuffle(sentence.replace(/[.?!]$/, '').split(' '), r), answers: [sentence] } };
  }
  return null;
}

export const hasGenerator = (unitId: string) => !!GENERATED[unitId] || !!CLOZE[unitId] || !!SOUND_PAIRS[unitId] || !!DICTATIONS[unitId];

/** ¿Este generador puede producir este tipo de ejercicio para la unidad? */
export function supports(unitId: string, pattern: Pattern): boolean {
  if (GENERATED[unitId]) return true;
  if (CLOZE[unitId]) return pattern !== 'transform' || CLOZE[unitId].some((x) => x.tr);
  if (pattern === 'recognize') return !!SOUND_PAIRS[unitId];
  if (pattern === 'complete' || pattern === 'order') return !!DICTATIONS[unitId];
  return false;
}

// Memoria de oraciones ya vistas (para no repetir).
const SEEN_KEY = 'ingles-progresivo-seen';
let seen: string[] = [];
try {
  seen = JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]');
} catch {
  seen = [];
}
function remember(sig: string) {
  seen = [...seen.filter((x) => x !== sig), sig].slice(-600);
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
  } catch {
    /* sin persistencia */
  }
}

export function generate(unitId: string, pattern: Pattern, r: Rng = Math.random): Exercise | null {
  if (!supports(unitId, pattern)) return null;
  const spec = GENERATED[unitId];
  let item: GenItem | null = null;
  for (let i = 0; i < 25; i++) {
    const next = spec
      ? spec.cond
        ? condPattern(spec.cond, pattern, r)
        : tensePattern(spec.tenses!, pattern, r, spec.from)
      : CLOZE[unitId]
        ? clozePattern(unitId, pattern, r)
        : soundPattern(unitId, pattern, r);
    if (!next) continue;
    item = next;
    if (!seen.includes(item.sig)) break;
  }
  if (!item) return null;
  remember(item.sig);
  return item.exercise;
}

/** Ejercicios mezclados de varias reglas: hay que elegir el tiempo por el contexto. */
export function generateMixed(unitIds: string[], r: Rng = Math.random): { unitId: string; exercise: Exercise } | null {
  const ids = unitIds.filter((id) => GENERATED[id] || CLOZE[id]);
  if (!ids.length) return null;
  const unitId = pick(ids, r);
  const pattern = pick<Pattern>(['complete', 'complete', 'translate', 'recognize'], r);
  const exercise = generate(unitId, pattern, r) ?? generate(unitId, 'recognize', r);
  return exercise ? { unitId, exercise } : null;
}

/** Oraciones con un verbo fijo en todos los tiempos (taller de verbos). */
export const ALL_TENSES: Tense[] = ['presSimple', 'presCont', 'pastSimple', 'pastCont', 'will', 'goingTo', 'presPerf', 'presPerfCont', 'pastPerf', 'futPerf', 'futCont'];

export function verbSentence(verbId: string, pattern: Pattern, r: Rng = Math.random): Exercise {
  return tensePattern(ALL_TENSES, pattern, r, undefined, verbId).exercise;
}

export { pickParts as _pickParts, TIMES as _TIMES, verbOk as _verbOk };
