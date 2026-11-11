import { describe, expect, it } from 'vitest';
import { cleanReply, PACKS, roleplayPrompt, shortReply } from './ai';
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
      if (p.engine === 'piper' || p.engine === 'kokoro') expect(p.files.some((f) => f.name === 'model.onnx')).toBe(true);
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
    // Todas las llamadas empiezan con Oliver (la IA usa esa frase para abrir).
    for (const call of CALLS) expect('o' in call.turns[0]).toBe(true);
  });
});

describe('v0.8.2 — ajustes de la voz', () => {
  it('los narradores apurados arrancan más lentos y el resto a velocidad normal', async () => {
    const { tuneFor, referenceFor, MY_RECORDING } = await import('./ai');
    expect(tuneFor('piper-au', 0).speed).toBe(0.8); // clancy
    expect(tuneFor('piper-au', 4).speed).toBe(1); // angus
    expect(tuneFor('kokoro', 0).speed).toBe(1);
    expect(tuneFor('piper-au', 4).volume).toBe(1); // sin subir el volumen solo
    expect(referenceFor(MY_RECORDING)).toBe('mi-voz.wav');
    expect(referenceFor(0)).toBe('ref-m01.wav');
    // 12 voces australianas en el paquete de Pocket, sin los ejemplos que no se usan
    const { PACKS, POCKET_VOICES } = await import('./ai');
    const pocket = PACKS.find((p) => p.id === 'pocket')!;
    expect(POCKET_VOICES).toHaveLength(20);
    for (const v of POCKET_VOICES) expect(pocket.files.map((f) => f.name)).toContain(v.file);
    expect(pocket.files.some((f) => /^ref-\d\.wav$/.test(f.name))).toBe(false);
  });
});

describe('v0.8.5 — pasar a pregunta manteniendo la persona', () => {
  it('acepta «my» además de «your», y «Am I» además de «Are you»', async () => {
    const { matches, samePersonVariants } = await import('./answer');
    const a = samePersonVariants('My mates are at the beach this arvo.', ['Are your mates at the beach this arvo?']);
    expect(matches('are my mates at the beach this arvo?', a)).toBe(true);
    expect(matches('Are your mates at the beach this arvo?', a)).toBe(true);
    expect(matches('are his mates at the beach this arvo?', a)).toBe(false);
    const b = samePersonVariants('I am from Uruguay.', ['Are you from Uruguay?']);
    expect(matches('am I from Uruguay?', b)).toBe(true);
    const c = samePersonVariants('We are at home.', ["Are you at home?"]);
    expect(matches('are we at home', c)).toBe(true);
    // Si la oración no tiene «my», no se inventan variantes.
    expect(samePersonVariants('She is tired today.', ['Is she tired today?'])).toEqual(['Is she tired today?']);
  });
});
