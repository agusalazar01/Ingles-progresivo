/**
 * Motor de los roleplays con guion: elige las frases de la otra persona, reconoce tu respuesta con los
 * patrones del nodo y detecta los errores típicos previstos para explicarlos. Sin IA.
 */
import type { Branch, CallScript, Turn } from '../content/calls';
import type { RFix, RNode, RoleplayEntry, RoleplayScript } from '../content/roleplays/types';
import { ROLEPLAYS } from '../content/roleplays/catalog';
import { branchMatches } from './call';
import { setState } from './store';

export const pickLine = (s: string | string[] | undefined): string => (Array.isArray(s) ? s[Math.floor(Math.random() * s.length)] : (s ?? ''));

export const roleplayById = (id: string): RoleplayEntry | undefined => ROLEPLAYS.find((r) => r.id === id);

/** ¿Qué opción del nodo coincide con lo que dijiste? */
export function matchOption(node: RNode, heard: string[]) {
  return node.options.find((o) => branchMatches({ match: o.match, praise: '' } as Branch, heard)) ?? null;
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
