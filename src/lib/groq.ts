import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { getState, setState } from './store';
import { patternExamples } from './semantic';
import type { RNode, RoleplayScript } from '../content/roleplays/types';

/**
 * IA con internet (opcional): Groq, con tu propia clave gratis. Solo se usa si la prendés en Configuración;
 * sin internet, sin clave o si tarda, la app sigue con lo que funciona en el teléfono.
 * Groq procesa el texto en sus servidores (EE. UU.) y no lo usa para entrenar modelos.
 */
export const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
export const GROQ_MODELS = [
  { id: 'openai/gpt-oss-120b', title: 'GPT-OSS 120B', desc: 'La más inteligente (recomendada). Muy rápida en Groq.' },
  { id: 'openai/gpt-oss-20b', title: 'GPT-OSS 20B', desc: 'Más chica y el doble de rápida; corrige un poco peor.' },
];
export const DEFAULT_GROQ: { on: boolean; key: string; model: string; usage?: { day: string; tokens: number; requests: number } } = { on: false, key: '', model: GROQ_MODELS[0].id };

/** Tope diario de tokens del plan gratis (openai/gpt-oss-120b y 20b). */
export const GROQ_DAILY_TOKENS = 200_000;
const today = () => new Date().toISOString().slice(0, 10);

/** Lo gastado hoy (el contador arranca de nuevo cada día; Groq lo reinicia a la medianoche UTC). */
export function groqUsageToday(): { tokens: number; requests: number } {
  const u = groqSettings().usage;
  return u && u.day === today() ? { tokens: u.tokens, requests: u.requests } : { tokens: 0, requests: 0 };
}
function addUsage(tokens: number) {
  const u = groqUsageToday();
  setGroq({ usage: { day: today(), tokens: u.tokens + tokens, requests: u.requests + 1 } });
}

export const groqSettings = () => ({ ...DEFAULT_GROQ, ...(getState().settings.ai.groq ?? {}) });
export const groqReady = () => {
  const g = groqSettings();
  return g.on && g.key.trim().length > 10 && (typeof navigator === 'undefined' || navigator.onLine !== false);
};
export function setGroq(patch: Partial<typeof DEFAULT_GROQ>) {
  setState((x) => ({ ...x, settings: { ...x.settings, ai: { ...x.settings.ai, groq: { ...DEFAULT_GROQ, ...x.settings.ai.groq, ...patch } } } }));
}

type Msg = { role: 'system' | 'user' | 'assistant'; content: string };

/** Llama a Groq y devuelve el texto de la respuesta. Tira error si no hay internet, la clave no sirve o tarda más de `timeoutMs`. */
export async function groqChat(messages: Msg[], o: { json?: boolean; maxTokens?: number; timeoutMs?: number; temperature?: number; key?: string; model?: string } = {}): Promise<string> {
  const g = groqSettings();
  const key = (o.key ?? g.key).trim();
  if (!key) throw new Error('Falta la clave de Groq');
  const body = {
    model: o.model ?? g.model,
    messages,
    temperature: o.temperature ?? 0.4,
    max_completion_tokens: o.maxTokens ?? 400,
    reasoning_effort: 'low',
    ...(o.json ? { response_format: { type: 'json_object' } } : {}),
  };
  const headers = { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
  const timeout = o.timeoutMs ?? 8000;
  let status: number;
  let data: unknown;
  if (Capacitor.isNativePlatform()) {
    // En el teléfono se manda desde Android (sin las restricciones del navegador).
    const r = await Promise.race([
      CapacitorHttp.request({ url: GROQ_URL, method: 'POST', headers, data: body, connectTimeout: timeout, readTimeout: timeout }),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error('Groq tardó demasiado')), timeout + 500)),
    ]);
    status = r.status;
    data = typeof r.data === 'string' ? safeJson(r.data) : r.data;
  } else {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeout);
    try {
      const r = await fetch(GROQ_URL, { method: 'POST', headers, body: JSON.stringify(body), signal: ctrl.signal });
      status = r.status;
      data = await r.json().catch(() => null);
    } finally {
      clearTimeout(t);
    }
  }
  if (status === 401) throw new Error('La clave de Groq no es válida');
  if (status === 429) throw new Error('Groq: llegaste al límite gratis por ahora; probá en un rato');
  if (status < 200 || status >= 300) throw new Error(`Groq respondió ${status}${errorText(data)}`);
  const res = data as { choices?: { message?: { content?: string } }[]; usage?: { total_tokens?: number } };
  addUsage(res?.usage?.total_tokens ?? 0);
  const text = res?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Groq no devolvió texto');
  return text;
}

