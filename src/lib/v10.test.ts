import { describe, expect, it } from 'vitest';
import { STRUCTURES, COMBOS } from '../content/structures';
import { breakdown, checkCombo, gradePhrase, learnRound, phraseExercise, phrasesOf, progressOf, reviewItems, statusOf, unlocked } from './structures';
import { matches } from './answer';
import { setState } from './store';

describe('v1.0 — Frases por estructura', () => {
  it('cada frase tiene una parte marcada y su ejercicio se resuelve con la respuesta', () => {
    const seen = new Set<string>();
    for (const s of STRUCTURES) {
      expect(s.phrases.length, s.id).toBeGreaterThanOrEqual(20);
      expect(s.tasks.length, s.id).toBeGreaterThanOrEqual(3);
      for (const [en] of s.phrases) {
        expect(en.match(/\{/g)?.length, en).toBe(1);
        expect(seen.has(`${s.id}${en}`), en).toBe(false);
        seen.add(`${s.id}${en}`);
      }
      for (const p of phrasesOf(s)) {
        const c = phraseExercise(p, 'complete');
        if (c.kind !== 'type') throw new Error();
        expect(c.prompt.includes('___'), p.en).toBe(true);
        expect(matches(p.focus, c.answers)).toBe(true);
        // La estructura se reconoce en sus propias frases (para el ejercicio de combinar).
        expect(s.detect.test(` ${p.en} `), `${s.id}: ${p.en}`).toBe(true);
      }
    }
  });
  it('explica cada palabra', () => {
    const missing: string[] = [];
    for (const s of STRUCTURES) for (const p of phrasesOf(s)) for (const w of breakdown(p)) if (!w.why) missing.push(`${w.word} (${p.en})`);
    expect(missing).toEqual([]);
  });
  it('las respuestas modelo pasan su propia revisión', () => {
    for (const c of COMBOS) {
      const r = checkCombo(c, c.model);
      expect(r.enoughWords, c.id).toBe(true);
      expect(r.structures.filter((x) => !x.ok).map((x) => x.id), c.id).toEqual([]);
      expect(r.connectors.length, c.id).toBeGreaterThan(0);
      if (c.kind === 'preguntar') expect(r.questions, c.id).toBeGreaterThan(0);
    }
  });
  it('progreso, desbloqueo y repaso', () => {
    setState((s) => ({ ...s, structs: {} }));
    const s0 = STRUCTURES[0];
    expect(unlocked(1)).toBe(false);
    const items = learnRound(s0, phrasesOf(s0).slice(0, 5).map((p) => p.id));
    expect(items.length).toBeGreaterThan(10);
    expect(items.every((i) => !(i.exercise.kind === 'translate' && /[a-z]/.test(i.exercise.answers[0]) === false))).toBe(true);
    for (const p of phrasesOf(s0).slice(0, 10)) gradePhrase(p.id, 'good');
    expect(progressOf(s0).started).toBe(10);
    expect(unlocked(1)).toBe(true);
    expect(statusOf(phrasesOf(s0)[0].id)).not.toBe('new');
    const later = new Date(Date.now() + 40 * 86400000);
    gradePhrase(phrasesOf(s0)[11].id, 'again', new Date(Date.now() - 86400000));
    expect(reviewItems().length).toBeGreaterThanOrEqual(1);
    expect(later > new Date()).toBe(true);
  });
});

describe('v1.0 — Roleplays', () => {
  it('catálogo completo, ids únicos y guiones enganchados', async () => {
    const { ROLEPLAYS, RP_CATEGORIES } = await import('../content/roleplays/catalog');
    const { SCRIPTS } = await import('../content/roleplays/scripts');
    expect(ROLEPLAYS.length).toBeGreaterThanOrEqual(190);
    expect(RP_CATEGORIES.length).toBe(13);
    expect(new Set(ROLEPLAYS.map((r) => r.id)).size).toBe(ROLEPLAYS.length);
    for (const id of Object.keys(SCRIPTS)) expect(ROLEPLAYS.find((r) => r.id === id)?.script, id).toBeDefined();
  });
  it('cada guion se puede recorrer y la pista de cada momento se reconoce', async () => {
    const { SCRIPTS } = await import('../content/roleplays/scripts');
    const { matchOption, fixesFor } = await import('./roleplay');
    for (const s of Object.values(SCRIPTS)) {
      expect(s.nodes[s.start], s.id).toBeDefined();
      for (const [id, n] of Object.entries(s.nodes)) {
        for (const o of n.options) expect(o.next === 'end' || !!s.nodes[o.next], `${s.id}/${id} → ${o.next}`).toBe(true);
        expect(n.fallback.next === 'end' || !!s.nodes[n.fallback.next], `${s.id}/${id} fallback`).toBe(true);
        expect(matchOption(n, [n.hint]), `${s.id}/${id}: «${n.hint}»`).not.toBeNull();
        expect(fixesFor(n, n.hint), `${s.id}/${id}: la pista no debe tener errores`).toEqual([]);
        for (const f of n.fixes ?? []) expect(() => new RegExp(f.wrong)).not.toThrow();
      }
      // Se llega al final siguiendo la primera opción.
      let cur = s.start;
      for (let i = 0; i < 30 && cur !== 'end'; i++) cur = s.nodes[cur].options[0]?.next ?? s.nodes[cur].fallback.next;
      expect(cur, s.id).toBe('end');
    }
  });
  it('reconoce respuestas libres y errores típicos', async () => {
    const { SCRIPTS } = await import('../content/roleplays/scripts');
    const { matchOption, fixesFor } = await import('./roleplay');
    const cafe = SCRIPTS['33-ordering-coffee'];
    expect(matchOption(cafe.nodes.order, ['I want a latte'])?.next).toBe('size');
    expect(fixesFor(cafe.nodes.order, 'I want a latte').length).toBe(1);
    expect(matchOption(cafe.nodes.extra, ["No thanks, that's all"])?.next).toBe('end');
    const bank = SCRIPTS['23-opening-a-bank-account'];
    expect(matchOption(bank.nodes.address, ["I don't have an address yet"])?.reply).toContain('hostel');
    const job = SCRIPTS['70-barista-job-interview'];
    expect(matchOption(job.nodes.exp, ["No, I haven't"])?.next).toBe('hosp');
    expect(fixesFor(job.nodes.avail, 'I am available in monday').length).toBe(1);
  });
});

describe('v1.0 — conjugar, formas de decir y escribir libre', () => {
  it('conjuga las frases con she / they', async () => {
    const { conjugate, phrasesOf: ps } = await import('./structures');
    const { STRUCTURES: S } = await import('../content/structures');
    const by = (sid: string, en: string) => ps(S.find((s) => s.id === sid)!).find((p) => p.en === en)!;
    expect(conjugate(by('pres-simple', 'I usually cook dinner.'), 'she')).toBe('She usually cooks dinner.');
    expect(conjugate(by('pres-simple', 'I have breakfast at home.'), 'she')).toBe('She has breakfast at home.');
    expect(conjugate(by('pres-simple', "I don't eat meat."), 'she')).toBe("She doesn't eat meat.");
    expect(conjugate(by('be-aff', "I'm not sure."), 'they')).toBe("They aren't sure.");
    expect(conjugate(by('pres-perfect', "I've lost my keys."), 'she')).toBe("She's lost her keys.");
    expect(conjugate(by('want-need', 'I want to learn English.'), 'she')).toBe('She wants to learn English.');
    expect(conjugate(by('past-irregular', 'I was tired.'), 'they')).toBe('They were tired.');
    expect(conjugate(by('used-to', "I didn't use to like coffee."), 'she')).toBe("She didn't use to like coffee.");
    expect(conjugate(by('past-regular', 'I worked all day.'), 'she')).toBe('She worked all day.');
    expect(conjugate(by('if-will', "I'll call you if I'm late."), 'she')).toBeNull();
    let n = 0;
    for (const s of S)
      for (const p of ps(s))
        for (const to of ['she', 'they'] as const) {
          const c = conjugate(p, to);
          if (!c) continue;
          n++;
          expect(/^(She|They)\b/.test(c), c).toBe(true);
          expect(/\b(I|my|me|am)\b/.test(c), `${p.en} → ${c}`).toBe(false);
        }
    expect(n).toBeGreaterThan(150);
  });
  it('formas de decir bien armadas', async () => {
    const { EXPRESSIONS } = await import('../content/expressions');
    const { expressionRound } = await import('./structures');
    expect(EXPRESSIONS.length).toBeGreaterThanOrEqual(20);
    for (const g of EXPRESSIONS) {
      expect(g.ways.length, g.id).toBeGreaterThanOrEqual(4);
      expect(new Set(g.ways.map((w) => w.en)).size, g.id).toBe(g.ways.length);
      for (const [, best] of g.situations) expect(g.ways[best], g.id).toBeDefined();
      const items = expressionRound(g);
      for (const it of items) if (it.exercise.kind === 'choice') expect(it.exercise.options[it.exercise.answer]).toBeDefined();
    }
  });
  it('reconoce lo que usaste al escribir libre', async () => {
    const { analyzeFree } = await import('./structures');
    const r = analyzeFree("I'm getting the hang of it, but I'm tired because I worked all day. Fair enough.");
    expect(r.connectors).toEqual(expect.arrayContaining(['but', 'because']));
    expect(r.expressions).toEqual(expect.arrayContaining(["I'm getting the hang of it", 'Fair enough']));
    expect(r.structures.length).toBeGreaterThan(1);
  });
});
