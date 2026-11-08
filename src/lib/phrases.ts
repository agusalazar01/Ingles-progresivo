/**
 * «Decilo en inglés»: tus propias frases.
 *
 * Pensás algo en español → primero intentás decirlo vos en inglés (el esfuerzo de recuperar es lo que
 * fija) → la IA sin internet te da una versión natural (australiana), una más simple, bloques
 * reutilizables y una devolución en español → la frase queda en tu mazo con repaso espaciado (FSRS).
 * Sin IA descargada, hay un banco de frases comunes.
 */
import { getState, nextCard, setState, type Outcome, type Phrase } from './store';
import { cleanReply } from './ai';

export const TRANSLATOR = `You are an English coach for a Spanish speaker from Uruguay who is going to work a wine vintage in Australia.
The learner gives you a sentence in Spanish and, sometimes, their own attempt in English.
Answer EXACTLY in this format, with these four lines and nothing else:
NATURAL: how a friendly Australian would really say it (casual, natural, not slangy to the point of being hard)
SIMPLE: a simpler, shorter version a B1 learner can say easily
CHUNKS: 2 to 4 reusable pieces from the natural version, separated by " | "
FEEDBACK: in Spanish from Uruguay (voseo), one or two short sentences about their attempt: what was fine and what to change. If there was no attempt, one useful tip about the sentence.`;

export interface Rendering {
  natural: string;
  simple: string;
  chunks: string[];
  feedback: string;
}

/** Lee la respuesta de la IA (tolera mayúsculas, viñetas y líneas extra). */
export function parseRendering(text: string): Rendering | null {
  const get = (k: string) => {
    const m = text.match(new RegExp(`^[\\s*\\-•]*${k}\\s*[:：]\\s*(.+)$`, 'im'));
    return m ? cleanReply(m[1]).replace(/^["“]|["”]$/g, '').trim() : '';
  };
  const natural = get('NATURAL');
  if (!natural) return null;
  const chunks = get('CHUNKS')
    .split(/\s*[|;]\s*/)
    .map((c) => c.replace(/^["“]|["”]$/g, '').trim())
    .filter(Boolean)
    .slice(0, 4);
  return { natural, simple: get('SIMPLE') || natural, chunks, feedback: get('FEEDBACK') };
}

export function translateRequest(es: string, attempt: string, again = false): string {
  return `Spanish: ${es}
${attempt.trim() ? `My attempt: ${attempt.trim()}` : 'My attempt: (none)'}${again ? '\nThe last version did not sound right to me. Give me a different, more natural one.' : ''}`;
}

/** Variaciones para practicar la misma frase de otra forma. */
export const VARIATIONS: { id: string; label: string; ask: string }[] = [
  { id: 'past', label: 'en pasado', ask: 'in the past tense' },
  { id: 'future', label: 'en futuro', ask: 'about the future (going to / will)' },
  { id: 'question', label: 'como pregunta', ask: 'as a question' },
  { id: 'negative', label: 'en negativo', ask: 'in the negative' },
  { id: 'she', label: 'con «she»', ask: 'with "she" as the subject' },
  { id: 'we', label: 'con «we»', ask: 'with "we" as the subject' },
];

export function variationRequest(en: string, ask: string): string {
  return `Rewrite this English sentence ${ask}. Keep it natural and Australian.
Sentence: ${en}
Answer EXACTLY with two lines:
ENGLISH: the new sentence
SPANISH: its meaning in Spanish from Uruguay`;
}

export function parseVariation(text: string): { en: string; es: string } | null {
  const get = (k: string) => {
    const m = text.match(new RegExp(`^[\\s*\\-•]*${k}\\s*[:：]\\s*(.+)$`, 'im'));
    return m ? cleanReply(m[1]).replace(/^["“]|["”]$/g, '').trim() : '';
  };
  const en = get('ENGLISH');
  return en ? { en, es: get('SPANISH') } : null;
}