const safeJson = (t: string): unknown => {
  try {
    return JSON.parse(t);
  } catch {
    return null;
  }
};
const errorText = (d: unknown) => {
  const m = (d as { error?: { message?: string } })?.error?.message;
  return m ? `: ${m}` : '';
};

/** Saca el objeto JSON de la respuesta (aunque venga con texto alrededor). */
export function parseJson<T>(text: string): T | null {
  const a = text.indexOf('{');
  const b = text.lastIndexOf('}');
  if (a < 0 || b <= a) return null;
  return safeJson(text.slice(a, b + 1)) as T | null;
}

/** Prueba la clave: una pregunta mínima. */
export async function testGroq(key: string, model: string): Promise<number> {
  const t0 = Date.now();
  const out = await groqChat([{ role: 'user', content: 'Reply with just: OK' }], { key, model, maxTokens: 20, timeoutMs: 10000 });
  if (!/ok/i.test(out)) throw new Error('Respuesta rara de Groq');
  return Date.now() - t0;
}

// ───────────── roleplays ─────────────

const first = (s: string | string[]) => (Array.isArray(s) ? s[0] : s);

/** Cómo describirle a la IA cada camino posible del momento actual del guion. */
function describeOptions(s: RoleplayScript, n: RNode): string {
  return n.options
    .map((o, i) => {
      const any = o.match.some((m) => m.split('|').includes('*'));
      const ex = any ? 'any other reasonable answer' : patternExamples(o.match, 4).map((x) => `"${x}"`).join(', ');
      const next = s.nodes[o.next];
      const leads = next ? `then you will say: "${first(next.say)}"` : 'then the conversation ends';
      const react = o.reply ? ` (scripted reaction: "${first(o.reply)}")` : '';
      return `${i}: learner says something like ${ex}${react} → ${leads}`;
    })
    .join('\n');
}

export interface GroqTurn {
  /** Opción del guion que corresponde (−1 = ninguna: no contestó lo que se preguntó). */
  choice: number;
  /** Reacción natural a lo que dijo (sin la pregunta siguiente, que la pone el guion). */
  reply: string;
}

/**
 * Un turno del roleplay con la IA online: entiende lo que dijiste aunque lo digas con otras palabras,
 * elige el camino del guion y escribe una reacción natural que sigue el hilo.
 */
export async function groqRoleplayTurn(o: {
  s: RoleplayScript;
  node: RNode;
  level: string;
  history: { who: 'them' | 'you'; text: string }[];
  said: string;
  /** Si las palabras ya coincidieron con una opción, la IA solo escribe la reacción. */
  matched?: number;
}): Promise<GroqTurn> {
  const { s, node } = o;
  const sys = `You are ${s.partner.name} (${s.partner.role}) in a spoken English roleplay for a Spanish-speaking learner (level ${o.level}) living in Australia.
Place: ${s.place}. Situation (Spanish): ${s.situation}. Learner's goal (Spanish): ${s.goal}.
Stay in character, speak natural, friendly Australian English, short and clear for a ${o.level} learner. Never correct grammar here (that comes at the end).
The conversation follows a script. Your last line was: "${o.history.filter((h) => h.who === 'them').at(-1)?.text ?? first(node.say)}"
Possible paths now:
${describeOptions(s, node)}
Return ONLY JSON: {"choice": <path number, or -1 if the learner did not answer or went off topic>, "reply": "<your reaction>"}.
Rules for "reply":
- If choice >= 0: a short natural reaction to exactly what the learner said (max 20 words), picking up their details (names, numbers, places). If that path has a scripted reaction, keep its facts (prices, times, places, instructions) in your own words. Do NOT ask the next question and do not say the next line: the app says it right after.
- If choice is -1: react briefly and kindly, then ask your last question again in simpler words (max 25 words).
- Never invent facts that contradict the script.`;
  const msgs: Msg[] = [
    { role: 'system', content: sys },
    ...o.history.slice(-8).map((h): Msg => ({ role: h.who === 'them' ? 'assistant' : 'user', content: h.text })),
    { role: 'user', content: `${o.said}${o.matched !== undefined ? `\n(Note: this matches path ${o.matched}.)` : ''}` },
  ];
  const out = parseJson<{ choice?: number; reply?: string }>(await groqChat(msgs, { json: true, maxTokens: 300, timeoutMs: 7000 }));
  if (!out || typeof out.choice !== 'number') throw new Error('Respuesta de Groq sin formato');
  const choice = o.matched ?? (out.choice >= 0 && out.choice < node.options.length ? Math.floor(out.choice) : -1);
  return { choice, reply: (out.reply ?? '').trim() };
}

