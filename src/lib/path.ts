import { unitById } from '../content/curriculum';
import { SECTIONS, type PathSection } from '../content/path';
import type { Exercise, Level } from '../content/types';
import { studyOf } from '../content/stories/study';
import type { RunnerItem } from '../components/ExerciseRunner';
import { exerciseRef } from './actions';
import { activeSteps, stepItems, unitSentences } from './ladder';
import { isDone } from './progress';
import { dueKeys, getState, setState, type AppState } from './store';

/** Tipos de nodo del camino. */
export type NodeKind = 'guide' | 'lesson' | 'listen' | 'roleplay' | 'story' | 'practice' | 'postcard' | 'review' | 'exam';

export interface PathNode {
  id: string;
  kind: NodeKind;
  label: string;
  sectionId: string;
  unitId?: string;
  /** Índice del escalón en la unidad (para las lecciones). */
  step?: number;
  roleplay?: string;
  story?: string;
}

export type PathRow = { divider: string } | { node: PathNode };

export const NODE_ICON: Record<NodeKind, string> = {
  guide: '📘',
  lesson: '★',
  listen: '🎧',
  roleplay: '🎭',
  story: '📖',
  practice: '🏋',
  postcard: '💌',
  review: '🏅',
  exam: '🏆',
};

export const NODE_LABEL: Record<NodeKind, string> = {
  guide: 'Guía',
  lesson: 'Lección',
  listen: 'Escucha',
  roleplay: 'Roleplay',
  story: 'Cuento',
  practice: 'Práctica',
  postcard: 'Postal',
  review: 'Repaso final',
  exam: 'Repaso de etapa',
};

/**
 * Filas de una sección. Por cada unidad: un separador con su tema, un nodo por escalón y, para afianzar, una escucha
 * y una práctica de esa unidad (otro tipo de ejercicio con lo mismo, para que no sea repetir igual). Entre unidad y
 * unidad, roleplays, el cuento y la postal; al final, el repaso de la sección y, en la última sección de cada nivel,
 * el repaso de etapa con todo el nivel.
 */
export function sectionRows(sec: PathSection): PathRow[] {
  const rows: PathRow[] = [];
  const node = (n: Omit<PathNode, 'sectionId'>) => rows.push({ node: { ...n, sectionId: sec.id } });
  const special = (after: number) => {
    if (after === 0 && sec.roleplays[0]) node({ id: `${sec.id}:rp0`, kind: 'roleplay', label: 'Roleplay', roleplay: sec.roleplays[0] });
    if (after === Math.min(1, sec.units.length - 1)) {
      if (sec.story && studyOf(sec.story)) node({ id: `${sec.id}:story`, kind: 'story', label: 'Cuento', story: sec.story });
      node({ id: `${sec.id}:postcard`, kind: 'postcard', label: 'Postal' });
    }
  };
  sec.units.forEach((uid, i) => {
    const u = unitById(uid);
    rows.push({ divider: u.title });
    const steps = activeSteps(u);
    steps.forEach((st, k) => {
      node({ id: `${uid}:${st.id}`, kind: st.id === 'explain' ? 'guide' : 'lesson', label: st.title, unitId: uid, step: k });
      // La escucha va a mitad de la unidad (después de reconocer); la práctica, al terminar los escalones.
      if (k === Math.min(2, steps.length - 1)) node({ id: `${uid}:listen`, kind: 'listen', label: 'Escucha', unitId: uid });
    });
    node({ id: `${uid}:practice`, kind: 'practice', label: 'Práctica', unitId: uid });
    special(i);
  });
  sec.roleplays.slice(1).forEach((rp, i) => node({ id: `${sec.id}:rp${i + 1}`, kind: 'roleplay', label: 'Roleplay', roleplay: rp }));
  node({ id: `${sec.id}:review`, kind: 'review', label: 'Repaso final' });
  const idx = SECTIONS.indexOf(sec);
  if (idx >= 0 && SECTIONS[idx + 1]?.level !== sec.level) node({ id: `${sec.level.toLowerCase()}:exam`, kind: 'exam', label: `Repaso de etapa ${sec.level}` });
  return rows;
}

export const sectionNodes = (sec: PathSection) => sectionRows(sec).flatMap((r) => ('node' in r ? [r.node] : []));

/** ¿Está hecho el nodo? Las lecciones salen del progreso de la unidad; el resto se guarda aparte. */
export function nodeDone(s: AppState, n: PathNode): boolean {
  if (n.unitId !== undefined && n.step !== undefined) {
    const p = s.units[n.unitId];
    return !!p?.status || (p?.step ?? 0) > n.step;
  }
  if (n.kind === 'roleplay') return !!s.roleplays?.[n.roleplay!] || !!s.path?.[n.id];
  return !!s.path?.[n.id];
}

/** Las unidades de gramática de la sección: son las que abren la sección siguiente (las de situaciones no traban). */
const coreDone = (s: AppState, sec: PathSection) => sec.units.filter((id) => !unitById(id).context).every((id) => isDone(s, id));

export function sectionOpen(s: AppState, index: number): boolean {
  return SECTIONS.slice(0, index).every((sec) => coreDone(s, sec));
}

export const sectionComplete = (s: AppState, sec: PathSection) => sec.units.every((id) => isDone(s, id)) && !!s.path?.[`${sec.id}:review`];

export type NodeState = 'done' | 'current' | 'open' | 'locked';

