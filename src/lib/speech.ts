import { Capacitor, registerPlugin } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { normalize } from './answer';

/**
 * Voz y reconocimiento de habla con los motores que ya trae el teléfono (Android TTS y SpeechRecognizer).
 * No se descargan modelos ni se corre IA propia: solo trabajan mientras suena o escucha, así que el gasto de batería es mínimo.
 */

export type Accent = 'variado' | 'en-US' | 'en-GB' | 'en-AU';
export const ACCENT_LABEL: Record<Accent, string> = {
  variado: 'Variado (muchas voces)',
  'en-US': 'Estados Unidos',
  'en-GB': 'Reino Unido',
  'en-AU': 'Australia',
};

const native = Capacitor.isNativePlatform();

interface Voice {
  index: number;
  lang: string;
  /** Identificador único de la voz (en Android, el voiceURI: por ejemplo «en-au-x-aub-local»). */
  id: string;
  /** Nombre para mostrar (en Android suele repetirse: «English Australia»). */
  name: string;
  local: boolean;
}

/** Usar la voz que el teléfono tiene elegida para ese idioma (Ajustes › Texto a voz). */
export const SYSTEM_VOICE = '__system__';

let voicesCache: Voice[] | null = null;
let preferred = '';

/** Voz elegida en Ajustes (por id). Se usa siempre que no se pida «variado». */
export function setPreferredVoice(id: string) {
  preferred = id;
}

async function englishVoices(fresh = false): Promise<Voice[]> {
  if (voicesCache && !fresh) return voicesCache;
  try {
    if (native) {
      const { voices } = await TextToSpeech.getSupportedVoices();
      voicesCache = voices
        .map((v, index) => ({ index, lang: v.lang.replace('_', '-'), id: v.voiceURI || v.name, name: v.name, local: v.localService !== false }))
        .filter((v) => v.lang.toLowerCase().startsWith('en'));
    } else if ('speechSynthesis' in window) {
      voicesCache = speechSynthesis
        .getVoices()
        .map((v, index) => ({ index, lang: v.lang, id: v.voiceURI || v.name, name: v.name, local: v.localService }))
        .filter((v) => v.lang.toLowerCase().startsWith('en'));
    } else voicesCache = [];
  } catch {
    voicesCache = [];
  }
  return voicesCache;
}

/** Voces en inglés que tiene el teléfono (las del motor de voz preferido: por ejemplo Samsung). */
export async function listVoices(): Promise<{ id: string; name: string; lang: string; local: boolean }[]> {
  if (!native && 'speechSynthesis' in window && !speechSynthesis.getVoices().length)
    await new Promise((r) => {
      speechSynthesis.onvoiceschanged = () => r(null);
      setTimeout(() => r(null), 1500);
    });
  return (await englishVoices(true)).map(({ id, name, lang, local }) => ({ id, name, lang, local }));
}

const TtsSettings = registerPlugin<{ open(): Promise<void> }>('TtsSettings');

/** Abre los ajustes de texto a voz del teléfono (motor y voz preferida). */
export async function openVoiceSettings(): Promise<boolean> {
  if (!native) return false;
  try {
    await TtsSettings.open();
    return true;
  } catch {
    try {
      await TextToSpeech.openInstall();
      return true;
    } catch {
      return false;
    }
  }
}

export async function canSpeak(): Promise<boolean> {
  return native || 'speechSynthesis' in window;
}

