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

import { generate, GENERATED, PATTERNS, supports, hasGenerator } from '../gen/generate';
import { CLOZE } from '../gen/banks';
import { conjugateEs } from '../gen/spanish';
import { NGSL } from '../content/ngsl';
import { wordExercise } from './vocab';
import { activeSteps, stepItems } from './ladder';

describe('generador', () => {
  it('produce ejercicios válidos para todas las unidades y tipos', () => {
    let count = 0;
    for (const u of UNITS) {
      if (!hasGenerator(u.id)) continue;
      for (const p of PATTERNS) {
        if (!supports(u.id, p)) continue;
        for (let i = 0; i < 25; i++) {
          const e = generate(u.id, p);
          if (!e) continue;
          count++;
          if ('options' in e) {
            expect(e.options[e.answer], `${u.id} ${p}`).toBeDefined();
            expect(new Set(e.options).size).toBe(e.options.length);
          }
          if ('answers' in e) for (const a of e.answers) expect(matches(a, e.answers)).toBe(true);
          if (e.kind === 'order') {
            const norm = (t: string) => t.toLowerCase().replace(/[.?!]/g, '').split(' ').sort().join(' ');
            expect(norm(e.words.join(' ')), `${u.id} order`).toBe(norm(e.answers[0]));
          }
          expect(e.prompt.includes('undefined')).toBe(false);
        }
      }
    }
    expect(count).toBeGreaterThan(500);
  });
  it('bancos: cada oración tiene la parte marcada y opciones distintas', () => {
    for (const [id, bank] of Object.entries(CLOZE))
      for (const c of bank) {
        const m = c.s.match(/\{(.+?)\}/);
        expect(m, `${id}: ${c.s}`).toBeTruthy();
        expect(c.alt.includes(m![1]), `${id}: ${c.s}`).toBe(false);
      }
  });
  it('conjuga en español (vos)', () => {
    expect(conjugateEs('trabajar', 'pres', 1)).toBe('trabajás');
    expect(conjugateEs('ir', 'pret', 2)).toBe('fue');
    expect(conjugateEs('tener', 'subjImp', 0)).toBe('tuviera');
    expect(conjugateEs('trabajar', 'subjImp', 3)).toBe('trabajáramos');
    expect(conjugateEs('hacer', 'perf', 2)).toBe('ha hecho');
    expect(conjugateEs('leer', 'presCont', 0)).toBe('estoy leyendo');
    expect(conjugateEs('pasar a buscar', 'fut', 4)).toBe('pasarán a buscar');
  });
  it('todas las unidades tienen escalera con ejercicios', () => {
    for (const u of UNITS) {
      const steps = activeSteps(u);
      expect(steps.length, u.id).toBeGreaterThanOrEqual(4);
      for (const st of steps) if (st.id !== 'explain') expect(stepItems(u, st.id).length, `${u.id} ${st.id}`).toBeGreaterThanOrEqual(2);
    }
  });
  it('tiempos con generador declarados existen en el programa', () => {
    for (const id of Object.keys(GENERATED)) expect(UNITS.some((u) => u.id === id), id).toBe(true);
  });
});

describe('vocabulario', () => {
  it('2801 palabras con traducción', () => {
    expect(NGSL.length).toBe(2801);
    for (const [w, es] of NGSL) {
      expect(w.length).toBeGreaterThan(0);
      expect(es.length).toBeGreaterThan(0);
    }
  });
  it('el ejercicio acepta la palabra', () => {
    const e = wordExercise('house');
    expect('answers' in e && matches('house', e.answers)).toBe(true);
  });
});
