import { useRef, useState } from 'react';
import { ExerciseRunner, type RunnerItem } from '../components/ExerciseRunner';
import { Words } from '../components/Words';
import { unitById } from '../content/curriculum';
import { completeStep, readExplanation, STEP_PASS, type ItemResult } from '../lib/actions';
import { activeSteps, stepItems, type Step } from '../lib/ladder';
import { say } from '../lib/speech';
import { getState, useAppState } from '../lib/store';

/** Una unidad: la escalera de muy fácil a difícil. */
export function Lesson({ unitId, onExit }: { unitId: string; onExit: () => void }) {
  const unit = unitById(unitId);
  const s = useAppState();
  const steps = activeSteps(unit);
  const progress = s.units[unitId];
  const done = progress?.status ? steps.length : (progress?.step ?? 0);
  const [running, setRunning] = useState<{ index: number; items: RunnerItem[] } | null>(null);
  const [result, setResult] = useState<{ index: number; score: number; passed: boolean } | null>(null);
  const [showExplain, setShowExplain] = useState(done === 0);
  const firstTry = useRef<ItemResult[]>([]);

  const accent = () => getState().settings.accent;

  const start = (index: number) => {
    firstTry.current = [];
    setResult(null);
    setRunning({ index, items: stepItems(unit, steps[index].id) });
  };

  if (running) {
    const step = steps[running.index];
    return (
      <div className="screen">
        <p className="eyebrow">
          {unit.title} · escalón {running.index + 1}: {step.title}
        </p>
        <ExerciseRunner
          key={`${running.index}-${result?.score ?? ''}`}
          items={running.items}
          requeue
          timed={step.id === 'fluency'}
          onItem={(r, first) => {
            if (first) firstTry.current.push(r);
          }}
          onDone={() => {
            const graded = firstTry.current.filter((r) => r.outcome !== 'skip');
            const score = graded.length ? graded.filter((r) => r.outcome === 'good').length / graded.length : 1;
            const passed = score >= STEP_PASS;
            completeStep(unit.id, running.index, steps.length - 1, firstTry.current, passed);
            setRunning(null);
            setResult({ index: running.index, score, passed });
          }}
        />
      </div>
    );
  }

  return (
    <div className="screen">
      <p className="eyebrow">
        {unit.level} · {unit.axis}
      </p>
      <h1>{unit.title}</h1>

      {result && (
        <div className={`feedback ${result.passed ? 'good' : 'bad'}`}>
          <p className="verdict">
            {result.passed ? `¡Escalón «${steps[result.index].title}» superado!` : `Todavía no: ${Math.round(result.score * 100)}% bien al primer intento`}
          </p>
          <p>
            {result.passed
              ? result.index === steps.length - 1
                ? 'Dominaste la unidad. Va a volver en tus repasos para que no se olvide.'
                : `${Math.round(result.score * 100)}% bien al primer intento${steps[result.index].id === 'fluency' ? ' y a tiempo' : ''}. Se abre el siguiente escalón.`
              : `Necesitás ${Math.round(STEP_PASS * 100)}%${steps[result.index].id === 'fluency' ? ', respondiendo a tiempo' : ''}. Repetilo: las oraciones van a ser otras.`}
          </p>
        </div>
      )}

      <button className="link left" onClick={() => setShowExplain(!showExplain)}>
        {showExplain ? 'Ocultar explicación' : 'Ver explicación'}
      </button>
      {showExplain && (
        <>
          {unit.explanation.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <div className="examples">
            {unit.examples.map(([en, es]) => (
              <div key={en} className="example">
                <div className="example-row">
                  <Words text={en} className="en" />
                  <button className="icon" onClick={() => say(en, { accent: accent() })} aria-label="Escuchar">
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
          {done === 0 && (
            <button
              className="primary"
              onClick={() => {
                readExplanation(unit.id);
                setShowExplain(false);
              }}
            >
              Entendido, empezar a practicar
            </button>
          )}
        </>
      )}

      <h2>Escalera</h2>
      <div className="ladder">
        {steps.map((st: Step, i) => {
          const state = i < done ? 'done' : i === done ? 'current' : 'locked';
          return (
            <button
              key={st.id}
              className={`rung ${state}`}
              disabled={state === 'locked' || st.id === 'explain'}
              onClick={() => start(i)}
            >
              <span className="rung-num">{state === 'done' ? '✓' : i + 1}</span>
              <span>
                <span className="unit-title">{st.title}</span>
                <span className="unit-status">{st.desc}</span>
              </span>
            </button>
          );
        })}
      </div>
      {done >= steps.length && <p className="small">Podés repetir cualquier escalón: cada vez trae oraciones nuevas.</p>}
      <button className="secondary" onClick={onExit}>
        Volver
      </button>
    </div>
  );
}
