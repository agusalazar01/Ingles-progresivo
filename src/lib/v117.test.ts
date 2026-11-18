import { describe, expect, test } from 'vitest';
import { castDialogue } from './dialogueVoice';
import { castGender } from './voicegender';
import { CONTEXT_UNITS } from '../content/context';
import { verbGuide, WORKSHOP } from '../gen/verbs';

describe('1.17: voces del diálogo', () => {
  test('cada personaje de los diálogos tiene género (Mia mujer, Leo hombre)', () => {
    expect(castGender('Mia')).toBe('f');
    expect(castGender('Leo')).toBe('m');
    for (const u of CONTEXT_UNITS) for (const l of u.context!.dialogue) expect(['f', 'm']).toContain(castGender(l.who));
  });

  const g = (n: string) => castGender(n);
  test('con paquete de voces: cada uno con su voz y del género correcto', () => {
    const genders: Record<number, 'f' | 'm'> = { 0: 'm', 1: 'f', 2: 'm', 3: 'f' };
    const pack = (gen: 'f' | 'm', who: string, off: number) => {
      const same = [0, 1, 2, 3].filter((i) => genders[i] === gen);
      return same[(who.length + off) % same.length];
    };
    const c = castDialogue(['Mia', 'Leo', 'Mia', 'Leo'], g, pack, () => null);
    expect(genders[c.get('Mia')!.speaker!]).toBe('f');
    expect(genders[c.get('Leo')!.speaker!]).toBe('m');
    // Dos hombres no comparten voz.
    const d = castDialogue(['Tom', 'Jack'], g, pack, () => null);
    expect(d.get('Tom')!.speaker).not.toBe(d.get('Jack')!.speaker);
  });

  test('sin paquete: voces del teléfono distintas', () => {
    const c = castDialogue(['Mia', 'Leo'], g, null, (gen, who, off) => `${gen}-${(who.length + off) % 2}`);
    expect(c.get('Mia')!.sys).toMatch(/^f-/);
    expect(c.get('Leo')!.sys).toMatch(/^m-/);
  });

  test('sin voces de ese género: la misma voz con otro tono, nunca idéntica', () => {
    const c = castDialogue(['Mia', 'Leo', 'Kate'], g, null, () => null);
    expect(c.get('Mia')!.pitch).toBeGreaterThan(1);
    expect(c.get('Leo')!.pitch).toBeLessThan(1);
    expect(c.get('Kate')!.pitch).not.toBe(c.get('Mia')!.pitch);
  });
});

describe('1.17: ficha del verbo con ejemplos', () => {
  test('have ya no muestra «a dog = un perro» suelto: cada forma tiene oraciones con el verbo', () => {
    const have = WORKSHOP.find((v) => v.base === 'have')!;
    const guide = verbGuide(have);
    expect(guide.map((x) => x.form)).toEqual(['have', 'has', 'had', 'had', 'having']);
    for (const f of guide) {
      expect(f.examples.length).toBeGreaterThan(0);
      for (const e of f.examples) expect(e.en.split(' ').length).toBeGreaterThan(2);
    }
    expect(guide[1].examples[0].en).toBe('She has a new job.');
    expect(guide[4].examples[0].en).toBe("I'm having lunch.");
  });

  test('todos los verbos: la forma resaltada está en la oración y hay traducción', () => {
    for (const v of WORKSHOP)
      for (const f of verbGuide(v))
        for (const e of f.examples) {
          expect(e.en.includes(e.hl), `${v.base}: ${e.en} / ${e.hl}`).toBe(true);
          expect(e.es.length).toBeGreaterThan(3);
          expect(e.en).not.toMatch(/n't \w+ something|never \w+ something/);
        }
  });
});
