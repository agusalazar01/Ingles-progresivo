import { useEffect, useRef, useState } from 'react';
import { BackButton } from '../components/BackButton';
import { useBack } from '../lib/nav';
import { canListen, listen, say, stopSpeaking } from '../lib/speech';
import { useAppState } from '../lib/store';
import type { Level } from '../content/types';
import { chosenAi } from '../lib/ai';
import { RP_CATEGORIES, ROLEPLAYS } from '../content/roleplays/catalog';
import type { RFix, RoleplayEntry, RoleplayScript } from '../content/roleplays/types';
import { fixesFor, matchOption, pickLine, roleplayById, saveRoleplay, toCallScript } from '../lib/roleplay';
import type { CallScript } from '../content/calls';

type View = { v: 'library' } | { v: 'brief'; id: string } | { v: 'talk'; id: string } | { v: 'done'; id: string; log: Line[]; fixes: Fixed[] };
interface Line {
  who: 'them' | 'you';
  text: string;
}
interface Fixed extends RFix {
  said: string;
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
    return <Talk e={e} s={e.script!} onBack={back} onDone={(log, fixes) => setView({ v: 'done', id: view.id, log, fixes })} />;
  }
  if (view.v === 'done') return <Done e={roleplayById(view.id)!} log={view.log} fixes={view.fixes} onAgain={() => setView({ v: 'talk', id: view.id })} onBack={() => setView({ v: 'library' })} />;
  return <Library onBack={back} onOpen={(id) => setView({ v: 'brief', id })} />;
}

