import { useEffect, useState, useSyncExternalStore } from 'react';
import { setState, useAppState } from '../lib/store';
import {
  aiAvailable,
  aiStatus,
  cancelDownload,
  getDownloads,
  DEFAULT_TUNE,
  diagText,
  labTest,
  MY_RECORDING,
  OliverAi,
  packReady,
  packSpeakers,
  recordMyVoice,
  tuneFor,
  tuneKey,
  PACKS,
  removePack,
  startDownload,
  subscribeDownloads,
  tryVoice,
  type AiStatus,
  type AudioTest,
  type Tune,
  type Pack,
  type PackKind,
} from '../lib/ai';

type AiChoice = { voice: string; speaker: number; ear: string; brain: string };
const KEY: Record<PackKind, 'voice' | 'ear' | 'brain'> = { voice: 'voice', ear: 'ear', brain: 'brain' };

const size = (mb: number) => (mb >= 1000 ? `${(mb / 1024).toFixed(1).replace('.', ',')} GB` : `${mb} MB`);

/** Ajustes › Voces e IA: bajar, elegir y borrar la IA sin internet de la llamada con Oliver. */
export function AiSettings() {
  const s = useAppState();
  const ai = s.settings.ai;
  const dl = useSyncExternalStore(subscribeDownloads, getDownloads);
  const [st, setSt] = useState<AiStatus>({ installed: {}, files: {}, freeBytes: 0, loaded: [] });
  const installed = st.installed;
  const free = st.freeBytes;
  const [speakers, setSpeakers] = useState<{ id: number; name: string }[]>([]);
  const [testing, setTesting] = useState<number | null>(null);
  const [msg, setMsg] = useState('');

  const set = (patch: Partial<AiChoice>) => setState((st) => ({ ...st, settings: { ...st.settings, ai: { ...st.settings.ai, ...patch } } }));
  const refresh = () => aiStatus().then(setSt);

  useEffect(() => {
    refresh();
  }, [Object.keys(dl).join()]);

  const voicePack = PACKS.find((p) => p.id === ai.voice && packReady(p, st));
  const filesKey = (voicePack && st.files?.[voicePack.id]?.join()) ?? '';
  useEffect(() => {
    if (voicePack) packSpeakers(voicePack, st.files?.[voicePack.id]).then(setSpeakers);
    else setSpeakers([]);
  }, [voicePack?.id, filesKey]);

  const [rec, setRec] = useState<number | null>(null);
  const tune: Tune = voicePack ? tuneFor(voicePack.id, ai.speaker) : DEFAULT_TUNE;
  const setTune = (patch: Partial<Tune>) => {
    if (!voicePack) return;
    const k = tuneKey(voicePack.id, ai.speaker);
    setState((x) => ({
      ...x,
      settings: { ...x.settings, ai: { ...x.settings.ai, tune: { ...x.settings.ai.tune, [k]: { ...x.settings.ai.tune?.[k], ...patch } } } },
    }));
  };
  const resetTune = () => {
    if (!voicePack) return;
    const k = tuneKey(voicePack.id, ai.speaker);
    setState((x) => {
      const t = { ...x.settings.ai.tune };
      delete t[k];
      return { ...x, settings: { ...x.settings, ai: { ...x.settings.ai, tune: t } } };
    });
  };
  const record = async () => {
    setMsg('');
    setRec(0);
    const l = await OliverAi.addListener('recording', (e) => setRec(e.progress));
    try {
      await recordMyVoice(10);
      await refresh();
      set({ speaker: MY_RECORDING });
    } catch (e) {
      setMsg(`No se pudo grabar: ${(e as Error).message ?? e}`);
    }
    l.remove();
    setRec(null);
  };

  if (!aiAvailable())
    return (
      <div className="card" id="voces-ia">
        <p className="card-title">Voces e IA (sin internet)</p>
        <p className="small">La IA para la llamada con Oliver funciona en la app de Android. En la web se usa la voz y el micrófono del navegador.</p>
      </div>
    );

  const download = async (p: Pack) => {
    setMsg('');
    const ok = await startDownload(p);
    if (ok) {
      await refresh();
      set({ [KEY[p.kind]]: p.id } as Partial<AiChoice>);
    }
  };

  const remove = async (p: Pack) => {
    await removePack(p.id);
    if (ai[KEY[p.kind]] === p.id) set({ [KEY[p.kind]]: p.kind === 'brain' ? 'off' : 'system' } as Partial<AiChoice>);
    refresh();
  };

  const test = async (p: Pack, speaker: number) => {
    setTesting(speaker);
    try {
      await tryVoice(p, speaker, tuneFor(p.id, speaker));
    } catch (e) {
      setMsg(`No pude probar la voz: ${(e as Error).message ?? e}`);
    }
    setTesting(null);
  };

  const packCard = (p: Pack) => {
    const has = packReady(p, st);
    const outdated = !has && p.id in installed;
    const d = dl[p.id];
    const chosen = ai[KEY[p.kind]] === p.id && has;
    return (
      <div key={p.id} className={`ai-pack ${chosen ? 'chosen' : ''}`}>
        <div className="ai-pack-head">
          <b>
            {chosen ? '✓ ' : ''}
            {p.title}
          </b>
          <span className="small">{size(p.mb)}</span>
        </div>
        <p className="small">{p.desc}</p>
        {d && !d.error && (
          <>
            <div className="ai-bar">
              <div style={{ width: `${Math.round(d.progress * 100)}%` }} />
            </div>
            <div className="ai-row">
              <span className="small" style={{ flex: 1 }}>
                Bajando… {Math.round(d.progress * 100)}%
              </span>
              <button className="link" onClick={() => cancelDownload(p.id)}>
                Cancelar
              </button>
            </div>
          </>
        )}
        {d?.error && <p className="small">⚠️ No se pudo bajar ({d.error}). Probá de nuevo con wifi: sigue desde donde quedó.</p>}
        {!d && (
          <div className="ai-row">
            {!has && !outdated && (
              <button className="secondary" onClick={() => download(p)}>
                ⬇️ Bajar ({size(p.mb)})
              </button>
            )}
            {outdated && (
              <button className="primary" onClick={() => download(p)}>
                ⬆️ Actualizar (unos pocos KB)
              </button>
            )}
            {has && !chosen && (
              <button className="primary" onClick={() => set({ [KEY[p.kind]]: p.id } as Partial<AiChoice>)}>
                Usar
              </button>
            )}
            {(has || outdated) && (
              <button className="secondary" onClick={() => remove(p)}>
                🗑️ Borrar
              </button>
            )}
          </div>
        )}
        {d?.error && (
          <div className="ai-row">
            <button className="secondary" onClick={() => download(p)}>
              Reintentar
            </button>
          </div>
        )}
        <p className="small" style={{ opacity: 0.75 }}>
          Licencia: {p.license}
        </p>
        {chosen && p.kind === 'voice' && speakers.length > 0 && (
          <div className="options">
            <p className="small">Elegí la voz de Oliver (tocá ▶ para escucharla):</p>
            {speakers.map((v) => (
              <div key={v.id} className="ai-row">
                <button className={`option ${ai.speaker === v.id ? 'right' : ''}`} style={{ flex: 3 }} onClick={() => set({ speaker: v.id })}>
                  {v.name}
                </button>
                <button className="secondary" style={{ flex: 1, minWidth: 60 }} disabled={testing !== null} onClick={() => test(p, v.id)}>
                  {testing === v.id ? '…' : '▶'}
                </button>
              </div>
            ))}
          </div>
        )}
        {chosen && p.engine === 'pocket' && (
          <div className="options">
            <p className="small">
              Grabá 10 segundos de un australiano hablando normal (con su permiso, por ejemplo tu profe): Oliver va a hablar con esa voz. La grabación queda
              solo en el teléfono.
            </p>
            {rec !== null ? (
              <div className="ai-bar">
                <div style={{ width: `${Math.round(rec * 100)}%` }} />
              </div>
            ) : (
              <button className="secondary" onClick={record}>
                🎙️ Grabar una voz (10 s)
              </button>
            )}
          </div>
        )}
        {chosen && p.kind === 'voice' && <AudioLab pack={p} speaker={ai.speaker} />}
        {chosen && p.kind === 'voice' && <TunePanel tune={tune} piper={p.engine === 'piper'} onChange={setTune} onReset={resetTune} onTry={() => test(p, ai.speaker)} busy={testing !== null} />}
      </div>
    );
  };

  const systemOption = (kind: PackKind, label: string) => {
    const value = kind === 'brain' ? 'off' : 'system';
    const cur = PACKS.find((p) => p.id === ai[KEY[kind]]);
    const on = ai[KEY[kind]] === value || !cur || !packReady(cur, st);
    return (
      <button className={`option ${on ? 'right' : ''}`} onClick={() => set({ [KEY[kind]]: value } as Partial<AiChoice>)}>
        {label}
      </button>
    );
  };

  return (
    <div className="card" id="voces-ia">
      <p className="card-title">Voces e IA para la llamada (sin internet)</p>
      <p className="small">
        Se bajan una sola vez (mejor con wifi) y después funcionan sin conexión y gratis. Solo usan memoria y batería mientras dura la llamada: al cortar se
        liberan. Lo que decís se procesa en el teléfono y no se manda a ningún lado.
      </p>
      {st.crashed && (
        <p className="small">
          ⚠️ La última vez la app se cerró al {st.crashed}. Si vuelve a pasar, elegí otra opción (o la del teléfono) y contame en qué paso fue.
        </p>
      )}
      {free > 0 && <p className="small">Espacio libre en el teléfono: {size(Math.round(free / 1024 / 1024))}</p>}

      <div className="ai-section">
        <h3>🗣️ Voz de Oliver</h3>
        {systemOption('voice', '📱 Voz del teléfono (Samsung en inglés de Australia)')}
        {PACKS.filter((p) => p.kind === 'voice').map(packCard)}
      </div>

      <div className="ai-section">
        <h3>👂 Entender lo que decís</h3>
        {systemOption('ear', '📱 Reconocimiento de voz del teléfono')}
        {PACKS.filter((p) => p.kind === 'ear').map(packCard)}
      </div>

      <div className="ai-section">
        <h3>💬 Charla con IA</h3>
        <p className="small">
          Con IA, Oliver responde a lo que digas (siempre dentro del roleplay de la unidad) y al final te da consejos. También habilita la «Llamada libre» para
          charlar de cualquier tema. Sin IA, Oliver sigue el guion.
        </p>
        {systemOption('brain', '📜 Sin IA: Oliver sigue el guion')}
        {PACKS.filter((p) => p.kind === 'brain').map(packCard)}
      </div>
      {msg && <p className="small">{msg}</p>}
    </div>
  );
}

