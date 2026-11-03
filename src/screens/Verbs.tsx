import { useRef, useState } from 'react';
import { ExerciseRunner, type RunnerItem } from '../components/ExerciseRunner';
import { completeVerbStage, STEP_PASS, VERB_UNIT, type ItemResult } from '../lib/actions';
import { say } from '../lib/speech';
import { getState, useAppState } from '../lib/store';
import { ingOf, third } from '../gen/english';
import { isIrregular, stageItems, VSTAGES, WORKSHOP, workshopVerb } from '../gen/verbs';
import type { Route } from '../App';

const STAGES = VSTAGES.length;

/** Un verbo se abre cuando dominaste el anterior: de los más frecuentes a los menos. */
export function verbOpen(index: number, verbs: Record<string, number>) {
  return index === 0 || (verbs[WORKSHOP[index - 1].id] ?? 0) >= STAGES;
}

export function nextVerb(verbs: Record<string, number>) {
  return WORKSHOP.find((v, i) => verbOpen(i, verbs) && (verbs[v.id] ?? 0) < STAGES);
}

export function VerbWorkshop({ go }: { go: (r: Route) => void }) {
  const s = useAppState();
  const done = WORKSHOP.filter((v) => (s.verbs[v.id] ?? 0) >= STAGES).length;
  const nxt = nextVerb(s.verbs);
  return (
    <div className="screen">
      <div className="row between">
        <h1>Taller de verbos</h1>
        <button className="link" onClick={() => go({ name: 'path' })}>
          Volver
        </button>
      </div>
      <p className="small">
        {WORKSHOP.length} verbos, de los más usados a los menos. Cada uno en 4 etapas: formas → conjugar → completar oraciones en todos los tiempos → crear tus
        propias oraciones.
      </p>
      <div className="bar">
        <div className="bar-fill" style={{ width: `${(done / WORKSHOP.length) * 100}%` }} />
      </div>
      <p className="small">
        {done} de {WORKSHOP.length} verbos dominados
      </p>
      {nxt && (
        <button className="primary" onClick={() => go({ name: 'verb', verbId: nxt.id })}>
          Seguir con «{nxt.base}»
        </button>
      )}
      <div className="verb-list">
        {WORKSHOP.map((v, i) => {
          const st = s.verbs[v.id] ?? 0;
          const open = verbOpen(i, s.verbs);
          return (
            <button key={v.id} className={`verb-row ${st >= STAGES ? 'done' : open ? 'open' : 'locked'}`} disabled={!open} onClick={() => go({ name: 'verb', verbId: v.id })}>
              <span className="verb-base">
                {v.base}
                {isIrregular(v) && <span className="tag">irregular</span>}
              </span>
              <span className="unit-status">{v.es}</span>
              <span className="dots">
                {VSTAGES.map((_, k) => (
                  <span key={k} className={k < st ? 'dot on' : 'dot'} />
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function VerbLesson({ verbId, banner, onExit, onNext }: { verbId: string; banner?: string; onExit: () => void; onNext: (verbId: string, banner: string) => void }) {
  const v = workshopVerb(verbId)!;
  const s = useAppState();
  const done = s.verbs[verbId] ?? 0;
  const [running, setRunning] = useState<{ index: number; items: RunnerItem[] } | null>(null);
  const [notice, setNotice] = useState<string | undefined>(banner);
  const [failed, setFailed] = useState<number | null>(null);
  const firstTry = useRef<ItemResult[]>([]);
  const accent = s.settings.accent;

  const start = (index: number) => {
    firstTry.current = [];
    setFailed(null);
    const stage = VSTAGES[index];
    setRunning({ index, items: stageItems(v, stage.id).map((exercise) => ({ key: `v:${v.id}@${stage.id}`, unit: VERB_UNIT, exercise })) });
  };

  if (running) {
    const stage = VSTAGES[running.index];
    return (
      <div className="screen">
        <div className="row between">
          <p className="eyebrow">
            {v.base} · etapa {running.index + 1} de {STAGES}: {stage.title}
          </p>
          <button className="link" onClick={onExit}>
            Volver
          </button>
        </div>
        {notice && <p className="notice">{notice}</p>}
        <ExerciseRunner
          key={`${running.index}-${notice ?? ''}`}
          items={running.items}
          requeue
          onItem={(r, first) => {
            if (first) firstTry.current.push(r);
          }}
          onDone={() => {
            const graded = firstTry.current.filter((r) => r.outcome !== 'skip');
            const score = graded.length ? graded.filter((r) => r.outcome === 'good').length / graded.length : 1;
            const passed = score >= STEP_PASS;
            completeVerbStage(v.id, running.index, firstTry.current, passed);
            if (!passed) {
              setRunning(null);
              setNotice(undefined);
              setFailed(score);
              return;
            }
            if (running.index < STAGES - 1) {
              setNotice(`✓ «${stage.title}» superada (${Math.round(score * 100)}%). Seguimos con «${VSTAGES[running.index + 1].title}».`);
              start(running.index + 1);
              return;
            }
            const nxt = nextVerb(getState().verbs);
            if (nxt) onNext(nxt.id, `✓ Dominaste «${v.base}». Seguimos con «${nxt.base}».`);
            else {
              setRunning(null);
              setNotice('✓ ¡Terminaste todos los verbos del taller!');
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="row between">
        <p className="eyebrow">Taller de verbos</p>
        <button className="link" onClick={onExit}>
          Volver
        </button>
      </div>
      {notice && <p className="notice">{notice}</p>}
      <div className="row between">
        <h1>{v.base}</h1>
        <button className="icon" onClick={() => say(`${v.base}, ${v.past}, ${v.pp}`, { accent })} aria-label="Escuchar">
          ▶
        </button>
      </div>
      <p className="meaning">{v.es}</p>
      <table className="forms">
        <tbody>
          <tr>
            <th>Base</th>
            <td>{v.base}</td>
          </tr>
          <tr>
            <th>he / she / it</th>
            <td>{third(v.base)}</td>
          </tr>
          <tr>
            <th>Pasado</th>
            <td>{v.past}</td>
          </tr>
          <tr>
            <th>Participio</th>
            <td>{v.pp}</td>
          </tr>
          <tr>
            <th>-ing</th>
            <td>{ingOf(v)}</td>
          </tr>
        </tbody>
      </table>
      <p className="small">
        {isIrregular(v)
          ? 'Es irregular: el pasado y el participio no terminan en -ed, hay que aprenderlos de memoria.'
          : 'Es regular: el pasado y el participio terminan en -ed.'}{' '}
        Ejemplo: «{v.comps[0].en}» = {v.comps[0].es}.
      </p>
      {failed !== null && (
        <div className="feedback bad">
          <p className="verdict">Todavía no: {Math.round(failed * 100)}% al primer intento</p>
          <p>Necesitás {Math.round(STEP_PASS * 100)}%. Repetila: las preguntas van a ser otras.</p>
        </div>
      )}
      {done < STAGES && (
        <button className="primary" onClick={() => start(done)}>
          {failed !== null ? 'Repetir' : done === 0 ? 'Empezar' : 'Seguir'}: {VSTAGES[done].title}
        </button>
      )}
      <div className="ladder">
        {VSTAGES.map((st, i) => {
          const state = i < done ? 'done' : i === done ? 'current' : 'locked';
          return (
            <button key={st.id} className={`rung ${state}`} disabled={state === 'locked'} onClick={() => start(i)}>
              <span className="rung-num">{state === 'done' ? '✓' : i + 1}</span>
              <span>
                <span className="unit-title">{st.title}</span>
                <span className="unit-status">{st.desc}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
