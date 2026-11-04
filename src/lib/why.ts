import type { Exercise, Unit } from '../content/types';
import { CURATED_WHY } from '../content/why-curated';
import { RULES, WRONG } from '../gen/why-rules';
import { normalize } from './answer';

/**
 * Explicación de un error en un ejercicio concreto:
 * `why` = por qué va la respuesta correcta; `yours` = por qué no va lo que pusiste.
 */
export interface Mistake {
  why: string | null;
  yours: string | null;
}

const N = (x: string) => normalize(x);

const NORM_RULES: Record<string, Map<string, string>> = {};
const ruleMap = (unitId: string) => {
  if (!NORM_RULES[unitId]) NORM_RULES[unitId] = new Map(Object.entries(RULES[unitId] ?? {}).map(([k, v]) => [N(k), v]));
  return NORM_RULES[unitId];
};
const NORM_WRONG = new Map(Object.entries(WRONG).map(([k, v]) => [N(k), v]));

/** Regla de la unidad (o forma incorrecta típica) para una palabra o frase. */
export function ruleFor(unitId: string, phrase: string): string | undefined {
  const k = N(phrase);
  return NORM_WRONG.get(k) ?? ruleMap(unitId).get(k);
}

// ───── Sonidos ─────

const VOWEL: Record<string, [string, string]> = {
  ship: ['ɪ', 'i corta y relajada'], sheep: ['iː', 'i larga, sonriendo'], live: ['ɪ', 'i corta'], leave: ['iː', 'i larga'],
  full: ['ʊ', 'u corta'], fool: ['uː', 'u larga'], cat: ['æ', 'a muy abierta, entre a y e'], cut: ['ʌ', 'a corta y apagada'],
  bit: ['ɪ', 'i corta'], beat: ['iː', 'i larga'], hat: ['æ', 'a abierta, entre a y e'], hut: ['ʌ', 'a corta y apagada'],
  sit: ['ɪ', 'i corta'], seat: ['iː', 'i larga'], fill: ['ɪ', 'i corta'], feel: ['iː', 'i larga'], pull: ['ʊ', 'u corta'],
  pool: ['uː', 'u larga'], bad: ['æ', 'a abierta'], bud: ['ʌ', 'a corta y apagada'], cap: ['æ', 'a abierta'], cup: ['ʌ', 'a corta y apagada'],
  hill: ['ɪ', 'i corta'], heal: ['iː', 'i larga'], fit: ['ɪ', 'i corta'], feet: ['iː', 'i larga'], look: ['ʊ', 'u corta'],
  luke: ['uː', 'u larga'], match: ['æ', 'a abierta'], much: ['ʌ', 'a corta y apagada'], rich: ['ɪ', 'i corta'], reach: ['iː', 'i larga'],
  pen: ['e', 'e como en español'], pan: ['æ', 'a abierta, entre a y e'], bed: ['e', 'e como en español'], work: ['ɜː', 'como una e larga con la boca neutra (bird)'],
  walk: ['ɔː', 'o larga'], hot: ['ɒ', 'o corta y abierta'],
};

function endingSound(w: string): string {
  if (/ed$/.test(w)) {
    if (/[td]ed$/.test(w)) return `«${w}»: después de t o d, la -ed suena /ɪd/ y suma una sílaba.`;
    if (/(k|p|s|sh|ch|f|x)ed$/.test(w)) return `«${w}»: después de un sonido sordo (k, p, s, sh, ch, f) la -ed suena /t/, sin sílaba extra.`;
    return `«${w}»: la -ed suena /d/, sin sílaba extra.`;
  }
  if (/s$/.test(w)) return `«${w}»: la -s final se tiene que escuchar (/s/ o /z/).`;
  return `«${w}» no tiene final agregado.`;
}

function soundWhy(ex: Extract<Exercise, { kind: 'sound' }>): string {
  const [a, b] = ex.options;
  const va = VOWEL[a.toLowerCase()];
  const vb = VOWEL[b.toLowerCase()];
  if (va && vb) return `Sonó «${ex.options[ex.answer]}». ${a} /${va[0]}/: ${va[1]} · ${b} /${vb[0]}/: ${vb[1]}.`;
  return `Sonó «${ex.options[ex.answer]}». ${endingSound(a)} ${endingSound(b)}`;
}

// ───── Diferencias entre lo que pusiste y lo correcto ─────

const words = (s: string) => N(s).split(' ').filter(Boolean);

/** Palabras que sobran o faltan respecto de la respuesta correcta. */
function diff(given: string, correct: string): { missing: string[]; extra: string[] } {
  const g = words(given);
  const c = words(correct);
  const missing = c.filter((w) => !g.includes(w));
  const extra = g.filter((w) => !c.includes(w));
  return { missing, extra };
}

const firstPoint = (unit: Unit) => unit.explanation[0]?.replace(/\*\*/g, '') ?? null;

export function explainMistake(key: string, unit: Unit, ex: Exercise, given: string, correct: string): Mistake {
  // Por qué va la correcta
  let why: string | null = ex.why ?? CURATED_WHY[key] ?? null;
  if (!why && ex.kind === 'sound') why = soundWhy(ex);
  if (!why && (ex.kind === 'choice' || ex.kind === 'type')) why = ruleFor(unit.id, correct) ?? null;
  if (!why && (ex.kind === 'translate' || ex.kind === 'order' || ex.kind === 'listen' || ex.kind === 'fix' || ex.kind === 'transform')) {
    const { missing } = diff(given, correct);
    for (let n = Math.min(3, missing.length); n >= 1 && !why; n--)
      for (let i = 0; i + n <= missing.length && !why; i++) why = ruleFor(unit.id, missing.slice(i, i + n).join(' ')) ?? null;
  }
  if (!why && ex.kind !== 'speak' && ex.kind !== 'sound') why = firstPoint(unit);

  // Por qué no va la tuya
  let yours: string | null = null;
  const g = given.trim();
  if (g && ex.kind !== 'sound' && ex.kind !== 'speak') {
    yours = ex.wrong?.[N(g)] ?? null;
    if (!yours) {
      const r = ruleFor(unit.id, g);
      if (r && N(g) !== N(correct)) yours = r.startsWith('«') ? r : `«${g}»: ${r}`;
    }
    if (!yours && ex.kind !== 'choice' && ex.kind !== 'type') {
      const { missing, extra } = diff(g, correct);
      if (ex.kind === 'order' && !missing.length && !extra.length) yours = 'Tenés todas las palabras, pero el orden no es el del inglés: sujeto + verbo + el resto (en preguntas, el auxiliar va antes del sujeto).';
      else if (extra.length <= 3 && missing.length <= 3 && (extra.length || missing.length)) {
        const r = [...extra, ...missing].map((w) => ruleFor(unit.id, w)).find(Boolean);
        const what = extra.length && missing.length ? `Pusiste «${extra.join(' ')}» donde va «${missing.join(' ')}».` : missing.length ? `Faltó «${missing.join(' ')}».` : `Sobra «${extra.join(' ')}».`;
        yours = r ? `${what} ${r}` : what;
      }
    }
  }
  if (yours && why && N(yours) === N(why)) yours = null;
  return { why, yours };
}
