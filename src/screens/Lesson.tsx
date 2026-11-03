import { useMemo, useRef, useState } from 'react';
import { ExerciseRunner } from '../components/ExerciseRunner';
import { unitById } from '../content/curriculum';
import { finishLesson, MASTERY, type ItemResult } from '../lib/actions';
import { cardKey, getState } from '../lib/store';
import { Words } from '../components/Words';
import { say } from '../lib/speech';

const shuffle = <T,>(a: T[]) => a.map((x) => ({ x, k: Math.random() })).sort((p, q) => p.k - q.k).map((p) => p.x);

export function Lesson({ unitId, onExit }: { unitId: string; onExit: () => void }) {
  const unit = unitById(unitId);
  const [step, setStep] = useState<'learn' | 'practice' | 'result'>('learn');
  const [attempt, setAttempt] = useState(0);
  const firstTry = useRef<ItemResult[]>([]);
  const [score, setScore] = useState(0);

  const items = useMemo(
    () => shuffle(unit.exercises.map((exercise, i) => ({ key: cardKey(unit.id, i), unit, exercise }))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unit, attempt],
  );

  if (step === 'learn') {
    return (
      <div className="screen">
        <p className="eyebrow">
          {unit.level} · {unit.axis}
        </p>
        <h1>{unit.title}</h1>
        {unit.explanation.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <div className="examples">
          {unit.examples.map(([en, es]) => (
            <div key={en} className="example">
              <div className="example-row">
                <Words text={en} className="en" />
                <button className="icon" onClick={() => say(en, { accent: getState().settings.accent })} aria-label="Escuchar">
                  ▶
                </button>
              </div>
              <p className="es">{es}</p>
            </div>
          ))}
        </div>
        <div className="trap">
          <p className="trap-title">Trampa para hispanohablantes</p>
          <p>{unit.trap}</p>
        </div>
        <p className="small">Tocá cualquier palabra en inglés para ver qué significa.</p>
        <div className="row">
          <button className="secondary" onClick={onExit}>
            Volver
          </button>
          <button
            className="primary"
            onClick={() => {
              firstTry.current = [];
              setStep('practice');
            }}
          >
            Practicar ({unit.exercises.length})
          </button>
        </div>
      </div>
    );
  }

  if (step === 'practice') {
    return (
      <div className="screen">
        <ExerciseRunner
          key={attempt}
          items={items}
          requeue
          onItem={(r, first) => {
            if (first) firstTry.current.push(r);
          }}
          onDone={() => {
            const graded = firstTry.current.filter((r) => r.outcome !== 'skip');
            const ok = graded.length ? graded.filter((r) => r.outcome === 'good').length / graded.length : 1;
            setScore(ok);
            finishLesson(unit.id, firstTry.current, ok >= MASTERY);
            setStep('result');
          }}
        />
      </div>
    );
  }

  const mastered = score >= MASTERY;
  return (
    <div className="screen">
      <h1>{mastered ? 'Unidad dominada' : 'Todavía no'}</h1>
      <p className="big">{Math.round(score * 100)}% bien al primer intento</p>
      <p>
        {mastered
          ? 'Se desbloquean las unidades que dependen de esta. Sus ejercicios van a volver en tus repasos, espaciados en el tiempo, para que no se olviden.'
          : `Para dominarla necesitás ${Math.round(MASTERY * 100)}% al primer intento. Lo que fallaste quedó en tu registro de errores. Releé la explicación y volvé a intentar; mejor si es mañana.`}
      </p>
      <div className="row">
        {!mastered && (
          <button
            className="secondary"
            onClick={() => {
              setAttempt(attempt + 1);
              setStep('learn');
            }}
          >
            Repetir
          </button>
        )}
        <button className="primary" onClick={onExit}>
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
