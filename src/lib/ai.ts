import { Capacitor, registerPlugin, type PluginListenerHandle } from '@capacitor/core';
import { getState } from './store';

/**
 * IA sin internet y gratis para la llamada con Oliver.
 *
 * Tres piezas, cada una opcional y descargable desde Ajustes › Voces e IA:
 * - Voz de Oliver (Piper australiano o Kokoro), con sherpa-onnx.
 * - Oído (Moonshine Tiny), con sherpa-onnx.
 * - Charla (LFM2.5 o Qwen3), con LiteRT-LM de Google.
 *
 * Se bajan una sola vez y después funcionan sin conexión. Solo se cargan en memoria al atender la
 * llamada y se liberan al cortar: fuera de la llamada no usan procesador, memoria ni batería.
 * Lo que decís se procesa en el teléfono y no se manda a ningún lado.
 */
interface OliverAiPlugin {
  status(): Promise<AiStatus>;
  download(o: { id: string; files: { url: string; name: string; size: number }[] }): Promise<void>;
  cancelDownload(o: { id: string }): Promise<void>;
  remove(o: { id: string }): Promise<void>;
  readText(o: { id: string; name: string }): Promise<{ text: string }>;
  loadVoice(o: { id: string; kind: string; espeak: string; noise?: number; noiseW?: number }): Promise<{ speakers: number; sampleRate: number }>;
  speak(o: { text: string; speaker: number; speed?: number; pitch?: number; volume?: number; reference?: string } & AudioTest): Promise<AudioDiag>;
  recordReference(o: { id: string; seconds: number }): Promise<{ seconds: number }>;
  stopSpeaking(): Promise<void>;
  loadEar(o: { id: string; kind?: string }): Promise<void>;
  listen(o: { maxMs?: number; silenceMs?: number; waitMs?: number; language?: string }): Promise<{ text: string }>;
  stopListening(): Promise<void>;
  loadBrain(o: { id: string; file: string; system: string; temperature?: number }): Promise<void>;
  resetChat(o: { system: string; temperature?: number }): Promise<void>;
  chat(o: { text: string }): Promise<{ text: string }>;
  cancelChat(): Promise<void>;
  unloadAll(): Promise<void>;
  addListener(event: 'download', fn: (e: { id: string; progress?: number; done?: boolean; error?: string }) => void): Promise<PluginListenerHandle>;
  addListener(event: 'token', fn: (e: { text: string }) => void): Promise<PluginListenerHandle>;
  addListener(event: 'level', fn: (e: { level: number }) => void): Promise<PluginListenerHandle>;
  addListener(event: 'speechStart', fn: () => void): Promise<PluginListenerHandle>;
  addListener(event: 'recording', fn: (e: { progress: number }) => void): Promise<PluginListenerHandle>;
}

/** Pruebas del laboratorio de audio (de a una variable por vez). */
export interface AudioTest {
  /** Sin el procesamiento shape() (filtro, suavizado y volumen). */
  raw?: boolean;
  /** Sin PlaybackParams (tono). */
  noParams?: boolean;
  /** Tamaño del búfer en ms (0 = el normal, ~200 ms). */
  bufferMs?: number;
  /** Reproducir en PCM de 16 bits en vez de float. */
  pcm16?: boolean;
  /** Guardar el audio crudo del motor en Descargas/CriollEnglish. */
  save?: boolean;
  /** Otro canal de audio (asistente), por si el teléfono le aplica efectos al de multimedia. */
  assistant?: boolean;
}

/** Lo que informa el teléfono después de hablar. */
export interface AudioDiag {
  engine?: string;
  sampleRate?: number;
  trackRate?: number;
  deviceRate?: number;
  format?: string;
  bufferMs?: number;
  underruns?: number;
  writeErrors?: number;
  audioMs?: number;
  genMs?: number;
  peak?: number;
  clipped?: number;
  badSamples?: number;
  shape?: boolean;
  playbackParams?: boolean;
  output?: string;
  saved?: string;
  log?: string;
}

