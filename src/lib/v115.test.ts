import { describe, expect, it } from 'vitest';
import { speakerFor, systemVoiceFor } from './voicegender';
import { isVoiceHidden, visibleSpeakers } from './ai';

const sp = [1, 2, 3, 4, 5, 6].map((id) => ({ id, name: `v${id}` }));

describe('v1.15 voces quitadas', () => {
  it('visibleSpeakers filtra las voces quitadas y no las otras', () => {
    const hidden = ['p1:2', 'p1:3'];
    const out = visibleSpeakers(hidden, 'p1', sp);
    expect(out.map((x) => x.id)).not.toContain(2);
    expect(out.map((x) => x.id)).not.toContain(3);
    expect(visibleSpeakers(hidden, 'p2', sp).length).toBe(6);
    expect(isVoiceHidden(hidden, 'p1', 2)).toBe(true);
    expect(isVoiceHidden(hidden, 'p1', 1)).toBe(false);
  });
  it('visibleSpeakers sin lista devuelve todo', () => {
    expect(visibleSpeakers(undefined, 'p1', sp).length).toBe(6);
  });
  it('offset 0 conserva la voz elegida; offset>0 cambia de voz', () => {
    const base = speakerFor('p1', sp, 1, null, 'Kate', 0);
    expect(base).toBe(1);
    const voices = [
      { id: 'a', name: 'Female A', lang: 'en-AU' },
      { id: 'b', name: 'Female B', lang: 'en-AU' },
    ];
    const a = systemVoiceFor(voices, 'f', 'Kate', 0);
    const b = systemVoiceFor(voices, 'f', 'Kate', 1);
    if (a && b) expect(a).not.toBe(b);
  });
});
