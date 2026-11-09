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

describe('v1.0 — banco ampliado', () => {
  it('cada oración nueva está bien armada', async () => {
    const { EXTRA_CLOZE } = await import('../gen/banks-extra');
    const { CLOZE } = await import('../gen/banks');
    const { matches, normalize } = await import('./answer');
    let n = 0;
    for (const [unit, items] of Object.entries(EXTRA_CLOZE)) {
      expect(CLOZE[unit], unit).toBeDefined();
      const seen = new Set<string>();
      for (const c of items) {
        n++;
        expect(c.s.match(/\{/g)?.length, c.s).toBe(1);
        const t = c.s.match(/\{(.+?)\}/)![1];
        expect(c.es.trim().length, c.s).toBeGreaterThan(2);
        expect(new Set(c.alt.map(normalize)).size, c.s).toBe(c.alt.length);
        for (const a of c.alt) expect(matches(a, [t]), `${c.s} / ${a}`).toBe(false);
        const k = normalize(c.s.replace(/[{}]/g, ''));
        expect(seen.has(k), c.s).toBe(false);
        seen.add(k);
        if (c.tr) expect(/[.?!]$/.test(c.tr[1]), c.s).toBe(true);
      }
    }
    expect(n).toBeGreaterThan(400);
  });
  it('el léxico creció y conjuga bien en español', async () => {
    const { VERBS, SUBJECTS } = await import('../gen/lexicon');
    const { conjugateEs } = await import('../gen/spanish');
    expect(VERBS.length).toBeGreaterThanOrEqual(95);
    expect(VERBS.reduce((a, v) => a + v.comps.length, 0)).toBeGreaterThanOrEqual(300);
    expect(SUBJECTS.length).toBe(12);
    expect(conjugateEs('tocar', 'pret', 0)).toBe('toqué');
    expect(conjugateEs('llegar', 'pret', 0)).toBe('llegué');
    expect(conjugateEs('construir', 'pres', 2)).toBe('construye');
    expect(conjugateEs('elegir', 'pres', 0)).toBe('elijo');
    expect(conjugateEs('leer', 'perf', 3)).toBe('hemos leído');
    expect(conjugateEs('andar', 'pret', 2)).toBe('anduvo');
  });
});

describe('v1.0 — corregí el error', () => {
  it('cada error tiene corrección distinta y aceptada', async () => {
    const { EXTRA_FIX } = await import('../content/fix-bank');
    const { UNITS } = await import('../content/curriculum');
    const { matches } = await import('./answer');
    let n = 0;
    for (const [id, list] of Object.entries(EXTRA_FIX)) {
      expect(UNITS.some((u) => u.id === id), id).toBe(true);
      for (const e of list) {
        n++;
        if (e.kind !== 'fix') throw new Error('tipo');
        expect(matches(e.prompt, e.answers), e.prompt).toBe(false);
        for (const a of e.answers) expect(/[.?!]$/.test(a), a).toBe(true);
      }
    }
    expect(n).toBeGreaterThan(170);
    expect(UNITS.find((u) => u.id === 'past-simple')!.exercises.filter((e) => e.kind === 'fix').length).toBeGreaterThan(6);
  });
});
