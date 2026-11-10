import { useRef, useState } from 'react';
import { BackButton } from '../components/BackButton';
import { ExerciseRunner, type RunnerItem } from '../components/ExerciseRunner';
import { BUILD_TOPICS } from '../content/build';
import type { Level } from '../content/types';
import { buildSession, buildStats, recordBuild } from '../lib/build';
import { useBack } from '../lib/nav';
import { userLevel } from '../lib/progress';
import { getState, useAppState } from '../lib/store';

/** «Armá la frase»: palabras clave + tiempo verbal → la oración completa (como en clase). */
export function BuildPractice({ onExit }: { onExit: () => void }) {
  const s = useAppState();
  const level: Level = userLevel(s) ?? 'B2';
  const [run, setRun] = useState<{ items: RunnerItem[]; title: string } | null>(null);
  const [score, setScore] = useState<{ good: number; total: number } | null>(null);
  const good = useRef({ n: 0, total: 0 });
  useBack(!!run, () => setRun(null), 2);

  const start = (topic?: string, title = 'Mezcla de tu nivel') => {
    setScore(null);
    good.current = { n: 0, total: 0 };
    setRun({ items: buildSession(getState(), { topic, level, n: 10 }), title });
  };

  if (run)
    return (
      <div className="screen">
        <div className="top-bar">
          <BackButton onClick={() => setRun(null)} />
          <p className="eyebrow">Armá la frase · {run.title}</p>
        </div>
        <ExerciseRunner
          items={run.items}
          requeue
          onItem={(r, first) => {
            if (!first || r.outcome === 'skip') return;
            const ok = r.outcome === 'good' || r.outcome === 'hard';
            recordBuild(r.key, ok);
            good.current.total++;
            if (ok) good.current.n++;
          }}
          onDone={() => {
            setScore({ good: good.current.n, total: good.current.total });
            setRun(null);
          }}
        />
      </div>
    );

  const all = buildStats(s);
  const missed = s.build?.missed.length ?? 0;
  return (
    <div className="screen writing">
      <div className="top-bar">
        <BackButton onClick={onExit} />
        <p className="eyebrow">Armá la frase</p>
      </div>
      <h1>🧩 Armá la frase</h1>
      <p className="small">
        Te doy las palabras clave en orden y el tiempo verbal; vos armás la oración entera (escribiendo o con el 🎤). Lo que te cuesta vuelve primero en la
        próxima tanda.
      </p>
      {score && (
        <p className="notice">
          Tanda terminada: {score.good} de {score.total} bien. {score.good < score.total ? 'Las que fallaste vuelven en la próxima.' : '¡Impecable!'}
        </p>
      )}
      <button className="primary" onClick={() => start()}>
        ▶ 10 frases de tu nivel ({level})
      </button>
      <p className="small center">
        {all.done} de {all.total} frases hechas{missed ? ` · ${missed} para repasar` : ''}
      </p>
      <div className="card">
        <p className="card-title">Por tema</p>
        {BUILD_TOPICS.map((t) => {
          const st = buildStats(s, t.id);
          return (
            <button key={t.id} className="w-row" onClick={() => start(t.id, t.title)}>
              <span className="w-mark">{st.done === st.total ? '✅' : `${st.done}/${st.total}`}</span>
              <span className="w-text">
                <b>{t.title}</b>
                <span className="small">{t.desc}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
