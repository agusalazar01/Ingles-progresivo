import { chosenAi, OliverAi, loadVoicePack, packSpeakers, releaseCallAi, speakWith, tuneFor, visibleSpeakers, type CallAi } from './ai';
import { listVoices, say, stopSpeaking, type Accent } from './speech';
import { getState } from './store';
import { castGender, speakerFor, systemVoiceFor, type Gender } from './voicegender';

/**
 * Voces de los diálogos de las unidades: cada personaje habla siempre con su voz, de su género
 * (Mia con voz de mujer, Leo con voz de hombre) y nunca dos personajes con la misma voz.
 *
 * Orden de preferencia: voz del paquete elegido en Configuración (Pocket, Piper…) → voz del teléfono
 * del mismo género → la voz de siempre con el tono cambiado (más agudo para mujer, más grave para hombre).
 */
export interface Cast {
  gender: Gender;
  /** Número de voz dentro del paquete. */
  speaker?: number;
  /** Voz del teléfono (si no hay paquete o no tiene de ese género). */
  sys?: string;
  /** Último recurso: misma voz con otro tono. */
  pitch?: number;
}

/** Elige una voz distinta para cada personaje. Es pura: se prueba sin teléfono. */
export function castDialogue(
  names: string[],
  gender: (name: string) => Gender,
  packVoice: ((g: Gender, who: string, offset: number) => number | null) | null,
  sysVoice: (g: Gender, who: string, offset: number) => string | null,
): Map<string, Cast> {
  const out = new Map<string, Cast>();
  const used = new Set<string>();
  for (const who of [...new Set(names)]) {
    const g = gender(who);
    let cast: Cast | null = null;
    for (let off = 0; off < 6 && !cast; off++) {
      const sp = packVoice?.(g, who, off) ?? null;
      if (sp !== null && !used.has(`p${sp}`)) cast = { gender: g, speaker: sp };
    }
    for (let off = 0; off < 6 && !cast; off++) {
      const sys = sysVoice(g, who, off);
      if (sys && !used.has(`s${sys}`)) cast = { gender: g, sys };
    }
    if (!cast) {
      // Sin voces de ese género: la voz de siempre, con el tono del personaje (y un poco distinto si se repite el género).
      const same = [...out.values()].filter((c) => c.pitch !== undefined && c.gender === g).length;
      cast = { gender: g, pitch: (g === 'f' ? 1.2 : 0.82) + same * (g === 'f' ? 0.1 : -0.08) };
    }
    if (cast.speaker !== undefined) used.add(`p${cast.speaker}`);
    if (cast.sys) used.add(`s${cast.sys}`);
    out.set(who, cast);
  }
  return out;
}

/** Reparto de un diálogo: se prepara una vez, habla cada línea con su voz y se libera al salir de la pantalla. */
export class DialogueVoices {
  private ready: Promise<void> | null = null;
  private ai: CallAi | null = null;
  private casts = new Map<string, Cast>();
  private loadedPack = false;
  private names: string[];
  private accent: () => Accent;
  constructor(names: string[], accent: () => Accent) {
    this.names = names;
    this.accent = accent;
  }

  private prepare() {
    this.ready ??= (async () => {
      const ai = await chosenAi().catch(() => null);
      this.ai = ai;
      const hidden = getState().settings.ai.hiddenVoices;
      const speakers = ai?.voice ? await packSpeakers(ai.voice).then((s) => visibleSpeakers(hidden, ai.voice!.id, s)).catch(() => null) : null;
      const sys = await listVoices().catch(() => []);
      this.casts = castDialogue(
        this.names,
        (n) => castGender(n),
        ai?.voice && speakers ? (g, who, off) => speakerFor(ai.voice!.id, speakers, ai.speaker, g, who, off) : null,
        (g, who, off) => systemVoiceFor(sys, g, who, off),
      );
      if (ai?.voice && [...this.casts.values()].some((c) => c.speaker !== undefined)) {
        try {
          await loadVoicePack(ai.voice, ai.speaker);
          this.loadedPack = true;
        } catch {
          // No se pudo cargar el paquete: esos personajes pasan a voces del teléfono.
          this.casts = castDialogue(this.names, (n) => castGender(n), null, (g, who, off) => systemVoiceFor(sys, g, who, off));
        }
      }
    })();
    return this.ready;
  }

  /** Dice `text` con la voz de `who`. Termina cuando terminó de hablar. */
  async say(who: string, text: string) {
    await this.prepare();
    const c = this.casts.get(who);
    const pack = this.ai?.voice;
    if (c?.speaker !== undefined && pack && this.loadedPack) {
      try {
        await speakWith(pack, c.speaker, text, tuneFor(pack.id, c.speaker));
        return;
      } catch {
        /* sigue con la voz del teléfono */
      }
    }
    await say(text, { accent: this.accent(), voice: c?.sys, pitch: c?.pitch });
  }

  stop() {
    stopSpeaking();
    if (this.loadedPack) OliverAi.stopSpeaking().catch(() => {});
  }

  release() {
    this.stop();
    if (this.loadedPack) releaseCallAi();
    this.loadedPack = false;
    this.ready = null;
  }
}
