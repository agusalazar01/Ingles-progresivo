import { afterEach, describe, expect, it, vi } from 'vitest';
import { realFixes, tutorTurn, tutorSummary, TUTOR_TOPICS } from './tutor';
import { groqUsageToday, setGroq } from './groq';

const reply = (obj: unknown, tokens = 700) =>
  vi.fn(async () => new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(obj) } }], usage: { total_tokens: tokens } }), { status: 200 }));
const on = () => setGroq({ on: true, key: 'gsk_test_1234567890', usage: undefined });

describe('charla con la profe', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('deja solo las correcciones de verdad', () => {
    const said = 'yesterday i go to the beach with my friends';
    const fixes = realFixes(
      [
        { wrong: 'i go', better: 'I went', why: 'Pasado simple: go → went.' },
        { wrong: 'yesterday i', better: 'Yesterday, I', why: 'Solo puntuación' },
        { wrong: 'the beach', better: 'the beach', why: 'igual' },
        { wrong: '', better: 'x', why: '' },
      ],
      said,
    );
    expect(fixes.map((f) => f.better)).toEqual(['I went']);
  });

  it('no inventa correcciones para fragmentos que no dijiste', () => {
    expect(realFixes([{ wrong: 'she go', better: 'she goes', why: 'x' }], 'I like football')).toEqual([]);
  });

  it('un turno devuelve la respuesta, las correcciones y gasta del contador', async () => {
    on();
    const f = reply({ reply: 'Nice! Where did you go?', fixes: [{ wrong: 'I go', better: 'I went', why: 'Pasado simple.' }], natural: '', tip: '' });
    vi.stubGlobal('fetch', f);
    const t = await tutorTurn({ level: 'B1', topic: TUTOR_TOPICS[0], history: [{ who: 'teacher', text: 'What did you do yesterday?' }], said: 'Yesterday I go to the beach' });
    expect(t.reply).toBe('Nice! Where did you go?');
    expect(t.fixes).toHaveLength(1);
    expect(groqUsageToday()).toEqual({ tokens: 700, requests: 1 });
    const body = JSON.parse((f.mock.calls[0] as unknown as [string, RequestInit])[1].body as string);
    expect(body.messages.at(-1)).toEqual({ role: 'user', content: 'Yesterday I go to the beach' });
    expect(body.messages[1]).toEqual({ role: 'assistant', content: 'What did you do yesterday?' });
    expect(body.messages[0].content).toContain('IN SPANISH');
  });

  it('el saludo de apertura no trae correcciones', async () => {
    on();
    vi.stubGlobal('fetch', reply({ reply: "G'day! What did you get up to this week?", fixes: [{ wrong: 'a', better: 'b', why: 'c' }] }));
    const t = await tutorTurn({ level: 'A2', topic: TUTOR_TOPICS[5], history: [] });
    expect(t.fixes).toEqual([]);
  });

  it('si la IA responde mal, falla y no deja la charla colgada', async () => {
    on();
    vi.stubGlobal('fetch', reply({ nada: true }));
    await expect(tutorTurn({ level: 'B1', topic: TUTOR_TOPICS[0], history: [], said: 'hello' })).rejects.toThrow();
  });

  it('el resumen filtra lo vacío', async () => {
    on();
    vi.stubGlobal('fetch', reply({ good: ['Usaste bien el pasado.', ''], patterns: [{ mistake: 'Olvidás el -s', why: 'He goes.' }, { mistake: '', why: '' }], vocab: [{ en: 'reckon', es: 'creer' }] }));
    const s = await tutorSummary({ level: 'B1', topic: TUTOR_TOPICS[0], said: ['I go'] });
    expect(s.good).toHaveLength(1);
    expect(s.patterns).toHaveLength(1);
    expect(s.vocab).toEqual([{ en: 'reckon', es: 'creer' }]);
  });
});