export interface AiStatus {
  installed: Record<string, number>;
  /** Archivos de cada paquete bajado. */
  files?: Record<string, string[]>;
  freeBytes: number;
  loaded: string[];
  /** Si la app se cerró de golpe usando la IA: en qué paso. */
  crashed?: string | null;
}

export const OliverAi = registerPlugin<OliverAiPlugin>('OliverAi');

/** La IA solo existe en la app de Android (en la web se usa la voz y el micrófono del navegador). */
export const aiAvailable = () => Capacitor.getPlatform() === 'android';

export type PackKind = 'voice' | 'ear' | 'brain';
export interface Pack {
  id: string;
  kind: PackKind;
  title: string;
  desc: string;
  /** Tamaño aproximado en MB. */
  mb: number;
  files: { url: string; name: string; size: number }[];
  engine?: 'piper' | 'kokoro' | 'supertonic' | 'pocket';
  /** Reconocimiento de voz: motor y si entiende español. */
  asr?: 'moonshine' | 'parakeet' | 'qwen3';
  spanish?: boolean;
  espeak?: string;
  /** Voces fijas (Kokoro). Piper las lee de speakers.json. */
  speakers?: { id: number; name: string }[];
  /** Archivo del modelo de charla. */
  file?: string;
  license: string;
}

const REL = 'https://github.com/agusalazar01/Ingles-progresivo/releases/download/modelos-6/';

/**
 * Voces australianas de Pocket TTS: grabaciones reales de narradores australianos de LibriVox (dominio público),
 * con el acento verificado. Ordenadas de la más grave/rústica a la más clara.
 */
export const POCKET_VOICES: { file: string; name: string }[] = [
  { file: 'ref-howard-skyman-2.wav', name: 'Howard Skyman 2 · grave y claro' },
  { file: 'ref-howard-skyman-1.wav', name: 'Howard Skyman 1 · más grave' },
  { file: 'ref-howard-skyman-3.wav', name: 'Howard Skyman 3 · el más grave' },
  { file: 'ref-son-of-the-exiles-2.wav', name: 'Son of the Exiles 2 · más áspero' },
  { file: 'ref-son-of-the-exiles-1.wav', name: 'Son of the Exiles 1' },
  { file: 'ref-son-of-the-exiles-3.wav', name: 'Son of the Exiles 3' },
  { file: 'ref-algy-pug-3.wav', name: 'Algy Pug 3' },
  { file: 'ref-algy-pug-2.wav', name: 'Algy Pug 2' },
  { file: 'ref-algy-pug-1.wav', name: 'Algy Pug 1' },
  { file: 'ref-timothy-ferguson-3.wav', name: 'Timothy Ferguson 3' },
  { file: 'ref-timothy-ferguson-2.wav', name: 'Timothy Ferguson 2' },
  { file: 'ref-timothy-ferguson-1.wav', name: 'Timothy Ferguson 1 · el más claro' },
];
const HF = 'https://huggingface.co/litert-community/';
const MB = 1024 * 1024;

