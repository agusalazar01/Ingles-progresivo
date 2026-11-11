/**
 * Entender lo que quisiste decir aunque uses otras palabras, sin internet: el modelo all-MiniLM-L6-v2
 * (23 MB, Apache-2.0) convierte cada frase en un vector de significado; dos frases que dicen lo mismo
 * quedan cerca. Corre en el teléfono (WebAssembly) y solo mientras estás en un roleplay.
 */

// ───────────── Tokenizador (WordPiece de BERT, en minúsculas) ─────────────

export interface Vocab {
  ids: Map<string, number>;
  cls: number;
  sep: number;
  unk: number;
}

export function vocabFromTokenizerJson(json: { model: { vocab: Record<string, number> } }): Vocab {
  const ids = new Map(Object.entries(json.model.vocab));
  return { ids, cls: ids.get('[CLS]')!, sep: ids.get('[SEP]')!, unk: ids.get('[UNK]')! };
}

const isPunct = (ch: string) => /[!-/:-@[-`{-~]/.test(ch) || /\p{P}/u.test(ch);

function basicSplit(text: string): string[] {
  const t = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’‘]/g, "'");
  const out: string[] = [];
  for (const w of t.split(/\s+/)) {
    let cur = '';
    for (const ch of w) {
      if (isPunct(ch)) {
        if (cur) out.push(cur);
        out.push(ch);
        cur = '';
      } else cur += ch;
    }
    if (cur) out.push(cur);
  }
  return out;
}

export function tokenize(text: string, v: Vocab, max = 64): number[] {
  const ids = [v.cls];
  for (const word of basicSplit(text)) {
    if (word.length > 100) {
      ids.push(v.unk);
      continue;
    }
    const pieces: number[] = [];
    let start = 0;
    let bad = false;
    while (start < word.length) {
      let end = word.length;
      let id: number | undefined;
      while (start < end) {
        const sub = (start > 0 ? '##' : '') + word.slice(start, end);
        id = v.ids.get(sub);
        if (id !== undefined) break;
        end--;
      }
      if (id === undefined) {
        bad = true;
        break;
      }
      pieces.push(id);
      start = end;
    }
    ids.push(...(bad ? [v.unk] : pieces));
    if (ids.length >= max - 1) break;
  }
  ids.length = Math.min(ids.length, max - 1);
  ids.push(v.sep);
  return ids;
}

// ───────────── Vectores ─────────────

/** Promedio de los vectores de las palabras (sin relleno) y normalizado: así se compara con un producto punto. */
export function meanPool(hidden: Float32Array, len: number, dim: number): Float32Array {
  const out = new Float32Array(dim);
  for (let t = 0; t < len; t++) for (let d = 0; d < dim; d++) out[d] += hidden[t * dim + d];
  let norm = 0;
  for (let d = 0; d < dim; d++) {
    out[d] /= len;
    norm += out[d] * out[d];
  }
  norm = Math.sqrt(norm) || 1;
  for (let d = 0; d < dim; d++) out[d] /= norm;
  return out;
}

export const cosine = (a: Float32Array, b: Float32Array) => {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
};

/** Lo que hace falta del motor ONNX (onnxruntime-web en la app, onnxruntime-node en las pruebas). */
export interface OrtLike {
  Tensor: new (type: 'int64', data: BigInt64Array, dims: number[]) => unknown;
}
export interface SessionLike {
  run(feeds: Record<string, unknown>): Promise<Record<string, { data: unknown; dims: readonly number[] }>>;
}

export class Embedder {
  private cache = new Map<string, Float32Array>();
  private ort: OrtLike;
  private session: SessionLike;
  private vocab: Vocab;
  constructor(ort: OrtLike, session: SessionLike, vocab: Vocab) {
    this.ort = ort;
    this.session = session;
    this.vocab = vocab;
  }

  async embed(text: string): Promise<Float32Array> {
    const key = text.trim().toLowerCase();
    const hit = this.cache.get(key);
    if (hit) return hit;
    const ids = tokenize(key, this.vocab);
    const n = ids.length;
    const t = (a: number[]) => new this.ort.Tensor('int64', BigInt64Array.from(a.map((x) => BigInt(x))), [1, n]);
    const out = await this.session.run({ input_ids: t(ids), attention_mask: t(ids.map(() => 1)), token_type_ids: t(ids.map(() => 0)) });
    const h = out.last_hidden_state ?? Object.values(out)[0];
    const vec = meanPool(h.data as Float32Array, n, h.dims[2] as number);
    if (this.cache.size > 500) this.cache.clear();
    this.cache.set(key, vec);
    return vec;
  }

  async similarity(a: string, b: string) {
    return cosine(await this.embed(a), await this.embed(b));
  }
}

// ───────────── Elegir la opción del guion ─────────────

/** Frases de ejemplo de una opción a partir de sus patrones: 'open|new + account' → «open account», «new account». */
export function patternExamples(match: string[], limit = 6): string[] {
  const groups = match.map((g) =>
    g
      .split('|')
      .map((a) => a.trim())
      .filter((a) => a && a !== '*' && a !== '[0-9]' && !a.startsWith('-')),
  );
  if (groups.some((g) => !g.length)) return [];
  let combos: string[] = [''];
  for (const g of groups) {
    combos = combos.flatMap((c) => g.slice(0, 3).map((a) => `${c} ${a}`.trim()));
    if (combos.length > 40) combos = combos.slice(0, 40);
  }
  return combos.slice(0, limit);
}

export interface Candidate {
  /** Índice de la opción. */
  option: number;
  examples: string[];
}

export interface SemanticPick {
  option: number;
  score: number;
  /** Diferencia con la segunda mejor opción (si es chica, la respuesta es ambigua). */
  margin: number;
}

/** Umbrales calibrados con frases de los roleplays (ver semantic.test.ts). */
export const SEM_ACCEPT = 0.6;
export const SEM_MARGIN = 0.06;
/** Por debajo de esto, lo que dijiste no tiene que ver con el momento de la charla. */
export const SEM_OFFTOPIC = 0.3;

export async function pickByMeaning(emb: Embedder, said: string, cands: Candidate[]): Promise<{ best: SemanticPick | null; top: number }> {
  const scores: { option: number; score: number }[] = [];
  for (const c of cands) {
    let best = -1;
    for (const ex of c.examples) best = Math.max(best, await emb.similarity(said, ex));
    if (c.examples.length) scores.push({ option: c.option, score: best });
  }
  scores.sort((a, b) => b.score - a.score);
  const top = scores[0]?.score ?? 0;
  if (!scores.length || top < SEM_ACCEPT) return { best: null, top };
  const margin = top - (scores[1]?.score ?? 0);
  if (scores.length > 1 && margin < SEM_MARGIN) return { best: null, top };
  return { best: { option: scores[0].option, score: top, margin }, top };
}
