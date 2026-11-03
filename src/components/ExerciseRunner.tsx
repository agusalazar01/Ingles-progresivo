import { useEffect, useState } from 'react';
import type { Exercise, Unit } from '../content/types';
import { matches, nearMiss } from '../lib/answer';
import type { ItemResult } from '../lib/actions';
import { canListen, intelligibility, listen, say, stopSpeaking } from '../lib/speech';
import { getState, type Outcome } from '../lib/store';
import { Words } from './Words';

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
};

export const correctText = (e: Exercise) =>
  e.kind === 'choice' || e.kind === 'sound' ? e.options[e.answer] : e.kind === 'speak' ? e.prompt : e.answers[0];

const accent = () => getState().settings.accent;

interface Props {
  items: RunnerItem[];
  /** En lecciones, lo que se falla vuelve al final de la fila hasta salir bien. */
  requeue?: boolean;
  onItem: (r: ItemResult, firstAttempt: boolean) => void;
  onDone: () => void;
  showUnit?: boolean;
}

export function ExerciseRunner({ items, requeue = false, onItem, onDone, showUnit }: Props) {
  const [queue, setQueue] = useState<{ item: RunnerItem; first: boolean }[]>(() => items.map((item) => ({ item, first: true })));
  const [pos, setPos] = useState(0);
  const [phase, setPhase] = useState<Phase>('answer');
  const [input, setInput] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<Outcome | null>(null);
  const [chosen, setChosen] = useState<number | null>(null);
  const [micOk, setMicOk] = useState<boolean | null>(null);
  const [listening, setListening] = useState(false);

  const current = queue[pos];
  const ex = current?.item.exercise;

  // Los ejercicios de audio suenan solos al aparecer.
  useEffect(() => {
    if (!ex) return;
    if (ex.kind === 'listen') say(ex.prompt, { accent: accent() });
    if (ex.kind === 'sound') say(ex.options[ex.answer], { varied: true });
    if (ex.kind === 'speak') canListen().then(setMicOk);
    return () => {
      stopSpeaking();
    };
  }, [pos, ex]);

  if (!current || !ex) return null;
  const { item, first } = current;

  const finish = (outcome: Outcome, given: string) => {
    setVerdict(outcome);
    setPhase('feedback');
    onItem({ key: item.key, unitId: item.unit.id, prompt: ex.prompt, given, correct: correctText(ex), outcome }, first);
    if (requeue && outcome === 'again') setQueue((q) => [...q, { item, first: false }]);
  };

  const next = () => {
    if (pos + 1 >= queue.length) return onDone();
    setPos(pos + 1);
    setPhase('answer');
    setInput('');
    setMessage(null);
    setVerdict(null);
    setChosen(null);
  };

  const choose = (i: number) => {
    if (phase !== 'answer' || (ex.kind !== 'choice' && ex.kind !== 'sound')) return;
    setChosen(i);
    finish(i === ex.answer ? 'good' : 'again', ex.options[i]);
  };

  const check = () => {
    if (!('answers' in ex) || !input.trim()) return;
    if (matches(input, ex.answers)) return finish(phase === 'retry' ? 'hard' : 'good', input);
    if (ex.kind === 'translate' && phase === 'answer') return setPhase('selfcheck');
    if (phase === 'answer') {
      // Corrección que hace pensar: en vez de dar la respuesta, se pide un segundo intento con una pista.
      setMessage(
        nearMiss(input, ex.answers)
          ? 'Casi: revisá la ortografía e intentá de nuevo.'
          : ex.kind === 'listen'
            ? 'No es exactamente eso. Escuchalo de nuevo (podés ponerlo más lento) e intentá otra vez.'
            : `No es correcto. ${ex.hint ?? 'Revisá el tiempo verbal y la forma del verbo.'} Intentá de nuevo.`,
      );
      return setPhase('retry');
    }
    finish('again', input);
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
  const showPromptText = !isAudio && ex.kind !== 'translate';

  return (
    <div className="runner">
      <div className="counter">
        <span>
          Pregunta {pos + 1} de {queue.length}
        </span>
        {!first && <span className="small">repaso de un error</span>}
      </div>
      <div className="bar">
        <div className="bar-fill" style={{ width: `${(pos / queue.length) * 100}%` }} />
      </div>
      {showUnit && (
        <p className="eyebrow">
          {item.unit.title} · {item.unit.level}
        </p>
      )}
      <p className="kind">{KIND_LABEL[ex.kind]}</p>

      {showPromptText && <Words text={ex.prompt} className="prompt" />}
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

      {'answers' in ex && (
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
          <button className="link" onClick={() => finish('skip', '')}>
            Ahora no puedo hablar
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

      {phase === 'feedback' && (
        <div className={`feedback ${verdict === 'again' ? 'bad' : verdict === 'skip' ? 'neutral' : 'good'}`}>
          <p className="verdict">
            {verdict === 'again'
              ? 'La respuesta correcta es:'
              : verdict === 'skip'
                ? 'Lo salteamos por ahora.'
                : verdict === 'hard'
                  ? 'Bien, en el segundo intento.'
                  : '¡Correcto!'}
          </p>
          {(verdict === 'again' || isAudio) && <Words text={correctText(ex)} className="model" />}
          {ex.explain && <p>{ex.explain}</p>}
          {verdict === 'again' && requeue && <p className="small">Te la vuelvo a preguntar al final.</p>}
          <button className="primary" onClick={next}>
            Continuar
          </button>
        </div>
      )}
    </div>
  );
}
