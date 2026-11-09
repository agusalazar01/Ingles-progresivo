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
