import { useEffect, useMemo, useRef, useState } from 'react';
import { sfxCombo, sfxCorrect, sfxWrong } from '../lib/sfx';
import { TIME_LIMIT } from '../lib/ladder';
import type { Exercise, Unit } from '../content/types';
import { matches, nearMiss, normalize, samePersonVariants, futureAlternatives } from '../lib/answer';
import type { ItemResult } from '../lib/actions';
import { canListen, intelligibility, listen, say, stopSpeaking } from '../lib/speech';
import { getState, type Outcome } from '../lib/store';
import { Words } from './Words';
import { explainMistake } from '../lib/why';
import { themeOf } from '../content/themes';

export interface RunnerItem {
  key: string;
  unit: Unit;
  exercise: Exercise;
}

type Phase = 'answer' | 'retry' | 'selfcheck' | 'feedback';

const KIND_LABEL: Record<Exercise['kind'], string> = {
  choice: 'Elegí la opción correcta',
  type: 'Completá el espacio',
  fix: 'Esta oración tiene un error. Escribila bien',
  translate: 'Traducí al inglés',
  listen: 'Escuchá y escribí lo que oís',
  sound: '¿Qué palabra escuchaste?',
  speak: 'Decilo en voz alta',
  order: 'Ordená las palabras',
  create: 'Creá tu propia oración',
  transform: 'Transformá la oración',
};

export const correctText = (e: Exercise) =>
  e.kind === 'choice' || e.kind === 'sound' ? e.options[e.answer] : e.kind === 'speak' ? e.prompt : e.kind === 'create' ? e.example : e.answers[0];

const accent = () => getState().settings.accent;

/** «Ahora no puedo hablar / escuchar»: saltea esos ejercicios durante 15 minutos. */
const SKIP_MS = 15 * 60 * 1000;
const skipUntil = { speak: 0, audio: 0 };
const skipping = (e: Exercise) =>
  (e.kind === 'speak' && Date.now() < skipUntil.speak) || ((e.kind === 'listen' || e.kind === 'sound') && Date.now() < skipUntil.audio);

const CHARACTER = `${import.meta.env.BASE_URL}call/character.svg`;

/** El personaje que «dice» la frase en los ejercicios de escuchar y repetir. */
function Speaker({ text, onPlay }: { text?: string; onPlay: () => void }) {
  return (
    <div className="speaker">
      <img src={CHARACTER} alt="Oliver" className="speaker-img" />
      <button className="bubble" onClick={onPlay}>
        <span aria-hidden="true">🔊</span> {text ?? 'Escuchá'}
      </button>
    </div>
  );
}

const shuffleWords = (s: string, seed: number) => {
  const w = s.replace(/[.,!?]/g, '').split(/\s+/).filter(Boolean);
  let x = seed + 7;
  for (let i = w.length - 1; i > 0; i--) {
    x = (x * 9301 + 49297) % 233280;
    const j = Math.floor((x / 233280) * (i + 1));
    [w[i], w[j]] = [w[j], w[i]];
  }
  return w;
};

interface Props {
  items: RunnerItem[];
  /** En lecciones, lo que se falla vuelve al final de la fila hasta salir bien. */
  requeue?: boolean;
  onItem: (r: ItemResult, firstAttempt: boolean) => void;
  onDone: () => void;
  showUnit?: boolean;
  /** Modo fluidez: muestra el tiempo y una respuesta correcta pero lenta cuenta como "difícil". */
  timed?: boolean;
  /** Para retomar: la fila y la posición guardadas. */
  initial?: { queue: { item: RunnerItem; first: boolean }[]; pos: number };
  /** Se llama después de cada respuesta con la fila y la próxima posición (para guardar y retomar). */
  onProgress?: (queue: { item: RunnerItem; first: boolean }[], nextPos: number) => void;
}

export type RunnerQueue = NonNullable<Props['initial']>['queue'];

