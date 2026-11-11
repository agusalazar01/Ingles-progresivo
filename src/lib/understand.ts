import { Capacitor } from '@capacitor/core';
import { aiAvailable, aiStatus, removePack, startDownload } from './ai';
import { Embedder, vocabFromTokenizerJson } from './semantic';

/**
 * Paquete «Entender lo que quisiste decir»: el modelo all-MiniLM-L6-v2 cuantizado (23 MB, Apache-2.0),
 * tal como se publica en npm. Se baja una vez y funciona sin internet.
 */
const MB = 1024 * 1024;
export const MEANING_PACK = {
  id: 'meaning-minilm',
  title: 'Entender lo que quisiste decir',
  mb: 23,
  license: 'all-MiniLM-L6-v2 (Microsoft / sentence-transformers): Apache 2.0.',
  files: [{ url: 'https://registry.npmjs.org/@ryanstark24/sfgraph-models/-/sfgraph-models-1.7.0.tgz', name: 'model.tgz', size: 23 * MB }],
};

export type MeaningState = 'web' | 'missing' | 'ready';

export async function meaningState(): Promise<MeaningState> {
  if (!aiAvailable()) return 'web';
  try {
    const st = await aiStatus();
    return MEANING_PACK.id in st.installed && (st.files?.[MEANING_PACK.id] ?? []).includes('model') ? 'ready' : 'missing';
  } catch {
    return 'missing';
  }
}

export const downloadMeaning = () => startDownload(MEANING_PACK);
export async function removeMeaning() {
  releaseMeaning();
  await removePack(MEANING_PACK.id);
}

let loading: Promise<Embedder | null> | null = null;
let release: (() => void) | null = null;

/** Carga el modelo (si está bajado). Queda en memoria hasta releaseMeaning(). */
export function loadMeaning(): Promise<Embedder | null> {
  if (loading) return loading;
  loading = (async () => {
    if ((await meaningState()) !== 'ready') return null;
    const st = await aiStatus();
    const dir = `${st.root}/${MEANING_PACK.id}/model/`;
    const url = (f: string) => Capacitor.convertFileSrc(`file://${dir}${f}`);
    const ort = await import('onnxruntime-web/wasm');
    ort.env.wasm.wasmPaths = `${import.meta.env.BASE_URL}ort/`;
    ort.env.wasm.numThreads = 1;
    const [model, tok] = await Promise.all([fetch(url('model_quantized.onnx')).then((r) => r.arrayBuffer()), fetch(url('tokenizer.json')).then((r) => r.json())]);
    const session = await ort.InferenceSession.create(new Uint8Array(model), { executionProviders: ['wasm'] });
    release = () => void session.release().catch(() => {});
    return new Embedder(ort as never, session as never, vocabFromTokenizerJson(tok));
  })().catch(() => {
    loading = null;
    return null;
  });
  return loading;
}

export function releaseMeaning() {
  release?.();
  release = null;
  loading = null;
}

// ───────────── Sinónimos (sin modelo, siempre activos) ─────────────

/** Palabras que en una charla valen lo mismo. La primera es la «canónica». */
const SYN: string[][] = [
  ['yes', 'yeah', 'yep', 'yup', 'sure', 'of course', 'definitely', 'absolutely', 'sounds good', 'that would be great', 'please do', 'why not'],
  ['no', 'nah', 'nope', 'not really', 'no thanks', "i'm good", "i'm fine", 'all good'],
  ['ok', 'okay', 'alright', 'all right', 'no worries', 'no problem', 'fine', 'got it', 'righto'],
  ['thanks', 'thank you', 'cheers', 'ta', 'much appreciated', 'appreciate it'],
  ['hello', 'hi', 'hey', "g'day", 'good morning', 'good afternoon', 'good evening'],
  ['bye', 'goodbye', 'see you', 'see ya', 'catch you later', 'have a good one'],
  ['sorry', 'excuse me', 'pardon'],
  ['luggage', 'baggage', 'bags', 'bag', 'suitcase', 'suitcases'],
  ['toilet', 'bathroom', 'restroom', 'loo', 'toilets'],
  ['buy', 'get', 'purchase', 'grab', 'pick up'],
  ['want', 'would like', "i'd like", 'need', 'looking for', 'after'],
  ['how much', 'what is the price', "what's the price", 'how much does it cost', 'what does it cost', 'cost', 'price'],
  ['job', 'work', 'position', 'role', 'gig'],
  ['flat', 'apartment', 'unit', 'place'],
  ['car', 'ute', 'vehicle'],
  ['doctor', 'gp', 'physician'],
  ['money', 'cash', 'dollars', 'bucks'],
  ['friend', 'mate'],
  ['big', 'large'],
  ['small', 'little'],
  ['help', 'give me a hand', 'assist'],
  ['start', 'begin'],
  ['finish', 'end', 'wrap up'],
  ['call', 'ring', 'phone'],
  ['book', 'reserve', 'make a booking', 'make a reservation'],
  ['ticket', 'tickets', 'fare'],
  ['the bill', 'the check'],
  ['receipt', 'docket'],
  ['petrol', 'gas', 'fuel'],
  ['mobile', 'cell phone', 'phone'],
  ['holiday', 'vacation', 'holidays'],
  ['afternoon', 'arvo'],
  ['breakfast', 'brekkie'],
];

const esc = (x: string) => x.replace(/[.*+?^${}()|[\]\\']/g, (m) => (m === "'" ? "'" : `\\${m}`));

/** Formas extra de lo que dijiste cambiando sinónimos por la palabra canónica (y la canónica por las demás). */
export function synonymForms(said: string, limit = 12): string[] {
  const base = ` ${said.toLowerCase().replace(/[’]/g, "'").replace(/[.,!?]/g, ' ').replace(/\s+/g, ' ').trim()} `;
  const out = new Set<string>();
  for (const group of SYN)
    for (const w of group) {
      const re = new RegExp(` ${esc(w)} `, 'g');
      if (!re.test(base)) continue;
      for (const other of group) if (other !== w) out.add(base.replace(new RegExp(` ${esc(w)} `, 'g'), ` ${other} `).trim());
      if (out.size >= limit) return [...out];
    }
  return [...out];
}
