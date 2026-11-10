import type { Subject, Verb } from './lexicon';
import { conjugateEs, type EsTense } from './spanish';

export type Tense =
  | 'presSimple'
  | 'presCont'
  | 'pastSimple'
  | 'pastCont'
  | 'will'
  | 'goingTo'
  | 'presPerf'
  | 'presPerfCont'
  | 'pastPerf'
  | 'futPerf'
  | 'futCont'
  | 'pastPerfCont'
  | 'futPerfCont'
  | 'can'
  | 'shouldHave'
  | 'couldHave';

export type Pol = 'aff' | 'neg' | 'q';

export const TENSE_LABEL: Record<Tense, string> = {
  presSimple: 'presente simple',
  presCont: 'presente continuo',
  pastSimple: 'pasado simple',
  pastCont: 'pasado continuo',
  will: 'futuro con will',
  goingTo: 'futuro con going to',
  presPerf: 'presente perfecto',
  presPerfCont: 'presente perfecto continuo',
  pastPerf: 'pasado perfecto',
  futPerf: 'futuro perfecto',
  futCont: 'futuro continuo',
  pastPerfCont: 'pasado perfecto continuo',
  futPerfCont: 'futuro perfecto continuo',
  can: 'can',
  shouldHave: 'should have',
  couldHave: 'could have',
};

const onFirst = (phrase: string, f: (w: string) => string) => {
  const i = phrase.indexOf(' ');
  return i < 0 ? f(phrase) : f(phrase.slice(0, i)) + phrase.slice(i);
};

export const third = (base: string) =>
  onFirst(base, (w) =>
    w === 'have' ? 'has' : w === 'do' ? 'does' : w === 'go' ? 'goes' : /(s|sh|ch|x|o)$/.test(w) ? w + 'es' : /[^aeiou]y$/.test(w) ? w.slice(0, -1) + 'ies' : w + 's',
  );

export const ingOf = (v: Verb) =>
  v.ing ?? onFirst(v.base, (w) => (/ie$/.test(w) ? w.slice(0, -2) + 'ying' : /[^e]e$/.test(w) ? w.slice(0, -1) + 'ing' : w + 'ing'));

const beNow = (s: Subject) => (s.en === 'I' ? 'am' : s.third ? 'is' : 'are');
const bePast = (s: Subject) => (s.were ? 'were' : 'was');
const neg = (aux: string) =>
  ({ am: 'am not', is: "isn't", are: "aren't", was: "wasn't", were: "weren't", do: "don't", does: "doesn't", did: "didn't", will: "won't", have: "haven't", has: "hasn't", had: "hadn't", can: "can't", should: "shouldn't", could: "couldn't" })[aux] ?? `${aux} not`;

/** Partes del verbo conjugado: primer auxiliar y el resto. Sin auxiliar (presente/pasado simple afirmativo), aux = ''. */
export function verbParts(t: Tense, s: Subject, v: Verb, pol: Pol): { aux: string; rest: string } {
  const ing = ingOf(v);
  const simple = (aff: string, doAux: string) => (pol === 'aff' ? { aux: '', rest: aff } : { aux: doAux, rest: v.base });
  switch (t) {
    case 'presSimple':
      return simple(s.third ? third(v.base) : v.base, s.third ? 'does' : 'do');
    case 'pastSimple':
      return simple(v.past, 'did');
    case 'presCont':
      return { aux: beNow(s), rest: ing };
    case 'pastCont':
      return { aux: bePast(s), rest: ing };
    case 'will':
      return { aux: 'will', rest: v.base };
    case 'goingTo':
      return { aux: beNow(s), rest: `going to ${v.base}` };
    case 'presPerf':
      return { aux: s.third ? 'has' : 'have', rest: v.pp };
    case 'presPerfCont':
      return { aux: s.third ? 'has' : 'have', rest: `been ${ing}` };
    case 'pastPerf':
      return { aux: 'had', rest: v.pp };
    case 'futPerf':
      return { aux: 'will', rest: `have ${v.pp}` };
    case 'futCont':
      return { aux: 'will', rest: `be ${ing}` };
    case 'pastPerfCont':
      return { aux: 'had', rest: `been ${ing}` };
    case 'futPerfCont':
      return { aux: 'will', rest: `have been ${ing}` };
    case 'can':
      return { aux: 'can', rest: v.base };
    case 'shouldHave':
      return { aux: 'should', rest: `have ${v.pp}` };
    case 'couldHave':
      return { aux: 'could', rest: `have ${v.pp}` };
  }
}

/** La forma verbal tal como va en una oración afirmativa o negativa ("has worked", "didn't work"). */
export function verbPhrase(t: Tense, s: Subject, v: Verb, pol: Exclude<Pol, 'q'>): string {
  const { aux, rest } = verbParts(t, s, v, pol);
  if (pol === 'neg') return `${neg(aux)} ${rest}`;
  return aux ? `${aux} ${rest}` : rest;
}

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

export function sentenceEn(t: Tense, s: Subject, v: Verb, pol: Pol, tail: string): string {
  const end = tail ? ` ${tail}` : '';
  if (pol === 'q') {
    const { aux, rest } = verbParts(t, s, v, 'q');
    const subj = s.en === 'I' ? 'I' : s.en;
    return `${cap(aux)} ${subj} ${rest}${end}?`;
  }
  return `${cap(s.en)} ${verbPhrase(t, s, v, pol)}${end}.`;
}

const ES_TENSE: Record<Tense, EsTense> = {
  presSimple: 'pres',
  presCont: 'presCont',
  pastSimple: 'pret',
  pastCont: 'pastCont',
  will: 'fut',
  goingTo: 'goingTo',
  presPerf: 'perf',
  presPerfCont: 'perfCont',
  pastPerf: 'pluperf',
  futPerf: 'futPerf',
  futCont: 'futCont',
  pastPerfCont: 'pluperfCont',
  futPerfCont: 'futPerfCont',
  can: 'pres',
  shouldHave: 'condPerf',
  couldHave: 'condPerf',
};

export function sentenceEs(t: Tense, s: Subject, esVerb: string, pol: Pol, tailEs: string): string {
  let vp: string;
  if (t === 'can') vp = `${conjugateEs('poder', 'pres', s.p)} ${esVerb}`;
  else if (t === 'shouldHave') vp = `${conjugateEs('deber', 'cond', s.p)} haber ${conjugateEs(esVerb, 'perf', 0).split(' ').slice(1).join(' ')}`;
  else if (t === 'couldHave') vp = `${conjugateEs('poder', 'cond', s.p)} haber ${conjugateEs(esVerb, 'perf', 0).split(' ').slice(1).join(' ')}`;
  else vp = conjugateEs(esVerb, ES_TENSE[t], s.p);
  const body = [s.es, pol === 'neg' ? 'no' : '', vp, tailEs].filter(Boolean).join(' ');
  const t2 = body.replace(/\s+/g, ' ').trim();
  const c = t2.charAt(0).toUpperCase() + t2.slice(1);
  return pol === 'q' ? `¿${c}?` : `${c}.`;
}