export function ExerciseRunner({ items, requeue = false, onItem, onDone, showUnit, timed = false, initial, onProgress }: Props) {
  const [queue, setQueue] = useState<{ item: RunnerItem; first: boolean }[]>(() => initial?.queue ?? items.map((item) => ({ item, first: true })));
  const [pos, setPos] = useState(initial?.pos ?? 0);
  const [phase, setPhase] = useState<Phase>('answer');
  const [input, setInput] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<Outcome | null>(null);
  const [chosen, setChosen] = useState<number | null>(null);
  const [micOk, setMicOk] = useState<boolean | null>(null);
  const [listening, setListening] = useState(false);
  const [picked, setPicked] = useState<number[]>([]);
  const [slow, setSlow] = useState(false);
  const [givenText, setGiven] = useState('');
  const [combo, setCombo] = useState(0);
  const [tiles, setTiles] = useState(false);
  const started = useRef(Date.now());

  const current = queue[pos];
  const ex = current?.item.exercise;

  // Los ejercicios de audio suenan solos al aparecer.
  useEffect(() => {
    if (!ex) return;
    if (skipping(ex)) {
      const t = setTimeout(() => skipNow(), 0);
      return () => clearTimeout(t);
    }
    if (ex.kind === 'listen') say(ex.prompt, { accent: accent() });
    if (ex.kind === 'sound') say(ex.options[ex.answer], { varied: true });
    if (ex.kind === 'speak') canListen().then(setMicOk);
    started.current = Date.now();
    return () => {
      stopSpeaking();
    };
  }, [pos, ex]);

  const tileWords = useMemo(() => (ex?.kind === 'translate' ? shuffleWords(ex.answers[0], pos) : []), [ex, pos]);

  if (!current || !ex) return null;
  const { item, first } = current;
  const isNewWord = item.key.startsWith('w:') && !getState().cards[item.key];

  /** Saltea sin mostrar nada (ejercicios de voz cuando dijiste que no podés). */
  function skipNow() {
    onItem({ key: item.key, unitId: item.unit.id, prompt: ex.prompt, given: '', correct: correctText(ex), outcome: 'skip', ms: 0 }, first);
    onProgress?.(queue, pos + 1);
    next();
  }

  const finish = (raw: Outcome, given: string) => {
    const ms = Date.now() - started.current;
    const tooSlow = timed && raw === 'good' && ms > TIME_LIMIT[ex.kind] * 1000;
    const outcome: Outcome = tooSlow ? 'hard' : raw;
    setSlow(tooSlow);
    setVerdict(outcome);
    setPhase('feedback');
    setGiven(given);
    if (outcome === 'again') {
      sfxWrong();
      setCombo(0);
    } else if (outcome === 'good' || outcome === 'hard') {
      const c = outcome === 'good' && first ? combo + 1 : 0;
      setCombo(c);
      if (c > 0 && c % 5 === 0) sfxCombo();
      else sfxCorrect();
    }
    onItem({ key: item.key, unitId: item.unit.id, prompt: ex.prompt, given, correct: correctText(ex), outcome, ms, ...(tooSlow ? { slow: true } : {}) }, first);
    const nextQueue = requeue && first && outcome === 'again' ? [...queue, { item, first: false }] : queue;
    if (nextQueue !== queue) setQueue(nextQueue);
    onProgress?.(nextQueue, pos + 1);
  };

  const next = () => {
    if (pos + 1 >= queue.length) return onDone();
    setPos(pos + 1);
    setPhase('answer');
    setInput('');
    setMessage(null);
    setVerdict(null);
    setChosen(null);
    setPicked([]);
    setSlow(false);
    setTiles(false);
  };

  const choose = (i: number) => {
    if (phase !== 'answer' || (ex.kind !== 'choice' && ex.kind !== 'sound')) return;
    setChosen(i);
    finish(i === ex.answer ? 'good' : 'again', ex.options[i]);
  };

  const orderText = ex.kind === 'order' ? picked.map((i) => ex.words[i]).join(' ') : tiles ? picked.map((i) => tileWords[i]).join(' ') : '';
  const given = ex.kind === 'order' || tiles ? orderText : input;

  const checkCreate = () => {
    if (ex.kind !== 'create' || !input.trim()) return;
    const n = ` ${normalize(input)} `;
    const ok = normalize(input).split(' ').length >= 3 && ex.accept.some((a) => n.includes(` ${normalize(a)} `));
    if (ok) return finish(phase === 'retry' ? 'hard' : 'good', input);
    if (phase === 'answer') {
      setMessage(`Casi. ${ex.hint ?? ''} Escribí una oración completa (sujeto + verbo + algo más).`);
      return setPhase('retry');
    }
    finish('again', input);
  };

  const check = () => {
    if (ex.kind === 'create') return checkCreate();
    if (!('answers' in ex) || !given.trim()) return;
    const base = ex.kind === 'transform' ? samePersonVariants(ex.prompt, ex.answers) : ex.answers;
    const accepted = ex.kind === 'fix' || ex.kind === 'translate' || ex.kind === 'order' ? [...base, ...futureAlternatives(base)] : base;
    if (matches(given, accepted)) return finish(phase === 'retry' ? 'hard' : 'good', given);
    if (ex.kind === 'translate' && phase === 'answer' && !tiles) return setPhase('selfcheck');
    if (phase === 'answer') {
      // Corrección que hace pensar: en vez de dar la respuesta, se pide un segundo intento con una pista.
      setMessage(
        nearMiss(given, ex.answers)
          ? 'Casi: revisá la ortografía e intentá de nuevo.'
          : ex.kind === 'listen'
            ? 'No es exactamente eso. Escuchalo de nuevo (podés ponerlo más lento) e intentá otra vez.'
            : ex.kind === 'order'
              ? 'El orden no es correcto. Pensá: sujeto, verbo y después el resto. Intentá de nuevo.'
              : `No es correcto. ${('hint' in ex && ex.hint) || 'Revisá el tiempo verbal y la forma del verbo.'} Intentá de nuevo.`,
      );
      if (ex.kind === 'order' || tiles) setPicked([]);
      return setPhase('retry');
    }
    finish('again', given);
  };

  const speakNow = async () => {
    if (ex.kind !== 'speak') return;
    setListening(true);
    setMessage(null);
    try {
      const heard = await listen('en-US');
      const { score, best } = intelligibility(ex.prompt, heard);
      if (score >= 0.85) return finish(phase === 'retry' ? 'hard' : 'good', best);
      if (phase === 'answer') {
        setMessage(heard.length ? `Entendí: «${best}». Escuchá el modelo y probá de nuevo.` : 'No te escuché. Probá de nuevo, más cerca del micrófono.');
        return setPhase('retry');
      }
      finish('again', best || '(sin audio)');
    } catch {
      setMessage('No pude usar el micrófono. Revisá el permiso o tocá "Ahora no puedo hablar".');
    } finally {
      setListening(false);
    }
  };

  const isAudio = ex.kind === 'listen' || ex.kind === 'sound';
  const showPromptText = !isAudio && ex.kind !== 'translate' && ex.kind !== 'order';

  return (
    <div className="runner">
      <div className="counter">
        <span>
          Pregunta {pos + 1} de {queue.length}
        </span>
        {!first && <span className="small">repaso de un error</span>}
        {first && combo >= 2 && <span className="combo">🔥 {combo} seguidas</span>}
      </div>
      <div className="bar">
        <div className="bar-fill" style={{ width: `${(pos / queue.length) * 100}%` }} />
      </div>
      {showUnit && (
        <p className="eyebrow">
          {item.unit.title} · {themeOf(item.unit)?.title ?? ''}
        </p>
      )}
      {isNewWord && <p className="new-word">✦ Palabra nueva</p>}
      <p className="kind">{ex.kind === 'speak' ? 'Repetí lo que dice Oliver' : KIND_LABEL[ex.kind]}</p>

      {timed && phase !== 'feedback' && (
        <div className="timer" key={`t${pos}`}>
          <div className="timer-fill" style={{ animationDuration: `${TIME_LIMIT[ex.kind]}s` }} />
        </div>
      )}
      {(ex.kind === 'speak' || ex.kind === 'listen') && (
        <Speaker text={ex.kind === 'speak' ? ex.prompt : undefined} onPlay={() => say(ex.prompt, { accent: accent() })} />
      )}
      {showPromptText && ex.kind !== 'speak' && <Words text={ex.prompt} className="prompt" />}
      {(ex.kind === 'type' || ex.kind === 'choice') && ex.context && <p className="context">🇺🇾 {ex.context}</p>}
      {ex.kind === 'transform' && <p className="task">→ {ex.task}</p>}
      {ex.kind === 'order' && ex.prompt && <p className="prompt-es">{ex.prompt}</p>}
      {ex.kind === 'translate' && <p className="prompt">{ex.prompt}</p>}
      {ex.kind === 'speak' && ex.es && <p className="small">{ex.es}</p>}

      {(isAudio || ex.kind === 'speak') && (
        <div className="row">
          <button
            className="secondary"
            onClick={() =>
              ex.kind === 'sound' ? say(ex.options[ex.answer], { varied: true }) : say(ex.prompt, { accent: accent() })
            }
          >
            {ex.kind === 'speak' ? 'Escuchar modelo' : 'Escuchar de nuevo'}
          </button>
          {ex.kind !== 'sound' && (
            <button className="secondary" onClick={() => say(ex.prompt, { accent: accent(), slow: true })}>
              Más lento
            </button>
          )}
        </div>
      )}

      {isAudio && (phase === 'answer' || phase === 'retry') && (
        <button
          className="link"
          onClick={() => {
            skipUntil.audio = Date.now() + SKIP_MS;
            finish('skip', '');
          }}
        >
          Ahora no puedo escuchar (15 min)
        </button>
      )}

      {(ex.kind === 'choice' || ex.kind === 'sound') && (
        <div className="options">
          {ex.options.map((o, i) => (
            <button
              key={o}
              className={`option ${phase === 'feedback' && i === ex.answer ? 'right' : ''} ${phase === 'feedback' && i === chosen && i !== ex.answer ? 'wrong' : ''}`}
              onClick={() => choose(i)}
              disabled={phase === 'feedback'}
            >
              {o}
            </button>
          ))}
        </div>
      )}

      {ex.kind === 'order' && (
        <div className="order">
          <div className="order-line">
            {picked.length === 0 && <span className="small">Tocá las palabras en orden</span>}
            {picked.map((i, j) => (
              <button
                key={`${i}-${j}`}
                className="chip chosen"
                disabled={phase === 'feedback'}
                onClick={() => setPicked(picked.filter((_, k) => k !== j))}
              >
                {ex.words[i]}
              </button>
            ))}
          </div>
          <div className="order-bank">
            {ex.words.map((w, i) => (
              <button key={`${w}-${i}`} className="chip" disabled={picked.includes(i) || phase === 'feedback'} onClick={() => setPicked([...picked, i])}>
                {w}
              </button>
            ))}
          </div>
          {(phase === 'answer' || phase === 'retry') && (
            <button className="primary" onClick={check} disabled={picked.length !== ex.words.length}>
              Comprobar
            </button>
          )}
        </div>
      )}

      {ex.kind === 'translate' && tiles && (
        <div className="order">
          <div className="order-line">
            {picked.length === 0 && <span className="small">Tocá las fichas en orden</span>}
            {picked.map((i, j) => (
              <button key={`${i}-${j}`} className="chip chosen" disabled={phase === 'feedback'} onClick={() => setPicked(picked.filter((_, k) => k !== j))}>
                {tileWords[i]}
              </button>
            ))}
          </div>
          <div className="order-bank">
            {tileWords.map((w, i) => (
              <button key={`${w}-${i}`} className="chip" disabled={picked.includes(i) || phase === 'feedback'} onClick={() => setPicked([...picked, i])}>
                {w}
              </button>
            ))}
          </div>
          {(phase === 'answer' || phase === 'retry') && (
            <button className="primary" onClick={check} disabled={picked.length !== tileWords.length}>
              Comprobar
            </button>
          )}
        </div>
      )}
      {ex.kind === 'translate' && (phase === 'answer' || phase === 'retry') && (
        <button
          className="link"
          onClick={() => {
            setTiles(!tiles);
            setPicked([]);
          }}
        >
          {tiles ? '⌨️ Escribirla con el teclado' : '🧩 Armarla con fichas'}
        </button>
      )}

      {('answers' in ex || ex.kind === 'create') && ex.kind !== 'order' && !(ex.kind === 'translate' && tiles) && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            check();
          }}
        >
          <input
            className="answer"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={phase === 'feedback' || phase === 'selfcheck'}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            autoFocus={!isAudio}
            placeholder="Escribí tu respuesta"
          />
          {(phase === 'answer' || phase === 'retry') && (
            <button className="primary" type="submit" disabled={!input.trim()}>
              Comprobar
            </button>
          )}
        </form>
      )}

      {ex.kind === 'speak' && (phase === 'answer' || phase === 'retry') && (
        <>
          {micOk === false ? (
            <p className="hint">Este teléfono no tiene reconocimiento de voz disponible.</p>
          ) : (
            <button className="primary mic" onClick={speakNow} disabled={listening}>
              {listening ? 'Escuchando…' : 'Tocá y hablá'}
            </button>
          )}
          <button
            className="link"
            onClick={() => {
              skipUntil.speak = Date.now() + SKIP_MS;
              finish('skip', '');
            }}
          >
            Ahora no puedo hablar (15 min)
          </button>
        </>
      )}

      {phase === 'retry' && message && <p className="hint">{message}</p>}
      {phase === 'answer' && message && <p className="hint">{message}</p>}

      {phase === 'selfcheck' && 'answers' in ex && (
        <div className="feedback neutral">
          <p>No coincide exacto con la respuesta modelo:</p>
          <Words text={ex.answers[0]} className="model" />
          <p>¿Tu traducción dice lo mismo y es gramaticalmente correcta?</p>
          <div className="row">
            <button className="secondary" onClick={() => finish('again', input)}>
              No
            </button>
            <button className="primary" onClick={() => finish('good', input)}>
              Sí, estaba bien
            </button>
          </div>
        </div>
      )}

      {phase === 'feedback' && <div className="sheet-spacer" />}
      {phase === 'feedback' && (
        <div className={`feedback feedback-sheet ${verdict === 'again' ? 'bad' : verdict === 'skip' ? 'neutral' : 'good'}`}>
          <p className="verdict">
            {slow
              ? '✓ Correcto, pero lento: va a volver antes para ganar fluidez.'
              : verdict === 'again'
              ? '✗ Incorrecto. La respuesta correcta es:'
              : verdict === 'skip'
                ? 'Lo salteamos por ahora.'
                : verdict === 'hard'
                  ? '✓ Bien, en el segundo intento.'
                  : combo >= 3
                    ? `✓ ¡Perfecto! ${combo} seguidas`
                    : '✓ ¡Bien!'}
          </p>
          {ex.kind === 'create' && verdict !== 'skip' && <p className="small">Ejemplo:</p>}
          {(verdict === 'again' || isAudio || ex.kind === 'translate' || ex.kind === 'transform' || ex.kind === 'create') && <Words text={correctText(ex)} className="model" />}
          {ex.explain && verdict !== 'again' && <p>{ex.explain}</p>}
          {(verdict === 'again' || verdict === 'hard') &&
            (() => {
              const m = explainMistake(item.key, item.unit, ex, verdict === 'again' ? givenText : '', correctText(ex));
              if (!m.why && !m.yours) return null;
              return (
                <div className="why">
                  <p className="why-title">¿Por qué?</p>
                  {m.why && <p>{m.why}</p>}
                  {m.yours && (
                    <p className="why-yours">
                      <b>Lo que pusiste:</b> {m.yours}
                    </p>
                  )}
                </div>
              );
            })()}
          {verdict === 'again' && requeue && <p className="small">Te la vuelvo a preguntar al final.</p>}
          <button className="primary" onClick={next}>
            Continuar
          </button>
        </div>
      )}
    </div>
  );
}
