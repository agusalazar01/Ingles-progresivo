import { describe, expect, it } from 'vitest';
import { LEVELS } from '../content/types';
import { UNITS } from '../content/curriculum';
import { PLACEMENT } from '../content/placement';
import { matches, nearMiss } from './answer';
import { answerPlacement, placementResult, startPlacement } from './progress';
import { lemmaOf, lookup } from './dictionary';
import { intelligibility } from './speech';

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
        if ('options' in e) expect(e.options[e.answer]).toBeDefined();
        if ('answers' in e) for (const a of e.answers) expect(matches(a, e.answers)).toBe(true);
        if (e.kind === 'listen') expect(matches(e.prompt, e.answers)).toBe(true);
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

describe('diccionario', () => {
  it('encuentra la forma base', () => {
    expect(lemmaOf('worked')?.lemma).toBe('work');
    expect(lemmaOf('cities')?.lemma).toBe('city');
    expect(lemmaOf('went')?.lemma).toBe('go');
    expect(lemmaOf('stopped')?.lemma).toBe('stop');
    expect(lemmaOf('bigger')?.lemma).toBe('big');
    expect(lemmaOf('running')?.lemma).toBe('run');
    expect(lemmaOf('lived')?.lemma).toBe('live');
    expect(lookup("don't").contraction).toBe('do not');
  });
  it('cubre todas las palabras en inglés de los ejercicios', () => {
    const missing = new Set<string>();
    const check = (t: string) => {
      for (const m of t.matchAll(/[A-Za-z]+(?:'[A-Za-z]+)?/g)) {
        const w = m[0];
        if (/^[A-Z]/.test(w) && !lookup(w).entry) continue; // nombres propios
        const l = lookup(w);
        if (!l.entry && !l.contraction) missing.add(w.toLowerCase());
      }
    };
    for (const u of UNITS) {
      u.examples.forEach(([en]) => check(en));
      for (const e of u.exercises) if (e.kind !== 'translate' && !/[áéíóúñ¿→]/.test(e.prompt)) check(e.prompt);
    }
    expect([...missing].filter((w) => !['sored', 'desayuno', 'levanto', 'del', 'un', 'poco', 'de', 'cuyo', 'es', 'la', 'forma', 'hablada', 'verdad', 'significa', 'que', 'lo'].includes(w))).toEqual([]);
  });
});

describe('habla', () => {
  it('mide si la frase se entiende', () => {
    expect(intelligibility('I am from Uruguay.', ['I am from Uruguay']).score).toBe(1);
    expect(intelligibility("I'll let you know tomorrow.", ['I will let you know tomorrow']).score).toBe(1);
    expect(intelligibility('I live in a big city.', ['I leave in a big city']).score).toBeLessThan(0.85);
  });
});
