import { useRef, useState } from 'react';
import { ExerciseRunner, type RunnerItem, type RunnerQueue } from '../components/ExerciseRunner';
import { themeOf } from '../content/themes';
import { callsForUnit } from '../content/calls';
import { BackButton } from '../components/BackButton';
import { useBack } from '../lib/nav';
import { sfxFinish } from '../lib/sfx';
import { normalize } from '../lib/answer';
import { Explanation, ExplanationSheet, axisClass } from '../components/Explanation';
import { unitById } from '../content/curriculum';
import { completeStep, readExplanation, recordReview, STEP_PASS, stepScore, type ItemResult } from '../lib/actions';
import { addMissed, missedItems, removeMissed } from '../lib/missed';
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
  /** Abrir una llamada con Oliver. */
  onCall: (callId: string) => void;
}

const toSaved = (q: RunnerQueue): SavedRun['queue'] => q.map(({ item, first }) => ({ key: item.key, exercise: item.exercise, first }));

export function Lesson({ unitId, banner, resume, onExit, onNextUnit, onCall }: Props) {
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
  // index -1 = repaso de lo que te costó (ids = ejercicio anotado de cada ítem).
  const [running, setRunning] = useState<{ index: number; items: RunnerItem[]; initial?: { queue: RunnerQueue; pos: number }; ids?: string[] } | null>(() => {
    const r = getState().resume[unitId];
    if (!resume || !r || r.pos >= r.queue.length) return null;
    return fromSaved(r);
  });
  const [result, setResult] = useState<{ index: number; score: number; passed: boolean } | null>(null);
  const [notice, setNotice] = useState<string | undefined>(banner);
  const [showExplain, setShowExplain] = useState(done === 0);
  const [sheet, setSheet] = useState(false);
  const startedAt = useRef(Date.now());
  const [summary, setSummary] = useState<{ index: number; score: number; passed: boolean; good: number; total: number; secs: number; words: number; best: number } | null>(null);
  const firstTry = useRef<ItemResult[]>(resume ? (getState().resume[unitId]?.firstTry ?? []) : []);


  const start = (index: number) => {
    firstTry.current = [];
    setResult(null);
    const items = stepItems(unit, steps[index].id);
    startedAt.current = Date.now();
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
    const score = stepScore(firstTry.current);
    const passed = score >= STEP_PASS;
    completeStep(unit.id, index, steps.length - 1, firstTry.current, passed);
    // Resumen del escalón: aciertos, tiempo, palabras usadas y mejor racha.
    let best = 0;
    let run = 0;
    const ok = (r: ItemResult) => r.outcome === 'good' || (r.outcome === 'hard' && !r.slow);
    for (const r of graded) {
      run = ok(r) ? run + 1 : 0;
      best = Math.max(best, run);
    }
    const words = new Set(graded.filter((r) => r.outcome !== 'again').flatMap((r) => normalize(r.correct).split(' ').filter(Boolean)));
    const secs = graded.reduce((a, r) => a + (r.ms ?? 0), 0) / 1000 || (Date.now() - startedAt.current) / 1000;
    if (passed) sfxFinish();
    setNotice(undefined);
    setRunning(null);
    setSummary({ index, score, passed, good: graded.filter(ok).length, total: graded.length, secs, words: words.size, best });
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

  const missed = s.missed?.[unitId] ?? [];
  const startMissed = () => {
    const m = missedItems(unit);
    if (!m.items.length) return;
    setResult(null);
    setRunning({ index: -1, items: m.items, ids: m.ids });
  };

  /** Salir del escalón al menú de la unidad (queda guardado para retomar). */
  const leaveRun = () => {
    setRunning(null);
    setNotice(undefined);
    setSheet(false);
  };
  const closeSummary = () => {
    const sm = summary;
    setSummary(null);
    if (sm && !sm.passed) setResult({ index: sm.index, score: sm.score, passed: false });
  };
  // Botón «atrás» del celular: panel → escalón → menú de la unidad → pantalla anterior.
  useBack(sheet, () => setSheet(false), 5);
  useBack(!!running && !sheet, leaveRun, 2);
  useBack(!!summary, closeSummary, 2);

  if (summary) {
    const mm = Math.floor(summary.secs / 60);
    const ss = Math.round(summary.secs % 60);
    return (
      <div className="screen summary">
        <p className="summary-emoji" aria-hidden="true">{summary.passed ? '🎉' : '💪'}</p>
        <h1 className="center">{summary.passed ? `¡Escalón «${steps[summary.index].title}» superado!` : 'Casi: repetilo y sale'}</h1>
        <p className="center small">{unit.title}</p>
        <div className="summary-stats">
          <div className="stat">
            <span className="stat-num">{Math.round(summary.score * 100)}%</span>
            <span className="stat-label">bien</span>
          </div>
          <div className="stat">
            <span className="stat-num">{summary.words}</span>
            <span className="stat-label">palabras usadas</span>
          </div>
          <div className="stat">
            <span className="stat-num">
              {mm}:{String(ss).padStart(2, '0')}
            </span>
            <span className="stat-label">tiempo</span>
          </div>
          <div className="stat">
            <span className="stat-num">🔥 {summary.best}</span>
            <span className="stat-label">mejor racha</span>
          </div>
        </div>
        <p className="center">
          {summary.good} de {summary.total} bien (con la pista también cuenta).{' '}
          {summary.passed ? '' : `Necesitás ${Math.round(STEP_PASS * 100)}%; las oraciones van a ser otras.`}
        </p>
        <button
          className="primary"
          onClick={() => {
            const sm = summary;
            setSummary(null);
            if (sm.passed) advance(sm.index, sm.score);
            else setResult({ index: sm.index, score: sm.score, passed: false });
          }}
        >
          Continuar
        </button>
      </div>
    );
  }

  if (running) {
    const review = running.index < 0;
    const step = review ? { title: 'Lo que te costó' } : steps[running.index];
    return (
      <div className="screen">
        <div className="top-bar">
          <BackButton onClick={leaveRun} label="Volver al menú de la unidad" />
          <p className="eyebrow">
            {review ? `${unit.title} · repaso: lo que te costó, con oraciones nuevas` : `${unit.title} · escalón ${running.index + 1} de ${steps.length}: ${step.title}`}
          </p>
          <button className="link" onClick={() => setSheet(true)}>
            📖
          </button>
        </div>
        {sheet && <ExplanationSheet unit={unit} onClose={() => setSheet(false)} />}
        {notice && <p className="notice">{notice}</p>}
        <ExerciseRunner
          key={`${running.index}-${running.items.length}-${notice ?? ''}`}
          items={running.items}
          initial={running.initial}
          requeue
          timed={!review && steps[running.index].id === 'fluency'}
          onItem={(r, first) => {
            if (!first) return;
            const i = running.items.findIndex((x) => x.key === r.key && x.exercise.prompt === r.prompt);
            if (review) {
              // Repaso: si ahora sale (con o sin pista), se saca de la lista; si no, queda para la próxima.
              recordReview(r);
              if (r.outcome !== 'again' && r.outcome !== 'skip' && i >= 0 && running.ids?.[i]) removeMissed(unit.id, running.ids[i]);
              return;
            }
            firstTry.current.push(r);
            // Lo que sigue mal después de la pista queda anotado para repasarlo con otra oración.
            if (r.outcome === 'again' && i >= 0) addMissed(unit.id, r.key, running.items[i].exercise);
          }}
          onProgress={(queue, pos) => {
            if (!review) saveRun(unit.id, { stepIndex: running.index, queue: toSaved(queue), pos, firstTry: firstTry.current });
          }}
          onDone={() => {
            if (!review) return finishStep(running.index);
            const left = (getState().missed?.[unit.id] ?? []).length;
            setRunning(null);
            setNotice(left ? `Repaso hecho. Te quedan ${left} para la próxima, con oraciones distintas.` : '✓ Repaso hecho: ya te salió todo lo que te había costado.');
          }}
        />
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="top-bar">
        <BackButton onClick={onExit} />
        <p className={`eyebrow axis-tag ${axisClass(unit)}`}>
          {themeOf(unit).title} · {unit.axis}
        </p>
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
            {result.passed ? `¡Escalón «${steps[result.index].title}» superado!` : `Todavía no: ${Math.round(result.score * 100)}% bien`}
          </p>
          <p>
            {result.passed
              ? result.index === steps.length - 1
                ? 'Dominaste la unidad. Va a volver en tus repasos para que no se olvide.'
                : `${Math.round(result.score * 100)}% bien${steps[result.index].id === 'fluency' ? ' y a tiempo' : ''}. Se abre el siguiente escalón.`
              : `Necesitás ${Math.round(STEP_PASS * 100)}%${steps[result.index].id === 'fluency' ? ', respondiendo a tiempo' : ''}. Repetilo: las oraciones van a ser otras.`}
          </p>
        </div>
      )}

      {missed.length > 0 && !(done > 0 && done < steps.length && result && !result.passed) && (
        <div className="card">
          <p className="card-title">🔁 Lo que te costó ({missed.length})</p>
          <p className="small">Los ejercicios que te salieron mal, con el mismo formato pero otra oración.</p>
          <button className="secondary" onClick={startMissed}>
            Repasarlos
          </button>
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

      <h2>📞 Llamadas con Oliver</h2>
      <p className="small">Charlas cortas con un australiano usando lo de esta unidad. Mejor después de «Construir», pero podés llamar cuando quieras.</p>
      {callsForUnit(unit.id).map((c) => (
        <button key={c.id} className="call-card" onClick={() => onCall(c.id)}>
          <span className="face">
            <img src={`${import.meta.env.BASE_URL}call/character.svg`} alt="" />
          </span>
          <span className="grow">
            <span className="unit-title">{c.title}</span>
            <span className="unit-status">
              {c.scene}
              {s.calls[c.id] ? ` · ✓ ${Math.round(s.calls[c.id].score * 100)}% bien` : ''}
            </span>
          </span>
          <span aria-hidden="true">📞</span>
        </button>
      ))}

    </div>
  );
}
