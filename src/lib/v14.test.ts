import { describe, expect, it } from 'vitest';
import { matches, reorderings } from './answer';
import { intelligibility } from './speech';
import { UNITS } from '../content/curriculum';

describe('respuestas correctas dichas de otra manera', () => {
  it('acepta cambiar el orden de la subordinada y del tiempo', () => {
    expect(matches('We will stay home if it rains', ['If it rains, we will stay home.'])).toBe(true);
    expect(matches('I bought a ute yesterday', ['Yesterday I bought a ute.'])).toBe(true);
    expect(matches('On Mondays I go to work', ['I go to work on Mondays.'])).toBe(true);
    expect(matches('When you called, I was sleeping', ['I was sleeping when you called.'])).toBe(true);
    expect(matches('I will have finished my degree by next year', ['By next year I will have finished my degree.'])).toBe(true);
  });
  it('acepta that optativo, have got, please y contracciones con sustantivo', () => {
    expect(matches('She said she was busy', ['She said that she was busy.'])).toBe(true);
    expect(matches("I've got a cold", ['I have a cold.'])).toBe(true);
    expect(matches('Can you help me please', ['Can you help me?'])).toBe(true);
    expect(matches("My brother's working", ['My brother is working.'])).toBe(true);
    expect(matches('Everybody is here', ['Everyone is here.'])).toBe(true);
    expect(matches('I know that man', ['I know that man.'])).toBe(true);
  });
  it('sigue marcando mal lo que está mal', () => {
    expect(matches('We will stay home if it will rain', ['If it rains, we will stay home.'])).toBe(false);
    expect(matches('She work in a bank', ['She works in a bank.'])).toBe(false);
    expect(matches('I know man', ['I know that man.'])).toBe(false);
    expect(matches('Is you tired', ['Are you tired?'])).toBe(false);
  });
  it('ninguna reordenación coincide con el enunciado equivocado', () => {
    const bad: string[] = [];
    for (const u of UNITS) for (const e of u.exercises) if (e.kind === 'fix' && matches(e.prompt, e.answers)) bad.push(e.prompt);
    expect(bad).toEqual([]);
  });
  it('no rompe preguntas', () => {
    expect(reorderings('Where do you live?')).toEqual([]);
  });
  it('voz: homófonos y una letra no cuentan como error', () => {
    expect(intelligibility('I have two dogs', ['I have to dogs']).score).toBe(1);
    expect(intelligibility('I walked to their house', ['I walk to there house']).score).toBeGreaterThanOrEqual(0.8);
    expect(intelligibility('I like coffee', ['he hates tea']).score).toBeLessThan(0.5);
  });
});

import { futureAlternatives } from './answer';
describe('will / going to', () => {
  const ok = (g: string, a: string[]) => matches(g, [...a, ...futureAlternatives(a)]);
  it('valen los dos, con o sin contracción', () => {
    expect(ok('I am going to call you tomorrow', ['I will call you tomorrow.'])).toBe(true);
    expect(ok("I'm going to call you tomorrow", ['I will call you tomorrow.'])).toBe(true);
    expect(ok('I will call you tomorrow', ["I'm going to call you tomorrow."])).toBe(true);
    expect(ok("I'll call you tomorrow", ['I am going to call you tomorrow.'])).toBe(true);
    expect(ok("She's going to buy a car", ['She will buy a car.'])).toBe(true);
    expect(ok("They won't come", ['They are not going to come.'])).toBe(true);
  });
  it('sigue marcando mal otros tiempos', () => {
    expect(ok('I call you tomorrow', ['I will call you tomorrow.'])).toBe(false);
    expect(ok('I am calling you tomorrow', ['I will call you tomorrow.'])).toBe(false);
  });
});
