import { useRef, useState } from 'react';
import { ExerciseRunner, type RunnerItem } from '../components/ExerciseRunner';
import { Explanation, ExplanationSheet, axisClass } from '../components/Explanation';
import { unitById } from '../content/curriculum';
import { completeStep, readExplanation, STEP_PASS, type ItemResult } from '../lib/actions';
import { activeSteps, stepItems, type Step } from '../lib/ladder';
import { getState, useAppState } from '../lib/store';
import { levelUnitsDone, nextUnit } from '../lib/progress';

/** Una unidad: la escalera de muy fácil a difícil. */
interface Props {
  unitId: string;
  banner?: string;
  onExit: () => void;
  /** Al dominar la unidad se pasa sola a la siguiente. */
  onNextUnit: (unitId: string, banner: string) => void;
}

export function Lesson({ unitId, banner, onExit, onNextUnit }: Props) {
  const unit = unitById(unitId);
  const s = useAppState();
  const steps = activeSteps(unit);
  const progress = s.units[unitId];
  const done = progress?.status ? steps.length : (progress?.step ?? 0);
  const [running, setRunning] = useState<{ index: number; items: RunnerItem[] } | null>(null);
  const [result, setResult] = useState<{ index: number; score: number; passed: boolean } | null>(null);
  const [notice, setNotice] = useState<string | undefined>(banner);
  const [showExplain, setShowExplain] = useState(done === 0);
  const [sheet, setSheet] = useState(false);
  const firstTry = useRef<ItemResult[]>([]);


  const start = (index: number) => {
    firstTry.current = [];
    setResult(null);
    setRunning({ index, items: stepItems(unit, steps[index].id) });
  };

  /** Después de aprobar: siguiente escalón, siguiente unidad o examen de nivel, sin volver al menú. */
  const advance = (index: number, score: number) => {
    if (index < steps.length - 1) {
      setNotice(`✓ Escalón «${steps[index].title}» superado (${Math.round(score * 100)}%). Seguimos con «${steps[index + 1].title}».`);
      start(index + 1);
      return;
    }
    const st = getState();
    const nxt = nextUnit(st);
    const levelDone = levelUnitsDone(st, unit.level) && nxt?.level !== unit.level;
    const msg = levelDone
      ? `✓ ¡Terminaste ${unit.level}! En Camino tenés la prueba de práctica de ${unit.level} para repasar todo cuando quieras.${nxt ? ` Seguimos con «${nxt.title}».` : ''}`
      : `✓ Dominaste «${unit.title}».${nxt ? ` Seguimos con «${nxt.title}».` : ''}`;
    if (nxt && nxt.id !== unit.id) return onNextUnit(nxt.id, msg);
    setRunning(null);
    setResult({ index, score, passed: true });
  };

  if (running) {
    const step = steps[running.index];
    return (
      <div className="screen">
        <div className="row between">
          <p className="eyebrow">
            {unit.title} · escalón {running.index + 1} de {steps.length}: {step.title}
          </p>
          <span className="row gap">
            <button className="link" onClick={() => setSheet(true)}>
              📖 Explicación
            </button>
            <button className="link" onClick={onExit}>
              Volver
            </button>
          </span>
        </div>
        {sheet && <ExplanationSheet unit={unit} onClose={() => setSheet(false)} />}
        {notice && <p className="notice">{notice}</p>}
        <ExerciseRunner
          key={`${running.index}-${running.items.length}-${notice ?? ''}`}
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
            if (passed) return advance(running.index, score);
            setNotice(undefined);
            setRunning(null);
            setResult({ index: running.index, score, passed });
          }}
        />
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="row between">
        <p className={`eyebrow axis-tag ${axisClass(unit)}`}>
          {unit.level} · {unit.axis}
        </p>
        <button className="link" onClick={onExit}>
          Volver
        </button>
      </div>
      <h1>{unit.title}</h1>
      {notice && !result && <p className="notice">{notice}</p>}

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

      <button className={`explain-toggle ${axisClass(unit)}`} onClick={() => setShowExplain(!showExplain)}>
        <span>📖 Explicación de la unidad</span>
        <span className="small">{showExplain ? 'Ocultar ▲' : 'Ver ▼'}</span>
      </button>
      {showExplain && (
        <>
          <Explanation unit={unit} />
          {done === 0 && (
            <button
              className="primary"
              onClick={() => {
                readExplanation(unit.id);
                setShowExplain(false);
                setNotice(undefined);
                start(1);
              }}
            >
              Entendido, empezar a practicar
            </button>
          )}
        </>
      )}

      {done > 0 && done < steps.length && !showExplain && (
        <button className="primary" onClick={() => start(done)}>
          {result && !result.passed ? 'Repetir' : 'Seguir'}: {steps[done].title}
        </button>
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
