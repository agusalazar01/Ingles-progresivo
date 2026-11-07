import { describe, expect, it } from 'vitest';
import { cleanReply, FREE_PROMPT, PACKS, roleplayPrompt, shortReply } from './ai';
import { CALLS } from '../content/calls';

describe('v0.8 — IA sin internet', () => {
  it('limpia lo que dice el modelo', () => {
    expect(cleanReply('<think>hmm</think> Oliver: G\'day mate! 😀 *waves* How are ya?')).toBe("G'day mate! How are ya?");
    expect(cleanReply('<think>\n</think>\n\nNo worries.')).toBe('No worries.');
  });

  it('corta las respuestas largas', () => {
    expect(shortReply('One. Two! Three? Four. Five.', 3)).toBe('One. Two! Three?');
    expect(shortReply('Sin punto final', 3)).toBe('Sin punto final');
  });

  it('cada paquete tiene archivos y un tipo', () => {
    const ids = new Set<string>();
    for (const p of PACKS) {
      expect(ids.has(p.id)).toBe(false);
      ids.add(p.id);
      expect(p.files.length).toBeGreaterThan(0);
      for (const f of p.files) expect(f.url).toMatch(/^https:\/\//);
      if (p.kind === 'brain') expect(p.files.some((f) => f.name === p.file)).toBe(true);
      if (p.kind === 'voice') expect(p.files.some((f) => f.name === 'model.onnx')).toBe(true);
    }
    expect(PACKS.filter((p) => p.kind === 'voice').length).toBeGreaterThanOrEqual(2);
    // Piper usa tokens2.txt (diptongos guardados como un solo carácter; con el original la app se cerraba).
    expect(PACKS.find((p) => p.id === 'piper-au')!.files.map((f) => f.name)).toContain('tokens2.txt');
    // espeak-ng no tiene la voz «en-gb»: el inglés británico es «en».
    expect(PACKS.find((p) => p.id === 'kokoro')!.espeak).toBe('en');
  });

  it('las llamadas con IA mantienen la temática de la unidad', () => {
    const c = CALLS[0];
    const lines = c.turns.filter((t): t is { o: string } => 'o' in t).map((t) => t.o);
    const p = roleplayPrompt({ scene: c.scene, goal: c.goal, unit: 'to be', lines });
    expect(p).toContain(c.scene);
    expect(p).toContain(c.goal);
    expect(p).toContain(lines[0]);
    expect(FREE_PROMPT).toContain('free chat');
    // Todas las llamadas empiezan con Oliver (la IA usa esa frase para abrir).
    for (const call of CALLS) expect('o' in call.turns[0]).toBe(true);
  });
});