/** Estado de cada nodo: dentro de la sección se avanza en orden (un nodo se abre cuando el anterior está hecho). */
export function nodeStates(s: AppState): Map<string, NodeState> {
  const out = new Map<string, NodeState>();
  let current = false;
  SECTIONS.forEach((sec, i) => {
    const open = sectionOpen(s, i);
    let prevDone = true;
    for (const n of sectionNodes(sec)) {
      const done = nodeDone(s, n);
      let st: NodeState = done ? 'done' : open && prevDone ? 'open' : 'locked';
      if (st === 'open' && !current) {
        st = 'current';
        current = true;
      }
      out.set(n.id, st);
      // Las escuchas, cuentos, roleplays y demás se ofrecen en orden, pero no traban las lecciones que siguen.
      if (n.kind === 'guide' || n.kind === 'lesson') prevDone = done;
    }
  });
  return out;
}

export function markNode(id: string) {
  setState((s) => ({ ...s, path: { ...(s.path ?? {}), [id]: new Date().toISOString() } }));
}

/** Busca un nodo en todo el camino. */
export function findNode(id: string): { sec: PathSection; node: PathNode } | null {
  for (const sec of SECTIONS) {
    const node = sectionNodes(sec).find((n) => n.id === id);
    if (node) return { sec, node };
  }
  return null;
}

/** Lo que se practica en un nodo: la unidad (escucha y práctica por unidad), la sección o el nivel entero. */
export function nodeItems(sec: PathSection, node: PathNode): RunnerItem[] {
  const scope = node.unitId ? { ...sec, units: [node.unitId] } : sec;
  if (node.kind === 'listen') return listenItems(scope, node.unitId ? 8 : 10);
  if (node.kind === 'practice') return practiceItems(scope, node.unitId ? 8 : 10);
  if (node.kind === 'exam') return reviewItems({ ...sec, units: SECTIONS.filter((x) => x.level === sec.level).flatMap((x) => x.units) }, 20);
  return reviewItems(sec);
}

const shuffle = <T>(a: T[]) => a.map((x) => ({ x, k: Math.random() })).sort((p, q) => p.k - q.k).map((p) => p.x);
const units = (sec: PathSection) => sec.units.map(unitById);

/** Escucha: dictados y sonidos de la sección, más los ejemplos de cada unidad para escribir de oído. */
export function listenItems(sec: PathSection, n = 10): RunnerItem[] {
  const out: RunnerItem[] = [];
  for (const u of units(sec)) {
    u.exercises.forEach((e, i) => {
      if (e.kind === 'listen' || e.kind === 'sound') out.push({ key: `${u.id}#${i}`, unit: u, exercise: e });
    });
    for (const st of ['recognize', 'complete'] as const)
      for (const it of stepItems(u, st)) if (it.exercise.kind === 'listen' || it.exercise.kind === 'sound') out.push(it);
    u.examples.forEach(([en], i) => out.push({ key: `x:${u.id}:ex${i}`, unit: u, exercise: { kind: 'listen', prompt: en, answers: [en] } as Exercise }));
    for (const t of unitSentences(u).slice(0, 8)) out.push({ key: `x:${u.id}:s`, unit: u, exercise: { kind: 'listen', prompt: t.en, answers: [t.en] } as Exercise });
    for (const l of u.context?.dialogue ?? []) out.push({ key: `x:${u.id}:dlg`, unit: u, exercise: { kind: 'listen', prompt: l.en, answers: [l.en] } as Exercise });
  }
  // Si una unidad trae pocas oraciones para dictar, se suman las respuestas modelo de sus ejercicios.
  if (out.length < n)
    for (const u of units(sec))
      for (const st of ['transform', 'build'] as const)
        for (const it of stepItems(u, st)) {
          const a = 'answers' in it.exercise ? it.exercise.answers[0] : undefined;
          if (a && a.split(' ').length <= 14) out.push({ key: `x:${u.id}:la`, unit: u, exercise: { kind: 'listen', prompt: a, answers: [a] } as Exercise });
        }
  const seen = new Set<string>();
  return shuffle(out)
    .filter((it) => (seen.has(it.exercise.prompt) ? false : (seen.add(it.exercise.prompt), true)))
    .slice(0, n);
}

/** Práctica: lo que te costó en la sección (errores y tarjetas vencidas); si no hay, ejercicios variados. */
export function practiceItems(sec: PathSection, n = 10): RunnerItem[] {
  const s = getState();
  const ids = new Set(sec.units);
  const mine = (k: string) => ids.has(k.split(/[#@]/)[0]);
  const keys = [
    ...sec.units.flatMap((u) => (s.missed?.[u] ?? []).map((m) => m.key)),
    ...Object.keys(s.errors).filter(mine),
    ...dueKeys(s).filter(mine),
  ];
  const items = [...new Set(keys)].map(exerciseRef).filter((x): x is RunnerItem => !!x);
  if (items.length < n)
    for (const u of units(sec)) for (const st of ['transform', 'build', 'fluency'] as const) items.push(...stepItems(u, st));
  return shuffle(items).slice(0, n);
}

/** Repaso final: un poco de cada unidad, de los escalones más difíciles. */
export function reviewItems(sec: PathSection, n = 12): RunnerItem[] {
  const us = units(sec);
  const per = Math.max(1, Math.ceil(n / us.length));
  return shuffle(us.flatMap((u) => shuffle([...stepItems(u, 'transform'), ...stepItems(u, 'build'), ...stepItems(u, 'fluency')]).slice(0, per))).slice(0, n);
}

export const REVIEW_PASS = 0.75;

/** Primer nivel de cada sección (para el separador de nivel y la prueba para saltar). */
export const levelStarts = (): Map<Level, number> => {
  const m = new Map<Level, number>();
  SECTIONS.forEach((s, i) => !m.has(s.level) && m.set(s.level, i));
  return m;
};
