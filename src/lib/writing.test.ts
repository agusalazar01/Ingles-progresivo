import { describe, expect, it } from 'vitest';
import { WRITING } from '../content/writing';
import { connectorGaps, countWords, orderOk, orderPieces, review, ruleHits } from './writing';
import { UNITS } from '../content/curriculum';
import { matches } from './answer';

const modelText = (id: string) => {
  const l = WRITING.find((x) => x.id === id)!;
  const greet = l.model.parts.filter((p) => p.role === 'greet').map((p) => p.text);
  const sign = l.model.parts.filter((p) => p.role === 'sign').map((p) => p.text);
  const body = l.model.parts.filter((p) => p.role !== 'greet' && p.role !== 'sign').map((p) => p.text);
  return [...greet, l.level === 'B1' || l.level === 'B2' ? body.join('\n\n') : body.join(' '), ...sign].join('\n\n');
};

describe('Escribir en inglés', () => {
  it('cada modelo tiene el largo de su nivel', () => {
    const bad: string[] = [];
    for (const l of WRITING) {
      const n = countWords(modelText(l.id));
      if (n < l.words * 0.85 || n > l.words * 1.35) bad.push(`${l.id}: ${n}/${l.words}`);
    }
    expect(bad).toEqual([]);
  });
  it('los modelos aprueban su propia revisión y no tienen errores típicos', () => {
    const bad: string[] = [];
    for (const l of WRITING) {
      const r = review(l, modelText(l.id));
      if (!r.passed) bad.push(`${l.id}: ${r.checks.filter((c) => !c.ok && c.required).map((c) => c.label).join(' | ')} ${r.hits.map((h) => h.found).join(', ')}`);
    }
    expect(bad).toEqual([]);
  });
  it('las reglas no marcan las respuestas correctas de las unidades', () => {
    const bad: string[] = [];
    for (const u of UNITS)
      for (const e of u.exercises)
        if ('answers' in e && e.kind !== 'order')
          for (const a of e.answers) {
            if (a.includes('___') || /^[a-z]/.test(a)) continue;
            const h = ruleHits(a).filter((x) => !x.soft && x.id !== 'lowercase-i');
            if (h.length) bad.push(`${a} → ${h.map((x) => x.id + ':' + x.found).join(', ')}`);
          }
    expect(bad.slice(0, 30)).toEqual([]);
  });
  it('las reglas encuentran los errores típicos', () => {
    const cases: [string, string][] = [
      ['I have 27 years.', 'age'],
      ['The people is very friendly.', 'people-is'],
      ['It depends of the weather.', 'depend-of'],
      ['I am agree with you.', 'am-agree'],
      ['She explained me the problem.', 'explain-me'],
      ['This city is more bigger than mine.', 'double-comp'],
      ['My house is more big than yours.', 'more-short'],
      ['The life is hard.', 'generic-the'],
      ['We arrived to Sydney.', 'arrive-to'],
      ['I listen music every day.', 'listen-music'],
      ['We was tired.', 'we-was'],
      ['She work in a bank.', 'third-person'],
      ["He don't like it.", 'he-dont'],
      ["She didn't went.", 'aux-s'],
      ['I can to swim.', 'modal-to'],
      ['I live here since two years.', 'since-time'],
      ['I go there in Monday.', 'in-day'],
      ['I made a photo.', 'make-photo'],
      ['I need some informations.', 'uncountable'],
      ['Is very hot today.', 'missing-it'],
      ['I no like fish.', 'no-verb'],
      ['When I will arrive, I will call you.', 'when-will'],
      ['If it will rain, we stay home.', 'if-will'],
      ['yesterday i went home.', 'lowercase-i'],
      ['I ate a apple.', 'a-vowel'],
      ['It is an house.', 'an-consonant'],
      ["I don't know nothing.", 'double-neg'],
      ['I came for learn English.', 'for-verb'],
      ['I assisted the meeting.', 'assist'],
      ['In my city have many parks.', 'place-have'],
      ['I went to home.', 'go-to-home'],
      ['I lost the bus.', 'lose-bus'],
      ['I like it because is quiet.', 'clause-no-subject'],
      ['It is bigger that my house.', 'comp-that'],
    ];
    const miss = cases.filter(([t, id]) => !ruleHits(t).some((h) => h.id === id)).map(([t]) => t);
    expect(miss).toEqual([]);
  });
  it('no marca cosas que están bien', () => {
    const ok = [
      'Does she work here?',
      'Let him go.',
      'If I were you, I would go.',
      'I have 27 years of experience.',
      'I came here for work.',
      'She married him in 2019.',
      'I have lived here for two years.',
      'He said that he was tired.',
      'A university is a big place.',
      'I went home early.',
      'It is an hour away.',
      'We arrived at the airport on 3 March.',
      'I don\'t know anything.',
      'I think it will rain.',
      'I don\'t know if he will come.',
    ];
    const bad = ok.map((t) => [t, ruleHits(t).filter((h) => !h.soft)] as const).filter(([, h]) => h.length).map(([t, h]) => `${t} → ${h.map((x) => x.id).join(',')}`);
    expect(bad).toEqual([]);
  });
  it('las respuestas de unir oraciones se aceptan y no tienen errores', () => {
    const bad: string[] = [];
    for (const l of WRITING)
      for (const c of l.combine) {
        if (!matches(c.answers[0], c.answers)) bad.push(c.answers[0]);
        const h = ruleHits(c.answers[0]).filter((x) => !x.soft);
        if (h.length) bad.push(`${c.answers[0]} → ${h.map((x) => x.id).join(',')}`);
      }
    expect(bad).toEqual([]);
  });
  it('los huecos de conectores tienen una sola opción de su grupo', () => {
    for (const l of WRITING) {
      const gaps = connectorGaps(l, () => 0.3);
      if (l.level !== 'A1') expect(gaps.length, l.id).toBeGreaterThan(0);
      for (const g of gaps) expect(new Set(g.options).size).toBe(g.options.length);
    }
  });
  it('hay piezas para ordenar', () => {
    for (const l of WRITING) expect(orderPieces(l).length, l.id).toBeGreaterThanOrEqual(3);
  });
  it('ordenar acepta oraciones intercambiables y no las de una historia', () => {
    const me = orderPieces(WRITING.find((x) => x.id === 'a1-me')!);
    expect(orderOk(me, [0, 1, 2, 3])).toBe(true);
    expect(orderOk(me, [0, 2, 1, 3])).toBe(true);
    expect(orderOk(me, [1, 0, 2, 3])).toBe(false);
    expect(orderOk(me, [0, 1, 3, 2])).toBe(false);
    const st = orderPieces(WRITING.find((x) => x.id === 'a1-weekend')!);
    expect(orderOk(st, [0, 2, 1, 3])).toBe(false);
  });
  it('un texto flojo no aprueba', () => {
    const l = WRITING.find((x) => x.id === 'a2-country')!;
    const r = review(l, 'The city is good. I like the city. The people is nice.');
    expect(r.passed).toBe(false);
  });
});
