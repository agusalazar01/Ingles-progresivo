import { useRef, useState } from 'react';
import { ExerciseRunner, type RunnerItem, type RunnerQueue } from '../components/ExerciseRunner';
import { themeOf } from '../content/themes';
import { Explanation, ExplanationSheet, axisClass } from '../components/Explanation';
import { unitById } from '../content/curriculum';
import { completeStep, readExplanation, STEP_PASS, type ItemResult } from '../lib/actions';
import { activeSteps, stepItems, type Step } from '../lib/ladder';
import { clearRun, getState, saveRun, useAppState, type SavedRun } from '../lib/store';
import { levelUnitsDone, nextUnit, unitPercent } from '../lib/progress';

/** Una unidad: la escalera de muy fácil a difícil. */
interface Props {
  unitId: string;
  banner?: string;
  /** Entrar directo al escalón que quedó a medias. */
  resume?: boolean;
  onExit: () => void;
  /** Al dominar la unidad se pasa sola a la siguiente. */
  onNextUnit: (unitId: string, banner: string) => void;
}

const toSaved = (q: RunnerQueue): SavedRun['queue'] => q.map(({ item, first }) => ({ key: item.key, exercise: item.exercise, first }));

export function Lesson({ unitId, banner, resume, onExit, onNextUnit }: Props) {
  const unit = unitById(unitId);
  const s = useAppState();
  const steps = activeSteps(unit);
  const progress = s.units[unitId];
  // El tic de completado aparece solo al dominar la unidad (no por el test de ubicación).
  const done = progress?.status === 'mastered' ? steps.length : (progress?.step ?? 0);
  const saved = s.resume[unitId];
  const fromSaved = (r: SavedRun) => ({
    index: r.stepIndex,
    items: r.queue.map((q) => ({ key: q.key, unit, exercise: q.exercise })),
    initial: { queue: r.queue.map((q) => ({ item: { key: q.key, unit, exercise: q.exercise }, first: q.first })), pos: r.pos },
  });
  const [running, setRunning] = useState<{ index: number; items: RunnerItem[]; initial?: { queue: RunnerQueue; pos: number } } | null>(() => {
    const r = getState().resume[unitId];
    if (!resume || !r || r.pos >= r.queue.length) return null;
    return fromSaved(r);
  });
  const [result, setResult] = useState<{ index: number; score: number; passed: boolean } | null>(null);
  const [notice, setNotice] = useState<string | undefined>(banner);
  const [showExplain, setShowExplain] = useState(done === 0);
  const [sheet, setSheet] = useState(false);
  const firstTry = useRef<ItemResult[]>(resume ? (getState().resume[unitId]?.firstTry ?? []) : []);


  const start = (index: number) => {
    firstTry.current = [];
    setResult(null);
    const items = stepItems(unit, steps[index].id);
    saveRun(unit.id, { stepIndex: index, queue: toSaved(items.map((item) => ({ item, first: true }))), pos: 0, firstTry: [] });
    setRunning({ index, items });
  };

  const resumeSaved = () => {
    const r = getState().resume[unitId];
    if (!r) return;
    firstTry.current = r.firstTry;
    setResult(null);
    if (r.pos >= r.queue.length) return finishStep(r.stepIndex);
    setRunning(fromSaved(r));
  };

  /** Fin de un escalón: se califica con lo que salió al primer intento. */
  const finishStep = (index: number) => {
    clearRun(unit.id);
    const graded = firstTry.current.filter((r) => r.outcome !== 'skip');
    const score = graded.length ? graded.filter((r) => r.outcome === 'good').length / graded.length : 1;
    const passed = score >= STEP_PASS;
    completeStep(unit.id, index, steps.length - 1, firstTry.current, passed);
    if (passed) return advance(index, score);
    setNotice(undefined);
    setRunning(null);
    setResult({ index, score, passed });
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
      ? `✓ Dominaste «${unit.title}» y se habilitó la prueba de nivel ${unit.level} (en Camino → Pruebas de nivel).${nxt ? ` Seguimos con «${nxt.title}».` : ''}`
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
          initial={running.initial}
          requeue
          timed={step.id === 'fluency'}
          onItem={(r, first) => {
            if (first) firstTry.current.push(r);
          }}
          onProgress={(queue, pos) => saveRun(unit.id, { stepIndex: running.index, queue: toSaved(queue), pos, firstTry: firstTry.current })}
          onDone={() => finishStep(running.index)}
        />
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="row between">
        <p className={`eyebrow axis-tag ${axisClass(unit)}`}>
          {themeOf(unit).title} · {unit.axis}
        </p>
        <button className="link" onClick={onExit}>
          Volver
        </button>
      </div>
      <h1>{unit.title}</h1>
      {(() => {
        const p = unitPercent(s, unit.id);
        return (
          <div className="unit-progress">
            <div className="mini-bar">
              <div style={{ width: `${Math.round(p * 100)}%` }} />
            </div>
            <p className="small">{p >= 1 ? '✓ Unidad completada' : `${Math.round(p * 100)}% de la unidad`}</p>
          </div>
        );
      })()}
      {notice && !result && <p className="notice">{notice}</p>}
      {saved && saved.pos < saved.queue.length && (
        <button className="primary" onClick={resumeSaved}>
          ▶ Seguí donde quedaste: «{steps[saved.stepIndex]?.title}», pregunta {saved.pos + 1} de {saved.queue.length}
        </button>
      )}

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

      {done > 0 && done < steps.length && !showExplain && !(saved && saved.stepIndex === done) && (
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
