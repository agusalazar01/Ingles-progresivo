import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Icon, Ring } from '../components/ui';
import { BackButton } from '../components/BackButton';
import { useBack } from '../lib/nav';
import { canListen, listenManual, say, stopSpeaking, type ManualListen } from '../lib/speech';
import { useAppState } from '../lib/store';
import type { Level } from '../content/types';
import { chosenAi, listenManualWith, loadEarOnly, loadVoicePack, releaseCallAi, speakWith, tuneFor, type CallAi } from '../lib/ai';
import { RP_CATEGORIES, ROLEPLAYS } from '../content/roleplays/catalog';
import type { RFix, RoleplayEntry, RoleplayScript } from '../content/roleplays/types';
import { fixesFor, isRepeatRequest, pickLine, roleplayById, saveRoleplay, understand } from '../lib/roleplay';
import { downloadMeaning, loadMeaning, MEANING_PACK, meaningState, releaseMeaning, removeMeaning, type MeaningState } from '../lib/understand';
import { cancelDownload, getDownloads, subscribeDownloads } from '../lib/ai';
import { SEM_OFFTOPIC, type Embedder } from '../lib/semantic';
import { connectorsIn, ruleHits } from '../lib/writing';
import { proofEdits, proofread, proofState, unloadProof, type ProofEdit } from '../lib/proofread';
import { savePhrase } from '../lib/phrases';
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
  /** Te entendió por el significado (dicho con otras palabras). */
  meaning?: boolean;
}

