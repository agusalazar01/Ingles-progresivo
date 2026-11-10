import { useEffect, useRef, useState } from 'react';
import { Icon, Ring } from '../components/ui';
import { BackButton } from '../components/BackButton';
import { useBack } from '../lib/nav';
import { canListen, listenManual, say, stopSpeaking, type ManualListen } from '../lib/speech';
import { useAppState } from '../lib/store';
import type { Level } from '../content/types';
import { chosenAi, listenManualWith, loadEarOnly, loadVoicePack, releaseCallAi, speakWith, tuneFor, type CallAi } from '../lib/ai';
import { RP_CATEGORIES, ROLEPLAYS } from '../content/roleplays/catalog';
import type { RFix, RoleplayEntry, RoleplayScript } from '../content/roleplays/types';
import { fixesFor, matchOption, pickLine, roleplayById, saveRoleplay } from '../lib/roleplay';
import type { CallScript } from '../content/calls';

type View = { v: 'library' } | { v: 'brief'; id: string } | { v: 'talk'; id: string } | { v: 'done'; id: string; log: Line[]; turns: Turn[] };
interface Line {
  who: 'them' | 'you';
  text: string;
}
interface Fixed extends RFix {
  said: string;
}
/** Una respuesta tuya: qué dijiste, si te entendió, errores y la pista del momento. */
interface Turn {
  said: string;
  node: string;
  hint: string;
  aim?: string;
  ok: boolean;
  firstTry: boolean;
  fixes: Fixed[];
  praise?: string;
}

/** Puntaje 0–100: te entendió de una (60), sin errores previstos (30) y llegar al final sin trabarte (10). */
function scoreRoleplay(turns: Turn[]) {
  const total = turns.filter((t) => t.firstTry).length || 1;
  const understood = turns.filter((t) => t.ok && t.firstTry).length;
  const fixes = turns.reduce((a, t) => a + t.fixes.length, 0);
  const missed = turns.filter((t) => !t.ok && !t.firstTry).length;
  const score = Math.max(0, Math.round((understood / total) * 60 + Math.max(0, 30 - fixes * 10) + (missed ? 0 : 10)));
  const verdict =
    score >= 80
      ? '¡Muy bien! Te desenvolviste con naturalidad. Mirá abajo si hay algo para pulir.'
      : score >= 50
        ? 'Bien: lograste el objetivo. Abajo tenés lo que conviene mejorar.'
        : 'Lo terminaste, que es lo importante. Repasá las sugerencias de abajo y probalo de nuevo.';
  return { score, understood, total, fixes, verdict };
}

const LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2'];
const SLOW: Level[] = ['A1'];
const SHOW_AIM: Level[] = ['A1', 'A2'];

/**
 * Biblioteca de roleplays: situaciones reales para vivir y trabajar en Australia. Cada una es un guion
 * con ramas; la IA de charla queda como modo libre opcional.
 */
export function Roleplays({ onExit, onAiCall }: { onExit: () => void; onAiCall: (script: CallScript) => void }) {
  const [view, setView] = useState<View>({ v: 'library' });
  const back = () => (view.v === 'library' ? onExit() : view.v === 'talk' ? (stopSpeaking(), setView({ v: 'brief', id: view.id })) : setView({ v: 'library' }));
  useBack(true, back, 2);

  if (view.v === 'brief') return <Brief e={roleplayById(view.id)!} onBack={back} onStart={() => setView({ v: 'talk', id: view.id })} onAiCall={onAiCall} />;
  if (view.v === 'talk') {
    const e = roleplayById(view.id)!;
    return <Talk e={e} s={e.script!} onBack={back} onDone={(log, turns) => setView({ v: 'done', id: view.id, log, turns })} />;
  }
  if (view.v === 'done') return <Done e={roleplayById(view.id)!} log={view.log} turns={view.turns} onAgain={() => setView({ v: 'talk', id: view.id })} onBack={() => setView({ v: 'library' })} />;
  return <Library onBack={back} onOpen={(id) => setView({ v: 'brief', id })} />;
}

