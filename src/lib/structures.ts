/**
 * Lógica del módulo «Frases por estructura»: desglose palabra por palabra, ejercicios de producción
 * (siempre se produce inglés: nunca del inglés al español), estado de cada frase con repaso espaciado
 * (FSRS) y el ejercicio final de combinar estructuras con conectores.
 *
 * Es independiente de las unidades: guarda su progreso en `state.structs` y no toca las tarjetas de repaso
 * de los otros módulos.
 */
import { COMBOS, CONNECTORS, STRUCTURES, type ComboPrompt, type Structure } from '../content/structures';
import type { Exercise, Unit } from '../content/types';
import type { RunnerItem } from '../components/ExerciseRunner';
import { CONTRACTIONS } from '../content/glossary';
import { lookup } from './dictionary';
import { normalize } from './answer';
import { getState, nextCard, setState, type Outcome, type StoredCard } from './store';

export interface SPhrase {
  id: string;
  structure: Structure;
  en: string;
  es: string;
  focus: string;
}

const clean = (s: string) => s.replace(/[{}]/g, '');

export function phrasesOf(s: Structure): SPhrase[] {
  return s.phrases.map(([en, es], i) => ({ id: `${s.id}:${i}`, structure: s, en: clean(en), es, focus: en.match(/\{(.+?)\}/)?.[1] ?? '' }));
}

export const ALL_PHRASES = (): SPhrase[] => STRUCTURES.flatMap(phrasesOf);
export const structureById = (id: string) => STRUCTURES.find((s) => s.id === id);
export const phraseById = (id: string) => ALL_PHRASES().find((p) => p.id === id);

