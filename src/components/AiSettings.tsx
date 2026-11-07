import { useEffect, useState, useSyncExternalStore } from 'react';
import { setState, useAppState } from '../lib/store';
import {
  aiAvailable,
  aiStatus,
  cancelDownload,
  getDownloads,
  packSpeakers,
  PACKS,
  removePack,
  startDownload,
  subscribeDownloads,
  tryVoice,
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
  const [installed, setInstalled] = useState<Record<string, number>>({});
  const [free, setFree] = useState(0);
  const [speakers, setSpeakers] = useState<{ id: number; name: string }[]>([]);
  const [testing, setTesting] = useState<number | null>(null);
  const [msg, setMsg] = useState('');

  const set = (patch: Partial<AiChoice>) => setState((st) => ({ ...st, settings: { ...st.settings, ai: { ...st.settings.ai, ...patch } } }));
  const refresh = () =>
    aiStatus().then((r) => {
      setInstalled(r.installed);
      setFree(r.freeBytes);
    });

  useEffect(() => {
    refresh();
  }, [Object.keys(dl).join()]);

  const voicePack = PACKS.find((p) => p.id === ai.voice && p.id in installed);
  useEffect(() => {
    if (voicePack) packSpeakers(voicePack).then(setSpeakers);
    else setSpeakers([]);
  }, [voicePack?.id]);

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
      await tryVoice(p, speaker);
    } catch (e) {
      setMsg(`No pude probar la voz: ${(e as Error).message ?? e}`);
    }
    setTesting(null);
  };

  const packCard = (p: Pack) => {
    const has = p.id in installed;
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
            {!has && (
              <button className="secondary" onClick={() => download(p)}>
                ⬇️ Bajar ({size(p.mb)})
              </button>
            )}
            {has && !chosen && (
              <button className="primary" onClick={() => set({ [KEY[p.kind]]: p.id } as Partial<AiChoice>)}>
                Usar
              </button>
            )}
            {has && (
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
      </div>
    );
  };

  const systemOption = (kind: PackKind, label: string) => {
    const value = kind === 'brain' ? 'off' : 'system';
    const on = ai[KEY[kind]] === value || !(ai[KEY[kind]] in installed);
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