function Library({ onBack, onOpen }: { onBack: () => void; onOpen: (id: string) => void }) {
  const s = useAppState();
  const [level, setLevel] = useState<Level | 'all'>('all');
  const list = (cat: string) => ROLEPLAYS.filter((r) => r.category === cat && r.script && (level === 'all' || r.level === level));
  const doneCount = Object.keys(s.roleplays ?? {}).length;
  // Se abre sola la primera categoría que todavía tiene algo sin hacer; las demás, al tocarlas.
  const firstOpen = RP_CATEGORIES.find((c) => ROLEPLAYS.some((r) => r.category === c.id && r.script && !s.roleplays?.[r.id]))?.id ?? RP_CATEGORIES[0]?.id ?? null;
  const [open, setOpen] = useState<string | null>(firstOpen);
  return (
    <div className="screen roleplays">
      <div className="top-bar">
        <BackButton onClick={onBack} />
      </div>
      <p className="eyebrow">Vivir y trabajar en Australia</p>
      <h1>🎭 Roleplays</h1>
      <p className="small">
        Situaciones reales, del aeropuerto a una entrevista de trabajo. Hablás o escribís libre y la otra persona reacciona a lo que decís. Hiciste {doneCount} de{' '}
        {ROLEPLAYS.length}.
      </p>
      <div className="chips">
        {(['all', ...LEVELS] as const).map((l) => (
          <button key={l} className={`chip ${level === l ? 'chosen' : ''}`} onClick={() => setLevel(l)}>
            {l === 'all' ? 'Todos' : l}
          </button>
        ))}
      </div>
      {RP_CATEGORIES.map((c) => {
        const items = list(c.id);
        if (!items.length) return null;
        const isOpen = open === c.id;
        const did = items.filter((r) => s.roleplays?.[r.id]).length;
        return (
          <div key={c.id} className={`theme ${isOpen ? 'open' : ''} ${did === items.length ? 'complete' : ''}`}>
            <button className="theme-head" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : c.id)}>
              <Ring value={did / items.length} size={44} stroke={5}>
                <span className="ring-small">
                  {did}/{items.length}
                </span>
              </Ring>
              <span className="theme-text">
                <span className="theme-title">{c.title}</span>
              </span>
              <span className="theme-chev">
                <Icon name="chevron" size={18} />
              </span>
            </button>
            {isOpen && (
              <div className="ladder theme-units">
                {items.map((r) => {
                  const done = s.roleplays?.[r.id];
                  return (
                    <button key={r.id} className={`rung ${done ? 'done' : r.script ? '' : 'locked'}`} disabled={!r.script} onClick={() => onOpen(r.id)}>
                      <span className="rung-num">{done ? '✓' : r.level}</span>
                      <span>
                        <span className="unit-title">{r.title}</span>
                        <span className="unit-status">
                          {r.titleEs}
                          {r.script ? '' : ' · en preparación'}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Brief({ e, onBack, onStart }: { e: RoleplayEntry; onBack: () => void; onStart: () => void; onAiCall: (s: CallScript) => void }) {
  const s = e.script!;
  return (
    <div className="screen roleplays">
      <div className="top-bar">
        <BackButton onClick={onBack} />
      </div>
      <p className="eyebrow">
        Roleplay · {e.level}
      </p>
      <h1>{e.title}</h1>
      <p className="small">{e.titleEs}</p>
      <div className="card">
        <p>
          <b>📍 Dónde:</b> {s.place}
        </p>
        <p>
          <b>🧑 Con quién:</b> {s.partner.name}, {s.partner.role}
        </p>
        <p>
          <b>🎬 Situación:</b> {s.situation}
        </p>
        <p>
          <b>🎯 Objetivo:</b> {s.goal}
        </p>
      </div>
      <h2>Vocabulario</h2>
      {s.vocab.map((v) => (
        <div key={v.en} className="card vocab-card">
          <div className="row between">
            <p className="card-title">
              {v.en} <span className="small">/{v.say}/</span>
            </p>
            <button className="link" aria-label="Escuchar" onClick={() => say(v.example)}>
              ▶
            </button>
          </div>
          <p className="small">{v.es}</p>
          <p>
            <i>{v.example}</i>
          </p>
        </div>
      ))}
      {s.aussie && s.aussie.length > 0 && (
        <>
          <h2>🇦🇺 Así se dice en Australia</h2>
          {s.aussie.map((a) => (
            <div key={a.en} className="card">
              <p className="card-title">
                {a.en} <span className="small">= {a.es}</span>
              </p>
              <p className="small">{a.when}</p>
            </div>
          ))}
        </>
      )}
      <button className="primary" onClick={onStart}>
        Empezar
      </button>
    </div>
  );
}

function Talk({ e, s, onBack, onDone }: { e: RoleplayEntry; s: RoleplayScript; onBack: () => void; onDone: (log: Line[], turns: Turn[]) => void }) {
  const [node, setNode] = useState(s.start);
  const [log, setLog] = useState<Line[]>([]);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [lastFix, setLastFix] = useState<Fixed[]>([]);
  const [tries, setTries] = useState(0);
  const [typed, setTyped] = useState('');
  const [hearing, setHearing] = useState(false);
  const [listening, setListening] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showAim, setShowAim] = useState(SHOW_AIM.includes(e.level));
  const [micOk, setMicOk] = useState(false);
  const [busy, setBusy] = useState(true);
  const [praise, setPraise] = useState('');
  const current = useRef('');
  const alive = useRef(true);
  const mic = useRef<ManualListen | null>(null);
  const voice = useRef<CallAi | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const turnsRef = useRef(turns);
  turnsRef.current = turns;
  const logRef = useRef(log);
  logRef.current = log;
  const n = s.nodes[node];
  const slow = SLOW.includes(e.level);

  /** Habla con la voz elegida en Configuración (motor de voces del teléfono, sin IA de charla). */
  const voiceSay = async (text: string, slower = slow) => {
    const v = voice.current;
    if (v?.voice) {
      try {
        await speakWith(v.voice, v.speaker, text, slower ? { ...tuneFor(v.voice.id, v.speaker), speed: Math.min(tuneFor(v.voice.id, v.speaker).speed, 0.8) } : undefined);
        return;
      } catch {
        /* sigue con la voz del sistema */
      }
    }
    await Promise.race([say(text, { slow: slower, lang: 'en-AU' }).catch(() => {}), new Promise((r) => setTimeout(r, 2500 + text.length * (slower ? 110 : 80)))]);
  };

  const speak = async (raw: string) => {
    // «…» marca que el otro no dice nada y empezás vos.
    const text = raw.replace(/(^|\s)…(?=\s|$)/g, ' ').trim();
    if (!text) return;
    setLog((l) => [...l, { who: 'them', text }]);
    current.current = text;
    await voiceSay(text);
  };

  useEffect(() => {
    alive.current = true;
    canListen().then(setMicOk);
    (async () => {
      // La voz y el oído elegidos (no la IA de charla para responder): se cargan para este roleplay y se liberan al salir.
      // Si el oído es Gemma 4, se carga solo para escuchar: no se usa el reconocimiento del teléfono.
      try {
        const c = await chosenAi();
        if (c.voice) await loadVoicePack(c.voice, c.speaker);
        const ear = await loadEarOnly(c);
        voice.current = { ...c, voice: c.voice, ear, brain: null };
        if (ear) setMicOk(true);
      } catch {
        voice.current = null;
      }
      if (!alive.current) return;
      await speak(pickLine(s.nodes[s.start].say));
      if (alive.current) setBusy(false);
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
  }, [log, lastFix]);

  const goTo = async (next: string, reply?: string) => {
    setTries(0);
    setShowHint(false);
    setShowAim(SHOW_AIM.includes(e.level));
    if (next === 'end' || !s.nodes[next]) {
      await speak([reply, pickLine(s.closing)].filter(Boolean).join(' '));
      const t = turnsRef.current;
      saveRoleplay(e.id, t.reduce((a, x) => a + x.fixes.length, 0), t.length);
      if (alive.current) setTimeout(() => onDone(logRef.current, turnsRef.current), 1200);
      return;
    }
    setNode(next);
    await speak([reply, pickLine(s.nodes[next].say)].filter(Boolean).join(' '));
  };

  const answer = async (said: string) => {
    said = said.trim();
    if (!said) return;
    setBusy(true);
    setTyped('');
    setPraise('');
    setLog((l) => [...l, { who: 'you', text: said }]);
    const found = fixesFor(n, said).map((f) => ({ ...f, said }));
    setLastFix(found);
    const opt = matchOption(n, [said]);
    const turn: Turn = { said, node, hint: n.hint, aim: n.aim, ok: !!opt, firstTry: tries === 0, fixes: found, praise: opt?.praise };
    setTurns((t) => [...t, turn]);
    if (opt) {
      if (opt.praise && !found.length) setPraise(opt.praise);
      await goTo(opt.next, pickLine(opt.reply));
    } else if (tries === 0) {
      setTries(1);
      setShowAim(true);
      await speak(pickLine(['Sorry, could you say that again?', "Sorry, I didn't catch that.", 'Sorry, what was that?']));
    } else {
      setShowHint(true);
      await goTo(n.fallback.next, n.fallback.reply);
    }
    if (alive.current) setBusy(false);
  };

  /** Micrófono manual: tocar para empezar, tocar de nuevo para terminar (y se manda). */
  const toggleMic = async () => {
    if (listening) {
      const m = mic.current;
      mic.current = null;
      setListening(false);
      setHearing(true);
      const text = m ? await m.stop() : '';
      setHearing(false);
      if (text.trim()) await answer(text);
      return;
    }
    if (busy) return;
    try {
      stopSpeaking();
      setTyped('');
      const ear = voice.current?.ear;
      if (ear) {
        // Oído de la app (Parakeet, Moonshine, Qwen3-ASR o Gemma 4): el texto aparece al terminar.
        const m = listenManualWith(ear, 'English');
        mic.current = { stop: m.stop };
      } else mic.current = await listenManual('en-AU', (t) => setTyped(t));
      setListening(true);
    } catch {
      setListening(false);
    }
  };

  return (
    <div className="screen roleplays talk">
      <div className="top-bar">
        <BackButton onClick={onBack} label="Salir" />
        <p className="eyebrow">
          {e.title} · {s.partner.name}, {s.partner.role}
        </p>
      </div>
      <div className="rp-log">
        {log.map((l, i) => (
          <div key={i} className={`bubble ${l.who}`}>
            {l.who === 'them' && <b>{s.partner.name}: </b>}
            {l.text}
          </div>
        ))}
        {lastFix.map((f, i) => (
          <div key={`f${i}`} className="feedback neutral rp-fix">
            <p className="small">✏️ Corrección</p>
            <p>
              <s>{f.said}</s>
            </p>
            <p>
              <b>{f.right}</b>
            </p>
            <p className="small">{f.why}</p>
          </div>
        ))}
        {praise && <p className="small rp-praise">✓ {praise}</p>}
        <div ref={endRef} />
      </div>
      <div className="rp-controls">
        {showAim && n.aim && <p className="small">🎯 {n.aim}</p>}
        {showHint && (
          <p className="small">
            💡 Podrías decir: <b>{n.hint}</b>
          </p>
        )}
        <div className="rp-actions">
          <button className="chip" onClick={() => voiceSay(current.current, true)} disabled={!current.current || listening}>
            🔁 Repetir lento
          </button>
          <button className="chip" onClick={() => setShowHint(true)} disabled={showHint}>
            💡 Ayuda
          </button>
        </div>
        {listening ? (
          <button className="primary mic-big listening" onClick={toggleMic}>
            <span className="rec-dot" /> Escuchando… tocá para terminar y enviar
          </button>
        ) : (
          <form
            className="composer"
            onSubmit={(ev) => {
              ev.preventDefault();
              if (!busy && typed.trim()) answer(typed);
            }}
          >
            <input
              className="answer"
              value={typed}
              onChange={(ev) => setTyped(ev.target.value)}
              placeholder={hearing ? 'Entendiendo lo que dijiste…' : micOk ? 'Hablá o escribí en inglés' : 'Escribí tu respuesta en inglés'}
              autoCapitalize="sentences"
              disabled={busy || hearing}
            />
            {typed.trim() || !micOk ? (
              <button className="round send" type="submit" aria-label="Enviar" disabled={busy || !typed.trim()}>
                <Icon name="chevron" size={22} />
              </button>
            ) : (
              <button className="round mic" type="button" aria-label="Hablar" onClick={toggleMic} disabled={busy || hearing}>
                <Icon name="mic" size={22} />
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

function Done({ e, log, turns, onAgain, onBack }: { e: RoleplayEntry; log: Line[]; turns: Turn[]; onAgain: () => void; onBack: () => void }) {
  const s = e.script!;
  const r = scoreRoleplay(turns);
  // Cada respuesta tuya con su devolución, en el orden de la charla.
  let t = 0;
  return (
    <div className="screen roleplays">
      <p className="summary-emoji" aria-hidden="true">
        {r.score >= 80 ? '🏆' : r.score >= 50 ? '🎉' : '💪'}
      </p>
      <h1 className="center">Roleplay terminado</h1>
      <p className="center small">{e.title}</p>
      <div className="summary-stats">
        <div className="stat">
          <span className="stat-num">{r.score}</span>
          <span className="stat-label">puntaje</span>
        </div>
        <div className="stat">
          <span className="stat-num">
            {r.understood}/{r.total}
          </span>
          <span className="stat-label">te entendió de una</span>
        </div>
        <div className="stat">
          <span className="stat-num">{r.fixes}</span>
          <span className="stat-label">para corregir</span>
        </div>
      </div>
      <div className="card">
        <p className="card-title">🎯 Objetivo</p>
        <p className="small">{s.goal}</p>
        <p>{r.verdict}</p>
      </div>
      <h2>La charla, con sugerencias</h2>
      <div className="rp-log">
        {log.map((l, i) => {
          if (l.who === 'them')
            return (
              <div key={i} className="bubble them">
                <b>{s.partner.name}: </b>
                {l.text}
              </div>
            );
          const turn = turns[t++];
          return (
            <div key={i} className="rp-turn">
              <div className="bubble you">{l.text}</div>
              {turn && <TurnNote turn={turn} />}
            </div>
          );
        })}
      </div>
      <button className="primary" onClick={onAgain}>
        Hacerlo de nuevo (va a ser distinto)
      </button>
      <button className="link" onClick={onBack}>
        Volver a la biblioteca
      </button>
    </div>
  );
}

function TurnNote({ turn }: { turn: Turn }) {
  if (turn.fixes.length)
    return (
      <div className="turn-note fix">
        {turn.fixes.map((f, i) => (
          <div key={i}>
            <p>
              ✏️ Mejor: <b>{f.right}</b>
            </p>
            <p className="small">{f.why}</p>
          </div>
        ))}
      </div>
    );
  if (turn.ok && turn.firstTry)
    return (
      <div className="turn-note good">
        <p>✓ {turn.praise ?? 'Bien dicho.'}</p>
      </div>
    );
  if (turn.ok)
    return (
      <div className="turn-note good">
        <p>✓ Al segundo intento te entendió. {turn.praise ?? ''}</p>
      </div>
    );
  return (
    <div className="turn-note tip">
      <p>
        💡 No te entendió. {turn.aim ? `${turn.aim} ` : ''}Podrías decir: <b>{turn.hint}</b>
      </p>
    </div>
  );
}