/** Banco sin IA: frases que vas a necesitar en Australia y en la charla de todos los días. */
export const BANK: { es: string; en: string; simple?: string; chunks: string[] }[] = [
  { es: 'No entendí, ¿me lo repetís más despacio?', en: "Sorry, I didn't catch that. Could you say it a bit slower?", simple: 'Sorry, can you say that again slowly?', chunks: ["I didn't catch that", 'a bit slower'] },
  { es: '¿Qué quiere decir eso?', en: 'What does that mean?', chunks: ['What does … mean?'] },
  { es: 'Estoy aprendiendo inglés, tené paciencia.', en: "I'm still learning English, so bear with me.", simple: "I'm learning English, sorry.", chunks: ["I'm still learning", 'bear with me'] },
  { es: 'Soy de Uruguay, está entre Argentina y Brasil.', en: "I'm from Uruguay. It's between Argentina and Brazil.", chunks: ["I'm from …", "It's between … and …"] },
  { es: 'Vine a trabajar la vendimia.', en: "I'm here to work the vintage.", chunks: ["I'm here to …", 'work the vintage'] },
  { es: '¿A qué hora empezamos mañana?', en: 'What time do we start tomorrow?', chunks: ['What time do we …?'] },
  { es: '¿Me podés mostrar cómo se hace?', en: 'Could you show me how to do it?', simple: 'Can you show me?', chunks: ['Could you show me how to …?'] },
  { es: 'Ya terminé con esto, ¿qué hago ahora?', en: "I'm done with this. What should I do next?", chunks: ["I'm done with …", 'What should I do next?'] },
  { es: 'Perdón, me equivoqué.', en: 'Sorry, my mistake.', chunks: ['my mistake'] },
  { es: 'No hay problema.', en: 'No worries.', chunks: ['No worries'] },
  { es: 'Estoy re cansado hoy.', en: "I'm absolutely stuffed today.", simple: "I'm really tired today.", chunks: ["I'm stuffed", 'absolutely'] },
  { es: 'Tengo muchas ganas de conocer Australia.', en: "I'm really keen to see Australia.", simple: 'I really want to see Australia.', chunks: ["I'm keen to …"] },
  { es: '¿Querés venir a tomar algo después del trabajo?', en: 'Do you want to grab a drink after work?', chunks: ['grab a drink', 'after work'] },
  { es: 'Me parece que va a llover.', en: 'I reckon it’s going to rain.', simple: 'I think it will rain.', chunks: ['I reckon …', "it's going to …"] },
  { es: '¿Dónde queda el supermercado más cercano?', en: "Where's the closest supermarket?", chunks: ["Where's the closest …?"] },
  { es: 'Me duele la espalda de tanto agacharme.', en: 'My back is sore from all the bending.', chunks: ['My … is sore', 'from all the …'] },
  { es: '¿Cuánto sale?', en: 'How much is it?', chunks: ['How much is …?'] },
  { es: 'Extraño el mate y el asado.', en: 'I miss mate and a good asado.', chunks: ['I miss …'] },
  { es: 'Hace un calor bárbaro.', en: "It's stinking hot.", simple: "It's very hot.", chunks: ["It's stinking hot"] },
  { es: 'Gracias por darme una mano.', en: 'Thanks for giving me a hand.', chunks: ['give someone a hand'] },
  { es: '¿Te puedo hacer una pregunta?', en: 'Can I ask you something?', chunks: ['Can I ask you …?'] },
  { es: 'Llegué hace dos semanas.', en: 'I got here two weeks ago.', chunks: ['I got here', '… ago'] },
  { es: 'Quiero mejorar mi inglés hablando con la gente.', en: 'I want to improve my English by chatting with people.', chunks: ['improve my English', 'by + -ing'] },
  { es: 'Me tengo que ir, nos vemos mañana.', en: "I've got to head off. See you tomorrow.", simple: 'I have to go. See you tomorrow.', chunks: ["I've got to head off"] },
  { es: '¿Cómo se dice esto en inglés?', en: 'How do you say this in English?', chunks: ['How do you say … in English?'] },
  { es: 'Estoy buscando un lugar para quedarme.', en: "I'm looking for a place to stay.", chunks: ["I'm looking for …", 'a place to stay'] },
  { es: 'No tengo idea.', en: 'No idea, mate.', simple: "I don't know.", chunks: ['No idea'] },
  { es: 'Está buenísimo este vino.', en: 'This wine is bloody good.', simple: 'This wine is really good.', chunks: ['bloody good'] },
  { es: '¿A vos te pasa lo mismo?', en: 'Does that happen to you too?', chunks: ['happen to you', 'too'] },
  { es: 'Si querés, te ayudo.', en: 'I can give you a hand if you want.', chunks: ['give you a hand', 'if you want'] },
];

const uid = () => Math.random().toString(36).slice(2, 10);

export function savePhrase(p: Omit<Phrase, 'id' | 'created'>): Phrase {
  const full: Phrase = { ...p, id: uid(), created: new Date().toISOString() };
  setState((s) => ({ ...s, phrases: [...(s.phrases ?? []), full] }));
  return full;
}

export function updatePhrase(id: string, patch: Partial<Phrase>) {
  setState((s) => ({ ...s, phrases: (s.phrases ?? []).map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
}

export function deletePhrase(id: string) {
  setState((s) => ({ ...s, phrases: (s.phrases ?? []).filter((p) => p.id !== id) }));
}

export function gradePhrase(id: string, outcome: Outcome, now = new Date()) {
  const p = (getState().phrases ?? []).find((x) => x.id === id);
  if (p) updatePhrase(id, { card: nextCard(p.card, outcome, now) });
}

/** Frases para repasar hoy (nuevas primero, después las vencidas). */
export function duePhrases(list: Phrase[], now = new Date()): Phrase[] {
  return list
    .filter((p) => !p.card || new Date(p.card.due) <= now)
    .sort((a, b) => (a.card?.due ?? '').localeCompare(b.card?.due ?? ''));
}

/** Busca en el banco sin IA la frase más parecida a lo que escribiste en español. */
export function bankMatch(es: string) {
  const w = (s: string) =>
    new Set(
      s
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-zñ ]/g, ' ')
        .split(/\s+/)
        .filter((x) => x.length > 2),
    );
  const A = w(es);
  let best: { item: (typeof BANK)[number]; score: number } | null = null;
  for (const item of BANK) {
    const B = w(item.es);
    let inter = 0;
    for (const x of A) if (B.has(x)) inter++;
    const score = A.size && B.size ? inter / Math.max(A.size, B.size) : 0;
    if (!best || score > best.score) best = { item, score };
  }
  return best && best.score >= 0.34 ? best.item : null;
}
