import { aiAvailable, aiStatus, OliverAi, removePack, startDownload } from './ai';

/**
 * Corrector de textos sin internet: el modelo Proofread de Google (200 millones de parámetros, MediaPipe).
 * Hace una sola cosa: devuelve tu texto corregido (ortografía, gramática y algo de estilo). Se baja una vez,
 * se carga solo en «Escribir en inglés» y se libera al salir.
 */
const MB = 1024 * 1024;
export const PROOF_PACK = {
  id: 'proofread-200m',
  title: 'Corrector de textos (Google Proofread)',
  mb: 200,
  file: 'proofread_quant_200m.litertlm',
  license: 'Términos de uso de Gemma (Google): gratis, también para apps.',
  files: [
    {
      url: 'https://storage.googleapis.com/mediapipe-models/text_proofreader/gemma_200m/latest/proofread_quant_200m.litertlm',
      name: 'proofread_quant_200m.litertlm',
      size: 200 * MB,
    },
  ],
};

export type ProofState = 'web' | 'missing' | 'ready';

export async function proofState(): Promise<ProofState> {
  if (!aiAvailable()) return 'web';
  try {
    const st = await aiStatus();
    return PROOF_PACK.id in st.installed ? 'ready' : 'missing';
  } catch {
    return 'missing';
  }
}

export const downloadProof = () => startDownload(PROOF_PACK);
export const removeProof = () => removePack(PROOF_PACK.id);
export const unloadProof = () => (aiAvailable() ? OliverAi.unloadProofreader().catch(() => {}) : Promise.resolve());

export async function proofread(text: string): Promise<{ text: string; ms: number }> {
  return OliverAi.proofread({ id: PROOF_PACK.id, file: PROOF_PACK.file, text });
}

// ───────────────────────────── Comparar original y corrección ─────────────────────────────

export interface DiffPart {
  type: 'same' | 'del' | 'ins';
  text: string;
}

const tokens = (s: string) => s.match(/\S+/g) ?? [];

/** Diferencias palabra por palabra (subsecuencia común más larga). */
export function diffWords(a: string, b: string): DiffPart[] {
  const x = tokens(a);
  const y = tokens(b);
  const n = x.length;
  const m = y.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = x[i] === y[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out: DiffPart[] = [];
  const push = (type: DiffPart['type'], text: string) => {
    const last = out[out.length - 1];
    if (last && last.type === type) last.text += ' ' + text;
    else out.push({ type, text });
  };
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (x[i] === y[j]) {
      push('same', x[i]);
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) push('del', x[i++]);
    else push('ins', y[j++]);
  }
  while (i < n) push('del', x[i++]);
  while (j < m) push('ins', y[j++]);
  return out;
}

export interface ProofEdit {
  from: string;
  to: string;
  /** Unas palabras de antes, para ubicarlo en tu texto. */
  before: string;
  /** Solo puntuación o mayúsculas. */
  minor: boolean;
}

const bare = (s: string) => s.toLowerCase().replace(/[^a-z0-9' ]/g, '').replace(/\s+/g, ' ').trim();

/** Los cambios del corrector, agrupados: «from» lo que escribiste, «to» cómo queda. */
export function proofEdits(original: string, corrected: string): ProofEdit[] {
  const parts = diffWords(original, corrected);
  const edits: ProofEdit[] = [];
  for (let k = 0; k < parts.length; k++) {
    const p = parts[k];
    if (p.type === 'same') continue;
    let from = '';
    let to = '';
    const prev = parts[k - 1]?.type === 'same' ? parts[k - 1].text.split(' ').slice(-3).join(' ') : '';
    while (k < parts.length && parts[k].type !== 'same') {
      if (parts[k].type === 'del') from += (from ? ' ' : '') + parts[k].text;
      else to += (to ? ' ' : '') + parts[k].text;
      k++;
    }
    k--;
    edits.push({ from, to, before: prev, minor: bare(from) === bare(to) });
  }
  return edits;
}

/** Si el corrector cambió más de la mitad del texto, lo reescribió en vez de corregirlo: no se usa para aprobar. */
export function isRewrite(original: string, corrected: string): boolean {
  const same = diffWords(original, corrected)
    .filter((p) => p.type === 'same')
    .reduce((n, p) => n + p.text.split(' ').length, 0);
  return same < tokens(original).length * 0.5;
}