/** Desglose palabra por palabra: por qué va cada palabra. */
export function breakdown(p: SPhrase): { word: string; why: string; key: boolean }[] {
  const focusWords = new Set(p.focus.toLowerCase().split(/\s+/));
  return p.en.split(/\s+/).map((raw) => {
    const w = raw.replace(/[.,!?;:"]/g, '');
    const l = w.toLowerCase().replace(/’/g, "'");
    const key = focusWords.has(l);
    const own = p.structure.keys[l];
    if (own) return { word: w, why: own, key };
    if (CONTRACTIONS[l]) return { word: w, why: `${CONTRACTIONS[l]} (contracción)`, key };
    const d = lookup(l);
    if (d.contraction) return { word: w, why: d.contraction, key };
    if (d.entry) {
      const meaning = d.entry[1];
      return { word: w, why: d.note ? `${meaning} — ${noteFor(p.structure.id, key, d.note, d.lemma ?? l)}` : meaning, key };
    }
    if (/^[A-Z]/.test(w)) return { word: w, why: 'nombre propio', key };
    if (/^\d+$/.test(w)) return { word: w, why: 'número', key };
    return { word: w, why: '', key };
  });
}

/** Aclara la forma de la palabra según la estructura (3.ª persona, participio, pasado irregular). */
function noteFor(structure: string, key: boolean, note: string, lemma: string): string {
  if (!key) return note;
  if (structure === 'pres-simple-3') return lemma === 'have' ? 'has: have cambia a has con he / she / it' : `con he / she / it el verbo lleva -s (de «${lemma}»)`;
  if (structure === 'pres-perfect') return `participio de «${lemma}»`;
  if (structure === 'past-irregular' && /^forma de/.test(note)) return `pasado irregular de «${lemma}»`;
  if (structure === 'past-regular') return `pasado de «${lemma}» (+ -ed)`;
  return note;
}

/** Unidad «de mentira» para reusar el ExerciseRunner sin tocarlo. */
export function pseudoUnit(s: Structure): Unit {
  return { id: `st-${s.id}`, level: s.level, axis: 'Estructura' as Unit['axis'], title: s.title, prereqs: [], explanation: s.explain, examples: [], trap: '', exercises: [] };
}

const shuffle = <T,>(a: T[]) => a.map((x) => ({ x, k: Math.random() })).sort((p, q) => p.k - q.k).map((p) => p.x);

/** Formas que tiene que tener una oración propia para contar como esta estructura. */
function acceptFor(s: Structure): string[] {
  return [...new Set(phrasesOf(s).map((p) => p.focus.toLowerCase()).filter(Boolean))];
}

export type SKind = 'complete' | 'order' | 'listen' | 'translate' | 'recall';

/** Un ejercicio para una frase. Todos piden producir inglés. */
export function phraseExercise(p: SPhrase, kind: SKind): Exercise {
  switch (kind) {
    case 'complete':
      return {
        kind: 'type',
        prompt: p.structure.phrases.find(([en]) => clean(en) === p.en)![0].replace(/\{.+?\}/, '___'),
        answers: [p.focus],
        context: p.es,
        explain: p.en,
        hint: `Fijate en la estructura: ${p.structure.pattern}.`,
      };
    case 'order': {
      const words = p.en.replace(/[.?!]$/, '').split(' ');
      let w = shuffle(words);
      for (let i = 0; i < 5 && w.join(' ') === words.join(' '); i++) w = shuffle(words);
      return { kind: 'order', prompt: p.es, words: w, answers: [p.en] };
    }
    case 'listen':
      return { kind: 'listen', prompt: p.en, answers: [p.en], hint: p.es };
    case 'translate':
    case 'recall':
      return { kind: 'translate', prompt: p.es, answers: [p.en], explain: p.structure.title };
  }
}

/** Escribir en inglés a partir de una situación (sin traducir). */
export function taskExercise(s: Structure, i: number): Exercise {
  const [prompt, example] = s.tasks[i % s.tasks.length];
  return { kind: 'create', prompt, accept: acceptFor(s), example, hint: `Usá la estructura: ${s.pattern}.` };
}

const key = (id: string) => `st:${id}`;

/** Ronda para aprender frases nuevas: primero las ves con su explicación, después las producís. */
export function learnRound(s: Structure, ids: string[]): RunnerItem[] {
  const unit = pseudoUnit(s);
  const ps = ids.map((id) => phrasesOf(s).find((p) => p.id === id)!).filter(Boolean);
  const items: RunnerItem[] = [];
  for (const p of ps) items.push({ key: key(p.id), unit, exercise: phraseExercise(p, 'complete') });
  for (const p of shuffle(ps)) items.push({ key: key(p.id), unit, exercise: phraseExercise(p, p.en.split(' ').length >= 3 ? 'order' : 'listen') });
  for (const p of shuffle(ps).slice(0, 2)) items.push({ key: key(p.id), unit, exercise: phraseExercise(p, 'listen') });
  for (const p of shuffle(ps)) items.push({ key: key(p.id), unit, exercise: phraseExercise(p, 'translate') });
  items.push({ key: `st-task:${s.id}`, unit, exercise: taskExercise(s, Math.floor(Math.random() * s.tasks.length)) });
  return items;
}

// ───── Estado y repaso ─────

export type PhraseStatus = 'new' | 'learning' | 'known' | 'due';

export const cardOf = (id: string): StoredCard | undefined => getState().structs?.[id];

export function statusOf(id: string, now = new Date()): PhraseStatus {
  const c = cardOf(id);
  if (!c) return 'new';
  if (new Date(c.due) <= now) return 'due';
  return c.stability >= 4 ? 'known' : 'learning';
}

export function gradePhrase(id: string, outcome: Outcome, now = new Date()) {
  if (outcome === 'skip') return;
  setState((s) => ({ ...s, structs: { ...(s.structs ?? {}), [id]: nextCard(s.structs?.[id], outcome, now) } }));
}

/** Nota final de una frase en una ronda: la peor de sus ejercicios (si un ejercicio salió mal, vuelve pronto). */
export function roundOutcome(outcomes: Outcome[]): Outcome {
  const real = outcomes.filter((o) => o !== 'skip');
  if (!real.length) return 'skip';
  if (real.includes('again')) return 'again';
  if (real.includes('hard')) return 'hard';
  return 'good';
}

export function progressOf(s: Structure) {
  const ps = phrasesOf(s);
  const st = ps.map((p) => statusOf(p.id));
  return {
    total: ps.length,
    started: st.filter((x) => x !== 'new').length,
    known: st.filter((x) => x === 'known').length,
    due: st.filter((x) => x === 'due').length,
  };
}

/** Las estructuras se abren en orden: la siguiente cuando empezaste al menos la mitad de la anterior. */
export function unlocked(index: number): boolean {
  if (index === 0) return true;
  const prev = progressOf(STRUCTURES[index - 1]);
  return prev.started >= Math.ceil(prev.total / 2);
}

export const nextNew = (s: Structure, n = 5) => phrasesOf(s).filter((p) => statusOf(p.id) === 'new').slice(0, n);

/** Frases para repasar hoy, de todas las estructuras (recordar sin ayuda o dictado). */
export function reviewItems(max = 15): RunnerItem[] {
  const due = ALL_PHRASES().filter((p) => statusOf(p.id) === 'due');
  return shuffle(due)
    .slice(0, max)
    .map((p) => ({ key: key(p.id), unit: pseudoUnit(p.structure), exercise: phraseExercise(p, Math.random() < 0.75 ? 'recall' : 'listen') }));
}

export const phraseIdFromKey = (k: string) => (k.startsWith('st:') ? k.slice(3) : null);

// ───── Combinar estructuras (ejercicio final) ─────

/** Una estructura cuenta como aprendida para combinar cuando empezaste al menos 5 frases. */
export const readyForCombo = (s: Structure) => progressOf(s).started >= 5;

export function comboAvailable(c: ComboPrompt): boolean {
  return c.uses.every((id) => {
    const s = structureById(id);
    return s ? readyForCombo(s) : false;
  });
}

/** ¿Se abre la sección de combinar? Con 3 estructuras listas. */
export const comboUnlocked = () => STRUCTURES.filter(readyForCombo).length >= 3;

export interface ComboCheck {
  words: number;
  structures: { id: string; title: string; ok: boolean }[];
  connectors: string[];
  enoughWords: boolean;
  questions: number;
}

export function checkCombo(c: ComboPrompt, text: string): ComboCheck {
  const t = ` ${text.replace(/[’]/g, "'")} `;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const n = ` ${normalize(text)} `;
  return {
    words,
    enoughWords: words >= c.minWords,
    structures: c.uses.map((id) => {
      const s = structureById(id)!;
      return { id, title: s.title, ok: s.detect.test(t) };
    }),
    connectors: CONNECTORS.map((k) => k.en).filter((k) => n.includes(` ${normalize(k)} `)),
    questions: (text.match(/\?/g) ?? []).length,
  };
}

export function saveCombo(id: string, text: string) {
  setState((s) => ({ ...s, combos: { ...(s.combos ?? {}), [id]: { date: new Date().toISOString(), text } } }));
}

export { COMBOS, CONNECTORS, STRUCTURES };
