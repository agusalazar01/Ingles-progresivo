import { describe, expect, it } from 'vitest';
import { CATALOG, CONTEXT_UNITS, exprById, exprKeys, unitsOfExpr, usesExpr } from '../content/context';
import { UNITS } from '../content/curriculum';
import { THEMES } from '../content/themes';
import { CALLS } from '../content/calls';
import { activeSteps, stepItems } from './ladder';
import { matches, normalize } from './answer';
import { levelUnitsDone, previousLevelDone, unitStatus } from './progress';
import type { AppState } from './store';

const base = (): AppState => ({
  version: 1, units: {}, cards: {}, errors: {}, tests: [], activity: [], stats: { reviews: 0, correct: 0 },
  settings: { accent: 'variado', newWords: 10, theme: 'dark', sounds: true, voice: '', ai: { voice: 'system', speaker: 0, ear: 'system', brain: 'off' } }, levels: {}, words: {}, verbs: {}, resume: {}, calls: {},
});

describe('v1.16 unidades de situaciones', () => {
  it('hay 18 unidades temáticas dentro del camino y de los temas', () => {
    expect(CONTEXT_UNITS.length).toBe(18);
    for (const u of CONTEXT_UNITS) {
      expect(UNITS.some((x) => x.id === u.id), u.id).toBe(true);
      expect(THEMES.some((t) => t.units.includes(u.id)), u.id).toBe(true);
      expect(CALLS.filter((c) => c.unitId === u.id).length, u.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('cada unidad tiene diálogo desglosado, expresiones del catálogo y muchos ejercicios variados', () => {
    for (const u of CONTEXT_UNITS) {
      const c = u.context!;
      expect(c.dialogue.length, u.id).toBeGreaterThanOrEqual(10);
      expect(c.dialogue.every((l) => (l.parts?.length ?? 0) > 0), u.id).toBe(true);
      expect(c.expressions.length, u.id).toBeGreaterThanOrEqual(15);
      for (const id of c.expressions) expect(exprById(id), `${u.id} → ${id}`).toBeDefined();
      expect(u.exercises.length, u.id).toBeGreaterThanOrEqual(45);
      const kinds = new Set(u.exercises.map((e) => e.kind));
      for (const k of ['choice', 'type', 'listen', 'transform', 'fix', 'order', 'build', 'translate', 'respond', 'create', 'speak'] as const) expect(kinds.has(k), `${u.id} sin ${k}`).toBe(true);
    }
  });

  it('el catálogo no repite ids y cada expresión se muestra en varias estructuras', () => {
    const ids = CATALOG.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(CATALOG.length).toBeGreaterThanOrEqual(150);
    for (const e of CATALOG) {
      expect(e.forms.length, e.id).toBeGreaterThanOrEqual(2);
      expect(e.note.length, e.id).toBeGreaterThan(20);
    }
    for (const t of ['phrasal', 'modal', 'coloquial', 'australia', 'combinacion', 'adjetivo', 'contraccion']) expect(CATALOG.some((e) => e.type === t), t).toBe(true);
  });

  it('casi todas las expresiones de una unidad se practican en sus ejercicios y todas se pueden practicar sueltas', () => {
    for (const u of CONTEXT_UNITS) {
      // Las que se presentan por primera vez en esta unidad (las demás se reciclan de unidades anteriores).
      const own = u.context!.expressions.filter((id) => unitsOfExpr(id)[0]?.id === u.id && exprById(id)!.type !== 'modal').map((id) => exprById(id)!);
      const used = own.filter((e) => u.exercises.some((x) => usesExpr(x, e)));
      expect(used.length / own.length, `${u.id}: ${own.filter((e) => !used.includes(e)).map((e) => e.id).join(', ')}`).toBeGreaterThanOrEqual(0.85);
    }
    const unpracticed = CATALOG.filter((e) => e.type !== 'contraccion' && exprKeys(e).length === 0).map((e) => e.id);
    expect(unpracticed).toEqual([]);
  });

  it('los ejercicios están bien armados', () => {
    const bad: string[] = [];
    for (const u of CONTEXT_UNITS)
      for (const e of u.exercises) {
        if (e.kind === 'type' && !e.prompt.includes('___')) bad.push(`${u.id} type sin hueco: ${e.prompt}`);
        if (e.kind === 'transform' && e.answers.some((a) => normalize(a) === normalize(e.prompt))) bad.push(`${u.id} transform igual: ${e.prompt}`);
        if (e.kind === 'fix' && matches(e.prompt, e.answers)) bad.push(`${u.id} fix ya correcto: ${e.prompt}`);
        if (e.kind === 'order') {
          const n = (t: string) => normalize(t).split(' ').sort().join(' ');
          if (n(e.words.join(' ')) !== n(e.answers[0])) bad.push(`${u.id} order: ${e.answers[0]}`);
          if (e.words.join(' ') === e.answers[0].replace(/[.?!]$/, '')) bad.push(`${u.id} order sin mezclar: ${e.answers[0]}`);
        }
        if (e.kind === 'create') {
          const t = ` ${normalize(e.example)} `;
          if (!e.accept.some((a) => t.includes(` ${normalize(a)} `))) bad.push(`${u.id} create: ${e.example}`);
          if (e.question && !e.example.trim().endsWith('?')) bad.push(`${u.id} create pregunta: ${e.example}`);
        }
        if (e.kind === 'respond' && e.examples.length < 2) bad.push(`${u.id} respond: ${e.prompt}`);
        if (e.kind === 'choice' && new Set(e.options).size !== e.options.length) bad.push(`${u.id} choice repetida: ${e.prompt}`);
      }
    expect(bad).toEqual([]);
  });

  it('escalera propia: 7 escalones con Charla y suficientes ejercicios en cada uno', () => {
    for (const u of CONTEXT_UNITS) {
      const steps = activeSteps(u).map((s) => s.id);
      expect(steps, u.id).toEqual(['explain', 'recognize', 'complete', 'transform', 'build', 'talk', 'fluency']);
      for (const st of steps) if (st !== 'explain') expect(stepItems(u, st).length, `${u.id} ${st}`).toBeGreaterThanOrEqual(5);
    }
    // Las unidades de gramática no cambian: sin escalón de charla.
    for (const u of UNITS.filter((x) => !x.context)) expect(activeSteps(u).some((s) => s.id === 'talk'), u.id).toBe(false);
  });

  it('no bloquean el nivel siguiente y el test de ubicación no las da por sabidas', () => {
    const s = base();
    for (const u of UNITS) if (!u.context && u.level === 'A1') s.units[u.id] = { status: 'mastered', date: '' };
    expect(levelUnitsDone(s, 'A1')).toBe(true);
    expect(previousLevelDone(s, 'A2')).toBe(true);
    expect(unitStatus(s, 'ctx-greetings')).toBe('available');
  });
});

describe('v1.16.1 voces y roleplays nuevos', () => {
  it('todo personaje de roleplay tiene voz de hombre o de mujer, siempre la misma', async () => {
    const { castGender, partnerGender } = await import('./voicegender');
    const { ROLEPLAYS } = await import('../content/roleplays/catalog');
    for (const r of ROLEPLAYS) if (r.script) expect(['f', 'm']).toContain(castGender(r.script.partner.name, r.script.partner.role));
    expect(castGender('Agente', 'del banco')).toBe(castGender('Agente', 'del banco'));
    expect(castGender('Mia')).toBe(partnerGender('Mia'));
    // Los guardaparques nuevos tienen nombre reconocible.
    expect(partnerGender('Chloe')).toBe('f');
    expect(partnerGender('Dave')).toBe('m');
  });
  it('en la estación de servicio se puede pedir un monto fijo o llenar el tanque', async () => {
    const { ROLEPLAYS } = await import('../content/roleplays/catalog');
    const { matchOption } = await import('./roleplay');
    const s = ROLEPLAYS.find((r) => r.id.startsWith('156-'))!.script!;
    expect(matchOption(s.nodes.start, ['Can I put fifty dollars on pump six?'])?.next).toBe('type');
    expect(matchOption(s.nodes.start, ["I'd like to fill up, please."])?.reply).toContain('fill up');
  });
});