export const PACKS: Pack[] = [
  {
    id: 'piper-au',
    kind: 'voice',
    engine: 'piper',
    espeak: 'en-gb-x-rp',
    title: 'Piper australiano',
    desc: 'Acento australiano de verdad: 10 narradores australianos de LibriVox. Liviana y rápida.',
    mb: 74,
    license: 'Grabaciones de dominio público (LibriVox); código CC0.',
    files: [
      { url: REL + 'piper-au-model.onnx', name: 'model.onnx', size: 74 * MB },
      { url: REL + 'piper-au-tokens2.txt', name: 'tokens2.txt', size: 1 },
      { url: REL + 'piper-au-speakers.json', name: 'speakers.json', size: 1 },
    ],
  },
  {
    id: 'kokoro',
    kind: 'voice',
    engine: 'kokoro',
    espeak: 'en',
    title: 'Kokoro',
    desc: 'La voz más natural, pero con acento británico o estadounidense (no tiene australiano). Un poco más lenta.',
    mb: 134,
    license: 'Apache-2.0.',
    speakers: [
      { id: 9, name: 'George (británico)' },
      { id: 10, name: 'Lewis (británico)' },
      { id: 5, name: 'Adam (estadounidense)' },
      { id: 6, name: 'Michael (estadounidense)' },
    ],
    files: [
      { url: REL + 'kokoro-model.onnx', name: 'model.onnx', size: 128 * MB },
      { url: REL + 'kokoro-voices.bin', name: 'voices.bin', size: 6 * MB },
      { url: REL + 'kokoro-tokens.txt', name: 'tokens.txt', size: 1 },
    ],
  },
  {
    id: 'supertonic',
    kind: 'voice',
    engine: 'supertonic',
    title: 'Supertonic 3',
    desc: 'Muy rápida y clara, con 10 voces (de hombre y de mujer: probalas con ▶). Acento estadounidense. Lee el texto tal cual, sin pasar por fonemas.',
    mb: 110,
    license: 'OpenRAIL-M (modelo) y MIT (código).',
    speakers: Array.from({ length: 10 }, (_, i) => ({ id: i, name: `Voz ${i + 1}` })),
    files: [
      { url: REL + 'supertonic-duration_predictor.onnx', name: 'duration_predictor.onnx', size: 3 * MB },
      { url: REL + 'supertonic-text_encoder.onnx', name: 'text_encoder.onnx', size: 30 * MB },
      { url: REL + 'supertonic-vector_estimator.onnx', name: 'vector_estimator.onnx', size: 60 * MB },
      { url: REL + 'supertonic-vocoder.onnx', name: 'vocoder.onnx', size: 20 * MB },
      { url: REL + 'supertonic-tts.json', name: 'tts.json', size: 1 },
      { url: REL + 'supertonic-unicode_indexer.bin', name: 'unicode_indexer.bin', size: 1 * MB },
      { url: REL + 'supertonic-voice.bin', name: 'voice.bin', size: 1 * MB },
    ],
  },
  {
    id: 'pocket',
    kind: 'voice',
    engine: 'pocket',
    title: 'Pocket TTS (imita una voz)',
    desc: '12 voces australianas de hombre sacadas de grabaciones reales (narradores de LibriVox), o la de una grabación tuya de 10 segundos. La más natural, pero la más lenta.',
    mb: 190,
    license: 'MIT; voces de LibriVox de dominio público (CC0). Si grabás a alguien, que te dé permiso.',
    files: [
      { url: REL + 'pocket-lm_flow.onnx', name: 'lm_flow.onnx', size: 10 * MB },
      { url: REL + 'pocket-lm_main.onnx', name: 'lm_main.onnx', size: 80 * MB },
      { url: REL + 'pocket-encoder.onnx', name: 'encoder.onnx', size: 40 * MB },
      { url: REL + 'pocket-decoder.onnx', name: 'decoder.onnx', size: 25 * MB },
      { url: REL + 'pocket-text_conditioner.onnx', name: 'text_conditioner.onnx', size: 16 * MB },
      { url: REL + 'pocket-vocab.json', name: 'vocab.json', size: 1 * MB },
      { url: REL + 'pocket-token_scores.json', name: 'token_scores.json', size: 1 * MB },
      ...POCKET_VOICES.map((v) => ({ url: REL + 'pocket-' + v.file, name: v.file, size: 700 * 1024 })),
    ],
  },
  {
    id: 'moonshine',
    kind: 'ear',
    asr: 'moonshine',
    title: 'Moonshine Tiny',
    desc: 'Entiende lo que decís en inglés sin internet. Muy liviano, pero el menos preciso.',
    mb: 42,
    license: 'MIT.',
    files: [
      { url: REL + 'moonshine-encoder_model.ort', name: 'encoder_model.ort', size: 13 * MB },
      { url: REL + 'moonshine-decoder_model_merged.ort', name: 'decoder_model_merged.ort', size: 29 * MB },
      { url: REL + 'moonshine-tokens.txt', name: 'tokens.txt', size: 1 * MB },
    ],
  },
  {
    id: 'parakeet',
    kind: 'ear',
    asr: 'parakeet',
    title: 'Parakeet TDT 0.6B v2 (NVIDIA)',
    desc: 'Nivel ChatGPT en inglés y muy rápido: de los más precisos del ranking de Hugging Face. Solo inglés. Recomendado para la llamada.',
    mb: 640,
    license: 'CC-BY-4.0 (NVIDIA).',
    files: [
      { url: REL + 'parakeet-encoder.onnx', name: 'encoder.onnx', size: 620 * MB },
      { url: REL + 'parakeet-decoder.onnx', name: 'decoder.onnx', size: 12 * MB },
      { url: REL + 'parakeet-joiner.onnx', name: 'joiner.onnx', size: 6 * MB },
      { url: REL + 'parakeet-tokens.txt', name: 'tokens.txt', size: 1 },
    ],
  },
  {
    id: 'qwen3asr',
    kind: 'ear',
    asr: 'qwen3',
    spanish: true,
    title: 'Qwen3-ASR 0.6B (Alibaba)',
    desc: 'Muy preciso y entiende 52 idiomas, también español: sirve para «Decilo en inglés». Más pesado y un poco más lento que Parakeet.',
    mb: 900,
    license: 'Apache-2.0.',
    files: [
      { url: REL + 'qwen3asr-conv_frontend.onnx', name: 'conv_frontend.onnx', size: 30 * MB },
      { url: REL + 'qwen3asr-encoder.onnx', name: 'encoder.onnx', size: 200 * MB },
      { url: REL + 'qwen3asr-decoder.onnx', name: 'decoder.onnx', size: 650 * MB },
      { url: REL + 'qwen3asr-tokenizer.zip', name: 'tokenizer.zip', size: 5 * MB },
    ],
  },
  {
    id: 'lfm25',
    kind: 'brain',
    title: 'LFM2.5 1.2B (Liquid AI)',
    desc: 'La más rápida y liviana. Contesta bien en charlas cortas. (LFM3 todavía no está en el formato para celulares.)',
    mb: 1250,
    file: 'model.litertlm',
    license: 'Licencia abierta LFM 1.0: gratis para uso personal.',
    files: [{ url: HF + 'LFM2.5-1.2B-Instruct/resolve/main/LFM2.5-1.2B-Instruct_int8.litertlm', name: 'model.litertlm', size: 1250 * MB }],
  },
  {
    id: 'qwen3',
    kind: 'brain',
    title: 'Qwen3 1.7B (Alibaba)',
    desc: 'Un poco más inteligente, pero más pesada y lenta. Necesita un celular con 8 GB de RAM.',
    mb: 2100,
    file: 'model.litertlm',
    license: 'Apache-2.0.',
    files: [{ url: HF + 'Qwen3-1.7B/resolve/main/Qwen3_1.7B.litertlm', name: 'model.litertlm', size: 2100 * MB }],
  },
];

