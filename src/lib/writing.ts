import type { Level } from '../content/types';
import { WRITING, WRITING_LEVELS, type Genre, type WritingLesson } from '../content/writing';
import { getState, setState, today, type AppState } from './store';

// ───────────────────────────── Conectores ─────────────────────────────

/** Conectores agrupados por función: en los ejercicios, las opciones falsas salen de otro grupo (así nunca hay dos correctas). */
export const CONNECTOR_GROUPS: Record<string, string[]> = {
  suma: ['and', 'also', 'in addition', 'furthermore', 'moreover', 'as well as', 'not only'],
  contraste: ['but', 'however', 'although', 'even though', 'though', 'whereas', 'while', 'nevertheless', 'on the other hand', 'despite', 'even so', 'admittedly'],
  causa: ['because', 'because of', 'since', 'thanks to', 'due to'],
  consecuencia: ['so', 'as a result', 'therefore', 'which means that', 'that way'],
  orden: ['first', 'firstly', 'secondly', 'then', 'after that', 'when', 'before', 'after', 'finally', 'in the end', 'suddenly', 'once', 'since then', 'whenever', 'looking back'],
  ejemplo: ['for example', 'for instance', 'such as', 'especially'],
  condición: ['if', 'as long as', 'provided that', 'unless'],
  opinión: ['i think', 'in my opinion', 'in my view', 'i believe', 'for me', 'i would argue'],
  cierre: ['to sum up', 'in conclusion', 'overall', 'all things considered'],
};

const ALL_CONNECTORS = Object.values(CONNECTOR_GROUPS).flat();
export const groupOf = (c: string) => Object.entries(CONNECTOR_GROUPS).find(([, l]) => l.includes(c.toLowerCase()))?.[0];

/** Conectores que se esperan por nivel (los del nivel y los anteriores). */
const LEVEL_CONNECTORS: Record<string, string[]> = {
  A1: ['and', 'but', 'because', 'so', 'i think'],
  A2: ['also', 'then', 'first', 'after that', 'when', 'in my opinion', 'especially', 'before', 'after', 'finally'],
  B1: ['however', 'although', 'while', 'for example', 'in addition', 'since', 'on the other hand', 'to sum up', 'suddenly', 'in my view', 'whenever', 'overall'],
  B2: ['furthermore', 'nevertheless', 'whereas', 'despite', 'as a result', 'which means that', 'provided that', 'as long as', 'in conclusion', 'admittedly', 'even though', 'not only'],
};

export function levelConnectors(level: Level): string[] {
  const out: string[] = [];
  for (const l of WRITING_LEVELS) {
    out.push(...LEVEL_CONNECTORS[l]);
    if (l === level) break;
  }
  return out;
}

const clean = (t: string) => t.toLowerCase().replace(/[’‘]/g, "'");
const hasPhrase = (text: string, p: string) => new RegExp(`(^|[^a-z'])${p.replace(/ /g, '\\s+')}(?![a-z])`, 'i').test(text);

/** Conectores distintos que aparecen en el texto. */
export function connectorsIn(text: string): string[] {
  const t = clean(text);
  return ALL_CONNECTORS.filter((c) => hasPhrase(t, c));
}

