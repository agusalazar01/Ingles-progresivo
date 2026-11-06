import type { Branch, UserTurn } from '../content/calls';
import { normalize, variants } from './answer';

/** Las formas de lo que se escuchó, normalizadas (contracciones expandidas, 's como is y has). */
function forms(heard: string[]): string[] {
  const out = new Set<string>();
  for (const h of heard) {
    const n = normalize(h);
    if (!n) continue;
    out.add(n);
    for (const v of variants(n)) out.add(v);
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
  const p = normalize(a);
  return ` ${text} `.includes(` ${p} `);
}

/** ¿Coincide la rama? (todos sus patrones aparecen en alguna de las formas escuchadas) */
export function branchMatches(branch: Branch, heard: string[]): boolean {
  return forms(heard).some((t) => branch.match.every((pat) => pat.split('|').some((alt) => altMatches(alt, t))));
}

/** La primera rama que coincide con lo que dijiste, o null. */
export function matchTurn(turn: UserTurn, heard: string[]): Branch | null {
  return turn.branches.find((b) => branchMatches(b, heard)) ?? null;
}

const ACKS = ['Nice one.', 'Fair enough.', 'Righto.', 'Good stuff.', 'Too easy.', 'Sweet.'];
export const ack = () => ACKS[Math.floor(Math.random() * ACKS.length)];
