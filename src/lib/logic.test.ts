import { describe, expect, it } from 'vitest';
import { LEVELS } from '../content/types';
import { UNITS } from '../content/units';
import { PLACEMENT } from '../content/placement';
import { matches, nearMiss } from './answer';
import { answerPlacement, placementResult, startPlacement } from './progress';

describe('contenido', () => {
  it('prerrequisitos existen, aparecen antes y no son de nivel superior', () => {
    UNITS.forEach((u, i) => {
      for (const p of u.prereqs) {
        const j = UNITS.findIndex((x) => x.id === p);
        expect(j, `${u.id} → ${p}`).toBeGreaterThanOrEqual(0);
        expect(j).toBeLessThan(i);
        expect(LEVELS.indexOf(UNITS[j].level)).toBeLessThanOrEqual(LEVELS.indexOf(u.level));
      }
    });
  });
  it('cada respuesta aceptada coincide consigo misma y las opciones son válidas', () => {
    for (const u of UNITS)
      for (const e of u.exercises) {
        if (e.kind === 'choice') expect(e.options[e.answer]).toBeDefined();
        else for (const a of e.answers) expect(matches(a, e.answers)).toBe(true);
      }
    for (const p of PLACEMENT) expect(p.options[p.answer]).toBeDefined();
    for (const L of LEVELS) expect(PLACEMENT.filter((p) => p.level === L).length).toBeGreaterThanOrEqual(4);
  });
});

describe('respuestas', () => {
  it('acepta contracciones y formas largas', () => {
    expect(matches('do not like', ["don't like"])).toBe(true);
    expect(matches("I've lived here since 2020", ['I have lived here since 2020.'])).toBe(true);
    expect(matches('cannot speak', ["can't speak"])).toBe(true);
    expect(matches("If I'd known, I'd have come", ['If I had known, I would have come.'])).toBe(true);
    expect(matches("She's going to buy a car", ['She is going to buy a car.'])).toBe(true);
    expect(matches('  WORKS ', ['works'])).toBe(true);
    expect(matches('I’ll call you tomorrow', ['I will call you tomorrow.'])).toBe(true);
  });
  it('rechaza respuestas incorrectas', () => {
    expect(matches('work', ['works'])).toBe(false);
    expect(matches('I live here since 2020', ['I have lived here since 2020.'])).toBe(false);
  });
  it('detecta errores de tipeo', () => {
    expect(nearMiss('bougth', ['bought'])).toBe(false); // dos cambios
    expect(nearMiss('boght', ['bought'])).toBe(true);
  });
});

describe('test de ubicación', () => {
  const run = (answers: (level: string) => boolean) => {
    let r = startPlacement(() => 0.5);
    while (!r.done) r = answerPlacement(r, answers(r.current), () => 0.5);
    return placementResult(r);
  };
  it('todo bien → C1', () => expect(run(() => true).level).toBe('C1'));
  it('todo mal → sin nivel (A1 inicial)', () => expect(run(() => false).level).toBeNull());
  it('sabe hasta B1', () => expect(run((l) => ['A1', 'A2', 'B1'].includes(l)).level).toBe('B1'));
  it('sabe hasta A2', () => expect(run((l) => ['A1', 'A2'].includes(l)).level).toBe('A2'));
  it('sabe hasta B2', () => {
    const r = run((l) => l !== 'C1');
    expect(r.level).toBe('B2');
    expect(r.perLevel.B1?.total).toBe(4);
  });
});
