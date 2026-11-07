import { useEffect, useRef, useState } from 'react';
import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { callById, type CallScript, type UserTurn } from '../content/calls';
import { unitById } from '../content/curriculum';
import { Oliver } from '../components/Oliver';
import bg from '../assets/call/background.svg?url';
import arm from '../assets/call/arm.svg?raw';
import { ack, matchTurn } from '../lib/call';
import { canListen, listen, say, stopSpeaking } from '../lib/speech';
import { ringtone, sfxCorrect, sfxHangup, sfxPickup, sfxWrong } from '../lib/sfx';
import { saveCall } from '../lib/store';
import { useBack } from '../lib/nav';
import {
  chosenAi,
  cleanReply,
  FEEDBACK_REQUEST,
  FREE_PROMPT,
  loadCallAi,
  OliverAi,
  releaseCallAi,
  roleplayPrompt,
  shortReply,
  speakWith,
  type CallAi,
} from '../lib/ai';

interface LogLine {
  who: 'oliver' | 'you';
  text: string;
  praise?: string;
  tip?: string;
  model?: string;
}

const SORRY = ['Sorry, what was that?', 'Come again, mate?', "Sorry, I didn't catch that."];
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const FREE_OPENER = "G'day mate! Good to see ya. How are you going? What do you reckon we have a yarn about today?";
const BYE_RE = /\b(bye|see ya|see you|gotta go|got to go|hooroo|catch you|talk later|good night)\b/i;
const MIN_RING = 4300;

/**
 * Llamada con Oliver: suena, atiende y charla. Con un guion de la unidad (roleplay) o libre.
 * Si en Ajustes hay IA descargada, Oliver usa esa voz, ese oído y/o esa charla; si no, la del teléfono.
 * La IA se carga mientras suena y se libera al cortar.
 */
