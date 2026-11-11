/**
 * Motor de los roleplays con guion: elige las frases de la otra persona, reconoce tu respuesta con los
 * patrones del nodo y detecta los errores típicos previstos para explicarlos. Sin IA.
 */
import type { Branch, CallScript, Turn } from '../content/calls';
import type { RFix, RNode, ROption, RoleplayEntry, RoleplayScript } from '../content/roleplays/types';
import { ROLEPLAYS } from '../content/roleplays/catalog';
import { branchMatches } from './call';
import { patternExamples, pickByMeaning, type Candidate, type Embedder } from './semantic';
import { synonymForms } from './understand';
import { setState } from './store';

export const pickLine = (s: string | string[] | undefined): string => (Array.isArray(s) ? s[Math.floor(Math.random() * s.length)] : (s ?? ''));

export const roleplayById = (id: string): RoleplayEntry | undefined => ROLEPLAYS.find((r) => r.id === id);

/** ¿Qué opción del nodo coincide con lo que dijiste? (por palabras, aceptando sinónimos: «yeah» = «yes»). */
export function matchOption(node: RNode, heard: string[]) {
  const all = [...heard, ...heard.flatMap((h) => synonymForms(h))];
  return node.options.find((o) => branchMatches({ match: o.match, praise: '' } as Branch, all)) ?? null;
}

/** Frases de ejemplo de cada opción (para comparar por significado): sus patrones y, si corresponde, la pista. */
export function optionExamples(node: RNode): Candidate[] {
  return node.options
    .map((o, option) => {
      if (o.match.some((m) => m.split('|').includes('*'))) return { option, examples: [] };
      const ex = patternExamples(o.match);
      if (branchMatches({ match: o.match, praise: '' } as Branch, [node.hint])) ex.unshift(node.hint);
      return { option, examples: ex };
    })
    .filter((c) => c.examples.length);
}

export interface Understood {
  option: ROption | null;
  /** Cómo se entendió: por las palabras o por el significado. */
  how: 'words' | 'meaning' | null;
  /** Qué tan cerca estuvo lo que dijiste de alguna opción (0–1; -1 si no se pudo medir). */
  closeness: number;
}

/** Entiende tu respuesta: primero por palabras y sinónimos; si no alcanza y el modelo está, por el significado. */
export async function understand(node: RNode, said: string, emb: Embedder | null): Promise<Understood> {
  const byWords = matchOption(node, [said]);
  if (byWords) return { option: byWords, how: 'words', closeness: 1 };
  if (!emb) return { option: null, how: null, closeness: -1 };
  try {
    const { best, top } = await pickByMeaning(emb, said, optionExamples(node));
    if (best) return { option: node.options[best.option], how: 'meaning', closeness: best.score };
    return { option: null, how: null, closeness: top };
  } catch {
    return { option: null, how: null, closeness: -1 };
  }
}

/** Errores previstos que aparecen en lo que dijiste. */
export function fixesFor(node: RNode, said: string): RFix[] {
  const t = said.toLowerCase().replace(/[’]/g, "'");
  return (node.fixes ?? []).filter((f) => {
    try {
      return new RegExp(f.wrong, 'i').test(t);
    } catch {
      return false;
    }
  });
}

export function saveRoleplay(id: string, fixes: number, turns: number) {
  setState((s) => ({ ...s, roleplays: { ...(s.roleplays ?? {}), [id]: { date: new Date().toISOString(), fixes, turns } } }));
}

/**
 * Convierte el camino principal del guion en una llamada para el modo libre con IA (opcional):
 * la IA usa las frases como guía, pero la charla no queda atada a los patrones.
 */
export function toCallScript(e: RoleplayEntry, s: RoleplayScript): CallScript {
  const turns: Turn[] = [];
  let id: string | undefined = s.start;
  const seen = new Set<string>();
  while (id && id !== 'end' && !seen.has(id)) {
    seen.add(id);
    const n: RNode = s.nodes[id];
    turns.push({ o: pickLine(n.say) });
    turns.push({ u: { model: n.hint, branches: [{ match: ['*'], praise: 'Bien.' }], tip: n.aim ?? `Por ejemplo: «${n.hint}»` } });
    id = n.options[0]?.next ?? n.fallback.next;
  }
  return { id: `rp-${e.id}`, unitId: '', title: e.titleEs, scene: `${s.place}. You are ${s.partner.name}, ${s.partner.role}. ${s.situation}`, goal: s.goal, turns };
}

/** Pedidos de «repetí» o «no entendí»: Oliver repite (más lento) en vez de tomarlo como respuesta. */
export const isRepeatRequest = (said: string) =>
  /\b(repeat|say (that|it) again|come again|pardon|didn'?t (get|catch|understand)|don'?t understand|do not understand|what do you mean|sorry\??$|slow(er|ly)|one more time|what\??$)\b/i.test(said.trim());

/** Las llamadas de las unidades con Oliver, en el mismo formato que los roleplays (misma pantalla y mismo resumen). */
export function callToRoleplay(c: CallScript, level: RoleplayEntry['level']): RoleplayEntry {
  const nodes: RoleplayScript['nodes'] = {};
  let pending: string[] = [];
  const ids: string[] = [];
  for (const t of c.turns) {
    if ('o' in t) {
      pending.push(t.o);
      continue;
    }
    const id = `n${ids.length}`;
    ids.push(id);
    nodes[id] = {
      say: pending.join(' ') || '…',
      hint: t.u.model,
      aim: t.u.tip,
      options: t.u.branches.map((b) => ({ match: b.match, reply: b.reply, praise: b.praise, next: '' })),
      fallback: { next: '' },
    };
    pending = [];
  }
  ids.forEach((id, i) => {
    const next = ids[i + 1] ?? 'end';
    nodes[id].options.forEach((o) => (o.next = next));
    nodes[id].fallback.next = next;
  });
  const script: RoleplayScript = {
    id: `call-${c.id}`,
    place: c.scene,
    partner: { name: 'Oliver', role: 'tu amigo australiano' },
    situation: c.scene,
    goal: c.goal,
    vocab: [],
    start: ids[0] ?? 'end',
    nodes,
    closing: pending.join(' '),
  };
  return { id: `call-${c.id}`, n: c.id, category: 'calls', title: c.title, titleEs: c.title, level, script };
}