export const packById = (id: string) => PACKS.find((p) => p.id === id);

export async function aiStatus(): Promise<AiStatus> {
  if (!aiAvailable()) return { installed: {}, files: {}, freeBytes: 0, loaded: [] };
  return OliverAi.status();
}

/** Paquete bajado y completo (una versión nueva puede necesitar archivos extra: «Actualizar»). */
export function packReady(p: Pack, st: AiStatus): boolean {
  if (!(p.id in st.installed)) return false;
  const have = st.files?.[p.id];
  return !have || p.files.every((f) => have.includes(f.name));
}

/** Nombres de las voces de un paquete (Piper las trae en speakers.json). */
export const MY_RECORDING = 100;

export async function packSpeakers(pack: Pack, files?: string[]): Promise<{ id: number; name: string }[]> {
  if (pack.speakers) return pack.speakers;
  if (pack.engine === 'pocket') {
    const list = POCKET_VOICES.map((v, i) => ({ id: i, name: v.name }));
    if (files?.includes('mi-voz.wav')) list.unshift({ id: MY_RECORDING, name: '🎙️ Mi grabación' });
    return list;
  }
  try {
    const { text } = await OliverAi.readText({ id: pack.id, name: 'speakers.json' });
    const names: string[] = JSON.parse(text).speakers ?? [];
    return names.map((n, i) => ({ id: i, name: prettyName(n, i) }));
  } catch {
    return [{ id: 0, name: 'Voz 1' }];
  }
}