export interface GroqFeedback {
  fixes: { said: string; better: string; why: string }[];
  good: string[];
  vocab: { en: string; es: string }[];
}

/** Corrección al final del roleplay, como un profe: qué estuvo bien, qué mejorar (explicado en español) y vocabulario útil. */
export async function groqRoleplayFeedback(o: { s: RoleplayScript; level: string; said: string[] }): Promise<GroqFeedback> {
  const sys = `You are an expert English teacher for Spanish speakers (Rioplatense Spanish, use "vos"). The learner (level ${o.level}) just did a spoken roleplay: ${o.s.place}, with ${o.s.partner.name} (${o.s.partner.role}). Their lines were transcribed from speech, so ignore punctuation and capitalisation.
Return ONLY JSON:
{"fixes":[{"said":"<learner line, exact>","better":"<natural corrected version>","why":"<short explanation in Spanish, max 25 words>"}],
 "good":["<what they did well, in Spanish, specific, max 20 words>"],
 "vocab":[{"en":"<useful word or phrase for this situation they could have used>","es":"<Spanish>"}]}
Only include real errors or clearly unnatural phrasing (max 6 fixes). 1–3 "good" items. 3–5 "vocab" items.`;
  const text = await groqChat(
    [
      { role: 'system', content: sys },
      { role: 'user', content: o.said.map((x, i) => `${i + 1}. ${x}`).join('\n') },
    ],
    { json: true, maxTokens: 900, timeoutMs: 15000, temperature: 0.2 },
  );
  const out = parseJson<Partial<GroqFeedback>>(text);
  if (!out) throw new Error('Respuesta de Groq sin formato');
  return {
    fixes: (out.fixes ?? []).filter((f) => f && f.said && f.better && f.better.trim() !== f.said.trim()).slice(0, 6),
    good: (out.good ?? []).filter(Boolean).slice(0, 3),
    vocab: (out.vocab ?? []).filter((v) => v && v.en && v.es).slice(0, 5),
  };
}

/** Corrección de un texto escrito (sección Escribir): marca los errores con explicación en español. */
export async function groqWritingFeedback(o: { text: string; level: string; task: string }): Promise<{ corrected: string; fixes: { from: string; to: string; why: string }[]; comment: string }> {
  const sys = `You are an expert English writing teacher for Spanish speakers (Rioplatense Spanish, use "vos"). Level ${o.level}. Task (Spanish): ${o.task}.
Return ONLY JSON: {"corrected":"<the text with minimal corrections, keep their ideas and style>","fixes":[{"from":"<wrong fragment>","to":"<correction>","why":"<short explanation in Spanish>"}],"comment":"<2 sentences in Spanish: overall feedback and one tip to sound more natural>"}
Max 10 fixes; only real errors or clearly unnatural phrasing.`;
  const out = parseJson<{ corrected?: string; fixes?: { from: string; to: string; why: string }[]; comment?: string }>(
    await groqChat(
      [
        { role: 'system', content: sys },
        { role: 'user', content: o.text },
      ],
      { json: true, maxTokens: 1400, timeoutMs: 20000, temperature: 0.2 },
    ),
  );
  if (!out?.corrected) throw new Error('Respuesta de Groq sin formato');
  return { corrected: out.corrected, fixes: (out.fixes ?? []).filter((f) => f?.from || f?.to).slice(0, 10), comment: out.comment ?? '' };
}
