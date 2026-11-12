import { useEffect, useRef, useState } from 'react';
import { Icon } from '../components/ui';
import { BackButton } from '../components/BackButton';
import { useBack } from '../lib/nav';
import { canListen, listenManual, say, stopSpeaking, type ManualListen } from '../lib/speech';
import { useAppState } from '../lib/store';
import { userLevel } from '../lib/progress';
import type { Level } from '../content/types';
import { chosenAi, listenManualWith, loadEarOnly, loadVoicePack, releaseCallAi, speakWith, type CallAi } from '../lib/ai';
import { castVoice } from './Roleplays';
import { GROQ_DAILY_TOKENS, groqReady, groqUsageToday } from '../lib/groq';
import { TUTOR_TOPICS, tutorHelp, tutorSummary, tutorTurn, type TutorFix, type TutorMsg, type TutorSummary, type TutorTopic } from '../lib/tutor';
import { savePhrase } from '../lib/phrases';

const LEVELS: Level[] = ['A2', 'B1', 'B2', 'C1'];
const TEACHER = 'Kate';

type Entry = { who: 'teacher'; text: string; tip?: string } | { who: 'you'; text: string; fixes?: TutorFix[]; natural?: string; checked?: boolean };

const msgs = (log: Entry[]): TutorMsg[] => log.map((e) => ({ who: e.who, text: e.text }));

/** Charla con la profe: roleplay directo con la IA online, solo en inglés, con corrección después de cada frase. */
export function Tutor({ onExit, onSettings }: { onExit: () => void; onSettings: () => void }) {
  const s = useAppState();
  const [stage, setStage] = useState<{ v: 'pick' } | { v: 'chat'; topic: TutorTopic; level: Level } | { v: 'done'; topic: TutorTopic; level: Level; log: Entry[] }>({ v: 'pick' });
  const [level, setLevel] = useState<Level>(() => (LEVELS.includes(userLevel(s) as Level) ? (userLevel(s) as Level) : 'B1'));
  const back = () => (stage.v === 'pick' ? onExit() : (stopSpeaking(), setStage({ v: 'pick' })));
  useBack(true, back, 2);

  if (stage.v === 'chat') return <Chat key={stage.topic.id + stage.level} topic={stage.topic} level={stage.level} onBack={back} onDone={(log) => setStage({ v: 'done', topic: stage.topic, level: stage.level, log })} />;
  if (stage.v === 'done') return <Summary topic={stage.topic} level={stage.level} log={stage.log} onAgain={() => setStage({ v: 'chat', topic: stage.topic, level: stage.level })} onBack={() => setStage({ v: 'pick' })} />;

  const ready = groqReady();
  const used = groqUsageToday();
  return (
    <div className="screen roleplays">
      <div className="top-bar">
        <BackButton onClick={back} />
      </div>
      <p className="eyebrow">Con la IA online</p>
      <h1>🎓 Charla con la profe</h1>
      <p className="small">
        Hablás con {TEACHER} solo en inglés, como en un roleplay pero libre. Después de cada frase tuya te corrige lo que dijiste mal y te explica por qué, en
        español. Se escucha con tu reconocimiento de voz (Parakeet, si lo elegiste).
      </p>
      {!ready && (
        <div className="card">
          <p className="card-title">Falta prender la IA online</p>
          <p className="small">Esta charla necesita internet y tu clave gratis de Groq. Cargala una vez en Configuración y queda lista.</p>
          <button className="primary" onClick={onSettings}>
            Ir a Configuración › IA con internet
          </button>
        </div>
      )}
      <p className="small">
        Hoy usaste {used.tokens.toLocaleString('es')} de {GROQ_DAILY_TOKENS.toLocaleString('es')} del tope gratis (cada intercambio gasta unos 1.500 a 2.500).
      </p>
      <p className="sum-head">Tu nivel</p>
      <div className="chips">
        {LEVELS.map((l) => (
          <button key={l} className={`chip ${level === l ? 'chosen' : ''}`} onClick={() => setLevel(l)}>
            {l}
          </button>
        ))}
      </div>
      <p className="sum-head">¿De qué hablamos?</p>
      <div className="options">
        {TUTOR_TOPICS.map((t) => (
          <button key={t.id} className="option" disabled={!ready} onClick={() => setStage({ v: 'chat', topic: t, level })}>
            {t.es}
          </button>
        ))}
      </div>
    </div>
  );
}

