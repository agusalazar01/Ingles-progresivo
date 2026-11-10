/** Normaliza una respuesta para compararla: minúsculas, apóstrofos, contracciones expandidas, sin puntuación final. */
export function normalize(s: string): string {
  let t = s
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[.!?¿¡,;:"]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  t = t
    .replace(/\bgonna\b/g, 'going to')
    .replace(/\bcan't\b/g, 'can not')
    .replace(/\bcannot\b/g, 'can not')
    .replace(/\bwon't\b/g, 'will not')
    .replace(/\bshan't\b/g, 'shall not')
    .replace(/n't\b/g, ' not')
    .replace(/'m\b/g, ' am')
    .replace(/'re\b/g, ' are')
    .replace(/'ve\b/g, ' have')
    .replace(/'ll\b/g, ' will')
    // he's / she's / it's: se acepta 'is' o 'has' comparando ambas variantes más abajo
    .replace(/\s+/g, ' ')
    .trim();
  return t;
}

/** Variantes de una respuesta normalizada para resolver 's (is/has) y 'd (would/had). */
export function variants(t: string): string[] {
  // Cada aparición se expande por separado: "I'd known, I'd have" → had ... would.
  let out = [''];
  for (const w of t.split(' ')) {
    let opts = [w];
    const s = w.match(/^(he|she|it|that|there|what|who|where)'s$/);
    if (s) opts = [`${s[1]} is`, `${s[1]} has`];
    else if (w === "'s") opts = ['is', 'has'];
    else if (w === "let's") opts = ['let us'];
    // «My brother's working» = «My brother is working» (y se deja también como posesivo).
    else if (/^[a-z]+'s$/.test(w)) opts = [w, `${w.slice(0, -2)} is`, `${w.slice(0, -2)} has`];
    else if (/'d$/.test(w)) opts = [w.replace(/'d$/, ' would'), w.replace(/'d$/, ' had')];
    out = out.flatMap((o) => opts.map((x) => (o ? `${o} ${x}` : x))).slice(0, 64);
  }
  return out;
}

const NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const THAT_VERBS = 'say|says|said|tell|tells|told|think|thinks|thought|know|knows|knew|hope|hopes|hoped|believe|believes|believed|realise|realised|promise|promised|sure|glad|afraid|explained|mean|means|meant|feel|feels|felt|heard|wish';
const THAT_NEXT = 'i|you|he|she|it|we|they|there|the|my|your|his|her|our|their|this|these|those|a|an|some|no|nothing|everything|someone|everyone';
const OUR = 'colo|favo|neighbo|flavo|hono|labo|harbo|behavio|humo|rumo';

/**
 * Deja en una sola forma lo que es igual de correcto escrito de dos maneras, para no marcar mal una
 * respuesta buena: ortografía de EE. UU. o británica (color / colour, realize / realise, traveling /
 * travelling), números en cifras o en letras (8 / eight), OK / okay y «do not» / «don't».
 */
export function canon(t: string): string {
  return t
    .replace(new RegExp(`\\b(${OUR})r(s|ed|ing|ite|ites|ful|hood)?\\b`, 'g'), '$1ur$2')
    .replace(/\b(\w{3,})iz(e|es|ed|ing|ation|ations)\b/g, '$1is$2')
    .replace(/\b(travel|cancel|model|label)(ed|ing|er|ers)\b/g, '$1l$2')
    .replace(/\b(cent|theat|lit|met)er(s)?\b/g, (m, a, b) => (a === 'met' ? m : `${a}re${b ?? ''}`))
    .replace(/\bgray\b/g, 'grey')
    .replace(/\bmom\b/g, 'mum')
    .replace(/\bokay\b/g, 'ok')
    .replace(/\balright\b/g, 'all right')
    .replace(/\b(every|some|any)body\b/g, '$1one')
    .replace(/\bnobody\b/g, 'no one')
    .replace(/\btill\b/g, 'until')
    .replace(/\blots of\b/g, 'a lot of')
    .replace(/\b(television|telly)\b/g, 'tv')
    .replace(/\be-mail(s)?\b/g, 'email$1')
    .replace(/\bmovie(s)?\b/g, 'film$1')
    .replace(/\b(have|has|had) got\b/g, '$1')
    .replace(/\b(\d+)(st|nd|rd|th)\b/g, '$1')
    // «that» optativo: «She said (that) she was busy», «I think (that) it is late».
    .replace(new RegExp(`\\b(${THAT_VERBS})( me| you| him| her| us| them)? that (?=(${THAT_NEXT})\\b)`, 'g'), '$1$2 ')
    // «please» no cambia si la oración está bien.
    .replace(/\bplease\b/g, '')
    .replace(/-/g, ' ')
    .replace(/\bo'clock\b/g, '')
    .replace(/\b(\d|1[0-2])\b/g, (d) => NUM[Number(d)])
    .replace(/\s+/g, ' ')
    .trim();
}

const TIME_WORD = 'yesterday|tomorrow|today|tonight|now|right now|at the moment|currently|usually|sometimes|normally|nowadays|these days|every \\w+|last \\w+|next \\w+|this (?:morning|afternoon|evening|week|weekend|month|year|summer|winter)|on \\w+days?|on the weekend|at the weekend|on weekends|in the (?:morning|afternoon|evening)|at night|at \\w+(?: o\'clock)?|by \\w+(?: \\w+)?|in \\d{4}|in \\w+ (?:minutes|hours|days|weeks|months|years)|\\w+ (?:minutes|hours|days|weeks|months|years) ago|this time tomorrow|tomorrow at this time|tomorrow \\w+';
const CLAUSE_WORD = 'if|when|while|although|even though|though|unless|because|since|as soon as|after|before|by the time|despite|in spite of|until|once';
const lower1 = (x: string) => (/^I\b/.test(x) ? x : x.charAt(0).toLowerCase() + x.slice(1));
const upper1 = (x: string) => x.charAt(0).toUpperCase() + x.slice(1);

/**
 * Otras maneras igual de correctas de ordenar la misma oración, para no marcar mal una respuesta buena:
 * «If it rains, we will stay home» = «We will stay home if it rains» y «Yesterday I went» = «I went yesterday».
 */
export function reorderings(answer: string): string[] {
  const out: string[] = [];
  const end = answer.match(/[.!?]+$/)?.[0] ?? '';
  const body = answer.slice(0, answer.length - end.length).trim();
  if (/[.!?;]/.test(body)) return out; // dos oraciones: no se toca
  const isQ = end.includes('?');
  // Subordinada adelante con coma → al final sin coma.
  const cl = body.match(new RegExp(`^((?:${CLAUSE_WORD})\\b[^,]+), (.+)$`, 'i'));
  if (cl && !isQ && !/,/.test(cl[2])) out.push(`${upper1(cl[2])} ${lower1(cl[1])}${end}`);
  // Subordinada al final → adelante.
  if (!cl && !isQ && !/,/.test(body)) {
    const back = body.match(new RegExp(`^(.+?) ((?:${CLAUSE_WORD}) .+)$`, 'i'));
    if (back && back[1].split(' ').length >= 2 && back[2].split(' ').length >= 3 && !/^(if|when|while|because|after|before|since|until|once)$/i.test(back[1].split(' ').pop()!))
      out.push(`${upper1(back[2])}, ${lower1(back[1])}${end}`);
  }
  // Expresión de tiempo adelante → al final, y al revés.
  if (!isQ) {
    const front = body.match(new RegExp(`^(${TIME_WORD}),? (.+)$`, 'i'));
    if (front && !cl && front[2].split(' ').length >= 2 && /^(i|you|he|she|it|we|they|the|my|your|his|her|our|their|this|that|there|[A-Z])/i.test(front[2]) && !/^(is|are|was|were|will|do|does|did|have|has|had)\b/i.test(front[2]))
      out.push(`${upper1(front[2])} ${lower1(front[1])}${end}`);
    const tail = body.match(new RegExp(`^(.+) (${TIME_WORD})$`, 'i'));
    if (tail && !cl && !/,/.test(tail[1]) && tail[1].split(' ').length >= 2 && !/^(yesterday|tomorrow|today|now|every|last|next|this|usually|sometimes)/i.test(body))
      out.push(`${upper1(tail[2])} ${lower1(tail[1])}${end}`);
  }
  return out;
}

export function matches(given: string, answers: string[]): boolean {
  const g = variants(canon(normalize(given)));
  answers = [...answers, ...answers.flatMap(reorderings)];
  return answers.some((a) => {
    const av = variants(canon(normalize(a)));
    return g.some((x) => av.includes(x));
  });
}

function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
}

/** ¿Está a una letra de una respuesta válida? (probable error de tipeo) */
export function nearMiss(given: string, answers: string[]): boolean {
  const g = canon(normalize(given));
  if (g.length < 4) return false;
  return answers.some((a) => levenshtein(g, canon(normalize(a))) === 1);
}

/**
 * Al pasar a pregunta, los bancos cambian de persona como si le preguntaras a otro («My mates are…» →
 * «Are your mates…?»). Pero mantener la persona también es correcto («Are my mates…?»), así que se aceptan las dos.
 */
export function samePersonVariants(prompt: string, answers: string[]): string[] {
  const p = ` ${normalize(prompt)} `;
  const out = new Set(answers);
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  for (const a of answers) {
    let v = a;
    if (/ my /.test(p)) v = v.replace(/\byour\b/g, 'my').replace(/\bYour\b/g, 'My');
    else if (/ our /.test(p)) v = v.replace(/\byour\b/g, 'our').replace(/\bYour\b/g, 'Our');
    if (/ mine /.test(p)) v = v.replace(/\byours\b/g, 'mine');
    else if (/ ours /.test(p)) v = v.replace(/\byours\b/g, 'ours');
    // Sujeto: «I am…» → «Am I…?» y «We are…» → «Are we…?» además de «Are you…?».
    const subj = p.match(/^ (i|we) /)?.[1];
    if (subj) {
      const m = v.match(/^(\w+) you\b/i);
      if (m) {
        const aux = m[1].toLowerCase();
        const verb = subj === 'i' && aux === 'are' ? 'am' : subj === 'i' && aux === "weren't" ? "wasn't" : subj === 'i' && aux === 'were' ? 'was' : aux;
        v = cap(`${verb} ${subj === 'i' ? 'I' : 'we'}${v.slice(m[0].length)}`);
      }
    }
    out.add(v);
    // Y al revés: si la respuesta deja «I»/«we» («Do I send…?»), también vale preguntarle al otro («Do you send…?»).
    const own = a.match(/^(\w+) (I|we)\b/);
    if (own) {
      const aux = own[1].toLowerCase();
      const toYou: Record<string, string> = { am: 'are', was: 'were', "wasn't": "weren't" };
      out.add(
        cap(`${toYou[aux] ?? aux} you${a.slice(own[0].length)}`)
          .replace(/\b(my|our)\b/g, 'your')
          .replace(/\b(mine|ours)\b/g, 'yours'),
      );
    }
  }
  // Futuro: «will» y «going to» valen los dos.
  for (const a of [...out]) {
    const g = a.match(/^(.*?)\b(am|is|are|'m|'s|'re) going to\b(.*)$/i);
    if (g) out.add(`${g[1]}will${g[3]}`);
    const w = a.match(/^(.*?)\bwill\b(.*)$/i);
    if (w && w[1].trim() && !/^\s*(be|have)\b/i.test(w[2])) {
      const subj = w[1].trim().toLowerCase();
      const be = subj === 'i' ? 'am' : /^(you|we|they)$/.test(subj) || / and /.test(subj) || /s$/.test(subj) ? 'are' : 'is';
      out.add(`${w[1]}${be} going to${w[2]}`);
    }
  }
  return [...out];
}
