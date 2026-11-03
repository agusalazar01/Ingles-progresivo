import { useMemo, useState } from 'react';
import type { Exercise, Unit } from '../content/types';
import { matches, nearMiss } from '../lib/answer';
import type { ItemResult } from '../lib/actions';
import type { Outcome } from '../lib/store';

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
};

export const correctText = (e: Exercise) => (e.kind === 'choice' ? e.options[e.answer] : e.answers[0]);

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

  const current = queue[pos];
  const total = items.length;
  const doneCount = useMemo(() => queue.slice(0, pos).filter((q) => q.first).length, [queue, pos]);

  if (!current) return null;
  const { item, first } = current;
  const ex = item.exercise;

  const finish = (outcome: Outcome, given: string) => {
    setVerdict(outcome);
    setPhase('feedback');
    onItem(
      { key: item.key, unitId: item.unit.id, prompt: ex.prompt, given, correct: correctText(ex), outcome },
      first,
    );
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
    if (phase !== 'answer' || ex.kind !== 'choice') return;
    setChosen(i);
    finish(i === ex.answer ? 'good' : 'again', ex.options[i]);
  };

  const check = () => {
    if (ex.kind === 'choice' || !input.trim()) return;
    if (matches(input, ex.answers)) return finish(phase === 'retry' ? 'hard' : 'good', input);
    if (ex.kind === 'translate' && phase === 'answer') {
      setPhase('selfcheck');
      return;
    }
    if (phase === 'answer') {
      // Corrección que hace pensar: en vez de dar la respuesta, se pide un segundo intento con una pista.
      setMessage(
        nearMiss(input, ex.answers)
          ? 'Casi: revisá la ortografía e intentá de nuevo.'
          : `No es correcto. ${ex.hint ?? 'Revisá el tiempo verbal y la forma del verbo.'} Intentá de nuevo.`,
      );
      setPhase('retry');
      return;
    }
    finish('again', input);
  };

  return (
    <div className="runner">
      <div className="bar">
        <div className="bar-fill" style={{ width: `${(doneCount / total) * 100}%` }} />
      </div>
      {showUnit && <p className="eyebrow">{item.unit.title} · {item.unit.level}</p>}
      {!first && <p className="eyebrow">Otra vez: esta te había costado</p>}
      <p className="kind">{KIND_LABEL[ex.kind]}</p>
      <p className="prompt">{ex.prompt}</p>

      {ex.kind === 'choice' ? (
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
      ) : (
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
            autoFocus
            placeholder="Escribí tu respuesta"
          />
          {(phase === 'answer' || phase === 'retry') && (
            <button className="primary" type="submit" disabled={!input.trim()}>
              Comprobar
            </button>
          )}
        </form>
      )}

      {phase === 'retry' && message && <p className="hint">{message}</p>}

      {phase === 'selfcheck' && ex.kind !== 'choice' && (
        <div className="feedback neutral">
          <p>No coincide exacto con la respuesta modelo:</p>
          <p className="model">{ex.answers[0]}</p>
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
        <div className={`feedback ${verdict === 'again' ? 'bad' : 'good'}`}>
          <p className="verdict">{verdict === 'again' ? 'La respuesta correcta es:' : verdict === 'hard' ? 'Bien, en el segundo intento.' : '¡Correcto!'}</p>
          {verdict === 'again' && <p className="model">{correctText(ex)}</p>}
          {ex.explain && <p>{ex.explain}</p>}
          {verdict === 'again' && requeue && <p className="small">Te la vuelvo a preguntar al final.</p>}
          <button className="primary" onClick={next} autoFocus>
            Continuar
          </button>
        </div>
      )}
    </div>
  );
}
