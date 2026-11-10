import { describe, expect, it } from 'vitest';
import { BUILD, BUILD_TOPICS } from '../content/build';
import { matches } from './answer';
import { buildKey, buildSession } from './build';
import { ruleHits } from './writing';
import { getState } from './store';

describe('Armá la frase', () => {
  it('cada frase tiene tema válido y respuestas que se aceptan', () => {
    const topics = new Set(BUILD_TOPICS.map((t) => t.id));
    for (const b of BUILD) {
      expect(topics.has(b.topic), b.answers[0]).toBe(true);
      for (const a of b.answers) expect(matches(a, b.answers), a).toBe(true);
    }
  });
  it('no hay frases repetidas', () => {
    const keys = BUILD.map(buildKey);
    expect(new Set(keys).size).toBe(keys.length);
  });
  it('las respuestas modelo no tienen errores típicos', () => {
    const bad = BUILD.flatMap((b) => ruleHits(b.answers[0]).filter((h) => !h.soft).map((h) => `${b.answers[0]} → ${h.id}`));
    expect(bad).toEqual([]);
  });
  it('acepta lo que escribe el reconocimiento de voz (minúsculas, sin puntos, contracciones)', () => {
    const find = (s: string) => BUILD.find((b) => b.answers[0].startsWith(s))!;
    expect(matches('she was very tired because she had been working since 6 am', find('She was very tired').answers)).toBe(true);
    expect(matches("if you'd told me earlier I would've helped you", find('If you had told me earlier').answers)).toBe(true);
    expect(matches('this time tomorrow ill be flying to perth', find('This time tomorrow').answers)).toBe(false);
    expect(matches("this time tomorrow I'll be flying to Perth", find('This time tomorrow').answers)).toBe(true);
    expect(matches('I will be flying to Perth this time tomorrow', find('This time tomorrow').answers)).toBe(true);
  });
  it('marca mal el tiempo equivocado', () => {
    const b = BUILD.find((x) => x.answers[0].startsWith('She was very tired'))!;
    expect(matches('She was very tired because she worked since 6 a.m.', b.answers)).toBe(false);
    expect(matches('She was very tired because she has been working since 6 a.m.', b.answers)).toBe(false);
  });
  it('la tanda pone primero lo que te costó y luego lo no hecho', () => {
    const s = getState();
    const missedKey = buildKey(BUILD[5]);
    const st = { ...s, build: { missed: [missedKey], done: { [buildKey(BUILD[0])]: 1 } } };
    const items = buildSession(st, { topic: 'past', n: 10 }, () => 0.5);
    expect(items[0].key).toBe(missedKey);
    expect(items.at(-1)!.key).toBe(buildKey(BUILD[0]));
    const mix = buildSession(st, { level: 'B2', n: 10 });
    expect(mix.length).toBe(10);
    expect(mix.every((i) => ['B1', 'B2', 'C1'].includes(i.unit.level))).toBe(true);
  });
});
