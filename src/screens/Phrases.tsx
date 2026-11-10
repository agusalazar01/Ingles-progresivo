import { useEffect, useRef, useState } from 'react';
import { BackButton } from '../components/BackButton';
import { useBack } from '../lib/nav';
import { canListen, intelligibility, listen, say } from '../lib/speech';
import { useAppState, type Phrase } from '../lib/store';
import { aiAvailable, chosenAi, listenWith, loadBrain, OliverAi, releaseCallAi, type CallAi } from '../lib/ai';
import {
  bankMatch,
  BANK,
  deletePhrase,
  duePhrases,
  gradePhrase,
  parseRendering,
  savePhrase,
  translateRequest,
  TRANSLATOR,
  updatePhrase,
  type Rendering,
} from '../lib/phrases';

type Mode = 'new' | 'practice' | 'list';

/**
 * «Decilo en inglés»: escribí o decí algo en español, intentalo en inglés y la IA del teléfono te da
 * la versión natural. Todo se procesa en el teléfono; la IA se carga solo en esta pantalla.
 */
export function Phrases({ onExit }: { onExit: () => void }) {
  const s = useAppState();
  const list = s.phrases ?? [];
  const due = duePhrases(list);
  const [mode, setMode] = useState<Mode>(due.length ? 'practice' : 'new');
  useBack(true, onExit, 2);

  // IA: se carga al pedir la primera traducción y se libera al salir.
  const ai = useRef<{ chosen: CallAi | null; brain: boolean; ear: boolean }>({ chosen: null, brain: false, ear: false });
  const [micOk, setMicOk] = useState(false);
  useEffect(() => {
    canListen().then(setMicOk);
    chosenAi().then((c) => (ai.current.chosen = c));
    return () => {
      if (ai.current.brain || ai.current.ear) releaseCallAi();
    };
  }, []);

  const ensureBrain = async (): Promise<boolean> => {
    const c = ai.current.chosen ?? (await chosenAi());
    ai.current.chosen = c;
    if (!c.brain) return false;
    try {
      if (!ai.current.brain) {
        await loadBrain(c.brain, TRANSLATOR, 0.5, c.ear?.asr === 'brain');
        ai.current.brain = true;
      } else await OliverAi.resetChat({ system: TRANSLATOR, temperature: 0.5 });
      return true;
    } catch {
      return false;
    }
  };

  /** Escucha en español o en inglés. Usa Qwen3-ASR si está elegido (entiende los dos); si no, el del teléfono. */
  const hear = async (lang: 'es' | 'en'): Promise<string[]> => {
    const c = ai.current.chosen ?? (await chosenAi());
    ai.current.chosen = c;
    // Qwen3-ASR y Gemma 4 entienden español e inglés; los otros oídos, solo inglés.
    const ear = c.ear && (lang === 'en' || c.ear.asr === 'qwen3' || c.ear.asr === 'brain') ? c.ear : null;
    if (ear && aiAvailable()) {
      try {
        if (ear.asr === 'brain') {
          if (!ai.current.brain && c.brain) {
            await loadBrain(c.brain, TRANSLATOR, 0.5, true);
            ai.current.brain = true;
          }
        } else if (!ai.current.ear) {
          await OliverAi.loadEar({ id: ear.id, kind: ear.asr ?? 'moonshine' });
          ai.current.ear = true;
        }
        const r = await listenWith(ear, { language: lang === 'es' ? 'Spanish' : 'English' });
        return r.text ? [r.text] : [];
      } catch {
        /* sigue con el del teléfono */
      }
    }
    return listen(lang === 'es' ? 'es-UY' : 'en-AU');
  };

  return (
    <div className="screen phrases">
      <div className="top-bar">
        <BackButton onClick={onExit} />
      </div>
      <p className="eyebrow">Tus frases</p>
      <h1>🗣️ Decilo en inglés</h1>
      <div className="chips">
        <button className={`chip ${mode === 'new' ? 'on' : ''}`} onClick={() => setMode('new')}>
          Frase nueva
        </button>
        <button className={`chip ${mode === 'practice' ? 'on' : ''}`} onClick={() => setMode('practice')}>
          Practicar{due.length ? ` (${due.length})` : ''}
        </button>
        <button className={`chip ${mode === 'list' ? 'on' : ''}`} onClick={() => setMode('list')}>
          Mis frases ({list.length})
        </button>
      </div>
      {mode === 'new' && <NewPhrase micOk={micOk} hear={hear} ensureBrain={ensureBrain} onSaved={() => setMode(duePhrases(list).length ? 'practice' : 'new')} />}
      {mode === 'practice' && <Practice due={due} micOk={micOk} hear={hear} ensureBrain={ensureBrain} onNew={() => setMode('new')} />}
      {mode === 'list' && <PhraseList list={list} />}
    </div>
  );
}

