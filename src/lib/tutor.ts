import { groqChat, parseJson } from './groq';
import type { Level } from '../content/types';

/** Charla con la profe: conversación solo en inglés con la IA online, con corrección después de cada frase tuya. */

export interface TutorTopic {
  id: string;
  es: string;
  /** Cómo se le presenta el tema a la IA (en inglés). */
  en: string;
}

export const TUTOR_TOPICS: TutorTopic[] = [
  { id: 'free', es: 'Lo que quieras', en: 'anything the learner wants to talk about: start with a friendly open question about their day' },
  { id: 'me', es: 'Presentarte y tu historia', en: 'the learner introducing themselves: where they are from, what they do, why they are learning English' },
  { id: 'plans', es: 'Tu viaje a Australia', en: 'the learner\'s plan to travel and work in Australia: plans, worries, what they expect' },
  { id: 'job', es: 'Trabajo y cosecha', en: 'working in Australia: farm, vineyard, hospitality or casual jobs; daily tasks, schedules, workmates' },
  { id: 'interview', es: 'Entrevista de trabajo', en: 'a casual job interview: you are the interviewer asking about experience, availability and strengths' },
  { id: 'weekend', es: 'Fin de semana y rutina', en: 'the learner\'s routine, last weekend and plans for the next one' },
  { id: 'country', es: 'Tu país y tu ciudad', en: 'the learner\'s country, city, food and customs, compared with Australia' },
  { id: 'friends', es: 'Charla de amigos', en: 'small talk with a new friend: hobbies, music, football, films and what to do this weekend' },
  { id: 'opinion', es: 'Dar tu opinión', en: 'the learner\'s opinions on everyday topics (technology, cities vs countryside, social media), asking them to explain why' },
];