const prettyName = (n: string, i: number) => {
  const clean = n.replace(/[_-]+/g, ' ').trim();
  return clean && clean !== 'default' ? `${i + 1}. ${clean[0].toUpperCase()}${clean.slice(1)}` : `Voz ${i + 1}`;
};

// ───────────── ajustes de la voz ─────────────

export interface Tune {
  /** Velocidad (1 = la del modelo). */
  speed: number;
  /** Tono (1 = el natural). */
  pitch: number;
  /** Volumen de la voz dentro de la app (no cambia el volumen del teléfono). */
  volume: number;
  /** Piper: expresividad (variación de la entonación). */
  noise: number;
  /** Piper: variación del ritmo. */
  noiseW: number;
}
export const DEFAULT_TUNE: Tune = { speed: 1, pitch: 1, volume: 1, noise: 0.667, noiseW: 0.8 };

/** Narradores que leen apurados (según los autores del modelo): clancy y tully ×1,25 más lentos, marlo ×1,08. */
const PIPER_SLOW: Record<number, number> = { 0: 0.8, 8: 0.8, 2: 0.93 };

export const tuneKey = (packId: string, speaker: number) => `${packId}:${speaker}`;

export function tuneFor(packId: string, speaker: number): Tune {
  const base = { ...DEFAULT_TUNE, speed: packId === 'piper-au' ? (PIPER_SLOW[speaker] ?? 1) : 1 };
  return { ...base, ...(getState().settings.ai.tune?.[tuneKey(packId, speaker)] ?? {}) };
}

/** Grabación que usa Pocket TTS para cada voz. */
export const referenceFor = (speaker: number) => (speaker === MY_RECORDING ? 'mi-voz.wav' : (POCKET_VOICES[speaker] ?? POCKET_VOICES[0]).file);

export async function loadVoicePack(pack: Pack, speaker: number, tune = tuneFor(pack.id, speaker)) {
  await OliverAi.loadVoice({ id: pack.id, kind: pack.engine ?? 'piper', espeak: pack.espeak ?? 'en', noise: tune.noise, noiseW: tune.noiseW });
}

export async function speakWith(pack: Pack, speaker: number, text: string, tune = tuneFor(pack.id, speaker), test: AudioTest = {}) {
  return OliverAi.speak({
    ...test,
    text,
    speaker: pack.engine === 'pocket' ? 0 : speaker,
    speed: tune.speed,
    pitch: tune.pitch,
    volume: tune.volume,
    reference: pack.engine === 'pocket' ? referenceFor(speaker) : undefined,
  });
}

export const LAB_TEXT = "G'day mate! I'm Oliver. How are you going today? Reckon we'll have a good yarn.";

/** Las pruebas de voz van de a una: si no, la que termina libera la voz de la que está empezando («La voz no está cargada»). */
let voiceQueue: Promise<unknown> = Promise.resolve();
function serial<T>(fn: () => Promise<T>): Promise<T> {
  const run = voiceQueue.then(fn, fn);
  voiceQueue = run.catch(() => {});
  return run;
}

/** Corre una prueba del laboratorio: carga la voz, habla y la libera. */
export function labTest(pack: Pack, speaker: number, test: AudioTest): Promise<AudioDiag> {
  return serial(() => labTestNow(pack, speaker, test));
}
async function labTestNow(pack: Pack, speaker: number, test: AudioTest): Promise<AudioDiag> {
  const t = tuneFor(pack.id, speaker);
  await loadVoicePack(pack, speaker, t);
  try {
    return await speakWith(pack, speaker, LAB_TEXT, t, test);
  } finally {
    await OliverAi.unloadAll().catch(() => {});
  }
}