type Hear = (lang: 'es' | 'en') => Promise<string[]>;

function MicButton({ lang, hear, onText, disabled }: { lang: 'es' | 'en'; hear: Hear; onText: (t: string) => void; disabled?: boolean }) {
  const [on, setOn] = useState(false);
  return (
    <button
      className="secondary"
      disabled={disabled || on}
      onClick={async () => {
        setOn(true);
        try {
          const r = await hear(lang);
          if (r[0]) onText(r[0]);
        } catch {
          /* sin micrófono */
        }
        setOn(false);
      }}
    >
      {on ? '🎙️ Escuchando…' : lang === 'es' ? '🎙️ Decilo en español' : '🎙️ Decilo en inglés'}
    </button>
  );
}

function NewPhrase({ micOk, hear, ensureBrain, onSaved }: { micOk: boolean; hear: Hear; ensureBrain: () => Promise<boolean>; onSaved: () => void }) {
  const [es, setEs] = useState('');
  const [attempt, setAttempt] = useState('');
  const [step, setStep] = useState<'es' | 'try' | 'result'>('es');
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<Rendering | null>(null);
  const [source, setSource] = useState<'ai' | 'bank' | 'none'>('none');
  const [review, setReview] = useState(false);
  const [saved, setSaved] = useState(false);

  const ask = async (again = false) => {
    setBusy(true);
    setSaved(false);
    let out: Rendering | null = null;
    if (await ensureBrain()) {
      try {
        const r = await OliverAi.chat({ text: translateRequest(es, attempt, again) });
        out = parseRendering(r.text);
        if (!out && r.text.trim()) {
          // Formato raro: se usa la primera línea como versión natural.
          const first = r.text.split('\n').map((x) => x.trim()).find(Boolean) ?? '';
          out = { natural: first, simple: first, chunks: [], feedback: '' };
        }
      } catch {
        out = null;
      }
      setSource(out ? 'ai' : 'none');
    }
    if (!out) {
      const m = bankMatch(es);
      if (m) {
        out = { natural: m.en, simple: m.simple ?? m.en, chunks: m.chunks, feedback: '' };
        setSource('bank');
      } else setSource('none');
    }
    setRes(out);
    setStep('result');
    setBusy(false);
  };

  const reset = () => {
    setEs('');
    setAttempt('');
    setRes(null);
    setReview(false);
    setSaved(false);
    setStep('es');
  };

  if (step === 'es') {
    return (
      <div className="card">
        <p className="card-title">1. ¿Qué querés decir?</p>
        <p className="small">Algo que pensaste en español y no sabés cómo decir.</p>
        <textarea className="answer" rows={3} value={es} onChange={(e) => setEs(e.target.value)} placeholder="Ej.: Me quedé dormido y llegué tarde al laburo" />
        <div className="row">
          {micOk && <MicButton lang="es" hear={hear} onText={(t) => setEs(t)} />}
          <button className="primary" disabled={!es.trim()} onClick={() => setStep('try')}>
            Seguir
          </button>
        </div>
        <BankPicker
          onPick={(b) => {
            setEs(b.es);
            setStep('try');
          }}
        />
      </div>
    );
  }

  if (step === 'try') {
    return (
      <div className="card">
        <p className="card-title">2. Intentalo vos primero</p>
        <p className="small">Aunque salga mal: intentarlo antes de ver la respuesta es lo que hace que se te quede.</p>
        <p className="phrase-es">«{es}»</p>
        <textarea className="answer" rows={2} value={attempt} onChange={(e) => setAttempt(e.target.value)} placeholder="Tu versión en inglés" autoCapitalize="off" />
        <div className="row">
          {micOk && <MicButton lang="en" hear={hear} onText={(t) => setAttempt(t)} />}
          <button className="primary" disabled={busy} onClick={() => ask()}>
            {busy ? 'Pensando…' : attempt.trim() ? 'Ver cómo se dice' : 'No sé, mostrame'}
          </button>
        </div>
        <button className="link" onClick={() => setStep('es')}>
          Cambiar la frase
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <p className="card-title">3. Así se dice</p>
      <p className="phrase-es">«{es}»</p>
      {!res && (
        <>
          <div className="feedback neutral">
            <p>Esa frase no está en el banco de frases comunes.</p>
            <p className="small">Guardala con tu versión para repasarla y marcala para verla con tu profe, o probá con una frase parecida del banco.</p>
          </div>
          {attempt.trim() && (
            <button
              className="primary"
              disabled={saved}
              onClick={() => {
                savePhrase({ es, en: attempt.trim(), review: true });
                setSaved(true);
              }}
            >
              {saved ? '✓ Guardada para revisar' : '📝 Guardar mi versión para revisar con la profe'}
            </button>
          )}
        </>
      )}
      {res && (
        <>
          {attempt.trim() && <p className="small">Tu intento: {attempt}</p>}
          <div className="phrase-out">
            <p className="phrase-label">Natural (como en Australia)</p>
            <p className="phrase-en">
              {res.natural}{' '}
              <button className="link" aria-label="Escuchar" onClick={() => say(res.natural, { accent: 'en-AU' })}>
                ▶
              </button>
            </p>
            {res.simple && res.simple !== res.natural && (
              <>
                <p className="phrase-label">Más simple</p>
                <p>
                  {res.simple}{' '}
                  <button className="link" aria-label="Escuchar" onClick={() => say(res.simple, { accent: 'en-AU' })}>
                    ▶
                  </button>
                </p>
              </>
            )}
            {res.chunks.length > 0 && (
              <>
                <p className="phrase-label">Bloques para reusar</p>
                <div className="chips">
                  {res.chunks.map((c) => (
                    <span key={c} className="chip">
                      {c}
                    </span>
                  ))}
                </div>
              </>
            )}
            {res.feedback && <div className="feedback neutral">{res.feedback}</div>}
            {source === 'bank' && <p className="small">Del banco de frases comunes.</p>}
          </div>
          <label className="check">
            <input type="checkbox" checked={review} onChange={(e) => setReview(e.target.checked)} /> 📝 Para revisar con la profe
          </label>
          <div className="row">
            <button
              className="primary"
              disabled={saved}
              onClick={() => {
                savePhrase({ es, en: res.natural, simple: res.simple, chunks: res.chunks, note: res.feedback || undefined, review });
                setSaved(true);
              }}
            >
              {saved ? '✓ Guardada' : 'Guardar en mis frases'}
            </button>
            {source === 'ai' && (
              <button className="secondary" disabled={busy} onClick={() => ask(true)}>
                {busy ? 'Pensando…' : '🔁 Esto no suena bien'}
              </button>
            )}
          </div>
        </>
      )}
      <div className="row">
        <button className="link" onClick={reset}>
          Otra frase
        </button>
        {saved && (
          <button className="link" onClick={onSaved}>
            Practicar ahora
          </button>
        )}
      </div>
    </div>
  );
}

function BankPicker({ onPick }: { onPick: (b: (typeof BANK)[number]) => void }) {
  const [open, setOpen] = useState(false);
  if (!open)
    return (
      <button className="link" onClick={() => setOpen(true)}>
        Ver frases comunes para elegir
      </button>
    );
  return (
    <div className="bank">
      {BANK.map((b) => (
        <button key={b.es} className="bank-item" onClick={() => onPick(b)}>
          {b.es}
        </button>
      ))}
    </div>
  );
}

function Practice({ due, micOk, hear, onNew }: { due: Phrase[]; micOk: boolean; hear: Hear; ensureBrain: () => Promise<boolean>; onNew: () => void }) {
  const [queue] = useState(() => due.map((p) => p.id));
  const [pos, setPos] = useState(0);
  const [typed, setTyped] = useState('');
  const [shown, setShown] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const s = useAppState();
  const p = (s.phrases ?? []).find((x) => x.id === queue[pos]);

  if (!queue.length || !p || pos >= queue.length) {
    return (
      <div className="card">
        <p className="card-title">{queue.length ? '¡Listo por hoy!' : 'No hay frases para repasar hoy'}</p>
        <p className="small">Las frases vuelven justo antes de que se te olviden.</p>
        <button className="primary" onClick={onNew}>
          Agregar una frase
        </button>
      </div>
    );
  }

  const next = (o: 'good' | 'hard' | 'again') => {
    gradePhrase(p.id, o);
    setTyped('');
    setShown(false);
    setScore(null);
    setPos(pos + 1);
  };

  const check = (heard: string[]) => {
    setScore(intelligibility(p.en, heard).score);
    setShown(true);
  };

  return (
    <div className="card">
      <p className="card-title">
        Frase {pos + 1} de {queue.length}
      </p>
      <p className="phrase-es">«{p.es}»</p>
      {!shown && (
        <>
          <input className="answer" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="Decila o escribila en inglés" autoCapitalize="off" />
          <div className="row">
            {micOk && (
              <MicButton
                lang="en"
                hear={hear}
                onText={(t) => {
                  setTyped(t);
                  check([t]);
                }}
              />
            )}
            <button className="primary" onClick={() => (typed.trim() ? check([typed]) : setShown(true))}>
              {typed.trim() ? 'Comprobar' : 'Mostrar'}
            </button>
          </div>
        </>
      )}
      {shown && (
        <>
          {typed.trim() && <p className="small">Dijiste: {typed}</p>}
          <p className="phrase-en">
            {p.en}{' '}
            <button className="link" aria-label="Escuchar" onClick={() => say(p.en, { accent: 'en-AU' })}>
              ▶
            </button>
          </p>
          {p.simple && p.simple !== p.en && <p className="small">Más simple: {p.simple}</p>}
          {score !== null && <p className="small">Se parece en un {Math.round(score * 100)} % a la frase guardada.</p>}
          <p className="small">¿Cómo te salió?</p>
          <div className="row">
            <button className="secondary" onClick={() => next('again')}>
              No me salió
            </button>
            <button className="secondary" onClick={() => next('hard')}>
              Me costó
            </button>
            <button className="primary" onClick={() => next('good')}>
              Bien
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function PhraseList({ list }: { list: Phrase[] }) {
  const [onlyReview, setOnlyReview] = useState(false);
  const shown = (onlyReview ? list.filter((p) => p.review) : list).slice().reverse();
  return (
    <div className="card">
      <label className="check">
        <input type="checkbox" checked={onlyReview} onChange={(e) => setOnlyReview(e.target.checked)} /> Solo las de revisar con la profe
      </label>
      {!shown.length && <p className="small">Todavía no hay frases.</p>}
      {shown.map((p) => (
        <div key={p.id} className="phrase-row">
          <p className="small">{p.es}</p>
          <p>
            <b>{p.en}</b>{' '}
            <button className="link" aria-label="Escuchar" onClick={() => say(p.en, { accent: 'en-AU' })}>
              ▶
            </button>
          </p>
          <div className="row">
            <button className="link" onClick={() => updatePhrase(p.id, { review: !p.review })}>
              {p.review ? '📝 Para la profe (quitar)' : 'Marcar para la profe'}
            </button>
            <button className="link" onClick={() => deletePhrase(p.id)}>
              Borrar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