/** Ajustes de la voz elegida: se guardan por voz y se escuchan con ▶. */
function TunePanel({ tune, piper, onChange, onReset, onTry, busy }: { tune: Tune; piper: boolean; onChange: (t: Partial<Tune>) => void; onReset: () => void; onTry: () => void; busy: boolean }) {
  const slider = (label: string, key: keyof Tune, min: number, max: number, step: number, fmt: (v: number) => string) => (
    <label className="tune">
      <span>
        {label}: <b>{fmt(tune[key])}</b>
      </span>
      <input type="range" min={min} max={max} step={step} value={tune[key]} onChange={(e) => onChange({ [key]: Number(e.target.value) } as Partial<Tune>)} />
    </label>
  );
  const pct = (v: number) => `${Math.round(v * 100)}%`;
  return (
    <div className="options">
      <p className="small">Ajustá cómo suena esta voz (solo en la app: no cambia el volumen ni nada del teléfono).</p>
      {slider('Velocidad', 'speed', 0.6, 1.4, 0.02, pct)}
      {slider('Tono', 'pitch', 0.85, 1.15, 0.01, pct)}
      {slider('Volumen de la voz', 'volume', 0.5, 2.5, 0.05, pct)}
      {piper && slider('Expresividad (entonación)', 'noise', 0.2, 1.0, 0.01, (v) => (v < 0.5 ? `${v.toFixed(2)} · monótona` : v > 0.8 ? `${v.toFixed(2)} · muy viva` : v.toFixed(2)))}
      {piper && slider('Ritmo variado', 'noiseW', 0.2, 1.3, 0.01, (v) => v.toFixed(2))}
      <div className="ai-row">
        <button className="primary" onClick={onTry} disabled={busy}>
          {busy ? '…' : '▶ Escuchar'}
        </button>
        <button className="secondary" onClick={onReset}>
          Restablecer
        </button>
      </div>
    </div>
  );
}

