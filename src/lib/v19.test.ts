import { describe, expect, it, vi } from 'vitest';
import { partnerGender, speakerFor, speakerGender, systemVoiceFor, systemVoiceGender } from './voicegender';
import { parseJson, groqRoleplayTurn } from './groq';
import { SCRIPTS_BY_N } from '../content/roleplays/all';
import { setState } from './store';

describe('voz según el personaje', () => {
  it('saca el género del nombre o del rol', () => {
    expect(partnerGender('Kate', 'empleada del mostrador')).toBe('f');
    expect(partnerGender('Tom', 'empleado de la aerolínea')).toBe('m');
    expect(partnerGender('Dr Patel', 'médica')).toBe('f');
    expect(partnerGender('Peatón', 'una señora')).toBe('f');
    expect(partnerGender('Funcionaria', 'del consulado')).toBe('f');
    expect(partnerGender('Operador', 'emergencias')).toBe('m');
    expect(partnerGender('Jodie', 'recepción del campamento')).toBe('f');
    expect(partnerGender('Agente', 'del banco')).toBeNull();
  });
  it('casi todos los personajes tienen género', () => {
    const all = Object.values(SCRIPTS_BY_N).map((s) => partnerGender(s.partner.name, s.partner.role));
    expect(all.filter((g) => !g).length / all.length).toBeLessThan(0.1);
  });
  it('conoce las voces de cada paquete', () => {
    expect(speakerGender('kitten', 0)).toBe('m');
    expect(speakerGender('kitten', 3)).toBe('f');
    expect(speakerGender('kokoro', 9)).toBe('m');
    expect(speakerGender('kokoro', 7)).toBe('f');
    expect(speakerGender('supertonic', 2)).toBe('f');
    expect(speakerGender('supertonic', 6)).toBe('m');
    expect(speakerGender('piper-au', 3, '4. Matilda')).toBe('f');
    expect(speakerGender('piper-au', 1, '2. Banjo')).toBe('m');
  });
  it('elige una voz del mismo género, siempre la misma por personaje', () => {
    const sp = [0, 1, 2, 3, 4, 5, 6, 7].map((id) => ({ id, name: `v${id}` }));
    expect(speakerFor('kitten', sp, 0, 'm', 'Tom')).toBe(0);
    const f = speakerFor('kitten', sp, 0, 'f', 'Kate');
    expect(f! % 2).toBe(1);
    expect(speakerFor('kitten', sp, 0, 'f', 'Kate')).toBe(f);
    expect(speakerFor('pocket', [{ id: 0, name: 'x' }], 0, 'f', 'Kate')).toBeNull();
    expect(speakerFor('kitten', sp, 4, null, 'Officer Lee')).toBe(4);
  });
  it('se puede marcar a mano una voz', () => {
    setState((x) => ({ ...x, settings: { ...x.settings, ai: { ...x.settings.ai, genders: { 'piper-au:5': 'f' } } } }));
    expect(speakerGender('piper-au', 5, '6. Clancy')).toBe('f');
  });
  it('reconoce voces del teléfono', () => {
    expect(systemVoiceGender('en-au-x-aub-local', '')).toBe('m');
    expect(systemVoiceGender('en-AU-SMTf00', '')).toBe('f');
    expect(systemVoiceGender('x', 'Google UK English Female')).toBe('f');
    const v = [
      { id: 'en-au-x-aua-local', name: 'a', lang: 'en-AU' },
      { id: 'en-au-x-aub-local', name: 'b', lang: 'en-AU' },
    ];
    expect(systemVoiceFor(v, 'm', 'Tom')).toBe('en-au-x-aub-local');
  });
});

describe('IA online (Groq)', () => {
  it('lee el JSON aunque venga con texto alrededor', () => {
    expect(parseJson<{ a: number }>('ok: {"a": 2} listo')).toEqual({ a: 2 });
    expect(parseJson('nada')).toBeNull();
  });
  it('un turno usa la opción que devuelve la IA', async () => {
    const s = SCRIPTS_BY_N['1'];
    const node = s.nodes[s.start];
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ choices: [{ message: { content: '{"choice":0,"reply":"No worries!"}' } }] }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    setState((x) => ({ ...x, settings: { ...x.settings, ai: { ...x.settings.ai, groq: { on: true, key: 'gsk_test_1234567890', model: 'openai/gpt-oss-120b' } } } }));
    const t = await groqRoleplayTurn({ s, node, level: 'A2', history: [], said: 'hello' });
    expect(t).toEqual({ choice: 0, reply: 'No worries!' });
    const body = JSON.parse((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body as string);
    expect(body.model).toBe('openai/gpt-oss-120b');
    expect(body.messages[0].content).toContain(s.partner.name);
    vi.unstubAllGlobals();
  });
  it('si la IA falla, tira error (y la app sigue sin internet)', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 401 })));
    const s = SCRIPTS_BY_N['1'];
    await expect(groqRoleplayTurn({ s, node: s.nodes[s.start], level: 'A2', history: [], said: 'hi' })).rejects.toThrow(/clave/);
    vi.unstubAllGlobals();
  });
});
