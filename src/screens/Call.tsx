import { useEffect, useRef, useState } from 'react';
import { callById, type UserTurn } from '../content/calls';
import { unitById } from '../content/curriculum';
import { Oliver } from '../components/Oliver';
import bg from '../assets/call/background.svg?url';
import { ack, matchTurn } from '../lib/call';
import { canListen, listen, say, stopSpeaking } from '../lib/speech';
import { ringtone, sfxCorrect, sfxHangup, sfxPickup, sfxWrong } from '../lib/sfx';
import { saveCall } from '../lib/store';
import { useBack } from '../lib/nav';

interface LogLine {
  who: 'oliver' | 'you';
  text: string;
  praise?: string;
  tip?: string;
  model?: string;
}

const SORRY = ['Sorry, what was that?', 'Come again, mate?', "Sorry, I didn't catch that."];
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

/** Llamada con Oliver: suena, atiende, charla (roleplay de la unidad) y al final el repaso. */
export function Call({ callId, onExit }: { callId: string; onExit: () => void }) {
  const script = callById(callId)!;
  const unit = unitById(script.unitId);
  const [phase, setPhase] = useState<'ringing' | 'talk' | 'review'>('ringing');
  const [idx, setIdx] = useState(0);
  const [, setLine] = useState('');
  const [, setYou] = useState('');
  const [talking, setTalking] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [listening, setListening] = useState(false);
  const [hint, setHint] = useState(false);
  const [typing, setTyping] = useState(false);
  const [typed, setTyped] = useState('');
  const [micOk, setMicOk] = useState<boolean | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [micIdle, setMicIdle] = useState(false);
  const [log, setLog] = useState<LogLine[]>([]);
  const [secs, setSecs] = useState(0);
  const attempts = useRef(0);
  const alive = useRef(true);
  const lastSaid = useRef('');

  const userTurns = script.turns.filter((t) => 'u' in t).length;
  const doneTurns = log.filter((l) => l.who === 'you').length;

  useEffect(() => {
    alive.current = true;
    canListen().then(setMicOk);
    const stop = ringtone();
    const t = setTimeout(() => {
      stop();
      sfxPickup();
      setPhase('talk');
    }, 4300);
    return () => {
      alive.current = false;
      stop();
      clearTimeout(t);
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    if (phase !== 'talk') return;
    const id = setInterval(() => setSecs((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  const speak = async (text: string) => {
    lastSaid.current = text;
    setLine(text);
    setTalking(true);
    try {
      await say(text, { lang: 'en-AU' });
    } catch {
      /* sin voz: queda el subtítulo */
    }
    if (alive.current) setTalking(false);
  };

  // Avanza el guion: Oliver habla hasta que te toca a vos.
  useEffect(() => {
    if (phase !== 'talk') return;
    const turn = script.turns[idx];
    if (!turn) {
      sfxHangup();
      setPhase('review');
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
    setYou('');
    setWaiting(true);
  }, [phase, idx]);

  // Como en una llamada de verdad: cuando Oliver termina de hablar, el micrófono se abre solo.
  useEffect(() => {
    if (phase !== 'talk' || !waiting || talking || listening || typing || !micOk) return;
    const t = setTimeout(() => talkNow(), 250);
    return () => clearTimeout(t);
  }, [phase, waiting, talking, typing, micOk, idx]);

  const current = script.turns[idx];
  const userTurn: UserTurn | null = current && 'u' in current ? current.u : null;

  const answer = async (heard: string[]) => {
    if (!userTurn) return;
    const best = heard.find((h) => h.trim()) ?? '';
    setYou(best);
    const branch = matchTurn(userTurn, heard);
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
    // Segundo intento sin coincidir: seguimos igual y queda el consejo para el repaso.
    setWaiting(false);
    setLog((l) => [...l, { who: 'you', text: best || '(sin respuesta)', tip: userTurn.tip, model: userTurn.model }]);
    const reply = last ? 'Anyway, gotta go. See ya!' : 'No worries, mate.';
    setLog((l) => [...l, { who: 'oliver', text: reply }]);
    await speak(reply);
    if (alive.current) setIdx((i) => i + 1);
  };

  const talkNow = async () => {
    if (!waiting || listening || talking) return;
    setListening(true);
    setMicIdle(false);
    try {
      const heard = await listen('en-AU');
      setListening(false);
      if (!heard.some((h) => h.trim())) {
        // No escuchó nada: no cuenta como intento; queda el botón para volver a hablar.
        setMicIdle(true);
        return;
      }
      await answer(heard);
    } catch {
      setListening(false);
      setMicIdle(true);
    }
  };

  const hangUp = () => {
    alive.current = false;
    stopSpeaking();
    sfxHangup();
    if (log.some((l) => l.who === 'you')) {
      alive.current = true;
      setPhase('review');
    } else onExit();
  };
  // Botón «atrás»: mientras suena corta; durante la charla cuelga y muestra el repaso.
  useBack(phase === 'ringing' || phase === 'review', onExit, 3);
  useBack(phase === 'talk' && drawer, () => setDrawer(false), 4);
  useBack(phase === 'talk' && !drawer, hangUp, 3);

  if (phase === 'ringing')
    return (
      <div className="call call-ringing">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="ring-avatar">
            <Oliver talking={false} />
          </div>
          <p className="ring-name">Llamando a Oliver…</p>
          <p className="ring-sub">
            {script.scene} · {unit.title}
          </p>
          <p className="ring-sub">{script.goal}</p>
        </div>
        <button className="hangup" aria-label="Cortar" onClick={onExit}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 15c5-5 13-5 18 0l-2.5 2.5-3-1.5v-2.5c-2.5-1-5.5-1-8 0V16l-3 1.5z" />
          </svg>
        </button>
      </div>
    );

  if (phase === 'review') return <Review callId={callId} log={log} secs={secs} onExit={onExit} />;

  const needsYou = waiting && !talking && !listening;
  return (
    <div className="call">
      <div className="call-scene">
        <img className="call-bg" src={bg} alt="" />
        <div className="call-oliver">
          <Oliver talking={talking} />
        </div>
      </div>
      <div className="call-top">
        <button className="call-x" aria-label="Cortar la llamada" onClick={hangUp}>
          ✕
        </button>
        <div className="call-progress">
          <div style={{ width: `${(doneTurns / userTurns) * 100}%` }} />
        </div>
        <span className="call-time">
          {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}
        </span>
      </div>

      {/* Abajo no se muestra nada: solo una flechita. La charla escrita aparece en el repaso, al cortar. */}
      {!drawer && (
        <button
          className={`call-handle ${listening ? 'listening' : ''} ${needsYou && (micIdle || micOk === false) ? 'attention' : ''}`}
          aria-label="Mostrar botones"
          onClick={() => setDrawer(true)}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 15l6-6 6 6" />
          </svg>
        </button>
      )}
      {drawer && (
        <div className="call-drawer">
          {hint && userTurn && (
            <p className="call-hint">
              💡 Podés decir: <b>{userTurn.model}</b>
              <br />
              {userTurn.tip}
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
              <button className="round-btn" aria-label="Repetir lo que dijo" onClick={() => lastSaid.current && speak(lastSaid.current)} disabled={talking}>
                ↻
              </button>
              <span>Repetir</span>
            </span>
            {micOk !== false && (
              <span className="cb">
                <button className={`round-btn mic ${listening ? 'on' : ''}`} aria-label="Hablar" onClick={talkNow} disabled={!waiting || talking || listening}>
                  🎤
                </button>
                <span>{listening ? 'Te escucho' : 'Hablar'}</span>
              </span>
            )}
            <span className="cb">
              <button className={`round-btn tip ${hint ? 'glow' : ''}`} aria-label="Pista" onClick={() => setHint(!hint)} disabled={!waiting}>
                💡
              </button>
              <span>Pista</span>
            </span>
            <span className="cb">
              <button className={`round-btn ${typing ? 'glow' : ''}`} aria-label="Escribir" onClick={() => setTyping(!typing)}>
                ⌨️
              </button>
              <span>Escribir</span>
            </span>
          </div>
          <button className="call-handle down" aria-label="Ocultar botones" onClick={() => setDrawer(false)}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

function Review({ callId, log, secs, onExit }: { callId: string; log: LogLine[]; secs: number; onExit: () => void }) {
  const script = callById(callId)!;
  const yours = log.filter((l) => l.who === 'you');
  const good = yours.filter((l) => l.praise).length;
  const saved = useRef(false);
  useEffect(() => {
    if (saved.current) return;
    saved.current = true;
    saveCall(callId, yours.length ? good / yours.length : 0);
  }, []);
  return (
    <div className="screen call-review">
      <p className="eyebrow">Repasá tu conversación</p>
      <h1>{script.title}</h1>
      <p className="small">{script.goal}</p>
      <div className="summary-stats">
        <div className="stat">
          <span className="stat-num">
            {good}/{yours.length}
          </span>
          <span className="stat-label">frases bien</span>
        </div>
        <div className="stat">
          <span className="stat-num">
            {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}
          </span>
          <span className="stat-label">de charla</span>
        </div>
      </div>
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
