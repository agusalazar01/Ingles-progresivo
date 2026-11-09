import { useSyncExternalStore } from 'react';
import { createEmptyCard, fsrs, Rating, type Card, type Grade } from 'ts-fsrs';
import type { Exercise, Level, Skill } from '../content/types';
import type { Accent } from './speech';
import { UNITS } from '../content/curriculum';
import { PATTERNS, supports } from '../gen/generate';

/** FSRS: el mismo algoritmo de repaso espaciado que usa Anki. Retención objetivo 90%. */
const scheduler = fsrs({ request_retention: 0.9, enable_fuzz: true });

/** skip = el usuario no pudo hacer el ejercicio (por ejemplo, hablar en voz alta): no se califica. */
export type Outcome = 'good' | 'hard' | 'again' | 'skip';
const RATING: Record<Exclude<Outcome, 'skip'>, Grade> = { good: Rating.Good, hard: Rating.Hard, again: Rating.Again };

type StoredCard = Omit<Card, 'due' | 'last_review'> & { due: string; last_review?: string };

export interface ErrorEntry {
  key: string;
  unitId: string;
  prompt: string;
  given: string;
  correct: string;
  count: number;
  last: string;
}

export interface TestResult {
  date: string;
  level: Level | null;
  perLevel: Partial<Record<Level, { correct: number; total: number }>>;
  perSkill: Partial<Record<Skill, { correct: number; total: number }>>;
}

export interface UnitProgress {
  /** Sin status = en curso (escalones parciales). */
  status?: 'mastered' | 'placed';
  /** Escalones aprobados (0–6). */
  step?: number;
  date: string;
  score?: number;
}

/** Escalón a medio hacer: se guarda después de cada respuesta para poder retomarlo. */
export interface SavedRun {
  stepIndex: number;
  queue: { key: string; exercise: Exercise; first: boolean }[];
  pos: number;
  firstTry: { key: string; unitId: string; prompt: string; given: string; correct: string; outcome: Outcome; ms?: number }[];
  date: string;
}

export interface AppState {
  version: 1;
  units: Record<string, UnitProgress>;
  cards: Record<string, StoredCard>;
  errors: Record<string, ErrorEntry>;
  tests: TestResult[];
  activity: string[];
  stats: { reviews: number; correct: number };
  settings: {
    accent: Accent;
    newWords: number;
    /** Tema de colores. */
    theme: 'dark' | 'light';
    /** Sonidos de acierto, error y festejo. */
    sounds: boolean;
    /** Voz elegida del teléfono (nombre); vacía = según el acento. */
    voice: string;
    /** IA sin internet para la llamada con Oliver: qué voz, oído y charla usar ('system' = la del teléfono / 'off'). */
    ai: { voice: string; speaker: number; ear: string; brain: string; tune?: Record<string, Partial<import('./ai').Tune>> };
  };
  /** Exámenes de cierre de nivel aprobados. */
  levels: Partial<Record<Level, { date: string; score: number }>>;
  /** Vocabulario: palabra → estado. */
  words: Record<string, { added: string; known?: boolean }>;
  /** Taller de verbos: verbo → etapas aprobadas (0–4). */
  verbs: Record<string, number>;
  /** Escalones sin terminar, por unidad. */
  resume: Record<string, SavedRun>;
  /** Llamadas con Oliver hechas: proporción de frases bien. */
  calls: Record<string, { date: string; score: number }>;
  /** Lo que Oliver recuerda de la Llamada libre (solo en el teléfono). */
  oliver?: import('./oliver').OliverMemory;
  /** «Decilo en inglés»: frases propias para practicar. */
  phrases?: Phrase[];
  /** Ejercicios que salieron mal en los escalones, por unidad: vuelven con otra oración del mismo formato. */
  missed?: Record<string, MissedItem[]>;
  /** Últimas oraciones vistas por unidad (normalizadas), para no repetirlas al armar los escalones. */
  seen?: Record<string, string[]>;
}

export interface MissedItem {
  id: string;
  key: string;
  /** Formato del ejercicio (tipo + consigna), para generar otro igual. */
  sig: string;
  exercise: import('../content/types').Exercise;
  date: string;
}

/** Una frase propia de «Decilo en inglés». */
export interface Phrase {
  id: string;
  es: string;
  en: string;
  simple?: string;
  chunks?: string[];
  note?: string;
  /** Marcada para revisar con la profe. */
  review?: boolean;
  created: string;
  card?: StoredCard;
}

const KEY = 'ingles-progresivo-v1';

const empty = (): AppState => ({
  version: 1,
  units: {},
  cards: {},
  errors: {},
  tests: [],
  activity: [],
  stats: { reviews: 0, correct: 0 },
  settings: { accent: 'variado', newWords: 10, theme: 'dark', sounds: true, voice: '', ai: { voice: 'system', speaker: 0, ear: 'system', brain: 'off' } },
  levels: {},
  words: {},
  verbs: {},
  resume: {},
  calls: {},
});

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const base = empty().settings;
      return { ...empty(), ...parsed, settings: { ...base, ...parsed.settings, ai: { ...base.ai, ...parsed.settings?.ai } } };
    }
  } catch {
    /* almacenamiento no disponible */
  }
  return empty();
}

let state: AppState = load();
const listeners = new Set<() => void>();

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* sin persistencia */
  }
}

export function setState(fn: (s: AppState) => AppState) {
  state = fn(state);
  save();
  listeners.forEach((l) => l());
}