export interface TutorFix {
  /** Lo que dijiste (el fragmento). */
  wrong: string;
  /** Cómo se dice bien. */
  better: string;
  /** Por qué, en español. */
  why: string;
}
export interface TutorTurn {
  reply: string;
  fixes: TutorFix[];
  /** Si estaba bien pero hay una forma más natural de decirlo. */
  natural: string;
  /** Ayuda corta en español si no entendiste a la profe o hablaste en español. */
  tip: string;
}
export interface TutorMsg {
  who: 'teacher' | 'you';
  text: string;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9' ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Saca las «correcciones» que no son: solo cambia la puntuación o las mayúsculas (el reconocimiento de voz no las pone). */
export function realFixes(fixes: TutorFix[] | undefined, said: string): TutorFix[] {
  return (fixes ?? [])
    .filter((f) => f && typeof f.wrong === 'string' && typeof f.better === 'string' && f.why)
    .filter((f) => norm(f.wrong) !== norm(f.better))
    .filter((f) => norm(said).includes(norm(f.wrong)) || norm(f.wrong).split(' ').length > 3)
    .slice(0, 2);
}

const system = (level: Level | string, topic: TutorTopic, name: string) => `You are ${name}, a warm, patient English teacher having a spoken conversation with a Spanish-speaking learner (level ${level}) who wants to live and work in Australia.
Topic: ${topic.en}.
Rules for "reply" (what you say out loud):
- English only, natural and friendly, 1–3 short sentences (max 35 words), slightly above the learner's level. Light Australian flavour, no heavy slang.
- React to what they said, then keep them talking with one clear question or prompt.
- Never mention the corrections in "reply" and never correct them out loud.
The learner's lines come from speech recognition: ignore punctuation, capitalisation and tiny recognition glitches. If a sentence is understandable and a word looks misheard, assume it is fine.
Find the learner's real mistakes in their LAST line only (wrong tense, missing or wrong word, Spanish-style structure, unnatural wording a native would not say): at most 2, the most important ones. For each: "wrong" (the exact fragment they said), "better" (that fragment corrected), "why" (short explanation IN SPANISH, Rioplatense with "vos", max 25 words, naming the rule or the Spanish interference).
If the line is correct but a native would say it differently, put that version in "natural" and leave "fixes" empty. If the line is fine, both are empty.
If they wrote Spanish or said they did not understand, rephrase more simply in English and give a one-line help in Spanish in "tip".
Return ONLY JSON: {"reply":"...","fixes":[{"wrong":"","better":"","why":""}],"natural":"","tip":""}`;

/** Un turno: tu frase → la reacción de la profe y la corrección. Sin `said` es el saludo de apertura. */
export async function tutorTurn(o: { level: Level | string; topic: TutorTopic; history: TutorMsg[]; said?: string; name?: string }): Promise<TutorTurn> {
  const msgs = [
    { role: 'system' as const, content: system(o.level, o.topic, o.name ?? 'Kate') },
    // Solo las últimas vueltas: así gasta menos y responde más rápido.
    ...o.history.slice(-10).map((m) => ({ role: m.who === 'teacher' ? ('assistant' as const) : ('user' as const), content: m.text })),
    { role: 'user' as const, content: o.said ?? '(Start the conversation: greet me briefly, introduce the topic and ask your first question. "fixes" must be empty.)' },
  ];
  const out = parseJson<Partial<TutorTurn>>(await groqChat(msgs, { json: true, maxTokens: 500, timeoutMs: 12000, temperature: 0.6 }));
  if (!out || typeof out.reply !== 'string' || !out.reply.trim()) throw new Error('Respuesta de la IA sin formato');
  const said = o.said ?? '';
  const fixes = o.said ? realFixes(out.fixes, said) : [];
  const natural = fixes.length || !out.natural || norm(out.natural) === norm(said) ? '' : String(out.natural);
  return { reply: out.reply.trim(), fixes, natural, tip: typeof out.tip === 'string' ? out.tip : '' };
}

/** Sugerencias para cuando no sabés qué decir: dos respuestas posibles, en inglés y con su significado. */
export async function tutorHelp(o: { level: Level | string; topic: TutorTopic; history: TutorMsg[] }): Promise<{ en: string; es: string }[]> {
  const out = parseJson<{ options?: { en: string; es: string }[] }>(
    await groqChat(
      [
        { role: 'system', content: `You help a Spanish-speaking English learner (level ${o.level}) who is stuck in a conversation about: ${o.topic.en}. Suggest 2 short, natural things they could answer to the teacher's last line, in simple English matching their level, each with a Spanish translation. Return ONLY JSON: {"options":[{"en":"","es":""}]}` },
        ...o.history.slice(-4).map((m) => ({ role: m.who === 'teacher' ? ('assistant' as const) : ('user' as const), content: m.text })),
        { role: 'user' as const, content: '(I am stuck. What could I say?)' },
      ],
      { json: true, maxTokens: 300, timeoutMs: 10000 },
    ),
  );
  return (out?.options ?? []).filter((x) => x?.en && x?.es).slice(0, 2);
}

export interface TutorSummary {
  good: string[];
  patterns: { mistake: string; why: string }[];
  vocab: { en: string; es: string }[];
}

/** Resumen de toda la charla: qué hiciste bien, errores que se repiten y vocabulario útil. */
export async function tutorSummary(o: { level: Level | string; topic: TutorTopic; said: string[] }): Promise<TutorSummary> {
  const out = parseJson<Partial<TutorSummary>>(
    await groqChat(
      [
        {
          role: 'system',
          content: `You are an expert English teacher for Spanish speakers (Rioplatense Spanish, use "vos"). The learner (level ${o.level}) just had a spoken conversation about: ${o.topic.en}. Their lines are speech-recognition transcripts: ignore punctuation and capitalisation.
Return ONLY JSON: {"good":["<what they did well, in Spanish, specific, max 20 words>"],"patterns":[{"mistake":"<recurring or important mistake with a short example, in Spanish>","why":"<how to fix it, in Spanish, max 25 words>"}],"vocab":[{"en":"<useful word or phrase they could have used>","es":"<Spanish>"}]}
1–3 "good", 0–4 "patterns" (only real ones), 3–5 "vocab".`,
        },
        { role: 'user', content: o.said.map((x, i) => `${i + 1}. ${x}`).join('\n') },
      ],
      { json: true, maxTokens: 900, timeoutMs: 20000, temperature: 0.2 },
    ),
  );
  if (!out) throw new Error('Respuesta de la IA sin formato');
  return {
    good: (out.good ?? []).filter(Boolean).slice(0, 3),
    patterns: (out.patterns ?? []).filter((p) => p?.mistake && p?.why).slice(0, 4),
    vocab: (out.vocab ?? []).filter((v) => v?.en && v?.es).slice(0, 5),
  };
}
