import { describe, expect, it } from 'vitest';
import { SECTIONS } from '../content/path';
import { UNITS } from '../content/curriculum';
import { ROLEPLAYS } from '../content/roleplays/catalog';
import { FREE_STORIES } from '../content/stories/free';
import { STORY_STUDIES } from '../content/stories/study';
import { listenItems, nodeStates, practiceItems, reviewItems, sectionNodes, sectionOpen } from './path';
import type { AppState } from './store';

const base = (): AppState => ({
  version: 1, units: {}, cards: {}, errors: {}, tests: [], activity: [], stats: { reviews: 0, correct: 0 },
  settings: { accent: 'variado', newWords: 10, theme: 'dark', sounds: true, voice: '', ai: { voice: 'system', speaker: 0, ear: 'system', brain: 'off' } }, levels: {}, words: {}, verbs: {}, resume: {}, calls: {},
});

describe('v1.17 camino', () => {
  it('cada unidad está en exactamente una sección y los niveles van en orden', () => {
    const all = SECTIONS.flatMap((s) => s.units);
    expect(new Set(all).size).toBe(all.length);
    expect([...all].sort()).toEqual(UNITS.map((u) => u.id).sort());
    const order = ['A1', 'A2', 'B1', 'B2', 'C1'];
    for (let i = 1; i < SECTIONS.length; i++) expect(order.indexOf(SECTIONS[i].level)).toBeGreaterThanOrEqual(order.indexOf(SECTIONS[i - 1].level));
  });

  it('roleplays, cuentos y nodos existen y no se repiten', () => {
    for (const s of SECTIONS) for (const r of s.roleplays) expect(ROLEPLAYS.find((x) => x.id === r)?.script, `${s.id} → ${r}`).toBeDefined();
    const ids = SECTIONS.flatMap(sectionNodes).map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const st of STORY_STUDIES) {
      const story = FREE_STORIES.find((x) => x.id === st.storyId)!;
      expect(story, st.storyId).toBeDefined();
      expect(story.license).not.toMatch(/NC|ND/);
      expect(st.es.length).toBe(story.pages.length);
      expect(st.notes.length).toBe(story.pages.length);
      for (const q of st.questions) expect(q.after).toBeLessThan(story.pages.length);
    }
    expect(FREE_STORIES.every((s) => !/NC|ND/.test(s.license))).toBe(true);
  });

  it('cada sección tiene escucha, práctica, postal, repaso y suficientes ejercicios', () => {
    for (const s of SECTIONS) {
      const kinds = new Set(sectionNodes(s).map((n) => n.kind));
      for (const k of ['guide', 'lesson', 'listen', 'practice', 'postcard', 'review'] as const) expect(kinds.has(k), `${s.id} sin ${k}`).toBe(true);
      expect(listenItems(s).length, `${s.id} escucha`).toBeGreaterThanOrEqual(6);
      expect(practiceItems(s).length, `${s.id} práctica`).toBeGreaterThanOrEqual(6);
      expect(reviewItems(s).length, `${s.id} repaso`).toBeGreaterThanOrEqual(8);
    }
  });

  it('usuario nuevo: solo el primer nodo está abierto', () => {
    const st = nodeStates(base());
    const first = sectionNodes(SECTIONS[0])[0];
    expect(st.get(first.id)).toBe('current');
    expect(st.get(sectionNodes(SECTIONS[0])[1].id)).toBe('locked');
    expect(sectionOpen(base(), 1)).toBe(false);
  });

  it('con el test de ubicación se abren las secciones de los niveles ubicados (las situaciones no traban)', () => {
    const s = base();
    for (const u of UNITS) if (!u.context && ['A1', 'A2', 'B1'].includes(u.level)) s.units[u.id] = { status: 'placed', date: '' };
    const firstB2 = SECTIONS.findIndex((x) => x.level === 'B2');
    expect(sectionOpen(s, firstB2)).toBe(true);
    expect(sectionOpen(s, firstB2 + 1)).toBe(false);
    // Las unidades de situaciones siguen disponibles para hacer.
    const st = nodeStates(s);
    expect(st.get('ctx-greetings:explain')).not.toBe('locked');
  });
});

describe('v1.17 intermedio y cuentos', () => {
  it('hay 33 secciones y cada una tiene su cuento con análisis completo', () => {
    expect(SECTIONS.length).toBe(33);
    const used = new Set<string>();
    for (const s of SECTIONS) {
      expect(s.story, s.id).toBeDefined();
      expect(used.has(s.story!), `${s.story} repetido`).toBe(false);
      used.add(s.story!);
      const st = FREE_STORIES.find((x) => x.id === s.story)!;
      const sd = STORY_STUDIES.find((x) => x.storyId === s.story)!;
      expect(sd, s.story).toBeDefined();
      expect(sd.level, s.story).toBe(s.level);
      expect(sd.es.length, s.story).toBe(st.pages.length);
      expect(sd.notes.length, s.story).toBe(st.pages.length);
      expect(sd.questions.length, s.story).toBeGreaterThanOrEqual(3);
      for (const q of sd.questions) {
        expect(q.after, `${s.story} ${q.prompt}`).toBeLessThan(st.pages.length);
        expect(q.answer).toBeLessThan(q.options.length);
      }
      expect(sd.exercises.length, s.story).toBeGreaterThanOrEqual(6);
      for (const e of sd.exercises) if (e.kind === 'choice') expect(e.answer).toBeLessThan(e.options.length);
      for (const [frag] of sd.notes.flat()) expect(frag.length).toBeGreaterThan(0);
    }
    expect(STORY_STUDIES.length).toBe(33);
  });

  it('cada unidad tiene su escucha y su práctica, y cada nivel cierra con un repaso de etapa', () => {
    for (const s of SECTIONS) {
      const ns = sectionNodes(s);
      for (const u of s.units) {
        expect(ns.some((n) => n.id === `${u}:listen` && n.kind === 'listen'), `${u} escucha`).toBe(true);
        expect(ns.some((n) => n.id === `${u}:practice` && n.kind === 'practice'), `${u} práctica`).toBe(true);
      }
    }
    const exams = SECTIONS.flatMap((s) => sectionNodes(s)).filter((n) => n.kind === 'exam');
    expect(exams.map((n) => n.id)).toEqual(['a1:exam', 'a2:exam', 'b1:exam', 'b2:exam', 'c1:exam']);
    const ids = SECTIONS.flatMap((s) => sectionNodes(s)).map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('v1.17 llamadas', () => {
  it('la respuesta modelo de cada turno cae en alguna rama', async () => {
    const { CALLS } = await import('../content/calls');
    const { matchTurn } = await import('./call');
    const bad: string[] = [];
    for (const c of CALLS)
      for (const t of c.turns) if ('u' in t && t.u.branches.length && !matchTurn(t.u, [t.u.model])) bad.push(`${c.title}: ${t.u.model}`);
    expect(bad).toEqual([]);
  });
});