function Library({ onBack, onOpen }: { onBack: () => void; onOpen: (id: string) => void }) {
  const s = useAppState();
  const [level, setLevel] = useState<Level | 'all'>('all');
  const [onlyReady, setOnlyReady] = useState(true);
  const [open, setOpen] = useState<string | null>(null);
  const ready = ROLEPLAYS.filter((r) => r.script).length;
  const list = (cat: string) => ROLEPLAYS.filter((r) => r.category === cat && (level === 'all' || r.level === level) && (!onlyReady || r.script));
  return (
    <div className="screen roleplays">
      <div className="top-bar">
        <BackButton onClick={onBack} />
      </div>
      <p className="eyebrow">Vivir y trabajar en Australia</p>
      <h1>🎭 Roleplays</h1>
      <p className="small">
        Situaciones reales, del aeropuerto a una entrevista de trabajo. Hablás o escribís libre y la otra persona reacciona a lo que decís. {ready} de {ROLEPLAYS.length} listos;
        el resto está en preparación.
      </p>
      <div className="chips">
        {(['all', ...LEVELS] as const).map((l) => (
          <button key={l} className={`chip ${level === l ? 'chosen' : ''}`} onClick={() => setLevel(l)}>
            {l === 'all' ? 'Todos' : l}
          </button>
        ))}
      </div>
      <label className="check">
        <input type="checkbox" checked={onlyReady} onChange={(e) => setOnlyReady(e.target.checked)} /> Solo los que ya tienen guion
      </label>
      {RP_CATEGORIES.map((c) => {
        const items = list(c.id);
        if (!items.length) return null;
        const isOpen = open === c.id || onlyReady;
        return (
          <div key={c.id}>
            <button className="explain-toggle" onClick={() => setOpen(open === c.id ? null : c.id)}>
              <span>
                {c.id}. {c.title}
              </span>
              <span className="small">{items.length}</span>
            </button>
            {isOpen && (
              <div className="ladder">
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

function Brief({ e, onBack, onStart, onAiCall }: { e: RoleplayEntry; onBack: () => void; onStart: () => void; onAiCall: (s: CallScript) => void }) {
  const s = e.script!;
  const [hasBrain, setHasBrain] = useState(false);
  useEffect(() => {
    chosenAi().then((c) => setHasBrain(!!c.brain));
  }, []);
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
      {hasBrain && (
        <button className="link" onClick={() => onAiCall(toCallScript(e, s))}>
          Charla libre con IA (experimental: puede salirse del tema)
        </button>
      )}
    </div>
  );
}

function Talk({ e, s, onBack, onDone }: { e: RoleplayEntry; s: RoleplayScript; onBack: () => void; onDone: (log: Line[], fixes: Fixed[]) => void }) {
  const [node, setNode] = useState(s.start);
  const [log, setLog] = useState<Line[]>([]);
  const [fixes, setFixes] = useState<Fixed[]>([]);
  const [lastFix, setLastFix] = useState<Fixed[]>([]);
  const [tries, setTries] = useState(0);
  const [typed, setTyped] = useState('');
  const [listening, setListening] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showAim, setShowAim] = useState(SHOW_AIM.includes(e.level));
  const [micOk, setMicOk] = useState(false);
  const [busy, setBusy] = useState(true);
  const [praise, setPraise] = useState('');
  const current = useRef('');
  const alive = useRef(true);
  const endRef = useRef<HTMLDivElement>(null);
  const n = s.nodes[node];

  const speak = async (text: string) => {
    if (!text) return;
    setLog((l) => [...l, { who: 'them', text }]);
    current.current = text;
    // Se espera a que termine de hablar, pero nunca más de lo razonable (si la voz falla, la charla sigue).
    const slow = SLOW.includes(e.level);
    await Promise.race([say(text, { slow }).catch(() => {}), new Promise((r) => setTimeout(r, 2500 + text.length * (slow ? 110 : 80)))]);
  };

  useEffect(() => {
    alive.current = true;
    canListen().then(setMicOk);
    (async () => {
      await speak(pickLine(s.nodes[s.start].say));
      if (alive.current) setBusy(false);
    })();
    return () => {
      alive.current = false;
      stopSpeaking();
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
      saveRoleplay(e.id, fixes.length, log.filter((l) => l.who === 'you').length + 1);
      if (alive.current) setTimeout(() => onDone(logRef.current, fixesRef.current), 900);
      return;
    }
    setNode(next);
    await speak([reply, pickLine(s.nodes[next].say)].filter(Boolean).join(' '));
  };

  const logRef = useRef(log);
  logRef.current = log;
  const fixesRef = useRef(fixes);
  fixesRef.current = fixes;

  const answer = async (heard: string[]) => {
    const said = heard.find((h) => h.trim()) ?? '';
    if (!said) return;
    setBusy(true);
    setTyped('');
    setPraise('');
    setLog((l) => [...l, { who: 'you', text: said }]);
    const found = fixesFor(n, said).map((f) => ({ ...f, said }));
    setLastFix(found);
    if (found.length) setFixes((f) => [...f, ...found]);
    const opt = matchOption(n, heard);
    if (opt) {
      if (opt.praise && !found.length) setPraise(opt.praise);
      await goTo(opt.next, pickLine(opt.reply));
    } else if (tries === 0) {
      setTries(1);
      setShowAim(true);
      await speak(pickLine(['Sorry, could you say that again?', "Sorry, I didn't catch that.", 'Sorry?']));
    } else {
      setShowHint(true);
      await goTo(n.fallback.next, n.fallback.reply);
    }
    if (alive.current) setBusy(false);
  };

  const mic = async () => {
    if (busy || listening) return;
    setListening(true);
    try {
      const heard = await listen('en-AU');
      setListening(false);
      if (heard.some((h) => h.trim())) await answer(heard);
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
        <div className="row">
          <button className="secondary" onClick={() => say(current.current, { slow: true })} disabled={!current.current}>
            🔁 Repetir lento
          </button>
          <button className="secondary" onClick={() => setShowHint(true)}>
            💡 Ayuda
          </button>
        </div>
        <form
          className="row"
          onSubmit={(ev) => {
            ev.preventDefault();
            if (!busy && typed.trim()) answer([typed]);
          }}
        >
          <input className="answer" value={typed} onChange={(ev) => setTyped(ev.target.value)} placeholder="Escribí tu respuesta en inglés" autoCapitalize="sentences" disabled={busy} />
          <button className="primary" type="submit" disabled={busy || !typed.trim()}>
            Enviar
          </button>
        </form>
        {micOk && (
          <button className="primary mic-big" onClick={mic} disabled={busy}>
            {listening ? '🎙️ Escuchando…' : '🎙️ Hablar'}
          </button>
        )}
      </div>
    </div>
  );
}

function Done({ e, log, fixes, onAgain, onBack }: { e: RoleplayEntry; log: Line[]; fixes: Fixed[]; onAgain: () => void; onBack: () => void }) {
  const s = e.script!;
  const yours = log.filter((l) => l.who === 'you').length;
  return (
    <div className="screen roleplays">
      <p className="summary-emoji" aria-hidden="true">
        🎉
      </p>
      <h1 className="center">¡Roleplay terminado!</h1>
      <p className="center small">
        {e.title} · {yours} respuestas tuyas
      </p>
      <div className="card">
        <p className="card-title">🎯 Objetivo</p>
        <p className="small">{s.goal}</p>
      </div>
      {fixes.length > 0 ? (
        <>
          <h2>Para mejorar</h2>
          {fixes.map((f, i) => (
            <div key={i} className="card">
              <p className="small">
                Dijiste: <s>{f.said}</s>
              </p>
              <p>
                Mejor: <b>{f.right}</b>
              </p>
              <p className="small">{f.why}</p>
            </div>
          ))}
        </>
      ) : (
        <p className="center">No apareció ninguno de los errores típicos. ¡Muy bien!</p>
      )}
      <h2>La charla</h2>
      <div className="rp-log">
        {log.map((l, i) => (
          <div key={i} className={`bubble ${l.who}`}>
            {l.who === 'them' && <b>{s.partner.name}: </b>}
            {l.text}
          </div>
        ))}
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