function Chat({ topic, level, onBack, onDone }: { topic: TutorTopic; level: Level; onBack: () => void; onDone: (log: Entry[]) => void }) {
  const [log, setLog] = useState<Entry[]>([]);
  const [busy, setBusy] = useState(true);
  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const [hearing, setHearing] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [typed, setTyped] = useState('');
  const [keyboard, setKeyboard] = useState(false);
  const [micOk, setMicOk] = useState(false);
  const [error, setError] = useState('');
  const [help, setHelp] = useState<{ en: string; es: string }[] | null>(null);
  const alive = useRef(true);
  const mic = useRef<ManualListen | null>(null);
  const voice = useRef<CallAi | null>(null);
  const cast = useRef<{ speaker: number; sys?: string }>({ speaker: 0 });
  const logRef = useRef(log);
  logRef.current = log;
  const retry = useRef<(() => void) | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const last = useRef('');

  const voiceSay = async (text: string, slow = false) => {
    const v = voice.current;
    const { speaker, sys } = cast.current;
    if (v?.voice && !sys) {
      try {
        await speakWith(v.voice, speaker, text);
        return;
      } catch {
        /* sigue con la voz del sistema */
      }
    }
    await Promise.race([say(text, { slow, lang: sys ? undefined : 'en-AU', voice: sys }).catch(() => {}), new Promise((r) => setTimeout(r, 2500 + text.length * 80))]);
  };

  const speak = async (text: string) => {
    last.current = text;
    setSpeaking(true);
    await voiceSay(text);
    setSpeaking(false);
  };

  /** Pide el turno a la IA; con la respuesta marca tu frase (si la hubo) y habla la profe. */
  const run = async (said?: string) => {
    setError('');
    setBusy(true);
    setHelp(null);
    setThinking(true);
    // El historial es lo anterior a tu frase (tu frase va aparte, como último mensaje).
    const history = said ? msgs(logRef.current.slice(0, -1)) : [];
    try {
      const t = await tutorTurn({ level, topic, history, said, name: TEACHER });
      if (!alive.current) return;
      setThinking(false);
      setLog((l) => {
        const out = said ? l.map((e, i) => (i === l.length - 1 && e.who === 'you' ? { ...e, fixes: t.fixes, natural: t.natural, checked: true } : e)) : l;
        return [...out, { who: 'teacher', text: t.reply, tip: t.tip || undefined }];
      });
      await speak(t.reply);
    } catch (e) {
      if (!alive.current) return;
      setThinking(false);
      setError(String((e as Error).message ?? e));
      retry.current = () => run(said);
    }
    if (alive.current) setBusy(false);
  };

  useEffect(() => {
    alive.current = true;
    canListen().then(setMicOk);
    (async () => {
      try {
        const c = await chosenAi();
        cast.current = await castVoice(c, { name: TEACHER, role: 'profesora' });
        if (c.voice && !cast.current.sys) await loadVoicePack(c.voice, cast.current.speaker);
        const ear = await loadEarOnly(c);
        voice.current = { ...c, ear, brain: null };
        if (ear) setMicOk(true);
      } catch {
        voice.current = null;
      }
      if (alive.current) run();
    })();
    return () => {
      alive.current = false;
      mic.current?.stop();
      stopSpeaking();
      if (voice.current?.voice || voice.current?.ear) releaseCallAi();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log, thinking, error, help]);

  const send = async (raw: string) => {
    const said = raw.trim();
    if (!said || busy) return;
    setTyped('');
    const next: Entry[] = [...logRef.current, { who: 'you', text: said }];
    logRef.current = next;
    setLog(next);
    await run(said);
  };

  const toggleMic = async () => {
    if (listening) {
      const m = mic.current;
      mic.current = null;
      setListening(false);
      setHearing(true);
      const text = m ? await m.stop() : '';
      setHearing(false);
      if (text.trim()) await send(text);
      return;
    }
    if (busy) return;
    try {
      stopSpeaking();
      setTyped('');
      const ear = voice.current?.ear;
      if (ear) {
        const m = listenManualWith(ear, 'English');
        mic.current = { stop: m.stop };
      } else mic.current = await listenManual('en-US', (t) => setTyped(t));
      setListening(true);
    } catch {
      setListening(false);
    }
  };

  const askHelp = async () => {
    setHelp([]);
    try {
      setHelp(await tutorHelp({ level, topic, history: msgs(logRef.current) }));
    } catch {
      setHelp(null);
    }
  };

  const mine = log.filter((e) => e.who === 'you').length;
  const state = listening ? 'Tocá de nuevo para enviar' : hearing ? 'Escuchando lo que dijiste…' : thinking ? `${TEACHER} está pensando…` : speaking ? `${TEACHER} está hablando…` : busy ? 'Un momento…' : 'Tocá para hablar';
  return (
    <div className="screen roleplays talk">
      <div className="top-bar">
        <BackButton onClick={onBack} label="Salir" />
        <p className="eyebrow">
          {TEACHER} · {topic.es} · {level}
        </p>
        <button className="link" disabled={!mine || busy} onClick={() => (stopSpeaking(), onDone(logRef.current))}>
          Terminar
        </button>
      </div>
      <div className="rp-log">
        {log.map((e, i) =>
          e.who === 'teacher' ? (
            <div key={i} className="bubble them">
              <span className="bubble-name">{TEACHER}</span>
              {e.text}
              {e.tip && <p className="small">💡 {e.tip}</p>}
            </div>
          ) : (
            <div key={i} className="tutor-you">
              <div className="bubble you">{e.text}</div>
              {e.checked && <FixCard fixes={e.fixes ?? []} natural={e.natural ?? ''} />}
            </div>
          ),
        )}
        {(listening || hearing) && <div className="bubble you ghost">{typed || (hearing ? '…' : '🎙️ …')}</div>}
        {thinking && <div className="bubble them ghost">…</div>}
        {error && (
          <div className="card">
            <p className="small">⚠️ {error}</p>
            <button className="secondary" onClick={() => retry.current?.()}>
              Probar de nuevo
            </button>
          </div>
        )}
        {help && (
          <div className="card">
            <p className="card-title">Podrías decir</p>
            {help.length === 0 && <p className="small">Pensando…</p>}
            {help.map((h) => (
              <div key={h.en} className="vocab-row">
                <button className="round small-round" onClick={() => say(h.en, { lang: 'en-AU' })} aria-label="Escuchar">
                  🔊
                </button>
                <div className="vocab-text">
                  <b>{h.en}</b>
                  <p className="small">{h.es}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="rp-controls">
        {keyboard ? (
          <form
            className="composer"
            onSubmit={(ev) => {
              ev.preventDefault();
              send(typed);
            }}
          >
            <button type="button" className="round" aria-label="Usar el micrófono" onClick={() => setKeyboard(false)} disabled={!micOk}>
              <Icon name="mic" size={20} />
            </button>
            <input className="answer" value={typed} onChange={(ev) => setTyped(ev.target.value)} placeholder="Write in English" autoCapitalize="sentences" disabled={busy} autoFocus />
            <button className="round send" type="submit" aria-label="Enviar" disabled={busy || !typed.trim()}>
              <Icon name="chevron" size={22} />
            </button>
          </form>
        ) : (
          <div className="talk-dock">
            <button className="dock-side" onClick={() => setKeyboard(true)} aria-label="Escribir con el teclado">
              ⌨️
            </button>
            <div className="dock-center">
              <button className={`talk-mic ${listening ? 'on' : ''}`} onClick={toggleMic} disabled={!micOk || (busy && !listening) || hearing} aria-label={state}>
                {listening ? '↑' : <Icon name="mic" size={34} />}
              </button>
              <span className="small">{micOk ? state : 'Micrófono no disponible: escribí con el teclado'}</span>
            </div>
            <div className="dock-side-col">
              <button className="dock-side" onClick={() => voiceSay(last.current, true)} disabled={!last.current || listening || busy} aria-label="Repetir lento">
                🔁
              </button>
              <button className="dock-side" onClick={askHelp} disabled={busy || listening || !log.length} aria-label="No sé qué decir">
                💡
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** La corrección de una frase tuya: qué estuvo mal, cómo se dice bien y por qué. */
function FixCard({ fixes, natural }: { fixes: TutorFix[]; natural: string }) {
  if (!fixes.length && !natural) return <p className="small tutor-ok">✓ Bien dicho</p>;
  return (
    <div className="sum-item fix tutor-fix">
      {fixes.map((f, i) => (
        <div key={i}>
          <p className="sum-said">
            <s>{f.wrong}</s> → <b>{f.better}</b>{' '}
            <button className="round small-round" onClick={() => say(f.better, { lang: 'en-AU' })} aria-label="Escuchar la corrección">
              🔊
            </button>
          </p>
          <p className="small">{f.why}</p>
        </div>
      ))}
      {natural && (
        <p className="small">
          💬 Más natural: <b>{natural}</b>
        </p>
      )}
    </div>
  );
}

function Summary({ topic, level, log, onAgain, onBack }: { topic: TutorTopic; level: Level; log: Entry[]; onAgain: () => void; onBack: () => void }) {
  const [sum, setSum] = useState<TutorSummary | 'wait' | string>('wait');
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const you = log.filter((e): e is Extract<Entry, { who: 'you' }> => e.who === 'you');
  const fixed = you.filter((e) => e.fixes?.length);
  const total = fixed.reduce((a, e) => a + (e.fixes?.length ?? 0), 0);
  useEffect(() => {
    let alive = true;
    tutorSummary({ level, topic, said: you.map((e) => e.text) })
      .then((r) => alive && setSum(r))
      .catch((e) => alive && setSum(String((e as Error).message ?? e)));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const save = (en: string, es: string) => {
    if (saved.has(en)) return;
    savePhrase({ es, en });
    setSaved(new Set([...saved, en]));
  };
  return (
    <div className="screen roleplays writing">
      <p className="summary-emoji" aria-hidden="true">
        {total === 0 ? '🏆' : '🎉'}
      </p>
      <h1 className="center">Resumen de la charla</h1>
      <p className="center small">
        {topic.es} · {level}
      </p>
      <div className="summary-stats">
        <div className="stat">
          <span className="stat-num">{you.length}</span>
          <span className="stat-label">frases tuyas</span>
        </div>
        <div className="stat">
          <span className="stat-num">{you.length - fixed.length}</span>
          <span className="stat-label">sin errores</span>
        </div>
        <div className="stat">
          <span className="stat-num">{total}</span>
          <span className="stat-label">correcciones</span>
        </div>
      </div>

      {fixed.length > 0 && (
        <div className="card">
          <p className="card-title">Lo que corregimos</p>
          {fixed.map((e, i) => (
            <div key={i} className="sum-item fix">
              <p className="sum-said">
                <s>{e.text}</s>
              </p>
              {e.fixes!.map((f, j) => (
                <p key={j} className="small">
                  <s>{f.wrong}</s> → <b>{f.better}</b> · {f.why}
                </p>
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <p className="card-title">Comentarios de la profe</p>
        {sum === 'wait' && <p className="small">Preparando el resumen…</p>}
        {typeof sum === 'string' && sum !== 'wait' && <p className="small">No pude armar el resumen ({sum}). Arriba tenés lo corregido frase por frase.</p>}
        {typeof sum === 'object' && (
          <>
            {sum.good.map((g, i) => (
              <div key={i} className="sum-item good">
                <p className="small">✅ {g}</p>
              </div>
            ))}
            {sum.patterns.length > 0 && <p className="sum-head">Para practicar</p>}
            {sum.patterns.map((p, i) => (
              <div key={i} className="sum-item fix">
                <p className="small">
                  <b>{p.mistake}</b>
                </p>
                <p className="small">{p.why}</p>
              </div>
            ))}
            {sum.vocab.length > 0 && <p className="sum-head">Para sonar más natural</p>}
            {sum.vocab.map((v) => (
              <div key={v.en} className="vocab-row">
                <button className="round small-round" onClick={() => say(v.en, { lang: 'en-AU' })} aria-label={`Escuchar ${v.en}`}>
                  🔊
                </button>
                <div className="vocab-text">
                  <b>{v.en}</b>
                  <p className="small">{v.es}</p>
                </div>
                <button className="round small-round" onClick={() => save(v.en, v.es)} aria-label="Guardar">
                  {saved.has(v.en) ? '✅' : '🔖'}
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      <button className="primary" onClick={onAgain}>
        Charlar de nuevo
      </button>
      <button className="link" onClick={onBack}>
        Elegir otro tema
      </button>
    </div>
  );
}
