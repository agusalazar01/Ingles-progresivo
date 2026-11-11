import { useState } from 'react';
import { useAppState } from '../lib/store';
import { DEFAULT_GROQ, GROQ_MODELS, setGroq, testGroq } from '../lib/groq';

/** IA con internet (opcional): Groq con tu clave gratis. Todo lo demás sigue funcionando sin internet. */
export function GroqSettings() {
  const s = useAppState();
  const g = { ...DEFAULT_GROQ, ...(s.settings.ai.groq ?? {}) };
  const [key, setKey] = useState(g.key);
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const test = async () => {
    setBusy(true);
    setMsg('Probando…');
    try {
      const ms = await testGroq(key, g.model);
      setGroq({ key: key.trim(), on: true });
      setMsg(`✅ Funciona (respondió en ${(ms / 1000).toFixed(1)} s). Quedó prendida.`);
    } catch (e) {
      setMsg(`❌ ${(e as Error).message ?? e}`);
    }
    setBusy(false);
  };

  return (
    <>
      <div className="card">
        <p className="card-title">🌐 IA con internet (opcional)</p>
        <p className="small">
          Con internet, los roleplays te entienden aunque lo digas con otras palabras, el personaje reacciona a lo que contaste y al final te corrige como un
          profe. También corrige tus textos en «Escribir en inglés». Sin internet (o si tarda), la app sigue sola con lo del teléfono, como siempre.
        </p>
        <button className={`option ${g.on ? 'right' : ''}`} disabled={!g.key && !key.trim()} onClick={() => setGroq({ on: !g.on, key: key.trim() })}>
          {g.on ? '✅ Usar la IA online cuando haya internet' : '⬜ Usar la IA online cuando haya internet'}
        </button>
      </div>

      <div className="card">
        <p className="card-title">Tu clave de Groq (gratis)</p>
        <ol className="small">
          <li>Entrá a console.groq.com y creá una cuenta (con Google sirve).</li>
          <li>Andá a «API Keys» › «Create API Key» y copiala.</li>
          <li>Pegala acá y tocá «Probar».</li>
        </ol>
        <div className="ai-row">
          <input
            className="answer"
            style={{ flex: 4 }}
            type={show ? 'text' : 'password'}
            autoComplete="off"
            spellCheck={false}
            placeholder="gsk_…"
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />
          <button className="secondary" style={{ flex: 1, minWidth: 52 }} onClick={() => setShow(!show)} aria-label={show ? 'Ocultar' : 'Mostrar'}>
            {show ? '🙈' : '👁️'}
          </button>
        </div>
        <button className="primary" disabled={busy || key.trim().length < 10} onClick={test}>
          Probar y guardar
        </button>
        {g.key && (
          <button
            className="link"
            onClick={() => {
              setGroq({ key: '', on: false });
              setKey('');
              setMsg('Clave borrada.');
            }}
          >
            Borrar la clave
          </button>
        )}
        {msg && <p className="small">{msg}</p>}
      </div>

      <div className="card">
        <p className="card-title">Modelo</p>
        {GROQ_MODELS.map((m) => (
          <button key={m.id} className={`option ${g.model === m.id ? 'right' : ''}`} onClick={() => setGroq({ model: m.id })}>
            <b>{m.title}</b> <span className="small">· {m.desc}</span>
          </button>
        ))}
      </div>

      <div className="card">
        <p className="card-title">🔒 Privacidad</p>
        <p className="small">
          La clave queda guardada solo en este teléfono. Cuando la IA online está prendida, se manda a Groq (servidores en EE. UU.) el texto de lo que decís
          en el roleplay y del guion; el audio no sale del teléfono (lo pasa a texto el reconocimiento de voz). Groq no usa esos datos para entrenar
          modelos. Si preferís que nada salga del teléfono, dejala apagada.
        </p>
      </div>
    </>
  );
}
