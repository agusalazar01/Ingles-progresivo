import type { Branch, UserTurn } from '../content/calls';
import { canon, normalize, variants } from './answer';

/** Las formas de lo que se escuchó, normalizadas (contracciones expandidas, 's como is y has). */
function forms(heard: string[]): string[] {
  const out = new Set<string>();
  for (const h of heard) {
    const n = normalize(h);
    if (!n) continue;
    out.add(n);
    for (const v of variants(n)) out.add(v);
    for (const v of variants(canon(n))) out.add(v);
    // «thirty-dollar», «second-hand»: también separadas.
    if (n.includes('-')) out.add(n.replace(/-/g, ' '));
  }
  return [...out];
}

function altMatches(alt: string, text: string): boolean {
  const a = alt.trim();
  if (!a) return false;
  if (a === '*') return text.trim().length > 0;
  if (a === '[0-9]') return /\d/.test(text);
  const words = text.split(' ');
  if (a.startsWith('-')) {
    const suf = a.slice(1);
    return words.some((w) => w.length > suf.length + 1 && w.endsWith(suf));
  }
  // Patrones escritos sin apóstrofo («don t», «it s», «i ll»): se leen como contracción y se expanden igual que lo escuchado.
  const p = normalize(a.replace(/\b([a-z]+) (t|s|ll|d|re|ve|m)\b/g, "$1'$2"));
  if (p.includes('[0-9]')) {
    const rx = new RegExp(`(^| )${p.split('[0-9]').map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\d+')}( |$)`);
    return rx.test(text);
  }
  if (` ${text} `.includes(` ${p} `)) return true;
  // Tolerancia a plurales y terminaciones: «bag» vale por «bags», «thank» por «thanks», «booked» por «book».
  return ` ${stemAll(text)} `.includes(` ${stemAll(p)} `);
}

const stem = (w: string) => {
  for (const suf of ['ing', 'ed', 'es', 's']) if (w.endsWith(suf) && w.length - suf.length >= 3) return w.slice(0, -suf.length);
  return w;
};
const stemAll = (t: string) => t.split(' ').map(stem).join(' ');

/** ¿Coincide la rama? (todos sus patrones aparecen en alguna de las formas escuchadas) */
export function branchMatches(branch: Branch, heard: string[]): boolean {
  return forms(heard).some((t) => branch.match.every((pat) => pat.split('|').some((alt) => altMatches(alt, t))));
}

// ───── Sí / no ─────
// Si dijiste que no, gana la rama que contempla el no (aunque otra rama también coincida por alguna palabra).
// Si no dijiste que no, una rama no puede coincidir solo por «no» / «not» (así «OK» o «Yes» no caen en el no).

const NEUTRAL = /\b(no worries|no problem|no dramas|no rush|not bad|not only|why not|no matter|could not agree more)\b/g;
const NEG_RX = /\b(no|not|nah|nope|never|nothing|none|cannot)\b/;

/** ¿Lo que se escuchó es una respuesta negativa? */
export function saidNo(heard: string[]): boolean {
  return heard.some((h) => NEG_RX.test(normalize(h).replace(NEUTRAL, ' ')));
}

const negAlt = (alt: string) => {
  const a = alt.trim();
  if (!a || a === '*' || a.startsWith('-')) return false;
  const p = normalize(a.replace(/\b([a-z]+) (t|s|ll|d|re|ve|m)\b/g, "$1'$2")).replace(NEUTRAL, ' ');
  return NEG_RX.test(p);
};
const isNegBranch = (b: Pick<Branch, 'match'>) => b.match.some((pat) => pat.split('|').some(negAlt));
/** La rama sin las alternativas negativas (para respuestas que no dicen que no). */
const withoutNeg = <B extends Pick<Branch, 'match'>>(b: B): B => ({ ...b, match: b.match.map((pat) => pat.split('|').filter((alt) => !negAlt(alt)).join('|')) });

/** Elige la rama según lo que dijiste, teniendo en cuenta si dijiste que sí o que no. */
export function pickBranch<B extends Pick<Branch, 'match'>>(branches: B[], heard: string[], negative = saidNo(heard)): B | null {
  const test = (b: B) => branchMatches(b as unknown as Branch, heard);
  if (negative) return branches.find((b) => isNegBranch(b) && test(b)) ?? branches.find(test) ?? null;
  return branches.find((b) => {
    const m = withoutNeg(b);
    return m.match.every((p) => p.length > 0) && branchMatches(m as unknown as Branch, heard);
  }) ?? null;
}

/** La rama que corresponde a lo que dijiste, o null. */
export function matchTurn(turn: UserTurn, heard: string[]): Branch | null {
  return pickBranch(turn.branches, heard);
}

const ACKS = ['Nice one.', 'Fair enough.', 'Righto.', 'Good stuff.', 'Too easy.', 'Sweet.'];
export const ack = () => ACKS[Math.floor(Math.random() * ACKS.length)];
