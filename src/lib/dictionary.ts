import { CONTRACTIONS, FORMS, GLOSSARY, type GlossEntry } from '../content/glossary';

export interface Lookup {
  word: string;
  lemma?: string;
  entry?: GlossEntry;
  contraction?: string;
  /** "plural de", "pasado de", etc. cuando la palabra es una forma de otra. */
  note?: string;
}

const clean = (w: string) => w.toLowerCase().replace(/’/g, "'");

/** Busca la forma base (lema) de una palabra: worked → work, cities → city, went → go. */
export function lemmaOf(raw: string): { lemma: string; note?: string } | null {
  const w = clean(raw).replace(/'s$/, '');
  if (GLOSSARY[w]) return { lemma: w };
  if (FORMS[w] && GLOSSARY[FORMS[w]]) return { lemma: FORMS[w], note: `forma de "${FORMS[w]}"` };
  const tries: [RegExp, string, string][] = [
    [/ies$/, 'y', 'plural o 3.ª persona de'],
    [/ied$/, 'y', 'pasado de'],
    [/es$/, '', 'plural o 3.ª persona de'],
    [/s$/, '', 'plural o 3.ª persona de'],
    [/ed$/, '', 'pasado de'],
    [/ed$/, 'e', 'pasado de'],
    [/d$/, '', 'pasado de'],
    [/ing$/, '', 'forma -ing de'],
    [/ing$/, 'e', 'forma -ing de'],
    [/ier$/, 'y', 'comparativo de'],
    [/er$/, '', 'comparativo de'],
    [/est$/, '', 'superlativo de'],
    [/r$/, '', 'comparativo de'],
  ];
  for (const [re, rep, note] of tries) {
    if (!re.test(w)) continue;
    let base = w.replace(re, rep);
    if (GLOSSARY[base]) return { lemma: base, note: `${note} "${base}"` };
    // consonante duplicada: stopped → stop, bigger → big, running → run
    if (/(.)\1$/.test(base)) {
      base = base.slice(0, -1);
      if (GLOSSARY[base]) return { lemma: base, note: `${note} "${base}"` };
    }
  }
  return null;
}

export function lookup(raw: string): Lookup {
  const w = clean(raw);
  if (CONTRACTIONS[w]) return { word: raw, contraction: CONTRACTIONS[w] };
  const found = lemmaOf(w);
  if (!found) return { word: raw };
  return { word: raw, lemma: found.lemma, entry: GLOSSARY[found.lemma], note: found.note };
}

/** Respaldo con internet: definición en inglés de un diccionario abierto (Free Dictionary API). */
export async function onlineDefinition(word: string): Promise<{ definition: string; example?: string }[]> {
  const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`);
  if (!res.ok) return [];
  const data = (await res.json()) as { meanings?: { definitions?: { definition: string; example?: string }[] }[] }[];
  return data
    .flatMap((d) => d.meanings ?? [])
    .flatMap((m) => m.definitions ?? [])
    .slice(0, 3);
}
