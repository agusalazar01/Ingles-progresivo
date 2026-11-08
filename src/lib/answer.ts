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
    else if (/'d$/.test(w)) opts = [w.replace(/'d$/, ' would'), w.replace(/'d$/, ' had')];
    out = out.flatMap((o) => opts.map((x) => (o ? `${o} ${x}` : x))).slice(0, 64);
  }
  return out;
}

export function matches(given: string, answers: string[]): boolean {
  const g = variants(normalize(given));
  return answers.some((a) => {
    const av = variants(normalize(a));
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
  const g = normalize(given);
  if (g.length < 4) return false;
  return answers.some((a) => levenshtein(g, normalize(a)) === 1);
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
  }
  return [...out];
}
