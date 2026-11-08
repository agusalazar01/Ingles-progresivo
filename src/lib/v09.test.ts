import { beforeEach, describe, expect, it } from 'vitest';
import { coachWhisper, isRepeat, oliverMemory, planFreeCall, rememberFacts, similarity, TOPICS, forgetOliverMemory } from './oliver';
import { bankMatch, duePhrases, gradePhrase, parseRendering, parseVariation, savePhrase } from './phrases';
import { getState, setState } from './store';

describe('v0.9 — Oliver libre', () => {
  beforeEach(() => forgetOliverMemory());

  it('no repite el tema de la llamada anterior', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 10; i++) seen.add(planFreeCall().topic.id);
    expect(seen.size).toBe(10);
    expect(oliverMemory().topics.length).toBe(10);
  });

  it('el plan usa lo que recuerda y tus frases', () => {
    rememberFacts(['- Their name is Agus.', '- none', '- They are going to Australia for the 2027 vintage.']);
    rememberFacts(['- Their name is Agus.']);
    expect(oliverMemory().facts).toEqual(['Their name is Agus.', 'They are going to Australia for the 2027 vintage.']);
    const p = planFreeCall(['I reckon it is going to rain']);
    expect(p.opener).toContain('again');
    expect(p.system).toContain('Agus');
    expect(p.system).toContain('I reckon it is going to rain');
    expect(p.system).toContain(p.opener);
  });

  it('el entrenador cambia de tema, pide historias y cierra', () => {
    expect(coachWhisper('yes', [], { turn: 2, sameTopic: 1 }, 16)).toContain('story');
    expect(coachWhisper('I like it a lot honestly', [], { turn: 3, sameTopic: 6 }, 16)).toContain('fresh topic');
    expect(coachWhisper('I like it a lot honestly', [], { turn: 16, sameTopic: 1 }, 16)).toContain('goodbye');
    const loop = ["What do you reckon about footy mate?", "What do you reckon about the footy, mate?"];
    expect(coachWhisper('I like it a lot honestly', loop, { turn: 4, sameTopic: 1 }, 16)).toContain('fresh topic');
    expect(isRepeat("So what do you do for work these days?", ['What do you do for work these days, mate?'])).toBe(true);
    expect(similarity('kangaroo in the vineyard', 'I love cooking pasta')).toBe(0);
    expect(TOPICS.length).toBeGreaterThanOrEqual(30);
  });
});

describe('v0.9 — Decilo en inglés', () => {
  it('lee la respuesta de la IA', () => {
    const r = parseRendering(`Sure!\nNATURAL: "I slept in and was late for work."\n- SIMPLE: I woke up late.\nCHUNKS: slept in | late for work\nFEEDBACK: Bien, pero «slept in» suena más natural.`);
    expect(r).toEqual({ natural: 'I slept in and was late for work.', simple: 'I woke up late.', chunks: ['slept in', 'late for work'], feedback: 'Bien, pero «slept in» suena más natural.' });
    expect(parseRendering('no format')).toBeNull();
    expect(parseVariation('ENGLISH: She slept in.\nSPANISH: Ella se quedó dormida.')).toEqual({ en: 'She slept in.', es: 'Ella se quedó dormida.' });
  });

  it('banco sin IA', () => {
    expect(bankMatch('no entendí, ¿me lo repetís?')?.en).toContain("didn't catch");
    expect(bankMatch('el teorema de Pitágoras')).toBeNull();
  });

  it('las frases guardadas se repasan con FSRS', () => {
    setState((s) => ({ ...s, phrases: [] }));
    const p = savePhrase({ es: 'Hola', en: "G'day" });
    expect(duePhrases(getState().phrases ?? []).map((x) => x.id)).toEqual([p.id]);
    gradePhrase(p.id, 'good');
    expect(duePhrases(getState().phrases ?? [])).toEqual([]);
  });
});

describe('v0.9.1 — escalones', () => {
  it('la pista no resta y se pasa con 70 %', async () => {
    const { stepScore, STEP_PASS } = await import('./actions');
    const r = (outcome: 'good' | 'hard' | 'again', slow = false) => ({ key: 'k', unitId: 'u', prompt: '', given: '', correct: '', outcome, ...(slow ? { slow } : {}) });
    expect(STEP_PASS).toBe(0.7);
    expect(stepScore([r('good'), r('hard'), r('hard'), r('good')])).toBe(1);
    expect(stepScore([r('good'), r('hard', true)])).toBe(0.5);
    expect(stepScore([...Array(7)].map(() => r('hard')).concat([r('again'), r('again'), r('again')]))).toBeGreaterThanOrEqual(STEP_PASS);
  });

  it('acepta «Do you…» y will / going to', async () => {
    const { matches, samePersonVariants } = await import('./answer');
    const ok = (prompt: string, ans: string, given: string) => matches(given, samePersonVariants(prompt, [ans]));
    expect(ok('I send the documents every week.', 'Do I send the documents every week?', 'Do you send the documents every week?')).toBe(true);
    expect(ok('I am tired.', 'Am I tired?', 'Are you tired?')).toBe(true);
    expect(ok('We cook pasta every week.', 'We are going to cook pasta tomorrow.', 'We will cook pasta tomorrow.')).toBe(true);
    expect(ok('We cook pasta every week.', 'We are going to cook pasta tomorrow.', "We're gonna cook pasta tomorrow.")).toBe(true);
    expect(ok('My parents speak English.', 'My parents will speak English next week.', 'My parents are going to speak English next week.')).toBe(true);
    expect(ok('Ana buys yerba.', 'Ana will buy some yerba next week.', 'Ana is going to buy some yerba next week.')).toBe(true);
    expect(ok('We cook pasta every week.', 'We are going to cook pasta tomorrow.', 'We cook pasta tomorrow.')).toBe(false);
  });

  it('lo que salió mal vuelve con otra oración del mismo formato', async () => {
    const { addMissed, missedFor, variantOf, exerciseSig } = await import('./missed');
    const { unitById } = await import('../content/curriculum');
    const { generate } = await import('../gen/generate');
    const unit = unitById('pres-simple');
    let ex = generate(unit.id, 'transform')!;
    for (let i = 0; i < 50 && !('task' in ex && ex.task.includes('pregunta')); i++) ex = generate(unit.id, 'transform')!;
    addMissed(unit.id, `${unit.id}@transform`, ex);
    addMissed(unit.id, `${unit.id}@transform`, ex);
    const m = missedFor(unit.id);
    expect(m.length).toBe(1);
    for (let i = 0; i < 10; i++) {
      const v = variantOf(unit, m[0]);
      expect(v.prompt).not.toBe(ex.prompt);
      expect(exerciseSig(v)).toBe(exerciseSig(ex));
    }
  });
});