export const countWords = (text: string) => (text.match(/[A-Za-zÀ-ÿ0-9]+(?:['’-][A-Za-zÀ-ÿ0-9]+)*/g) ?? []).length;
const paragraphs = (text: string) => text.split(/\n\s*\n|\n(?=\s*[A-Z])/).map((p) => p.trim()).filter((p) => countWords(p) >= 4);
const sentences = (text: string) => text.split(/(?<=[.!?])\s+|\n+/).map((s) => s.trim()).filter((s) => countWords(s) > 0);

// ───────────────────────────── Errores típicos ─────────────────────────────

export interface RuleHit {
  id: string;
  /** Lo que se encontró en tu texto. */
  found: string;
  msg: string;
  /** Cómo se dice bien. */
  fix?: string;
  /** Solo un aviso (puede estar bien según lo que quisiste decir): no bloquea. */
  soft?: boolean;
}

interface Rule {
  id: string;
  re: RegExp;
  msg: string;
  fix?: string;
  soft?: boolean;
  /** Si se cumple sobre lo encontrado, no es error. */
  unless?: RegExp;
}

const NUM = '(?:\\d+|(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(?:-\\w+)?|ten|eleven|twelve|\\w+teen)';
const SUBJ = "(?:i|you|we|they|he|she)";
const AUX_BEFORE = "(?<!\\b(?:does|did|can|could|will|would|should|must|might|may|doesn't|didn't|can't|won't|couldn't|wouldn't|shouldn't|let|make|made|help|helped|to|and|or|if|that|what|where|when|why|how|who) )";
const COMPARATIVE = '(?:bigger|smaller|cheaper|older|younger|taller|faster|easier|harder|happier|colder|hotter|longer|shorter|worse|nicer|busier|quieter|richer|poorer|stronger|safer|healthier)';

const RULES: Rule[] = [
  { id: 'age', re: new RegExp(`\\b${SUBJ} (?:have|has) ${NUM} years?\\b(?! (?:of|ago|experience|in|working|living|studying|here|there))`, 'i'), msg: 'La edad va con be, no con have.', fix: 'I am 27 (years old).' },
  { id: 'people-is', re: /\bpeople (?:is|was|has|doesn't|does)\b/i, msg: 'People es plural en inglés.', fix: 'people are / people were / people have' },
  { id: 'depend-of', re: /\bdepend(?:s|ed|ing)? of\b/i, msg: 'Se dice depend on.', fix: 'It depends on the weather.' },
  { id: 'am-agree', re: /\b(?:am|is|are|was|were|'m) (?:agree|disagree)\b/i, msg: 'Agree es un verbo: no lleva am / is.', fix: 'I agree. / I don’t agree.' },
  { id: 'explain-me', re: /\bexplain(?:s|ed|ing)? (?:me|him|her|us|them)\b/i, msg: 'Explain lleva to antes de la persona.', fix: 'He explained it to me. / Can you explain this to me?' },
  { id: 'say-me', re: /\bsa(?:y|ys|id) (?:me|him|her|us|them)\b/i, msg: 'Para decirle algo a alguien se usa tell.', fix: 'She told me… / Tell me…' },
  { id: 'double-comp', re: /\bmore (?:better|worse|bigger|smaller|easier|cheaper|older|younger|faster|happier|harder)\b/i, msg: 'No se pone more con un comparativo que ya tiene -er.', fix: 'better / bigger (sin more)' },
  { id: 'more-short', re: /(?<!\band )\bmore (?:big|small|cheap|easy|fast|old|young|happy|hot|cold|nice|long|short|tall|good|bad|busy|quiet|rich|poor|strong|safe)\b(?! (?:and|or) )/i, msg: 'Los adjetivos cortos forman el comparativo con -er.', fix: 'bigger, cheaper, easier, better, worse…' },
  { id: 'most-good', re: /\bthe most (?:good|bad)\b/i, msg: 'El superlativo de good es the best y el de bad, the worst.', fix: 'the best / the worst' },
  { id: 'comp-that', re: new RegExp(`\\b${COMPARATIVE} that\\b`, 'i'), msg: 'Para comparar se usa than, no that.', fix: 'bigger than…' },
  { id: 'generic-the', re: /(?:^|[.!?]\s+)the (?:life|love|money|happiness|nature|music|education|technology|work|time|society|health) (?:is|are|was|can|makes|has|gives)\b/i, msg: 'Para hablar en general no se usa the.', fix: 'Life is… / Money can’t buy… / Technology has…' },
  { id: 'discuss-about', re: /\bdiscuss(?:ed|es|ing)? about\b/i, msg: 'Discuss no lleva about.', fix: 'We discussed the problem.' },
  { id: 'married-with', re: /\bmarried with\b/i, msg: 'Se dice married to.', fix: 'She is married to Tom.' },
  { id: 'interested-on', re: /\binterested (?:on|for)\b/i, msg: 'Se dice interested in.', fix: 'I am interested in music.' },
  { id: 'arrive-to', re: /\barriv(?:e|es|ed|ing) to\b/i, msg: 'Arrive no va con to: at (un lugar chico) o in (una ciudad o país).', fix: 'I arrived at the airport. / We arrived in Sydney.' },
  { id: 'listen-music', re: /\blisten(?:s|ed|ing)? (?:music|the radio|the music|me|him|her|us|them|my|a|this|that)\b/i, msg: 'Listen lleva to antes de lo que escuchás.', fix: 'I listen to music.' },
  { id: 'go-to-home', re: /\b(?:go|goes|went|going|come|came|coming|get|got) to home\b/i, msg: 'Home va sin to.', fix: 'I went home.' },
  { id: 'we-was', re: /\b(?:we|they|you) was\b/i, msg: 'Con we, they y you va were.', fix: 'we were / they were / you were' },
  { id: 'he-were', re: /(?<!\bif |\bwish |\bas if |\bas though )\b(?:he|she|it) were\b/i, msg: 'Con he, she e it va was (salvo en «If I were you…»).', fix: 'he was / she was / it was' },
  { id: 'i-has', re: /\b(?:i|you|we|they) has\b/i, msg: 'Con I, you, we y they va have.', fix: 'I have / they have' },
  { id: 'third-person', re: new RegExp(`${AUX_BEFORE}\\b(?:he|she) (?:have|do|go|want|like|live|work|need|know|think|say|make|play|study|watch|feel|get|eat|drink|love|hate|speak|come|take)\\b`, 'i'), msg: 'Con he o she, el verbo en presente lleva -s.', fix: 'she works / he has / she goes / he does' },
  { id: 'he-dont', re: /\b(?:he|she|it) don't\b/i, msg: 'Con he, she e it va doesn’t.', fix: 'She doesn’t like it.' },
  { id: 'aux-s', re: /\b(?:doesn't|does not|didn't|did not) (?:has|likes|wants|goes|works|lives|needs|knows|went|saw|had|got|came|made|did|took|said|thought|bought|ate|wanted|liked|worked|lived|needed|played|watched|studied|arrived)\b/i, msg: 'Después de doesn’t / didn’t el verbo va en su forma base.', fix: 'She doesn’t like… / I didn’t go…' },
  { id: 'modal-to', re: /\b(?:can|must|should|could|might|will|would) to\b/i, msg: 'Después de can, must, should… va el verbo directo, sin to.', fix: 'I can swim. / You should go.' },
  { id: 'since-time', re: new RegExp(`\\bsince ${NUM.replace('(?:\\d+|', '(?:\\d{1,2}|a|one|two|three|four|five|six|seven|eight|nine|')} (?:years?|months?|weeks?|days?|hours?|minutes?)\\b(?! ago)`, 'i'), msg: 'Para la duración se usa for; since va con el punto de partida.', fix: 'for two years / since 2020' },
  { id: 'in-day', re: /\bin (?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)s?\b/i, msg: 'Los días van con on.', fix: 'on Monday / on Fridays' },
  { id: 'on-month', re: /\bon (?:january|february|march|april|may|june|july|august|september|october|november|december|summer|winter|autumn|spring)\b(?! \d)(?! the \d)/i, msg: 'Los meses y estaciones van con in (on solo con una fecha).', fix: 'in March / in summer / on 3 March' },
  { id: 'make-photo', re: /\bma(?:ke|kes|de|king) (?:a |some )?(?:photos?|pictures?|questions?|homework|sport|exercise|a party|parties)\b/i, msg: 'Con esto no se usa make.', fix: 'take a photo · ask a question · do homework · do exercise · have a party' },
  { id: 'uncountable', re: /\b(?:informations|advices|furnitures|homeworks|luggages|equipments|knowledges|feedbacks|an advice|an information|a furniture|a homework)\b/i, msg: 'Esa palabra es incontable en inglés: no lleva -s ni a/an.', fix: 'information · advice (a piece of advice) · furniture · homework · luggage' },
  { id: 'missing-it', re: /(?:^|[.!?]\s+)(?:is|was) (?:very |so |really |too |quite )?(?:hot|cold|important|necessary|possible|impossible|difficult|easy|nice|good|bad|raining|sunny|windy|late|early|true|interesting|incredible|amazing)\b/i, msg: 'En inglés la oración necesita sujeto: It is…', fix: 'It is very hot. / It was important.' },
  { id: 'clause-no-subject', re: /\b(?:because|although|even though|when|if|so that|since|that's why) (?:is|was|are|were) (?!(?:it|this|that|there)\b)/i, msg: 'Después de because, when, if… la oración necesita sujeto: because it is…', fix: 'I like it because it is quiet.' },
  { id: 'want-to', re: /\b(?:want|wants|wanted|need|needs|needed|would like|'d like|decided|decide|plan|planned|hope|hoped|try|tried|forgot|learn|learned|learnt)\s+(?:go|buy|get|see|eat|drink|work|live|travel|visit|study|learn|make|do|have|take|find|pay|stay|call|book|meet|ask|know|try|speak|move|rent|open|start|leave|come|play)\b/i, msg: 'Después de want, need, would like, decide, try… va to antes del verbo.', fix: 'I want to go by train.' },
  { id: 'no-verb', re: /\b(?:i|you|we|they) no (?:like|want|have|know|understand|need|go|work|speak|eat|drink|can)\b/i, msg: 'La negación va con don’t (o can’t), no con no.', fix: 'I don’t like… / I can’t…' },
  { id: 'how-called', re: /\bhow (?:is|are) (?:it |this |that |they )?called\b/i, msg: 'Se pregunta con what.', fix: 'What is it called?' },
  { id: 'when-will', re: /\b(?:when|as soon as|before|after|until|once) (?:i|you|he|she|we|they|it) will\b/i, msg: 'Después de when, before, after, as soon as… se usa presente aunque hables del futuro.', fix: 'When I arrive, I will call you.' },
  { id: 'if-will', re: /(?:^|[.!?,]\s*)if (?:i|you|he|she|we|they|it) will\b/i, msg: 'En la parte del if va presente, no will.', fix: 'If it rains, we will stay home.' },
  { id: 'lowercase-i', re: /(?:^|[\s"(])i(?=[\s',.!?]|$)/, msg: 'I (yo) va siempre con mayúscula.', fix: 'I' },
  { id: 'a-vowel', re: /\ba (?!(?:uni|use|usa|usu|uti|ute|ure|eu|one|once|uk\b|us\b|ufo))[aeiou][a-z]+/i, msg: 'Antes de un sonido de vocal va an.', fix: 'an apple · an hour · an interesting idea' },
  { id: 'an-consonant', re: /\ban (?!(?:hour|honest|hono|heir|x-|mp\b|mba\b|fbi\b|sms\b|fm\b|hr\b|nhs\b))[b-df-hj-np-tv-z][a-z]*/i, msg: 'Antes de un sonido de consonante va a.', fix: 'a house · a car · a university' },
  { id: 'double-neg', re: /\b(?:don't|doesn't|didn't|can't|won't|never|not)\b[^.,;!?]*\b(?:nothing|nobody|nowhere|no one)\b/i, msg: 'En inglés no se usan dos negaciones juntas.', fix: 'I don’t know anything. / I know nothing.' },
  { id: 'for-verb', re: /\bfor (?:to )?(?:learn|study|work|buy|see|visit|get|improve|meet|save|make|have|find|pay|go|travel|practise|practice|help)\b/i, msg: 'Para decir «para + verbo» se usa to.', fix: 'I came here to learn English.', unless: /\bfor (?:work|help|travel|practice|practise)\b(?! (?:a|the|my|your|more|in|on|with|it)\b)/i },
  { id: 'assist', re: /\bassist(?:ed|s|ing)? (?:to )?(?:the |a |my )?(?:class|classes|meeting|course|party|wedding|school|lesson|concert)\b/i, msg: 'Asistir a una clase o reunión = attend (assist es ayudar).', fix: 'I attended the meeting.' },
  { id: 'place-have', re: /(?:^|[.!?]\s+)in (?:my|the|this|our) (?:city|town|country|house|school|neighbourhood|neighborhood|village) (?:have|has)\b/i, msg: '«En mi ciudad hay…» = There is / There are, o My city has…', fix: 'There are many parks in my city. / My city has…' },
  { id: 'i-boring', re: /\b(?:i'm|i am|i was|we are|we were) (?:boring|interesting|exciting|tiring)\b/i, msg: 'Boring describe algo que aburre. Si querés decir «estaba aburrido», es bored.', fix: 'I was bored. / I’m tired.', soft: true },
  { id: 'actually', re: /\bactually\b/i, msg: 'Actually = «en realidad». Si quisiste decir «actualmente», es currently o nowadays.', fix: 'Currently, I live in… / Nowadays…', soft: true },
  { id: 'eventually', re: /\beventually\b/i, msg: 'Eventually = «finalmente, al final». Si quisiste decir «eventualmente» (a veces), es occasionally.', soft: true },
  { id: 'sensible', re: /\bsensible\b/i, msg: 'Sensible = sensato. «Sensible» en español es sensitive.', soft: true },
  { id: 'library', re: /\bbought [^.]*\b(?:at|in|from) the library\b/i, msg: 'Library = biblioteca. La librería es bookshop o bookstore.', fix: 'I bought it at the bookshop.' },
  { id: 'lose-bus', re: /\b(?:lost|lose|losing) the (?:bus|train|plane|flight)\b/i, msg: 'Perder el ómnibus = miss the bus.', fix: 'I missed the bus.' },
];

export function ruleHits(text: string): RuleHit[] {
  const out: RuleHit[] = [];
  const t = text.replace(/[’‘]/g, "'");
  for (const r of RULES) {
    const flags = r.re.flags.includes('g') ? r.re.flags : r.re.flags + 'g';
    const re = new RegExp(r.re.source, flags);
    const seen = new Set<string>();
    for (const m of t.matchAll(re)) {
      const found = m[0].replace(/^[.!?,\s"(]+/, '').trim();
      if (r.unless && r.unless.test(found)) continue;
      if (seen.has(found.toLowerCase())) continue;
      seen.add(found.toLowerCase());
      out.push({ id: r.id, found, msg: r.msg, fix: r.fix, soft: r.soft });
    }
  }
  return out;
}

// ───────────────────────────── Revisión del texto ─────────────────────────────

export interface Check {
  label: string;
  ok: boolean;
  detail?: string;
  /** Si no se cumple, el texto no cuenta para pasar la lección. */
  required: boolean;
}

const PAST = /\b(?:was|were|had|went|did|got|made|saw|came|took|said|told|thought|bought|ate|drank|left|felt|met|found|gave|knew|ran|swam|woke|spent|lost|became|began|kept|taught|learnt|learned|\w{2,}ed)\b/gi;
const MIN_PARAGRAPHS: Record<string, number> = { A1: 1, A2: 1, B1: 3, B2: 4 };
const MIN_CONNECTORS: Record<string, number> = { A1: 1, A2: 3, B1: 5, B2: 6 };
const STOP = new Set('the a an and but or so to of in on at for with is are was were be been i you he she it we they my your his her our their me him us them this that there have has had do does did not no very can will would just about from as by if then than when what which who also more some all because like get got go went one'.split(' '));

export function review(lesson: WritingLesson, text: string): { checks: Check[]; hits: RuleHit[]; words: number; connectors: string[]; passed: boolean } {
  const words = countWords(text);
  const target = lesson.words;
  const cons = connectorsIn(text);
  const hits = ruleHits(text);
  const hard = hits.filter((h) => !h.soft);
  const checks: Check[] = [];

  const min = Math.round(target * 0.85);
  checks.push({
    label: `Largo: ${words} de ${target} palabras`,
    ok: words >= min,
    detail: words < min ? `Te faltan unas ${min - words} palabras. Agregá un ejemplo o un detalle.` : words > target * 1.6 ? 'Está bien, pero practicá también decirlo en menos palabras.' : undefined,
    required: true,
  });
  const needC = MIN_CONNECTORS[lesson.level];
  checks.push({
    label: `Conectores: ${cons.length} distintos (pedidos: ${needC})`,
    ok: cons.length >= needC,
    detail: cons.length ? `Usaste: ${cons.join(', ')}.` : `Probá con: ${levelConnectors(lesson.level).slice(-6).join(', ')}.`,
    required: true,
  });
  const needP = MIN_PARAGRAPHS[lesson.level];
  if (needP > 1) {
    const p = paragraphs(text).length;
    checks.push({ label: `Párrafos: ${p} (pedidos: ${needP})`, ok: p >= needP, detail: p < needP ? 'Dejá una línea en blanco entre cada parte: introducción, ideas y cierre.' : undefined, required: true });
  }
  const g: Genre = lesson.genre;
  const lower = clean(text);
  if (g === 'opinion') {
    const op = /\b(i think|i believe|in my opinion|in my view|for me|i would argue|i feel that|i am convinced|i partly agree|i agree|i disagree|i'm convinced|i like|i love|i don't like|i prefer|my favourite|my favorite)\b/.test(lower);
    checks.push({ label: 'Dejás clara tu opinión', ok: op, detail: op ? undefined : 'Usá I think…, In my opinion… o I believe… al principio.', required: true });
  }
  if (g === 'story') {
    const past = (text.match(PAST) ?? []).length;
    checks.push({ label: `Verbos en pasado: ${past}`, ok: past >= Math.max(3, Math.round(words / 25)), detail: past < 3 ? 'Una historia se cuenta en pasado: went, saw, was, decided…' : undefined, required: true });
  }
  if (g === 'email') {
    const greet = /^\s*(hi|hello|hey|dear|good morning|good afternoon|g'day)\b/i.test(text);
    const sign = /\b(cheers|regards|best wishes|best|thanks|thank you|see you|love|yours sincerely|yours faithfully|take care|talk soon)\b[^.]*$/i.test(text.trim().split('\n').slice(-3).join(' '));
    checks.push({ label: 'Saludo y despedida', ok: greet && sign, detail: !greet ? 'Empezá con Hi…, Hello… o Dear…' : !sign ? 'Cerrá con Cheers, Kind regards, See you…' : undefined, required: true });
  }
  if (g === 'compare') {
    const comp = /\b(\w+er than|more \w+ than|less \w+ than|as \w+ as|whereas|while|however|on the other hand|in the past|now|both|but)\b/.test(lower);
    checks.push({ label: 'Comparás las dos cosas', ok: comp, detail: comp ? undefined : 'Usá …er than, more … than, while o whereas.', required: true });
  }
  // Oraciones: ni todas cortísimas (desde A2) ni demasiado largas.
  const sents = sentences(text);
  if (sents.length >= 3) {
    const avg = words / sents.length;
    if (lesson.level !== 'A1' && avg < 7) checks.push({ label: 'Oraciones muy cortas', ok: false, detail: 'Uní algunas con and, but, because o when.', required: false });
    if (avg > 28) checks.push({ label: 'Oraciones muy largas', ok: false, detail: 'Cortá alguna en dos: se entiende mejor.', required: false });
  }
  // Palabras repetidas.
  const freq: Record<string, number> = {};
  for (const w of lower.match(/[a-z']+/g) ?? []) if (!STOP.has(w) && w.length > 3) freq[w] = (freq[w] ?? 0) + 1;
  const rep = Object.entries(freq).filter(([, n]) => n >= Math.max(4, Math.round(words / 30))).map(([w]) => w);
  if (rep.length) checks.push({ label: 'Palabras repetidas', ok: false, detail: `Repetís mucho: ${rep.join(', ')}. Probá un sinónimo o un pronombre (it, they, this).`, required: false });

  checks.push({ label: hard.length ? `Errores típicos: ${hard.length}` : 'Sin errores típicos de hispanohablantes', ok: !hard.length, required: true });
  const passed = checks.every((c) => c.ok || !c.required);
  return { checks, hits, words, connectors: cons, passed };
}

// ───────────────────────────── Ejercicios guiados ─────────────────────────────

/** Huecos de conectores en el modelo: la oración con ___ y opciones de otros grupos (una sola correcta). */
export function connectorGaps(lesson: WritingLesson, rand = Math.random): { prompt: string; options: string[]; answer: number }[] {
  const out: { prompt: string; options: string[]; answer: number }[] = [];
  const used = new Set<string>();
  for (const part of lesson.model.parts) {
    if (part.role === 'greet' || part.role === 'sign') continue;
    for (const s of sentences(part.text)) {
      const found = ALL_CONNECTORS.filter((c) => c.length > 2 || c === 'so')
        .filter((c) => hasPhrase(s, c))
        .sort((a, b) => b.length - a.length)[0];
      if (!found || used.has(found)) continue;
      const grp = groupOf(found);
      if (!grp || grp === 'opinión') continue;
      used.add(found);
      const re = new RegExp(`(^|[^A-Za-z'])(${found.replace(/ /g, '\\s+')})(?![a-z])`, 'i');
      const m = s.match(re)!;
      const original = m[2];
      const prompt = s.replace(re, `$1___`);
      const others = Object.entries(CONNECTOR_GROUPS)
        .filter(([g]) => g !== grp && g !== 'opinión' && g !== 'cierre' && g !== 'condición')
        .map(([, l]) => l.filter((c) => !hasPhrase(s, c)))
        .filter((l) => l.length);
      const picks: string[] = [];
      while (picks.length < 3 && others.length) {
        const l = others.splice(Math.floor(rand() * others.length), 1)[0];
        picks.push(l[Math.floor(rand() * l.length)]);
      }
      const cap = (c: string) => (/^[A-Z]/.test(original) ? c.charAt(0).toUpperCase() + c.slice(1) : c);
      const options = [original, ...picks.map(cap)];
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }
      out.push({ prompt, options, answer: options.indexOf(original) });
    }
  }
  return out.slice(0, 6);
}

/**
 * Piezas para ordenar: oraciones (A1–A2) o párrafos (B1–B2). Saludo y despedida quedan fijos.
 * `slot` = posición que importa: dos piezas con el mismo slot pueden ir en cualquier orden
 * (mismo tipo de parte, sin conector de orden ni pronombre que dependa de la anterior, y fuera de una historia).
 */
export function orderPieces(lesson: WritingLesson): { text: string; slot: string }[] {
  const parts = lesson.model.parts.filter((p) => p.role !== 'greet' && p.role !== 'sign');
  const short = lesson.level === 'A1' || lesson.level === 'A2';
  const raw = parts.flatMap((p, pi) => (short ? sentences(p.text) : [p.text]).map((text) => ({ text, role: p.role, pi })));
  const pieces = raw.slice(0, 8);
  const tied = /^(first|firstly|secondly|then|after|finally|when|in the end|since then|he|she|it|they|this|that|these|but|so|also|however|of course|in my opinion|to sum up|overall)\b/i;
  return pieces.map((p, i) => {
    const free = lesson.genre !== 'story' && (p.role === 'body' || p.role === 'example') && !tied.test(p.text);
    // Se puede intercambiar solo con piezas vecinas del mismo tipo que también estén libres.
    let g = i;
    while (g > 0 && free && pieces[g - 1].role === p.role && lesson.genre !== 'story' && !tied.test(pieces[g - 1].text)) g--;
    return { text: p.text, slot: free ? `${p.role}@${g}` : `#${i}` };
  });
}

/** ¿El orden elegido es válido? Acepta intercambiar piezas que pueden ir en cualquier orden. */
export function orderOk(pieces: { slot: string }[], picked: number[]): boolean {
  return picked.length === pieces.length && picked.every((v, i) => pieces[v].slot === pieces[i].slot);
}

// ───────────────────────────── Progreso ─────────────────────────────

export interface WritingText {
  date: string;
  prompt: string;
  text: string;
  /** Versión reescrita después de la revisión. */
  final?: string;
  words: number;
  passed: boolean;
  errors: string[];
}

export interface WritingProgress {
  /** Pasos guiados hechos (modelo, ordenar, conectores, unir). */
  steps: string[];
  texts: WritingText[];
}

export const progressOf = (s: AppState, id: string): WritingProgress => s.writing?.[id] ?? { steps: [], texts: [] };
export const lessonPassed = (s: AppState, id: string) => progressOf(s, id).texts.some((t) => t.passed);

export function markStep(id: string, step: string) {
  setState((s) => {
    const p = progressOf(s, id);
    if (p.steps.includes(step)) return s;
    return { ...s, writing: { ...(s.writing ?? {}), [id]: { ...p, steps: [...p.steps, step] } } };
  });
}

export function saveText(id: string, t: Omit<WritingText, 'date'>, index?: number) {
  setState((s) => {
    const p = progressOf(s, id);
    const texts = [...p.texts];
    const entry = { ...t, date: today() };
    if (index != null && texts[index]) texts[index] = { ...texts[index], ...entry, date: texts[index].date };
    else texts.push(entry);
    return { ...s, writing: { ...(s.writing ?? {}), [id]: { ...p, texts } } };
  });
}

/** Un nivel se abre cuando aprobaste 3 lecciones del anterior. */
export function levelOpen(s: AppState, level: Level): boolean {
  const i = WRITING_LEVELS.indexOf(level);
  if (i <= 0) return true;
  const prev = WRITING.filter((l) => l.level === WRITING_LEVELS[i - 1]);
  return prev.filter((l) => lessonPassed(s, l.id)).length >= 3;
}

/** Errores típicos que más se repiten en tus textos (para repasar). */
export function frequentErrors(s: AppState = getState()): { id: string; n: number; msg: string; fix?: string }[] {
  const n: Record<string, number> = {};
  for (const p of Object.values(s.writing ?? {})) for (const t of p.texts) for (const e of t.errors) n[e] = (n[e] ?? 0) + 1;
  return Object.entries(n)
    .sort((a, b) => b[1] - a[1])
    .map(([id, k]) => {
      const r = RULES.find((x) => x.id === id);
      return { id, n: k, msg: r?.msg ?? id, fix: r?.fix };
    });
}

/** El siguiente paso sugerido: la primera lección abierta sin aprobar. */
export function nextLesson(s: AppState): WritingLesson | undefined {
  return WRITING.find((l) => levelOpen(s, l.level) && !lessonPassed(s, l.id));
}