/** Resumen legible de una prueba. */
export function diagText(name: string, d: AudioDiag): string {
  return [
    `${name} · ${d.engine}`,
    `motor ${d.sampleRate} Hz → reproductor ${d.trackRate} Hz → salida del teléfono ${d.deviceRate} Hz (${d.output || 'parlante'})`,
    `${d.format}, búfer ${d.bufferMs} ms, cortes (underruns) ${d.underruns}, errores de escritura ${d.writeErrors}`,
    `audio ${d.audioMs} ms, generado en ${d.genMs} ms, pico ${d.peak?.toFixed(2)}, muestras >1: ${d.clipped}, inválidas: ${d.badSamples}`,
    `shape ${d.shape ? 'sí' : 'no'}, PlaybackParams ${d.playbackParams ? 'sí' : 'no'}`,
    d.saved ? `guardado en ${d.saved}` : '',
    d.log ? `aviso: ${d.log}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

// ───────────── la llamada ─────────────

export interface CallAi {
  voice: Pack | null;
  ear: Pack | null;
  brain: Pack | null;
  speaker: number;
}

/** Qué IA quedó elegida y descargada (lo que no esté descargado se reemplaza por lo del teléfono). */
export async function chosenAi(): Promise<CallAi> {
  const none: CallAi = { voice: null, ear: null, brain: null, speaker: 0 };
  if (!aiAvailable()) return none;
  const a = getState().settings.ai;
  try {
    const st = await OliverAi.status();
    const ok = (id: string) => {
      const p = packById(id);
      return p && packReady(p, st) ? p : null;
    };
    return { voice: ok(a.voice), ear: ok(a.ear), brain: ok(a.brain), speaker: a.speaker };
  } catch {
    return none;
  }
}

/** Carga en memoria lo elegido. Devuelve lo que se pudo cargar. */
export async function loadCallAi(ai: CallAi, system: string, temperature = 0.8): Promise<CallAi & { errors: string[] }> {
  const out = { ...ai, errors: [] as string[] };
  if (ai.voice) {
    try {
      await loadVoicePack(ai.voice, ai.speaker);
    } catch (e) {
      out.errors.push(String((e as Error).message ?? e));
      out.voice = null;
    }
  }
  if (ai.ear) {
    try {
      await OliverAi.loadEar({ id: ai.ear.id, kind: ai.ear.asr ?? 'moonshine' });
    } catch (e) {
      out.errors.push(String((e as Error).message ?? e));
      out.ear = null;
    }
  }
  if (ai.brain) {
    try {
      await OliverAi.loadBrain({ id: ai.brain.id, file: ai.brain.file ?? 'model.litertlm', system, temperature });
    } catch (e) {
      out.errors.push(String((e as Error).message ?? e));
      out.brain = null;
    }
  }
  return out;
}

/** Libera todo al cortar (memoria, procesador y micrófono). */
export function releaseCallAi() {
  if (!aiAvailable()) return;
  OliverAi.unloadAll().catch(() => {});
}

/** Lo que dice el modelo, sin marcas de pensamiento, emojis ni acotaciones. */
export function cleanReply(text: string): string {
  return text
    .replace(/<think>[\s\S]*?<\/think>/g, '')
    .replace(/<\/?think>/g, '')
    .replace(/\*[^*]{0,40}\*/g, '')
    .replace(/^\s*(Oliver|Assistant)\s*:\s*/i, '')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Corta la respuesta en un máximo de frases (para que Oliver no dé discursos). */
export function shortReply(text: string, max = 3): string {
  const parts = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [text];
  return parts.slice(0, max).map((p) => p.trim()).join(' ');
}

const OLIVER = `You are Oliver, a friendly Australian bloke in his thirties from the outback who now lives in Adelaide.
You are on a video call with a Spanish speaker (probably from Uruguay) who is learning English.
Speak casual Australian English (mate, no worries, reckon, arvo) but keep it easy to understand.
Rules:
- Answer in 1 to 3 short sentences, then usually ask one simple question to keep the chat going.
- Never use emojis, lists, asterisks or stage directions. Only the words you say out loud.
- If they make a grammar mistake, reply naturally and then add a quick friendly correction like: "By the way, we say 'I went', not 'I goed'."
- If they speak Spanish or get stuck, help them with a short English phrase they can use.`;

/** Instrucciones para una llamada con temática (roleplay de la unidad). */
export function roleplayPrompt(o: { scene: string; goal: string; unit: string; lines: string[] }) {
  return `${OLIVER}

This call is a role-play. Scene: ${o.scene}. Goal for the learner: ${o.goal}.
Grammar topic they are practising: ${o.unit}. Use it often in your questions so they have to use it in their answers.
Stay inside this scene the whole call. Here is the planned script for your lines, use it as a guide but react to what they actually say:
${o.lines.map((l) => `- ${l}`).join('\n')}
When the goal is done or after about 8 exchanges, wrap up and say goodbye.`;
}

/** Pedido final: consejos para el repaso, en español. */
export const FEEDBACK_REQUEST = `The call is over. Now, in Spanish from Uruguay (voseo), give the learner feedback on their English in this call.
Write exactly 3 lines, each starting with "- ": one thing they did well, and two concrete mistakes or improvements with the correct English phrase in quotes.
No greetings, nothing else.`;

// ───────────── descargas (siguen aunque cambies de pantalla) ─────────────

type DlState = Record<string, { progress: number; error?: string }>;
let downloads: DlState = {};
const dlListeners = new Set<() => void>();
let dlHooked = false;
const omit = (st: DlState, id: string): DlState => Object.fromEntries(Object.entries(st).filter(([k]) => k !== id));
const emitDl = (next: DlState) => {
  downloads = next;
  dlListeners.forEach((l) => l());
};

function hookDownloads() {
  if (dlHooked || !aiAvailable()) return;
  dlHooked = true;
  OliverAi.addListener('download', (e) => {
    if (e.done) {
      emitDl(omit(downloads, e.id));
    } else if (e.error) emitDl({ ...downloads, [e.id]: { progress: downloads[e.id]?.progress ?? 0, error: e.error } });
    else emitDl({ ...downloads, [e.id]: { progress: e.progress ?? 0 } });
  });
}

export function subscribeDownloads(fn: () => void) {
  hookDownloads();
  dlListeners.add(fn);
  return () => dlListeners.delete(fn);
}
export const getDownloads = () => downloads;

export async function startDownload(pack: Pack): Promise<boolean> {
  hookDownloads();
  emitDl({ ...downloads, [pack.id]: { progress: 0 } });
  try {
    await OliverAi.download({ id: pack.id, files: pack.files });
    emitDl(omit(downloads, pack.id));
    return true;
  } catch (e) {
    const msg = String((e as Error).message ?? e);
    if (msg.includes('cancelado')) {
      emitDl(omit(downloads, pack.id));
    } else emitDl({ ...downloads, [pack.id]: { progress: downloads[pack.id]?.progress ?? 0, error: msg } });
    return false;
  }
}

export const cancelDownload = (id: string) => OliverAi.cancelDownload({ id });
export const removePack = (id: string) => OliverAi.remove({ id });

/** Graba la voz de referencia para Pocket TTS (queda solo en el teléfono). */
export const recordMyVoice = (seconds = 10) => OliverAi.recordReference({ id: 'pocket', seconds });

/** Prueba una voz (se carga solo mientras suena y después se libera). */
export function tryVoice(pack: Pack, speaker: number, tune?: Tune) {
  return serial(() => tryVoiceNow(pack, speaker, tune));
}
async function tryVoiceNow(pack: Pack, speaker: number, tune?: Tune) {
  const t = tune ?? tuneFor(pack.id, speaker);
  await loadVoicePack(pack, speaker, t);
  try {
    await speakWith(pack, speaker, "G'day mate! I'm Oliver. How are you going today? Reckon we'll have a good yarn.", t);
  } finally {
    await OliverAi.unloadAll().catch(() => {});
  }
}
