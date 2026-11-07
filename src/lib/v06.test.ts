import { describe, expect, it } from 'vitest';
import { UNITS } from '../content/curriculum';
import { THEMES, themeOf } from '../content/themes';
import { CURATED_WHY } from '../content/why-curated';
import { generate, PATTERNS, supports } from '../gen/generate';
import { explainMistake } from './why';
import { correctText } from '../components/ExerciseRunner';
import { unitPercent, unitStatus } from './progress';
import type { AppState } from './store';

const base = (): AppState => ({
  version: 1, units: {}, cards: {}, errors: {}, tests: [], activity: [], stats: { reviews: 0, correct: 0 },
  settings: { accent: 'variado', newWords: 10, theme: 'dark', sounds: true, voice: '', ai: { voice: 'system', speaker: 0, ear: 'system', brain: 'off' } }, levels: {}, words: {}, verbs: {}, resume: {}, calls: {},
});

describe('v0.6', () => {
  it('cada unidad está en un solo tema', () => {
    const all = THEMES.flatMap((t) => t.units);
    expect(new Set(all).size).toBe(all.length);
    for (const u of UNITS) expect(themeOf(u)).toBeDefined();
  });

  it('las explicaciones fijas apuntan a ejercicios reales', () => {
    for (const key of Object.keys(CURATED_WHY)) {
      const [id, i] = key.split('#');
      const u = UNITS.find((x) => x.id === id);
      expect(u, key).toBeDefined();
      expect(u!.exercises[Number(i)], key).toBeDefined();
    }
  });

  it('todo ejercicio fijo escrito o de elegir tiene explicación de error', () => {
    for (const u of UNITS)
      u.exercises.forEach((e, i) => {
        if (e.kind === 'speak' || e.kind === 'listen') return;
        const m = explainMistake(`${u.id}#${i}`, u, e, 'xyz', correctText(e));
        expect(m.why, `${u.id}#${i}`).toBeTruthy();
      });
  });

  it('los ejercicios generados explican por qué', () => {
    for (const u of UNITS)
      for (const p of PATTERNS) {
        if (!supports(u.id, p)) continue;
        for (let k = 0; k < 5; k++) {
          const e = generate(u.id, p);
          if (!e) continue;
          const m = explainMistake(`${u.id}@${p}`, u, e, '', correctText(e));
          if (e.kind !== 'speak' && e.kind !== 'listen') expect(m.why, `${u.id}@${p}: ${e.prompt}`).toBeTruthy();
        }
      }
  });

  it('el tiempo equivocado se explica', () => {
    const u = UNITS.find((x) => x.id === 'past-simple')!;
    for (let k = 0; k < 20; k++) {
      const e = generate('past-simple', 'recognize')!;
      if (e.kind !== 'choice') continue;
      const wrong = e.options.find((_, i) => i !== e.answer)!;
      const m = explainMistake('past-simple@recognize', u, e, wrong, correctText(e));
      expect(m.why).toMatch(/pasado simple/);
      expect(m.yours, wrong).toBeTruthy();
    }
  });

  it('ubicada por test: abierta pero sin tic; porcentaje parcial', () => {
    const s = base();
    s.units['to-be'] = { status: 'placed', date: '' };
    expect(unitStatus(s, 'to-be')).toBe('placed');
    expect(unitPercent(s, 'to-be')).toBe(0);
    s.units['to-be'].step = 2;
    expect(unitStatus(s, 'to-be')).toBe('progress');
    expect(unitPercent(s, 'to-be')).toBeGreaterThan(0);
    s.units['to-be'] = { status: 'mastered', date: '' };
    expect(unitPercent(s, 'to-be')).toBe(1);
  });
});

import { CALLS } from '../content/calls';
import { matchTurn } from './call';

describe('llamadas con Oliver', () => {
  it('hay al menos 2 llamadas por unidad y todas terminan con despedida', () => {
    for (const u of UNITS) expect(CALLS.filter((c) => c.unitId === u.id).length, u.id).toBeGreaterThanOrEqual(2);
    for (const c of CALLS) expect('u' in c.turns[c.turns.length - 1]).toBe(true);
  });
  it('la respuesta modelo de cada turno coincide con alguna rama', () => {
    for (const c of CALLS)
      for (const t of c.turns) if ('u' in t) expect(matchTurn(t.u, [t.u.model]), `${c.id}: ${t.u.model}`).not.toBeNull();
  });
  it('acepta lo que devuelve el reconocimiento (sin puntuación, contracciones)', () => {
    const c = CALLS.find((x) => x.unitId === 'pres-cont')!;
    const t = c.turns.find((x) => 'u' in x) as { u: Parameters<typeof matchTurn>[0] };
    expect(matchTurn(t.u, ['im cooking dinner', "I'm cooking dinner"])).not.toBeNull();
    expect(matchTurn(t.u, ['pizza'])).toBeNull();
  });
});