export function getState() {
  return state;
}

export function useAppState(): AppState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
  );
}

export function resetAll() {
  setState(() => empty());
}

// ───── Tarjetas (repaso espaciado) ─────

export const cardKey = (unitId: string, index: number) => `${unitId}#${index}`;

const toStored = (c: Card): StoredCard => ({
  ...c,
  due: c.due.toISOString(),
  last_review: c.last_review ? new Date(c.last_review).toISOString() : undefined,
});
const fromStored = (c: StoredCard): Card => ({
  ...c,
  due: new Date(c.due),
  last_review: c.last_review ? new Date(c.last_review) : undefined,
});

/** Califica una tarjeta (la crea si no existe) y la reprograma con FSRS. */
export function gradeCard(s: AppState, key: string, outcome: Outcome, now = new Date()): AppState {
  if (outcome === 'skip') return s;
  const current = s.cards[key] ? fromStored(s.cards[key]) : createEmptyCard(now);
  const next = scheduler.next(current, now, RATING[outcome]).card;
  return { ...s, cards: { ...s.cards, [key]: toStored(next) } };
}

/** Reprograma una tarjeta suelta (frases propias) con el mismo FSRS. */
export function nextCard(card: StoredCard | undefined, outcome: Outcome, now = new Date()): StoredCard {
  const current = card ? fromStored(card) : createEmptyCard(now);
  if (outcome === 'skip') return toStored(current);
  return toStored(scheduler.next(current, now, RATING[outcome]).card);
}

/** Siembra tarjetas de una unidad "ubicada" por el test: se reparten en los próximos días para detectar huecos sin saturar. */
export function seedPlacedCards(s: AppState, unitId: string, startDay: number, now = new Date()): AppState {
  const unit = UNITS.find((u) => u.id === unitId)!;
  const cards = { ...s.cards };
  const keys = [
    ...unit.exercises.map((_, i) => cardKey(unitId, i)),
    ...PATTERNS.filter((p) => supports(unitId, p)).map((p) => `${unitId}@${p}`),
  ];
  keys.forEach((key, i) => {
    if (cards[key]) return;
    const c = createEmptyCard(now);
    c.due = new Date(now.getTime() + (startDay + (i % 3)) * 86_400_000);
    cards[key] = toStored(c);
  });
  return { ...s, cards };
}

export function dueKeys(s: AppState, now = new Date()): string[] {
  return Object.entries(s.cards)
    .filter(([, c]) => new Date(c.due) <= now)
    .sort((a, b) => a[1].due.localeCompare(b[1].due))
    .map(([k]) => k);
}

// ───── Errores ─────

export function logError(s: AppState, e: Omit<ErrorEntry, 'count' | 'last'>): AppState {
  const prev = s.errors[e.key];
  return {
    ...s,
    errors: { ...s.errors, [e.key]: { ...e, count: (prev?.count ?? 0) + 1, last: new Date().toISOString() } },
  };
}

export function clearError(s: AppState, key: string): AppState {
  const errors = { ...s.errors };
  delete errors[key];
  return { ...s, errors };
}

// ───── Actividad / racha ─────

export const today = (d = new Date()) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
  return z.toISOString().slice(0, 10);
};

export function markActive(s: AppState): AppState {
  const t = today();
  return s.activity.includes(t) ? s : { ...s, activity: [...s.activity, t] };
}

export function streak(s: AppState, now = new Date()): number {
  const days = new Set(s.activity);
  let n = 0;
  const d = new Date(now);
  if (!days.has(today(d))) d.setDate(d.getDate() - 1);
  while (days.has(today(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

// ───── Retomar ─────

export function saveRun(unitId: string, run: Omit<SavedRun, 'date'>) {
  setState((s) => ({ ...s, resume: { ...s.resume, [unitId]: { ...run, date: new Date().toISOString() } } }));
}

export function clearRun(unitId: string) {
  setState((s) => {
    if (!s.resume[unitId]) return s;
    const resume = { ...s.resume };
    delete resume[unitId];
    return { ...s, resume };
  });
}

/** El escalón sin terminar más reciente. */
export function lastRun(s: AppState): { unitId: string; run: SavedRun } | null {
  const e = Object.entries(s.resume).sort((a, b) => b[1].date.localeCompare(a[1].date))[0];
  return e ? { unitId: e[0], run: e[1] } : null;
}

export function saveCall(id: string, score: number) {
  setState((s) => ({ ...s, calls: { ...s.calls, [id]: { date: new Date().toISOString(), score: Math.max(score, s.calls[id]?.score ?? 0) } } }));
}

const SEEN_MAX = 80;
const seenKey = (prompt: string) => prompt.toLowerCase().replace(/[^a-z0-9áéíóúñ]+/g, ' ').trim();

/** Anota que viste esta oración en la unidad. */
export function markSeen(unitId: string, prompt: string) {
  const k = seenKey(prompt);
  if (!k) return;
  setState((s) => {
    const list = (s.seen?.[unitId] ?? []).filter((x) => x !== k);
    return { ...s, seen: { ...(s.seen ?? {}), [unitId]: [...list, k].slice(-SEEN_MAX) } };
  });
}

/** ¿La viste hace poco? */
export function recentlySeen(unitId: string): (prompt: string) => boolean {
  const set = new Set(getState().seen?.[unitId] ?? []);
  return (prompt: string) => set.has(seenKey(prompt));
}
