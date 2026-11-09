import type { RFix, RNode, ROption, RoleplayScript, RVocab } from './types';

/**
 * Forma corta para escribir guiones de roleplay (para que la biblioteca pueda crecer a cientos).
 *
 *  - Opción: [patrones, siguiente, respuesta?, elogio?]. En los patrones, « + » separa lo que tiene que
 *    aparecer TODO junto y «|» las alternativas (igual que en las llamadas): 'open|new + account'.
 *  - Nodo: { s: lo que dice, h: pista, a?: qué lograr, o: opciones, f: [siguiente, respuesta?] si no se
 *    entiende, x?: errores típicos [regex, bien, por qué] }.
 *  - Regla: el cierre (`c`) tiene que servir para cualquier camino. Lo concreto (un día, un precio) va en
 *    la respuesta de la opción que lleva a 'end', no en el cierre.
 */
export type O = [match: string, next: string, reply?: string | string[], praise?: string];
export type F = [wrong: string, right: string, why: string];
export interface N {
  s: string | string[];
  h: string;
  a?: string;
  o: O[];
  f: [next: string, reply?: string];
  x?: F[];
}
export interface Meta {
  /** Lugar. */
  p: string;
  /** Con quién: [nombre, rol]. */
  w: [string, string];
  /** Situación. */
  s: string;
  /** Objetivo. */
  g: string;
  /** Vocabulario: [inglés, español, pronunciación, ejemplo]. */
  v: [string, string, string, string][];
  /** Expresiones australianas: [inglés, español, cuándo]. */
  a?: [string, string, string][];
  /** Cierre (neutro: sirve para cualquier camino). */
  c: string | string[];
}

const opt = ([m, next, reply, praise]: O): ROption => ({ match: m.split(/\s\+\s/).map((x) => x.trim()), next, reply, praise: praise ?? 'Bien.' });
const fix = ([wrong, right, why]: F): RFix => ({ wrong, right, why });

/** Arma un guion. `n` es el número del catálogo (1–155 o R1–R37). */
export function rp(n: string, m: Meta, nodes: Record<string, N>, start = 'start'): RoleplayScript & { n: string } {
  const out: Record<string, RNode> = {};
  for (const [id, x] of Object.entries(nodes))
    out[id] = { say: x.s, hint: x.h, aim: x.a, options: x.o.map(opt), fallback: { next: x.f[0], reply: x.f[1] }, fixes: x.x?.map(fix) };
  const vocab: RVocab[] = m.v.map(([en, es, say, example]) => ({ en, es, say, example }));
  return {
    n,
    id: `n${n}`,
    place: m.p,
    partner: { name: m.w[0], role: m.w[1] },
    situation: m.s,
    goal: m.g,
    vocab,
    aussie: m.a?.map(([en, es, when]) => ({ en, es, when })),
    start,
    nodes: out,
    closing: m.c,
  };
}

// Errores típicos que se repiten en muchas situaciones.
export const FX = {
  want: ['\\bi want\\b', "I'd like… / Can I have…, please?", '«I want» suena brusco al pedir. Lo amable es «I’d like…» o «Can I…, please?».'] as F,
  giveMe: ['\\bgive me\\b', 'Can I have…, please?', '«Give me» suena a orden con alguien que no conocés.'] as F,
  age: ['\\bi have \\d+ years\\b', "I'm 27 (years old).", 'La edad va con be: I’m 27.'] as F,
  since: ["\\bi('m| am) (here|living|working|staying) (since|for)\\b", "I've been here for… / since…", 'Desde un momento hasta ahora se usa el present perfect: I’ve been here for a month.'] as F,
  inDay: ['\\bin (monday|tuesday|wednesday|thursday|friday|saturday|sunday)s?\\b', 'on Monday', 'Con los días de la semana va on.'] as F,
  explainMe: ['\\bexplain me\\b', 'Can you explain it to me?', 'Explain something to someone: explain it to me (no «explain me»).'] as F,
  depends: ['\\bdepends of\\b', 'It depends on…', 'Depend lleva on: it depends on.'] as F,
  arriveTo: ['\\barrived? to\\b', 'arrive in (una ciudad) / arrive at (un lugar)', 'Arrive nunca va con to: arrive in Sydney, arrive at the airport.'] as F,
  people: ['\\bpeople is\\b', 'people are', 'People es plural: people are.'] as F,
  informations: ['\\binformations\\b', 'information', 'Information es incontable: no lleva -s.'] as F,
  advices: ['\\badvices\\b', 'some advice', 'Advice es incontable: no lleva -s.'] as F,
  hereYouHave: ['\\bhere you have\\b', 'Here you are. / Here you go.', '«Here you have» es traducción literal. Se dice «Here you are» o «Here you go».'] as F,
  isPossible: ['^\\s*is possible\\b', 'Is it possible to…?', 'En inglés la pregunta necesita sujeto: Is it possible…?'] as F,
  noHave: ["\\bi no have\\b|\\bi not have\\b", "I don't have…", 'La negativa del presente va con don’t: I don’t have.'] as F,
  actual: ['\\bactually i (live|work|am living|am working)\\b', 'Currently I live… / At the moment I…', 'Actually = en realidad. «Actualmente» se dice currently o at the moment.'] as F,
};