export function Call({ callId, free = false, onExit, onSettings }: { callId?: string; free?: boolean; onExit: () => void; onSettings?: () => void }) {
  const script: CallScript | undefined = callId ? callById(callId) : undefined;
  const unit = script ? unitById(script.unitId) : undefined;
  const [phase, setPhase] = useState<'ringing' | 'talk' | 'review' | 'needs-ai'>('ringing');
  const [ai, setAi] = useState<CallAi>({ voice: null, ear: null, brain: null, speaker: 0 });
  const [idx, setIdx] = useState(0);
  const [talking, setTalking] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [listening, setListening] = useState(false);
  const [hint, setHint] = useState(false);
  const [typing, setTyping] = useState(false);
  const [typed, setTyped] = useState('');
  const [micOk, setMicOk] = useState<boolean | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [level, setLevel] = useState(0);
  const [log, setLog] = useState<LogLine[]>([]);
  const [secs, setSecs] = useState(0);
  const [ending, setEnding] = useState(false);
  const attempts = useRef(0);
  const alive = useRef(true);
  const lastSaid = useRef('');
  const aiRef = useRef(ai);
  aiRef.current = ai;
  const logRef = useRef(log);
  logRef.current = log;

  const brain = !!ai.brain;
  const userTurns = script ? script.turns.filter((t) => 'u' in t).length : 0;
  const doneTurns = log.filter((l) => l.who === 'you').length;
  const maxTurns = script ? Math.max(userTurns + 3, 6) : 0;

  // Suena el teléfono y, mientras tanto, se carga la IA elegida (solo para esta llamada).
  useEffect(() => {
    alive.current = true;
    const stop = ringtone();
    const t0 = Date.now();
    (async () => {
      let chosen = await chosenAi();
      if (free && !chosen.brain) {
        stop();
        setPhase('needs-ai');
        return;
      }
      const opener = script ? (script.turns[0] as { o: string }).o : FREE_OPENER;
      const system = script
        ? roleplayPrompt({
            scene: script.scene,
            goal: script.goal,
            unit: unit?.title ?? '',
            lines: script.turns.filter((t): t is { o: string } => 'o' in t).map((t) => t.o),
          }) + `\nYou already opened the call by saying: "${opener}"`
        : FREE_PROMPT + `\nYou already opened the call by saying: "${FREE_OPENER}"`;
      if (chosen.voice || chosen.ear || chosen.brain) chosen = await loadCallAi(chosen, system);
      if (!alive.current) return;
      setAi(chosen);
      setMicOk(chosen.ear ? true : await canListen());
      const wait = MIN_RING - (Date.now() - t0);
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      if (!alive.current) return;
      stop();
      sfxPickup();
      setPhase('talk');
    })();
    return () => {
      alive.current = false;
      stop();
      stopSpeaking();
      releaseCallAi();
    };
  }, []);

  // Si la app pasa a segundo plano, se corta la llamada (y se libera la IA).
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || phase !== 'talk') return;
    const l = CapApp.addListener('pause', () => hangUpRef.current());
    return () => {
      l.then((x) => x.remove());
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'talk') return;
    const id = setInterval(() => setSecs((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  // Nivel del micrófono (solo con el oído de IA): el botón late con tu voz.
  useEffect(() => {
    if (!ai.ear) return;
    const l = OliverAi.addListener('level', (e) => setLevel(e.level));
    return () => {
      l.then((x) => x.remove());
    };
  }, [ai.ear]);

  const speak = async (text: string) => {
    lastSaid.current = text;
    setTalking(true);
    try {
      if (aiRef.current.voice) await speakWith(aiRef.current.voice, aiRef.current.speaker, text);
      else await say(text, { lang: 'en-AU' });
    } catch {
      try {
        await say(text, { lang: 'en-AU' });
      } catch {
        /* sin voz */
      }
    }
    if (alive.current) setTalking(false);
  };

  const stopAll = () => {
    stopSpeaking();
    if (aiRef.current.voice) OliverAi.stopSpeaking().catch(() => {});
    if (aiRef.current.ear) OliverAi.stopListening().catch(() => {});
    if (aiRef.current.brain) OliverAi.cancelChat().catch(() => {});
  };

  // ── Con guion (sin IA de charla): Oliver habla hasta que te toca a vos ──
  useEffect(() => {
    if (phase !== 'talk' || brain || !script) return;
    const turn = script.turns[idx];
    if (!turn) {
      finish();
      return;
    }
    if ('o' in turn) {
      let cancelled = false;
      setLog((l) => [...l, { who: 'oliver', text: turn.o }]);
      speak(turn.o).then(() => {
        if (!cancelled && alive.current) setTimeout(() => alive.current && setIdx((i) => i + 1), 350);
      });
      return () => {
        cancelled = true;
      };
    }
    attempts.current = 0;
    setHint(false);
    setWaiting(true);
  }, [phase, idx, brain]);

  // ── Con IA de charla: Oliver abre la llamada y después responde a lo que digas ──
  useEffect(() => {
    if (phase !== 'talk' || !brain) return;
    const opener = script ? (script.turns[0] as { o: string }).o : FREE_OPENER;
    setLog([{ who: 'oliver', text: opener }]);
    speak(opener).then(() => alive.current && setWaiting(true));
  }, [phase, brain]);

  // Como en una llamada de verdad: cuando Oliver termina de hablar, el micrófono se abre solo.
  useEffect(() => {
    if (phase !== 'talk' || !waiting || talking || thinking || listening || typing || !micOk || ending) return;
    const t = setTimeout(() => talkNow(), 250);
    return () => clearTimeout(t);
  }, [phase, waiting, talking, thinking, typing, micOk, idx, ending]);

  const current = script && !brain ? script.turns[idx] : undefined;
  const scriptTurn: UserTurn | null = current && 'u' in current ? current.u : null;
  // Pista: en la charla con IA, la respuesta modelo del paso del guion más cercano.
  const hintTurn: UserTurn | null =
    scriptTurn ??
    (script && brain
      ? ((script.turns.filter((t) => 'u' in t)[Math.min(doneTurns, userTurns - 1)] as { u: UserTurn } | undefined)?.u ?? null)
      : null);

  const answerScript = async (heard: string[]) => {
    if (!scriptTurn || !script) return;
    const best = heard.find((h) => h.trim()) ?? '';
    const branch = matchTurn(scriptTurn, heard);
    const last = idx === script.turns.length - 1;
    if (branch) {
      sfxCorrect();
      setWaiting(false);
      setLog((l) => [...l, { who: 'you', text: best, praise: branch.praise }]);
      const reply = last ? 'See ya, mate! Hooroo.' : branch.reply ?? ack();
      setLog((l) => [...l, { who: 'oliver', text: reply }]);
      await speak(reply);
      if (alive.current) setIdx((i) => i + 1);
      return;
    }
    attempts.current += 1;
    if (attempts.current < 2) {
      sfxWrong();
      setHint(true);
      await speak(pick(SORRY));
      return;
    }
    setWaiting(false);
    setLog((l) => [...l, { who: 'you', text: best || '(sin respuesta)', tip: scriptTurn.tip, model: scriptTurn.model }]);
    const reply = last ? 'Anyway, gotta go. See ya!' : 'No worries, mate.';
    setLog((l) => [...l, { who: 'oliver', text: reply }]);
    await speak(reply);
    if (alive.current) setIdx((i) => i + 1);
  };

  const answerAi = async (said: string) => {
    setWaiting(false);
    setLog((l) => [...l, { who: 'you', text: said }]);
    const turns = logRef.current.filter((l) => l.who === 'you').length + 1;
    const userBye = BYE_RE.test(said);
    const wrap = userBye || (maxTurns > 0 && turns >= maxTurns);
    setThinking(true);
    let reply = '';
    try {
      const res = await OliverAi.chat({ text: wrap ? `${said}\n(Wrap up the call now: answer briefly and say goodbye.)` : said });
      reply = shortReply(cleanReply(res.text), 3);
    } catch {
      reply = '';
    }
    if (!alive.current) return;
    setThinking(false);
    if (!reply) reply = wrap ? 'No worries, mate. See ya!' : pick(SORRY);
    setLog((l) => [...l, { who: 'oliver', text: reply }]);
    await speak(reply);
    if (!alive.current) return;
    if (wrap || BYE_RE.test(reply)) {
      setEnding(true);
      finish();
    } else setWaiting(true);
  };

  const answer = (heard: string[]) => (brain ? answerAi(heard.find((h) => h.trim()) ?? '') : answerScript(heard));

  const talkNow = async () => {
    if (listening) {
      // Tocar el micrófono mientras escucha: terminaste de hablar.
      if (aiRef.current.ear) OliverAi.stopListening().catch(() => {});
      return;
    }
    if (!waiting || talking || thinking) return;
    setListening(true);
    try {
      let heard: string[];
      if (aiRef.current.ear) heard = [(await OliverAi.listen({})).text];
      else heard = await listen('en-AU');
      setListening(false);
      setLevel(0);
      if (!heard.some((h) => h.trim())) return; // no escuchó nada: queda el micrófono para volver a hablar
      await answer(heard);
    } catch {
      setListening(false);
      setLevel(0);
    }
  };

  const finish = () => {
    sfxHangup();
    setPhase('review');
  };

  const hangUp = () => {
    stopAll();
    sfxHangup();
    if (logRef.current.some((l) => l.who === 'you')) setPhase('review');
    else onExit();
  };
  const hangUpRef = useRef(hangUp);
  hangUpRef.current = hangUp;

  // Botón «atrás»: mientras suena corta; durante la charla cuelga y muestra el repaso.
  useBack(phase === 'ringing' || phase === 'review' || phase === 'needs-ai', onExit, 3);
  useBack(phase === 'talk' && drawer, () => setDrawer(false), 4);
  useBack(phase === 'talk' && !drawer, hangUp, 3);

  if (phase === 'needs-ai')
    return (
      <div className="call call-ringing">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
          <div className="ring-avatar">
            <Oliver talking={false} />
          </div>
          <p className="ring-name">Llamada libre</p>
          <p className="ring-sub">
            Para charlar de cualquier tema, Oliver necesita una IA de charla. Bajala una sola vez en Ajustes › Voces e IA y después funciona sin
            internet.
          </p>
          {onSettings && (
            <button className="primary" onClick={onSettings}>
              Ir a Voces e IA
            </button>
          )}
          <button className="link" onClick={onExit} style={{ color: '#dce8ef' }}>
            Volver
          </button>
        </div>
      </div>
    );

  if (phase === 'ringing')
    return (
      <div className="call call-ringing">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="ring-avatar">
            <Oliver talking={false} />
          </div>
          <p className="ring-name">Llamando a Oliver…</p>
          {script ? (
            <>
              <p className="ring-sub">
                {script.scene} · {unit?.title}
              </p>
              <p className="ring-sub">{script.goal}</p>
            </>
          ) : (
            <p className="ring-sub">Llamada libre · charlá de lo que quieras</p>
          )}
        </div>
        <button className="hangup" aria-label="Cortar" onClick={onExit}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 15c5-5 13-5 18 0l-2.5 2.5-3-1.5v-2.5c-2.5-1-5.5-1-8 0V16l-3 1.5z" />
          </svg>
        </button>
      </div>
    );

  if (phase === 'review')
    return <Review title={script?.title ?? 'Llamada libre'} goal={script?.goal} callId={callId} log={log} secs={secs} withAi={brain} onExit={onExit} />;

  const progress = script ? Math.min(1, doneTurns / (brain ? maxTurns : userTurns)) : 0;
  const micDisabled = !listening && (!waiting || talking || thinking);
  return (
    <div className="call">
      <div className="call-scene">
        <img className="call-bg" src={bg} alt="" />
        <div className="call-oliver">
          <Oliver talking={talking} />
          {/* El polo sigue hacia abajo del cuadro (sin brazo). */}
          <div className="oliver-arm-wrap" aria-hidden="true" dangerouslySetInnerHTML={{ __html: arm }} />
        </div>
      </div>
      <div className="call-top">
        <button className="call-x" aria-label="Cortar la llamada" onClick={hangUp}>
          ✕
        </button>
        <div className="call-progress">{script && <div style={{ width: `${progress * 100}%` }} />}</div>
        <span className="call-time">
          {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}
        </span>
      </div>

      {/* Abajo: solo el micrófono (siempre a mano) y una flechita con lo demás. La charla escrita aparece en el repaso. */}
      {!drawer && (
        <div className="call-mic-row">
          {micOk !== false && (
            <button
              className={`call-mic ${listening ? 'on' : ''} ${thinking ? 'thinking' : ''}`}
              style={listening ? { boxShadow: `0 0 0 ${4 + Math.round(level * 18)}px rgba(111, 211, 106, 0.35)` } : undefined}
              aria-label={listening ? 'Terminé de hablar' : 'Hablar'}
              onClick={talkNow}
              disabled={micDisabled}
            >
              {thinking ? (
                <span className="dots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
              ) : (
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="9" y="3" width="6" height="11" rx="3" />
                  <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
                </svg>
              )}
            </button>
          )}
          <button className="call-handle" aria-label="Más opciones" onClick={() => setDrawer(true)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 15l6-6 6 6" />
            </svg>
          </button>
        </div>
      )}
      {drawer && (
        <div className="call-drawer">
          {hint && hintTurn && (
            <p className="call-hint">
              💡 Podés decir: <b>{hintTurn.model}</b>
              <br />
              {hintTurn.tip}
            </p>
          )}
          {typing && waiting && (
            <form
              className="call-type"
              onSubmit={(e) => {
                e.preventDefault();
                if (!typed.trim()) return;
                const t = typed;
                setTyped('');
                answer([t]);
              }}
            >
              <input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="Escribí tu respuesta en inglés" autoCapitalize="off" autoCorrect="off" />
              <button type="submit">Enviar</button>
            </form>
          )}
          <div className="call-buttons">
            <span className="cb">
              <button className="round-btn" aria-label="Repetir lo que dijo" onClick={() => lastSaid.current && speak(lastSaid.current)} disabled={talking || thinking}>
                ↻
              </button>
              <span>Repetir</span>
            </span>
            {hintTurn && (
              <span className="cb">
                <button className={`round-btn tip ${hint ? 'glow' : ''}`} aria-label="Pista" onClick={() => setHint(!hint)}>
                  💡
                </button>
                <span>Pista</span>
              </span>
            )}
            <span className="cb">
              <button className={`round-btn ${typing ? 'glow' : ''}`} aria-label="Escribir" onClick={() => setTyping(!typing)}>
                ⌨️
              </button>
              <span>Escribir</span>
            </span>
          </div>
          <button className="call-handle down" aria-label="Ocultar opciones" onClick={() => setDrawer(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

function Review({
  title,
  goal,
  callId,
  log,
  secs,
  withAi,
  onExit,
}: {
  title: string;
  goal?: string;
  callId?: string;
  log: LogLine[];
  secs: number;
  withAi: boolean;
  onExit: () => void;
}) {
  const yours = log.filter((l) => l.who === 'you');
  const good = yours.filter((l) => l.praise).length;
  const saved = useRef(false);
  const [tips, setTips] = useState<string[] | null>(withAi ? null : []);

  useEffect(() => {
    if (saved.current) return;
    saved.current = true;
    if (callId) saveCall(callId, withAi ? (yours.length >= 3 ? 1 : yours.length / 3) : yours.length ? good / yours.length : 0);
    if (!withAi) {
      releaseCallAi();
      return;
    }
    // Con IA de charla: antes de liberarla, le pide a Oliver 3 consejos sobre tu inglés.
    let done = false;
    const giveUp = setTimeout(() => {
      if (!done) {
        done = true;
        setTips([]);
        releaseCallAi();
      }
    }, 45000);
    OliverAi.chat({ text: FEEDBACK_REQUEST })
      .then((r) => {
        if (done) return;
        const lines = cleanReply(r.text.replace(/\n/g, ' ¶ '))
          .split('¶')
          .map((x) => x.replace(/^\s*[-•]\s*/, '').trim())
          .filter(Boolean);
        setTips(lines.slice(0, 4));
      })
      .catch(() => setTips([]))
      .finally(() => {
        done = true;
        clearTimeout(giveUp);
        releaseCallAi();
      });
  }, []);

  return (
    <div className="screen call-review">
      <p className="eyebrow">Repasá tu conversación</p>
      <h1>{title}</h1>
      {goal && <p className="small">{goal}</p>}
      <div className="summary-stats">
        <div className="stat">
          <span className="stat-num">{withAi ? yours.length : `${good}/${yours.length}`}</span>
          <span className="stat-label">{withAi ? 'frases tuyas' : 'frases bien'}</span>
        </div>
        <div className="stat">
          <span className="stat-num">
            {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}
          </span>
          <span className="stat-label">de charla</span>
        </div>
      </div>
      {withAi && (
        <div className="card">
          <p className="card-title">Consejos de Oliver</p>
          {tips === null ? (
            <p className="small">Oliver está pensando tus consejos…</p>
          ) : tips.length ? (
            <ul className="tips">
              {tips.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          ) : (
            <p className="small">Esta vez no pudo armar consejos. ¡Seguí practicando!</p>
          )}
        </div>
      )}
      <div className="chat">
        {log.map((l, i) =>
          l.who === 'oliver' ? (
            <div key={i} className="msg oliver-msg">
              {l.text}
            </div>
          ) : (
            <div key={i} className="msg you-msg">
              {l.text}
              {l.praise && <div className="msg-note ok">✓ {l.praise}</div>}
              {l.tip && (
                <div className="msg-note tip">
                  💡 {l.tip}
                  {l.model && (
                    <>
                      <br />
                      Podías decir: <b>{l.model}</b>
                    </>
                  )}
                </div>
              )}
            </div>
          ),
        )}
      </div>
      <button className="primary" onClick={onExit}>
        Listo
      </button>
    </div>
  );
}