const LAB: { name: string; desc: string; test: AudioTest }[] = [
  { name: '0. Como está ahora', desc: 'Todo igual que en la llamada.', test: {} },
  { name: '1. Sin procesamiento', desc: 'Sin shape(): sin filtro, sin suavizado y sin volumen.', test: { raw: true } },
  { name: '2. Sin PlaybackParams', desc: 'Sin el cambio de tono de Android (solo cambia algo si el tono no está en 100%).', test: { noParams: true } },
  { name: '3. Búfer de 500 ms', desc: 'Reserva de audio más grande (ahora es de ~200 ms).', test: { bufferMs: 500 } },
  { name: '4. PCM de 16 bits', desc: 'Reproducir en 16 bits en vez de float.', test: { pcm16: true } },
  { name: '5. Otro canal de audio', desc: 'Sale por el canal de asistente en vez del de multimedia (por si Samsung le aplica efectos como Dolby Atmos o Adapt Sound).', test: { assistant: true } },
  { name: '6. Guardar el audio crudo', desc: 'Suena normal y guarda lo que sale del motor, sin tocar, en Descargas/CriollEnglish.', test: { save: true } },
];

/** Laboratorio de audio: pruebas de a una variable para encontrar de dónde sale el sonido metálico. */
function AudioLab({ pack, speaker }: { pack: Pack; speaker: number }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [results, setResults] = useState<string[]>([]);
  const run = async (name: string, test: AudioTest) => {
    setBusy(name);
    try {
      const d = await labTest(pack, speaker, test);
      setResults((r) => [diagText(name, d), ...r]);
    } catch (e) {
      setResults((r) => [`${name}: error ${(e as Error).message ?? e}`, ...r]);
    }
    setBusy(null);
  };
  if (!open)
    return (
      <button className="link" onClick={() => setOpen(true)}>
        🔬 Laboratorio de audio (si suena metálico)
      </button>
    );
  return (
    <div className="options">
      <p className="small">
        Escuchá cada prueba y anotá cuál suena mejor. Cada una cambia una sola cosa. La 6 guarda un archivo que podés mandarme para compararlo con el mismo audio
        generado en la computadora.
      </p>
      {LAB.map((t) => (
        <button key={t.name} className="option" disabled={busy !== null} onClick={() => run(t.name, t.test)}>
          {busy === t.name ? '… ' : '▶ '}
          <b>{t.name}</b>
          <br />
          <span className="small">{t.desc}</span>
        </button>
      ))}
      {results.length > 0 && (
        <>
          <pre className="lab-log">{results.join('\n\n')}</pre>
          <div className="ai-row">
            <button className="secondary" onClick={() => navigator.clipboard?.writeText(results.join('\n\n'))}>
              📋 Copiar resultados
            </button>
            <button className="secondary" onClick={() => setResults([])}>
              Borrar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