/** Cuántos momentos tiene el camino principal del guion (para el avance «1 de 4»). */
function pathLength(s: RoleplayScript): number {
  let id: string | undefined = s.start;
  const seen = new Set<string>();
  while (id && id !== 'end' && s.nodes[id] && !seen.has(id)) {
    seen.add(id);
    const n: RoleplayScript['nodes'][string] = s.nodes[id];
    id = n.options[0]?.next ?? n.fallback.next;
  }
  return Math.max(1, seen.size);
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

/** Una llamada de unidad con Oliver, con la misma pantalla de charla y el mismo resumen que los roleplays. */
export function ScriptedCall({ entry, onExit }: { entry: RoleplayEntry; onExit: () => void }) {
  const [view, setView] = useState<{ v: 'talk' } | { v: 'done'; log: Line[]; turns: Turn[] }>({ v: 'talk' });
  const [round, setRound] = useState(0);
  useBack(true, () => (stopSpeaking(), onExit()), 2);
  if (view.v === 'done') return <Done e={entry} log={view.log} turns={view.turns} onAgain={() => (setRound(round + 1), setView({ v: 'talk' }))} onBack={onExit} />;
  return <Talk key={round} e={entry} s={entry.script!} onBack={onExit} onDone={(log, turns) => setView({ v: 'done', log, turns })} />;
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
      <MeaningCard />
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
  const [, setShowAim] = useState(SHOW_AIM.includes(e.level));
  const [micOk, setMicOk] = useState(false);
  const [busy, setBusy] = useState(true);
  const [praise, setPraise] = useState('');
  const [keyboard, setKeyboard] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const emb = useRef<Embedder | null>(null);
  const total = pathLength(s);
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
    setSpeaking(true);
    await voiceSay(text);
    setSpeaking(false);
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
      // El modelo que entiende lo que quisiste decir (si está bajado) se carga mientras Oliver habla.
      loadMeaning().then((m) => {
        if (alive.current) emb.current = m;
      });
      await speak(pickLine(s.nodes[s.start].say));
      if (alive.current) setBusy(false);
    })();
    return () => {
      alive.current = false;
      mic.current?.stop();
      stopSpeaking();
      if (voice.current?.voice || voice.current?.ear) releaseCallAi();
      releaseMeaning();
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
    // «Can you repeat that?»: repite más lento, no cuenta como respuesta.
    if (isRepeatRequest(said) && said.split(' ').length <= 7) {
      setSpeaking(true);
      await voiceSay(current.current, true);
      setSpeaking(false);
      if (alive.current) setBusy(false);
      return;
    }
    const found = fixesFor(n, said).map((f) => ({ ...f, said }));
    setLastFix(found);
    const u = await understand(n, said, emb.current);
    const opt = u.option;
    const turn: Turn = { said, node, hint: n.hint, aim: n.aim, ok: !!opt, firstTry: tries === 0, fixes: found, praise: opt?.praise, meaning: u.how === 'meaning' };
    setTurns((t) => [...t, turn]);
    if (opt) {
      if (opt.praise && !found.length) setPraise(opt.praise);
      await goTo(opt.next, pickLine(opt.reply));
    } else if (tries === 0) {
      setTries(1);
      setShowAim(true);
      // Si lo que dijiste no tiene que ver con el momento, vuelve a la pregunta en vez de saltar a otra cosa.
      const offTopic = u.closeness >= 0 && u.closeness < SEM_OFFTOPIC;
      await speak(
        offTopic
          ? `${pickLine(["Sorry, I'm not sure that answers my question.", 'Hmm, I think we got a bit off track.', "Sorry, I didn't follow that."])} ${pickLine(n.say)}`
          : pickLine(['Sorry, could you say that again?', "Sorry, I didn't catch that.", 'Sorry, what was that?']),
      );
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

  const doneCount = Math.min(total, new Set(turns.filter((t) => t.ok).map((t) => t.node)).size);
  const state = listening ? 'Tocá de nuevo para enviar' : hearing ? 'Entendiendo lo que dijiste…' : speaking ? `${s.partner.name} está hablando…` : busy ? 'Un momento…' : 'Tocá para hablar';
  return (
    <div className="screen roleplays talk">
      <div className="top-bar">
        <BackButton onClick={onBack} label="Salir" />
        <p className="eyebrow">
          {s.partner.name} · {e.title}
        </p>
      </div>
      <div className="rp-log">
        {log.map((l, i) => (
          <div key={i} className={`bubble ${l.who}`}>
            {l.who === 'them' && <span className="bubble-name">{s.partner.name}</span>}
            {l.text}
          </div>
        ))}
        {(listening || hearing) && <div className="bubble you ghost">{typed || (hearing ? '…' : '🎙️ …')}</div>}
        {praise && <p className="small rp-praise">✓ {praise}</p>}
        <div ref={endRef} />
      </div>
      <div className="rp-controls">
        <div className="try-card">
          <p className="try-label">Prueba a:</p>
          <p className="try-aim">{n.aim ?? `Respondele a ${s.partner.name}. Objetivo: ${s.goal}`}</p>
          {showHint && (
            <p className="small">
              💡 Podrías decir: <b>{n.hint}</b>
            </p>
          )}
          <p className="try-meta">
            {doneCount}/{total} completado
            {lastFix.length > 0 ? ' · ✏️ hay algo para pulir (lo ves al final)' : ''}
          </p>
        </div>
        {keyboard ? (
          <form
            className="composer"
            onSubmit={(ev) => {
              ev.preventDefault();
              if (!busy && typed.trim()) answer(typed);
            }}
          >
            <button type="button" className="round" aria-label="Usar el micrófono" onClick={() => setKeyboard(false)} disabled={!micOk}>
              <Icon name="mic" size={20} />
            </button>
            <input className="answer" value={typed} onChange={(ev) => setTyped(ev.target.value)} placeholder="Escribí tu respuesta en inglés" autoCapitalize="sentences" disabled={busy} autoFocus />
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
              <button className="dock-side" onClick={() => voiceSay(current.current, true)} disabled={!current.current || listening} aria-label="Repetir lento">
                🔁
              </button>
              <button className="dock-side" onClick={() => setShowHint(true)} disabled={showHint} aria-label="Ayuda">
                💡
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Qué estuvo bien de una respuesta, en concreto (no solo «Bien»). */
function goodNote(said: string, praise?: string): string {
  const t = said.toLowerCase();
  const notes: string[] = [];
  if (praise && !/^bien\.?$/i.test(praise.trim())) notes.push(praise);
  if (/\b(could|can|would|may) (i|you)\b/.test(t) || /\bi'?d like\b|\bwould like\b/.test(t)) notes.push('Pedido amable y natural (could / would like).');
  else if (/\bplease\b/.test(t)) notes.push('Buen uso de «please» para pedir con cortesía.');
  if (/^(where|how|what|when|which|who|why|is|are|do|does|did|can|could)\b[^?]*\??$/.test(t.trim()) && t.split(' ').length >= 3) notes.push('Pregunta bien armada.');
  const c = connectorsIn(said).filter((x) => !['and', 'so', 'then'].includes(x));
  if (c.length) notes.push(`Buen uso de «${c[0]}» para unir ideas.`);
  if (/\b(have|has) (been|\w+ed|done|seen|had|got|made|lived|worked)\b/.test(t)) notes.push('Usaste bien el presente perfecto.');
  if (!notes.length) notes.push('Respuesta clara: te entendió a la primera.');
  return notes.slice(0, 2).join(' ');
}

interface Improve {
  said: string;
  right: string;
  why: string;
  tag: string;
}

/** «Puntos clave» al terminar: transcripción, qué hiciste bien, qué podés mejorar y vocabulario. */
function Done({ e, log, turns, onAgain, onBack }: { e: RoleplayEntry; log: Line[]; turns: Turn[]; onAgain: () => void; onBack: () => void }) {
  const s = e.script!;
  const r = scoreRoleplay(turns);
  const [showLog, setShowLog] = useState(false);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [ai, setAi] = useState<{ said: string; text: string; edits: ProofEdit[] }[] | null>(null);
  const mine = turns.filter((t) => t.said.split(' ').length >= 3);

  // Con el corrector bajado, se revisa cada respuesta tuya (en el teléfono).
  useEffect(() => {
    let alive = true;
    (async () => {
      if ((await proofState()) !== 'ready') return;
      const out: { said: string; text: string; edits: ProofEdit[] }[] = [];
      for (const t of mine) {
        try {
          const p = await proofread(t.said);
          const edits = proofEdits(t.said, p.text).filter((x) => !x.minor);
          if (edits.length) out.push({ said: t.said, text: p.text, edits });
        } catch {
          break;
        }
      }
      await unloadProof();
      if (alive) setAi(out);
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const good = turns.filter((t) => t.ok && !t.fixes.length && !ruleHits(t.said).some((h) => !h.soft));
  const improve: Improve[] = [];
  for (const t of turns) {
    for (const f of t.fixes) improve.push({ said: t.said, right: f.right, why: f.why, tag: 'Error típico' });
    for (const h of ruleHits(t.said)) if (!h.soft && !t.fixes.length) improve.push({ said: t.said, right: h.fix ?? '', why: `«${h.found}»: ${h.msg}`, tag: 'Gramática' });
    if (!t.ok) improve.push({ said: t.said, right: t.hint, why: t.aim ? `${t.aim} Una forma natural de decirlo:` : 'No se entendió. Una forma natural de decirlo:', tag: 'Para que te entiendan' });
  }
  for (const a of ai ?? []) if (!improve.some((x) => x.said === a.said)) improve.push({ said: a.said, right: a.text, why: 'El corrector sugiere: ' + a.edits.map((x) => `${x.from || '(falta)'} → ${x.to || '(sacar)'}`).join(' · '), tag: 'Corrector' });

  const saveWord = (en: string, es: string) => {
    if (saved.has(en)) return;
    savePhrase({ es, en });
    setSaved(new Set([...saved, en]));
  };

  return (
    <div className="screen roleplays writing">
      <p className="summary-emoji" aria-hidden="true">
        {r.score >= 80 ? '🏆' : r.score >= 50 ? '🎉' : '💪'}
      </p>
      <h1 className="center">Puntos clave del ejercicio</h1>
      <p className="center small">
        {e.title} · con {s.partner.name}
      </p>
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
          <span className="stat-num">{improve.length}</span>
          <span className="stat-label">para mejorar</span>
        </div>
      </div>
      <p>{r.verdict}</p>

      <button className="w-row" onClick={() => setShowLog(!showLog)}>
        <span className="w-mark">💬</span>
        <span className="w-text">
          <b>{showLog ? 'Ocultar la transcripción' : 'Ver transcripción completa'}</b>
        </span>
      </button>
      {showLog && (
        <div className="rp-log">
          {log.map((l, i) => (
            <div key={i} className={`bubble ${l.who}`}>
              {l.who === 'them' && <span className="bubble-name">{s.partner.name}</span>}
              {l.text}
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <p className="card-title">
          Comentarios <span className="count-pill">{good.length + improve.length}</span>
        </p>
        {good.length > 0 && <p className="sum-head">Qué hiciste bien</p>}
        {good.map((t, i) => (
          <div key={`g${i}`} className="sum-item good">
            <p className="sum-said">{t.said}</p>
            <p className="small">
              {goodNote(t.said, t.praise)}
              {t.meaning ? ' Lo dijiste con tus palabras y se entendió.' : ''}
            </p>
          </div>
        ))}
        {improve.length > 0 && <p className="sum-head">Qué podés mejorar</p>}
        {improve.map((x, i) => (
          <div key={`m${i}`} className="sum-item fix">
            <p className="sum-tag">{x.tag}</p>
            <p className="sum-said">
              <s>{x.said}</s>
            </p>
            <p className="small">{x.why}</p>
            {x.right && <p className="sum-right">→ {x.right}</p>}
          </div>
        ))}
        {ai === null && mine.length > 0 && <p className="small">Si bajás el corrector con IA (en «Escribir en inglés»), también revisa cada frase tuya.</p>}
      </div>

      {s.vocab.length > 0 && (
        <div className="card">
          <p className="card-title">Vocabulario clave</p>
          <p className="small">Las palabras de esta situación. Guardalas para repasarlas en «Mis frases».</p>
          {s.vocab.map((v) => (
            <div key={v.en} className="vocab-row">
              <button className="round small-round" onClick={() => say(v.en, { lang: 'en-AU' })} aria-label={`Escuchar ${v.en}`}>
                🔊
              </button>
              <div className="vocab-text">
                <b>{v.en}</b> <span className="small">({v.say})</span>
                <p className="small">
                  {v.es} · <i>{v.example}</i>
                </p>
              </div>
              <button className="round small-round" onClick={() => saveWord(v.en, v.es)} aria-label="Guardar">
                {saved.has(v.en) ? '✅' : '🔖'}
              </button>
            </div>
          ))}
          <button className="secondary" onClick={() => s.vocab.forEach((v) => saveWord(v.en, v.es))} disabled={s.vocab.every((v) => saved.has(v.en))}>
            🔖 Guardar todas en mis frases
          </button>
        </div>
      )}

      <button className="primary" onClick={onAgain}>
        Hacerlo de nuevo (va a ser distinto)
      </button>
      <button className="link" onClick={onBack}>
        Volver a la biblioteca
      </button>
    </div>
  );
}


/** Bajar o borrar el modelo que entiende lo que quisiste decir (solo en la app de Android). */
function MeaningCard() {
  const [st, setSt] = useState<MeaningState | null>(null);
  const dl = useSyncExternalStore(subscribeDownloads, getDownloads);
  const d = dl[MEANING_PACK.id];
  const busy = !!d && !d.error;
  useEffect(() => {
    meaningState().then(setSt);
  }, [busy]);
  if (!st || st === 'web') return null;
  if (st === 'ready' && !d)
    return (
      <p className="small">
        🧠 Oliver entiende lo que quisiste decir aunque uses otras palabras.{' '}
        <button className="link" onClick={() => removeMeaning().then(() => setSt('missing'))}>
          Borrar el modelo
        </button>
      </p>
    );
  return (
    <div className="card">
      <p className="card-title">🧠 Que te entienda aunque lo digas distinto</p>
      {busy ? (
        <>
          <div className="ai-bar">
            <div style={{ width: `${Math.round(d.progress * 100)}%` }} />
          </div>
          <div className="ai-row">
            <span className="small" style={{ flex: 1 }}>
              Bajando… {Math.round(d.progress * 100)}%
            </span>
            <button className="link" onClick={() => cancelDownload(MEANING_PACK.id)}>
              Cancelar
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="small">
            Un modelo chico ({MEANING_PACK.mb} MB) que compara el significado de lo que decís con lo que espera la otra persona: «Where do I grab my luggage?» vale
            igual que «Where's the baggage claim?». Funciona sin internet y no manda nada a ningún lado.
          </p>
          {d?.error && <p className="small">⚠️ No se pudo bajar ({d.error}). Probá de nuevo con wifi.</p>}
          <button className="secondary" onClick={() => downloadMeaning().then((ok) => ok && setSt('ready'))}>
            ⬇️ Bajar ({MEANING_PACK.mb} MB)
          </button>
          <p className="small" style={{ opacity: 0.75 }}>
            Licencia: {MEANING_PACK.license}
          </p>
        </>
      )}
    </div>
  );
}