/** Habla `text`. `varied` elige una voz inglesa al azar (entrenamiento con muchas voces). */
export async function say(text: string, opts: { accent?: Accent; varied?: boolean; slow?: boolean; lang?: string; voice?: string } = {}) {
  const accent = opts.accent ?? 'variado';
  const wanted = opts.voice ?? (opts.varied ? '' : preferred);
  // Con una voz fija se vuelve a pedir la lista para que el índice coincida con el del teléfono.
  const voices = await englishVoices(!!wanted && wanted !== SYSTEM_VOICE);
  const system = wanted === SYSTEM_VOICE;
  const chosen = wanted && !system ? voices.find((v) => v.id === wanted) : undefined;
  let pool = opts.lang ? voices.filter((v) => v.lang === opts.lang) : accent === 'variado' || opts.varied ? voices : voices.filter((v) => v.lang === accent);
  if (!pool.length) pool = voices;
  // «Voz del teléfono»: no se elige voz; Android usa la que configuraste para el idioma.
  const voice = system ? undefined : chosen ?? (pool.length ? pool[Math.floor(Math.random() * pool.length)] : undefined);
  const lang = voice?.lang ?? opts.lang ?? (system ? 'en-AU' : accent === 'variado' ? 'en-US' : accent);
  const rate = opts.slow ? 0.7 : 1;

  if (native) {
    await TextToSpeech.stop().catch(() => {});
    await TextToSpeech.speak({ text, lang, rate, voice: voice?.index, category: 'playback' });
    return;
  }
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = rate;
    const v = voice ? speechSynthesis.getVoices()[voice.index] : undefined;
    if (v) u.voice = v;
    // Se espera a que termine de hablar (sirve para animar al personaje de la llamada).
    await new Promise<void>((resolve) => {
      u.onend = () => resolve();
      u.onerror = () => resolve();
      speechSynthesis.speak(u);
      setTimeout(resolve, 2000 + text.length * 120);
    });
  }
}

export async function stopSpeaking() {
  if (native) await TextToSpeech.stop().catch(() => {});
  else if ('speechSynthesis' in window) speechSynthesis.cancel();
}

// ───── Reconocimiento de habla ─────

type WebRecognition = {
  lang: string;
  maxAlternatives: number;
  interimResults: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: unknown) => void) | null;
  onend: (() => void) | null;
  start: () => void;
};

function webRecognition(): (new () => WebRecognition) | null {
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as (new () => WebRecognition) | null;
}

export async function canListen(): Promise<boolean> {
  try {
    if (native) return (await SpeechRecognition.available()).available;
    return !!webRecognition();
  } catch {
    return false;
  }
}

/** Escucha una frase y devuelve las transcripciones posibles. */
export async function listen(lang = 'en-US'): Promise<string[]> {
  if (native) {
    const perm = await SpeechRecognition.checkPermissions();
    if (perm.speechRecognition !== 'granted') {
      const r = await SpeechRecognition.requestPermissions();
      if (r.speechRecognition !== 'granted') throw new Error('permiso');
    }
    const res = await SpeechRecognition.start({ language: lang, maxResults: 5, partialResults: false, popup: false });
    return res.matches ?? [];
  }
  const Rec = webRecognition();
  if (!Rec) throw new Error('no disponible');
  return new Promise((resolve, reject) => {
    const r = new Rec();
    r.lang = lang;
    r.maxAlternatives = 5;
    r.interimResults = false;
    let done = false;
    r.onresult = (e) => {
      done = true;
      resolve(Array.from(e.results[0]).map((a) => a.transcript));
    };
    r.onerror = (e) => reject(e);
    r.onend = () => {
      if (!done) resolve([]);
    };
    r.start();
  });
}

/**
 * Qué parte de la frase se entendió (0–1): palabras de la frase objetivo reconocidas en orden.
 * Se mide si te entienden, no si tenés acento: la evidencia dice que la inteligibilidad es lo que importa.
 */
export function intelligibility(target: string, heard: string[]): { score: number; best: string } {
  const t = normalize(target).split(' ');
  let best = { score: 0, best: heard[0] ?? '' };
  for (const h of heard) {
    const w = normalize(h).split(' ');
    const dp = Array.from({ length: t.length + 1 }, () => Array(w.length + 1).fill(0));
    for (let i = 1; i <= t.length; i++)
      for (let j = 1; j <= w.length; j++)
        dp[i][j] = t[i - 1] === w[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    const score = dp[t.length][w.length] / t.length;
    if (score > best.score) best = { score, best: h };
  }
  return best;
}
